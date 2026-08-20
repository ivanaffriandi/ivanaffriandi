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
  return url;
}

function extractAllImages(html: string): string[] {
  if (!html) return [];
  const matches = Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi));
  const urls = matches.map((m) => {
    let url = m[1];
    return url.replace(/\/s\d+(-c)?\//, "/s1600/").replace(/\/w\d+-h\d+(-c)?\//, "/s1600/");
  });
  return urls;
}

function stripImagesFromHtml(html: string): string {
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
    .replace(/(<br\s*\/?>\s*){2,}/gi, "<br>")
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

function FlippableQACard({ qa, darkTheme = false }: { qa: any; darkTheme?: boolean }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rawAnswer = typeof qa.answer === "string" ? qa.answer.trim() : "";
  const hasAnswer = rawAnswer.length > 0 && rawAnswer.toLowerCase() !== "null" && rawAnswer.toLowerCase() !== "undefined";

  // Thoughtful answer fallback matching Ivan's persona if answer is missing
  const answerText = hasAnswer
    ? rawAnswer
    : qa.content.toLowerCase().includes("tech") || qa.content.toLowerCase().includes("stack")
    ? "I rely on Next.js & React for frontends, Rust (Axum/Tokio) for high-performance microservices, Tailwind/CSS for styling, and Figma for design systems."
    : qa.content.toLowerCase().includes("time") || qa.content.toLowerCase().includes("project")
    ? "Project timelines typically range from 1–2 weeks for a focused minimal web application, up to 4–6 weeks for full design systems & custom backends."
    : "Thank you for asking! I approach every project with focus on clean aesthetics, tactile interaction details, high performance, and intuitive design.";

  return (
    <div
      style={{
        perspective: "1000px",
        cursor: "pointer",
        width: "100%",
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.52, ease: [0.23, 1, 0.32, 1] }}
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
              border: darkTheme ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0,0,0,0.06)",
              borderRadius: "14px",
              padding: "1rem 1.15rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              boxSizing: "border-box",
              boxShadow: darkTheme ? "0 4px 20px rgba(0,0,0,0.25)" : "0 1px 4px rgba(0,0,0,0.03)",
              minHeight: "115px",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.54rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: darkTheme ? "rgba(255,255,255,0.5)" : "#888888" }}>
                {qa.name ? qa.name : qa.author ? qa.author : "ANONYMOUS"} · {new Date(qa.published || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span style={{ fontSize: "0.52rem", fontWeight: 800, letterSpacing: "0.08em", color: darkTheme ? "#FFFFFF" : "#111111", background: darkTheme ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.05)", padding: "2px 8px", borderRadius: "9999px", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                FLIP ↺
              </span>
            </div>

            <p style={{ fontSize: "0.9rem", lineHeight: 1.5, color: darkTheme ? "#FFFFFF" : "#111111", margin: 0, fontFamily: "var(--font-serif, Georgia, serif)" }}>
              “{qa.content || qa.question}”
            </p>

            <span style={{ fontSize: "0.52rem", color: darkTheme ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", textAlign: "right" }}>
              Tap to read Ivan’s answer →
            </span>
          </div>
        ) : (
          /* BACK SIDE (ANSWER - NATURAL ADAPTIVE HEIGHT) */
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: darkTheme ? "radial-gradient(ellipse at top, #1c1d24 0%, #0e0f12 100%)" : "#111111",
              color: "#FFFFFF",
              borderRadius: "14px",
              border: darkTheme ? "1px solid rgba(255, 255, 255, 0.16)" : "none",
              padding: "1rem 1.15rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              boxSizing: "border-box",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              minHeight: "115px",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.12)", paddingBottom: "0.45rem" }}>
              <span style={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.12em", color: "#FFFFFF" }}>
                IVAN
              </span>
              <span style={{ fontSize: "0.52rem", fontWeight: 800, letterSpacing: "0.08em", color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "9999px" }}>
                BACK ↻
              </span>
            </div>

            <p style={{ fontSize: "0.85rem", lineHeight: 1.58, margin: 0, color: "rgba(255,255,255,0.95)", fontFamily: "var(--font-serif, Georgia, serif)" }}>
              {answerText}
            </p>

            <span style={{ fontSize: "0.52rem", color: "rgba(255,255,255,0.45)", textAlign: "right" }}>
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
      {/* ANIMATED GREETING TAG WITH ATOMIC PULSE */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <motion.div
          animate={{ scale: [1, 1.45, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#8C2A0F",
            flexShrink: 0,
          }}
        />
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
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
        </motion.span>
        {greetingState.timeStr && (
          <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#888888", letterSpacing: "0.06em", fontFamily: "var(--font-sans)" }}>
            · {greetingState.timeStr} LOCAL TIME
          </span>
        )}
      </div>

      {/* LARGE ANIMATED FULL EDITORIAL STATEMENT */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
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
      </motion.h2>
    </div>
  );
}

export default function DailyJournalFeed({ posts = [] }: { posts?: any[] }) {
  const locale = "en-US";

  const [viewMode, setViewMode] = useState<"journal" | "about">("journal");
  const [selectedPostIndex, setSelectedPostIndex] = useState<number | null>(null);
  const [selectedIgItem, setSelectedIgItem] = useState<any | null>(null);
  const [heroIndex, setHeroIndex] = useState<number>(0);
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
  const [readerTheme, setReaderTheme] = useState<"paper" | "light" | "dark">("paper");
  const [readerFont, setReaderFont] = useState<"serif" | "sans">("serif");
  const [readerSize, setReaderSize] = useState<"sm" | "md" | "lg">("md");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [readingProgress, setReadingProgress] = useState<number>(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [mobilePrologueOpen, setMobilePrologueOpen] = useState<boolean>(false);
  const [isReadingPrologue, setIsReadingPrologue] = useState<boolean>(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState<boolean>(false);

  const selectedPostImages = useMemo(() => {
    if (isReadingPrologue) return ["/nature_hero.png"];
    if (!selectedPost || !selectedPost.content) return [];
    const extracted = extractAllImages(selectedPost.content);
    return extracted.length > 0 ? extracted : [fallbackHero];
  }, [isReadingPrologue, selectedPost, fallbackHero]);

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

  // Track article reading scroll progress
  useEffect(() => {
    if (!selectedPost && !isReadingPrologue) {
      setReadingProgress(0);
      return;
    }
    const rightCol = document.querySelector(".pj-right");
    if (!rightCol) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = rightCol;
      const total = scrollHeight - clientHeight;
      if (total > 0) {
        setReadingProgress(Math.min(100, Math.max(0, (scrollTop / total) * 100)));
      }
    };

    rightCol.addEventListener("scroll", handleScroll);
    return () => rightCol.removeEventListener("scroll", handleScroll);
  }, [selectedPost, isReadingPrologue]);

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
      const chapterNum = `CHAPTER ${String(sortedPosts.length - idx).padStart(2, "0")}`;
      return {
        id: p.id,
        category: chapterNum,
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
      excerpt: "Most of this gets written late at night, usually when the screen is the only light in the room and the city noise has finally died down. Passing thoughts turn into essays...",
      img: "/nature_hero.png",
      post: null,
      isPrologue: true,
      postIndex: -1,
    };

    if (sortedPosts.length === 0) {
      return [prologueCard];
    }

    // On mobile, prologue is opened via the top header button next to search, so hero header starts directly with latest chapters
    if (isMobileScreen) {
      return chapterCards;
    }

    return [prologueCard, ...chapterCards];
  }, [sortedPosts, fallbackCovers, locale, isMobileScreen]);

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

  const handleHeroTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartPos) return;
    const diffX = touchStartPos.x - e.changedTouches[0].clientX;
    const diffY = touchStartPos.y - e.changedTouches[0].clientY;

    if (Math.abs(diffX) > 40 || Math.abs(diffY) > 40) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
          setHeroIndex((prev) => (prev + 1) % flipboardCards.length);
        } else {
          setHeroIndex((prev) => (prev - 1 + flipboardCards.length) % flipboardCards.length);
        }
      }
    }
    setTouchStartPos(null);
  };

  // Auto-cycle hero photo / flipboard cards every 6s
  const advanceHero = useCallback(() => {
    setHeroIndex((prev) => (prev + 1) % flipboardCards.length);
  }, [flipboardCards.length]);

  useEffect(() => {
    if (flipboardCards.length <= 1) return;
    const t = setInterval(advanceHero, 6000);
    return () => clearInterval(t);
  }, [advanceHero, flipboardCards.length]);

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
        /* ─────────────────────────────────────────────────────
           ROOT & LAYOUT SYSTEM
        ───────────────────────────────────────────────────── */
        .pj-root {
          display: flex;
          flex-direction: row;
          width: 100%;
          min-height: 100vh;
          box-sizing: border-box;
          overflow: hidden;
          background: var(--bg-color, #FAFAFA);
          color: var(--text-primary, #111111);
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
        }

        /* ─────────────────────────────────────────────────────
           LEFT COLUMN: STICKY HERO (JOURNAL MODE) / FULL-HEIGHT 1:1 SQUARE GRID (ABOUT MODE)
        ───────────────────────────────────────────────────── */
        .pj-left {
          position: sticky;
          top: 0;
          left: 0;
          align-self: flex-start;
          flex-shrink: 0;
          width: 36vw;
          min-width: 280px;
          max-width: 480px;
          height: 100vh;
          overflow: hidden;
          cursor: pointer;
          background: #000000;
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
            rgba(0, 0, 0, 0.55) 0%,
            rgba(0, 0, 0, 0.1) 30%,
            rgba(0, 0, 0, 0.45) 65%,
            rgba(0, 0, 0, 0.88) 100%
          );
          z-index: 2;
        }

        /* ABOUT MODE ONLY: FULL-HEIGHT 3-COL 1:1 SQUARE GRID (PAST 54px SOLID BLACK NAVBAR STRIP) */
        .pj-about-ig-grid {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 54px; /* CLEANLY PAST THE 54px SOLID BLACK NAVBAR STRIP */
          right: 0;
          height: 100vh;
          z-index: 10;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, 1fr);
          gap: 2px;
          background: #000000;
          padding: 2px;
          overflow: hidden; /* FULL HEIGHT STAY IN PLACE */
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
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 3;
          padding: 2.5rem 2rem 3.5rem calc(54px + 24px);
        }

        .pj-title {
          font-size: clamp(1.5rem, 2.2vw, 2.3rem);
          font-weight: 600;
          line-height: 1.22;
          letter-spacing: -0.025em;
          color: #ffffff;
          margin: 0 0 0.75rem;
          text-shadow: 0 2px 16px rgba(0,0,0,0.8);
          word-break: break-word;
        }

        .pj-excerpt {
          font-size: 0.84rem;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.72);
          margin: 0 0 1rem;
          text-shadow: 0 1px 8px rgba(0,0,0,0.65);
          word-break: break-word;
          max-width: 380px;
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
           RIGHT COLUMN: SINGLE-SCREEN COMPACT EDITORIAL LAYOUT
           HOMEPAGE RIGHT COLUMN IS PERMANENTLY LOCKED TO LIGHT MODE
        ───────────────────────────────────────────────────── */
        .pj-right {
          flex: 1;
          min-width: 0;
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          box-sizing: border-box;
          padding: 1.8rem max(3.2vw, 1.8rem) 1.5rem;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          gap: 0.85rem;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
          background: var(--bg-color, #FFFFFF);
          color: var(--text-primary, #111111);
        }

        .pj-right.fit-screen {
          overflow-y: hidden !important;
          justify-content: space-between !important;
        }

        /* EDITORIAL THEME OVERRIDES FOR HOMEPAGE RIGHT FEED */
        .pj-right .right-page-title,
        .pj-right .about-bio-headline,
        .pj-right .about-work-title,
        .pj-right .about-card-value,
        .pj-right .blog-card-title,
        .pj-right .prologue-nav-btn {
          color: var(--text-primary, #111111);
        }

        .pj-right .section-label-header,
        .pj-right .section-label-sm,
        .pj-right .mini-spec-title,
        .pj-right .about-card-label,
        .pj-right .imessage-sender-tag,
        .pj-right .about-story-text,
        .pj-right .about-work-desc,
        .pj-right .blog-card-excerpt,
        .pj-right .blog-card-meta {
          color: var(--text-secondary, #555555);
        }

        .pj-right .right-page-header {
          border-bottom: none;
          border-bottom-color: transparent;
        }

        .pj-right .blog-tabs-header,
        .pj-right .prologue-nav-bar {
          border-bottom-color: var(--border-color, rgba(0, 0, 0, 0.08));
          border-top-color: var(--border-color, rgba(0, 0, 0, 0.08));
        }

        .pj-right .novel-page-card {
          background: var(--card-bg-1, #FAFAFA);
          border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.06));
          box-shadow: var(--shadow-raised, 0 4px 20px rgba(0, 0, 0, 0.02));
        }

        .pj-right .novel-intro-paragraph {
          color: var(--text-primary, #222222);
        }

        .pj-right .novel-drop-cap::first-letter,
        .novel-drop-cap::first-letter {
          color: var(--text-primary, #000000);
          opacity: 1;
        }

        .pj-right .imessage-bubble-incoming {
          background: var(--bg-secondary, #EAEAEA);
          color: var(--text-primary, #111111);
        }

        .pj-right .imessage-bubble-outgoing {
          background: var(--text-primary, #111111);
          color: var(--bg-color, #FFFFFF);
        }

        .pj-right .blog-tab-item {
          color: var(--text-muted, #777777);
        }

        .pj-right .blog-tab-item:hover,
        .pj-right .blog-tab-item.active {
          color: var(--text-primary, #111111);
          background: var(--border-subtle, rgba(0, 0, 0, 0.06));
        }

        .pj-right .blog-grid-card {
          background: var(--card-bg-1, #FFFFFF);
          border-bottom: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.06));
        }

        .pj-right .search-pill-container {
          background: var(--bg-secondary, #EFEFEF);
          border: 1px solid var(--border-color, rgba(0, 0, 0, 0.08));
        }

        .pj-right .search-pill-input {
          color: var(--text-primary, #111111);
        }

        .pj-right .search-pill-input::placeholder {
          color: var(--text-muted, rgba(0, 0, 0, 0.45));
        }

        .pj-right .action-pill-btn {
          background: var(--text-primary, #111111);
          color: var(--bg-color, #FFFFFF);
        }

        .pj-right .about-pill-item,
        .pj-right .about-pill-item-sm,
        .pj-right .about-card-item {
          background: var(--bg-secondary, rgba(0, 0, 0, 0.04));
          color: var(--text-primary, #111111);
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
          background: #111111;
          color: #FFFFFF;
          padding: 0.8rem 1.15rem;
          border-radius: 18px 18px 4px 18px;
          max-width: 88%;
          font-size: 0.88rem;
          line-height: 1.5;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
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
          word-break: break-word;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .novel-article-reader p,
        .novel-article-reader div,
        .novel-article-reader span,
        .novel-article-reader li,
        .novel-article-reader font,
        .novel-article-reader b,
        .novel-article-reader strong,
        .novel-article-reader i,
        .novel-article-reader em,
        .novel-article-reader b i,
        .novel-article-reader strong em,
        .novel-article-reader i b,
        .novel-article-reader em strong,
        .novel-article-reader b span,
        .novel-article-reader strong span,
        .novel-article-reader span b,
        .novel-article-reader span strong,
        .novel-article-reader span i,
        .novel-article-reader span em {
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          font-size: 1.05rem !important;
          line-height: 1.85 !important;
          letter-spacing: -0.012em !important;
          margin-bottom: 1.35rem !important;
        }

        .novel-article-reader b,
        .novel-article-reader strong,
        .novel-article-reader b *,
        .novel-article-reader strong * {
          font-weight: 700 !important;
          font-size: 1.05rem !important;
        }

        .novel-article-reader i,
        .novel-article-reader em,
        .novel-article-reader i *,
        .novel-article-reader em * {
          font-style: italic !important;
          font-size: 1.05rem !important;
        }

        .novel-article-reader b i,
        .novel-article-reader strong em,
        .novel-article-reader i b,
        .novel-article-reader em strong {
          font-weight: 700 !important;
          font-style: italic !important;
          font-size: 1.05rem !important;
        }

        /* ── READING THEMES (PAPER, LIGHT, DARK) WITH RIGID CONTRAST RULES ── */
        .pj-right.theme-paper {
          background: #FAF7F0 !important;
          color: #2B2824 !important;
        }
        .pj-right.theme-paper .novel-article-reader,
        .pj-right.theme-paper .novel-article-reader *,
        .pj-right.theme-paper .article-reader-chapter-title-desktop h1,
        .pj-right.theme-paper .novel-article-reader > p:first-of-type::first-letter,
        .pj-right.theme-paper .novel-article-reader > div:first-of-type > p:first-of-type::first-letter,
        .pj-right.theme-paper .novel-article-reader > div:first-of-type::first-letter {
          color: #2B2824 !important;
        }

        .pj-right.theme-light {
          background: #FFFFFF !important;
          color: #111111 !important;
        }
        .pj-right.theme-light .novel-article-reader,
        .pj-right.theme-light .novel-article-reader *,
        .pj-right.theme-light .article-reader-chapter-title-desktop h1,
        .pj-right.theme-light .novel-article-reader > p:first-of-type::first-letter,
        .pj-right.theme-light .novel-article-reader > div:first-of-type > p:first-of-type::first-letter,
        .pj-right.theme-light .novel-article-reader > div:first-of-type::first-letter {
          color: #111111 !important;
        }

        .pj-right.theme-dark {
          background: #121316 !important;
          color: #EDEDF0 !important;
        }
        .pj-right.theme-dark .novel-article-reader,
        .pj-right.theme-dark .novel-article-reader *,
        .pj-right.theme-dark .article-reader-chapter-title-desktop h1,
        .pj-right.theme-dark .novel-article-reader > p:first-of-type::first-letter,
        .pj-right.theme-dark .novel-article-reader > div:first-of-type > p:first-of-type::first-letter,
        .pj-right.theme-dark .novel-article-reader > div:first-of-type::first-letter {
          color: #EDEDF0 !important;
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

        /* GUARANTEED DROP CAP FOR ALL BLOG POSTS */
        .novel-article-reader > p:first-of-type::first-letter,
        .novel-article-reader > div:first-of-type > p:first-of-type::first-letter,
        .novel-article-reader > div:first-of-type::first-letter,
        .blog-modal-content-body > p:first-of-type::first-letter,
        .blog-modal-content-body > div:first-of-type > p:first-of-type::first-letter,
        .blog-modal-content-body > div:first-of-type::first-letter {
          font-family: var(--font-serif, var(--font-playfair, Georgia, serif)) !important;
          font-size: 3.5rem !important;
          float: left !important;
          line-height: 0.8 !important;
          margin-right: 0.75rem !important;
          margin-top: 0.14rem !important;
          margin-bottom: -0.1rem !important;
          font-weight: 700 !important;
          color: var(--text-primary, #111111) !important;
          text-transform: uppercase !important;
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

        /* ── DESKTOP CHAPTERS 3-COLUMN 2-ROW GRID (MINIMALIST & BALANCED) ── */
        .blog-grid-layout {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.85rem;
          width: 100%;
          padding: 0.25rem 0 0.5rem 0;
          box-sizing: border-box;
        }

        .blog-grid-card {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          width: 100%;
          min-width: 0;
          cursor: pointer;
          border-radius: 7px;
          padding: 0.55rem;
          border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
          background: var(--card-bg-1, #FFFFFF);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.025);
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
          box-sizing: border-box;
        }

        .blog-grid-card:hover {
          transform: translateY(-2px);
          border-color: var(--border-strong, rgba(0, 0, 0, 0.25));
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
        }

        .blog-card-thumb-wrap {
          width: 100%;
          height: 98px;
          flex-shrink: 0;
          border-radius: 5px;
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

        /* STUNNING LITERARY DROP CAP ON FIRST LETTER */
        .novel-drop-cap::first-letter {
          font-family: var(--font-serif, Georgia, serif);
          font-size: 2.9rem;
          float: left;
          line-height: 0.82;
          margin-right: 0.55rem;
          margin-top: 0.12rem;
          font-weight: 400;
          color: var(--text-primary, #111111);
          font-style: italic;
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
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(14px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          margin: 0;
          box-sizing: border-box;
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

        /* ── DESKTOP DEFAULTS (HIDDEN) ── */
        .mobile-blog-header {
          display: none;
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
          /* ── MOBILE TRANSPARENT TOP HEADER (STICKY FLOATING NAVBAR) ── */
          .mobile-blog-header {
            display: flex !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 100 !important;
            padding: calc(env(safe-area-inset-top, 0px) + 0.85rem) 1.15rem 0.85rem 1.15rem !important;
            align-items: center !important;
            justify-content: space-between !important;
            background: transparent !important;
            border: none !important;
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
            height: 32px !important;
            box-sizing: border-box !important;
            background: rgba(0, 0, 0, 0.45) !important;
            backdrop-filter: blur(14px) !important;
            -webkit-backdrop-filter: blur(14px) !important;
            border: 1px solid rgba(255, 255, 255, 0.22) !important;
            color: #FFFFFF !important;
            font-size: 0.62rem !important;
            font-weight: 800 !important;
            letter-spacing: 0.08em !important;
            text-transform: uppercase !important;
            padding: 0 0.85rem !important;
            border-radius: 9999px !important;
            text-decoration: none !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
            line-height: 1 !important;
          }

          .mobile-prologue-btn {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 0.32rem !important;
            height: 32px !important;
            box-sizing: border-box !important;
            background: rgba(0, 0, 0, 0.45) !important;
            backdrop-filter: blur(14px) !important;
            -webkit-backdrop-filter: blur(14px) !important;
            border: 1px solid rgba(255, 255, 255, 0.22) !important;
            color: #FFFFFF !important;
            font-size: 0.62rem !important;
            font-weight: 800 !important;
            letter-spacing: 0.08em !important;
            text-transform: uppercase !important;
            padding: 0 0.82rem !important;
            border-radius: 9999px !important;
            text-decoration: none !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
            cursor: pointer !important;
            line-height: 1 !important;
          }

          .mobile-search-btn {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 32px !important;
            height: 32px !important;
            min-width: 32px !important;
            box-sizing: border-box !important;
            background: rgba(0, 0, 0, 0.45) !important;
            backdrop-filter: blur(14px) !important;
            -webkit-backdrop-filter: blur(14px) !important;
            border: 1px solid rgba(255, 255, 255, 0.22) !important;
            color: #FFFFFF !important;
            padding: 0 !important;
            border-radius: 50% !important;
            text-decoration: none !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
            cursor: pointer !important;
            line-height: 1 !important;
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

          /* ── ROOT LAYOUT (IMMERSIVE CARD DECK ON MOBILE OVERVIEW) ── */
          .pj-root {
            display: flex !important;
            flex-direction: column !important;
            position: relative !important;
            height: 100vh !important;
            height: 100dvh !important;
            width: 100vw !important;
            overflow: hidden !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #0c0d0e !important;
            -webkit-overflow-scrolling: touch !important;
          }

          /* When reading an article or prologue, allow vertical scrolling with smooth transition */
          .pj-root.has-selected-post {
            position: relative !important;
            height: auto !important;
            min-height: 100vh !important;
            min-height: 100dvh !important;
            overflow-y: auto !important;
            background: var(--bg-color, #FFFFFF) !important;
          }

          /* ── HERO PHOTO FEATURED CARD (SMOOTH TRANSITION TO 38DVH ON ARTICLE OPEN) ── */
          .pj-left {
            position: relative !important;
            width: 100vw !important;
            max-width: 100vw !important;
            height: 100vh !important;
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
            width: 100vw !important;
            max-width: 100vw !important;
            max-height: none !important;
            height: auto !important;
            border-radius: 0 !important;
            overflow-y: visible !important;
            box-sizing: border-box !important;
            z-index: 1 !important;
            padding: 1.8rem 1.25rem calc(2rem + env(safe-area-inset-bottom, 0px)) !important;
            box-shadow: none !important;
          }

          .pj-about-ig-grid { left: 0; height: 100%; }

          /* ── HERO TEXT INSIDE LEFT PANEL (SAFE FROM SAFARI BOTTOM TOOLBAR) ── */
          .pj-left-content {
            position: absolute !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-end !important;
            padding: 3.5rem 1.35rem calc(5.2rem + env(safe-area-inset-bottom, 20px)) 1.35rem !important;
            box-sizing: border-box !important;
            z-index: 10 !important;
          }

          .pj-hero-arrows {
            bottom: calc(5.2rem + env(safe-area-inset-bottom, 20px)) !important;
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

          .novel-drop-cap::first-letter {
            font-size: 2.9rem !important;
            line-height: 0.85 !important;
            margin-right: 0.45rem !important;
            float: left !important;
            font-family: var(--font-playfair, Georgia, serif) !important;
            font-weight: 700 !important;
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
            background: var(--text-primary, #111111) !important;
            color: var(--bg-color, #FFFFFF) !important;
            font-size: 0.85rem !important;
            line-height: 1.45 !important;
            max-width: 90% !important;
            border-radius: 16px !important;
            padding: 0.75rem 1rem !important;
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
          <div className="mobile-blog-header">
            {/* Left: HOME Button (Overview) or iOS-style JOURNAL Back Button (Reader mode) */}
            {selectedPost || isReadingPrologue ? (
              <button
                type="button"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "instant" });
                  setIsReadingPrologue(false);
                  setSelectedPostIndex(null);
                }}
                className="mobile-home-btn"
                title="Back to Journal Deck"
                style={{ cursor: "pointer" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
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
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>HOME</span>
              </a>
            )}

            {/* Right: Prologue Button (hidden when displaying post/prologue content) + Search Icon Button */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
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
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
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
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
            </div>
          </div>

          {/* SOLID IMAGE LAYER - ZERO FLICKER OR RE-RENDER BLINKS */}
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
              key={isReadingPrologue ? "prologue-hero" : selectedPost ? `post-${selectedPost.id}-${postPhotoIndex}` : `overview-${heroIndex}`}
              src={isReadingPrologue ? "/nature_hero.png" : selectedPost ? selectedPostImages[postPhotoIndex % selectedPostImages.length] : currentFlipCard.img}
              alt={isReadingPrologue ? "Prologue" : selectedPost ? selectedPost.title : currentFlipCard.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
                transition: "opacity 0.35s ease",
              }}
            />
          </div>

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

          <div
            className="pj-left-content"
            style={{
              zIndex: 3,
              cursor: !selectedPost && !isReadingPrologue ? "pointer" : "default",
            }}
            onClick={(e) => {
              if (!selectedPost && !isReadingPrologue) {
                e.stopPropagation();
                if (currentFlipCard.isPrologue) {
                  setIsReadingPrologue(true);
                  setSelectedPostIndex(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else if (currentFlipCard.post) {
                  setIsReadingPrologue(false);
                  const idx = sortedPosts.findIndex((p) => p.id === currentFlipCard.post.id);
                  if (idx !== -1) {
                    setSelectedPostIndex(idx);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }
              }
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", marginBottom: "0.5rem", flexWrap: "nowrap" }}>
              <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.8)", fontFamily: "var(--font-sans)" }}>
                {isReadingPrologue || (!selectedPost && currentFlipCard.isPrologue)
                  ? "INTRO NARRATIVE"
                  : selectedPost
                  ? `CHAPTER ${String(sortedPosts.length - (selectedPostIndex ?? 0)).padStart(2, "0")}`
                  : currentFlipCard.category}
              </span>
              {((!selectedPost && currentFlipCard.date && !currentFlipCard.isPrologue) || (selectedPost && selectedPost.published)) && (
                <>
                  <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "0.65rem" }}>·</span>
                  <span style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.65)" }}>
                    {selectedPost ? formatDate(selectedPost.published, locale) : currentFlipCard.date}
                  </span>
                </>
              )}
            </div>

            <h1
              className="pj-title"
              style={{
                fontSize: isReadingPrologue || (!selectedPost && currentFlipCard.isPrologue) ? "2.3rem" : undefined,
                fontWeight: isReadingPrologue || (!selectedPost && currentFlipCard.isPrologue) ? 750 : 600,
                letterSpacing: isReadingPrologue || (!selectedPost && currentFlipCard.isPrologue) ? "-0.03em" : "-0.02em",
                textTransform: isReadingPrologue || (!selectedPost && currentFlipCard.isPrologue) ? "uppercase" : "none",
              }}
            >
              {isReadingPrologue
                ? "PROLOGUE"
                : selectedPost
                ? selectedPost.title
                : currentFlipCard.title}
            </h1>

            {!selectedPost && !isReadingPrologue && (
              <p className="pj-excerpt">
                {currentFlipCard.excerpt}
              </p>
            )}

            {/* Dots indicator: for article photo gallery when open, or for flipboard in overview mode (MAX 5 VISIBLE STRIPS WINDOW) */}
            {selectedPost && selectedPostImages.length > 1 ? (
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
            ) : !selectedPost && !isReadingPrologue && flipboardCards.length > 1 ? (
              <div className="pj-dots" style={{ marginTop: "1.4rem" }}>
                {(() => {
                  const total = flipboardCards.length;
                  if (total <= 5) {
                    return flipboardCards.map((_, i) => (
                      <div
                        key={i}
                        className={`pj-dot${i === (heroIndex % total) ? " active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
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
                          setHeroIndex(i);
                        }}
                      />
                    );
                  }
                  return visibleDots;
                })()}
              </div>
            ) : null}
          </div>

          {selectedPost ? (
            <div
              style={{
                position: "absolute",
                bottom: "1.5rem",
                right: "1.5rem",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
              }}
            >
              {/* PREVIOUS CHAPTER ICON BUTTON */}
              <button
                disabled={selectedPostIndex === null || selectedPostIndex >= sortedPosts.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedPostIndex !== null && selectedPostIndex < sortedPosts.length - 1) {
                    setSelectedPostIndex(selectedPostIndex + 1);
                  }
                }}
                title="Previous Chapter"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.14)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: selectedPostIndex !== null && selectedPostIndex < sortedPosts.length - 1 ? "#fff" : "rgba(255,255,255,0.3)",
                  cursor: selectedPostIndex !== null && selectedPostIndex < sortedPosts.length - 1 ? "pointer" : "default",
                  transition: "all 0.2s ease",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {/* NEXT CHAPTER ICON BUTTON */}
              <button
                disabled={selectedPostIndex === null || selectedPostIndex <= 0}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedPostIndex !== null && selectedPostIndex > 0) {
                    setSelectedPostIndex(selectedPostIndex - 1);
                  }
                }}
                title="Next Chapter"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.14)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: selectedPostIndex !== null && selectedPostIndex > 0 ? "#fff" : "rgba(255,255,255,0.3)",
                  cursor: selectedPostIndex !== null && selectedPostIndex > 0 ? "pointer" : "default",
                  transition: "all 0.2s ease",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          ) : !isReadingPrologue ? (
            <div
              className="pj-hero-arrows"
              style={{
                position: "absolute",
                bottom: "1.5rem",
                right: "1.5rem",
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                gap: "0.45rem",
              }}
            >
              {/* PREVIOUS STORY DECK BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setHeroIndex((prev) => (prev > 0 ? prev - 1 : flipboardCards.length - 1));
                }}
                title="Previous Story"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.14)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              {/* NEXT STORY DECK BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setHeroIndex((prev) => (prev < flipboardCards.length - 1 ? prev + 1 : 0));
                }}
                title="Next Story"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.14)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.22)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          ) : null}
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
                <motion.div
                  key="prologue-reader"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 14 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
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
                      justifyContent: "flex-end",
                      width: "100%",
                      paddingBottom: "0.25rem",
                      gap: "0.75rem",
                    }}
                  >
                    {/* BACK BUTTON (DESKTOP ONLY - ON MOBILE TOP BAR HANDLES THIS) */}
                    <button
                      className="reader-back-btn-desktop"
                      onClick={() => setIsReadingPrologue(false)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.45rem",
                        background: "var(--bg-secondary, rgba(125,125,125,0.08))",
                        border: "1px solid var(--border-subtle, rgba(125,125,125,0.18))",
                        color: "var(--text-primary, #111111)",
                        fontSize: "0.66rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        padding: "0.38rem 0.88rem",
                        borderRadius: "9999px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        transition: "all 0.2s ease",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                      </svg>
                      BACK TO JOURNAL
                    </button>

                    {/* HORIZONTAL RULE LINE SPANNING TO PILL */}
                    <div style={{ flex: 1, height: "1px", background: "var(--border-subtle, rgba(125,125,125,0.18))" }} />

                    <span
                      style={{
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "var(--text-muted, #888888)",
                        background: "var(--bg-secondary, rgba(125,125,125,0.08))",
                        border: "1px solid var(--border-subtle, rgba(125,125,125,0.18))",
                        padding: "0.28rem 0.65rem",
                        borderRadius: "9999px",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      PROLOGUE · 2 MIN READ
                    </span>
                  </div>

                  {/* PROLOGUE BODY */}
                  <div
                    className="novel-article-reader"
                    style={{
                      fontFamily: readerFont === "serif" ? "var(--font-serif, Georgia, serif)" : "var(--font-sans, sans-serif)",
                      fontSize: readerSize === "sm" ? "1rem" : readerSize === "lg" ? "1.25rem" : "1.12rem",
                      lineHeight: readerSize === "sm" ? 1.8 : readerSize === "lg" ? 1.95 : 1.85,
                      color: "var(--text-primary, #111111)",
                    }}
                  >
                    <p className="novel-drop-cap">
                      Most of this gets written late at night, usually when the screen is the only light in the room and the city noise has finally died down. It’s where passing thoughts turn into essays, and random observations get a second life.
                    </p>
                    <p>
                      I build software, take photos, and obsess over small details. Instead of keeping all of that in separate boxes, I wanted a quiet corner on the internet where everything could just breathe together.
                    </p>

                    <div className="imessage-chat-wrap" style={{ margin: "2rem 0", gap: "0.75rem" }}>
                      <div className="imessage-row-incoming">
                        <span className="imessage-sender-tag" style={{ marginLeft: "0.5rem", fontSize: "0.54rem" }}>
                          FRIEND
                        </span>
                        <div className="imessage-bubble-incoming" style={{ padding: "0.75rem 1.1rem", fontSize: "0.92rem", lineHeight: 1.45 }}>
                          &ldquo;Wait, so what is this place exactly? A blog? A portfolio?&rdquo;
                        </div>
                      </div>

                      <div className="imessage-row-outgoing">
                        <span className="imessage-sender-tag" style={{ marginRight: "0.5rem", fontSize: "0.54rem" }}>
                          IVAN
                        </span>
                        <div className="imessage-bubble-outgoing" style={{ padding: "0.75rem 1.1rem", fontSize: "0.92rem", lineHeight: 1.45 }}>
                          &ldquo;Honestly? Just a running log. Things I build, photos I take, and ideas I can&apos;t stop chewing on.&rdquo;
                        </div>
                      </div>
                    </div>

                    <p style={{ fontStyle: "italic", opacity: 0.8 }}>
                      Grab a drink. Make yourself at home.
                    </p>
                  </div>
                </motion.div>
              ) : selectedPost ? (
                /* ── PURE ARTICLE CONTENT READER (LEFT ACTS AS COVER HEADER) ── */
                <motion.div
                  key={selectedPost.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 14 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
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
                  {/* ── TOP READING UTILITY BAR (BACK BUTTON + UNIFIED PILLBAR CONTROLS) ── */}
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
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.45rem",
                        background: "var(--bg-secondary, rgba(125,125,125,0.08))",
                        border: "1px solid var(--border-subtle, rgba(125,125,125,0.18))",
                        color: "var(--text-primary, #111111)",
                        fontSize: "0.66rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        padding: "0.38rem 0.88rem",
                        borderRadius: "9999px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        transition: "all 0.2s ease",
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--text-primary, #111111)";
                        e.currentTarget.style.color = "var(--bg-color, #FFFFFF)";
                        e.currentTarget.style.borderColor = "var(--text-primary, #111111)";
                        e.currentTarget.style.transform = "translateY(-1px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--bg-secondary, rgba(125,125,125,0.08))";
                        e.currentTarget.style.color = "var(--text-primary, #111111)";
                        e.currentTarget.style.borderColor = "var(--border-subtle, rgba(125,125,125,0.18))";
                        e.currentTarget.style.transform = "translateY(0px)";
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                      </svg>
                      BACK TO JOURNAL
                    </button>

                    {/* HORIZONTAL RULE LINE SPANNING TO PILLBAR */}
                    <div style={{ flex: 1, height: "1px", background: "var(--border-strong, rgba(125,125,125,0.45))", opacity: 0.85 }} />

                    {/* ── UNIFIED READING THEME PILLBAR (PINNED TO RIGHT) ── */}
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        background: readerTheme === "dark" ? "rgba(255,255,255,0.08)" : "var(--bg-secondary, rgba(125,125,125,0.08))",
                        border: readerTheme === "dark" ? "1px solid rgba(255,255,255,0.15)" : "1px solid var(--border-subtle, rgba(125,125,125,0.18))",
                        borderRadius: "9999px",
                        padding: "0.22rem 0.35rem",
                        gap: "0.2rem",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                        flexShrink: 0,
                      }}
                    >
                      {/* READING TIME BADGE */}
                      <span
                        style={{
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: readerTheme === "dark" ? "#88888e" : "var(--text-muted, #888888)",
                          padding: "0.25rem 0.5rem",
                        }}
                      >
                        {getReadingTime(selectedPost.content)} MIN READ
                      </span>

                      <div style={{ width: "1px", height: "12px", background: readerTheme === "dark" ? "rgba(255,255,255,0.15)" : "var(--border-subtle, rgba(125,125,125,0.18))" }} />

                      {/* PAPER THEME BUTTON */}
                      <button
                        onClick={() => setReaderTheme("paper")}
                        title="Paper Reading Mode"
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: readerTheme === "paper" ? 800 : 550,
                          padding: "0.25rem 0.55rem",
                          borderRadius: "9999px",
                          border: readerTheme === "paper" ? "1px solid #D4CEBF" : "1px solid transparent",
                          background: readerTheme === "paper" ? "#EFECE1" : "transparent",
                          color: "#2C2A26",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        Paper
                      </button>

                      {/* LIGHT THEME BUTTON */}
                      <button
                        onClick={() => setReaderTheme("light")}
                        title="Light Reading Mode"
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: readerTheme === "light" ? 800 : 550,
                          padding: "0.25rem 0.55rem",
                          borderRadius: "9999px",
                          border: readerTheme === "light" ? "1px solid #111111" : "1px solid transparent",
                          background: readerTheme === "light" ? "#111111" : "transparent",
                          color: readerTheme === "light" ? "#FFFFFF" : "var(--text-primary, #111111)",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        Light
                      </button>

                      {/* DARK THEME BUTTON */}
                      <button
                        onClick={() => setReaderTheme("dark")}
                        title="Dark Reading Mode"
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: readerTheme === "dark" ? 800 : 550,
                          padding: "0.25rem 0.55rem",
                          borderRadius: "9999px",
                          border: readerTheme === "dark" ? "1px solid rgba(255,255,255,0.3)" : "1px solid transparent",
                          background: readerTheme === "dark" ? "rgba(255,255,255,0.18)" : "transparent",
                          color: readerTheme === "dark" ? "#FFFFFF" : "var(--text-primary, #111111)",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        Dark
                      </button>
                    </div>
                  </div>

                  {/* ── ARTICLE CHAPTER HEADER BANNER (DESKTOP ONLY - ON MOBILE TOP COVER SHOWS THIS) ── */}
                  <div className="article-reader-chapter-title-desktop" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.4rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                      <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                        CHAPTER {String(sortedPosts.length - (selectedPostIndex ?? 0)).padStart(2, "0")}
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
                    className={`blog-modal-content-body novel-article-reader font-${readerFont} size-${readerSize}`}
                    style={{
                      paddingTop: "0.6rem",
                    }}
                    dangerouslySetInnerHTML={{ __html: stripImagesFromHtml(selectedPost.content) }}
                  />

                  {/* ── CENTERED END MARKER WITH HORIZONTAL ACCENT LINES ── */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "1.25rem",
                      margin: "2.2rem 0 1rem 0",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    <div style={{ flex: 1, height: "1px", background: "var(--border-subtle, rgba(125,125,125,0.35))" }} />
                    <span
                      style={{
                        fontSize: "0.66rem",
                        fontWeight: 700,
                        letterSpacing: "0.25em",
                        textTransform: "uppercase",
                        color: "var(--text-muted, #888888)",
                        opacity: 0.65,
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
                          background: "none",
                          border: "none",
                          color: "var(--text-primary)",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          padding: 0,
                        }}
                      >
                        SEE ALL ↗
                      </button>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "1rem",
                      }}
                    >
                      {sortedPosts
                        .filter((_, idx) => idx !== selectedPostIndex)
                        .slice(0, 4)
                        .map((p) => {
                          const pIdx = sortedPosts.findIndex((item) => item.id === p.id);
                          const pCover = extractCoverImage(p.content) || fallbackHero;
                          const pChapter = String(sortedPosts.length - pIdx).padStart(2, "0");
                          const pRelative = getRelativeTimeString(p.published);

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
                                gap: "0.6rem",
                                cursor: "pointer",
                                borderRadius: "10px",
                                padding: "0.6rem",
                                border: "1px solid var(--border-subtle, rgba(0,0,0,0.06))",
                                background: "var(--bg-secondary, rgba(0,0,0,0.02))",
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
                                CHAPTER {pChapter}
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
                </motion.div>
              ) : (
                /* ── REGULAR OVERVIEW JOURNAL VIEW (FITS SCREEN WITHOUT VERTICAL OVERFLOW) ── */
                <>
                  {/* ── PROLOGUE WITH DROPDOWN ACCORDION ON MOBILE ── */}
                  <div className="novel-intro-wrap" style={{ margin: "0.15rem 0" }}>
                    {/* Mobile Accordion Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setMobilePrologueOpen(!mobilePrologueOpen)}
                      className="prologue-mobile-accordion-btn"
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                        <span>PROLOGUE</span>
                        <span style={{ fontSize: "0.58rem", opacity: 0.6, fontWeight: 600 }}>· INTRO NARRATIVE</span>
                      </div>
                      <span style={{ fontSize: "0.75rem", transform: mobilePrologueOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
                        ▾
                      </span>
                    </button>

                    {/* Desktop Section Header */}
                    <div className="section-label-header" style={{ marginBottom: "0.4rem" }}>
                      <span>PROLOGUE</span>
                    </div>

                    <div className={`prologue-mobile-body ${mobilePrologueOpen ? "open" : "collapsed"}`}>
                      <div className="novel-intro-2col" style={{ gap: "1.25rem" }}>
                        {/* LEFT COLUMN: ATMOSPHERIC NARRATIVE */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                          <p className="novel-intro-paragraph novel-drop-cap" style={{ fontSize: "0.86rem", lineHeight: 1.62, margin: 0 }}>
                            Most of this gets written late at night, usually when the screen is the only light in the room and the city noise has finally died down. It’s where passing thoughts turn into essays, and random observations get a second life.
                          </p>
                          <p className="novel-intro-paragraph" style={{ fontSize: "0.84rem", lineHeight: 1.62, margin: 0 }}>
                            I build software, take photos, and obsess over small details. Instead of keeping all of that in separate boxes, I wanted a quiet corner on the internet where everything could just breathe together.
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
                              <div className="imessage-bubble-incoming" style={{ padding: "0.5rem 0.85rem", fontSize: "0.78rem", lineHeight: 1.4 }}>
                                &ldquo;Wait, so what is this place exactly? A blog? A portfolio?&rdquo;
                              </div>
                            </div>

                            {/* Outgoing Ivan Message */}
                            <div className="imessage-row-outgoing">
                              <span className="imessage-sender-tag" style={{ marginRight: "0.5rem", fontSize: "0.52rem" }}>
                                IVAN
                              </span>
                              <div className="imessage-bubble-outgoing" style={{ padding: "0.5rem 0.85rem", fontSize: "0.78rem", lineHeight: 1.4 }}>
                                &ldquo;Honestly? Just a running log. Things I build, photos I take, and ideas I can&apos;t stop chewing on.&rdquo;
                              </div>
                            </div>
                          </div>

                          <p className="novel-intro-paragraph" style={{ opacity: 0.72, fontSize: "0.76rem", fontStyle: "italic", borderTop: "1px solid var(--border-subtle, rgba(0,0,0,0.08))", paddingTop: "0.4rem", margin: 0 }}>
                            Grab a drink. Make yourself at home.
                          </p>
                        </div>
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
                        const chapterNum = String(sortedPosts.length - postIdx).padStart(2, "0");

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
                                  CHAPTER {chapterNum}
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
                </>
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
                    transition={{ duration: 0.2 }}
                    onClick={() => setIsQAModalOpen(false)}
                    style={{
                      position: "fixed",
                      inset: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.82)",
                      backdropFilter: "blur(18px)",
                      WebkitBackdropFilter: "blur(18px)",
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

      {/* ── FULLSCREEN EXPANDABLE MOBILE SEARCH OVERLAY MODAL ── */}
      {/* ── FULLSCREEN EXPANDABLE MOBILE SEARCH OVERLAY MODAL ── */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {mobileSearchOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  key="mobile-search-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setMobileSearchOpen(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.82)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    zIndex: 99998,
                  }}
                />

                {/* Search Content Sheet */}
                <motion.div
                  key="mobile-search-sheet"
                  initial={{ opacity: 0, y: -20, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.99 }}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className="mobile-search-scroll-container"
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
                    padding: "calc(env(safe-area-inset-top, 0px) + 16px) 1.25rem calc(env(safe-area-inset-bottom, 0px) + 24px)",
                    boxSizing: "border-box",
                    overflow: "hidden",
                  }}
                >
                  {/* Top Bar: Live Input + Cancel button */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1.1rem" }}>
                    <div
                      style={{
                        flex: 1,
                        height: "48px",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.16)",
                        borderRadius: "16px",
                        padding: "0 1rem",
                        boxSizing: "border-box",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" style={{ color: "rgba(255,255,255,0.65)", flexShrink: 0 }}>
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search essays, chapters, keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          background: "transparent",
                          border: "none",
                          outline: "none",
                          color: "#FFFFFF",
                          fontSize: "0.95rem",
                          fontWeight: 500,
                          width: "100%",
                        }}
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          aria-label="Clear search query"
                          style={{
                            background: "rgba(255,255,255,0.18)",
                            border: "none",
                            borderRadius: "50%",
                            width: "22px",
                            height: "22px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#FFFFFF",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            flexShrink: 0,
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setMobileSearchOpen(false)}
                      style={{
                        height: "48px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.16)",
                        color: "#FFFFFF",
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "0 1.05rem",
                        borderRadius: "16px",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        boxSizing: "border-box",
                      }}
                    >
                      CANCEL
                    </button>
                  </div>

                  {/* Results Count / Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 0.25rem 0.75rem", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "0.85rem" }}>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)" }}>
                      {searchQuery.trim()
                        ? `MATCHING RESULTS (${filteredPosts.length + ("prologue intro narrative quiet internet".includes(searchQuery.toLowerCase().trim()) ? 1 : 0)})`
                        : `ALL STORIES (${sortedPosts.length + 1})`}
                    </span>
                    {searchQuery && (
                      <span style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)" }}>
                        Filtering “{searchQuery}”
                      </span>
                    )}
                  </div>

                  {/* Results List */}
                  <div
                    className="mobile-search-scroll-container"
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.8rem",
                      paddingBottom: "2.5rem",
                    }}
                  >
                    {/* Matching Chapters */}
                    {filteredPosts.map((post) => {
                      const postIdx = sortedPosts.findIndex((p) => p.id === post.id);
                      const chapterNum = String(sortedPosts.length - postIdx).padStart(2, "0");
                      const postCover = extractCoverImage(post.content) || fallbackCovers[(postIdx + 1) % fallbackCovers.length];
                      const excerpt = stripHtml(post.content || "").slice(0, 110) + "…";
                      const readTime = getReadingTime(post.content || "");

                      return (
                        <div
                          key={post.id}
                          onClick={() => {
                            setIsReadingPrologue(false);
                            setSelectedPostIndex(postIdx);
                            setMobileSearchOpen(false);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            padding: "0.95rem 1rem",
                            borderRadius: "16px",
                            background: "rgba(255,255,255,0.045)",
                            border: "1px solid rgba(255,255,255,0.09)",
                            boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
                            cursor: "pointer",
                            transition: "all 0.18s ease",
                          }}
                        >
                          <div style={{ width: "84px", height: "66px", borderRadius: "10px", overflow: "hidden", flexShrink: 0, position: "relative", background: "#16171a", border: "1px solid rgba(255,255,255,0.12)" }}>
                            <img
                              src={postCover}
                              alt={post.title}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.32rem", flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                              <span style={{ fontSize: "0.54rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FFFFFF", background: "rgba(255,255,255,0.14)", padding: "2px 7px", borderRadius: "4px" }}>
                                CHAPTER {chapterNum}
                              </span>
                              <span style={{ fontSize: "0.54rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                                {formatDate(post.published, locale)} · {readTime}M READ
                              </span>
                            </div>
                            <h4 style={{ fontSize: "0.88rem", fontWeight: 700, lineHeight: 1.35, margin: 0, color: "#FFFFFF", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {post.title}
                            </h4>
                            <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {excerpt}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {/* PROLOGUE ENTRY (Shown when no search or when query matches prologue keywords) */}
                    {(!searchQuery.trim() || "prologue intro narrative quiet internet".includes(searchQuery.toLowerCase().trim())) && (
                      <div
                        onClick={() => {
                          setIsReadingPrologue(true);
                          setSelectedPostIndex(null);
                          setMobileSearchOpen(false);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          padding: "0.95rem 1rem",
                          borderRadius: "16px",
                          background: isReadingPrologue ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.045)",
                          border: isReadingPrologue ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.09)",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.22)",
                          cursor: "pointer",
                          transition: "all 0.18s ease",
                        }}
                      >
                        <div style={{ width: "84px", height: "66px", borderRadius: "10px", overflow: "hidden", flexShrink: 0, position: "relative", background: "#16171a", border: "1px solid rgba(255,255,255,0.12)" }}>
                          <img
                            src="/nature_hero.png"
                            alt="Prologue"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.32rem", flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "0.54rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#FFFFFF", background: "rgba(255,255,255,0.16)", padding: "2px 7px", borderRadius: "4px" }}>
                              PROLOGUE
                            </span>
                            <span style={{ fontSize: "0.54rem", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                              INTRO NARRATIVE · 2M READ
                            </span>
                          </div>
                          <h4 style={{ fontSize: "0.88rem", fontWeight: 700, lineHeight: 1.35, margin: 0, color: "#FFFFFF", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            A Quiet Corner on the Internet
                          </h4>
                          <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            Most of this gets written late at night when the screen is the only light…
                          </p>
                        </div>
                      </div>
                    )}

                    {/* EMPTY STATE */}
                    {filteredPosts.length === 0 && !("prologue intro narrative quiet internet".includes(searchQuery.toLowerCase().trim())) && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "3.5rem 1.5rem",
                          textAlign: "center",
                          gap: "0.85rem",
                        }}
                      >
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "rgba(255,255,255,0.6)",
                          }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                          </svg>
                        </div>
                        <h4 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "#FFFFFF" }}>
                          No essays found
                        </h4>
                        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.55)", margin: 0, maxWidth: "260px", lineHeight: 1.45 }}>
                          No stories matched “{searchQuery}”. Try searching for chapter themes, dates, or keywords.
                        </p>
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          style={{
                            marginTop: "0.5rem",
                            background: "rgba(255,255,255,0.12)",
                            border: "1px solid rgba(255,255,255,0.2)",
                            color: "#FFFFFF",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            padding: "0.55rem 1.1rem",
                            borderRadius: "9999px",
                            cursor: "pointer",
                          }}
                        >
                          Clear Search
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}

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
