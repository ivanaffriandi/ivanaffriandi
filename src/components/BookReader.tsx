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
  
  // Identity modal states
  const [showIdentityModal, setShowIdentityModal] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempEmail, setTempEmail] = useState("");
  
  const commentsSectionRef = useRef<HTMLDivElement>(null);

  // Fetch comments on mount and support local pending items
  useEffect(() => {
    const loadComments = async () => {
      try {
        const approved = await getApprovedComments(post.id);
        
        // Load local comments to display pending comments immediately for the author
        const stored = typeof window !== "undefined" ? localStorage.getItem("ivan_journal_comments") : null;
        let pendingLocal: CommentItem[] = [];
        if (stored) {
          const parsed = JSON.parse(stored);
          pendingLocal = parsed.filter((c: any) => c.postId === post.id && !c.approved);
        }
        
        // Merge and sort by date descending
        const merged = [...approved, ...pendingLocal].sort(
          (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()
        );
        setComments(merged);
      } catch (err) {
        console.error("Failed to load comments:", err);
      }
    };
    loadComments();
  }, [post.id]);

  // Extract images from post HTML and strip them from prose content
  const { extractedImages, cleanContent } = useMemo(() => {
    if (typeof window === "undefined") {
      return { extractedImages: [] as string[], cleanContent: post.content };
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(post.content, "text/html");
    const imgs = Array.from(doc.querySelectorAll("img")).map((img) => img.src).filter(Boolean);
    // Remove all img tags (and their wrapping <a> if only child) from prose
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
    return { extractedImages: imgs, cleanContent: doc.body.innerHTML };
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
    if (!commentText.trim()) return;

    const savedName = typeof window !== "undefined" ? localStorage.getItem("ivan_comment_author_name") : "";
    const savedEmail = typeof window !== "undefined" ? localStorage.getItem("ivan_comment_author_email") : "";

    if (!savedName || !savedEmail) {
      setTempName(savedName || "");
      setTempEmail(savedEmail || "");
      setShowIdentityModal(true);
      return;
    }

    submitCommentToDb(savedName, savedEmail);
  };

  const submitCommentToDb = async (name: string, email: string) => {
    const text = commentText.trim();
    if (!text) return;

    try {
      const newComment = await addComment(post.id, name, email, text);
      
      // Prepend to UI state for instant local preview
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
      setIsCommenting(false);

      // Smooth scroll down to comment replies area
      setTimeout(() => {
        if (commentsSectionRef.current) {
          commentsSectionRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const handleSaveIdentityAndSend = () => {
    if (!tempName.trim() || !tempEmail.trim()) return;
    
    if (typeof window !== "undefined") {
      localStorage.setItem("ivan_comment_author_name", tempName.trim());
      localStorage.setItem("ivan_comment_author_email", tempEmail.trim());
    }
    
    setShowIdentityModal(false);
    submitCommentToDb(tempName.trim(), tempEmail.trim());
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

          .floating-island-dock {
            padding: 4px 6px !important; /* Tighten floating dock island paddings */
            gap: 0.35rem !important;
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


          {/* Gold Date Indicator */}
          <div 
            className="journal-date"
            style={{ 
              fontFamily: "var(--font-sans)",
              fontSize: "0.95rem", 
              fontWeight: "600",
              color: "#B47A3E",
              marginBottom: "0.6rem"
            }}
          >
            {(() => {
              const parts = post.published.substring(0, 10).split("-");
              const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
              return dateObj.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric"
              });
            })()}
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
            {(post as any).labels && (post as any).labels.length > 0 ? (
              (post as any).labels.map((label: string) => (
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
              ))
            ) : (
              ["Personal", "Calm", "Motivation"].map((label) => (
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
              ))
            )}
          </div>

        </div>

        {/* Dynamic Book Prose — images stripped, shown in grid above */}
        <div 
          style={{
            fontSize: "17px",
            lineHeight: "1.75",
            letterSpacing: fontStyle === "mono" ? "0" : "-0.01em",
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
                      display: "flex", 
                      gap: "0.75rem",
                      padding: "1rem 0",
                      borderBottom: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"}`,
                      opacity: comment.approved ? 1 : 0.65 // slightly faded if pending approval
                    }}
                  >
                    {/* Compact Avatar with sleek border */}
                    <div style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      backgroundColor: theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
                      backgroundImage: `url(${getAvatarUrl(comment.author?.image?.url)})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      flexShrink: 0,
                      border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)"}`
                    }} />
                    
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
                        <span style={{ 
                          fontFamily: "var(--font-sans)", 
                          fontSize: "0.7rem", 
                          color: colors.textSecondary,
                          opacity: 0.4
                        }}>
                          {handleName}
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
            {/* Kindle-Style Floating Dock with Layout Width morphing */}
            <motion.div 
              layout
              className="floating-island-dock"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                backgroundColor: "rgba(18, 17, 16, 0.95)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                borderRadius: "32px",
                padding: "6px 10px",
                color: "#ffffff",
                boxShadow: "0 10px 35px rgba(0, 0, 0, 0.4)",
                width: "max-content",
                maxWidth: "92vw",
                overflow: "hidden"
              }}
              transition={{
                type: "spring",
                stiffness: 550,
                damping: 24,
                mass: 0.65
              }}
            >
          <AnimatePresence mode="wait" initial={false}>
            {isCommenting ? (
              <motion.div 
                key="commenting"
                initial={{ opacity: 0, scale: 0.75, filter: "blur(6px)", x: 15 }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)", x: 0 }}
                exit={{ opacity: 0, scale: 0.75, filter: "blur(6px)", x: -15 }}
                transition={{ type: "spring", stiffness: 550, damping: 26 }}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%" }}
              >
                {/* Close/Cancel Button (X Icon) to restore normal dock */}
                <button 
                  onClick={() => setIsCommenting(false)}
                  style={{
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    width: "38px", 
                    height: "38px", 
                    borderRadius: "50%", 
                    backgroundColor: "rgba(255, 255, 255, 0.08)", 
                    color: "#ffffff", 
                    border: "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  className="dock-icon-btn"
                  title="Cancel reply"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>

                {/* Metamorphosis Input Field aligned perfectly to 38px height */}
                <input 
                  type="text"
                  className="floating-island-input"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a reply..."
                  style={{
                    height: "38px",
                    boxSizing: "border-box",
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "20px",
                    padding: "0 16px",
                    color: "#ffffff",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                    width: "300px",
                    outline: "none",
                    fontFamily: "var(--font-sans)"
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSendComment();
                    }
                  }}
                  autoFocus
                />

                {/* Send paper-airplane Button */}
                <button 
                  onClick={handleSendComment}
                  disabled={!commentText.trim()}
                  className="dock-icon-btn"
                  style={{
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    width: "38px", 
                    height: "38px", 
                    borderRadius: "50%", 
                    backgroundColor: commentText.trim() ? "#ffffff" : "rgba(255, 255, 255, 0.04)", 
                    color: commentText.trim() ? "#000000" : "rgba(255, 255, 255, 0.2)", 
                    border: "none",
                    cursor: commentText.trim() ? "pointer" : "default",
                    transition: "all 0.2s ease"
                  }}
                  title="Send reply"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(45deg) translate(-1px, 1px)" }}>
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </motion.div>
            ) : (
              <motion.div 
                key="normal"
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
                    width: "38px", 
                    height: "38px", 
                    borderRadius: "50%", 
                    backgroundColor: "rgba(255, 255, 255, 0.08)", 
                    color: "#ffffff", 
                    transition: "all 0.2s ease",
                    textDecoration: "none"
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
                    backgroundColor: "rgba(0, 0, 0, 0.6)", 
                    borderRadius: "24px", 
                    padding: "2px",
                    border: "1px solid rgba(255, 255, 255, 0.08)"
                  }}
                >
                  <button 
                    onClick={() => setMode("read")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "22px",
                      border: "none",
                      backgroundColor: mode === "read" ? "#ffffff" : "transparent",
                      color: mode === "read" ? "#000000" : "#999999",
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
                      padding: "6px 14px",
                      borderRadius: "22px",
                      border: "none",
                      backgroundColor: mode === "listen" ? "#ffffff" : "transparent",
                      color: mode === "listen" ? "#000000" : "#999999",
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

                {/* 3. Theme Toggle Button Removed (Auto matches system preference) */}
                {/* 4. Morphing Comments Anchor Button with highly rounded conversation bubble icon */}
                <button 
                  onClick={() => setIsCommenting(true)}
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    border: "1px solid rgba(255, 255, 255, 0.1)"
                  }}
                  className="dock-icon-btn"
                  title="Add a comment"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21a9 9 0 1 0-9-9c0 1.48.36 2.89 1 4.15L3 21l4.85-1c1.26.64 2.67 1 4.15 1z"/>
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Centered Identity Modal */}
      <AnimatePresence>
        {showIdentityModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 10000,
              backgroundColor: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(10px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "1rem"
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: "24px",
                padding: "1.75rem",
                maxWidth: "320px", width: "100%",
                boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
                fontFamily: "var(--font-sans)",
                color: colors.text
              }}
            >
              <h4 style={{ margin: "0 0 6px 0", fontSize: "0.95rem", fontWeight: "700", letterSpacing: "-0.01em" }}>Introduce Yourself</h4>
              <p style={{ margin: "0 0 1.25rem 0", fontSize: "0.75rem", color: colors.textSecondary, lineHeight: "1.4" }}>Your reply requires authorization. Please set your name and email to publish.</p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  style={{
                    padding: "10px 14px", borderRadius: "12px",
                    border: `1px solid ${colors.border}`,
                    backgroundColor: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                    color: colors.text, fontSize: "0.8rem", outline: "none",
                    fontFamily: "var(--font-sans)"
                  }}
                />
                <input 
                  type="email" 
                  placeholder="your.email@example.com" 
                  value={tempEmail}
                  onChange={(e) => setTempEmail(e.target.value)}
                  style={{
                    padding: "10px 14px", borderRadius: "12px",
                    border: `1px solid ${colors.border}`,
                    backgroundColor: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                    color: colors.text, fontSize: "0.8rem", outline: "none",
                    fontFamily: "var(--font-sans)"
                  }}
                />
                
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <button 
                    onClick={() => setShowIdentityModal(false)}
                    style={{ flex: 1, padding: "10px", border: "none", borderRadius: "12px", backgroundColor: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", color: colors.text, fontSize: "0.75rem", fontWeight: "600", cursor: "pointer", fontFamily: "var(--font-sans)" }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveIdentityAndSend}
                    disabled={!tempName.trim() || !tempEmail.trim()}
                    style={{ flex: 1, padding: "10px", border: "none", borderRadius: "12px", backgroundColor: "#B47A3E", color: "#fff", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer", opacity: (!tempName.trim() || !tempEmail.trim()) ? 0.5 : 1, fontFamily: "var(--font-sans)" }}
                  >
                    Send Reply
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
