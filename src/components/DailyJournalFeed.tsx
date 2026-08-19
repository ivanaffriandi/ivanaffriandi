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
  return html
    .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, "")
    .replace(/<div class="separator"[^>]*>[\s\S]*?<\/div>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<p>\s*(?:&nbsp;|\s)*<\/p>/gi, "");
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

function FlippableQACard({ qa }: { qa: any }) {
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
              background: "#FAFAFA",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: "11px",
              padding: "0.85rem 1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              boxSizing: "border-box",
              boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
              minHeight: "105px",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.52rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#888888" }}>
                {qa.name ? qa.name : qa.author ? qa.author : "ANONYMOUS"} · {new Date(qa.published || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span style={{ fontSize: "0.52rem", fontWeight: 700, letterSpacing: "0.05em", color: "#111111", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                FLIP ↺
              </span>
            </div>

            <p style={{ fontSize: "0.85rem", lineHeight: 1.48, color: "#111111", margin: 0, fontFamily: "var(--font-serif, Georgia, serif)" }}>
              “{qa.content || qa.question}”
            </p>
          </div>
        ) : (
          /* BACK SIDE (ANSWER - NATURAL ADAPTIVE HEIGHT) */
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "#111111",
              color: "#FFFFFF",
              borderRadius: "11px",
              padding: "0.85rem 1rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.6rem",
              boxSizing: "border-box",
              boxShadow: "0 4px 18px rgba(0,0,0,0.28)",
              minHeight: "105px",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.14)", paddingBottom: "0.4rem" }}>
              <span style={{ fontSize: "0.56rem", fontWeight: 700, letterSpacing: "0.12em", color: "#FFFFFF" }}>
                IVAN AFFRIANDI
              </span>
              <span style={{ fontSize: "0.52rem", fontWeight: 700, letterSpacing: "0.05em", color: "rgba(255,255,255,0.65)" }}>
                BACK ↻
              </span>
            </div>

            <p style={{ fontSize: "0.82rem", lineHeight: 1.55, margin: 0, color: "rgba(255,255,255,0.94)", fontFamily: "var(--font-serif, Georgia, serif)" }}>
              {answerText}
            </p>

            <span style={{ fontSize: "0.52rem", color: "rgba(255,255,255,0.45)", textAlign: "right" }}>
              {new Date(qa.answeredAt || qa.published || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
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

  const selectedPostImages = useMemo(() => {
    if (!selectedPost || !selectedPost.content) return [];
    const extracted = extractAllImages(selectedPost.content);
    return extracted.length > 0 ? extracted : [fallbackHero];
  }, [selectedPost, fallbackHero]);

  useEffect(() => {
    setPostPhotoIndex(0);
    if (selectedPostIndex !== null) {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      const rightCol = document.querySelector(".pj-right");
      if (rightCol) rightCol.scrollTo({ top: 0, left: 0, behavior: "instant" });
      const wrapEl = document.querySelector(".pj-journal-feed-wrap");
      if (wrapEl) wrapEl.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [selectedPostIndex]);

  // Auto-cycle through the article's gallery photos on the left
  useEffect(() => {
    if (!selectedPost || selectedPostImages.length <= 1) return;
    const t = setInterval(() => {
      setPostPhotoIndex((prev) => (prev + 1) % selectedPostImages.length);
    }, 4000);
    return () => clearInterval(t);
  }, [selectedPost, selectedPostImages.length]);

  const fallbackCovers = useMemo(() => [
    "/images/moments/509414434_18067394924098563_6080711151400069719_n..jpg",
    "/images/moments/539303572_18073420046098563_1129254407547625674_n..webp",
    "/images/moments/598943412_18085107533098563_2022381096122126117_n..webp",
    "/images/moments/489831318_18060819218098563_9042912996466521959_n..jpg",
    "/images/moments/515043142_18068610035098563_4316722369364790783_n..jpg",
    "/images/moments/608079301_18086400239098563_3466106499873906770_n..webp",
  ], []);

  // Flipboard Deck containing EXCLUSIVELY BLOG POSTS for mobile
  const flipboardCards = useMemo(() => {
    if (sortedPosts.length === 0) {
      return [{
        id: "fallback",
        category: "01 / 01 · JOURNAL",
        date: "2026",
        title: "Ivan Affriandi",
        excerpt: "Crafting digital experiences, thoughtful software, and visual moments.",
        img: fallbackCovers[0],
        post: null,
      }];
    }

    const limited = sortedPosts.slice(0, 10);
    return limited.map((p, idx) => {
      const extracted = extractCoverImage(p.content);
      const isBadImg = !extracted || extracted.includes("ocean_hero_mono.png");
      const cover = isBadImg ? fallbackCovers[idx % fallbackCovers.length] : extracted;
      return {
        id: p.id,
        category: `${String(idx + 1).padStart(2, "0")} / ${String(limited.length).padStart(2, "0")} · JOURNAL`,
        date: p.published ? getRelativeTimeString(p.published) : "ESSAY",
        title: p.title,
        excerpt: stripHtml(p.content || "").slice(0, 135) + "…",
        img: cover,
        post: p,
      };
    });
  }, [sortedPosts, fallbackCovers]);

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
        // Horizontal swipe → change card
        if (diffX > 0) {
          setHeroIndex((prev) => (prev + 1) % flipboardCards.length);
        } else {
          setHeroIndex((prev) => (prev - 1 + flipboardCards.length) % flipboardCards.length);
        }
      } else if (diffY < -40) {
        // Swipe DOWN (finger moving down) → open top panel
        setMobileDrawerOpen(true);
      } else if (diffY > 40 && mobileDrawerOpen) {
        // Swipe UP when panel is open → close panel
        setMobileDrawerOpen(false);
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
          width: 42vw;
          min-width: 300px;
          max-width: 600px;
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
          padding: 2.2rem max(3.2vw, 1.75rem) 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
          background: var(--bg-color, #FFFFFF);
          color: var(--text-primary, #111111);
        }

        .pj-right.fit-screen {
          overflow-y: hidden;
          justify-content: flex-start;
        }

        @media (max-width: 860px) {
          .pj-right.fit-screen {
            overflow-y: auto;
          }
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

        /* SEARCH PILLBAR (COMPACT 30px HEIGHT - CLEAN LIGHT STYLE) */
        .search-pill-container {
          display: flex;
          align-items: center;
          height: 30px;
          border-radius: 15px;
          background: #EFEFEF !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
          padding: 0 0.65rem;
          box-sizing: border-box;
          transition: width 0.28s cubic-bezier(0.16, 1, 0.3, 1), background 0.2s ease;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04) !important;
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
          color: #111111 !important;
          width: 100%;
          margin-left: 0.35rem;
          font-family: inherit;
        }

        .search-pill-input::placeholder {
          color: rgba(0, 0, 0, 0.45) !important;
          font-size: 0.62rem;
          letter-spacing: 0.04em;
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

        .blog-modal-content-body > p:first-of-type::first-letter,
        .blog-modal-content-body > div:first-of-type::first-letter {
          font-family: var(--font-serif, Georgia, serif);
          font-size: 3.2rem;
          float: left;
          line-height: 0.82;
          margin-right: 0.65rem;
          margin-top: 0.15rem;
          font-weight: 700;
          color: var(--text-primary, #111111);
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

        /* ── HORIZONTAL CHAPTERS CAROUSEL LAYOUT ── */
        .blog-grid-layout {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          gap: 0.95rem;
          width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          padding: 0.2rem 0 0.6rem 0;
          box-sizing: border-box;
          scrollbar-width: none !important;
        }
        .blog-grid-layout::-webkit-scrollbar { display: none !important; }

        .blog-grid-card {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          flex-shrink: 0;
          width: 250px;
          scroll-snap-align: start;
          cursor: pointer;
          border-radius: 8px;
          padding: 0.65rem;
          border: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
          background: var(--card-bg-1, #FFFFFF);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
          box-sizing: border-box;
        }

        .blog-grid-card:hover {
          transform: translateY(-2px);
          border-color: var(--border-strong, rgba(0, 0, 0, 0.22));
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
        }

        .blog-card-thumb-wrap {
          width: 100%;
          height: 120px;
          flex-shrink: 0;
          border-radius: 6px;
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
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--text-muted, #888888);
        }

        .blog-card-title {
          font-size: 0.88rem;
          font-weight: 700;
          line-height: 1.35;
          letter-spacing: -0.015em;
          color: var(--text-primary, #111111);
          margin: 0;
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
          font-size: 0.75rem;
          line-height: 1.45;
          color: var(--text-secondary, #666666);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .blog-card-excerpt {
          font-size: 0.8rem;
          line-height: 1.55;
          color: var(--text-secondary, #555555);
          margin: 0;
          font-family: var(--font-serif, Georgia, serif);
          font-style: italic;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ── RICH NOVEL PROLOGUE / INTRO WITH LITERARY DROP CAP ── */
        .novel-intro-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          width: 100%;
          padding: 1.1rem 0 1.25rem;
          border-bottom: 1px solid var(--border-subtle, rgba(0, 0, 0, 0.08));
        }

        .novel-intro-content {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .novel-intro-2col {
          display: grid;
          grid-template-columns: 1.12fr 1fr;
          gap: 2.2rem;
          align-items: flex-start;
          width: 100%;
          margin-top: 0.5rem;
        }

        @media (max-width: 860px) {
          .novel-intro-2col {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }

        .novel-intro-paragraph {
          font-size: 0.9rem;
          line-height: 1.72;
          color: var(--text-secondary, #333333);
          font-family: var(--font-serif, Georgia, serif);
          margin: 0;
          word-break: break-word;
        }

        /* STUNNING LITERARY DROP CAP ON FIRST LETTER */
        .novel-drop-cap::first-letter {
          font-family: var(--font-serif, Georgia, serif);
          font-size: 3.2rem;
          float: left;
          line-height: 0.82;
          margin-right: 0.65rem;
          margin-top: 0.15rem;
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

        /* ─────────────────────────────────────────────────
           PREMIUM MOBILE LAYOUT — full reflow below 860px
           ───────────────────────────────────────────────── */
        @media (max-width: 860px) {
          /* ── ROOT LAYOUT (NATURAL SINGLE-COLUMN FLOW ON MOBILE) ── */
          .pj-root {
            display: flex !important;
            flex-direction: column !important;
            position: relative !important;
            top: auto !important;
            left: auto !important;
            right: auto !important;
            bottom: auto !important;
            height: auto !important;
            min-height: 100vh !important;
            width: 100vw !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            padding: 0 !important;
            margin: 0 !important;
            background: var(--bg-color, #121212) !important;
          }

          /* ── HERO PHOTO FEATURED CARD (TOP BANNER ON MOBILE) ── */
          .pj-left {
            position: relative !important;
            top: auto !important;
            left: auto !important;
            right: auto !important;
            bottom: auto !important;
            width: 100vw !important;
            max-width: 100vw !important;
            height: 72vh !important;
            min-height: 480px !important;
            margin: 0 !important;
            border-radius: 0 !important;
            border: none !important;
            overflow: hidden !important;
            flex-shrink: 0 !important;
          }

          .pj-about-ig-grid { left: 0; height: 100%; }

          /* ── HERO TEXT INSIDE LEFT PANEL ── */
          .pj-left-content {
            position: absolute !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: flex-end !important;
            padding: 3.5rem 1.4rem calc(1.8rem + env(safe-area-inset-bottom, 0px)) 1.4rem !important;
            box-sizing: border-box !important;
            z-index: 10 !important;
          }

          .pj-title {
            font-size: clamp(1.8rem, 7vw, 2.8rem) !important;
            line-height: 1.1 !important;
          }

          /* ── EDITORIAL CONTENT FEED (FLOWS UNDERNEATH HERO ON MOBILE) ── */
          .pj-right {
            display: block !important;
            position: relative !important;
            top: auto !important;
            left: auto !important;
            right: auto !important;
            width: 100vw !important;
            max-width: 100vw !important;
            max-height: none !important;
            height: auto !important;
            background: var(--bg-color, #121212) !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            color: var(--text-primary, #FFFFFF) !important;
            border-radius: 0 !important;
            overflow-y: visible !important;
            box-sizing: border-box !important;
            z-index: 1 !important;
            padding: 1.5rem 1.25rem 3.5rem !important;
            box-shadow: none !important;
          }

          /* ── PAGE HEADER ── */
          .right-page-header {
            padding: 0 0 1rem 0;
            flex-wrap: wrap;
            gap: 0.75rem;
          }

          .right-page-title {
            color: var(--text-primary, #FFFFFF) !important;
            font-size: 1.6rem !important;
          }

          /* ── IG CAROUSEL ── */
          .ig-neat-card {
            width: 110px !important;
            height: 130px !important;
            border-radius: 14px !important;
          }

          /* ── PROLOGUE 2-COLUMN STACKS VERTICAL ── */
          .novel-intro-2col {
            grid-template-columns: 1fr !important;
            gap: 1.25rem !important;
          }

          .novel-intro-paragraph {
            font-size: 0.94rem !important;
            line-height: 1.72 !important;
            color: var(--text-primary, #F6F6F4) !important;
          }

          .novel-drop-cap::first-letter {
            font-size: 2.8rem !important;
            color: var(--text-primary, #FFFFFF) !important;
          }

          /* ── iMESSAGE BUBBLES NARROW ── */
          .imessage-bubble-incoming {
            background: var(--bg-secondary, rgba(255, 255, 255, 0.08)) !important;
            color: var(--text-primary, #FFFFFF) !important;
            font-size: 0.88rem !important;
            max-width: 90% !important;
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1)) !important;
          }

          .imessage-bubble-outgoing {
            background: var(--text-primary, #FFFFFF) !important;
            color: var(--bg-color, #121212) !important;
            font-size: 0.88rem !important;
            max-width: 90% !important;
          }

          /* ── CHAPTERS LIST ── */
          .blog-grid-card {
            background: var(--card-bg-1, #1A1A1A) !important;
            border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08)) !important;
            border-radius: 12px !important;
            padding: 1rem !important;
            grid-template-columns: 76px 1fr !important;
            gap: 0.85rem !important;
            margin-bottom: 0.75rem !important;
          }

          .blog-card-thumb-wrap {
            width: 76px !important;
            height: 64px !important;
          }

          .blog-card-title {
            color: var(--text-primary, #FFFFFF) !important;
            font-size: 0.92rem !important;
            font-weight: 700 !important;
          }

          .blog-card-meta {
            color: var(--text-muted, rgba(255, 255, 255, 0.5)) !important;
          }

          .blog-card-excerpt {
            display: none !important;
          }

          /* ── SECTION LABELS ── */
          .section-label-header {
            color: var(--text-muted, rgba(255, 255, 255, 0.5)) !important;
            font-size: 0.55rem !important;
            letter-spacing: 0.2em !important;
          }

          .search-pill-container {
            background: var(--bg-secondary, rgba(255, 255, 255, 0.06)) !important;
            border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12)) !important;
          }

          .search-pill-input {
            color: var(--text-primary, #FFFFFF) !important;
          }

          /* ── BLOG TABS ── */
          .blog-tab-item {
            font-size: 0.56rem !important;
            padding: 0.18rem 0.45rem !important;
          }

          /* ── MODAL ── */
          /* ── FULL-SCREEN BOTTOM SHEET MODAL ON MOBILE ── */
          .modal-bg {
            align-items: flex-end !important;
            padding: 0 !important;
          }

          .modal-inner {
            grid-template-columns: 1fr !important;
            width: 100vw !important;
            max-width: 100vw !important;
            height: 94vh !important;
            height: 94dvh !important;
            border-radius: 20px 20px 0 0 !important;
            margin: 0 !important;
            overflow-y: auto !important;
          }

          .modal-photo {
            min-height: 280px !important;
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

      <div className="pj-root" ref={mobileScrollRef}>
        {/* ── FULLSCREEN HERO CARD DECK ── */}
        <div
          className="pj-left"
          onTouchStart={handleHeroTouchStart}
          onTouchEnd={handleHeroTouchEnd}
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                height: "100%",
              }}
            >
              <div
                className="pj-photo-layer"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: "100%",
                  height: "100%",
                  backgroundImage: `url(${selectedPost ? selectedPostImages[postPhotoIndex % selectedPostImages.length] : currentFlipCard.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  opacity: 1,
                  zIndex: 1,
                  transition: "background-image 0.5s ease-in-out",
                }}
              />

              <div
                className="pj-overlay"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: "100%",
                  height: "100%",
                  background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.92) 100%)",
                  zIndex: 2,
                }}
              />

              <div className="pj-left-content">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.8)", fontFamily: "var(--font-sans)" }}>
                    {selectedPost ? `CHAPTER ${String(sortedPosts.length - (selectedPostIndex ?? 0)).padStart(2, "0")} · ${formatDate(selectedPost.published, locale)}` : currentFlipCard.category}
                  </span>
                  <span style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255, 255, 255, 0.6)" }}>
                    {selectedPost
                      ? selectedPostImages.length > 1
                        ? `${(postPhotoIndex % selectedPostImages.length) + 1} / ${selectedPostImages.length} PHOTOS`
                        : getRelativeTimeString(selectedPost.published)
                      : currentFlipCard.date}
                  </span>
                </div>

                <h1 className="pj-title">{selectedPost ? selectedPost.title : currentFlipCard.title}</h1>

                <p className="pj-excerpt">
                  {selectedPost ? stripHtml(selectedPost.content).slice(0, 140) + "…" : currentFlipCard.excerpt}
                </p>

                {/* Dots indicator: for article photo gallery when open, or for flipboard in overview mode */}
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
                ) : !selectedPost && flipboardCards.length > 1 ? (
                  <div className="pj-dots" style={{ marginTop: "1.4rem" }}>
                    {flipboardCards.map((_, i) => (
                      <div
                        key={i}
                        className={`pj-dot${i === (heroIndex % flipboardCards.length) ? " active" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setHeroIndex(i);
                        }}
                      />
                    ))}
                  </div>
                ) : null}
              </div>

              {/* ── TOP-RIGHT FEATHER PEN RETURN TO JOURNAL OVERVIEW BUTTON ── */}
              {selectedPost && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPostIndex(null);
                  }}
                  title="Back to Journal Overview"
                  style={{
                    position: "absolute",
                    top: "1.5rem",
                    right: "1.5rem",
                    zIndex: 25,
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0, 0, 0, 0.65)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0, 0, 0, 0.4)")}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                    <line x1="16" y1="8" x2="2" y2="22" />
                    <line x1="17.5" y1="15" x2="9" y2="15" />
                  </svg>
                </button>
              )}

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
              ) : (
                <button
                  className="pj-read-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (currentFlipCard.post) {
                      const idx = sortedPosts.findIndex((p) => p.id === currentFlipCard.post.id);
                      if (idx !== -1) setSelectedPostIndex(idx);
                    }
                  }}
                >
                  READ
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              )}

              {/* ── SCROLL DOWN HINT ── */}
              <div
                style={{
                  position: "absolute",
                  bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 20,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "3px",
                  opacity: 0.55,
                  pointerEvents: "none",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── MOBILE TOP SLIDE-DOWN PANEL (Gallery, Prologue, Chapters) ── */}
        {isMobileScreen && (
          <AnimatePresence>
            {mobileDrawerOpen && (
              <>
                {/* Tap outside to close */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setMobileDrawerOpen(false)}
                  style={{
                    position: "fixed", inset: 0, zIndex: 1000,
                    background: "rgba(0,0,0,0.35)",
                  }}
                />
                {/* Panel slides down from top */}
                <motion.div
                  className="pj-right"
                  initial={{ y: "-100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-100%" }}
                  transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                >
                  {/* Spacer behind navbar */}
                  <div style={{ height: "54px" }} />

                  <div style={{ padding: "0 1.25rem 1.5rem" }}>
                    {/* Header row */}
                    <div style={{
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "1.25rem",
                      paddingTop: "0.5rem",
                    }}>
                      <span style={{ fontSize: "0.58rem", fontWeight: 800, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
                        IVAN’S JOURNAL
                      </span>
                      <button
                        onClick={() => setMobileDrawerOpen(false)}
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          cursor: "pointer",
                          width: "30px", height: "30px", borderRadius: "50%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "rgba(255,255,255,0.7)", fontSize: "0.78rem",
                        }}
                      >✕</button>
                    </div>

                    {/* ── MOMENTS (IG Gallery compact) ── */}
                    <div style={{ marginBottom: "1.5rem" }}>
                      <div style={{
                        fontSize: "0.48rem", fontWeight: 800, letterSpacing: "0.25em",
                        textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
                        marginBottom: "0.65rem",
                      }}>MOMENTS</div>
                      <div
                        ref={igRowRef}
                        style={{ overflowX: "auto", display: "flex", gap: "0.5rem", scrollbarWidth: "none" }}
                      >
                        {instagramItems.slice(0, 14).map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setMobileDrawerOpen(false);
                              if (item.rawIg) setSelectedIgItem(item);
                              else if (item.permalink) window.open(item.permalink, "_blank", "noopener,noreferrer");
                            }}
                            style={{
                              flexShrink: 0, width: "80px", height: "80px",
                              borderRadius: "10px", overflow: "hidden", cursor: "pointer",
                              border: "1px solid rgba(255,255,255,0.08)",
                            }}
                          >
                            <div className="ig-b-w-container" style={{ width: "100%", height: "100%" }}>
                              <img src={item.img} alt={item.title} className="ig-b-w-img"
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── PROLOGUE (compact) ── */}
                    <div style={{
                      marginBottom: "1.5rem",
                      paddingTop: "1rem",
                      borderTop: "1px solid rgba(255,255,255,0.07)",
                    }}>
                      <div style={{
                        fontSize: "0.48rem", fontWeight: 800, letterSpacing: "0.25em",
                        textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
                        marginBottom: "0.65rem",
                      }}>PROLOGUE</div>
                      <p style={{
                        fontSize: "0.9rem", lineHeight: 1.6,
                        color: "rgba(255,255,255,0.7)", margin: 0,
                        fontFamily: "var(--font-serif, Georgia, serif)", fontStyle: "italic",
                        display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        Somewhere past midnight, with the city going quiet outside and a cup of tea slowly going cold beside the keyboard, things tend to get clearer. Not a portfolio, not quite a diary—a slow, honest record of what I’m paying attention to, and why.
                      </p>
                    </div>

                    {/* ── ALL CHAPTERS ── */}
                    <div style={{ paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                      <div style={{
                        display: "flex", alignItems: "center",
                        justifyContent: "space-between", marginBottom: "0.75rem",
                      }}>
                        <div style={{
                          fontSize: "0.48rem", fontWeight: 800, letterSpacing: "0.25em",
                          textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
                        }}>ALL CHAPTERS</div>
                        <div style={{ display: "flex", gap: "0.3rem" }}>
                          {yearFilters.map((y) => (
                            <button key={y} onClick={() => setActiveFilter(y)} style={{
                              background: y === activeFilter ? "rgba(255,255,255,0.18)" : "transparent",
                              border: "1px solid rgba(255,255,255,0.14)",
                              borderRadius: "4px",
                              color: y === activeFilter ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                              fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.08em",
                              padding: "0.2rem 0.5rem", cursor: "pointer", textTransform: "uppercase",
                            }}>{y}</button>
                          ))}
                        </div>
                      </div>

                      {filteredPosts.slice(0, 8).map((post) => {
                        const img = extractCoverImage(post.content);
                        const postIdx = sortedPosts.findIndex((p) => p.id === post.id);
                        return (
                          <div
                            key={post.id}
                            onClick={() => { setSelectedPostIndex(postIdx); setMobileDrawerOpen(false); }}
                            style={{
                              display: "grid", gridTemplateColumns: "64px 1fr", gap: "0.75rem",
                              padding: "0.75rem 0",
                              borderBottom: "1px solid rgba(255,255,255,0.05)",
                              cursor: "pointer",
                              alignItems: "center",
                            }}
                          >
                            <div style={{ width: "64px", height: "48px", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                              <img src={img || fallbackHero} alt={post.title}
                                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "grayscale(30%)" }} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: "0.52rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "0.2rem" }}>
                                {getRelativeTimeString(post.published)}
                              </div>
                              <h3 style={{ fontSize: "0.88rem", fontWeight: 700, lineHeight: 1.3, color: "#FFFFFF", margin: 0, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                {post.title}
                              </h3>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        )}

        {/* Desktop pj-right (hidden on mobile via CSS) */}
        <div className={`pj-right${!selectedPost ? " fit-screen" : ""}`}>
          <div className="pj-journal-feed-wrap">
            {/* Simple Page Header with IG, Email, Search & About button (ONLY visible in Overview mode) */}
            {!selectedPost && (
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
              {selectedPost ? (
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
                    maxWidth: "800px",
                    paddingBottom: "5rem",
                    paddingTop: "0.5rem",
                  }}
                >
                  {/* Pure Editorial Content Body (No photos in text stream; images are in left gallery) */}
                  <div
                    className="blog-modal-content-body novel-article-reader"
                    style={{
                      fontSize: "1.05rem",
                      lineHeight: 1.88,
                      color: "var(--text-primary)",
                      paddingTop: "0.25rem",
                    }}
                    dangerouslySetInnerHTML={{ __html: stripImagesFromHtml(selectedPost.content) }}
                  />

                  {/* ── OTHER CHAPTERS THUMBNAIL ROW AT BOTTOM ── */}
                  <div
                    style={{
                      marginTop: "3.5rem",
                      paddingTop: "2rem",
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
                              <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--text-muted)", textTransform: "uppercase" }}>
                                CHAPTER {pChapter} · {pRelative || formatDate(p.published, locale)}
                              </div>
                              <div
                                style={{
                                  fontSize: "0.88rem",
                                  fontWeight: 700,
                                  color: "var(--text-primary)",
                                  lineHeight: 1.35,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {p.title}
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
                  {/* ── PROLOGUE WITH COMPACT 2-COLUMN LAYOUT & iMESSAGE BUBBLES ── */}
                  <div className="novel-intro-wrap" style={{ margin: "0.15rem 0" }}>
                    <div className="section-label-header" style={{ marginBottom: "0.4rem" }}>
                      <span>PROLOGUE</span>
                    </div>

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
                                if (blogRowRef.current) {
                                  blogRowRef.current.scrollTo({ left: 0, behavior: "smooth" });
                                }
                              }}
                            >
                              {y}
                            </button>
                          ))}
                        </div>

                        {/* HORIZONTAL SCROLL ARROWS */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <button
                            onClick={() => {
                              if (blogRowRef.current) {
                                blogRowRef.current.scrollBy({ left: -260, behavior: "smooth" });
                              }
                            }}
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              border: "1px solid var(--border-subtle, rgba(0,0,0,0.12))",
                              background: "transparent",
                              color: "var(--text-primary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              padding: 0,
                            }}
                            title="Scroll Left"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="15 18 9 12 15 6" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              if (blogRowRef.current) {
                                blogRowRef.current.scrollBy({ left: 260, behavior: "smooth" });
                              }
                            }}
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              border: "1px solid var(--border-subtle, rgba(0,0,0,0.12))",
                              background: "transparent",
                              color: "var(--text-primary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              padding: 0,
                            }}
                            title="Scroll Right"
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* HORIZONTAL CAROUSEL ROW */}
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
                                  CHAPTER {chapterNum} · {relativeTime ? relativeTime : formatDate(post.published, locale)}
                                </div>
                                <h3 className="blog-card-title">{post.title}</h3>
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

                          {/* SOLID OPAQUE DARK INPUT (NOT TRANSPARENT) */}
                          <div style={{ background: "#18181A", border: "1px solid rgba(255, 255, 255, 0.25)", borderRadius: "10px", padding: "0.5rem 0.8rem" }}>
                            <input
                              type="text"
                              value={senderName}
                              onChange={(e) => setSenderName(e.target.value)}
                              placeholder="Your name (optional)"
                              maxLength={40}
                              disabled={isSubmittingQA}
                              style={{ color: "#FFFFFF", width: "100%", background: "transparent", border: "none", outline: "none", fontSize: "0.8rem", fontFamily: "var(--font-serif, Georgia, serif)" }}
                            />
                          </div>

                          {/* SOLID OPAQUE DARK TEXTAREA (NOT TRANSPARENT) */}
                          <div style={{ background: "#18181A", border: "1px solid rgba(255, 255, 255, 0.25)", borderRadius: "10px", padding: "0.6rem 0.8rem" }}>
                            <textarea
                              value={qaContent}
                              onChange={(e) => setQaContent(e.target.value)}
                              placeholder="Write your question..."
                              maxLength={300}
                              rows={2}
                              disabled={isSubmittingQA}
                              style={{ color: "#FFFFFF", width: "100%", background: "transparent", border: "none", outline: "none", resize: "none", fontSize: "0.8rem", lineHeight: 1.45, fontFamily: "var(--font-serif, Georgia, serif)" }}
                            />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.3rem", paddingTop: "0.3rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                              <span style={{ fontSize: "0.52rem", color: "rgba(255,255,255,0.5)" }}>
                                🔒 Anonymous by default
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
