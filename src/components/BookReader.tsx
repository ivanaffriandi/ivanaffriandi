"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { addComment, getApprovedComments, CommentItem } from "@/lib/comments";

interface PostType {
  id: string;
  title: string;
  content: string;
  published: string;
  url?: string;
  labels?: string[];
}

export default function BookReader({ post, initialComments = [] }: { post: PostType, initialComments?: any[] }) {
  const [fontStyle, setFontStyle] = useState<"sans" | "serif" | "mono">("sans");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mode, setMode] = useState<"read" | "listen">("read");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState<string>("");
  const [isCommenting, setIsCommenting] = useState<boolean>(false);
  const [lightboxImg, setLightboxImg] = useState<{ src: string; index: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Identity and Comment states
  const [tempName, setTempName] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("ivan_comment_author_name") || "";
      const savedEmail = localStorage.getItem("ivan_comment_author_email") || "";
      setTempName(savedName);
      setTempEmail(savedEmail);
    }
  }, [mounted]);

  // Smart vibe tags extraction dynamically from title and body content
  const computedTags = useMemo(() => {
    if (post.labels && post.labels.length > 0) {
      return post.labels;
    }
    
    const fullText = `${post.title} ${post.content}`.toLowerCase();
    const cleanText = fullText.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ");
    const matchedTags: string[] = [];
    
    // Custom dictionary matching vibes in both Indonesian and English
    const vibes = [
      { tag: "Reflective", keys: ["think", "thought", "ponder", "reflect", "maybe", "why", "realize", "mind", "mengingat", "pikir", "renung", "rasa", "feeling"] },
      { tag: "Calm", keys: ["quiet", "peace", "calm", "slow", "serene", "nature", "morning", "night", "silence", "damai", "tenang", "sunyi", "sore", "pagi", "hening"] },
      { tag: "Growth", keys: ["learn", "grow", "change", "improve", "better", "build", "future", "goals", "focus", "belajar", "tumbuh", "berubah", "maju", "proses"] },
      { tag: "Creative", keys: ["create", "design", "art", "code", "write", "music", "draw", "photo", "canvas", "tulis", "buat", "karya", "seni", "desain", "ide"] },
      { tag: "Nostalgic", keys: ["remember", "past", "old", "childhood", "memories", "back", "time", "dulu", "ingat", "memori", "lampau", "kenangan", "kembali"] },
      { tag: "Inspired", keys: ["inspire", "motivation", "dream", "hope", "drive", "passion", "spirit", "motive", "semangat", "mimpi", "harapan", "inspirasi"] },
      { tag: "Deep", keys: ["life", "exist", "world", "death", "soul", "heart", "deep", "truth", "human", "hidup", "jiwa", "hati", "dalam", "kebenaran", "arti"] },
      { tag: "Raw", keys: ["honest", "sad", "hurt", "mess", "chaos", "hard", "cry", "fail", "lost", "jujur", "sedih", "kacau", "gagal", "kehilangan", "lelah"] },
      { tag: "Minimal", keys: ["simple", "less", "clean", "minimal", "space", "quiet", "basic", "sederhana", "bersih", "sedikit", "fokus"] },
      { tag: "Aesthetic", keys: ["beauty", "beautiful", "style", "nice", "color", "visual", "taste", "indah", "cantik", "warna", "selera", "seni"] }
    ];

    for (const vibe of vibes) {
      if (vibe.keys.some(key => cleanText.includes(key))) {
        matchedTags.push(vibe.tag);
      }
    }

    const fallbackList = ["Personal", "Calm", "Motivation", "Thoughts", "Life"];
    const finalTags = Array.from(new Set(matchedTags));
    
    for (const fallback of fallbackList) {
      if (finalTags.length >= 3) break;
      if (!finalTags.includes(fallback)) {
        finalTags.push(fallback);
      }
    }

    return finalTags.slice(0, 3);
  }, [post.title, post.content, post.labels]);

  const commentsSectionRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);

  // Auto-close comment mode when clicking outside the floating island dock
  useEffect(() => {
    if (!isCommenting) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dockRef.current && !dockRef.current.contains(event.target as Node)) {
        setIsCommenting(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isCommenting]);

  const [scrollProgress, setScrollProgress] = useState(0);

  // Monitor Scroll Progress
  useEffect(() => {
    if (typeof window === "undefined" || !mounted) return;

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) {
        setScrollProgress(0);
        return;
      }
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted]);

  // Fetch approved comments for this specific post
  useEffect(() => {
    const loadComments = async () => {
      try {
        const approved = await getApprovedComments(post.id);
        setComments(approved);
      } catch (err) {
        console.error("Failed to load comments:", err);
      }
    };
    loadComments();
  }, [post.id]);

  // Extract images from post HTML and strip them from prose content
  const [cleanContent, setCleanContent] = useState(post.content);
  const [extractedImages, setExtractedImages] = useState<string[]>([]);

  // Calculate dynamic reading time based on total words (approx 200 words per minute)
  const readingTime = useMemo(() => {
    const textWithoutTags = post.content.replace(/<[^>]*>/g, " ");
    const words = textWithoutTags.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [post.content]);

  // Randomised-but-stable EXIF-style metadata per image
  const getPhotoMeta = (idx: number) => {
    const shutters = ["1/60s", "1/120s", "1/250s", "1/500s", "1/1000s"];
    const apertures = ["f/1.8", "f/2.0", "f/2.2", "f/2.4"];
    const isos = ["ISO 50", "ISO 100", "ISO 200", "ISO 400"];
    return {
      model: "iPhone 11",
      shutter: shutters[idx % shutters.length],
      aperture: apertures[(idx + 1) % apertures.length],
      iso: isos[(idx + 2) % isos.length],
    };
  };

  // Parse raw text for speech synthesis
  const rawTextRef = useRef<string>("");

  useEffect(() => {
    // Strip HTML tags for clean text to speech
    if (typeof window !== "undefined") {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = post.content;
      rawTextRef.current = tempDiv.textContent || tempDiv.innerText || "";
    }
  }, [post.content]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const applyTheme = (e: MediaQueryListEvent | MediaQueryList) => {
        setTheme(e.matches ? "dark" : "light");
      };
      
      applyTheme(mediaQuery);
      
      // Use standard addEventListener for media query compatibility
      mediaQuery.addEventListener("change", applyTheme);
      return () => mediaQuery.removeEventListener("change", applyTheme);
    }
  }, []);

  // Toggle HTML Root Classes for High-Contrast Global Header/Footer Colors
  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      root.classList.remove("book-mode-active", "book-theme-paper", "book-theme-light", "book-theme-dark");
      root.classList.add("book-mode-active");
      root.classList.add(`book-theme-${theme}`);
    }
    return () => {
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        root.classList.remove("book-mode-active", "book-theme-paper", "book-theme-light", "book-theme-dark");
      }
    };
  }, [theme]);



  // Handle Dynamic Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Client-Side parsing (Hydration Safe & Bulletproof)
  useEffect(() => {
    if (!mounted) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(post.content, "text/html");
    const imgs = Array.from(doc.querySelectorAll("img")).map((img) => img.src).filter(Boolean);
    
    // Remove img tags (and their wrapping <a> if only child) from prose
    doc.querySelectorAll("img").forEach((img) => {
      const parent = img.parentElement;
      if (parent && parent.tagName === "A" && parent.children.length === 1) {
        parent.remove();
      } else {
        img.remove();
      }
    });

    // Also remove empty <p> / <div> left behind
    doc.querySelectorAll("p, div").forEach((el) => {
      if (!el.textContent?.trim() && el.children.length === 0) el.remove();
    });

    setExtractedImages(imgs);
    setCleanContent(doc.body.innerHTML);
  }, [mounted, post.content]);

  // Text-To-Speech Controller
  useEffect(() => {
    if (mode === "listen") {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(rawTextRef.current);
        utterance.onend = () => {
          setIsPlaying(false);
          setMode("read");
        };
        utterance.onerror = () => {
          setIsPlaying(false);
          setMode("read");
        };
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      } else {
        alert("Text-to-speech is not supported in this browser.");
        setMode("read");
      }
    } else {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      }
    }

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [mode]);

  // Handle submitting a comment
  const handleSendComment = () => {
    if (!commentText.trim() || !tempName.trim()) return;

    const finalName = tempName.trim();
    
    // Save name for next time
    if (typeof window !== "undefined") {
      localStorage.setItem("ivan_comment_author_name", finalName);
    }

    submitCommentToDb(finalName);
  };

  const submitCommentToDb = async (name: string) => {
    const text = commentText.trim();
    if (!text) return;

    // Create optimistic comment for instant UI feedback
    const optimisticId = `opt-${Date.now()}`;
    const optimisticComment: CommentItem = {
      id: optimisticId,
      postId: post.id,
      postTitle: post.title,
      postPublished: post.published,
      published: new Date().toISOString(),
      content: text,
      approved: false,
      author: {
        displayName: name,
        image: { url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=E2DDD5&color=333` }
      }
    };

    // Show instantly, close dock, clear input
    setComments((prev) => [optimisticComment, ...prev]);
    setCommentText("");
    setIsCommenting(false);

    // Scroll to comments section
    setTimeout(() => {
      if (commentsSectionRef.current) {
        commentsSectionRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);

    try {
      // Save to Firebase via API route (server-side, no auth issues)
      const actualComment = await addComment(post.id, post.title, post.published, name, text);
      // Swap optimistic entry with real DB entry
      setComments((prev) => prev.map(c => c.id === optimisticId ? actualComment : c));
    } catch (err) {
      console.error("Error adding comment:", err);
      // On error, remove the optimistic entry to avoid ghost comments
      setComments((prev) => prev.filter(c => c.id !== optimisticId));
    }
  };


  // Rotate font style: sans -> serif -> mono -> sans
  const cycleFontStyle = () => {
    setFontStyle((prev) => {
      if (prev === "sans") return "serif";
      if (prev === "serif") return "mono";
      return "sans";
    });
  };

  // Helper to securely parse comment avatar URLs
  const getAvatarUrl = (url?: string) => {
    if (!url || url.includes("blank.gif")) return "https://ui-avatars.com/api/?name=Ivan+A&background=random";
    if (url.startsWith("http") || url.startsWith("/")) return url;
    return `https:${url}`;
  };

  // Compute theme colors dynamically
  const getThemeStyles = () => {
    if (theme === "light") {
      return {
        bg: "#ffffff",
        text: "#111111",
        textSecondary: "#666666",
        border: "rgba(0, 0, 0, 0.1)"
      };
    }
    // Dark Theme
    return {
      bg: "#151413",
      text: "#e4e1db",
      textSecondary: "#9e9a93",
      border: "rgba(228, 225, 219, 0.15)"
    };
  };

  const colors = getThemeStyles();

  return (
    <div 
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        minHeight: "100vh",
        transition: "background-color 0.4s ease, color 0.4s ease",
        padding: "7.5rem 4vw 12rem 4vw",
        margin: "-6rem -4vw -6rem -4vw", // Bleeds up and down out of layout container padding
        position: "relative"
      }}
      className="book-reader-container"
    >
      {/* Global CSS for book content media to prevent overflowing and hide footer on post details */}
      <style dangerouslySetInnerHTML={{__html: `
        /* Cinematic Scroll Reveal Styles removed for absolute visual stability */

        .book-prose img, .book-prose iframe, .book-prose video {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 16px;
          margin: 1.5rem 0;
        }
        .book-prose p {
          word-break: break-word;
          overflow-wrap: break-word;
        }
        footer.yunox-single-footer {
          display: none !important;
        }
        .photo-grid-scroll::-webkit-scrollbar { display: none; }
        .photo-grid-scroll { -ms-overflow-style: none; scrollbar-width: none; }

        .book-core-article {
          padding-left: 0;
          padding-right: 0;
        }

        /* Responsive Mobile Overrides for BookReader */
        /* Hide scrollbars globally for custom UI components */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }

        @media (max-width: 768px) {
          .book-reader-container {
            padding: 5.5rem 1.25rem 9rem 1.25rem !important; /* Snugger padding on mobile */
            margin: -6rem -1.25rem -6rem -1.25rem !important; /* Align negative margins */
          }

          .book-core-article {
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
          }
          
          .book-title {
            font-size: 1.9rem !important; /* Sleeker title text on mobile */
            margin-bottom: 0.75rem !important;
            line-height: 1.25 !important;
            letter-spacing: -0.02em !important;
          }
          
          .journal-date {
            font-size: 0.85rem !important;
            margin-bottom: 0.4rem !important;
          }
          
          .book-prose {
            font-size: 16px !important; /* Balanced readability for mobile */
            line-height: 1.65 !important;
          }

          .floating-island-dock:not(.is-commenting) {
            padding: 4px 6px !important; /* Tighten floating dock island paddings */
            gap: 0.35rem !important;
          }

          .floating-island-dock.is-commenting {
            padding: 8px 10px 8px 14px !important; /* Maximum compact iOS padding */
            border-radius: 18px !important;
            width: calc(100vw - 2.5rem) !important;
          }
          
          .floating-island-input {
            width: 210px !important; /* Premium typing space on mobile */
            font-size: 0.75rem !important;
            padding: 0 10px !important;
          }

          .dock-icon-btn {
            width: 28px !important;
            height: 28px !important;
            padding: 0 !important;
          }
        }
      `}} />

      {/* ===== PHOTO LIGHTBOX ===== */}
      {mounted && typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {lightboxImg && (
            <motion.div
              key="book-lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImg(null)}
              style={{
                position: "fixed", inset: 0, zIndex: 9999,
                backgroundColor: "rgba(0,0,0,0.85)",
                backdropFilter: "blur(16px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "1.5rem"
              }}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "4px",
                  padding: "12px 12px 16px 12px",
                  maxWidth: "340px", width: "100%",
                  boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
                  display: "flex", flexDirection: "column", gap: "10px"
                }}
              >
                <img
                  src={lightboxImg.src}
                  alt=""
                  style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: "2px", display: "block" }}
                />
                {/* iPhone-style EXIF row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", color: "#888", display: "flex", gap: "8px" }}>
                    <span>{getPhotoMeta(lightboxImg.index).shutter}</span>
                    <span>{getPhotoMeta(lightboxImg.index).aperture}</span>
                    <span>{getPhotoMeta(lightboxImg.index).iso}</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", fontWeight: "700", color: "#333", letterSpacing: "0.02em" }}>
                    Shot on {getPhotoMeta(lightboxImg.index).model}
                  </span>
                </div>
                <button
                  onClick={() => setLightboxImg(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", position: "absolute", top: "1.5rem", right: "1.5rem", color: "#fff", opacity: 0.7, padding: "4px" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}



      {/* Book Core Content Area */}
      <article className="book-core-article" style={{ maxWidth: "650px", margin: "0 auto" }}>
        
        {/* Elegant Rounded Journal Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>

          {/* ===== COMPACT PHOTO GRID (above date) ===== */}
          {extractedImages.length > 0 && (
            <div
              className="photo-grid-scroll"
              style={{
                display: "flex",
                gap: "6px",
                overflowX: "auto",
                paddingBottom: "4px",
                marginBottom: "1.25rem",
                justifyContent: "flex-start",
                // Full-bleed left/right for edge-to-edge feel
                marginLeft: "-1rem",
                marginRight: "-1rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
              }}
            >
              {extractedImages.map((src, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLightboxImg({ src, index: idx })}
                  style={{
                    flexShrink: 0,
                    // Landscape card-cover: single photo = wider, multiple = compact card
                    width: extractedImages.length === 1 ? "100%" : "200px",
                    height: extractedImages.length === 1 ? "200px" : "120px",
                    borderRadius: "16px",
                    overflow: "hidden",
                    cursor: "pointer",
                    backgroundColor: "rgba(150,150,150,0.08)",
                    border: `1px solid ${colors.border}`,
                    position: "relative",
                    // Force max-width so single image doesn't overflow
                    maxWidth: extractedImages.length === 1 ? "100%" : "200px",
                  }}
                >
                  <img
                    src={src}
                    alt={`Photo ${idx + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  {/* subtle bottom gradient overlay */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 55%)",
                    borderRadius: "16px"
                  }} />
                  {/* photo index badge (if multiple) */}
                  {extractedImages.length > 1 && (
                    <div style={{
                      position: "absolute", bottom: "6px", right: "7px",
                      fontSize: "0.55rem", fontWeight: "700",
                      color: "rgba(255,255,255,0.75)",
                      fontFamily: "var(--font-sans)",
                      letterSpacing: "0.04em"
                    }}>
                      {idx + 1}/{extractedImages.length}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}


          {/* Gold Date Indicator & Reading Time */}
          <div 
            className="journal-date"
            style={{ 
              fontFamily: "var(--font-sans)",
              fontSize: "0.95rem", 
              fontWeight: "600",
              color: "#B47A3E",
              marginBottom: "0.6rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              flexWrap: "wrap"
            }}
          >
              <span>
                {(() => {
                  const parts = post.published.substring(0, 10).split("-");
                  const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
                  return dateObj.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  });
                })()}
              </span>
              <span style={{ opacity: 0.4 }}>•</span>
              <span style={{ fontSize: "0.85rem", opacity: 0.8, fontWeight: "500" }}>
                {readingTime} min read
              </span>
            </div>

          {/* Bold Centered Title */}
          <h1 
            className="book-title"
            style={{ 
              fontFamily: "var(--font-sans)",
              fontWeight: "700",
              fontSize: "clamp(2rem, 7vw, 2.75rem)", 
              lineHeight: "1.2",
              margin: "0 0 1.25rem 0",
              color: colors.text,
              letterSpacing: "-0.03em",
              wordBreak: "break-word",
              overflowWrap: "break-word"
            }}
          >
            {post.title}
          </h1>

          {/* Symmetrical Capsule Tag Pills Row */}
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            gap: "0.5rem", 
            flexWrap: "wrap",
            marginBottom: "1.5rem"
          }}>
            {computedTags.map((label) => (
                <span 
                  key={label} 
                  style={{
                    backgroundColor: theme === "dark" ? "rgba(255,255,255,0.06)" : "#ffffff",
                    border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.12)" : "#E2DDD5"}`,
                    borderRadius: "20px",
                    padding: "4px 12px",
                    fontSize: "0.75rem",
                    fontWeight: "500",
                    color: colors.textSecondary,
                    boxShadow: theme === "dark" ? "none" : "0 2px 6px rgba(0,0,0,0.02)",
                    fontFamily: "var(--font-sans)"
                  }}
                >
                  {label}
                </span>
              ))}
          </div>

        </div>

        {/* Dynamic Book Prose — images stripped, shown in grid above */}
        <div 
          style={{
            fontSize: "17px",
            lineHeight: "1.75",
            letterSpacing: fontStyle === "mono" ? "0" : "-0.01em",
            fontFamily: fontStyle === "serif" ? "var(--font-serif)" : fontStyle === "mono" ? "monospace" : "var(--font-sans)",
            wordBreak: "break-word"
          }}
          className={`book-prose prose-style-${fontStyle}`}
          dangerouslySetInnerHTML={{ __html: cleanContent }}
        />

        {/* ==========================================================================
            ULTRA-MINIMALIST COMMENT SECTION
            ========================================================================== */}
        <div 
          ref={commentsSectionRef}
          style={{
            marginTop: "4.5rem",
            paddingTop: "2.5rem",
            borderTop: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem" }}>
            <h3 style={{ 
              margin: 0, 
              fontFamily: "var(--font-sans)", 
              fontSize: "0.8rem", 
              fontWeight: "700",
              color: colors.text,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              opacity: 0.85,
              textAlign: "center"
            }}>
              Replies ({comments.length})
            </h3>
            <div style={{ width: "24px", height: "1px", backgroundColor: "#B47A3E", marginTop: "8px", opacity: 0.7 }} />
          </div>

          {/* Comments List: Balanced modern typography */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {comments && comments.length > 0 ? (
              comments.map((comment: any) => {
                const displayName = comment.author?.displayName || "Anonymous";
                const handleName = `@${displayName.toLowerCase().replace(/\s+/g, "")}`;
                return (
                  <div 
                    key={comment.id} 
                    style={{ 
                      padding: "1rem 0",
                      borderBottom: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"}`,
                      opacity: comment.approved ? 1 : 0.65
                    }}
                  >
                    {/* Comment Body */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px", marginBottom: "0.2rem" }}>
                        <span style={{ 
                          fontFamily: "var(--font-sans)", 
                          fontWeight: "600", 
                          fontSize: "0.8rem",
                          color: colors.text,
                          letterSpacing: "-0.01em"
                        }}>
                          {displayName}
                        </span>
                        <span style={{ fontSize: "0.6rem", color: colors.textSecondary, opacity: 0.3 }}>·</span>
                        <span style={{ 
                          fontFamily: "var(--font-sans)", 
                          fontSize: "0.7rem", 
                          color: colors.textSecondary,
                          opacity: 0.4
                        }}>
                          {new Date(comment.published).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                        {!comment.approved && (
                          <span style={{
                            fontSize: "0.6rem",
                            fontWeight: "600",
                            backgroundColor: "rgba(180, 122, 62, 0.08)",
                            color: "#B47A3E",
                            padding: "1px 5px",
                            borderRadius: "4px",
                            fontFamily: "var(--font-sans)",
                            letterSpacing: "0.02em"
                          }}>
                            Pending approval
                          </span>
                        )}
                      </div>
                      <div 
                        style={{ 
                          fontSize: "0.82rem", 
                          lineHeight: "1.5",
                          color: colors.textSecondary,
                          fontFamily: "var(--font-sans)",
                          margin: 0,
                          letterSpacing: "-0.005em",
                          whiteSpace: "pre-line",
                          opacity: 0.9
                        }}
                        dangerouslySetInnerHTML={{ __html: comment.content }}
                      />

                      {comment.reply && (
                        <div style={{
                          display: "flex",
                          gap: "0.6rem",
                          marginTop: "0.6rem",
                          padding: "0.6rem 0.8rem",
                          backgroundColor: theme === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
                          borderRadius: "10px",
                          borderLeft: "2.5px solid #B47A3E"
                        }}>
                          <div style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            backgroundImage: "url(/profile.jpg), url(/profile.png)",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)"}`,
                            flexShrink: 0
                          }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "0.1rem" }}>
                              <span style={{ fontFamily: "var(--font-sans)", fontWeight: "600", fontSize: "0.75rem", color: colors.text }}>Ivan</span>
                              <span style={{ fontSize: "0.55rem", fontWeight: "800", backgroundColor: "rgba(180, 122, 62, 0.1)", color: "#B47A3E", padding: "1px 4px", borderRadius: "4px" }}>Writer</span>
                            </div>
                            <p style={{ margin: 0, fontSize: "0.76rem", lineHeight: "1.45", color: colors.textSecondary, opacity: 0.9 }}>
                              {comment.reply}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ 
                fontFamily: "var(--font-sans)", 
                fontSize: "0.78rem", 
                color: colors.textSecondary,
                margin: 0,
                textAlign: "center",
                padding: "2.5rem 0",
                opacity: 0.35,
                letterSpacing: "-0.01em"
              }}>
                No replies yet. Send yours from the bar below.
              </div>
            )}
          </div>
        </div>

      </article>

      {/* Centering Wrapper Div inside React Portal to completely bypass page transforms and stay fixed at all times */}
      {mounted && typeof window !== "undefined" && createPortal(
        <div 
          style={{
            position: "fixed",
            bottom: "2.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            pointerEvents: "none"
          }}
        >
          {/* Apple Dynamic Island Snappy Scale/Squish Bubble Wrapper */}
          <motion.div
            animate={isCommenting ? "commenting" : "normal"}
            variants={{
              normal: {
                scale: [1, 0.82, 1.04, 1]
              },
              commenting: {
                scale: [1, 0.8201, 1.0401, 1]
              }
            }}
            transition={{
              duration: 0.45,
              ease: [0.25, 1, 0.5, 1]
            }}
            style={{
              pointerEvents: "auto"
            }}
          >
            {/* Kindle-Style Floating Dock with Layout Width/Height morphing */}
            <motion.div 
              ref={dockRef}
              layout
              className={`floating-island-dock ${isCommenting ? 'is-commenting' : ''}`}
              style={{
                display: "flex",
                alignItems: isCommenting ? "flex-end" : "center",
                gap: isCommenting ? "10px" : "0.6rem",
                backgroundColor: theme === "dark" 
                  ? "rgba(18, 18, 18, 0.85)" 
                  : "rgba(255, 255, 255, 0.88)",
                backdropFilter: "blur(24px) saturate(190%)",
                WebkitBackdropFilter: "blur(24px) saturate(190%)",
                border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid rgba(0, 0, 0, 0.08)",
                borderRadius: isCommenting ? "18px" : "32px",
                padding: isCommenting ? "8px 10px 8px 14px" : "6px 10px",
                color: theme === "dark" ? "#ffffff" : "#111111",
                boxShadow: theme === "dark" 
                  ? "0 18px 48px -8px rgba(0, 0, 0, 0.6), 0 8px 24px -4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)" 
                  : "0 16px 36px -4px rgba(0, 0, 0, 0.12), 0 6px 16px -2px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                width: isCommenting ? "400px" : "max-content",
                maxWidth: "92vw",
                height: isCommenting ? "auto" : "46px",
                boxSizing: "border-box",
                overflow: "hidden"
              }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 20,
                mass: 0.5
              }}
            >
          <AnimatePresence mode="popLayout" initial={false}>
            {isCommenting ? (
              <motion.div 
                key="commenting"
                layout
                initial={{ opacity: 0, scale: 0.75, filter: "blur(6px)", x: 15 }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", x: 0 }}
                exit={{ opacity: 0, scale: 0.75, filter: "blur(6px)", x: -15 }}
                transition={{ type: "spring", stiffness: 550, damping: 26 }}
                style={{ display: "flex", alignItems: "flex-end", gap: "10px", flex: 1, minWidth: 0 }}
              >
                {/* Left Side: Staggered Inputs */}
                <motion.div layout style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0px", minWidth: 0 }}>
                  {/* Row 1: Name Field (iOS Subject Line Style) */}
                  <input 
                    type="text"
                    value={tempName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTempName(val);
                      if (typeof window !== "undefined") {
                        localStorage.setItem("ivan_comment_author_name", val);
                      }
                    }}
                    placeholder="Name"
                    style={{
                      height: "19px",
                      lineHeight: "19px",
                      backgroundColor: "transparent",
                      border: "none",
                      outline: "none",
                      color: colors.text,
                      fontSize: "0.92rem",
                      fontWeight: "600",
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "0 2px",
                      fontFamily: "var(--font-sans)"
                    }}
                  />

                  {/* Faint Separator Line */}
                  <motion.div layout style={{ 
                    height: "1px", 
                    backgroundColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
                    margin: "5px 0"
                  }} />

                  {/* Row 2: Message Field (Auto-growing Textarea) */}
                  <motion.div layout style={{ position: "relative", width: "100%", minHeight: "18px" }}>
                    {/* Hidden div to calculate height naturally */}
                    <motion.div 
                      layout
                      style={{ 
                        visibility: "hidden", 
                        whiteSpace: "pre-wrap", 
                        wordBreak: "break-word", 
                        padding: "0 2px", 
                        margin: 0,
                        fontFamily: "var(--font-sans)", 
                        fontSize: "0.90rem", 
                        lineHeight: "18px",
                        minHeight: "18px"
                      }}
                    >
                      {commentText + " "}
                    </motion.div>
                    {/* The actual text area */}
                    <textarea 
                      className="hide-scrollbar"
                      rows={1}
                      value={commentText}
                      maxLength={300}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a reply"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        resize: "none",
                        backgroundColor: "transparent",
                        border: "none",
                        outline: "none",
                        color: colors.text,
                        fontSize: "0.90rem",
                        fontWeight: "400",
                        width: "100%",
                        height: "100%",
                        boxSizing: "border-box",
                        padding: "0 2px",
                        margin: 0,
                        fontFamily: "var(--font-sans)",
                        overflow: "hidden",
                        lineHeight: "18px",
                        WebkitAppearance: "none"
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (tempName.trim() && commentText.trim()) {
                            handleSendComment();
                          }
                        }
                      }}
                      autoFocus
                    />
                  </motion.div>
                </motion.div>

                {/* Right Side: Circular Send Button inside the capsule! */}
                <motion.button 
                  layoutId="pillbar-action-button"
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault(); // Prevent input blur / keyboard close on iOS
                    if (commentText.trim() && tempName.trim()) {
                      handleSendComment();
                    }
                  }}
                  onClick={(e) => {
                    if (commentText.trim() && tempName.trim()) {
                      handleSendComment();
                    }
                  }}
                  disabled={!commentText.trim() || !tempName.trim()}
                  animate={{
                    backgroundColor: (commentText.trim() && tempName.trim()) 
                      ? "#007aff" 
                      : (theme === "dark" ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)"),
                    color: (commentText.trim() && tempName.trim()) 
                      ? "#ffffff" 
                      : (theme === "dark" ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.3)")
                  }}
                  transition={{ duration: 0.15 }}
                  style={{
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    width: "30px", 
                    height: "30px", 
                    boxSizing: "border-box",
                    borderRadius: "50%", 
                    border: "none",
                    cursor: (commentText.trim() && tempName.trim()) ? "pointer" : "default",
                    flexShrink: 0,
                    marginBottom: "1px"
                  }}
                  title="Send reply"
                >
                  {/* Native iOS styled up-pointing arrow! */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "translateY(-1px)" }}>
                    <line x1="12" y1="19" x2="12" y2="5"></line>
                    <polyline points="5 12 12 5 19 12"></polyline>
                  </svg>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                key="normal"
                layout
                initial={{ opacity: 0, scale: 0.75, filter: "blur(6px)", x: -15 }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", x: 0 }}
                exit={{ opacity: 0, scale: 0.75, filter: "blur(6px)", x: 15 }}
                transition={{ type: "spring", stiffness: 550, damping: 26 }}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                {/* 1. Symmetrical Circular Back Button */}
                <Link 
                  href="/" 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    width: "34px", 
                    height: "34px", 
                    boxSizing: "border-box",
                    borderRadius: "50%", 
                    backgroundColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "#ffffff", 
                    color: theme === "dark" ? "#ffffff" : "#111111", 
                    border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: theme === "dark" ? "0 2px 8px rgba(0, 0, 0, 0.3)" : "0 2px 6px rgba(0, 0, 0, 0.06), inset 0 1px 0 #ffffff",
                    transition: "all 0.2s ease",
                    textDecoration: "none",
                    flexShrink: 0
                  }}
                  className="dock-icon-btn"
                  title="Back to Journal"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m15 18-6-6 6-6"/>
                  </svg>
                </Link>

                {/* 2. Read / Listen Capsule */}
                <div 
                  style={{ 
                    display: "flex", 
                    alignItems: "center",
                    height: "34px",
                    boxSizing: "border-box",
                    backgroundColor: theme === "dark" ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.04)", 
                    borderRadius: "17px", 
                    padding: "2px",
                    border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(0, 0, 0, 0.04)",
                    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.06)"
                  }}
                >
                  <button 
                    onClick={() => setMode("read")}
                    style={{
                      height: "30px",
                      lineHeight: "30px",
                      padding: "0 14px",
                      borderRadius: "15px",
                      border: "none",
                      backgroundColor: mode === "read" 
                        ? (theme === "dark" ? "#ffffff" : "#111111") 
                        : "transparent",
                      color: mode === "read" 
                        ? (theme === "dark" ? "#000000" : "#ffffff") 
                        : (theme === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"),
                      boxShadow: mode === "read"
                        ? (theme === "dark" ? "0 2px 8px rgba(0, 0, 0, 0.4)" : "0 2px 8px rgba(0, 0, 0, 0.2)")
                        : "none",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    Read
                  </button>
                  <button 
                    onClick={() => setMode("listen")}
                    style={{
                      height: "30px",
                      lineHeight: "30px",
                      padding: "0 14px",
                      borderRadius: "15px",
                      border: "none",
                      backgroundColor: mode === "listen" 
                        ? (theme === "dark" ? "#ffffff" : "#111111") 
                        : "transparent",
                      color: mode === "listen" 
                        ? (theme === "dark" ? "#000000" : "#ffffff") 
                        : (theme === "dark" ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"),
                      boxShadow: mode === "listen"
                        ? (theme === "dark" ? "0 2px 8px rgba(0, 0, 0, 0.4)" : "0 2px 8px rgba(0, 0, 0, 0.2)")
                        : "none",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem"
                    }}
                  >
                    Listen
                    {isPlaying && (
                      <span className="tts-pulse-indicator" style={{ display: "inline-block", width: "5px", height: "5px", backgroundColor: "#ff3b30", borderRadius: "50%" }}></span>
                    )}
                  </button>
                </div>

                {/* 4. Morphing Comments Anchor Button */}
                <motion.button 
                  layoutId="pillbar-action-button"
                  onClick={() => setIsCommenting(true)}
                  style={{
                    width: "34px",
                    height: "34px",
                    boxSizing: "border-box",
                    borderRadius: "50%",
                    backgroundColor: theme === "dark" ? "rgba(255, 255, 255, 0.08)" : "#ffffff",
                    color: theme === "dark" ? "#ffffff" : "#111111",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)",
                    boxShadow: theme === "dark" ? "0 2px 8px rgba(0, 0, 0, 0.3)" : "0 2px 6px rgba(0, 0, 0, 0.06), inset 0 1px 0 #ffffff"
                  }}
                  className="dock-icon-btn"
                  title="Add a comment"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21a9 9 0 1 0-9-9c0 1.48.36 2.89 1 4.15L3 21l4.85-1c1.26.64 2.67 1 4.15 1z"/>
                  </svg>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Identity Modal removed per clean design rules */}
    </div>
  );
}
