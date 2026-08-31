"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

function formatDate(iso: string, locale: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractCoverImage(html: string): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!match) return null;
  let url = match[1];
  url = url.replace(/\/s\d+(-c)?\//, "/s1600/").replace(/\/w\d+-h\d+(-c)?\//, "/s1600/");
  url = url.replace(/\/resize:fit:\d+\//, "/resize:fit:1600/");
  return url;
}

function extractAllImages(html: string): string[] {
  if (!html) return [];
  const matches = Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi));
  const urls = matches.map((m) => {
    let url = m[1];
    url = url.replace(/\/s\d+(-c)?\//, "/s1600/").replace(/\/w\d+-h\d+(-c)?\//, "/s1600/");
    url = url.replace(/\/resize:fit:\d+\//, "/resize:fit:1600/");
    return url;
  });
  return urls;
}

function formatBloggerArticleHtml(html: string): string {
  if (!html) return "";
  let clean = html
    .replace(/<div class="separator"[^>]*>[\s\S]*?<\/div>/gi, "")
    .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, "")
    .replace(/<table[^>]*>[\s\S]*?<\/table>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<font[^>]*>/gi, "")
    .replace(/<\/font>/gi, "")
    .replace(/\s*style="[^"]*"/gi, "")
    .replace(/\s*face="[^"]*"/gi, "")
    .replace(/\s*color="[^"]*"/gi, "")
    .replace(/\s*size="[^"]*"/gi, "")
    .replace(/<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/p>/gi, "")
    .replace(/<div[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/div>/gi, "")
    .replace(/(<br\s*\/?>[\s]*){2,}/gi, "<br>")
    .trim();

  // Strip leading empty tags / whitespace
  clean = clean.replace(/^(\s*<br\s*\/?>|\s*&nbsp;|\s*)+/gi, "").trim();

  return clean;
}

function getReadingTime(html: string): number {
  if (!html) return 1;
  const text = html.replace(/<[^>]*>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

function getRelativeTimeString(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - date.getTime());
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 24) {
    return diffHours <= 1 ? "Just now" : `${diffHours} hours ago`;
  }
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? "week" : "weeks"} ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;

  const diffYears = Math.floor(diffDays / 365);
  return `${diffYears} ${diffYears === 1 ? "year" : "years"} ago`;
}

function getPostChapterLabel(post: any, allPosts: any[]): string {
  if (!post) return "CHAPTER 01";
  
  // 1. If title explicitly has Chapter X: e.g. "Chapter 2: ..."
  const titleMatch = post.title?.match(/^(?:chapter|ch\.?)\s*(\d+)[:\s.-]*/i);
  if (titleMatch) {
    return `CHAPTER ${titleMatch[1].padStart(2, "0")}`;
  }

  // 2. Global continuous chronological chapter numbering (earliest is Chapter 01, continuing up through latest Medium posts)
  const idx = allPosts.findIndex((p) => p.id === post.id);
  if (idx !== -1) {
    const chNum = allPosts.length - idx;
    return `CHAPTER ${String(chNum).padStart(2, "0")}`;
  }

  return "CHAPTER 01";
}

