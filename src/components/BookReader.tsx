"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { addComment, getApprovedComments, CommentItem } from "@/lib/comments";
import { useLanguage } from "@/contexts/LanguageContext";

interface PostType {
  id: string;
  title: string;
  content: string;
  published: string;
  url?: string;
  labels?: string[];
}

export default function BookReader({ post, initialComments = [] }: { post: PostType, initialComments?: any[] }) {
  const { lang } = useLanguage();
  const [fontStyle, setFontStyle] = useState<"sans" | "serif" | "mono">("sans");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mode, setMode] = useState<"read" | "photos">("read");
  const [photoLayout, setPhotoLayout] = useState<"grid" | "list">("grid");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState<string>("");
  const [isCommenting, setIsCommenting] = useState<boolean>(false);
  const [lightboxImg, setLightboxImg] = useState<{ src: string; index: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  const activeParagraphIndex = -1;

  // Helpers to check if the post title or content contains Arabic characters
  const isArabicPost = useMemo(() => {
    const hasArabicText = (text: string) => /[\u0600-\u06FF]/.test(text);
    return hasArabicText(post.title || "") || hasArabicText(post.content || "");
  }, [post.title, post.content]);

  const getLocalizedDefaultCaption = () => {
    if (lang === "ar") return "لحظة ملتقطة";
    if (lang === "nl") return "Vastgelegd Moment";
    if (lang === "zh") return "捕捉的瞬间";
    return "Captured Moment";
  };

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
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
  const [extractedCaptions, setExtractedCaptions] = useState<string[]>([]);

  // Calculate dynamic reading time based on total words (approx 200 words per minute)
  const readingTime = useMemo(() => {
    const textWithoutTags = post.content.replace(/<[^>]*>/g, " ");
    const words = textWithoutTags.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  }, [post.content]);


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

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(post.content, "text/html");

      // Remove any <audio> elements so they are not rendered twice in cleanContent
      doc.querySelectorAll("audio").forEach((audio) => {
        audio.parentNode?.removeChild(audio);
      });

      // Clean up Blogger collated images where multiple <img> tags are nested inside a single <a>
      doc.querySelectorAll("a").forEach((a) => {
        const aImgs = Array.from(a.querySelectorAll("img"));
        if (aImgs.length > 1) {
          aImgs.forEach((img) => {
            const aClone = a.cloneNode(false) as HTMLAnchorElement;
            aClone.appendChild(img);
            a.parentNode?.insertBefore(aClone, a);
          });
          a.parentNode?.removeChild(a);
        }
      });

      // Preprocess all <a> tags wrapping images to wipe out target, href, and inline style to prevent new tabs / leaks
      doc.querySelectorAll("a").forEach((a) => {
        if (a.querySelector("img")) {
          a.removeAttribute("target");
          a.removeAttribute("href");
          a.removeAttribute("style");
          a.style.cursor = "pointer";
        }
      });

      // Extract images and their captions from Blogger content
      const imgs: string[] = [];
      const captions: string[] = [];

      doc.querySelectorAll("img").forEach((img) => {
        const src = img.src;
        if (!src) return;

        let caption = "";

        // Check Case 1: Blogger's standard tr-caption-container table
        const trContainer = img.closest(".tr-caption-container");
        if (trContainer) {
          const captionEl = trContainer.querySelector(".tr-caption");
          if (captionEl) {
            caption = captionEl.innerHTML.trim() || captionEl.textContent?.trim() || "";
            captionEl.parentNode?.removeChild(captionEl);
          }
        }

        // Check Case 2: Div wrapping image with a separate caption sibling/child
        if (!caption) {
          const parent = img.parentElement;
          if (parent) {
            const siblingCaption = parent.querySelector(".caption, .tr-caption, [class*='caption']");
            if (siblingCaption && siblingCaption !== img) {
              caption = siblingCaption.innerHTML.trim() || siblingCaption.textContent?.trim() || "";
              siblingCaption.parentNode?.removeChild(siblingCaption);
            }
          }
        }

        // Clean the extracted caption: strip HTML tags but preserve clean text
        const cleanCaption = caption.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

        imgs.push(src);
        captions.push(cleanCaption);
      });

      // Also let's clean up any empty table rows left behind in tr-caption-container tables
      doc.querySelectorAll("table.tr-caption-container").forEach((table) => {
        table.querySelectorAll("tr").forEach((tr) => {
          if (tr.cells.length === 0 || Array.from(tr.cells).every(cell => !cell.textContent?.trim() && cell.querySelectorAll("img, video").length === 0)) {
            tr.parentNode?.removeChild(tr);
          }
        });
      });

      // Remove tag lines (e.g. elements that contain "CREATIVE . RAW . PERSONAL" or similar tags)
      doc.querySelectorAll("p, div, span").forEach((el) => {
        const text = el.textContent?.trim().toUpperCase() || "";
        const words = text.split(/\s*[\s\.\•\-\|\,\·\▪\•\◦\▪\▫\▪\•]\s*/).filter(Boolean);
        const knownTags = ["CREATIVE", "RAW", "PERSONAL", "REFLECTIVE", "CALM", "GROWTH", "NOSTALGIC", "INSPIRED", "DEEP", "MINIMAL", "AESTHETICS", "AESTHETIC"];
        if (words.length > 0 && words.length <= 5 && words.every(word => knownTags.includes(word))) {
          el.parentNode?.removeChild(el);
        }
      });

      // Transform <video> elements to behave like Apple Live Photos
      doc.querySelectorAll("video").forEach((video) => {
        video.setAttribute("autoplay", "true");
        video.setAttribute("loop", "true");
        video.setAttribute("muted", "true");
        video.setAttribute("playsinline", "true");
        video.removeAttribute("controls");

        video.style.width = "100%";
        video.style.height = "auto";
        video.style.display = "block";
        video.style.borderRadius = "8px";
        video.style.margin = "0";

        const wrapper = doc.createElement("div");
        wrapper.className = "live-photo-wrapper";

        const badge = doc.createElement("div");
        badge.className = "live-photo-badge";
        badge.innerHTML = "<span></span>LIVE";

        if (video.parentNode) {
          video.parentNode.insertBefore(wrapper, video);
          wrapper.appendChild(video);
          wrapper.appendChild(badge);
        }
      });

      const hasSignificantContentBetween = (img1: HTMLImageElement, img2: HTMLImageElement): boolean => {
        let current: Node | null = img1;

        const nextNode = (node: Node): Node | null => {
          if (node.firstChild) return node.firstChild;
          while (node) {
            if (node.nextSibling) return node.nextSibling;
            node = node.parentNode!;
            if (node === doc.body || node === doc) return null;
          }
          return null;
        };

        current = nextNode(current);
        while (current && current !== img2) {
          if (current.nodeType === Node.TEXT_NODE) {
            const text = current.textContent ? current.textContent.trim() : "";
            if (text.length > 0) return true;
          } else if (current.nodeType === Node.ELEMENT_NODE) {
            const el = current as HTMLElement;
            const tag = el.tagName;
            if (["VIDEO", "IFRAME", "HR", "H1", "H2", "H3", "H4", "H5", "H6"].includes(tag)) {
              return true;
            }
          }
          current = nextNode(current);
        }
        return false;
      };

      const getContentNode = (img: HTMLImageElement): HTMLElement => {
        if (img.parentElement && img.parentElement.tagName === "A") {
          return img.parentElement;
        }
        return img;
      };

      const getOutermostWrapper = (node: HTMLElement): HTMLElement => {
        let current = node;
        let depth = 0;
        while (current.parentElement && current.parentElement.tagName !== "BODY" && depth < 2) {
          const parent = current.parentElement;
          const tag = parent.tagName;

          if (tag !== "A" && tag !== "P" && tag !== "DIV" && tag !== "SPAN") break;

          const otherElements = Array.from(parent.children).filter(child => child !== current && child.tagName !== "BR");
          const textContent = parent.textContent ? parent.textContent.trim() : "";

          if (otherElements.length > 0 || textContent !== "") break;

          current = parent;
          depth++;
        }
        return current;
      };

      const imgsInDoc = Array.from(doc.querySelectorAll("img"));
      const groups: HTMLImageElement[][] = [];
      let currentGroup: HTMLImageElement[] = [];

      for (let i = 0; i < imgsInDoc.length; i++) {
        const img = imgsInDoc[i];
        if (currentGroup.length === 0) {
          currentGroup.push(img);
        } else {
          const lastImg = currentGroup[currentGroup.length - 1];
          if (!hasSignificantContentBetween(lastImg, img)) {
            currentGroup.push(img);
          } else {
            if (currentGroup.length >= 2) groups.push(currentGroup);
            currentGroup = [img];
          }
        }
      }
      if (currentGroup.length >= 2) groups.push(currentGroup);

      groups.forEach((group) => {
        const container = doc.createElement("div");
        container.className = "inline-photo-grid";
        container.style.display = "grid";
        container.style.width = "100%";

        // Dynamically set beautiful editorial height based on viewport width (taller for high vertical presence)
        const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
        container.style.height = isMobile ? "250px" : "420px";

        container.style.margin = "1.8rem 0 2.8rem 0";
        container.style.borderRadius = "8px";
        container.style.overflow = "hidden";
        container.style.gap = "4px";
        container.style.border = "1px solid rgba(150,150,150,0.12)";
        container.style.boxShadow = "0 8px 24px rgba(0,0,0,0.04)";
        container.style.backgroundColor = "rgba(150,150,150,0.04)";

        const count = group.length;
        if (count === 2) {
          container.classList.add("grid-cols-2");
          container.style.gridTemplateColumns = "1fr 1fr";
        } else if (count === 3) {
          container.classList.add("grid-cols-3");
          container.style.gridTemplateColumns = "1fr 1fr 1fr";
        } else if (count >= 4) {
          container.classList.add("grid-cols-4");
          container.style.gridTemplateColumns = "1fr 1fr";
          container.style.gridTemplateRows = "1fr 1fr";
        } else {
          container.style.display = "block";
        }

        const firstContentNode = getContentNode(group[0]);
        const firstWrapper = getOutermostWrapper(firstContentNode);

        if (firstWrapper.parentNode) {
          firstWrapper.parentNode.insertBefore(container, firstWrapper);

          group.forEach((img, i) => {
            const contentNode = getContentNode(img);
            const wrapper = getOutermostWrapper(contentNode);

            // Wiping out Blogger anchor targets and inline styling to prevent new tabs / layout overrides
            contentNode.removeAttribute("style");
            contentNode.removeAttribute("target");
            contentNode.setAttribute("href", "#");
            contentNode.style.position = "relative";
            contentNode.style.width = "100%";
            contentNode.style.height = "100%";
            contentNode.style.overflow = "hidden";
            contentNode.style.cursor = "pointer";
            contentNode.style.display = "block";

            // Append dynamic hover glass layer overlay
            const overlay = doc.createElement("div");
            overlay.className = "inline-photo-hover-overlay";
            overlay.style.position = "absolute";
            overlay.style.inset = "0";
            overlay.style.backgroundColor = "rgba(0,0,0,0)";
            overlay.style.transition = "background-color 0.22s ease";
            contentNode.appendChild(overlay);

            contentNode.classList.add("inline-photo-item");
            contentNode.setAttribute("data-card-index", String(i));

            if (count > 4 && i === 3) {
              const extraCount = count - 4;
              const extraOverlay = doc.createElement("div");
              extraOverlay.style.position = "absolute";
              extraOverlay.style.inset = "0";
              extraOverlay.style.backgroundColor = "rgba(0, 0, 0, 0.45)";
              extraOverlay.style.backdropFilter = "blur(6px)";
              extraOverlay.style.setProperty("-webkit-backdrop-filter", "blur(6px)");
              extraOverlay.style.display = "flex";
              extraOverlay.style.alignItems = "center";
              extraOverlay.style.justifyContent = "center";
              extraOverlay.style.flexDirection = "column";
              extraOverlay.style.color = "#ffffff";
              extraOverlay.style.fontFamily = "var(--font-sans)";
              extraOverlay.style.fontWeight = "700";
              extraOverlay.style.fontSize = "1.4rem";
              extraOverlay.innerHTML = `+${extraCount}`;
              contentNode.appendChild(extraOverlay);
            }

            container.appendChild(contentNode);

            if (wrapper !== contentNode && wrapper.parentNode && wrapper !== firstWrapper) {
              wrapper.parentNode.removeChild(wrapper);
            }

            img.removeAttribute("style");
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.objectFit = "cover";
            img.style.margin = "0";
            img.style.display = "block";
            img.style.transition = "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)";
          });

          if (count > 4) {
            const items = Array.from(container.children);
            items.forEach((item, idx) => {
              if (idx >= 4) {
                (item as HTMLElement).style.display = "none";
              }
            });
          }

          if (firstWrapper !== firstContentNode && firstWrapper.parentNode) {
            firstWrapper.parentNode.removeChild(firstWrapper);
          }
        }
      });

      doc.querySelectorAll("p, div").forEach((el) => {
        if (!el.textContent?.trim() && el.children.length === 0) {
          el.parentNode?.removeChild(el);
        }
      });

      const textBlocks = doc.querySelectorAll("p, h1, h2, h3, h4, h5, h6, blockquote, li");
      textBlocks.forEach((el, idx) => {
        el.setAttribute("data-p-idx", String(idx));
      });

      setExtractedImages(imgs);
      setExtractedCaptions(captions);
      setCleanContent(doc.body.innerHTML);
    } catch (err) {
      console.error("Error parsing content:", err);
      // Fallback: render original content safely
      setExtractedImages([]);
      setExtractedCaptions([]);
      setCleanContent(post.content);
    }
  }, [mounted, post.content]);

  const handleSetMode = (targetMode: "read" | "photos") => {
    setMode(targetMode);
  };

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
        if (window.innerWidth >= 1024) {
          commentsSectionRef.current.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          commentsSectionRef.current.scrollIntoView({ behavior: "smooth" });
        }
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

  // Determine if active reading theme is dark
  const isCurrentThemeDark = useMemo(() => {
    return theme === "dark";
  }, [theme]);

  // Compute theme colors dynamically
  const colors = useMemo(() => {
    return theme === "light"
      ? {
          bg: "#f7f5f0", // Warm paper color
          text: "#1a1a1c",
          textSecondary: "#5a5c66",
          border: "rgba(0, 0, 0, 0.08)"
        }
      : {
          bg: "#0a0a0c", // Editorial Noir background
          text: "#f8f9fa",
          textSecondary: "#8a8d98",
          border: "rgba(255, 255, 255, 0.08)"
        };
  }, [theme]);

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        minHeight: "100vh",
        transition: "background-color 0.4s ease, color 0.4s ease",
        padding: "10.5rem 4vw 12rem 4vw", // More spacious top padding on desktop
        margin: "-6rem -4vw -6rem -4vw", // Bleeds up and down out of layout container padding
        position: "relative",
        direction: "ltr",
        textAlign: "left"
      }}
      className={`book-reader-container ${!isArabicPost ? "non-arabic-post" : ""}`}
    >
      {/* Global CSS for book content media to prevent overflowing and hide footer on post details */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .book-reader-container {
          direction: ltr !important;
          text-align: left !important;
        }

        /* Arabic RTL overrides bypass for Western (non-Arabic) content */
        [data-lang="ar"] .non-arabic-post,
        [data-lang="ar"] .non-arabic-post p,
        [data-lang="ar"] .non-arabic-post span,
        [data-lang="ar"] .non-arabic-post a,
        [data-lang="ar"] .non-arabic-post h1,
        [data-lang="ar"] .non-arabic-post h2,
        [data-lang="ar"] .non-arabic-post h3,
        [data-lang="ar"] .non-arabic-post h4,
        [data-lang="ar"] .non-arabic-post h5,
        [data-lang="ar"] .non-arabic-post h6,
        [data-lang="ar"] .non-arabic-post li,
        [data-lang="ar"] .non-arabic-post blockquote,
        [data-lang="ar"] .non-arabic-post time,
        [data-lang="ar"] .non-arabic-post div {
          direction: ltr !important;
          text-align: left !important;
        }
        [data-lang="ar"] .non-arabic-post .book-title,
        [data-lang="ar"] .non-arabic-post .journal-date {
          text-align: center !important;
        }

        /* ─── Premium Audiobook Reader Highlights ─── */
        .book-prose-listening p, 
        .book-prose-listening h1, 
        .book-prose-listening h2, 
        .book-prose-listening h3, 
        .book-prose-listening h4, 
        .book-prose-listening h5, 
        .book-prose-listening h6, 
        .book-prose-listening blockquote, 
        .book-prose-listening li {
          opacity: 0.35;
          filter: blur(0.3px);
          transition: opacity 0.5s cubic-bezier(0.25, 1, 0.5, 1), 
                      transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), 
                      border-left-color 0.5s ease, 
                      padding-left 0.5s ease,
                      color 0.5s ease;
          border-left: 3px solid transparent;
        }

        .book-prose-listening [data-p-idx="${activeParagraphIndex}"] {
          opacity: 1 !important;
          filter: blur(0px) !important;
          color: ${colors.text} !important;
          transform: translateX(4px);
          border-left-color: ${colors.text} !important;
          padding-left: 12px !important;
        }

        .book-prose img, .book-prose iframe, .book-prose video {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 0px;
          margin: 1.5rem 0;
        }
        .book-prose img, .photo-cover-collage img {
          pointer-events: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
        }
        .live-photo-wrapper {
          position: relative;
          width: 100%;
          margin: 1.5rem 0;
          border-radius: 0px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
          border: 1px solid var(--border-color);
        }
        .live-photo-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(0, 0, 0, 0.55);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 4px 8px;
          border-radius: 0px;
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 10;
          user-select: none;
          pointer-events: none;
          border: 0.5px solid rgba(255,255,255,0.15);
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          text-transform: uppercase;
        }
        .live-photo-badge span {
          width: 6px;
          height: 6px;
          background-color: #ffd60a;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 4px #ffd60a;
          animation: live-pulse 1.8s infinite ease-in-out;
        }
        @keyframes live-pulse {
          0%, 100% { opacity: 0.5; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
         .book-prose p {
          word-break: break-word;
          overflow-wrap: break-word;
          text-align: left !important;
          direction: ltr !important;
        }
        .book-prose h1,
        .book-prose h2,
        .book-prose h3,
        .book-prose h4,
        .book-prose h5,
        .book-prose h6,
        .book-prose blockquote,
        .book-prose li,
        .book-prose span,
        .book-prose a {
          text-align: left !important;
          direction: ltr !important;
        }
        .book-title {
          text-align: center !important;
          direction: ltr !important;
        }
        .journal-date {
          text-align: center !important;
          direction: ltr !important;
        }
        footer.yunox-single-footer {
          display: none !important;
        }
        .photo-cover-collage {
          width: 100%;
          height: 150px !important;
        }
        @media (min-width: 768px) {
          .photo-cover-collage {
            height: 260px !important;
          }
        }

        /* ── Inline Photo Grid & Hover overlays ────── */
        .inline-photo-item {
          transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
        }
        .inline-photo-item:hover {
          transform: scale(1.01) !important;
        }
        .inline-photo-item:hover img {
          transform: scale(1.03) !important;
        }
        .inline-photo-item:hover .inline-photo-hover-overlay {
          background-color: rgba(0,0,0,0.12) !important;
        }

        .inline-photo-grid img {
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          object-fit: cover !important;
          margin: 0 !important;
          border-radius: 0 !important;
          display: block !important;
          pointer-events: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
        }

        /* Premium Responsive Grid Collage Heights */
        .inline-photo-grid.grid-cols-2 {
          height: 140px !important;
        }
        .inline-photo-grid.grid-cols-3 {
          height: 100px !important;
        }
        .inline-photo-grid.grid-cols-4 {
          height: 180px !important;
        }
        @media (min-width: 768px) {
          .inline-photo-grid.grid-cols-2 {
            height: 240px !important;
          }
          .inline-photo-grid.grid-cols-3 {
            height: 180px !important;
          }
          .inline-photo-grid.grid-cols-4 {
            height: 320px !important;
          }
        }

        .book-core-article {
          padding-left: 0;
          padding-right: 0;
          max-width: 650px;
          margin: 0 auto;
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
            padding: 9.5rem 1.25rem 9rem 1.25rem !important; /* Spacious padding on mobile to clear nav bar beautifully */
            margin: -6rem -1.25rem -6rem -1.25rem !important; /* Align negative margins */
          }

          .book-core-article {
            padding-left: 1.5rem !important;
            padding-right: 1.5rem !important;
          }
          
          .book-title {
            font-size: 2.1rem !important; /* Balanced and elegant mobile title size */
            margin-bottom: 1.5rem !important; /* Spacious gap below title */
            line-height: 1.38 !important; /* Majestic, airy line-height for mobile reading */
            letter-spacing: -0.02em !important;
          }
          
          .journal-date {
            font-size: 0.9rem !important;
            margin-bottom: 1rem !important; /* Extra spacing to breathe */
          }

          .book-tags-row {
            margin-bottom: 2.5rem !important; /* Spacious gap before prose */
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
            border-radius: 16px !important;
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

        @media (min-width: 1024px) {
          .book-core-article {
            max-width: 1100px !important;
          }
          .book-reader-split-layout {
            display: flex !important;
            flex-direction: row !important;
            gap: 4.5rem !important;
            align-items: flex-start !important;
            justify-content: space-between !important;
          }
          .book-reader-col-post {
            flex: 1 1 0% !important;
            min-width: 0 !important;
            max-width: 650px !important;
          }
          .book-reader-col-comments {
            flex: 0 0 380px !important;
            min-width: 0 !important;
            position: sticky !important;
            top: 7.5rem !important;
            max-height: calc(100vh - 12rem) !important;
            overflow-y: auto !important;
            padding-right: 12px !important;
            margin-top: 0 !important;
            padding-top: 0 !important;
            border-top: none !important;
          }
          .book-reader-col-comments::-webkit-scrollbar { display: none; }
          .book-reader-col-comments { -ms-overflow-style: none; scrollbar-width: none; }
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
                  borderRadius: "8px",
                  padding: "12px 12px 16px 12px",
                  maxWidth: "340px", width: "100%",
                  boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
                  display: "flex", flexDirection: "column", gap: "10px"
                }}
              >
                <img
                  src={lightboxImg.src}
                  alt=""
                  style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: "8px", display: "block", pointerEvents: "none", userSelect: "none", WebkitUserDrag: "none" } as React.CSSProperties}
                />
                {/* Custom caption & moment stamp row */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "2px" }}>
                  <span style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                    color: "#333",
                    lineHeight: "1.4"
                  }}>
                    {extractedCaptions[lightboxImg.index] || getLocalizedDefaultCaption()}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.62rem",
                    fontWeight: "700",
                    color: "var(--accent-color)",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase"
                  }}>
                    Moment #{lightboxImg.index + 1}
                  </span>
                </div>
                <button
                  onClick={() => setLightboxImg(null)}
                  style={{ background: "none", border: "none", cursor: "pointer", position: "absolute", top: "1.5rem", right: "1.5rem", color: "#fff", opacity: 0.7, padding: "4px" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}



      {/* Book Core Content Area */}
      <article className="book-core-article" style={{ direction: "ltr", textAlign: "left" }}>
        <div className="book-reader-split-layout">
          {/* Column 1: Post Content */}
          <div className="book-reader-col-post">
            {/* Elegant Rounded Journal Header */}
            {/* Elegant Rounded Journal Header */}
            {mode !== "photos" && (
              <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>

                {/* ===== PREMIUM COVER COLLAGE GRID (above date) ===== */}
                {extractedImages.length > 0 && (
                  <div
                    className="photo-cover-collage"
                    style={{
                      width: "100%",
                      height: extractedImages.length === 1 ? "380px" : "320px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: `1px solid ${colors.border}`,
                      boxShadow: "0 16px 48px rgba(0,0,0,0.12)",
                      backgroundColor: "rgba(150,150,150,0.08)",
                      marginBottom: "2rem",
                      position: "relative",
                      display: extractedImages.length === 1 ? "block" : "grid",
                      gap: "3px",
                      // Grid layout based on number of images
                      gridTemplateColumns:
                        extractedImages.length === 2
                          ? "1fr 1fr"
                          : extractedImages.length === 3
                            ? "2fr 1fr"
                            : extractedImages.length >= 4
                              ? "1fr 1fr"
                              : "none",
                      gridTemplateRows:
                        extractedImages.length === 3
                          ? "1fr 1fr"
                          : extractedImages.length >= 4
                            ? "1fr 1fr"
                            : "none",
                    }}
                  >
                    {extractedImages.slice(0, 4).map((src, idx) => {
                      // Determine grid cell positions for 3 images case
                      let gridStyle: React.CSSProperties = {
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        overflow: "hidden",
                        cursor: "pointer",
                      };

                      if (extractedImages.length === 3) {
                        if (idx === 0) {
                          gridStyle.gridRow = "span 2";
                        } else if (idx === 1) {
                          gridStyle.gridColumn = "2";
                          gridStyle.gridRow = "1";
                        } else if (idx === 2) {
                          gridStyle.gridColumn = "2";
                          gridStyle.gridRow = "2";
                        }
                      }

                      const isLastCellWithMore = extractedImages.length > 4 && idx === 3;
                      const extraCount = extractedImages.length - 4;

                      return (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.995 }}
                          onClick={() => setLightboxImg({ src, index: idx })}
                          style={gridStyle}
                        >
                          <img
                            src={src}
                            alt={`Cover Photo ${idx + 1}`}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          />

                          {/* Dark gradient overlay */}
                          <div style={{
                            position: "absolute", inset: 0,
                            background: "linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 60%)",
                          }} />

                          {/* "+X More" Overlay for the 4th quadrant */}
                          {isLastCellWithMore && (
                            <div style={{
                              position: "absolute", inset: 0,
                              backgroundColor: "rgba(0, 0, 0, 0.45)",
                              backdropFilter: "blur(6px)",
                              WebkitBackdropFilter: "blur(6px)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexDirection: "column",
                              color: "#ffffff",
                              fontFamily: "var(--font-sans)",
                              userSelect: "none"
                            }}>
                              <span style={{ fontSize: "1.6rem", fontWeight: "700", letterSpacing: "-0.02em" }}>
                                +{extraCount}
                              </span>
                              <span style={{ fontSize: "0.6rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.8, marginTop: "2px" }}>
                                Photos
                              </span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}


                {/* Gold Date Indicator & Reading Time */}
                <div
                  className="journal-date"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    color: "var(--accent-color)",
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
                    lineHeight: "1.35", // More airy and majestic
                    margin: "0 0 1.6rem 0", // Increased margin below title
                    color: colors.text,
                    letterSpacing: "-0.03em",
                    wordBreak: "break-word",
                    overflowWrap: "break-word"
                  }}
                >
                  {post.title}
                </h1>

              </div>
            )}

            {/* Minimalist Photos Header & Switcher */}
            {mode === "photos" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2rem", marginTop: "1rem" }}>
                <h1 className="book-title" style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: "600",
                  fontSize: "1.5rem",
                  letterSpacing: "-0.02em",
                  color: colors.text,
                  opacity: 0.9,
                  margin: "0 0 4px 0",
                  textAlign: "center"
                }}>
                  {lang === "ar" ? "لحظات" : lang === "nl" ? "Momenten" : lang === "zh" ? "瞬间" : "Moments"}
                </h1>
                <p className="journal-date" style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.85rem",
                  color: colors.textSecondary,
                  opacity: 0.6,
                  margin: "0 0 1.25rem 0",
                  textAlign: "center"
                }}>
                  {lang === "ar" ? "لحظات ملتقطة من هذا الإدخال" : lang === "nl" ? "Vastgelegte momenten van dit bericht" : lang === "zh" ? "此条目中捕捉的瞬间" : "Captured moments from this entry"}
                </p>

                {/* Sleek iOS-style Grid / List Segmented Switcher */}
                {extractedImages.length > 0 && (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    height: "28px",
                    backgroundColor: isCurrentThemeDark ? "#1c1b1a" : "#f0ece3",
                    borderRadius: "8px",
                    padding: "1.5px",
                    border: isCurrentThemeDark ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(0, 0, 0, 0.03)",
                    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.04)",
                    position: "relative"
                  }}>
                    <button
                      onClick={() => setPhotoLayout("grid")}
                      style={{
                        height: "23px",
                        lineHeight: "23px",
                        padding: "0 10px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "transparent",
                        color: photoLayout === "grid"
                          ? (isCurrentThemeDark ? "#000000" : "#ffffff")
                          : (isCurrentThemeDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"),
                        fontSize: "0.7rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "color 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        position: "relative",
                        zIndex: 2
                      }}
                    >
                      {photoLayout === "grid" && (
                        <motion.div
                          layoutId="photo-layout-highlight"
                          style={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: isCurrentThemeDark ? "#ffffff" : "#111111",
                            borderRadius: "8px",
                            zIndex: -1
                          }}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <svg style={{ position: "relative", zIndex: 3 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="5" height="5" rx="0.5"/><rect x="10" y="3" width="5" height="5" rx="0.5"/><rect x="17" y="3" width="5" height="5" rx="0.5"/><rect x="3" y="10" width="5" height="5" rx="0.5"/><rect x="10" y="10" width="5" height="5" rx="0.5"/><rect x="17" y="10" width="5" height="5" rx="0.5"/><rect x="3" y="17" width="5" height="5" rx="0.5"/><rect x="10" y="17" width="5" height="5" rx="0.5"/><rect x="17" y="17" width="5" height="5" rx="0.5"/></svg>
                      <span style={{ position: "relative", zIndex: 3 }}>
                        {lang === "ar" ? "شبكة" : lang === "nl" ? "Raster" : lang === "zh" ? "网格" : "Grid"}
                      </span>
                    </button>
                    <button
                      onClick={() => setPhotoLayout("list")}
                      style={{
                        height: "23px",
                        lineHeight: "23px",
                        padding: "0 10px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "transparent",
                        color: photoLayout === "list"
                          ? (isCurrentThemeDark ? "#000000" : "#ffffff")
                          : (isCurrentThemeDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"),
                        fontSize: "0.7rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "color 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        position: "relative",
                        zIndex: 2
                      }}
                    >
                      {photoLayout === "list" && (
                        <motion.div
                          layoutId="photo-layout-highlight"
                          style={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: isCurrentThemeDark ? "#ffffff" : "#111111",
                            borderRadius: "8px",
                            zIndex: -1
                          }}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <svg style={{ position: "relative", zIndex: 3 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                      <span style={{ position: "relative", zIndex: 3 }}>
                        {lang === "ar" ? "قائمة" : lang === "nl" ? "Lijst" : lang === "zh" ? "列表" : "List"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Dynamic Book Prose or Compiled Photos Grid */}
            <AnimatePresence mode="wait">
              {mode === "photos" ? (
                <motion.div
                  key="photos-layout"
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  style={{ display: "flex", flexDirection: "column", gap: "2rem", marginTop: "1rem" }}
                >
                  {extractedImages.length > 0 ? (
                    photoLayout === "grid" ? (
                      /* ── iOS-style 3-column tight square grid ── */
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "3px",
                        width: "100%",
                        borderRadius: "8px",
                        overflow: "hidden"
                      }}>
                        {extractedImages.map((src, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.96 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-20px" }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: idx * 0.03 }}
                            whileHover={{ scale: 1.04, zIndex: 2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setLightboxImg({ src, index: idx })}
                            style={{
                              position: "relative",
                              aspectRatio: "1 / 1",
                              overflow: "hidden",
                              cursor: "pointer",
                              backgroundColor: isCurrentThemeDark ? "#1a1917" : "#e8e3db",
                              transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                            }}
                          >
                            <img
                              src={src}
                              alt={`Moment ${idx + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                display: "block",
                                transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
                              }}
                            />
                            {/* Subtle hover darkening */}
                            <div style={{
                              position: "absolute",
                              inset: 0,
                              background: "rgba(0,0,0,0)",
                              transition: "background 0.25s ease",
                              pointerEvents: "none"
                            }} />
                            {/* Corner index badge */}
                            <div style={{
                              position: "absolute",
                              top: "7px",
                              left: "7px",
                              background: "rgba(0,0,0,0.5)",
                              backdropFilter: "blur(8px)",
                              WebkitBackdropFilter: "blur(8px)",
                              color: "#fff",
                              fontSize: "0.55rem",
                              fontWeight: "700",
                              fontFamily: "var(--font-sans)",
                              letterSpacing: "0.06em",
                              padding: "2px 6px",
                              borderRadius: "8px",
                              opacity: 0.85
                            }}>
                              {idx + 1}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      /* ── Premium editorial List layout ── */
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", width: "100%" }}>
                        {extractedImages.map((src, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-30px" }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: idx * 0.04 }}
                            onClick={() => setLightboxImg({ src, index: idx })}
                            style={{
                              display: "flex",
                              alignItems: "stretch",
                              gap: "1.1rem",
                              cursor: "pointer",
                              borderRadius: "8px",
                              overflow: "hidden",
                              border: `1px solid ${colors.border}`,
                              backgroundColor: isCurrentThemeDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                              boxShadow: isCurrentThemeDark
                                ? "0 2px 16px rgba(0,0,0,0.25)"
                                : "0 2px 12px rgba(0,0,0,0.05)",
                              transition: "box-shadow 0.3s ease, transform 0.3s ease"
                            }}
                            whileHover={{
                              boxShadow: isCurrentThemeDark
                                ? "0 8px 30px rgba(0,0,0,0.4)"
                                : "0 8px 28px rgba(0,0,0,0.1)",
                              y: -2
                            }}
                            whileTap={{ scale: 0.99 }}
                          >
                            {/* Square thumbnail */}
                            <div style={{
                              flexShrink: 0,
                              width: "110px",
                              aspectRatio: "1 / 1",
                              overflow: "hidden",
                              position: "relative"
                            }}>
                              <img
                                src={src}
                                alt={`Moment ${idx + 1}`}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                  transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
                                }}
                              />
                            </div>
                            {/* Text content */}
                            <div style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              padding: "1rem 1.1rem 1rem 0",
                              gap: "6px"
                            }}>
                              <span style={{
                                fontFamily: "var(--font-sans)",
                                fontSize: "0.6rem",
                                fontWeight: "700",
                                textTransform: "uppercase",
                                letterSpacing: "0.12em",
                                color: "var(--accent-color)",
                                opacity: 0.9
                              }}>
                                Moment {String(idx + 1).padStart(2, "0")}
                              </span>
                              <p style={{
                                fontFamily: "var(--font-sans)",
                                fontSize: "0.9rem",
                                fontWeight: "500",
                                lineHeight: "1.5",
                                letterSpacing: "-0.01em",
                                color: colors.text,
                                margin: 0,
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden"
                              }}>
                                {extractedCaptions[idx] || getLocalizedDefaultCaption()}
                              </p>
                              {/* Tap indicator */}
                              <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                marginTop: "4px"
                              }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2.5">
                                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                                </svg>
                                <span style={{
                                  fontFamily: "var(--font-sans)",
                                  fontSize: "0.65rem",
                                  color: colors.textSecondary,
                                  opacity: 0.6,
                                  fontWeight: "500"
                                }}>
                                  {lang === "ar" ? "اضغط للعرض" : lang === "nl" ? "Tik om te bekijken" : lang === "zh" ? "点击查看" : "Tap to view"}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "5rem 2rem",
                      textAlign: "center",
                      opacity: 0.6
                    }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: "var(--accent-color)", marginBottom: "1rem" }}>
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "1.1rem", fontWeight: "600", margin: "0 0 4px 0" }}>
                        {lang === "ar" ? "لا توجد صور" : lang === "zh" ? "没有照片" : lang === "nl" ? "Geen foto's" : "No photos"}
                      </h3>
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.8rem", margin: 0 }}>
                        {lang === "ar" ? "لا توجد صور متوفرة في هذا الإدخال." : lang === "zh" ? "此条目中没有可用的照片。" : lang === "nl" ? "Er zijn geen foto's beschikbaar in dit bericht." : "There are no photos available in this entry."}
                      </p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="story-layout"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontSize: "17px",
                    lineHeight: "1.75",
                    letterSpacing: fontStyle === "mono" ? "0" : "-0.01em",
                    fontFamily: fontStyle === "serif" ? "var(--font-serif)" : fontStyle === "mono" ? "monospace" : "var(--font-sans)",
                    wordBreak: "break-word"
                  }}
                  className={`book-prose prose-style-${fontStyle}`}
                  dangerouslySetInnerHTML={{ __html: cleanContent }}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;

                    // ── Grid collage photo item click → lightbox ──
                    const photoItem = target.closest(".inline-photo-item") as HTMLElement | null;
                    if (photoItem) {
                      e.preventDefault();
                      e.stopPropagation();
                      const img = photoItem.querySelector("img");
                      if (img) {
                        const src = img.src;
                        const idx = extractedImages.indexOf(src);
                        setLightboxImg({ src, index: idx !== -1 ? idx : 0 });
                      }
                      return;
                    }

                    // ── Fallback: Normal image click → lightbox ──
                    if (target.tagName === "IMG") {
                      e.preventDefault();
                      e.stopPropagation();
                      const src = (target as HTMLImageElement).src;
                      const idx = extractedImages.indexOf(src);
                      setLightboxImg({ src, index: idx !== -1 ? idx : 0 });
                    } else {
                      const link = target.closest("a");
                      if (link) {
                        const img = link.querySelector("img");
                        if (img) {
                          e.preventDefault();
                          e.stopPropagation();
                          const src = img.src;
                          const idx = extractedImages.indexOf(src);
                          setLightboxImg({ src, index: idx !== -1 ? idx : 0 });
                        }
                      }
                    }
                  }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Column 2: Comment Section */}
          <div
            ref={commentsSectionRef}
            className="book-reader-col-comments"
            style={{
              marginTop: "4.5rem",
              paddingTop: "2.5rem",
              borderTop: `1px solid ${isCurrentThemeDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                height: "34px",
                padding: "0 14px",
                background: isCurrentThemeDark
                  ? "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%)"
                  : "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.65) 100%)",
                backdropFilter: "blur(20px) saturate(190%)",
                WebkitBackdropFilter: "blur(20px) saturate(190%)",
                border: isCurrentThemeDark
                  ? "1px solid rgba(255, 255, 255, 0.2)"
                  : "1px solid rgba(0, 0, 0, 0.14)",
                borderRadius: "8px",
                boxShadow: isCurrentThemeDark
                  ? "inset 0 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 0 rgba(255, 255, 255, 0.05), 0 6px 20px -4px rgba(0, 0, 0, 0.4)"
                  : "inset 0 1px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 0 rgba(0, 0, 0, 0.02), 0 4px 16px -2px rgba(0, 0, 0, 0.05)"
              }}>
                <span style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.72rem",
                  fontWeight: "700",
                  color: isCurrentThemeDark ? "rgba(255, 255, 255, 0.9)" : "rgba(17, 17, 17, 0.85)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase"
                }}>
                  Replies
                </span>
                <span style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.68rem",
                  fontWeight: "600",
                  backgroundColor: isCurrentThemeDark ? "rgba(225, 29, 72, 0.25)" : "rgba(225, 29, 72, 0.08)",
                  color: "var(--accent-color)",
                  padding: "1px 6px",
                  borderRadius: "8px",
                  letterSpacing: "0.02em"
                }}>
                  {comments.length}
                </span>
              </div>
            </div>

            {/* Comments List: Balanced modern typography */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
              {comments && comments.length > 0 ? (
                comments.map((comment: any) => {
                  const displayName = comment.author?.displayName || "Anonymous";
                  return (
                    <div
                      key={comment.id}
                      style={{
                        padding: "0.9rem 1.1rem",
                        background: isCurrentThemeDark
                          ? "linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%)"
                          : "linear-gradient(135deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.52) 100%)",
                        backdropFilter: "blur(24px) saturate(190%)",
                        WebkitBackdropFilter: "blur(24px) saturate(190%)",
                        border: `1px solid ${isCurrentThemeDark ? "rgba(255, 255, 255, 0.18)" : "rgba(0, 0, 0, 0.11)"}`,
                        borderRadius: "8px",
                        marginBottom: "0.8rem",
                        opacity: comment.approved ? 1 : 0.65,
                        boxShadow: isCurrentThemeDark
                          ? "inset 0 1px 0 rgba(255, 255, 255, 0.22), inset 0 -1px 0 rgba(255, 255, 255, 0.05), 0 8px 32px -4px rgba(0, 0, 0, 0.35)"
                          : "inset 0 1px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 0 rgba(0, 0, 0, 0.02), 0 6px 20px -2px rgba(0, 0, 0, 0.04)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {/* Comment Body */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "7px", marginBottom: "0.25rem" }}>
                          <span style={{
                            fontFamily: "var(--font-sans)",
                            fontWeight: "600",
                            fontSize: "0.84rem",
                            color: colors.text,
                            letterSpacing: "-0.01em"
                          }}>
                            {displayName}
                          </span>
                          <span style={{ fontSize: "0.58rem", color: colors.textSecondary, opacity: 0.35 }}>·</span>
                          <span style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.72rem",
                            color: colors.textSecondary,
                            opacity: 0.45
                          }}>
                            {new Date(comment.published).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          {!comment.approved && (
                            <span style={{
                              fontSize: "0.58rem",
                              fontWeight: "600",
                              backgroundColor: "rgba(225, 29, 72, 0.08)",
                              color: "var(--accent-color)",
                              padding: "1px 5px",
                              borderRadius: "8px",
                              fontFamily: "var(--font-sans)",
                              letterSpacing: "0.02em"
                            }}>
                              Pending approval
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: "0.84rem",
                            lineHeight: "1.48",
                            color: isCurrentThemeDark ? "rgba(255, 255, 255, 0.92)" : "rgba(17, 17, 17, 0.88)",
                            fontFamily: "var(--font-sans)",
                            margin: 0,
                            letterSpacing: "-0.01em",
                            whiteSpace: "pre-line"
                          }}
                          dangerouslySetInnerHTML={{ __html: comment.content }}
                        />

                        {comment.reply && (
                          <div style={{
                            display: "flex",
                            gap: "0.6rem",
                            marginTop: "0.75rem",
                            marginLeft: "0.8rem",
                            padding: "0.55rem 0.8rem",
                            background: isCurrentThemeDark
                              ? "linear-gradient(135deg, rgba(225, 29, 72, 0.14) 0%, rgba(225, 29, 72, 0.05) 100%)"
                              : "linear-gradient(135deg, rgba(225, 29, 72, 0.1) 0%, rgba(225, 29, 72, 0.04) 100%)",
                            backdropFilter: "blur(12px)",
                            WebkitBackdropFilter: "blur(12px)",
                            borderRadius: "8px",
                            border: `1px solid ${isCurrentThemeDark ? "rgba(225, 29, 72, 0.32)" : "rgba(225, 29, 72, 0.22)"}`,
                            borderLeft: "3px solid var(--accent-color)",
                            boxShadow: isCurrentThemeDark
                              ? "inset 0 1px 0 rgba(255, 255, 255, 0.14), inset 0 -1px 0 rgba(255, 255, 255, 0.02), 0 4px 16px -2px rgba(0, 0, 0, 0.2)"
                              : "inset 0 1px 0 rgba(255, 255, 255, 0.7), inset 0 -1px 0 rgba(0, 0, 0, 0.01), 0 4px 12px -2px rgba(225, 29, 72, 0.03)"
                          }}>
                            <div style={{
                              width: "22px",
                              height: "22px",
                              borderRadius: "8px",
                              backgroundImage: "url(/profile.jpg), url(/profile.png)",
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                              border: `1px solid ${isCurrentThemeDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)"}`,
                              flexShrink: 0
                            }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "0.15rem" }}>
                                <span style={{ fontFamily: "var(--font-sans)", fontWeight: "600", fontSize: "0.8rem", color: colors.text }}>SYS</span>
                                <span style={{
                                  fontSize: "0.6rem",
                                  fontWeight: "700",
                                  textTransform: "uppercase",
                                  padding: "1px 5px",
                                  borderRadius: "8px",
                                  fontFamily: "monospace"
                                }}>
                                  SYSTEM
                                </span>
                              </div>
                              <p style={{ margin: 0, fontSize: "0.8rem", lineHeight: "1.45", color: isCurrentThemeDark ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.7)", opacity: 0.95 }}>
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
        </div>

      </article>

      {/* Centering Wrapper Div inside React Portal to completely bypass page transforms and stay fixed at all times */}
      {mounted && typeof window !== "undefined" && createPortal(
        <>
          <div
            style={{
              position: "fixed",
              bottom: "1.5rem",
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
                  gap: isCommenting ? "10px" : "0.5rem",
                  backgroundColor: isCurrentThemeDark
                    ? "#18181b"
                    : "#ffffff",
                  backdropFilter: "blur(24px) saturate(190%)",
                  WebkitBackdropFilter: "blur(24px) saturate(190%)",
                  border: isCurrentThemeDark ? "1px solid rgba(255, 255, 255, 0.14)" : "1px solid rgba(0, 0, 0, 0.08)",
                  borderRadius: isCommenting ? "20px" : "9999px",
                  padding: isCommenting ? "8px 10px 8px 14px" : "0 6px",
                  color: isCurrentThemeDark ? "#ffffff" : "#111111",
                  boxShadow: isCurrentThemeDark
                    ? "0 18px 48px -8px rgba(0, 0, 0, 0.6), 0 8px 24px -4px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)"
                    : "0 16px 36px -4px rgba(0, 0, 0, 0.12), 0 6px 16px -2px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
                  width: isCommenting ? "400px" : "max-content",
                  maxWidth: "92vw",
                  height: isCommenting ? "auto" : "40px",
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
                      key="commenting-inputs"
                      layout
                      initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)", x: 8 }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)", x: 0 }}
                      exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)", x: -8 }}
                      transition={{ type: "spring", stiffness: 550, damping: 26 }}
                      style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0px", minWidth: 0 }}
                    >
                      {/* Left Side: Staggered Inputs */}
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
                        />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="normal-controls"
                      layout
                      initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)", x: -8 }}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)", x: 0 }}
                      exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)", x: 8 }}
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
                          width: "28px",
                          height: "28px",
                          boxSizing: "border-box",
                          borderRadius: "9999px",
                          backgroundColor: isCurrentThemeDark ? "rgba(255, 255, 255, 0.08)" : "#ffffff",
                          color: isCurrentThemeDark ? "#ffffff" : "#111111",
                          border: isCurrentThemeDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)",
                          boxShadow: isCurrentThemeDark ? "0 2px 8px rgba(0, 0, 0, 0.3)" : "0 2px 6px rgba(0, 0, 0, 0.06), inset 0 1px 0 #ffffff",
                          transition: "all 0.2s ease",
                          textDecoration: "none",
                          flexShrink: 0
                        }}
                        className="dock-icon-btn"
                        title="Back to Journal"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m15 18-6-6 6-6" />
                        </svg>
                      </Link>

                      {/* 2. Story / Photos Switcher Capsule */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          height: "30px",
                          boxSizing: "border-box",
                          backgroundColor: isCurrentThemeDark ? "#09090b" : "#f4f1ea",
                          borderRadius: "9999px",
                          padding: "1.5px",
                          border: isCurrentThemeDark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid rgba(0, 0, 0, 0.04)",
                          boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.06)",
                          position: "relative"
                        }}
                      >
                        <button
                          onClick={() => handleSetMode("read")}
                          style={{
                            height: "25px",
                            lineHeight: "25px",
                            padding: "0 12px",
                            borderRadius: "9999px",
                            border: "none",
                            backgroundColor: "transparent",
                            color: mode === "read"
                              ? (isCurrentThemeDark ? "#000000" : "#ffffff")
                              : (isCurrentThemeDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"),
                            fontSize: "0.78rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "color 0.2s ease",
                            position: "relative",
                            zIndex: 2
                          }}
                        >
                          {mode === "read" && (
                            <motion.div
                              layoutId="dock-mode-highlight"
                              style={{
                                position: "absolute",
                                inset: 0,
                                backgroundColor: isCurrentThemeDark ? "#ffffff" : "#111111",
                                borderRadius: "9999px",
                                zIndex: -1,
                                boxShadow: isCurrentThemeDark ? "0 2px 8px rgba(0, 0, 0, 0.4)" : "0 2px 8px rgba(0, 0, 0, 0.2)"
                              }}
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          <span style={{ position: "relative", zIndex: 3 }}>
                            {lang === "ar" ? "القصة" : lang === "zh" ? "故事" : lang === "nl" ? "Verhaal" : "Story"}
                          </span>
                        </button>
                        <button
                          onClick={() => handleSetMode("photos")}
                          style={{
                            height: "25px",
                            lineHeight: "25px",
                            padding: "0 12px",
                            borderRadius: "9999px",
                            border: "none",
                            backgroundColor: "transparent",
                            color: mode === "photos"
                              ? (isCurrentThemeDark ? "#000000" : "#ffffff")
                              : (isCurrentThemeDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"),
                            fontSize: "0.78rem",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "color 0.2s ease",
                            position: "relative",
                            zIndex: 2
                          }}
                        >
                          {mode === "photos" && (
                            <motion.div
                              layoutId="dock-mode-highlight"
                              style={{
                                position: "absolute",
                                inset: 0,
                                backgroundColor: isCurrentThemeDark ? "#ffffff" : "#111111",
                                borderRadius: "9999px",
                                zIndex: -1,
                                boxShadow: isCurrentThemeDark ? "0 2px 8px rgba(0, 0, 0, 0.4)" : "0 2px 8px rgba(0, 0, 0, 0.2)"
                              }}
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          <span style={{ position: "relative", zIndex: 3 }}>
                            {lang === "ar" ? "الصور" : lang === "zh" ? "照片" : lang === "nl" ? "Foto's" : "Photos"}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>



                {/* Symmetrical, Single-Node Dynamic Morphing Button! Lives outside AnimatePresence to guarantee zero latency and absolute physical continuity! */}
                <motion.button
                  layout
                  type="button"
                  onPointerDown={(e) => {
                    if (isCommenting) {
                      e.preventDefault(); // Prevent input blur / keyboard close on iOS
                      if (commentText.trim() && tempName.trim()) {
                        handleSendComment();
                      }
                    }
                  }}
                  onClick={(e) => {
                    if (!isCommenting) {
                      setIsCommenting(true);
                    } else {
                      if (commentText.trim() && tempName.trim()) {
                        handleSendComment();
                      }
                    }
                  }}
                  disabled={isCommenting && (!commentText.trim() || !tempName.trim())}
                  animate={{
                    width: isCommenting ? "26px" : "28px",
                    height: isCommenting ? "26px" : "28px",
                    backgroundColor: isCommenting
                      ? ((commentText.trim() && tempName.trim())
                        ? "#007aff"
                        : (isCurrentThemeDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.06)"))
                      : (isCurrentThemeDark ? "rgba(255, 255, 255, 0.08)" : "#ffffff"),
                    color: isCommenting
                      ? ((commentText.trim() && tempName.trim())
                        ? "#ffffff"
                        : (isCurrentThemeDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.45)"))
                      : (isCurrentThemeDark ? "#ffffff" : "#111111"),
                    border: isCommenting
                      ? "none"
                      : (isCurrentThemeDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)"),
                    boxShadow: isCommenting
                      ? "none"
                      : (isCurrentThemeDark ? "0 2px 8px rgba(0, 0, 0, 0.3)" : "0 2px 6px rgba(0, 0, 0, 0.06), inset 0 1px 0 #ffffff")
                  }}
                  transition={{
                    layout: {
                      type: "spring",
                      stiffness: 320,
                      damping: 20,
                      mass: 0.5
                    },
                    default: { duration: 0.15 }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                    borderRadius: "9999px",
                    cursor: (isCommenting && (!commentText.trim() || !tempName.trim())) ? "default" : "pointer",
                    flexShrink: 0,
                    marginBottom: isCommenting ? "1px" : "0px"
                  }}
                  className={!isCommenting ? "dock-icon-btn" : ""}
                  title={isCommenting ? "Send reply" : "Add a comment"}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isCommenting ? (
                      <motion.svg
                        key="send-icon"
                        initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
                        transition={{ duration: 0.12 }}
                        width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "translateY(-1px)" }}
                      >
                        <line x1="12" y1="19" x2="12" y2="5"></line>
                        <polyline points="5 12 12 5 19 12"></polyline>
                      </motion.svg>
                    ) : (
                      <motion.svg
                        key="comment-icon"
                        initial={{ opacity: 0, rotate: 45, scale: 0.6 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -45, scale: 0.6 }}
                        transition={{ duration: 0.12 }}
                        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <path d="M12 21a9 9 0 1 0-9-9c0 1.48.36 2.89 1 4.15L3 21l4.85-1c1.26.64 2.67 1 4.15 1z" />
                      </motion.svg>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </motion.div>
          </div>

        </>,
        document.body
      )}

      {/* Identity Modal removed per clean design rules */}
    </div>
  );
}