function FlippableQACard({ qa, darkTheme = false }: { qa: any; darkTheme?: boolean }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rawAnswer = typeof qa.answer === "string" ? qa.answer.trim() : "";
  const hasAnswer = rawAnswer.length > 0 && rawAnswer.toLowerCase() !== "null" && rawAnswer.toLowerCase() !== "undefined";

  const questionText = qa.content || qa.question || "";
  const senderName = qa.name ? qa.name : qa.author ? qa.author : "ANONYMOUS";
  const initial = senderName.replace(/@/g, "").trim().charAt(0).toUpperCase() || "A";

  // Thoughtful answer fallback matching Ivan's persona if answer is missing
  const answerText = hasAnswer
    ? rawAnswer
    : questionText.toLowerCase().includes("tech") || questionText.toLowerCase().includes("stack")
    ? "I rely on Next.js & React for frontends, Rust (Axum/Tokio) for high-performance microservices, Tailwind/CSS for styling, and Figma for design systems."
    : questionText.toLowerCase().includes("baca") || questionText.toLowerCase().includes("book")
    ? "Some of my favorite foundational reads include 'The Design of Everyday Things' by Don Norman, 'Meditations' by Marcus Aurelius, and works on architecture & minimalism."
    : "Thank you for asking! I approach every project with focus on clean aesthetics, tactile interaction details, high performance, and intuitive design.";

  return (
    <div
      style={{
        perspective: "1200px",
        cursor: "pointer",
        width: "100%",
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%",
          transformStyle: "preserve-3d",
        }}
      >
        {!isFlipped ? (
          /* FRONT SIDE (QUESTION) */
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              background: darkTheme ? "rgba(255, 255, 255, 0.05)" : "#FAFAFA",
              border: darkTheme ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0,0,0,0.08)",
              borderRadius: "20px",
              padding: "1.2rem 1.35rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
              boxSizing: "border-box",
              boxShadow: darkTheme ? "0 8px 30px rgba(0,0,0,0.35)" : "0 4px 14px rgba(0,0,0,0.04)",
              minHeight: "130px",
              justifyContent: "space-between",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #cbf382 0%, #38ef7d 100%)",
                    color: "#0d1203",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.65rem",
                    fontWeight: 800,
                  }}
                >
                  {initial}
                </div>
                <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", color: darkTheme ? "rgba(255,255,255,0.7)" : "#555555" }}>
                  {senderName}
                </span>
              </div>

              <span style={{ fontSize: "0.56rem", fontWeight: 800, letterSpacing: "0.06em", color: darkTheme ? "#FFFFFF" : "#111111", background: darkTheme ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)", padding: "3px 8px", borderRadius: "9999px", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                FLIP ↺
              </span>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
              <span style={{ color: "#cbf382", fontSize: "1.4rem", lineHeight: 1, fontFamily: "Georgia, serif", fontWeight: 900 }}>“</span>
              <p style={{ fontSize: "0.92rem", lineHeight: 1.55, color: darkTheme ? "#FFFFFF" : "#111111", margin: 0, fontWeight: 500 }}>
                {questionText}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.3rem", borderTop: darkTheme ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.04)" }}>
              <span style={{ fontSize: "0.54rem", color: darkTheme ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }}>
                {new Date(qa.published || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span style={{ fontSize: "0.56rem", color: "#cbf382", fontWeight: 700 }}>
                Read Answer →
              </span>
            </div>
          </div>
        ) : (
          /* BACK SIDE (ANSWER) */
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "linear-gradient(160deg, #18191e 0%, #0d0e12 100%)",
              color: "#FFFFFF",
              borderRadius: "20px",
              border: "1px solid rgba(203, 243, 130, 0.35)",
              padding: "1.2rem 1.35rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
              boxSizing: "border-box",
              boxShadow: "0 12px 36px rgba(0,0,0,0.5)",
              minHeight: "130px",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.45rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.1em", color: "#FFFFFF" }}>
                  IVAN AFFRIANDI
                </span>
                <span style={{ color: "#cbf382", fontSize: "0.75rem" }}>✦</span>
              </div>
              <span style={{ fontSize: "0.54rem", fontWeight: 800, letterSpacing: "0.06em", color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.1)", padding: "3px 8px", borderRadius: "9999px" }}>
                BACK ↻
              </span>
            </div>

            <p style={{ fontSize: "0.88rem", lineHeight: 1.6, margin: 0, color: "rgba(255,255,255,0.95)" }}>
              {answerText}
            </p>

            <span style={{ fontSize: "0.54rem", color: "rgba(255,255,255,0.45)", textAlign: "right" }}>
              Answered · {new Date(qa.answeredAt || qa.published || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function DynamicTimeGreeting() {
  const [greetingState, setGreetingState] = useState<{
    tag: string;
    timeStr: string;
  }>({
    tag: "GOOD DAY",
    timeStr: "",
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const timeString = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      let tag = "GOOD MORNING";
      if (hour >= 12 && hour < 17) tag = "GOOD AFTERNOON";
      else if (hour >= 17 && hour < 22) tag = "GOOD EVENING";
      else if (hour >= 22 || hour < 5) tag = "GOOD NIGHT";

      setGreetingState({ tag, timeStr: timeString });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", padding: "0.3rem 0 0.6rem 0" }}>
      {/* GREETING TAG WITH PULSE */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <div
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#8C2A0F",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: "0.95rem",
            fontWeight: 800,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#111111",
            fontFamily: "var(--font-sans)",
          }}
        >
          {greetingState.tag}
        </span>
        {greetingState.timeStr && (
          <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#888888", letterSpacing: "0.06em", fontFamily: "var(--font-sans)" }}>
            · {greetingState.timeStr} LOCAL TIME
          </span>
        )}
      </div>

      {/* FULL EDITORIAL STATEMENT */}
      <h2
        style={{
          fontSize: "clamp(1.25rem, 1.95vw, 1.7rem)",
          fontWeight: 400,
          lineHeight: 1.42,
          color: "#111111",
          margin: 0,
          fontFamily: "var(--font-sans)",
          letterSpacing: "-0.02em",
          maxWidth: "100%",
        }}
      >
        I&apos;m Ivan Affriandi—a <span style={{ fontFamily: "var(--font-serif, Georgia, serif)", fontStyle: "italic", color: "#333333", fontWeight: 500 }}>Full-Stack Web Engineer</span> &amp; <span style={{ fontFamily: "var(--font-serif, Georgia, serif)", fontStyle: "italic", color: "#333333", fontWeight: 500 }}>UI/UX Designer</span> based in Jakarta. I craft high-performance web applications, minimal design systems, 3D architectural renders, and tactile physical desk objects.
      </h2>
    </div>
  );
}

export default function DailyJournalFeed({ posts = [] }: { posts?: any[] }) {
  const locale = "en-US";

  const [viewMode, setViewMode] = useState<"journal" | "about">("journal");
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [selectedIgItem, setSelectedIgItem] = useState<any | null>(null);
  const [heroIndex, setHeroIndex] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const [gridIndices, setGridIndices] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  const [isHoveringIg, setIsHoveringIg] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [isWorksOpen, setIsWorksOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [emailSub, setEmailSub] = useState<string>("");
  const [subSubmitted, setSubSubmitted] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    setHeroIndex(0);
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth <= 860);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const igRowRef = useRef<HTMLDivElement>(null);
  const blogRowRef = useRef<HTMLDivElement>(null);
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-close Works after 5s if idle
  useEffect(() => {
    if (isWorksOpen) {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = setTimeout(() => {
        setIsWorksOpen(false);
      }, 5000);
    }
    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    };
  }, [isWorksOpen]);

  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()),
    [posts]
  );

  // Year filter options formatted YYYY (e.g. "ALL", "2026", "2025")
  const yearFilters = useMemo(() => {
    const years = new Set<string>();
    sortedPosts.forEach((p) => {
      if (!p.published) return;
      const d = new Date(p.published);
      const yyyy = String(d.getFullYear());
      years.add(yyyy);
    });
    return ["ALL", ...Array.from(years)];
  }, [sortedPosts]);

  // Filtered posts incorporating year filter + search query
  const filteredPosts = useMemo(() => {
    return sortedPosts.filter((p) => {
      let yearMatch = true;
      if (activeFilter !== "ALL" && p.published) {
        const d = new Date(p.published);
        const yyyy = String(d.getFullYear());
        yearMatch = yyyy === activeFilter;
      }
      if (!yearMatch) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const titleMatch = p.title?.toLowerCase().includes(q);
      const excerptMatch = stripHtml(p.content || "").toLowerCase().includes(q);
      return titleMatch || excerptMatch;
    });
  }, [sortedPosts, activeFilter, searchQuery]);

  const router = useRouter();
  const selectedPost = selectedPostIndex !== null ? sortedPosts[selectedPostIndex] : null;

  const fallbackHero = "/images/moments/509414434_18067394924098563_6080711151400069719_n..jpg";
  const fallbackBrand = "/images/defining_brand_mono.png";

  const [postPhotoIndex, setPostPhotoIndex] = useState<number>(0);
  const [readerTheme, setReaderTheme] = useState<"light" | "dark">("light");
  const [readerSize, setReaderSize] = useState<"sm" | "md" | "lg">("md");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [mobilePrologueOpen, setMobilePrologueOpen] = useState<boolean>(false);
  const [isReadingPrologue, setIsReadingPrologue] = useState<boolean>(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState<boolean>(false);
  const [headerHidden, setHeaderHidden] = useState<boolean>(false);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (mobileSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus({ preventScroll: true });
    }
  }, [mobileSearchOpen]);

  const selectedPostImages = useMemo(() => {
    if (isReadingPrologue) return ["/nature_hero.png"];
    if (!selectedPost || !selectedPost.content) return [];
    const extracted = extractAllImages(selectedPost.content);
    return extracted.length > 0 ? extracted : [fallbackHero];
  }, [isReadingPrologue, selectedPost, fallbackHero]);

  // Real-time Like state per post
  const [likesMap, setLikesMap] = useState<Record<string, { count: number; hasLiked: boolean }>>({});
  const [isLiking, setIsLiking] = useState<boolean>(false);

  const activePostId = isReadingPrologue ? "prologue" : selectedPost?.id ? String(selectedPost.id) : null;

  useEffect(() => {
    if (!activePostId) return;

    // Instant local cache check
    const localLiked = typeof window !== "undefined" && localStorage.getItem(`post_liked_${activePostId}`) === "true";
    if (localLiked && !likesMap[activePostId]?.hasLiked) {
      setLikesMap((prev) => ({
        ...prev,
        [activePostId]: {
          count: prev[activePostId]?.count || 1,
          hasLiked: true,
        },
      }));
    }

    // Fetch real-time count & status from API
    fetch(`/api/likes?postId=${encodeURIComponent(activePostId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.count === "number") {
          setLikesMap((prev) => ({
            ...prev,
            [activePostId]: {
              count: data.count,
              hasLiked: data.hasLiked || localLiked,
            },
          }));
        }
      })
      .catch((err) => console.error("Error fetching likes:", err));
  }, [activePostId]);

  const handleToggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activePostId || isLiking) return;

    const current = likesMap[activePostId] || { count: 0, hasLiked: false };
    const nextHasLiked = !current.hasLiked;
    const nextCount = Math.max(0, current.count + (nextHasLiked ? 1 : -1));

    // Optimistic UI update
    setLikesMap((prev) => ({
      ...prev,
      [activePostId]: { count: nextCount, hasLiked: nextHasLiked },
    }));

    if (typeof window !== "undefined") {
      if (nextHasLiked) {
        localStorage.setItem(`post_liked_${activePostId}`, "true");
      } else {
        localStorage.removeItem(`post_liked_${activePostId}`);
      }
    }

    setIsLiking(true);
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: activePostId }),
      });
      const data = await res.json();
      if (data && typeof data.count === "number") {
        setLikesMap((prev) => ({
          ...prev,
          [activePostId]: { count: data.count, hasLiked: data.hasLiked },
        }));
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    } finally {
      setIsLiking(false);
    }
  };

  useEffect(() => {
    setPostPhotoIndex(0);
    setReadingProgress(0);
    if (selectedPostIndex !== null || isReadingPrologue) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      const rightCol = document.querySelector(".pj-right");
      if (rightCol) rightCol.scrollTo({ top: 0, left: 0, behavior: "instant" });
      const wrapEl = document.querySelector(".pj-journal-feed-wrap");
      if (wrapEl) wrapEl.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [selectedPostIndex, isReadingPrologue]);

  // Toggle overview vs reader scroll modes on both desktop and mobile
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!selectedPost && !isReadingPrologue) {
      document.body.classList.add("pj-overview-mode");
      document.body.classList.remove("pj-reader-mode");
    } else {
      document.body.classList.remove("pj-overview-mode");
      document.body.classList.add("pj-reader-mode");
    }
    return () => {
      document.body.classList.remove("pj-overview-mode", "pj-reader-mode");
    };
  }, [selectedPost, isReadingPrologue]);

  // Dynamically update mobile browser theme-color (Safari status & navigation bar color)
  useEffect(() => {
    if (typeof document === "undefined") return;

    let targetColor = "#0c0d0e"; // default dark for overview
    if (selectedPost || isReadingPrologue) {
      if (readerTheme === "dark") targetColor = "#0c0d0e";
      else targetColor = "#ffffff";
    }

    let metaTheme = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null;
    if (!metaTheme) {
      metaTheme = document.createElement("meta");
      metaTheme.name = "theme-color";
      document.head.appendChild(metaTheme);
    }
    metaTheme.content = targetColor;

    // Also update body/html background directly for seamless iOS overscroll
    if (!selectedPost && !isReadingPrologue) {
      document.documentElement.style.backgroundColor = "#0c0d0e";
      document.body.style.backgroundColor = "#0c0d0e";
    } else {
      document.documentElement.style.backgroundColor = targetColor;
      document.body.style.backgroundColor = targetColor;
    }
  }, [selectedPost, isReadingPrologue, readerTheme]);

  // Track article reading scroll progress with high performance rAF
  useEffect(() => {
    if (!selectedPost && !isReadingPrologue) {
      setReadingProgress(0);
      return;
    }
    const rightCol = document.querySelector(".pj-right");

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
          const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 1;
          const clientHeight = window.innerHeight || document.documentElement.clientHeight || 1;

          const total = scrollHeight - clientHeight;
          if (total > 0) {
            setReadingProgress(Math.min(100, Math.max(0, (scrollTop / total) * 100)));
          }

          // Hide header on scroll down, reveal on scroll up (mobile reading mode only)
          const isMobile = window.innerWidth <= 860;
          if (isMobile && (selectedPost || isReadingPrologue)) {
            const delta = scrollTop - lastScrollY;
            if (delta > 6 && scrollTop > 80) {
              setHeaderHidden(true);
            } else if (delta < -6) {
              setHeaderHidden(false);
            }
            lastScrollY = scrollTop;
          } else {
            setHeaderHidden(false);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    let lastScrollY = 0;
    if (rightCol) rightCol.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (rightCol) rightCol.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [selectedPost, isReadingPrologue]);

  // Auto-play / cycle post gallery cover photos every 4.5 seconds
  useEffect(() => {
    if (!selectedPost || selectedPostImages.length <= 1) return;

    const timer = setInterval(() => {
      setPostPhotoIndex((prev) => (prev + 1) % selectedPostImages.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [selectedPost, selectedPostImages]);

  const fallbackCovers = useMemo(() => [
    "/images/moments/509414434_18067394924098563_6080711151400069719_n..jpg",
    "/images/moments/539303572_18073420046098563_1129254407547625674_n..webp",
    "/images/moments/598943412_18085107533098563_2022381096122126117_n..webp",
    "/images/moments/489831318_18060819218098563_9042912996466521959_n..jpg",
    "/images/moments/515043142_18068610035098563_4316722369364790783_n..jpg",
    "/images/moments/608079301_18086400239098563_3466106499873906770_n..webp",
  ], []);

  // Preload covers in browser memory to eliminate image flashing/flickering
  useEffect(() => {
    if (typeof window === "undefined") return;
    fallbackCovers.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [fallbackCovers]);

  useEffect(() => {
    if (typeof window === "undefined" || selectedPostImages.length === 0) return;
    selectedPostImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [selectedPostImages]);

  // Flipboard Deck: Card 0 is PROLOGUE by default on desktop, followed by Chapter 04, Chapter 03, etc. (ALL posts included)
  const flipboardCards = useMemo(() => {
    const chapterCards = sortedPosts.map((p, idx) => {
      const extracted = extractCoverImage(p.content);
      const isBadImg = !extracted || extracted.includes("ocean_hero_mono.png");
      const cover = isBadImg ? fallbackCovers[(idx + 1) % fallbackCovers.length] : extracted;
      const chapterLabel = getPostChapterLabel(p, sortedPosts);
      return {
        id: p.id,
        category: chapterLabel,
        date: p.published ? formatDate(p.published, locale) : "ESSAY",
        title: p.title,
        excerpt: stripHtml(p.content || "").slice(0, 135) + "…",
        img: cover,
        post: p,
        isPrologue: false,
        postIndex: idx,
      };
    });

    const prologueCard = {
      id: "prologue",
      category: "INTRO NARRATIVE",
      date: "READING",
      title: "PROLOGUE",
      excerpt: "There is a reason why the world always feels more spacious past three in the morning. The city's restless hum has finally run out of steam, leaving behind a thick silence, the chill of early dew settling in...",
      img: "/nature_hero.png",
      post: null,
      isPrologue: true,
      postIndex: -1,
    };

    if (sortedPosts.length === 0) {
      return [prologueCard];
    }

    // Both desktop and mobile hero deck starts directly with latest chapters, prologue is opened via header button
    return chapterCards;
  }, [sortedPosts, fallbackCovers, locale]);

  // Backward-compatible hero posts for desktop
  const heroPosts = useMemo(() => {
    const limitedPosts = sortedPosts.slice(0, 7);
    const withImg = limitedPosts.filter((p) => extractCoverImage(p.content));
    if (withImg.length === 0)
      return [{ title: "Ivan Affriandi", img: fallbackHero, post: null as any }];
    return withImg.map((p) => ({
      title: p.title,
      img: extractCoverImage(p.content)!,
      post: p,
    }));
  }, [sortedPosts, fallbackHero]);

  const currentFlipCard = flipboardCards[heroIndex % flipboardCards.length];
  const currentHero = heroPosts[heroIndex % heroPosts.length];

  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const mobileScrollRef = React.useRef<HTMLDivElement>(null);

  const handleHeroTouchStart = (e: React.TouchEvent) => {
    setTouchStartPos({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleNextHero = useCallback(() => {
    setSlideDirection(1);
    setHeroIndex((prev) => (prev < flipboardCards.length - 1 ? prev + 1 : 0));
  }, [flipboardCards.length]);

  const handlePrevHero = useCallback(() => {
    setSlideDirection(-1);
    setHeroIndex((prev) => (prev > 0 ? prev - 1 : flipboardCards.length - 1));
  }, [flipboardCards.length]);

  const handleHeroTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos) return;
    const diffX = touchStartPos.x - e.changedTouches[0].clientX;
    const diffY = touchStartPos.y - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > 40 || Math.abs(diffY) > 40) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
          handleNextHero();
        } else {
          handlePrevHero();
        }
      }
    }
    setTouchStartPos(null);
  };

  // Instagram gallery state
  const [igMedia, setIgMedia] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/instagram")
      .then((r) => r.json())
      .then((data) => {
        if (data.media && data.media.length > 0) {
          setIgMedia(data.media);
        }
      })
      .catch(() => {});
  }, []);

  // Format Instagram items
  const instagramItems = useMemo(() => {
    if (igMedia.length > 0) {
      return igMedia.map((m: any) => ({
        id: m.id,
        img: m.media_type === "VIDEO" ? m.thumbnail_url : m.media_url,
        title: m.caption ? m.caption.split("\n")[0].slice(0, 80) : "Instagram Photo",
        caption: m.caption || "",
        date: m.timestamp,
        permalink: m.permalink,
        rawIg: m,
      }));
    }
    return sortedPosts.map((p, idx) => ({
      id: p.id,
      img: extractCoverImage(p.content) || (idx % 2 === 0 ? fallbackHero : fallbackBrand),
      title: p.title,
      caption: stripHtml(p.content).slice(0, 150),
      date: p.published,
      permalink: null as string | null,
      rawIg: null,
    }));
  }, [igMedia, sortedPosts]);

  // Static fixed 3x3 grid indices matching latest updated posts (no auto-cycling)
  useEffect(() => {
    setGridIndices([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  }, [instagramItems.length]);

  // Q&A POPUP MODAL STATE & HANDLERS
  const [isQAModalOpen, setIsQAModalOpen] = useState(false);
  const [qaList, setQaList] = useState<any[]>([]);
  const [loadingQA, setLoadingQA] = useState(false);
  const [expandedQAId, setExpandedQAId] = useState<string | null>(null);

  // NEWSLETTER SUBSCRIPTION STATE
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [newsletterMsg, setNewsletterMsg] = useState("");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) return;
    setIsSubscribing(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "subscribe", email: newsletterEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setSubscribed(true);
        setNewsletterMsg("Thank you for subscribing to my quiet journal!");
        setNewsletterEmail("");
      } else {
        setNewsletterMsg(data.error || "Subscription failed");
      }
    } catch {
      setNewsletterMsg("Subscription failed");
    } finally {
      setIsSubscribing(false);
    }
  };

  const [senderName, setSenderName] = useState("");
  const [qaContent, setQaContent] = useState("");
  const [isSubmittingQA, setIsSubmittingQA] = useState(false);
  const [qaErrorMsg, setQaErrorMsg] = useState("");
  const [qaToast, setQaToast] = useState(false);
  const [showAskForm, setShowAskForm] = useState(false);

  // Fetch answered Q&As when modal opens
  useEffect(() => {
    if (!isQAModalOpen) return;
    setLoadingQA(true);
    fetch(`/api/questions?answered=true&t=${Date.now()}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setQaList(data);
      })
      .catch(() => {})
      .finally(() => setLoadingQA(false));
  }, [isQAModalOpen]);

  const sortedQAs = useMemo(() => {
    return [...qaList]
      .filter((q) => q.answer && typeof q.answer === "string" && q.answer.trim().length > 0)
      .sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
  }, [qaList]);

  const [mobileQATab, setMobileQATab] = useState<"browse" | "ask">("browse");
  const [mobileQACategory, setMobileQACategory] = useState<string>("all");
  const [mobileQASearch, setMobileQASearch] = useState<string>("" );

  const filteredMobileQAs = useMemo(() => {
    return sortedQAs.filter((qa) => {
      const qText = (qa.content || qa.question || "");
      const aText = (qa.answer || "");
      const fullText = (qText + " " + aText + " " + (qa.name || "")).toLowerCase();

      // Category matching
      if (mobileQACategory !== "all") {
        if (mobileQACategory === "tech" && !(fullText.includes("tech") || fullText.includes("stack") || fullText.includes("coding") || fullText.includes("rust") || fullText.includes("next") || fullText.includes("react") || fullText.includes("code"))) return false;
        if (mobileQACategory === "design" && !(fullText.includes("design") || fullText.includes("ui") || fullText.includes("ux") || fullText.includes("3d") || fullText.includes("render") || fullText.includes("studio") || fullText.includes("object"))) return false;
        if (mobileQACategory === "philosophy" && !(fullText.includes("buku") || fullText.includes("book") || fullText.includes("baca") || fullText.includes("mind") || fullText.includes("perspektif") || fullText.includes("pikiran") || fullText.includes("filsafat") || fullText.includes("philosophy"))) return false;
        if (mobileQACategory === "personal" && (fullText.includes("tech") || fullText.includes("design") || fullText.includes("buku") || fullText.includes("book") || fullText.includes("philosophy"))) return false;
      }

      // Search matching
      if (mobileQASearch.trim()) {
        const q = mobileQASearch.toLowerCase().trim();
        return fullText.includes(q);
      }

      return true;
    });
  }, [sortedQAs, mobileQACategory, mobileQASearch]);

  const leftColQA = useMemo(() => sortedQAs.filter((_, i) => i % 2 === 0), [sortedQAs]);
  const rightColQA = useMemo(() => sortedQAs.filter((_, i) => i % 2 === 1), [sortedQAs]);

  // Listen for open-qa-modal custom event & URL params
  useEffect(() => {
    const handleOpenQA = () => setIsQAModalOpen(true);
    window.addEventListener("open-qa-modal", handleOpenQA);

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("qa") === "true") {
        setIsQAModalOpen(true);
      }
    }
    return () => window.removeEventListener("open-qa-modal", handleOpenQA);
  }, []);

  const handleQASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaContent.trim()) return;
    setIsSubmittingQA(true);
    setQaErrorMsg("");
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: qaContent, name: senderName }),
      });
      if (!res.ok) throw new Error("Failed to send question");
      setQaContent("");
      setSenderName("");
      setQaToast(true);
      setTimeout(() => setQaToast(false), 4000);
    } catch (err: any) {
      setQaErrorMsg(err.message || "Failed to send question");
    } finally {
      setIsSubmittingQA(false);
    }
  };

  // Auto-scroll horizontal Instagram carousel continuously
  useEffect(() => {
    if (isHoveringIg) return;
    const interval = setInterval(() => {
      if (igRowRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = igRowRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          igRowRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          igRowRef.current.scrollBy({ left: 160, behavior: "smooth" });
        }
      }
    }, 3200);
    return () => clearInterval(interval);
  }, [isHoveringIg]);

  // Keyboard navigation for desktop: Left/Right arrows to flip deck, Escape to return to deck
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;
      if (isQAModalOpen || mobileSearchOpen || selectedIgItem) return;

      if (!selectedPost && !isReadingPrologue) {
        if (e.key === "ArrowLeft") {
          handlePrevHero();
        } else if (e.key === "ArrowRight") {
          handleNextHero();
        }
      } else if (selectedPost || isReadingPrologue) {
        if (e.key === "Escape") {
          setIsReadingPrologue(false);
          setSelectedPostIndex(null);
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPost, isReadingPrologue, flipboardCards, isQAModalOpen, mobileSearchOpen, selectedIgItem]);

  // Works items list
  const worksList = [
    {
      name: "SHUEN STUDIO",
      url: "https://shuenstudio.com",
      desc: "Architectural & Interior Visualization Studio",
    },
    {
      name: "KVR OBJECTS",
      url: "https://kvr-objects.com",
      desc: "Minimal Industrial Hardware & Tactile Objects",
    },
    {
      name: "EQUILIBRIUMIANS",
      url: "https://equilibriumians.com",
      desc: "Editorial Culture & Design Collective",
    },
  ];

  return (
    <>
      <style>{`
        /* ── UNIVERSAL ZERO-SCROLLBAR SYSTEM ── */
        *, *::before, *::after {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
          background: transparent !important;
        }

        /* ─────────────────────────────────────────────────────
           ROOT & LAYOUT SYSTEM (UNIFIED IMMERSIVE CARD DECK & CENTERED READER)
        ───────────────────────────────────────────────────── */
        .pj-root {
          display: flex;
          flex-direction: column;
          width: 100%;
          min-height: 100vh;
          box-sizing: border-box;
          background: var(--bg-color, #FAFAFA);
          color: var(--text-primary, #111111);
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        }

        .pj-root:not(.has-selected-post) {
          position: fixed;
          inset: 0;
          height: 100vh;
          height: 100dvh;
          width: 100vw;
          overflow: hidden;
          padding: 0;
          margin: 0;
          background: #0c0d0e;
        }

        .pj-root.has-selected-post {
          display: block;
          position: relative;
          width: 100%;
          max-width: 100vw;
          height: auto;
          min-height: 100vh;
          overflow: visible;
          background: var(--bg-color, #FFFFFF);
        }

        /* ─────────────────────────────────────────────────────
           HERO CARD DECK (OVERVIEW) & TOP COVER HEADER (READER MODE)
        ───────────────────────────────────────────────────── */
        .pj-left {
          position: relative;
          width: 100vw;
          max-width: 100vw;
          height: 100vh;
          height: 100dvh;
          margin: 0;
          border-radius: 0;
          border: none;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: none;
          background: #0c0d0e;
          transition: height 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .pj-root.has-selected-post .pj-left {
          height: 38vh;
          height: 38dvh;
          min-height: 260px;
          max-height: 440px;
          border-radius: 0;
          box-shadow: none;
        }

        .pj-photo-layer {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: opacity 0.8s ease;
        }

        .pj-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.45) 0%,
            rgba(0, 0, 0, 0.15) 35%,
            rgba(0, 0, 0, 0.92) 100%
          );
          z-index: 2;
          pointer-events: none;
        }

        /* ABOUT MODE ONLY: FULL-HEIGHT 3-COL 1:1 SQUARE GRID */
        .pj-about-ig-grid {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100vh;
          z-index: 10;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, 1fr);
          gap: 2px;
          background: #000000;
          padding: 2px;
          overflow: hidden;
          box-sizing: border-box;
        }

        .pj-about-ig-cell {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #000000;
        }

        .pj-left-content {
          position: absolute;
          inset: 0;
          width: 100vw;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 3.5rem clamp(1.5rem, 5vw, 4rem) calc(env(safe-area-inset-bottom, 24px) + 26px);
          box-sizing: border-box;
          z-index: 10;
        }

        .pj-root.has-selected-post .pj-left-content {
          padding: 1.5rem clamp(1.5rem, 5vw, 4rem) 1.25rem;
        }

        .pj-title {
          font-size: clamp(1.8rem, 4vw, 3rem);
          font-weight: 800;
          line-height: 1.18;
          letter-spacing: -0.03em;
          color: #ffffff;
          margin: 0.35rem 0 0.5rem 0;
          text-shadow: 0 2px 16px rgba(0,0,0,0.8);
          max-width: 800px;
          word-break: break-word;
        }

        .pj-root.has-selected-post .pj-title {
          font-size: clamp(1.2rem, 3vw, 1.85rem);
          line-height: 1.22;
          margin: 0.25rem 0 0 0;
          max-width: 1000px;
          word-break: break-word;
        }

        .pj-excerpt {
          font-size: clamp(0.88rem, 1.2vw, 1.02rem);
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.85);
          margin: 0 0 0.85rem 0;
          max-width: 680px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-shadow: 0 1px 8px rgba(0,0,0,0.65);
          word-break: break-word;
        }

        .pj-read-btn {
          position: absolute;
          bottom: 2.5rem;
          right: 1.75rem;
          z-index: 4;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.35);
          padding: 0.4rem 0.95rem;
          border-radius: 2px;
          cursor: pointer;
          transition: background 0.25s ease, transform 0.25s ease;
          backdrop-filter: blur(8px);
        }
        .pj-read-btn:hover {
          background: rgba(255, 255, 255, 0.22);
          transform: translateY(-1px);
        }

        .pj-dots {
          display: flex;
          gap: 6px;
          margin-top: 1rem;
        }
        .pj-dot {
          height: 2px;
          width: 18px;
          background: rgba(255, 255, 255, 0.28);
          border-radius: 2px;
          cursor: pointer;
          transition: background 0.3s ease, width 0.3s ease;
        }
        .pj-dot.active {
          background: rgba(255, 255, 255, 0.9);
          width: 30px;
        }

        /* ─────────────────────────────────────────────────────
           READER COLUMN: SINGLE-COLUMN CENTERED EDITORIAL LAYOUT
        ───────────────────────────────────────────────────── */
        .pj-right,
        .pj-right.fit-screen,
        .pj-root:not(.has-selected-post) .pj-right {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          max-height: 0 !important;
          overflow: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }

        .pj-root.has-selected-post .pj-right {
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
          pointer-events: auto !important;
          position: relative !important;
          top: auto !important;
          left: auto !important;
          right: auto !important;
          width: 100% !important;
          max-width: 780px !important;
          margin: 0 auto !important;
          max-height: none !important;
          height: auto !important;
          min-height: auto !important;
          border-radius: 0 !important;
          overflow: visible !important;
          box-sizing: border-box !important;
          z-index: 1 !important;
          padding: 2.2rem 1.5rem calc(env(safe-area-inset-bottom, 24px) + 80px) !important;
          box-shadow: none !important;
          background: var(--bg-color, #FFFFFF);
          color: var(--text-primary, #111111);
        }

        /* EDITORIAL THEME OVERRIDES FOR HOMEPAGE RIGHT FEED (EXPLICIT HIGH CONTRAST INK) */
        .pj-right.fit-screen {
          background: #FAF8F5 !important;
          color: #111111 !important;
        }

        .pj-right.fit-screen .right-page-title,
        .pj-right.fit-screen .about-bio-headline,
        .pj-right.fit-screen .about-work-title,
        .pj-right.fit-screen .about-card-value,
        .pj-right.fit-screen .blog-card-title,
        .pj-right.fit-screen .prologue-nav-btn {
          color: #111111 !important;
        }

        .pj-right.fit-screen .section-label-header,
        .pj-right.fit-screen .section-label-sm,
        .pj-right.fit-screen .mini-spec-title,
        .pj-right.fit-screen .about-card-label,
        .pj-right.fit-screen .imessage-sender-tag,
        .pj-right.fit-screen .about-story-text,
        .pj-right.fit-screen .about-work-desc,
        .pj-right.fit-screen .blog-card-excerpt,
        .pj-right.fit-screen .blog-card-meta {
          color: #555555 !important;
        }

        .pj-right .right-page-header {
          border-bottom: none;
          border-bottom-color: transparent;
        }

        .pj-right .blog-tabs-header,
        .pj-right .prologue-nav-bar {
          border-bottom-color: rgba(0, 0, 0, 0.08) !important;
          border-top-color: rgba(0, 0, 0, 0.08) !important;
        }

        .pj-right.fit-screen .novel-page-card {
          background: #FFFFFF !important;
          border: 1px solid rgba(0, 0, 0, 0.06) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02) !important;
        }

        .pj-right.fit-screen .novel-intro-paragraph {
          color: #222222 !important;
        }

        .pj-right.fit-screen .imessage-bubble-incoming {
          background: #EAEAEA !important;
          color: #111111 !important;
          border: 1px solid rgba(0, 0, 0, 0.06) !important;
        }
        .pj-right.fit-screen .imessage-bubble-incoming * {
          color: #111111 !important;
        }

        .pj-right.fit-screen .imessage-bubble-outgoing {
          background: #111111 !important;
          color: #FFFFFF !important;
        }
        .pj-right.fit-screen .imessage-bubble-outgoing * {
          color: #FFFFFF !important;
        }

        .pj-right.fit-screen .blog-tab-item {
          color: #777777 !important;
        }

        .pj-right.fit-screen .blog-tab-item:hover,
        .pj-right.fit-screen .blog-tab-item.active {
          color: #111111 !important;
          background: rgba(0, 0, 0, 0.06) !important;
        }

        .pj-right.fit-screen .blog-grid-card {
          background: #FFFFFF !important;
          border: 1px solid rgba(0, 0, 0, 0.06) !important;
        }

        .pj-right.fit-screen .blog-grid-card .blog-card-title {
          color: #111111 !important;
        }

        .pj-right.fit-screen .blog-grid-card .blog-card-excerpt,
        .pj-right.fit-screen .blog-grid-card .blog-card-meta {
          color: #666666 !important;
        }

        .pj-right .search-pill-container {
          background: #EFEFEF !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
        }

        .pj-right .search-pill-input {
          color: #111111 !important;
        }

        .pj-right .search-pill-input::placeholder {
          color: rgba(0, 0, 0, 0.45) !important;
        }

        .pj-right .action-pill-btn {
          background: #111111 !important;
          color: #FFFFFF !important;
        }

        .pj-right .about-pill-item,
        .pj-right .about-pill-item-sm,
        .pj-right .about-card-item {
          background: rgba(0, 0, 0, 0.04) !important;
          color: #111111 !important;
        }

        /* HIDE ALL SCROLLBAR INDICATORS ENTIRELY */
        .pj-right::-webkit-scrollbar,
        .ig-neat-row::-webkit-scrollbar,
        .blog-horizontal-row::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        .pj-right,
        .ig-neat-row,
        .blog-horizontal-row {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }

        /* ── CLEAN COMPACT PAGE HEADER ── */
        .right-page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          border-bottom: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
          padding-bottom: 0.5rem;
        }

        .right-page-title {
          font-size: clamp(1.6rem, 2vw, 2rem);
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--text-primary, #111111);
          margin: 0;
          line-height: 1;
        }

        /* ── RICH & CASUAL ABOUT ME STORYTELLING PAGE ── */
        .about-rich-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          width: 100%;
          padding: 0.25rem 0;
          transition: opacity 0.35s ease;
        }

        .about-profile-row {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .about-profile-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          object-fit: cover;
          filter: grayscale(100%) contrast(1.15) !important;
          -webkit-filter: grayscale(100%) contrast(1.15) !important;
          flex-shrink: 0;
        }

        .about-bio-headline {
          font-size: 1.15rem;
          font-weight: 600;
          line-height: 1.35;
          letter-spacing: -0.015em;
          color: var(--text-primary, #111111);
          margin: 0 0 0.25rem 0;
        }

        .about-story-text {
          font-size: 0.88rem;
          line-height: 1.75;
          color: var(--text-secondary, #444444);
          margin: 0;
        }

        .about-grid-cards {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.85rem;
        }

        .about-card-item {
          padding: 0.85rem 1rem;
          background: var(--bg-secondary, rgba(0, 0, 0, 0.035));
          border-radius: 5px;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }

        .about-card-label {
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-muted, #888888);
        }

        .about-card-value {
          font-size: 0.8rem;
          font-weight: 600;
          line-height: 1.4;
          color: var(--text-primary, #111111);
        }

        /* ── SECTION 1: INSTAGRAM MOMENTS ── */
        .ig-neat-carousel-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          width: 100%;
        }

        .section-label-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--text-muted, #888888);
          margin: 0;
        }

        .ig-neat-row {
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          padding: 0.1rem 0 0.25rem 0;
          box-sizing: border-box;
        }

        .ig-neat-card {
          scroll-snap-align: start;
          flex-shrink: 0;
          width: 120px;
          height: 155px;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          position: relative;
          background: #000000;
          border: none !important;
          box-shadow: none !important;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .ig-neat-card:hover {
          transform: translateY(-2px);
        }

        /* GUARANTEED 100% PURE MONOCHROME BLACK & WHITE IN SAFARI WEBKIT */
        .ig-b-w-container {
          position: relative;
          width: 100%;
          height: 100%;
          background: #000000;
          overflow: hidden;
          border: none !important;
        }

        .ig-b-w-container::after {
          content: "";
          position: absolute;
          inset: 0;
          background: #000000;
          mix-blend-mode: color;
          pointer-events: none;
        }

        .ig-b-w-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          filter: grayscale(100%) contrast(1.18) brightness(0.96) !important;
          -webkit-filter: grayscale(100%) contrast(1.18) brightness(0.96) !important;
          transition: filter 0.4s ease, transform 0.4s ease, opacity 0.6s ease;
        }

        .ig-neat-card:hover .ig-b-w-img {
          transform: scale(1.035);
        }

        /* ── COMPACT ACTION BUTTONS (HEIGHT 30px) ── */
        .action-toolbar-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          width: 100%;
        }

        .social-action-row {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-shrink: 0;
        }

        .action-pill-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 30px;
          padding: 0 0.85rem;
          border-radius: 15px;
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #FFFFFF !important;
          background: #111111 !important;
          text-decoration: none;
          border: none !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12) !important;
          cursor: pointer;
          box-sizing: border-box;
          transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
          flex-shrink: 0;
        }

        .action-pill-btn:hover,
        .action-pill-btn.active {
          background: #000000 !important;
          color: #FFFFFF !important;
          transform: translateY(-1px);
        }

        .action-icon-pill {
          width: 30px;
          padding: 0;
          color: #FFFFFF !important;
        }

        .works-inline-container {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        /* SEARCH PILLBAR (ADAPTIVE THEMED PILL STYLE) */
        .search-pill-container {
          display: flex;
          align-items: center;
          height: 30px;
          border-radius: 15px;
          background: var(--bg-secondary, rgba(0, 0, 0, 0.05));
          border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
          padding: 0 0.65rem;
          box-sizing: border-box;
          transition: width 0.28s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease, border-color 0.2s ease;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        .search-pill-container.compact {
          width: 30px;
          padding: 0;
          justify-content: center;
        }

        .search-pill-container.expanded {
          width: 155px;
        }

        .search-pill-input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 0.66rem;
          color: var(--text-primary, #111111);
          width: 100%;
          margin-left: 0.35rem;
          font-family: inherit;
        }

        .search-pill-input::placeholder {
          color: var(--text-muted, rgba(0, 0, 0, 0.45));
          font-size: 0.62rem;
          letter-spacing: 0.04em;
        }

        @media (prefers-color-scheme: dark) {
          .search-pill-container {
            background: rgba(255, 255, 255, 0.08) !important;
            border-color: rgba(255, 255, 255, 0.14) !important;
          }
          .search-pill-input {
            color: #FFFFFF !important;
          }
          .search-pill-input::placeholder {
            color: rgba(255, 255, 255, 0.45) !important;
          }
        }
        [data-theme="dark"] .search-pill-container,
        .dark .search-pill-container {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.14) !important;
        }
        [data-theme="dark"] .search-pill-input,
        .dark .search-pill-input {
          color: #FFFFFF !important;
        }
        [data-theme="dark"] .search-pill-input::placeholder,
        .dark .search-pill-input::placeholder {
          color: rgba(255, 255, 255, 0.45) !important;
        }

        /* ── SECTION 2: HORIZONTAL BLOG POSTS WITH MM/YY FILTERS ── */
        .blog-section-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          width: 100%;
        }

        .blog-tabs-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
          padding-bottom: 0.4rem;
          gap: 0.6rem;
        }

        .blog-tabs-list {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          overflow-x: auto;
          scrollbar-width: none !important;
        }

        .blog-tabs-list::-webkit-scrollbar { display: none !important; }

        .blog-tab-item {
          font-size: 0.58rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 0.2rem 0.5rem;
          border-radius: 3px;
          cursor: pointer;
          background: transparent;
          color: var(--text-muted, #888888);
          border: none !important;
          transition: all 0.2s ease;
        }

        .blog-tab-item:hover {
          color: var(--text-primary, #111111);
        }

        .blog-tab-item.active {
          color: var(--text-primary, #111111);
          background: var(--bg-secondary, rgba(0, 0, 0, 0.08));
        }

        /* ── PAGINATED PROLOGUE CARD & CONTROLS ── */
        .novel-page-card {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
          background: var(--bg-secondary, rgba(0, 0, 0, 0.025));
          border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.06));
          border-radius: 16px;
          padding: 1.6rem 1.8rem;
          margin-top: 0.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          position: relative;
          box-sizing: border-box;
          min-height: 280px;
          justify-content: space-between;
        }

        .prologue-nav-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
          padding-top: 0.85rem;
          margin-top: 0.85rem;
          width: 100%;
        }

        .prologue-nav-btn {
          background: transparent;
          border: none;
          color: var(--text-primary, #111111);
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          padding: 0.35rem 0.75rem;
          border-radius: 12px;
          transition: all 0.2s ease;
          font-family: var(--font-sans, -apple-system, sans-serif);
        }

        .prologue-nav-btn:hover:not(:disabled) {
          background: var(--bg-secondary, rgba(0, 0, 0, 0.07));
        }

        .prologue-nav-btn:disabled {
          opacity: 0.25;
          cursor: not-allowed;
        }

        .prologue-dots-wrap {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .prologue-dot-item {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.2);
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .prologue-dot-item.active {
          width: 18px;
          border-radius: 4px;
          background: #111111;
        }

        /* ── iOS iMESSAGE CHAT BUBBLES (BLACK & WHITE MONOCHROME) ── */
        .imessage-chat-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin: 0.5rem 0;
          width: 100%;
        }

        .imessage-row-incoming {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.25rem;
          width: 100%;
        }

        .imessage-row-outgoing {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
          width: 100%;
        }

        .imessage-sender-tag {
          font-size: 0.56rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--text-muted, #888888);
          text-transform: uppercase;
          font-family: var(--font-sans, -apple-system, sans-serif);
        }

        .imessage-bubble-incoming {
          background: #EAEAEA;
          color: #111111;
          padding: 0.75rem 1.1rem;
          border-radius: 18px 18px 18px 4px;
          max-width: 85%;
          font-size: 0.88rem;
          line-height: 1.48;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif);
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }

        .imessage-bubble-outgoing {
          background: #111113 !important;
          color: #FFFFFF !important;
          padding: 0.8rem 1.15rem;
          border-radius: 18px 18px 4px 18px;
          max-width: 88%;
          font-size: 0.88rem;
          line-height: 1.5;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        .imessage-bubble-outgoing,
        .imessage-bubble-outgoing * {
          color: #FFFFFF !important;
        }

        /* ── BLOG MODAL CONTENT BODY & INLINE IMAGES & DROP CAP ── */
        .blog-modal-content-body {
          font-size: 0.94rem;
          line-height: 1.8;
          color: var(--text-secondary, #333333);
          word-break: break-word;
        }

        /* ── EDITORIAL NOVEL ARTICLE READER (CLEAN, SIMPLE, 100% UNIFORM TYPOGRAPHY) ── */
        .novel-article-reader {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          font-size: 1.05rem !important;
          line-height: 1.85 !important;
          letter-spacing: -0.012em !important;
          word-break: break-word !important;
          text-align: left !important;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .novel-article-reader p,
        .novel-article-reader div,
        .novel-article-reader span,
        .novel-article-reader li {
          font-family: inherit !important;
          font-size: 1.05rem !important;
          line-height: 1.85 !important;
          letter-spacing: -0.012em !important;
        }

        .novel-article-reader p {
          margin: 0 0 1.45rem 0 !important;
          padding: 0 !important;
        }

        .novel-article-reader span,
        .novel-article-reader b,
        .novel-article-reader strong,
        .novel-article-reader i,
        .novel-article-reader em,
        .novel-article-reader a {
          margin-bottom: 0 !important;
          display: inline !important;
        }

        .novel-article-reader b,
        .novel-article-reader strong,
        .novel-article-reader b *,
        .novel-article-reader strong * {
          font-weight: 700 !important;
          font-size: 100% !important;
        }

        .novel-article-reader i,
        .novel-article-reader em,
        .novel-article-reader i *,
        .novel-article-reader em * {
          font-style: italic !important;
          font-size: 100% !important;
        }

        .novel-article-reader b i,
        .novel-article-reader strong em,
        .novel-article-reader i b,
        .novel-article-reader em strong {
          font-weight: 700 !important;
          font-style: italic !important;
          font-size: 100% !important;
        }


        /* ── READING THEMES (PAPER, LIGHT, DARK) WITH RIGID CONTRAST RULES ── */
        .pj-right.theme-paper {
          background: #FAF7F0 !important;
          color: #2B2824 !important;
        }
        .pj-right.theme-paper .novel-article-reader,
        .pj-right.theme-paper .novel-article-reader *,
        .pj-right.theme-paper .article-reader-chapter-title-desktop h1 {
          color: #2B2824 !important;
        }

        .pj-right.theme-light {
          background: #FFFFFF !important;
          color: #111111 !important;
        }
        .pj-right.theme-light .novel-article-reader,
        .pj-right.theme-light .novel-article-reader *,
        .pj-right.theme-light .article-reader-chapter-title-desktop h1 {
          color: #111111 !important;
        }

        .pj-right.theme-dark {
          background: #121316 !important;
          color: #EDEDF0 !important;
        }
        .pj-right.theme-dark .novel-article-reader,
        .pj-right.theme-dark .novel-article-reader *,
        .pj-right.theme-dark .article-reader-chapter-title-desktop h1 {
          color: #EDEDF0 !important;
        }

        /* ── EXPLICIT HIGH CONTRAST CHAT BUBBLES FOR ALL THEMES ── */
        .novel-article-reader .imessage-bubble-incoming {
          background: #E8E8EC !important;
          border: 1px solid rgba(0,0,0,0.06) !important;
          border-radius: 16px 16px 16px 4px !important;
          padding: 0.75rem 1.1rem !important;
          font-size: 0.92rem !important;
          line-height: 1.5 !important;
          max-width: 86% !important;
        }
        .novel-article-reader .imessage-bubble-incoming,
        .novel-article-reader .imessage-bubble-incoming * {
          color: #111111 !important;
        }

        .imessage-bubble-outgoing,
        .imessage-bubble-outgoing *,
        .novel-article-reader .imessage-bubble-outgoing,
        .novel-article-reader .imessage-bubble-outgoing *,
        .pj-right.theme-light .novel-article-reader .imessage-bubble-outgoing,
        .pj-right.theme-light .novel-article-reader .imessage-bubble-outgoing *,
        .pj-right.theme-paper .novel-article-reader .imessage-bubble-outgoing,
        .pj-right.theme-paper .novel-article-reader .imessage-bubble-outgoing *,
        .pj-right.theme-dark .novel-article-reader .imessage-bubble-outgoing,
        .pj-right.theme-dark .novel-article-reader .imessage-bubble-outgoing *,
        .mobile-reader-modal .imessage-bubble-outgoing,
        .mobile-reader-modal .imessage-bubble-outgoing * {
          color: #FFFFFF !important;
          background: #111113 !important;
        }

        .novel-article-reader .imessage-bubble-outgoing {
          border: 1px solid transparent !important;
          border-radius: 16px 16px 4px 16px !important;
          padding: 0.75rem 1.1rem !important;
          font-size: 0.92rem !important;
          line-height: 1.5 !important;
          max-width: 88% !important;
        }
        .pj-right.theme-dark .imessage-sender-tag {
          color: rgba(255, 255, 255, 0.6) !important;
        }

        .novel-article-reader blockquote {
          border-left: 2.5px solid var(--text-primary, #111111);
          margin: 2.2rem 0;
          padding: 0.6rem 0 0.6rem 1.4rem;
          font-style: italic;
          opacity: 0.92;
          font-size: 1.14em;
          line-height: 1.75;
          background: var(--bg-secondary, rgba(125,125,125,0.03));
          border-radius: 0 8px 8px 0;
        }

        .novel-article-reader h2,
        .novel-article-reader h3,
        .novel-article-reader h4 {
          font-family: var(--font-sans, -apple-system, sans-serif);
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary, #111111);
          margin: 2.5rem 0 1rem 0;
          line-height: 1.35;
        }

        .novel-article-reader a {
          color: var(--text-primary, #111111);
          text-decoration: underline;
          text-underline-offset: 4px;
          transition: opacity 0.2s ease;
        }

        .novel-article-reader a:hover {
          opacity: 0.7;
        }

        .novel-article-reader p:empty,
        .novel-article-reader div:empty,
        .novel-article-reader span:empty {
          display: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .novel-article-reader br + br {
          display: none !important;
        }

        .blog-modal-content-body img {
          display: block !important;
          max-width: 100% !important;
          width: 100% !important;
          height: auto !important;
          max-height: 480px !important;
          object-fit: cover !important;
          border-radius: 12px !important;
          margin: 1.5rem 0 !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08) !important;
          border: 1px solid rgba(0, 0, 0, 0.06) !important;
        }

        /* ── DESKTOP CHAPTERS – HORIZONTAL SCROLL ROW (FILLS FULL WIDTH) ── */
        .blog-grid-layout {
          display: flex;
          flex-direction: row;
          overflow-x: auto;
          overflow-y: visible;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          gap: 0;
          width: 100%;
          padding: 0.25rem 0 0.5rem 0;
          box-sizing: border-box;
          margin: 0;
        }

        .blog-grid-layout::-webkit-scrollbar {
          display: none;
        }

        .blog-grid-card {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          flex: 0 0 auto;
          width: calc(33.333% - 0.01px);
          min-width: 200px;
          scroll-snap-align: start;
          cursor: pointer;
          border-radius: 0;
          padding: 0.55rem 0.65rem;
          border: none;
          border-right: 1px solid var(--border-subtle, rgba(0,0,0,0.07));
          background: var(--card-bg-1, #FFFFFF);
          box-shadow: none;
          transition: background 0.18s ease;
          box-sizing: border-box;
        }

        .blog-grid-card:last-child {
          border-right: none;
        }

        .blog-grid-card:hover {
          background: var(--bg-hover, rgba(0,0,0,0.025));
        }

        .blog-card-thumb-wrap {
          width: 100%;
          height: 110px;
          flex-shrink: 0;
          border-radius: 4px;
          overflow: hidden;
          background: #111111;
          border: none !important;
          box-shadow: none !important;
          position: relative;
        }

        /* 100% PURE MONOCHROME BLACK & WHITE THUMBNAIL */
        .blog-b-w-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          filter: grayscale(100%) contrast(1.12) brightness(0.96) !important;
          -webkit-filter: grayscale(100%) contrast(1.12) brightness(0.96) !important;
          transition: filter 0.45s ease, transform 0.45s ease;
        }

        .blog-grid-card:hover .blog-b-w-img {
          transform: scale(1.04);
        }

        .blog-card-date {
          font-size: 0.52rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted, #888888);
        }

        .blog-card-title {
          font-size: 0.82rem;
          font-weight: 700;
          line-height: 1.28;
          letter-spacing: -0.015em;
          color: var(--text-primary, #111111);
          margin: 0.08rem 0 0 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: opacity 0.2s ease;
        }

        .blog-grid-card:hover .blog-card-title {
          opacity: 0.75;
        }

        .blog-card-excerpt {
          font-size: 0.68rem;
          line-height: 1.38;
          color: var(--text-secondary, #666666);
          margin: 0.2rem 0 0 0;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif);
          font-style: normal;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ── RICH NOVEL PROLOGUE / INTRO WITH LITERARY DROP CAP ── */
        .novel-intro-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          width: 100%;
          padding: 0.75rem 0 0.95rem;
          border-bottom: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
        }

        .novel-intro-content {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .novel-intro-2col {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 1.8rem;
          align-items: flex-start;
          width: 100%;
          margin-top: 0.25rem;
        }

        @media (max-width: 860px) {
          .novel-intro-2col {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        .novel-intro-paragraph {
          font-size: 0.86rem;
          line-height: 1.68;
          color: var(--text-secondary, #333333);
          font-family: var(--font-serif, Georgia, serif);
          margin: 0;
          word-break: break-word;
        }

        /* ── PROLOGUE DROP-CAP (FIRST LETTER ONLY, NEVER IN BLOG POSTS) ── */
        .novel-prologue-drop {
          font-family: Georgia, serif;
          font-size: 3.2rem;
          font-weight: 700;
          line-height: 0.8;
          float: left;
          margin-right: 0.5rem;
          margin-top: 0.1rem;
          text-transform: uppercase;
          color: var(--text-primary, #111111);
          display: block;
        }

        /* ── ULTRA-AESTHETIC EDITORIAL ABOUT PAGE ── */
        .about-profile-hero-card {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
          border-radius: 14px;
          padding: 1.6rem 1.75rem;
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.035);
        }

        .about-hero-avatar {
          width: 82px;
          height: 82px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--border-subtle, rgba(0, 0, 0, 0.12));
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
        }

        .about-hero-text {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .about-hero-pill-tag {
          font-size: 0.56rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--text-muted, #888888);
        }

        .about-hero-name {
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary, #111111);
          margin: 0;
        }

        .about-hero-bio {
          font-size: 0.88rem;
          line-height: 1.65;
          color: var(--text-secondary, #444444);
          font-family: var(--font-serif, Georgia, serif);
          margin: 0;
        }

        .about-grid-3cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.85rem;
          width: 100%;
        }

        @media (max-width: 900px) {
          .about-grid-3cards {
            grid-template-columns: 1fr;
          }
        }

        .about-grid-card {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
          border-radius: 12px;
          padding: 1.25rem 1.3rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.025);
        }

        .about-grid-card-label {
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-muted, #888888);
        }

        .about-grid-card-content {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .about-pill-item {
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--text-primary, #111111);
          background: var(--bg-secondary, rgba(0, 0, 0, 0.04));
          padding: 0.3rem 0.65rem;
          border-radius: 6px;
          width: fit-content;
        }

        .about-pill-item-sm {
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--text-primary, #111111);
          background: var(--bg-secondary, rgba(0, 0, 0, 0.04));
          padding: 0.25rem 0.55rem;
          border-radius: 6px;
        }

        .about-grid-card-specs {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
        }

        .about-mini-spec {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .mini-spec-title {
          font-size: 0.54rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--text-muted, #888888);
        }

        .mini-spec-val {
          font-size: 0.76rem;
          font-weight: 600;
          color: var(--text-primary, #111111);
        }

        .about-works-grid {
          display: grid;
          grid-template-columns: repeat(1, 1fr);
          gap: 0.75rem;
          width: 100%;
        }

        .about-work-card-rich {
          background: #FFFFFF;
          border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
          border-radius: 12px;
          padding: 1.2rem 1.4rem;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          text-decoration: none;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.025);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .about-work-card-rich:hover {
          transform: translateY(-3px);
          border-color: rgba(0, 0, 0, 0.2);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);
        }

        .about-work-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .about-work-title {
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          color: var(--text-primary, #111111);
          display: block;
        }

        .about-work-desc {
          font-size: 0.78rem;
          color: var(--text-muted, #777777);
          margin-top: 0.2rem;
          display: block;
        }

        .about-work-arrow-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-secondary, rgba(0, 0, 0, 0.04));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          color: var(--text-primary, #111111);
          transition: background 0.2s ease, color 0.2s ease;
        }

        .about-work-card-rich:hover .about-work-arrow-circle {
          background: #111111;
          color: #FFFFFF;
        }

        /* ── MODALS ── */
        .modal-bg {
          position: fixed;
          inset: 0;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          background: rgba(0, 0, 0, 0.82);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          margin: 0;
          box-sizing: border-box;
        }

        /* ── ZERO-FLICKER SPOTLIGHT OVERLAY ── */
        .spotlight-search-overlay {
          position: fixed;
          inset: 0;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 99999;
          background: rgba(0, 0, 0, 0.78);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: calc(env(safe-area-inset-top, 0px) + 14px);
          box-sizing: border-box;
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity 0.15s ease, visibility 0.15s ease;
        }

        .spotlight-search-overlay.is-open {
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        .spotlight-search-card {
          width: calc(100% - 1.5rem);
          max-width: 460px;
          max-height: min(80vh, 520px);
          display: flex;
          flex-direction: column;
          background: #18181b;
          color: #FFFFFF;
          padding: 0.65rem 0.75rem 0.45rem;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 2px 8px rgba(0,0,0,0.5);
          box-sizing: border-box;
          overflow: hidden;
          transform: translateY(-6px);
          transition: transform 0.15s ease;
        }

        .spotlight-search-overlay.is-open .spotlight-search-card {
          transform: translateY(0);
        }

        .modal-inner {
          width: 100%;
          max-width: 1040px;
          height: 84vh;
          background: var(--bg-color, #FFFFFF);
          color: var(--text-primary, #111111);
          border-radius: 8px;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.45);
        }

        @media (max-width: 760px) {
          .modal-inner {
            grid-template-columns: 1fr;
            height: 90vh;
            overflow-y: auto;
          }
        }

        .modal-photo {
          background-size: cover;
          background-position: center;
          min-height: 260px;
        }

        .modal-body {
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          box-sizing: border-box;
        }

        .modal-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted, #888888);
          border-bottom: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
          padding-bottom: 0.85rem;
          margin-bottom: 1.75rem;
        }

        .modal-close {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-secondary, #555555);
          display: flex;
          align-items: center;
          padding: 4px;
          transition: color 0.2s ease;
        }
        .modal-close:hover { color: var(--text-primary, #111111); }

        /* ── UNIFIED NAVBAR & CONTROLS ── */
        .desktop-prologue-wrap {
          display: none !important;
        }
        .mobile-overview-footer {
          display: none;
        }
        .mobile-reader-footer {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-muted, #888888);
          padding: 1.5rem 1rem calc(env(safe-area-inset-bottom, 20px) + 1.2rem) 1rem;
          margin-top: 1rem;
          box-sizing: border-box;
        }
        .mobile-blog-header {
          display: flex !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 100 !important;
          padding: calc(env(safe-area-inset-top, 0px) + 1.1rem) clamp(1.25rem, 4vw, 3rem) 1rem !important;
          align-items: center !important;
          justify-content: space-between !important;
          background: transparent !important;
          border: none !important;
          pointer-events: none !important;
          transform: translateY(0) !important;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease !important;
          opacity: 1 !important;
        }
        .mobile-blog-header.header-hidden {
          transform: translateY(-110%) !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        .mobile-blog-header > * {
          pointer-events: auto !important;
        }
        .mobile-home-btn {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 0.35rem !important;
          height: 30px !important;
          min-height: 30px !important;
          box-sizing: border-box !important;
          background: #1c1c1e !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          color: #FFFFFF !important;
          font-size: 0.62rem !important;
          font-weight: 700 !important;
          letter-spacing: 0.06em !important;
          text-transform: uppercase !important;
          padding: 0 0.75rem !important;
          border-radius: 9999px !important;
          text-decoration: none !important;
          box-shadow: none !important;
          line-height: 1 !important;
          cursor: pointer !important;
          touch-action: manipulation !important;
          -webkit-tap-highlight-color: transparent !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          z-index: 100 !important;
          position: relative !important;
          transition: background 0.15s ease, border-color 0.15s ease !important;
        }
        .mobile-home-btn:hover {
          background: #2c2c2e !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }
        .mobile-home-btn:active {
          background: #111112 !important;
        }
        .mobile-prologue-btn {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 0.35rem !important;
          height: 30px !important;
          min-height: 30px !important;
          box-sizing: border-box !important;
          background: #1c1c1e !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          color: #FFFFFF !important;
          font-size: 0.62rem !important;
          font-weight: 700 !important;
          letter-spacing: 0.06em !important;
          padding: 0 0.75rem !important;
          border-radius: 9999px !important;
          touch-action: manipulation !important;
          -webkit-tap-highlight-color: transparent !important;
          text-transform: uppercase !important;
          box-shadow: none !important;
          cursor: pointer !important;
          transition: background 0.15s ease, border-color 0.15s ease !important;
        }
        .mobile-prologue-btn:hover {
          background: #2c2c2e !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }
        .mobile-prologue-btn:active {
          background: #111112 !important;
        }
        .mobile-search-btn {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 30px !important;
          height: 30px !important;
          min-width: 30px !important;
          min-height: 30px !important;
          box-sizing: border-box !important;
          background: #1c1c1e !important;
          border: 1px solid rgba(255, 255, 255, 0.15) !important;
          color: #FFFFFF !important;
          padding: 0 !important;
          border-radius: 50% !important;
          text-decoration: none !important;
          box-shadow: none !important;
          cursor: pointer !important;
          line-height: 1 !important;
          touch-action: manipulation !important;
          -webkit-tap-highlight-color: transparent !important;
          transition: background 0.15s ease, border-color 0.15s ease !important;
        }
        .mobile-search-btn:hover {
          background: #2c2c2e !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
        }
        .mobile-search-btn:active {
          background: #111112 !important;
        }
        .reader-back-btn-desktop,
        .article-reader-chapter-title-desktop {
          display: none !important;
        }
        .prologue-mobile-accordion-btn {
          display: none;
        }
        .prologue-mobile-body {
          display: block;
        }

        /* ─────────────────────────────────────────────────
           ELITE HIGH-TECH MOBILE LAYOUT — below 860px
           (ZERO EFFECT ON DESKTOP)
           ───────────────────────────────────────────────── */
        @media (max-width: 860px) {
          .desktop-prologue-wrap {
            display: none !important;
          }
          .mobile-reader-footer {
            display: flex !important;
            justify-content: center;
            align-items: center;
            width: 100%;
            font-size: 0.58rem;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--text-muted, #888888);
            padding: 0.45rem 1rem calc(env(safe-area-inset-bottom, 20px) + 1.2rem) 1rem !important;
            margin-top: 0.25rem !important;
            box-sizing: border-box !important;
          }
          /* ── MOBILE TRANSPARENT TOP HEADER (STICKY FLOATING NAVBAR) ── */
          .mobile-blog-header {
            display: flex !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 100 !important;
            padding: calc(env(safe-area-inset-top, 0px) + 0.65rem) 0.85rem 0.65rem 0.85rem !important;
            align-items: center !important;
            justify-content: space-between !important;
            background: transparent !important;
            border: none !important;
            pointer-events: none !important;
            transform: translateY(0) !important;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease !important;
            opacity: 1 !important;
          }
          .mobile-blog-header.header-hidden {
            transform: translateY(-110%) !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }

          .mobile-blog-header > * {
            pointer-events: auto !important;
          }

          .mobile-home-btn {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 0.3rem !important;
            height: 29px !important;
            min-height: 29px !important;
            box-sizing: border-box !important;
            background: #1c1c1e !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            color: #FFFFFF !important;
            font-size: 0.60rem !important;
            font-weight: 700 !important;
            letter-spacing: 0.06em !important;
            text-transform: uppercase !important;
            padding: 0 0.7rem !important;
            border-radius: 9999px !important;
            text-decoration: none !important;
            box-shadow: none !important;
            line-height: 1 !important;
            cursor: pointer !important;
            touch-action: manipulation !important;
            -webkit-tap-highlight-color: transparent !important;
            user-select: none !important;
            -webkit-user-select: none !important;
            z-index: 100 !important;
            position: relative !important;
            transition: background 0.15s ease !important;
          }

          .mobile-home-btn:active {
            background: #111112 !important;
          }

          .mobile-prologue-btn {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 0.3rem !important;
            height: 29px !important;
            min-height: 29px !important;
            box-sizing: border-box !important;
            background: #1c1c1e !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            color: #FFFFFF !important;
            font-size: 0.60rem !important;
            font-weight: 700 !important;
            letter-spacing: 0.06em !important;
            padding: 0 0.7rem !important;
            border-radius: 9999px !important;
            touch-action: manipulation !important;
            -webkit-tap-highlight-color: transparent !important;
            text-transform: uppercase !important;
            box-shadow: none !important;
            cursor: pointer !important;
            transition: background 0.15s ease !important;
          }

          .mobile-prologue-btn:active {
            background: #111112 !important;
          }

          .mobile-search-btn {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 29px !important;
            height: 29px !important;
            min-width: 29px !important;
            min-height: 29px !important;
            box-sizing: border-box !important;
            background: #1c1c1e !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            color: #FFFFFF !important;
            padding: 0 !important;
            border-radius: 50% !important;
            text-decoration: none !important;
            box-shadow: none !important;
            cursor: pointer !important;
            line-height: 1 !important;
            touch-action: manipulation !important;
            -webkit-tap-highlight-color: transparent !important;
            transition: background 0.15s ease !important;
          }

          .mobile-search-btn:active {
            background: #111112 !important;
          }

          .mobile-search-scroll-container,
          .mobile-qa-scroll-container {
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }
          .mobile-search-scroll-container::-webkit-scrollbar,
          .mobile-qa-scroll-container::-webkit-scrollbar {
            display: none !important;
            width: 0 !important;
            height: 0 !important;
          }

          /* ── HIDE THUMBNAIL POSTS CAROUSEL, OTHER CHAPTERS, INLINE BACK BUTTON & DUPLICATE ARTICLE HEADER ON MOBILE ── */
          .blog-section-wrap,
          .other-chapters-row,
          .reader-back-btn-desktop,
          .article-reader-chapter-title-desktop {
            display: none !important;
          }

          /* ── HIDE IG AND EMAIL BUTTONS & DUPLICATE SEARCH ON MOBILE ── */
          .right-page-header .action-icon-pill,
          .right-page-header .search-pill-container {
            display: none !important;
          }

          /* ── PROLOGUE ACCORDION ON MOBILE ── */
          .prologue-mobile-accordion-btn {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
            background: var(--bg-secondary, rgba(0, 0, 0, 0.04)) !important;
            border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08)) !important;
            border-radius: 12px !important;
            padding: 0.75rem 1rem !important;
            color: var(--text-primary, #111111) !important;
            font-size: 0.72rem !important;
            font-weight: 800 !important;
            letter-spacing: 0.1em !important;
            text-transform: uppercase !important;
            cursor: pointer !important;
            margin-bottom: 0.5rem !important;
          }

          .prologue-mobile-body.collapsed {
            display: none !important;
          }

          .prologue-mobile-body.open {
            display: block !important;
          }

          html, body {
            background-color: #0c0d0e !important;
          }

          body.pj-overview-mode {
            overflow: hidden !important;
            touch-action: pan-x !important;
            overscroll-behavior-y: none !important;
          }

          body.pj-reader-mode {
            overflow-x: visible !important;
            overflow-y: visible !important;
            background-color: var(--bg-color, #FFFFFF) !important;
            height: auto !important;
            min-height: 100% !important;
            -webkit-overflow-scrolling: touch !important;
          }

          /* ── ROOT LAYOUT (IMMERSIVE LOCKED CARD DECK ON MOBILE OVERVIEW) ── */
          .pj-root:not(.has-selected-post) {
            display: flex !important;
            flex-direction: column !important;
            position: fixed !important;
            inset: 0 !important;
            height: 100% !important;
            height: 100vh !important;
            height: -webkit-fill-available !important;
            height: 100dvh !important;
            width: 100vw !important;
            overflow: hidden !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #0c0d0e !important;
            touch-action: pan-x !important;
            overscroll-behavior: none !important;
          }

          /* When reading an article or prologue, allow full native document scrolling */
          .pj-root.has-selected-post {
            display: block !important;
            position: relative !important;
            width: 100% !important;
            max-width: 100vw !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            background: var(--bg-color, #FFFFFF) !important;
          }

          /* ── HERO PHOTO FEATURED CARD (BLEEDS FULL SCREEN BEHIND BROWSER TOOLBAR) ── */
          .pj-left {
            position: relative !important;
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100% !important;
            height: 100vh !important;
            height: -webkit-fill-available !important;
            height: 100dvh !important;
            margin: 0 !important;
            border-radius: 0 !important;
            border: none !important;
            overflow: hidden !important;
            flex-shrink: 0 !important;
            box-shadow: none !important;
            transition: height 0.45s cubic-bezier(0.16, 1, 0.3, 1), transform 0.45s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }

          /* When article reader is open on mobile, shrink cover with smooth transition */
          .pj-root.has-selected-post .pj-left {
            height: 38vh !important;
            height: 38dvh !important;
            min-height: 240px !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }

          /* ── EDITORIAL CONTENT FEED: 100% HIDDEN IN OVERVIEW ON MOBILE, VISIBLE ONLY WHEN READING ── */
          .pj-right,
          .pj-right.fit-screen,
          .pj-root:not(.has-selected-post) .pj-right {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            max-height: 0 !important;
            overflow: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }

          .pj-root.has-selected-post .pj-right {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            position: relative !important;
            top: auto !important;
            left: auto !important;
            right: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            max-height: none !important;
            height: auto !important;
            min-height: auto !important;
            border-radius: 0 !important;
            overflow: visible !important;
            box-sizing: border-box !important;
            z-index: 1 !important;
            padding: 1.8rem 1.25rem calc(env(safe-area-inset-bottom, 24px) + 80px) !important;
            box-shadow: none !important;
          }

          .pj-about-ig-grid { left: 0; height: 100%; }

          /* ── HERO TEXT INSIDE LEFT PANEL (NATURALLY RESTING RIGHT ABOVE MOBILE NAVIGATION BAR) ── */
          .pj-left-content {
            position: absolute !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-end !important;
            padding: 3.5rem 1.35rem calc(env(safe-area-inset-bottom, 24px) + 26px) 1.35rem !important;
            box-sizing: border-box !important;
            z-index: 10 !important;
          }

          .pj-hero-arrows {
            bottom: calc(env(safe-area-inset-bottom, 24px) + 26px) !important;
            right: 1.25rem !important;
          }

          .pj-root.has-selected-post .pj-left-content {
            padding: 1.5rem 6.2rem 1.25rem 1.25rem !important;
          }

          /* Ensure reader navbar button doesn't float over article text */
          .pj-root.has-selected-post .mobile-blog-header {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
          }

          .pj-title {
            font-size: clamp(1.65rem, 6.8vw, 2.35rem) !important;
            line-height: 1.15 !important;
            font-weight: 800 !important;
            letter-spacing: -0.035em !important;
            margin: 0.35rem 0 0.5rem 0 !important;
            text-shadow: 0 2px 14px rgba(0,0,0,0.6) !important;
            max-width: 84% !important;
            word-break: break-word !important;
          }

          .pj-root.has-selected-post .pj-title {
            font-size: clamp(1.15rem, 4.8vw, 1.4rem) !important;
            line-height: 1.25 !important;
            margin: 0.25rem 0 0 0 !important;
            max-width: 100% !important;
            word-break: break-word !important;
          }

          .pj-excerpt {
            font-size: 0.88rem !important;
            line-height: 1.5 !important;
            color: rgba(255, 255, 255, 0.84) !important;
            margin: 0 0 0.85rem 0 !important;
            max-width: 82% !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 3 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
            text-shadow: 0 1px 8px rgba(0,0,0,0.6) !important;
          }

          .pj-title {
            font-size: clamp(1.65rem, 6.8vw, 2.35rem) !important;
            line-height: 1.15 !important;
            font-weight: 800 !important;
            letter-spacing: -0.035em !important;
            margin: 0.35rem 0 0.5rem 0 !important;
            text-shadow: 0 2px 14px rgba(0,0,0,0.6) !important;
          }

          .pj-root.has-selected-post .pj-title {
            font-size: clamp(1.2rem, 5vw, 1.45rem) !important;
            line-height: 1.2 !important;
            margin: 0.25rem 0 0 0 !important;
          }

          .pj-excerpt {
            font-size: 0.88rem !important;
            line-height: 1.5 !important;
            color: rgba(255, 255, 255, 0.84) !important;
            margin: 0 0 0.65rem 0 !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 3 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
            text-shadow: 0 1px 8px rgba(0,0,0,0.6) !important;
          }

          /* ── PAGE HEADER ── */
          .right-page-header {
            padding: 0 0 0.85rem 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            gap: 0.6rem !important;
            border-bottom: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.06)) !important;
          }

          .right-page-title {
            font-size: 1.5rem !important;
            font-weight: 800 !important;
            letter-spacing: -0.03em !important;
          }

          .search-pill-container {
            max-width: 140px !important;
            padding: 0.35rem 0.65rem !important;
            background: var(--bg-secondary, rgba(0, 0, 0, 0.04)) !important;
            border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08)) !important;
          }

          .search-pill-input {
            font-size: 0.72rem !important;
          }

          /* ── PROLOGUE SECTION ── */
          .novel-intro-wrap {
            padding: 0.95rem 0 1.25rem !important;
            border-bottom: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08)) !important;
          }

          .novel-intro-2col {
            display: flex !important;
            flex-direction: column !important;
            gap: 1.25rem !important;
          }

          .novel-intro-paragraph {
            font-size: 0.95rem !important;
            line-height: 1.75 !important;
            color: var(--text-primary) !important;
          }

          /* ── iMESSAGE BUBBLES ── */
          .imessage-bubble-incoming {
            background: var(--bg-secondary, rgba(0, 0, 0, 0.05)) !important;
            color: var(--text-primary) !important;
            font-size: 0.85rem !important;
            line-height: 1.45 !important;
            max-width: 90% !important;
            border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08)) !important;
            border-radius: 16px !important;
            padding: 0.75rem 1rem !important;
          }

          .imessage-bubble-outgoing {
            background: #111113 !important;
            color: #FFFFFF !important;
            font-size: 0.85rem !important;
            line-height: 1.45 !important;
            max-width: 90% !important;
            border-radius: 18px 18px 4px 18px !important;
            padding: 0.75rem 1rem !important;
          }
          .imessage-bubble-outgoing,
          .imessage-bubble-outgoing * {
            color: #FFFFFF !important;
          }

          /* ── CHAPTERS HORIZONTAL SNAP CAROUSEL ON MOBILE ── */
          .blog-carousel-track-container {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            scroll-snap-type: x mandatory !important;
            padding-bottom: 0.75rem !important;
            scrollbar-width: none !important;
          }
          .blog-carousel-track-container::-webkit-scrollbar {
            display: none !important;
          }

          .blog-carousel-track {
            display: flex !important;
            flex-wrap: nowrap !important;
            gap: 0.85rem !important;
            width: max-content !important;
          }

          .blog-grid-card {
            width: 220px !important;
            min-width: 220px !important;
            max-width: 220px !important;
            flex-shrink: 0 !important;
            scroll-snap-align: start !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 0.65rem !important;
            background: var(--card-bg-1, rgba(125,125,125,0.05)) !important;
            border: 1px solid var(--border-subtle, rgba(125,125,125,0.12)) !important;
            border-radius: 14px !important;
            padding: 0.75rem !important;
            box-sizing: border-box !important;
          }

          .blog-card-thumb-wrap {
            width: 100% !important;
            height: 120px !important;
            border-radius: 9px !important;
            overflow: hidden !important;
          }

          .blog-card-title {
            color: var(--text-primary) !important;
            font-size: 0.88rem !important;
            font-weight: 700 !important;
            line-height: 1.3 !important;
          }

          .blog-card-excerpt {
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
            font-size: 0.7rem !important;
            line-height: 1.4 !important;
          }

          /* ── READER ARTICLE ON MOBILE ── */
          .novel-article-reader {
            font-size: 1.05rem !important;
            line-height: 1.85 !important;
            padding: 0 !important;
            padding-bottom: calc(env(safe-area-inset-bottom) + 100px) !important;
          }

          .novel-article-reader p {
            margin-bottom: 1.3rem !important;
          }

          /* ── FULL-SCREEN BOTTOM SHEET MODAL ON MOBILE ── */
          .modal-bg {
            align-items: flex-end !important;
            padding: 0 !important;
          }

          .modal-inner {
            grid-template-columns: 1fr !important;
            width: 100vw !important;
            max-width: 100vw !important;
            height: 92vh !important;
            height: 92dvh !important;
            border-radius: 24px 24px 0 0 !important;
            margin: 0 !important;
            overflow-y: auto !important;
          }

          .modal-photo {
            min-height: 260px !important;
            max-height: 45vw !important;
          }

          .modal-body {
            padding: 1.5rem 1.25rem 3rem !important;
            background: var(--bg-color, #FFFFFF);
          }
        }

        /* ── MOBILE CONTAINER & DARK BRUTALIST THEME ── */
        .mobile-construction-wrapper {
          display: none !important;
        }
      `}</style>

      <div className={`pj-root${selectedPost || isReadingPrologue ? " has-selected-post" : ""}`} ref={mobileScrollRef}>
        {/* ── FULLSCREEN HERO CARD DECK ── */}
        <div
          className="pj-left"
          onTouchStart={handleHeroTouchStart}
          onTouchEnd={handleHeroTouchEnd}
          style={{ position: "relative", overflow: "hidden", background: "#0c0d0e" }}
        >
          {/* MOBILE TRANSPARENT TOP HEADER BAR (STICKY FLOATING NAVBAR) */}
          <div className={`mobile-blog-header${headerHidden ? " header-hidden" : ""}`}>
            {/* Left: HOME Button (Overview) or iOS-style JOURNAL Back Button (Reader mode) */}
            {selectedPost || isReadingPrologue ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  window.scrollTo({ top: 0, behavior: "instant" });
                  setIsReadingPrologue(false);
                  setSelectedPostIndex(null);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  window.scrollTo({ top: 0, behavior: "instant" });
                  setIsReadingPrologue(false);
                  setSelectedPostIndex(null);
                }}
                className="mobile-home-btn"
                title="Back to Journal Deck"
                style={{ cursor: "pointer", touchAction: "manipulation" }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span>JOURNAL</span>
              </button>
            ) : (
              <a
                href="https://ivanaffriandi.com"
                title="Return to Homepage"
                className="mobile-home-btn"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>HOME</span>
              </a>
            )}

            {/* Right: Prologue Button (hidden when displaying post/prologue content) + Search Icon Button */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              {!selectedPost && !isReadingPrologue && (
                <button
                  type="button"
                  onClick={() => {
                    setIsReadingPrologue(true);
                    setSelectedPostIndex(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="mobile-prologue-btn"
                  title="Read Prologue"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  <span>PROLOGUE</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setMobileSearchOpen(true)}
                className="mobile-search-btn"
                title="Search Stories & Chapters"
                aria-label="Search"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
            </div>
          </div>

          {/* ── UNIFIED PHYSICAL HARDWARE-ACCELERATED CAROUSEL TRACK (ZERO-FLICKER / ZERO-GLITCH) ── */}
          {isReadingPrologue || selectedPost ? (
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                overflow: "hidden",
                zIndex: 1,
              }}
            >
              {/* Opened Article Static Photo Layer */}
              <div
                className="pj-photo-layer"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  zIndex: 1,
                  overflow: "hidden",
                  background: "#0c0d0e",
                }}
              >
                <img
                  src={isReadingPrologue ? "/nature_hero.png" : selectedPostImages[postPhotoIndex % selectedPostImages.length]}
                  alt={isReadingPrologue ? "Prologue" : selectedPost ? selectedPost.title : "Hero"}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    display: "block",
                  }}
                />
              </div>

              {/* Cinematic Vignette Gradient Overlay */}
              <div
                className="pj-overlay"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.92) 100%)",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              />

              {/* Opened Article Title & Meta Overlay */}
              <div
                className="pj-left-content"
                style={{
                  zIndex: 3,
                  cursor: "default",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.5rem", flexWrap: "nowrap" }}>
                  <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.8)", fontFamily: "var(--font-sans)" }}>
                    {isReadingPrologue
                      ? "INTRO NARRATIVE"
                      : (selectedPost ? getPostChapterLabel(selectedPost, sortedPosts) : "ESSAY")}
                  </span>
                  {selectedPost && selectedPost.published && (
                    <>
                      <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "0.65rem" }}>·</span>
                      <span style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.65)" }}>
                        {formatDate(selectedPost.published, locale)}
                      </span>
                    </>
                  )}
                </div>

                <h1
                  className="pj-title"
                  style={{
                    fontSize: isReadingPrologue ? "2.3rem" : undefined,
                    fontWeight: isReadingPrologue ? 750 : 600,
                    letterSpacing: isReadingPrologue ? "-0.03em" : "-0.02em",
                    textTransform: isReadingPrologue ? "uppercase" : "none",
                  }}
                >
                  {isReadingPrologue
                    ? "PROLOGUE"
                    : selectedPost
                    ? selectedPost.title
                    : currentFlipCard.title}
                </h1>

                {/* Photo gallery dots when article is open */}
                {selectedPost && selectedPostImages.length > 1 && (
                  <div className="pj-dots" style={{ marginTop: "1.4rem" }}>
                    {selectedPostImages.map((_, i) => (
                      <div
                        key={i}
                        className={`pj-dot${i === (postPhotoIndex % selectedPostImages.length) ? " active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPostPhotoIndex(i);
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Continuous Track containing all cards in DOM - 100% immune to flickers/glitches */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  background: "#0c0d0e",
                  zIndex: 1,
                }}
              >
                <motion.div
                  animate={{ x: `-${(heroIndex % flipboardCards.length) * 100}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 280,
                    damping: 28,
                    mass: 0.8,
                  }}
                  style={{
                    display: "flex",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  {flipboardCards.map((card, idx) => (
                    <div
                      key={card.id || idx}
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                        flexShrink: 0,
                        overflow: "hidden",
                        cursor: "pointer",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (card.isPrologue) {
                          setIsReadingPrologue(true);
                          setSelectedPostIndex(null);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        } else if (card.post) {
                          setIsReadingPrologue(false);
                          const pIdx = sortedPosts.findIndex((p) => p.id === card.post.id);
                          if (pIdx !== -1) {
                            setSelectedPostIndex(pIdx);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }
                        }
                      }}
                    >
                      {/* Cover Photo */}
                      <img
                        src={card.img}
                        alt={card.title}
                        loading={idx < 3 ? "eager" : "lazy"}
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                          display: "block",
                        }}
                      />

                      {/* Cinematic Vignette Gradient */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.92) 100%)",
                          pointerEvents: "none",
                        }}
                      />

                      {/* Title & Metadata */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "flex-end",
                          padding: "3.5rem clamp(1.5rem, 5vw, 4rem) calc(env(safe-area-inset-bottom, 24px) + 56px)",
                          boxSizing: "border-box",
                          pointerEvents: "none",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.5rem", flexWrap: "nowrap" }}>
                          <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.8)", fontFamily: "var(--font-sans)" }}>
                            {card.isPrologue ? "INTRO NARRATIVE" : card.category}
                          </span>
                          {card.date && !card.isPrologue && (
                            <>
                              <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "0.65rem" }}>·</span>
                              <span style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.65)" }}>
                                {card.date}
                              </span>
                            </>
                          )}
                        </div>

                        <h1
                          className="pj-title"
                          style={{
                            fontSize: card.isPrologue ? "2.3rem" : undefined,
                            fontWeight: card.isPrologue ? 750 : 600,
                            letterSpacing: card.isPrologue ? "-0.03em" : "-0.02em",
                            textTransform: card.isPrologue ? "uppercase" : "none",
                          }}
                        >
                          {card.title}
                        </h1>

                        <p className="pj-excerpt">
                          {card.excerpt}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Dots indicator for flipboard overview mode */}
              {flipboardCards.length > 1 && (
                <div
                  className="pj-dots"
                  style={{
                    position: "absolute",
                    bottom: "calc(env(safe-area-inset-bottom, 24px) + 24px)",
                    left: "clamp(1.5rem, 5vw, 4rem)",
                    zIndex: 40,
                    margin: 0,
                  }}
                >
                  {(() => {
                    const total = flipboardCards.length;
                    if (total <= 5) {
                      return flipboardCards.map((_, i) => (
                        <div
                          key={i}
                          className={`pj-dot${i === (heroIndex % total) ? " active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSlideDirection(i > heroIndex ? 1 : -1);
                            setHeroIndex(i);
                          }}
                        />
                      ));
                    }
                    const current = heroIndex % total;
                    let start = Math.max(0, current - 2);
                    let end = start + 5;
                    if (end > total) {
                      end = total;
                      start = Math.max(0, end - 5);
                    }
                    const visibleDots = [];
                    for (let i = start; i < end; i++) {
                      visibleDots.push(
                        <div
                          key={i}
                          className={`pj-dot${i === current ? " active" : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSlideDirection(i > heroIndex ? 1 : -1);
                            setHeroIndex(i);
                          }}
                        />
                      );
                    }
                    return visibleDots;
                  })()}
                </div>
              )}
            </>
          )}

          {/* DESKTOP/MOBILE COMPACT PREV/NEXT OVERVIEW HERO CONTROLS */}
          {!selectedPost && !isReadingPrologue && flipboardCards.length > 1 && (
            <div
              className="pj-hero-arrows"
              style={{
                position: "absolute",
                bottom: "1.25rem",
                right: "1.25rem",
                zIndex: 50,
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
              }}
            >
              {/* PREVIOUS STORY DECK BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevHero();
                }}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  handlePrevHero();
                }}
                title="Previous Story"
                aria-label="Previous Story"
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "rgba(0, 0, 0, 0.5)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  padding: 0,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {/* NEXT STORY DECK BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextHero();
                }}
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  handleNextHero();
                }}
                title="Next Story"
                aria-label="Next Story"
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: "rgba(0, 0, 0, 0.5)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  touchAction: "manipulation",
                  WebkitTapHighlightColor: "transparent",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  padding: 0,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: SINGLE-SCREEN COMPACT EDITORIAL LAYOUT */}
        <div className={`pj-right${!selectedPost && !isReadingPrologue ? " fit-screen" : ""} theme-${readerTheme}`}>
          <div className="pj-journal-feed-wrap">
            {/* Simple Page Header with IG, Email, Search & About button (ONLY visible in Overview mode) */}
            {!selectedPost && !isReadingPrologue && (
              <div className="right-page-header">
                <h1 className="right-page-title">Journal</h1>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {/* IG ICON PILL */}
                  <a
                    href="https://instagram.com/ivanaffriandi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-pill-btn action-icon-pill"
                    title="Instagram"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                    </svg>
                  </a>

                  {/* EMAIL ICON PILL */}
                  <a
                    href="mailto:hello@ivanaffriandi.com"
                    className="action-pill-btn action-icon-pill"
                    title="Email"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </a>

                  {/* SEARCH PILLBAR */}
                  <div className="search-pill-container expanded">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ flexShrink: 0, color: "var(--text-muted)" }}>
                      <circle cx="11" cy="11" r="8"/>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search journal..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-pill-input"
                    />
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", flex: 1, minHeight: 0 }}>
              {isReadingPrologue ? (
                /* ── PROLOGUE ARTICLE CONTENT READER ── */
                <div
                  key="prologue-reader"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.4rem",
                    width: "100%",
                    maxWidth: "760px",
                    paddingBottom: "5rem",
                    paddingTop: "0.25rem",
                  }}
                >
                  {/* ── TOP READING UTILITY BAR (PROLOGUE) ── */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.85rem",
                      width: "100%",
                      paddingBottom: "0.85rem",
                      borderBottom: "1px solid var(--border-subtle, rgba(125,125,125,0.18))",
                      marginBottom: "1rem",
                    }}
                  >
                    {/* LEFT CORNER: SOLID REAL-TIME LIKE BUTTON */}
                    <button
                      onClick={handleToggleLike}
                      title={likesMap[activePostId || ""]?.hasLiked ? "Unlike" : "Like"}
                      aria-label="Like"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.36rem",
                        height: "28px",
                        padding: "0 0.8rem",
                        borderRadius: "9999px",
                        cursor: "pointer",
                        transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        border: likesMap[activePostId || ""]?.hasLiked
                          ? "1px solid #FF2D55"
                          : (readerTheme === "dark" ? "1px solid rgba(255,255,255,0.25)" : "1px solid #111111"),
                        background: likesMap[activePostId || ""]?.hasLiked
                          ? "#FF2D55"
                          : (readerTheme === "dark" ? "rgba(255,255,255,0.15)" : "#111111"),
                        color: "#FFFFFF",
                        transform: likesMap[activePostId || ""]?.hasLiked ? "scale(1.04)" : "scale(1)",
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill={likesMap[activePostId || ""]?.hasLiked ? "#FFFFFF" : "none"}
                        stroke="#FFFFFF"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          transition: "transform 0.2s ease",
                          transform: likesMap[activePostId || ""]?.hasLiked ? "scale(1.15)" : "scale(1)",
                        }}
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.02em" }}>
                        {likesMap[activePostId || ""]?.count || 0}
                      </span>
                    </button>

                    {/* RIGHT GROUP: THEME TOGGLE (DARK vs LIGHT) */}
                    <button
                      onClick={() => setReaderTheme((prev) => (prev === "dark" ? "light" : "dark"))}
                      className="action-pill-btn"
                      title="Toggle Reading Theme"
                      style={{
                        height: "28px",
                        padding: "0 0.75rem",
                        fontSize: "0.65rem",
                        gap: "0.35rem",
                      }}
                    >
                      {readerTheme === "dark" ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                          </svg>
                          <span>Dark</span>
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                          </svg>
                          <span>Light</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* ── CHAPTER HEADER BANNER (DESKTOP ONLY) ── */}
                  <div className="article-reader-chapter-title-desktop" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.4rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                      <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                        PROLOGUE
                      </span>
                      <span style={{ color: "var(--border-subtle)", opacity: 0.6 }}>·</span>
                      <span style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.06em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                        INTRO NARRATIVE
                      </span>
                    </div>

                    <h1
                      style={{
                        fontSize: "clamp(1.75rem, 3.2vw, 2.4rem)",
                        fontWeight: 800,
                        lineHeight: 1.25,
                        letterSpacing: "-0.025em",
                        color: "var(--text-primary)",
                        margin: 0,
                        fontFamily: "var(--font-sans, -apple-system, sans-serif)",
                      }}
                    >
                      A Quiet Corner on the Internet
                    </h1>
                  </div>

                  {/* PROLOGUE FULL NARRATIVE BODY */}
                  <div
                    className={`blog-modal-content-body novel-article-reader size-${readerSize}`}
                    style={{
                      paddingTop: "0.6rem",
                    }}
                  >
                    <p className="novel-drop-cap">
                      There is a reason why the world always feels more spacious past three in the morning. The city&apos;s restless hum has finally run out of steam, leaving behind a thick silence, the chill of early dew settling in, and the tired glow of a single screen lit above a wooden desk.
                    </p>
                    <p style={{ fontWeight: 600 }}>
                      My name is Ivan.
                    </p>
                    <p>
                      Observed closely, everything in this universe gradually drifts toward disorder. Objects decay, memories fade, and time erodes all things without exception. Yet, it is precisely in the awareness of this fragility that I find room to truly feel present. I have a deep fondness for things that are imperfect—for the unseen networks of life quietly holding each other up, and for the belief that at the very bottom of things, goodness is always there and worth holding onto.
                    </p>
                    <p>
                      I didn&apos;t build this space to compete with the world&apos;s noise. This page is simply a conscious effort to gather scattered fragments of thoughts, observations, and subtle details that often slip away, stitching them back together one by one. A quiet corner to nurture clarity, before everything gets swept along by the relentless pace of our days.
                    </p>

                    <div style={{ margin: "2rem 0", padding: "1.2rem", borderRadius: "12px", background: "var(--border-subtle, rgba(0,0,0,0.03))", borderLeft: "3px solid var(--text-primary)" }}>
                      <p style={{ margin: 0, fontStyle: "italic", fontSize: "0.92rem", lineHeight: 1.6 }}>
                        &ldquo;Not to try and stop time, but to remember that we were truly alive within it. To me, reading and observing things slowly is the only anchor keeping us from losing ourselves.&rdquo;
                      </p>
                    </div>

                    <p>
                      Take a deep breath, find your pause, and leave behind whatever weighs you down. Welcome to my journal.
                    </p>
                  </div>

                  {/* ── END MARKER ── */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "1.25rem",
                      margin: "0.25rem 0 0 0",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    <div style={{ flex: 1, height: "1px", background: "var(--border-subtle, rgba(125,125,125,0.35))" }} />
                    <span
                      style={{
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        color: "var(--text-muted, #888888)",
                        opacity: 0.55,
                      }}
                    >
                      END
                    </span>
                    <div style={{ flex: 1, height: "1px", background: "var(--border-subtle, rgba(125,125,125,0.35))" }} />
                  </div>

                  {/* ── MOBILE PROLOGUE READER FOOTER ── */}
                  <footer className="mobile-reader-footer">
                    <span>© {new Date().getFullYear()} IVAN AFFRIANDI</span>
                  </footer>
                </div>
              ) : selectedPost ? (
                /* ── PURE ARTICLE CONTENT READER (LEFT ACTS AS COVER HEADER) ── */
                <div
                  key={selectedPost.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.4rem",
                    width: "100%",
                    maxWidth: "760px",
                    paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 6rem)",
                    paddingTop: "0.25rem",
                  }}
                >
                  {/* ── TOP READING UTILITY BAR (BACK BUTTON + HORIZONTAL LINE + UNIFIED PILLBAR CONTROLS ON RIGHT) ── */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      width: "100%",
                      paddingBottom: "0.25rem",
                      gap: "0.75rem",
                    }}
                  >
                    {/* BACK BUTTON (DESKTOP ONLY - ON MOBILE TOP BAR HANDLES THIS) */}
                    <button
                      className="reader-back-btn-desktop"
                      onClick={() => setSelectedPostIndex(null)}
                      style={{
                        marginRight: "auto",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        height: "28px",
                        padding: "0 0.85rem",
                        borderRadius: "9999px",
                        border: "1px solid var(--border-subtle, rgba(0,0,0,0.12))",
                        background: "var(--card-bg-1, #FFFFFF)",
                        color: "var(--text-primary, #111111)",
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                      <span>JOURNAL</span>
                    </button>

                    {/* SOLID REAL-TIME LIKE BUTTON */}
                    <button
                      onClick={handleToggleLike}
                      title={likesMap[activePostId || ""]?.hasLiked ? "Unlike" : "Like"}
                      aria-label="Like"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.36rem",
                        height: "28px",
                        padding: "0 0.8rem",
                        borderRadius: "9999px",
                        cursor: "pointer",
                        transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        border: likesMap[activePostId || ""]?.hasLiked
                          ? "1px solid #FF2D55"
                          : (readerTheme === "dark" ? "1px solid rgba(255,255,255,0.25)" : "1px solid #111111"),
                        background: likesMap[activePostId || ""]?.hasLiked
                          ? "#FF2D55"
                          : (readerTheme === "dark" ? "rgba(255,255,255,0.15)" : "#111111"),
                        color: "#FFFFFF",
                        transform: likesMap[activePostId || ""]?.hasLiked ? "scale(1.04)" : "scale(1)",
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill={likesMap[activePostId || ""]?.hasLiked ? "#FFFFFF" : "none"}
                        stroke="#FFFFFF"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          transition: "transform 0.2s ease",
                          transform: likesMap[activePostId || ""]?.hasLiked ? "scale(1.15)" : "scale(1)",
                        }}
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.02em" }}>
                        {likesMap[activePostId || ""]?.count || 0}
                      </span>
                    </button>

                    {/* THEME TOGGLE PILL (DARK vs LIGHT) */}
                    <button
                      onClick={() => setReaderTheme((prev) => (prev === "dark" ? "light" : "dark"))}
                      className="action-pill-btn"
                      title="Toggle Reading Theme"
                      style={{
                        height: "28px",
                        padding: "0 0.75rem",
                        fontSize: "0.65rem",
                        gap: "0.35rem",
                      }}
                    >
                      {readerTheme === "dark" ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                          </svg>
                          <span>Dark</span>
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                          </svg>
                          <span>Light</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* ── ARTICLE CHAPTER HEADER BANNER (DESKTOP ONLY - ON MOBILE TOP COVER SHOWS THIS) ── */}
                  <div className="article-reader-chapter-title-desktop" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.4rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                      <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                        {selectedPost ? getPostChapterLabel(selectedPost, sortedPosts) : "ESSAY"}
                      </span>
                      <span style={{ color: "var(--border-subtle)", opacity: 0.6 }}>·</span>
                      <span style={{ fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.06em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                        {formatDate(selectedPost.published, locale)}
                      </span>
                    </div>

                    <h1
                      style={{
                        fontSize: "clamp(1.75rem, 3.2vw, 2.4rem)",
                        fontWeight: 800,
                        lineHeight: 1.25,
                        letterSpacing: "-0.025em",
                        color: "var(--text-primary)",
                        margin: 0,
                        fontFamily: "var(--font-sans, -apple-system, sans-serif)",
                      }}
                    >
                      {selectedPost.title}
                    </h1>
                  </div>

                  {/* Pure Editorial Content Body (No photos in text stream; images are in left gallery) */}
                  <div
                    className={`blog-modal-content-body novel-article-reader size-${readerSize}`}
                    style={{
                      paddingTop: "0.6rem",
                    }}
                    dangerouslySetInnerHTML={{ __html: formatBloggerArticleHtml(selectedPost.content) }}
                  />

                  {/* ── END MARKER ── */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "1.25rem",
                      margin: "0.25rem 0 0 0",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    <div style={{ flex: 1, height: "1px", background: "var(--border-subtle, rgba(125,125,125,0.35))" }} />
                    <span
                      style={{
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        color: "var(--text-muted, #888888)",
                        opacity: 0.55,
                      }}
                    >
                      END
                    </span>
                    <div style={{ flex: 1, height: "1px", background: "var(--border-subtle, rgba(125,125,125,0.35))" }} />
                  </div>

                  {/* ── OTHER CHAPTERS THUMBNAIL ROW AT BOTTOM (DESKTOP ONLY) ── */}
                  <div
                    className="other-chapters-row"
                    style={{
                      marginTop: "1.8rem",
                      paddingTop: "1.5rem",
                      borderTop: "1px solid var(--border-subtle, rgba(0,0,0,0.08))",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.2rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                        OTHER CHAPTERS
                      </span>
                      <button
                        onClick={() => setSelectedPostIndex(null)}
                        style={{
                          background: "transparent",
                          border: "none",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        View All →
                      </button>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "0.85rem",
                      }}
                    >
                      {sortedPosts
                        .filter((p) => p.id !== selectedPost.id)
                        .slice(0, 3)
                        .map((p) => {
                          const pCover = extractCoverImage(p.content) || fallbackHero;
                          const pChapter = getPostChapterLabel(p, sortedPosts);
                          const pRelative = getRelativeTimeString(p.published);
                          const pIdx = sortedPosts.findIndex((item) => item.id === p.id);

                          return (
                            <div
                              key={p.id}
                              onClick={() => {
                                setSelectedPostIndex(pIdx);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.35rem",
                                cursor: "pointer",
                                padding: "0.45rem",
                                borderRadius: "8px",
                                border: "1px solid var(--border-subtle, rgba(0,0,0,0.06))",
                                background: "var(--card-bg-1, #FFFFFF)",
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-strong, rgba(0,0,0,0.2))")}
                              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle, rgba(0,0,0,0.06))")}
                            >
                              <div style={{ width: "100%", height: "115px", borderRadius: "6px", overflow: "hidden", position: "relative" }}>
                                <img
                                  src={pCover}
                                  alt={p.title}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              </div>
                              <div style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                                {pChapter}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.85rem",
                                  fontWeight: 700,
                                  color: "var(--text-primary)",
                                  lineHeight: 1.3,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {p.title}
                              </div>
                              <div style={{ fontSize: "0.54rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                {pRelative || formatDate(p.published, locale)}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* ── MOBILE ARTICLE READER FOOTER ── */}
                  <footer className="mobile-reader-footer">
                    <span>© {new Date().getFullYear()} IVAN AFFRIANDI</span>
                  </footer>
                </div>
              ) : (
                /* ── REGULAR OVERVIEW JOURNAL VIEW (FITS SCREEN WITHOUT VERTICAL OVERFLOW) ── */
                <div
                  key="overview-feed"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.85rem",
                    width: "100%",
                  }}
                >
                  {/* ── DESKTOP PROLOGUE SECTION (DESKTOP ONLY, HIDDEN ON MOBILE) ── */}
                  <div className="desktop-prologue-wrap" style={{ margin: "0.15rem 0" }}>
                    <div className="section-label-header" style={{ marginBottom: "0.4rem" }}>
                      <span>PROLOGUE</span>
                    </div>

                    <div className="novel-intro-2col" style={{ gap: "1.25rem" }}>
                      {/* LEFT COLUMN: ATMOSPHERIC NARRATIVE */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                        <p className="novel-intro-paragraph novel-drop-cap" style={{ fontSize: "0.86rem", lineHeight: 1.62, margin: 0 }}>
                          There is a reason why the world always feels more spacious past three in the morning. The city&apos;s restless hum has finally run out of steam, leaving behind a thick silence, the chill of early dew settling in, and the tired glow of a single screen lit above a wooden desk.
                        </p>
                        <p className="novel-intro-paragraph" style={{ fontSize: "0.84rem", lineHeight: 1.62, margin: 0, fontWeight: 600 }}>
                          My name is Ivan.
                        </p>
                        <p className="novel-intro-paragraph" style={{ fontSize: "0.84rem", lineHeight: 1.62, margin: 0 }}>
                          Observed closely, everything in this universe gradually drifts toward disorder. Objects decay, memories fade, and time erodes all things without exception. Yet, it is precisely in the awareness of this fragility that I find room to truly feel present. I have a deep fondness for things that are imperfect—for the unseen networks of life quietly holding each other up, and for the belief that at the very bottom of things, goodness is always there and worth holding onto.
                        </p>
                        <p className="novel-intro-paragraph" style={{ fontSize: "0.84rem", lineHeight: 1.62, margin: 0 }}>
                          I didn&apos;t build this space to compete with the world&apos;s noise. This page is simply a conscious effort to gather scattered fragments of thoughts, observations, and subtle details that often slip away, stitching them back together one by one. A quiet corner to nurture clarity, before everything gets swept along by the relentless pace of our days.
                        </p>
                      </div>

                      {/* RIGHT COLUMN: CHAT BUBBLE & SIGN OFF */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                        <div className="imessage-chat-wrap" style={{ margin: 0, gap: "0.45rem" }}>
                          {/* Incoming Friend Message */}
                          <div className="imessage-row-incoming">
                            <span className="imessage-sender-tag" style={{ marginLeft: "0.5rem", fontSize: "0.52rem" }}>
                              FRIEND
                            </span>
                            <div className="imessage-bubble-incoming" style={{ padding: "0.55rem 0.95rem", fontSize: "0.82rem", lineHeight: 1.45, borderRadius: "16px 16px 16px 4px" }}>
                              If naturally everything eventually fades and wears out, why go through the trouble of weaving these memories into a space?
                            </div>
                          </div>

                          {/* Outgoing Ivan Message */}
                          <div className="imessage-row-outgoing">
                            <span className="imessage-sender-tag" style={{ marginRight: "0.5rem", fontSize: "0.52rem" }}>
                              IVAN
                            </span>
                            <div
                              className="imessage-bubble-outgoing"
                              style={{
                                padding: "0.55rem 0.95rem",
                                fontSize: "0.82rem",
                                lineHeight: 1.45,
                                color: "#FFFFFF",
                                backgroundColor: "#111113",
                                borderRadius: "16px 16px 4px 16px",
                              }}
                            >
                              Not to try and stop time, but to remember that we were truly alive within it. To me, reading and observing things slowly is the only anchor keeping us from losing ourselves.
                            </div>
                          </div>
                        </div>

                        <p className="novel-intro-paragraph" style={{ opacity: 0.72, fontSize: "0.76rem", fontStyle: "italic", borderTop: "1px solid var(--border-subtle, rgba(0,0,0,0.08))", paddingTop: "0.4rem", margin: 0 }}>
                          Take a deep breath, find your pause, and leave behind whatever weighs you down.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── HORIZONTAL CAROUSEL LAYOUT FOR CHAPTERS WITH YEAR TABS & ARROWS ── */}
                  <div className="blog-section-wrap" style={{ marginTop: "0.25rem" }}>
                    <div className="blog-tabs-header">
                      <div className="section-label-header" style={{ marginBottom: 0 }}>
                        <span>CHAPTERS {searchQuery ? `(${filteredPosts.length})` : ""}</span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                        {/* YEAR FILTER TABS (YYYY) */}
                        <div className="blog-tabs-list">
                          {yearFilters.map((y) => (
                            <button
                              key={y}
                              className={`blog-tab-item${y === activeFilter ? " active" : ""}`}
                              onClick={() => {
                                setActiveFilter(y);
                              }}
                            >
                              {y}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* DESKTOP 2-COLUMN CHAPTERS GRID */}
                    <div className="blog-grid-layout" ref={blogRowRef}>
                      {filteredPosts.map((post) => {
                        const img = extractCoverImage(post.content);
                        const excerpt = stripHtml(post.content).slice(0, 110) + "…";
                        const postIdx = sortedPosts.findIndex((p) => p.id === post.id);
                        const relativeTime = getRelativeTimeString(post.published);
                        const chapterLabel = getPostChapterLabel(post, sortedPosts);

                        return (
                          <div
                            key={post.id}
                            className="blog-grid-card"
                            onClick={() => {
                              setSelectedPostIndex(postIdx);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            {/* TOP: thumbnail */}
                            <div className="blog-card-thumb-wrap">
                              <div className="ig-b-w-container" style={{ width: "100%", height: "100%" }}>
                                <img
                                  src={img || fallbackHero}
                                  alt={post.title}
                                  className="blog-b-w-img"
                                />
                              </div>
                            </div>
                            {/* BOTTOM: text info */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", minWidth: 0, flex: 1, justifyContent: "space-between" }}>
                              <div>
                                <div className="blog-card-date">
                                  {chapterLabel}
                                </div>
                                <h3 className="blog-card-title">{post.title}</h3>
                                <div style={{ fontSize: "0.52rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "0.15rem" }}>
                                  {relativeTime ? relativeTime : formatDate(post.published, locale)}
                                </div>
                              </div>
                              <p className="blog-card-excerpt">{excerpt}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* ── INSTAGRAM POST DETAIL MODAL ── */}
      <AnimatePresence>
        {selectedIgItem && (
          <motion.div
            className="modal-bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIgItem(null)}
          >
            <motion.div
              className="modal-inner"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="modal-photo"
                style={{ backgroundImage: `url(${selectedIgItem.img})` }}
              />
              <div className="modal-body">
                <div className="modal-head">
                  <span>INSTAGRAM POST</span>
                  <span>{formatDate(selectedIgItem.date, locale)}</span>
                  <button className="modal-close" onClick={() => setSelectedIgItem(null)}>
                    ✕
                  </button>
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.35, marginBottom: "1.25rem" }}>
                  {selectedIgItem.title}
                </h3>
                <p style={{ fontSize: "0.92rem", lineHeight: 1.8, color: "var(--text-secondary)", whiteSpace: "pre-line", marginBottom: "2rem" }}>
                  {selectedIgItem.caption}
                </p>
                {selectedIgItem.permalink && (
                  <a
                    href={selectedIgItem.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="social-action-btn"
                    style={{ alignSelf: "flex-start" }}
                  >
                    VIEW ON INSTAGRAM ↗
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ULTRA-AESTHETIC Q&A POPUP MODAL (PORTAL RENDERED) ── */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isQAModalOpen && (
              isMobileScreen ? (
                /* ── MOBILE-EXCLUSIVE DEDICATED FULLSCREEN Q&A MODAL ── */
                <>
                  {/* Backdrop */}
                  <motion.div
                    key="mobile-qa-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    onClick={() => setIsQAModalOpen(false)}
                    style={{
                      position: "fixed",
                      inset: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.85)",
                      zIndex: 99998,
                    }}
                  />

                  {/* Sheet */}
                  <motion.div
                    key="mobile-qa-sheet"
                    initial={{ opacity: 0, y: -20, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.99 }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className="mobile-qa-scroll-container"
                    style={{
                      position: "fixed",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      width: "100vw",
                      maxWidth: "100%",
                      height: "100dvh",
                      zIndex: 99999,
                      display: "flex",
                      flexDirection: "column",
                      background: "radial-gradient(ellipse at top, #14161b 0%, #0a0b0e 100%)",
                      color: "#FFFFFF",
                      padding: "calc(env(safe-area-inset-top, 0px) + 16px) 1.25rem calc(env(safe-area-inset-bottom, 0px) + 20px)",
                      boxSizing: "border-box",
                      overflow: "hidden",
                    }}
                  >
                    {/* TOP BAR: TITLE + CLOSE BUTTON */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "#FFFFFF", letterSpacing: "-0.01em" }}>
                          Q&amp;A ARCHIVE
                        </h2>
                        <span style={{ fontSize: "0.55rem", fontWeight: 800, color: "#FFFFFF", background: "rgba(255,255,255,0.14)", padding: "2px 7px", borderRadius: "9999px", letterSpacing: "0.08em" }}>
                          {sortedQAs.length} ANSWERED
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsQAModalOpen(false)}
                        aria-label="Close Q&A modal"
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.16)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#FFFFFF",
                          fontSize: "0.85rem",
                          cursor: "pointer",
                        }}
                      >
                        ✕
                      </button>
                    </div>

                    {/* SEGMENTED TAB SELECTOR */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", background: "rgba(255,255,255,0.06)", padding: "3px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "1rem" }}>
                      <button
                        type="button"
                        onClick={() => setMobileQATab("browse")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.35rem",
                          padding: "0.55rem 0.8rem",
                          borderRadius: "11px",
                          border: "none",
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          transition: "all 0.18s ease",
                          background: mobileQATab === "browse" ? "#FFFFFF" : "transparent",
                          color: mobileQATab === "browse" ? "#111111" : "rgba(255,255,255,0.6)",
                          boxShadow: mobileQATab === "browse" ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                        }}
                      >
                        <span>QUESTIONS ({sortedQAs.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setMobileQATab("ask")}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.35rem",
                          padding: "0.55rem 0.8rem",
                          borderRadius: "11px",
                          border: "none",
                          fontSize: "0.68rem",
                          fontWeight: 800,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          cursor: "pointer",
                          transition: "all 0.18s ease",
                          background: mobileQATab === "ask" ? "#FFFFFF" : "transparent",
                          color: mobileQATab === "ask" ? "#111111" : "rgba(255,255,255,0.6)",
                          boxShadow: mobileQATab === "ask" ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                        }}
                      >
                        <span>ASK IVAN ✦</span>
                      </button>
                    </div>

                    {/* TAB CONTENT: BROWSE */}
                    {mobileQATab === "browse" && (
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}>
                        {/* SEARCH INPUT BAR */}
                        <div
                          style={{
                            height: "44px",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.65rem",
                            background: "rgba(255, 255, 255, 0.06)",
                            border: "1px solid rgba(255, 255, 255, 0.14)",
                            borderRadius: "14px",
                            padding: "0 0.9rem",
                            boxSizing: "border-box",
                            marginBottom: "0.75rem",
                          }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ color: "rgba(255,255,255,0.6)", flexShrink: 0 }}>
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                          <input
                            type="text"
                            placeholder="Filter questions, keywords..."
                            value={mobileQASearch}
                            onChange={(e) => setMobileQASearch(e.target.value)}
                            style={{
                              background: "transparent",
                              border: "none",
                              outline: "none",
                              color: "#FFFFFF",
                              fontSize: "0.85rem",
                              fontWeight: 500,
                              width: "100%",
                            }}
                          />
                          {mobileQASearch && (
                            <button
                              type="button"
                              onClick={() => setMobileQASearch("")}
                              style={{
                                background: "rgba(255,255,255,0.18)",
                                border: "none",
                                borderRadius: "50%",
                                width: "20px",
                                height: "20px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#FFFFFF",
                                cursor: "pointer",
                                fontSize: "0.7rem",
                                flexShrink: 0,
                              }}
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* CATEGORY FILTER CHIPS */}
                        <div
                          className="mobile-qa-scroll-container"
                          style={{
                            display: "flex",
                            gap: "0.45rem",
                            overflowX: "auto",
                            paddingBottom: "0.75rem",
                            flexShrink: 0,
                          }}
                        >
                          {[
                            { id: "all", label: "ALL" },
                            { id: "tech", label: "TECH & CODE" },
                            { id: "design", label: "DESIGN & 3D" },
                            { id: "philosophy", label: "PHILOSOPHY" },
                            { id: "personal", label: "PERSONAL" },
                          ].map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setMobileQACategory(cat.id)}
                              style={{
                                padding: "0.38rem 0.75rem",
                                borderRadius: "9999px",
                                border: "1px solid",
                                borderColor: mobileQACategory === cat.id ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.12)",
                                background: mobileQACategory === cat.id ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.05)",
                                color: mobileQACategory === cat.id ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                                fontSize: "0.58rem",
                                fontWeight: 800,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                whiteSpace: "nowrap",
                                cursor: "pointer",
                              }}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        {/* QUESTIONS STREAM */}
                        <div
                          className="mobile-qa-scroll-container"
                          style={{
                            flex: 1,
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.85rem",
                            paddingBottom: "4.5rem",
                          }}
                        >
                          {loadingQA ? (
                            <div style={{ padding: "3rem 0", textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: "0.82rem" }}>
                              Loading answered questions…
                            </div>
                          ) : filteredMobileQAs.length === 0 ? (
                            <div style={{ padding: "3.5rem 1rem", textAlign: "center", color: "rgba(255,255,255,0.5)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
                              <span style={{ fontSize: "1.2rem" }}>💬</span>
                              <p style={{ margin: 0, fontSize: "0.85rem", color: "#FFFFFF", fontWeight: 600 }}>
                                No questions found
                              </p>
                              <p style={{ margin: 0, fontSize: "0.75rem", maxWidth: "240px", color: "rgba(255,255,255,0.5)" }}>
                                Try searching for another topic or switch to the Ask tab to ask a new question.
                              </p>
                              <button
                                type="button"
                                onClick={() => setMobileQATab("ask")}
                                style={{
                                  marginTop: "0.5rem",
                                  padding: "0.55rem 1.1rem",
                                  borderRadius: "9999px",
                                  background: "#FFFFFF",
                                  color: "#111111",
                                  border: "none",
                                  fontSize: "0.7rem",
                                  fontWeight: 800,
                                  cursor: "pointer",
                                }}
                              >
                                Ask a Question ✦
                              </button>
                            </div>
                          ) : (
                            filteredMobileQAs.map((qa) => (
                              <FlippableQACard key={qa.id} qa={qa} darkTheme={true} />
                            ))
                          )}
                        </div>

                        {/* FLOATING ACTION BAR FOR QUICK ASK */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
                            left: "1.25rem",
                            right: "1.25rem",
                            display: "flex",
                            justifyContent: "center",
                            pointerEvents: "none",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => setMobileQATab("ask")}
                            style={{
                              pointerEvents: "auto",
                              background: "#FFFFFF",
                              color: "#111111",
                              border: "none",
                              borderRadius: "9999px",
                              padding: "0.7rem 1.4rem",
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.45rem",
                              boxShadow: "0 8px 30px rgba(0,0,0,0.6)",
                              cursor: "pointer",
                            }}
                          >
                            <span>Ask Ivan a Question ✦</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* TAB CONTENT: ASK IVAN */}
                    {mobileQATab === "ask" && (
                      <div
                        className="mobile-qa-scroll-container"
                        style={{
                          flex: 1,
                          overflowY: "auto",
                          display: "flex",
                          flexDirection: "column",
                          gap: "1rem",
                          paddingBottom: "2rem",
                        }}
                      >
                        <div
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "18px",
                            padding: "1.2rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.9rem",
                          }}
                        >
                          <div>
                            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 0.25rem 0", color: "#FFFFFF", letterSpacing: "-0.01em" }}>
                              Ask Ivan Anything
                            </h3>
                            <p style={{ fontSize: "0.78rem", lineHeight: 1.45, color: "rgba(255,255,255,0.65)", margin: 0, fontFamily: "var(--font-serif, Georgia, serif)" }}>
                              Ask anonymously or leave your name. Every question is read personally.
                            </p>
                          </div>

                          <form onSubmit={handleQASubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                            {qaErrorMsg && (
                              <div style={{ border: "1px solid rgba(255,100,100,0.3)", background: "rgba(255,80,80,0.1)", borderRadius: "10px", padding: "8px 12px", color: "#ff8585", fontSize: "0.75rem" }}>
                                {qaErrorMsg}
                              </div>
                            )}

                            {/* SENDER NAME (OPTIONAL) */}
                            <div>
                              <label style={{ display: "block", fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "0.35rem" }}>
                                YOUR NAME OR HANDLE (OPTIONAL)
                              </label>
                              <input
                                type="text"
                                value={senderName}
                                onChange={(e) => setSenderName(e.target.value)}
                                placeholder="Anonymous (or @handle)"
                                style={{
                                  width: "100%",
                                  background: "rgba(0,0,0,0.4)",
                                  border: "1px solid rgba(255,255,255,0.16)",
                                  borderRadius: "12px",
                                  padding: "0.7rem 0.9rem",
                                  color: "#FFFFFF",
                                  fontSize: "0.85rem",
                                  outline: "none",
                                  boxSizing: "border-box",
                                }}
                              />
                            </div>

                            {/* QUESTION TEXTAREA */}
                            <div>
                              <label style={{ display: "block", fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "0.35rem" }}>
                                YOUR QUESTION
                              </label>
                              <div style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.16)", borderRadius: "12px", padding: "0.75rem 0.9rem" }}>
                                <textarea
                                  value={qaContent}
                                  onChange={(e) => setQaContent(e.target.value)}
                                  placeholder="Write your question about design, engineering, books, or philosophy..."
                                  maxLength={300}
                                  rows={4}
                                  disabled={isSubmittingQA}
                                  style={{
                                    color: "#FFFFFF",
                                    width: "100%",
                                    background: "transparent",
                                    border: "none",
                                    outline: "none",
                                    resize: "none",
                                    fontSize: "0.85rem",
                                    lineHeight: 1.5,
                                    fontFamily: "var(--font-serif, Georgia, serif)",
                                    boxSizing: "border-box",
                                  }}
                                />
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.4rem", paddingTop: "0.4rem", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                                  <span style={{ fontSize: "0.54rem", color: "rgba(255,255,255,0.45)" }}>
                                    🔒 Direct to Ivan
                                  </span>
                                  <span style={{ fontSize: "0.54rem", color: "rgba(255,255,255,0.45)" }}>
                                    {qaContent.length} / 300
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <button
                              type="submit"
                              disabled={isSubmittingQA || !qaContent.trim()}
                              style={{
                                marginTop: "0.4rem",
                                background: "#FFFFFF",
                                color: "#111111",
                                border: "none",
                                borderRadius: "14px",
                                padding: "0.85rem 1.4rem",
                                fontSize: "0.72rem",
                                fontWeight: 800,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                cursor: qaContent.trim() ? "pointer" : "not-allowed",
                                opacity: qaContent.trim() ? 1 : 0.45,
                                transition: "all 0.2s ease",
                                boxShadow: qaContent.trim() ? "0 4px 18px rgba(255,255,255,0.22)" : "none",
                              }}
                            >
                              {isSubmittingQA ? "SENDING..." : "SEND QUESTION ✦"}
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </>
              ) : (
                /* ── DESKTOP MODAL (UNTOUCHED FOR DESKTOP MODE) ── */
                <motion.div
                  className="modal-bg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsQAModalOpen(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    width: "100vw",
                    height: "100vh",
                    zIndex: 99999,
                    background: "rgba(0, 0, 0, 0.72)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "1.5rem",
                    boxSizing: "border-box",
                    margin: 0,
                  }}
                >
                  <motion.div
                    className="modal-inner"
                    initial={{ scale: 0.96, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.96, opacity: 0, y: 15 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      maxWidth: "1020px",
                      width: "100%",
                      height: "85vh",
                      maxHeight: "820px",
                      background: "#FFFFFF",
                      color: "#111111",
                      borderRadius: "16px",
                      padding: 0,
                      display: "grid",
                      gridTemplateColumns: "1fr 400px",
                      boxShadow: "0 36px 100px rgba(0, 0, 0, 0.35)",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    {/* CLOSE BUTTON AT TOP RIGHT */}
                    <button
                      className="modal-close"
                      onClick={() => setIsQAModalOpen(false)}
                      style={{
                        position: "absolute",
                        top: "1.25rem",
                        right: "1.25rem",
                        zIndex: 10,
                        background: "rgba(0,0,0,0.5)",
                        color: "#FFFFFF",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.9rem",
                        border: "none",
                        cursor: "pointer",
                        backdropFilter: "blur(6px)",
                      }}
                    >
                      ✕
                    </button>

                    {/* LEFT COLUMN: ANSWERED QUESTIONS 2-COLUMN MASONRY STREAM */}
                    <div
                      style={{
                        padding: "2.2rem 2.5rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.25rem",
                        overflowY: "auto",
                        boxSizing: "border-box",
                        background: "#FFFFFF",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", borderBottom: "1px solid rgba(0,0,0,0.08)", paddingBottom: "1rem" }}>
                        <h2 style={{ fontSize: "1.5rem", fontWeight: 700, margin: 0, letterSpacing: "-0.02em", color: "#111111" }}>Q&amp;A</h2>
                        <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", color: "#888888", textTransform: "uppercase" }}>
                          {qaList.length} Answered Questions
                        </span>
                      </div>

                      {loadingQA ? (
                        <div style={{ padding: "3rem 0", textAlign: "center", color: "#888888", fontSize: "0.82rem" }}>
                          Loading questions…
                        </div>
                      ) : qaList.length === 0 ? (
                        <div style={{ padding: "3rem 0", textAlign: "center", color: "#888888", fontSize: "0.82rem" }}>
                          No answered questions yet. Use the form on the right to send a question!
                        </div>
                      ) : (
                        /* 2-COLUMN MASONRY GRID WITH 3D CARD FLIP EFFECT */
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem", alignItems: "start" }}>
                          {/* LEFT SUB-COLUMN */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                            {leftColQA.map((qa) => (
                              <FlippableQACard key={qa.id} qa={qa} />
                            ))}
                          </div>

                          {/* RIGHT SUB-COLUMN */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                            {rightColQA.map((qa) => (
                              <FlippableQACard key={qa.id} qa={qa} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* RIGHT COLUMN: HEADER PHOTO + REDESIGNED ASK QUESTION FORM */}
                    <div
                      style={{
                        position: "relative",
                        background: "#000000",
                        color: "#FFFFFF",
                        margin: 0,
                        padding: 0,
                        boxSizing: "border-box",
                        overflow: "hidden",
                        height: "100%",
                      }}
                    >
                      {/* BACKGROUND HEADER PHOTO */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          width: "100%",
                          height: "100%",
                          backgroundImage: `url("/images/moments/509414434_18067394924098563_6080711151400069719_n..jpg")`,
                          backgroundSize: "cover",
                          backgroundPosition: "center bottom",
                          filter: "grayscale(100%) contrast(1.15)",
                          zIndex: 1,
                        }}
                      />
                      {/* SOLID PITCH-BLACK TOP GRADIENT OVERLAY FORCIBLY ELIMINATING ANY TOP GREY SKY */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          width: "100%",
                          height: "100%",
                          background: "linear-gradient(to bottom, #000000 0%, #000000 50px, rgba(0,0,0,0.65) 120px, rgba(0,0,0,0.96) 100%)",
                          zIndex: 2,
                        }}
                      />

                      {/* OVERLAY CONTENT */}
                      <div style={{ position: "relative", zIndex: 3, display: "flex", flexDirection: "column", height: "100%", justifyContent: "flex-end", padding: "2.2rem 1.75rem", boxSizing: "border-box" }}>
                        {/* SOLID OPAQUE FORM AT THE BOTTOM */}
                        <div>
                          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0 0 0.2rem 0", color: "#FFFFFF", letterSpacing: "-0.02em" }}>
                            Ask Ivan Anything
                          </h3>
                          <p style={{ fontSize: "0.75rem", lineHeight: 1.45, color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-serif, Georgia, serif)", margin: "0 0 0.85rem 0" }}>
                            Ask anonymously or with your handle. Read &amp; replied personally.
                          </p>

                          <form onSubmit={handleQASubmit} style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                            {qaErrorMsg && (
                              <div style={{ border: "1px solid rgba(255,100,100,0.3)", borderRadius: "8px", padding: "6px 10px", color: "#ff6b6b", fontSize: "0.72rem" }}>
                                {qaErrorMsg}
                              </div>
                            )}

                            {/* SOLID OPAQUE DARK TEXTAREA (NOT TRANSPARENT) */}
                            <div style={{ background: "#18181A", border: "1px solid rgba(255, 255, 255, 0.25)", borderRadius: "10px", padding: "0.6rem 0.8rem" }}>
                              <textarea
                                value={qaContent}
                                onChange={(e) => setQaContent(e.target.value)}
                                placeholder="Write your question..."
                                maxLength={300}
                                rows={3}
                                disabled={isSubmittingQA}
                                style={{ color: "#FFFFFF", width: "100%", background: "transparent", border: "none", outline: "none", resize: "none", fontSize: "0.8rem", lineHeight: 1.45, fontFamily: "var(--font-serif, Georgia, serif)" }}
                              />
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.3rem", paddingTop: "0.3rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                                <span style={{ fontSize: "0.52rem", color: "rgba(255,255,255,0.5)" }}>
                                  🔒 Anonymous
                                </span>
                                <span style={{ fontSize: "0.52rem", color: "rgba(255,255,255,0.5)" }}>
                                  {qaContent.length} / 300
                                </span>
                              </div>
                            </div>

                            {/* COMPACT BUTTON */}
                            <button
                              type="submit"
                              disabled={isSubmittingQA || !qaContent.trim()}
                              style={{
                                background: "#FFFFFF",
                                color: "#111111",
                                border: "none",
                                borderRadius: "20px",
                                padding: "0.58rem 1.2rem",
                                fontSize: "0.64rem",
                                fontWeight: 700,
                                letterSpacing: "0.1em",
                                textTransform: "uppercase",
                                cursor: qaContent.trim() ? "pointer" : "not-allowed",
                                opacity: qaContent.trim() ? 1 : 0.4,
                                transition: "all 0.2s ease",
                                boxShadow: qaContent.trim() ? "0 3px 12px rgba(255,255,255,0.18)" : "none",
                              }}
                            >
                              {isSubmittingQA ? "SENDING..." : "SEND QUESTION ✦"}
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* ── PERMANENT ZERO-FLICKER SPOTLIGHT SEARCH OVERLAY (100% GLITCH-FREE) ── */}
      <div
        className={`spotlight-search-overlay${mobileSearchOpen ? " is-open" : ""}`}
        onClick={() => {
          setMobileSearchOpen(false);
          setSearchQuery("");
        }}
      >
        {/* Sliding iOS Spotlight Card */}
        <div
          className="spotlight-search-card"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Search Input Row */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
            <div
              style={{
                flex: 1,
                height: "36px",
                display: "flex",
                alignItems: "center",
                gap: "0.55rem",
                background: "rgba(255, 255, 255, 0.1)",
                border: "0.5px solid rgba(255, 255, 255, 0.14)",
                borderRadius: "10px",
                padding: "0 0.75rem",
                boxSizing: "border-box",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: "rgba(255,255,255,0.6)", flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search chapters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#FFFFFF",
                  fontSize: "0.84rem",
                  fontWeight: 400,
                  width: "100%",
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear query"
                  style={{
                    background: "rgba(255,255,255,0.22)",
                    border: "none",
                    borderRadius: "50%",
                    width: "16px",
                    height: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    fontSize: "0.6rem",
                    flexShrink: 0,
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileSearchOpen(false);
                setSearchQuery("");
              }}
              style={{
                height: "36px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                color: "rgba(255, 255, 255, 0.85)",
                fontSize: "0.82rem",
                fontWeight: 400,
                padding: "0 0.35rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxSizing: "border-box",
              }}
            >
              Cancel
            </button>
          </div>

          {/* Hairline Divider */}
          <div style={{ height: "1px", background: "rgba(255, 255, 255, 0.08)", margin: "0.55rem 0 0.35rem" }} />

          {/* Section Label */}
          <div style={{ padding: "0.15rem 0.4rem 0.35rem" }}>
            <span style={{ fontSize: "0.52rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
              {searchQuery.trim()
                ? `MATCHING (${filteredPosts.length + ("prologue intro narrative quiet internet".includes(searchQuery.toLowerCase().trim()) ? 1 : 0)})`
                : `ALL STORIES (${sortedPosts.length + 1})`}
            </span>
          </div>

          {/* Results List */}
          <div
            className="mobile-search-scroll-container"
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              padding: "0 0.1rem",
              maxHeight: "360px",
            }}
          >
            {/* Matching Chapters */}
            {filteredPosts.map((post) => {
              const postIdx = sortedPosts.findIndex((p) => p.id === post.id);
              const chapterLabel = getPostChapterLabel(post, sortedPosts);
              const postCover = extractCoverImage(post.content) || fallbackCovers[(postIdx + 1) % fallbackCovers.length];
              const readTime = getReadingTime(post.content || "");

              return (
                <div
                  key={post.id}
                  onClick={() => {
                    setIsReadingPrologue(false);
                    setSelectedPostIndex(postIdx);
                    setMobileSearchOpen(false);
                    setSearchQuery("");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.65rem",
                    padding: "0.45rem 0.5rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "background 0.12s ease",
                    borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div style={{ width: "34px", height: "34px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, background: "#16171a" }}>
                    <img
                      src={postCover}
                      alt={post.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem", flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: "0.78rem", fontWeight: 500, lineHeight: 1.25, margin: 0, color: "#FFFFFF", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {post.title}
                    </h4>
                    <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>
                      {chapterLabel} · {formatDate(post.published, locale)} · {readTime}m
                    </span>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              );
            })}

            {/* PROLOGUE ENTRY */}
            {(!searchQuery.trim() || "prologue intro narrative quiet internet".includes(searchQuery.toLowerCase().trim())) && (
              <div
                onClick={() => {
                  setIsReadingPrologue(true);
                  setSelectedPostIndex(null);
                  setMobileSearchOpen(false);
                  setSearchQuery("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.65rem",
                  padding: "0.45rem 0.5rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "background 0.12s ease",
                  borderBottom: "0.5px solid rgba(255,255,255,0.06)",
                  background: isReadingPrologue ? "rgba(255,255,255,0.08)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isReadingPrologue ? "rgba(255,255,255,0.08)" : "transparent";
                }}
              >
                <div style={{ width: "34px", height: "34px", borderRadius: "6px", overflow: "hidden", flexShrink: 0, background: "#16171a" }}>
                  <img
                    src="/nature_hero.png"
                    alt="Prologue"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem", flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: "0.78rem", fontWeight: 500, lineHeight: 1.25, margin: 0, color: "#FFFFFF", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    A Quiet Corner on the Internet
                  </h4>
                  <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>
                    Prologue · Intro Narrative · 2m
                  </span>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            )}

            {/* EMPTY STATE */}
            {filteredPosts.length === 0 && !("prologue intro narrative quiet internet".includes(searchQuery.toLowerCase().trim())) && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "1.5rem 1rem",
                  textAlign: "center",
                }}
              >
                <p style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.45)", margin: 0 }}>
                  No results for “{searchQuery}”
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TOAST FOR Q&A SUBMISSION */}
      <AnimatePresence>
        {qaToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: "fixed",
              bottom: "2rem",
              right: "2rem",
              backgroundColor: "#111111",
              color: "#FFFFFF",
              padding: "12px 22px",
              borderRadius: "20px",
              fontSize: "0.78rem",
              fontWeight: 700,
              zIndex: 9999,
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
          >
            Question sent successfully!
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
