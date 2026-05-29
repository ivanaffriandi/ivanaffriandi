"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { getFallbackBooks, getAllBooks } from "@/lib/books";
import type { BookItem } from "@/lib/books";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

// iOS spring config for reactive interactions
const iosSpring = { type: "spring" as const, stiffness: 380, damping: 28 };

// ── helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function langTag(book: BookItem) {
  const t = book.title + book.author;
  if (/[\u4e00-\u9fff]/.test(t)) return { label: "中文", color: "#d97706" };
  const duAuthors = ["Mulisch", "Frank", "Koch", "Wolkers", "Dragt", "Terlouw", "Multatuli", "Hermans", "Haasse"];
  if (book.id.startsWith("dutch_") || duAuthors.some(a => book.author.includes(a))) return { label: "NL", color: "#2563eb" };
  const idAuthors = ["Hirata", "Toer", "Lestari", "Kurniawan", "Fuadi", "Baiq", "Dhirgantoro", "Dika", "Shirazy", "Besari", "Liye"];
  if (idAuthors.some(a => book.author.includes(a))) return { label: "ID", color: "#dc2626" };
  return { label: "EN", color: "#6b7280" };
}

function getIsbn(url?: string) {
  if (!url) return "";
  const match = url.match(/ISBN:([0-9X\-]+)/i);
  return match ? match[1] : "";
}

function DefaultCover({ title, author }: { title: string; author: string }) {
  const hash = title.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const gradients = [
    "linear-gradient(135deg, #2a2a2a 0%, #111111 100%)", // Grayscale 1
    "linear-gradient(135deg, #333333 0%, #1a1a1a 100%)", // Grayscale 2
    "linear-gradient(135deg, #222222 0%, #000000 100%)", // Grayscale 3
    "linear-gradient(135deg, #444444 0%, #222222 100%)", // Grayscale 4
    "linear-gradient(135deg, #1c1c1c 0%, #0a0a0a 100%)", // Grayscale 5
    "linear-gradient(135deg, #3a3a3a 0%, #1c1c1c 100%)", // Grayscale 6
  ];
  const bg = gradients[hash % gradients.length];

  return (
    <div style={{
      width: "100%", height: "100%",
      background: bg,
      color: "#f5f5f7",
      filter: "grayscale(100%)",
      display: "flex", flexDirection: "column",
      justifyContent: "space-between",
      padding: "14px 8px 16px 8px",
      boxSizing: "border-box",
      borderRadius: "inherit",
      textAlign: "center",
      position: "relative",
      boxShadow: "inset -2.5px -2.5px 6px rgba(0,0,0,0.4), inset 2.5px 2.5px 5px rgba(255,255,255,0.08), 1px 0 0 rgba(255,255,255,0.08) inset",
      border: "1px solid rgba(0,0,0,0.3)",
      borderLeft: "4.5px solid rgba(0,0,0,0.45)",
      overflow: "hidden"
    }}>
      {/* Book Spine Shadow Overlay */}
      <div style={{
        position: "absolute",
        left: 0, top: 0, bottom: 0,
        width: "10%",
        background: "linear-gradient(to right, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.05) 50%, transparent 100%)",
        pointerEvents: "none"
      }} />

      {/* Book Spine Highlight Overlay */}
      <div style={{
        position: "absolute",
        left: "10%", top: 0, bottom: 0,
        width: "1.5px",
        backgroundColor: "rgba(255,255,255,0.06)",
        pointerEvents: "none"
      }} />

      {/* Book Title */}
      <div style={{
        fontSize: "0.68rem",
        fontWeight: "700",
        lineHeight: 1.3,
        fontFamily: "var(--font-serif, Georgia, serif)",
        display: "-webkit-box",
        WebkitLineClamp: 4,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textShadow: "1px 2px 4px rgba(0,0,0,0.65)",
        padding: "0 4px",
        color: "#ffffff"
      }}>
        {title}
      </div>

      {/* Book Author */}
      <div style={{
        fontSize: "0.48rem",
        fontFamily: "var(--font-sans)",
        opacity: 0.9,
        fontWeight: "600",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        letterSpacing: "0.5px",
        color: "#e2e8f0"
      }}>
        {author}
      </div>
    </div>
  );
}

// ── SmartCover ──────────────────────────────────────────────────────────────

// Domains known to block hotlinking (return 403 on direct <img> load)
const BLOCKED_HOTLINK_DOMAINS = [
  "images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com",
  "gr-assets.com",
  "goodreads.com/book/show",
];

function isHotlinkBlocked(url: string): boolean {
  return BLOCKED_HOTLINK_DOMAINS.some(d => url.includes(d));
}

function SmartCover({ book, grayscale = true }: { book: BookItem; height?: number | string; grayscale?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const trimmedCover = book.coverUrl ? book.coverUrl.trim() : "";

  // Determine if we need to start with direct src or immediately use proxy
  const needsProxyImmediately = !trimmedCover || isHotlinkBlocked(trimmedCover);
  const initialSrc = needsProxyImmediately
    ? (trimmedCover.startsWith("http") ? `/api/book-cover?url=${encodeURIComponent(trimmedCover)}` : null)
    : (trimmedCover.startsWith("http") ? trimmedCover : null);

  const [src, setSrc] = useState<string | null>(initialSrc);
  const [ready, setReady] = useState(!!initialSrc);
  const [hasTriedProxy, setHasTriedProxy] = useState(false);

  const fetchProxyCover = useCallback(() => {
    setReady(false);
    const trimmed = book.coverUrl ? book.coverUrl.trim() : "";
    if (trimmed.startsWith("http")) {
      setSrc(`/api/book-cover?url=${encodeURIComponent(trimmed)}`);
      setReady(true);
      setHasTriedProxy(true);
      return;
    }
    const t = encodeURIComponent(book.title);
    const a = encodeURIComponent(book.author);
    const isbn = getIsbn(book.coverUrl);
    fetch(`/api/book-cover?title=${t}&author=${a}&isbn=${isbn}`)
      .then(r => r.json())
      .then(data => {
        setSrc(data?.url || null);
      })
      .catch(() => setSrc(null))
      .finally(() => {
        setReady(true);
        setHasTriedProxy(true);
      });
  }, [book.title, book.author, book.coverUrl]);

  useEffect(() => {
    setMounted(true);
    const tc = book.coverUrl ? book.coverUrl.trim() : "";
    if (!tc) {
      fetchProxyCover();
    } else if (isHotlinkBlocked(tc)) {
      setSrc(`/api/book-cover?url=${encodeURIComponent(tc)}`);
      setReady(true);
      setHasTriedProxy(true);
    } else {
      setSrc(tc);
      setReady(true);
      setHasTriedProxy(false);
    }
  }, [book.title, book.author, book.coverUrl, fetchProxyCover]);

  const handleImageError = () => {
    if (!hasTriedProxy) {
      fetchProxyCover();
    } else {
      setSrc(null);
      setReady(true);
    }
  };

  if (!mounted || !src) return <DefaultCover title={book.title} author={book.author} />;

  return (
    <img
      src={src}
      alt={book.title}
      referrerPolicy="no-referrer"
      crossOrigin="anonymous"
      suppressHydrationWarning
      style={{
        width: "100%", height: "100%",
        objectFit: "cover", display: "block",
        opacity: ready ? 1 : 0,
        filter: grayscale ? "grayscale(100%) contrast(1.05)" : "none",
        transition: "opacity 0.4s ease",
        borderRadius: "inherit"
      }}
      onLoad={() => setReady(true)}
      onError={handleImageError}
      draggable={false}
    />
  );
}

// ── LibraryBookCard ───────────────────────────────────────────────────────────

function LibraryBookCard({ book, onClick }: { book: BookItem; onClick: () => void }) {
  const { t } = useLanguage();
  const tag = langTag(book);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div 
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileTap={{ scale: 0.97 }}
      transition={iosSpring}
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "0.6rem", 
        cursor: "pointer" 
      }}
    >
      {/* Outer Card Container */}
      <div style={{
        background: "var(--fa-card-bg, rgba(128,128,128,0.035))",
        border: "1px solid var(--fa-card-border, rgba(128,128,128,0.08))",
        borderRadius: "14px",
        padding: "10px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: hovered ? "translateY(-4px)" : "translateY(0px)",
        boxShadow: hovered 
          ? "0 16px 32px -4px rgba(0,0,0,0.1), 0 8px 12px -4px rgba(0,0,0,0.05)" 
          : "none",
      }}>
        {/* Inner Book Cover */}
        <div style={{
          width: "100%", 
          aspectRatio: "2/3",
          borderRadius: "4px 8px 8px 4px", 
          overflow: "hidden",
          boxShadow: "0 8px 16px -4px rgba(0,0,0,0.2), 0 4px 8px -4px rgba(0,0,0,0.15), 1px 1px 0px rgba(255,255,255,0.08) inset",
          position: "relative",
          backgroundColor: "rgba(128,128,128,0.06)",
          transformStyle: "preserve-3d",
          perspective: "1000px",
          transform: hovered ? "scale(1.02) rotateY(-4deg)" : "scale(1) rotateY(0deg)",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <SmartCover book={book} grayscale />
          
          {/* Outward edge highlight border */}
          <div style={{
            position: "absolute", inset: 0,
            border: "1.5px solid rgba(0,0,0,0.18)",
            borderLeft: "none",
            borderRadius: "inherit",
            pointerEvents: "none",
            zIndex: 4
          }} />

          {/* 3D Page thickness simulation on the right edge */}
          <div style={{
            position: "absolute", right: 0, top: "2%", bottom: "2%", width: "2.5px",
            background: "linear-gradient(to right, rgba(255,255,255,0.45) 0%, rgba(200,200,200,0.7) 100%)",
            borderRadius: "0 4px 4px 0",
            pointerEvents: "none",
            zIndex: 3
          }} />

          {/* Hardcover binding hinge crease */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: "11%",
            background: "linear-gradient(to right, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.05) 85%, transparent 100%)",
            pointerEvents: "none",
            zIndex: 3
          }} />
          <div style={{
            position: "absolute", left: "10%", top: 0, bottom: 0, width: "1.5px",
            background: "linear-gradient(to right, rgba(0,0,0,0.2) 0%, rgba(255,255,255,0.08) 100%)",
            pointerEvents: "none",
            zIndex: 3
          }} />
          <div style={{
            position: "absolute", top: 6, right: 6,
            background: tag.color, color: "#fff",
            fontSize: "0.46rem", fontWeight: 700,
            fontFamily: "var(--font-sans)",
            padding: "2px 5px", borderRadius: 4, letterSpacing: "0.04em",
          }}>{tag.label}</div>
          
          {book.status === "reading" && (
            <div style={{
              position: "absolute", top: 6, left: 6,
              background: "#f59e0b", color: "#fff",
              fontSize: "0.45rem", fontWeight: 700,
              fontFamily: "var(--font-sans)",
              padding: "2px 5px", borderRadius: 4, letterSpacing: "0.04em",
            }}>{String(t("filter_reading")).toUpperCase()}</div>
          )}
        </div>
      </div>

      <div style={{ padding: "0 2px" }}>
        <p style={{
          fontFamily: "var(--font-sans)", fontSize: "0.68rem", fontWeight: 700,
          color: "var(--text-primary)", margin: "0 0 1px 0",
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.3,
        }}>{book.title}</p>
        <p style={{
          fontFamily: "var(--font-sans)", fontSize: "0.58rem",
          color: "var(--text-secondary)", margin: "0 0 4px 0",
          overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
        }}>{book.author}</p>
        {book.status === "completed" && (
          <div style={{ fontSize: "0.6rem", color: "#c9a84c", letterSpacing: "0.5px" }}>
            {"★".repeat(book.rating ?? 0)}{"☆".repeat(5 - (book.rating ?? 0))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function getReadingPeriod() {
  const now = new Date();
  const currentYear = now.getFullYear();
  // August 3rd of current year is month index 7
  const transitionDate = new Date(currentYear, 7, 3);
  
  if (now < transitionDate) {
    const startYear = currentYear - 1;
    const endYear = currentYear;
    return {
      label: `AUG ${startYear} – AUG ${endYear}`,
      startYear,
      endYear
    };
  } else {
    const startYear = currentYear;
    const endYear = currentYear + 1;
    return {
      label: `AUG ${startYear} – AUG ${endYear}`,
      startYear,
      endYear
    };
  }
}

function getDarkenedColor(rgbaStr: string, factor = 0.35, alpha = 0.85) {
  if (!rgbaStr) return "rgba(30, 30, 35, 0.85)";
  const match = rgbaStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const r = Math.round(parseInt(match[1]) * factor);
    const g = Math.round(parseInt(match[2]) * factor);
    const b = Math.round(parseInt(match[3]) * factor);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return rgbaStr;
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const { t, lang, isRtl } = useLanguage();
  // Start with empty state to prevent SSR hydration mismatch, then hydrate from API
  const [allBooks, setAllBooks] = useState<BookItem[]>([]);
  const [filter, setFilter] = useState<"all" | "reading" | "completed">("all");
  const [activeBook, setActiveBook] = useState<BookItem | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [openTopReviewIdx, setOpenTopReviewIdx] = useState<number | null>(null);
  const [top5Colors, setTop5Colors] = useState<string[]>([
    "rgba(222, 56, 38, 1)", "rgba(14, 156, 228, 1)", "rgba(218, 44, 36, 1)",
    "rgba(74, 85, 104, 1)", "rgba(49, 130, 206, 1)"
  ]);
  const top3Ref = useRef<HTMLDivElement>(null);
  const topRowRef = useRef<HTMLDivElement>(null);
  const [expandedGenres, setExpandedGenres] = useState<Record<string, boolean>>({});


  const readingGoal = 100; // Locked at exactly 100 books per the user request

  const period = getReadingPeriod();
  const periodStart = useMemo(() => new Date(period.startYear, 7, 3), [period.startYear]);
  const periodEnd = useMemo(() => new Date(period.endYear, 7, 3), [period.endYear]);

  // Books completed in the active period
  const completedInPeriod = useMemo(() => {
    return allBooks.filter(b => {
      if (b.status !== "completed") return false;
      if (!b.completedAt) return true; // Safe fallback for older entries
      const compDate = new Date(b.completedAt);
      return compDate >= periodStart && compDate < periodEnd;
    }).length;
  }, [allBooks, periodStart, periodEnd]);

  // Filter completed books within this period for Top 5
  const completedBooksInPeriod = useMemo(() => {
    return allBooks.filter(b => {
      if (b.status !== "completed") return false;
      if (!b.completedAt) return true; // Fallback
      const compDate = new Date(b.completedAt);
      return compDate >= periodStart && compDate < periodEnd;
    });
  }, [allBooks, periodStart, periodEnd]);

  const displayTop5 = useMemo(() => {
    const hasRealCover = (b: BookItem) =>
      !!(b.coverUrl && b.coverUrl.startsWith("http") && !b.coverUrl.includes("ISBN"));

    let top5 = [...completedBooksInPeriod]
      .sort((a, b) => {
        const ratingDiff = (b.rating || 0) - (a.rating || 0);
        if (ratingDiff !== 0) return ratingDiff;
        return (hasRealCover(b) ? 1 : 0) - (hasRealCover(a) ? 1 : 0);
      })
      .slice(0, 5);

    if (top5.length === 0) {
      top5 = allBooks
        .filter(b => b.status === "completed")
        .sort((a, b) => {
          const ratingDiff = (b.rating || 0) - (a.rating || 0);
          if (ratingDiff !== 0) return ratingDiff;
          return (hasRealCover(b) ? 1 : 0) - (hasRealCover(a) ? 1 : 0);
        })
        .slice(0, 5);
    }
    return top5;
  }, [allBooks, completedBooksInPeriod]);

  // Dynamic visual pyramid ordering: [Top 4, Top 2, Top 1, Top 3, Top 5]
  const visualTopBooks = useMemo(() => {
    if (displayTop5.length <= 1) return displayTop5;
    const reordered: BookItem[] = [];
    displayTop5.forEach((book, idx) => {
      if (idx === 0) {
        reordered.push(book); // Center is Top 1
      } else if (idx % 2 === 1) {
        reordered.unshift(book); // Odd index goes to the left of center
      } else {
        reordered.push(book); // Even index goes to the right of center
      }
    });
    return reordered;
  }, [displayTop5]);

  // Auto-scroll mobile Top Reads row to the middle so Top 1 is centered on mount / load
  useEffect(() => {
    if (mounted && displayTop5.length > 0 && topRowRef.current) {
      const timer = setTimeout(() => {
        const container = topRowRef.current;
        if (container) {
          const centerOffset = (container.scrollWidth - container.clientWidth) / 2;
          container.scrollLeft = centerOffset;
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [mounted, displayTop5]);

  useEffect(() => {
    setMounted(true);
    getAllBooks().then(books => {
      if (books && books.length > 0) setAllBooks(books);
    }).catch(() => {});
  }, []);

  // Extract dominant color from each top-5 cover for card bg tinting
  useEffect(() => {
    if (!mounted || displayTop5.length === 0) return;
    displayTop5.forEach((book, idx) => {
      const url = book.coverUrl;
      if (!url || !url.startsWith("http") || url.includes("ISBN")) return;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = 8; canvas.height = 8;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.drawImage(img, 0, 0, 8, 8);
          const d = ctx.getImageData(0, 0, 8, 8).data;
          let r = 0, g = 0, bv = 0;
          const n = d.length / 4;
          for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; bv += d[i + 2]; }
          // Store full-brightness average color — getDarkenedColor will handle darkening
          const ar = Math.round(r / n);
          const ag = Math.round(g / n);
          const ab = Math.round(bv / n);
          setTop5Colors(prev => {
            const next = [...prev];
            next[idx] = `rgba(${ar},${ag},${ab},1)`;
            return next;
          });
        } catch {}
      };
      img.onerror = () => {};
      img.src = url;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, displayTop5]);

  const displayBooks = allBooks.filter(book => {
    if (filter === "reading") return book.status === "reading";
    if (filter === "completed") return book.status === "completed";
    return book.status === "reading" || book.status === "completed";
  });

  // Predefined genres for library page grouping
  const GENRES = useMemo(() => [
    { id: "politics", name: "Politics", prefixes: ["p"] },
    { id: "queer", name: "Queer Lit", prefixes: ["q"] },
    { id: "religion", name: "Religion", prefixes: ["a"] },
    { id: "novels", name: "Fiction", prefixes: ["n"] },
    { id: "dutch", name: "Dutch", prefixes: ["dutch"] },
    { id: "mycology", name: "Mycology", prefixes: ["m"] },
    { id: "self", name: "Self-Help", prefixes: ["s", "crit"] },
    { id: "design", name: "Design", prefixes: ["d"] },
    { id: "science", name: "Science", prefixes: ["sc"] }
  ], []);

  // Currently reading books for dedicated horizontal row
  const readingBooks = useMemo(() => {
    return allBooks.filter(b => b.status === "reading");
  }, [allBooks]);

  // Group books by category/genre using ID prefixes
  const groupedBooks = useMemo(() => {
    const matchedIds = new Set<string>();
    const genresWithBooks = GENRES.map(genre => {
      const booksInGenre = displayBooks.filter(book => {
        const match = genre.prefixes.some(p => book.id.startsWith(p));
        if (match) matchedIds.add(book.id);
        return match;
      });
      return {
        ...genre,
        books: booksInGenre
      };
    });

    const uncategorizedBooks = displayBooks.filter(book => !matchedIds.has(book.id));
    
    const allGroups = [...genresWithBooks];
    if (uncategorizedBooks.length > 0) {
      allGroups.push({
        id: "other",
        name: "Other Reads",
        prefixes: [],
        books: uncategorizedBooks
      });
    }

    return allGroups.filter(genre => genre.books.length > 0);
  }, [GENRES, displayBooks]);

  // Click outside top-3 section → close review
  useEffect(() => {
    if (openTopReviewIdx === null) return;
    const handle = (e: MouseEvent) => {
      if (top3Ref.current && !top3Ref.current.contains(e.target as Node)) {
        setOpenTopReviewIdx(null);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [openTopReviewIdx]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDark(media.matches);
      const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, []);


  const completedCount = allBooks.filter(b => b.status === "completed").length;

  // Dynamic Insights calculations
  const avgRating = (allBooks.filter(b => b.status === "completed" && b.rating).reduce((acc, b) => acc + (b.rating || 0), 0) / completedCount || 0).toFixed(1);

  const langCounts = allBooks.reduce((acc, book) => {
    const label = langTag(book).label;
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalCount = allBooks.length;
  const langData = Object.entries(langCounts).map(([label, count]) => {
    const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    let color = "#6b7280";
    if (label === "中文") color = "#d97706";
    else if (label === "NL") color = "#2563eb";
    else if (label === "ID") color = "#dc2626";
    return { label, count, pct, color };
  }).sort((a, b) => b.count - a.count);

  const insightBtnStyle: React.CSSProperties = {
    width: "20px",
    height: "20px",
    borderRadius: "5px",
    border: "1px solid rgba(150,150,150,0.18)",
    background: "transparent",
    color: "var(--text-primary)",
    cursor: "pointer",
    fontSize: "0.68rem",
    fontWeight: "700",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.18s"
  };

  return (
    <div style={{
      maxWidth: 850, 
      margin: "0 auto",
      padding: "1.5rem 0.5rem 1.5rem 0.5rem",
      fontFamily: "var(--font-sans)",
    }}>


      <div style={{ 
        marginBottom: "1.2rem", 
        borderBottom: "1px solid rgba(150,150,150,0.15)", 
        paddingBottom: "0.8rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-sans)", fontSize: "1.45rem", fontWeight: "800",
            color: "var(--text-primary)", margin: "0 0 4px 0", letterSpacing: "-0.02em",
            lineHeight: "1.1"
          }}>{t("library")}</h1>
          <p suppressHydrationWarning style={{
            fontFamily: "var(--font-sans)", fontSize: "0.72rem",
            color: "var(--text-secondary)", margin: 0, opacity: 0.65, fontWeight: "500"
          }}>
            {mounted ? completedCount : "—"} {t("books_read")}
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {/* Dynamic Insights Toggle */}
          <button
            onClick={() => setShowInsights(!showInsights)}
            style={{
              padding: "5px 12px",
              fontSize: "0.62rem",
              fontWeight: "600",
              fontFamily: "var(--font-sans)",
              borderRadius: "12px",
              border: "1px solid rgba(150,150,150,0.18)",
              backgroundColor: showInsights ? "var(--text-primary)" : "transparent",
              color: showInsights ? "var(--bg-color)" : "var(--text-primary)",
              cursor: "pointer",
              transition: "all 0.22s ease",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <span>{t("insights")}</span>
            <motion.svg
              width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
              animate={{ rotate: showInsights ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </motion.svg>
          </button>

          {/* Minimalist Filter Toggle */}
          <div style={{
            display: "flex",
            backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
            padding: "2px",
            borderRadius: "14px",
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.05)",
            position: "relative",
          }}>
            {(["all", "reading", "completed"] as const).map(f => {
              const isActive = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "5px 12px",
                    fontSize: "0.64rem",
                    fontWeight: "700",
                    fontFamily: "var(--font-sans)",
                    borderRadius: "11px",
                    border: "none",
                    background: "transparent",
                    color: isActive
                      ? (isDark ? "#000000" : "#ffffff")
                      : "var(--text-secondary)",
                    cursor: "pointer",
                    position: "relative",
                    transition: "color 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                    textTransform: "capitalize",
                    outline: "none",
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFilterPill"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "11px",
                        background: "var(--text-primary)",
                        zIndex: -1,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                      }}
                    />
                  )}
                  <span style={{ position: "relative", zIndex: 1 }}>{t(`filter_${f}` as any)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Insights Panel */}
      <AnimatePresence>
        {mounted && showInsights && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: "auto", opacity: 1, marginBottom: "0.5rem" }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{
              background: "rgba(128,128,128,0.04)",
              border: "1px solid rgba(128,128,128,0.08)",
              borderRadius: "18px",
              padding: "1.5rem",
              boxShadow: "0 10px 30px rgba(0,0,0,0.02), inset 0 1px 0 rgba(255,255,255,0.05)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: "1.5rem"
            }}>
              {/* Inject CSS rules for the dashboard */}
              <style>{`
                .insight-reading-card:hover {
                  background: rgba(128,128,128,0.08) !important;
                  border-color: rgba(128,128,128,0.12) !important;
                  transform: translateY(-1.5px);
                }
              `}</style>

              {/* Column 1: Reading Goal */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: "0.6rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", margin: "0 0 10px 0" }}>
                    {period.label} {t("reading_journey")}
                  </h3>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "1.3rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                      {completedInPeriod} <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: "500" }}>/ {readingGoal} {t("books")}</span>
                    </span>
                  </div>
                </div>

                <div style={{ marginTop: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.62rem", color: "var(--text-secondary)", marginBottom: "5px", fontWeight: "600" }}>
                    <span>{t("complete_pct", { pct: Math.round((completedInPeriod / readingGoal) * 100) })}</span>
                    <span>
                      {completedInPeriod >= readingGoal
                        ? completedInPeriod > readingGoal
                          ? t("over_goal", { count: completedInPeriod - readingGoal })
                          : t("goal_met")
                        : t("more_to_go", { count: readingGoal - completedInPeriod })}
                    </span>
                  </div>
                  <div style={{ height: "6px", backgroundColor: "rgba(150,150,150,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Math.round((completedInPeriod / readingGoal) * 100))}%` }}
                      transition={{ type: "spring", stiffness: 80, damping: 15 }}
                      style={{ height: "100%", background: "var(--text-primary)", borderRadius: "3px" }}
                    />
                  </div>
                </div>
              </div>

              {/* Column 2: Library Composition (Languages) */}
              <div>
                <h3 style={{ fontSize: "0.6rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", margin: "0 0 10px 0" }}>
                  {t("lang_diversity")}
                </h3>
                <div style={{ height: "6px", display: "flex", borderRadius: "3px", overflow: "hidden", backgroundColor: "rgba(150,150,150,0.1)", marginBottom: "0.8rem" }}>
                  {langData.map((item, idx) => (
                    <div
                      key={item.label}
                      style={{
                        width: `${item.pct}%`,
                        height: "100%",
                        backgroundColor: item.color,
                        marginRight: idx < langData.length - 1 ? "1px" : 0
                      }}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  {langData.map(item => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.65rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: item.color }} />
                        <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>{item.label}</span>
                        <span style={{ color: "var(--text-secondary)", opacity: 0.65 }}>({item.count} {t("books")})</span>
                      </div>
                      <span style={{ fontWeight: "700", color: "var(--text-secondary)" }}>{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Active Reads & Rating */}
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontSize: "0.6rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-secondary)", margin: "0 0 10px 0" }}>
                    {t("currently_reading")}
                  </h3>
                  {readingBooks.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "120px", overflowY: "auto" }} className="hide-scrollbar">
                      {readingBooks.map(book => (
                        <div
                          key={book.id}
                          onClick={() => setActiveBook(book)}
                          className="insight-reading-card"
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                            padding: "6px 8px",
                            background: "rgba(128,128,128,0.04)",
                            borderRadius: "10px",
                            border: "1px solid rgba(128,128,128,0.06)",
                            cursor: "pointer",
                            transition: "all 0.2s ease-out"
                          }}
                        >
                          <div style={{ width: "24px", aspectRatio: "2/3", borderRadius: "3px", overflow: "hidden", flexShrink: 0 }}>
                            <SmartCover book={book} grayscale={false} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.65rem", fontWeight: "700", color: "var(--text-primary)", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", lineHeight: "1.2" }}>{book.title}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                              <div style={{ flex: 1, height: "3px", backgroundColor: "rgba(150,150,150,0.12)", borderRadius: "1.5px", overflow: "hidden" }}>
                                <div style={{ width: `${book.progress || 0}%`, height: "100%", backgroundColor: "#f59e0b" }} />
                              </div>
                              <span style={{ fontSize: "0.55rem", fontWeight: "700", color: "#f59e0b", flexShrink: 0 }}>{book.progress || 0}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: "10px 0", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: "4px" }}>
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 0-2.5-2.5z"/>
                      </svg>
                      <span style={{ fontSize: "0.62rem", color: "var(--text-secondary)", opacity: 0.6, fontStyle: "italic" }}>
                        {t("no_active_reads")}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(150,150,150,0.1)", paddingTop: "10px", marginTop: "10px" }}>
                  <span style={{ fontSize: "0.62rem", fontWeight: "600", color: "var(--text-secondary)" }}>{t("avg_rating")}</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "#c9a84c", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                    ★ {avgRating}
                  </span>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top 5 Books — pyramidal layout with Top 1 in center, Top 2/3 on sides, Top 4/5 on outer sides */}
      {mounted && displayTop5.length > 0 && (
        <div ref={top3Ref} style={{ marginBottom: "1.5rem", position: "relative", zIndex: 90 }}>

          {/* Section header — just "Top Reads", no year */}
          <div style={{ marginBottom: "0.6rem", display: "flex", justifyContent: "center" }}>
            <span style={{
              fontSize: "0.82rem", fontWeight: "700",
              color: "var(--text-primary)", letterSpacing: "-0.01em"
            }}>
              Top Reads
            </span>
          </div>

          {/* 5-card row — smooth horizontal scroll on mobile, centered grid on desktop */}
          <style>{`
            .top5-row {
              display: flex;
              gap: 0.6rem;
              width: 100vw;
              position: relative;
              left: 50%;
              right: 50%;
              margin-left: -50vw;
              margin-right: -50vw;
              padding: 10px 1.5rem 15px 1.5rem;
              overflow-x: auto;
              scroll-behavior: smooth;
              -webkit-overflow-scrolling: touch;
              scrollbar-width: none;
              justify-content: flex-start;
              box-sizing: border-box;
            }
            .top5-row::-webkit-scrollbar {
              display: none;
            }
            @media (min-width: 768px) {
              .top5-row {
                justify-content: center;
                padding: 10px 4px 15px 4px;
                margin: 0;
                width: 100%;
                left: auto;
                right: auto;
                position: static;
              }
            }
            .top5-card {
              flex: 0 0 135px;
              min-width: 135px;
            }
            @media (min-width: 768px) {
              .top5-card {
                flex: 1 1 0px;
                max-width: 148px;
                min-width: 0;
              }
            }
          `}</style>
          <div className="top5-row" ref={topRowRef}>
            {visualTopBooks.map((book) => {
              const originalIdx = displayTop5.indexOf(book);
              const rankLabels = ["TOP 1", "TOP 2", "TOP 3", "TOP 4", "TOP 5"];
              const rankColors = ["#c9a84c", "#9ca3af", "#a0785a", "#818cf8", "#34d399"];
              const cardBgColor = top5Colors[originalIdx] || "rgba(128,128,128,1)";
              return (
                <motion.div
                  key={book.id}
                  className="top5-card"
                  onClick={() => setActiveBook(book)}
                  whileTap={{ scale: 0.97 }}
                  transition={iosSpring}
                  style={{
                    borderRadius: "14px",
                    background: getDarkenedColor(cardBgColor, 0.35, 0.9),
                    border: `1px solid ${cardBgColor.replace(/,[\d.]+\)$/, ",0.4)")}`,
                    padding: "10px 6px 12px 6px",
                    cursor: "pointer",
                    transition: "background 0.3s, border-color 0.3s",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.18)"
                  }}
                  whileHover={{ y: -2 }}
                >
                  {/* Cover */}
                  <div style={{
                    aspectRatio: "2/3",
                    borderRadius: "9px",
                    overflow: "hidden",
                    marginBottom: "10px",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.22)",
                    width: "100%",
                    maxWidth: "90px"
                  }}>
                    <SmartCover book={book} grayscale={false} />
                  </div>

                  {/* Rank */}
                  <span style={{
                    fontSize: "0.5rem", fontWeight: "800",
                    color: rankColors[originalIdx], letterSpacing: "0.1em",
                    display: "block", marginBottom: "4px",
                    textAlign: "center"
                  }}>
                    {rankLabels[originalIdx]}
                  </span>

                  {/* Title */}
                  <p style={{
                    fontSize: "0.72rem", fontWeight: "700",
                    color: "#ffffff", margin: "0 0 3px 0",
                    lineHeight: "1.25",
                    overflow: "hidden", display: "-webkit-box",
                    WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                    textAlign: "center", width: "100%"
                  }}>
                    {book.title}
                  </p>

                  {/* Author + Stars */}
                  <p style={{
                    fontSize: "0.6rem", color: "rgba(255, 255, 255, 0.6)", margin: "0 0 5px 0",
                    overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                    textAlign: "center", width: "100%"
                  }}>
                    {book.author}
                  </p>
                  {book.rating ? (
                    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                      <span style={{ fontSize: "0.55rem", color: rankColors[originalIdx], letterSpacing: "0.5px" }}>
                        {"★".repeat(book.rating)}
                      </span>
                    </div>
                  ) : null}
                </motion.div>
              );
            })}
          </div>



        </div>
      )}

      {/* Dedicated Currently Reading Section — compact, simple, minimalist horizontal row */}
      {mounted && readingBooks.length > 0 && filter !== "completed" && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.6rem",
            padding: "0 4px"
          }}>
            <h3 style={{
              fontSize: "0.82rem",
              fontWeight: "700",
              color: "var(--text-primary)",
              margin: 0,
              letterSpacing: "-0.01em",
              fontFamily: "var(--font-sans)"
            }}>
              Currently Reading <span style={{
                fontSize: "0.72rem",
                color: "#f59e0b",
                fontWeight: "600",
                marginLeft: "4px"
              }}>({readingBooks.length})</span>
            </h3>
          </div>

          <div 
            style={{
              display: "flex",
              gap: "1.2rem",
              overflowX: "auto",
              padding: "8px 4px 12px 4px",
              width: "100%",
              scrollbarWidth: "none",
              msOverflowStyle: "none"
            }}
            className="hide-scrollbar"
          >
            <style>{`
              .hide-scrollbar::-webkit-scrollbar {
                display: none !important;
                width: 0 !important;
                height: 0 !important;
                background: transparent !important;
              }
            `}</style>
            {readingBooks.map(book => (
              <div key={book.id} style={{ flex: "0 0 100px", width: "100px", flexShrink: 0, cursor: "pointer" }} onClick={() => setActiveBook(book)}>
                {/* Cover card */}
                <div style={{
                  width: "100%",
                  aspectRatio: "2/3",
                  borderRadius: "4px 6px 6px 4px",
                  overflow: "hidden",
                  boxShadow: "0 6px 12px rgba(0,0,0,0.18)",
                  position: "relative",
                  marginBottom: "0.4rem"
                }}>
                  <SmartCover book={book} grayscale={false} />
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0, width: "11%",
                    background: "linear-gradient(to right, rgba(0,0,0,0.2) 0%, transparent 100%)",
                    pointerEvents: "none"
                  }} />
                </div>
                {/* Info */}
                <p style={{
                  fontSize: "0.62rem",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  margin: "0 0 2px 0",
                  lineHeight: "1.2",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis"
                }}>{book.title}</p>
                
                {/* Progress bar */}
                <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "3px" }}>
                  <div style={{ flex: 1, height: "3px", backgroundColor: "rgba(150,150,150,0.12)", borderRadius: "1.5px", overflow: "hidden" }}>
                    <div style={{ width: `${book.progress || 0}%`, height: "100%", backgroundColor: "#f59e0b" }} />
                  </div>
                  <span style={{ fontSize: "0.52rem", fontWeight: "700", color: "#f59e0b", flexShrink: 0 }}>{book.progress || 0}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mounted && displayBooks.length === 0 ? (
        <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
          No books found in this category.
        </div>
      ) : (
        /* Genre Grouped List: horizontal scroll rows with see-all expand toggles */
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {groupedBooks.map(genre => {
            const isExpanded = !!expandedGenres[genre.id];
            const canExpand = genre.books.length > 5;
            return (
              <div key={genre.id} style={{ display: "flex", flexDirection: "column" }}>
                {/* Genre Header */}
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                  padding: "0 4px"
                }}>
                  <h3 style={{
                    fontSize: "0.82rem",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                    margin: 0,
                    letterSpacing: "-0.01em",
                    fontFamily: "var(--font-sans)"
                  }}>
                    {t(`genre_${genre.id}` as any) || genre.name} <span style={{
                      fontSize: "0.72rem",
                      color: "var(--text-secondary)",
                      fontWeight: "500",
                      marginLeft: "4px",
                      opacity: 0.6
                    }}>({genre.books.length})</span>
                  </h3>
                  
                  {canExpand && (
                    <button
                      onClick={() => {
                        setExpandedGenres(prev => ({
                          ...prev,
                          [genre.id]: !prev[genre.id]
                        }));
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#c9a84c",
                        fontSize: "0.68rem",
                        fontWeight: "700",
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        cursor: "pointer",
                        padding: "4px 8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        transition: "opacity 0.2s"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                    >
                      <span>{isExpanded ? "Show Less" : "See All"}</span>
                      <svg
                        width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                        style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Genre Content */}
                <AnimatePresence mode="wait" initial={false}>
                  {isExpanded ? (
                    /* Expanded multi-column responsive grid: 4 columns on mobile, auto-fill on desktop */
                    <motion.div 
                      key="expanded"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="genre-expanded-grid"
                    >
                      <style>{`
                        .genre-expanded-grid {
                          display: grid;
                          grid-template-columns: repeat(3, minmax(0, 1fr));
                          gap: 1rem 0.4rem;
                          padding: 10px 4px;
                        }
                        @media (min-width: 600px) {
                          .genre-expanded-grid {
                            grid-template-columns: repeat(auto-fill, minmax(115px, 1fr));
                            gap: 2rem 1.25rem;
                          }
                        }
                      `}</style>
                      {genre.books.map(book => (
                        <LibraryBookCard key={book.id} book={book} onClick={() => setActiveBook(book)} />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="collapsed"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        display: "flex",
                      gap: "1.25rem",
                      overflowX: "auto",
                      padding: "10px 4px 15px 4px",
                      width: "100%",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none"
                    }} 
                    className="hide-scrollbar"
                  >
                    <style>{`
                      .hide-scrollbar::-webkit-scrollbar {
                        display: none !important;
                        width: 0 !important;
                        height: 0 !important;
                        background: transparent !important;
                      }
                    `}</style>
                    {genre.books.map(book => (
                      <div key={book.id} style={{ flex: "0 0 115px", width: "115px", flexShrink: 0 }}>
                        <LibraryBookCard book={book} onClick={() => setActiveBook(book)} />
                      </div>
                    ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* LIGHTBOX MODAL: POLAROID FINE ART REVIEW */}
      {mounted && typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {activeBook && (() => {
            const modalBg = isDark ? "rgba(28, 28, 30, 0.85)" : "rgba(255, 255, 255, 0.9)";
            const modalColor = isDark ? "#ffffff" : "#1c1c1e";
            const modalBorder = isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(0, 0, 0, 0.08)";
            const modalShadow = isDark ? "0 30px 60px rgba(0,0,0,0.65)" : "0 30px 60px rgba(0,0,0,0.15)";
            const backdropBlur = "blur(30px) saturate(190%)";
            const separatorColor = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.06)";
            const titleColor = isDark ? "#ffffff" : "#1c1c1e";
            const authorColor = isDark ? "#8e8e93" : "#6c6c70";
            const labelColor = isDark ? "#d4af37" : "#c9a84c";
            const reviewTextColor = isDark ? "#e5e5ea" : "#2c2c2e";

            return (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveBook(null)}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 99999,
                  cursor: "zoom-out",
                  padding: "20px"
                }}
              >
                <motion.div
                  initial={{ scale: 0.94, y: 12 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.94, y: 12 }}
                  transition={{ type: "spring", damping: 26, stiffness: 280 }}
                  onClick={(e) => e.stopPropagation()}
                  className="hide-scrollbar"
                  style={{
                    backgroundColor: modalBg,
                    color: modalColor,
                    borderRadius: "24px",
                    padding: "24px 20px 28px 20px",
                    boxShadow: modalShadow,
                    border: modalBorder,
                    backdropFilter: backdropBlur,
                    WebkitBackdropFilter: backdropBlur,
                    width: "100%",
                    maxWidth: "400px",
                    maxHeight: "85vh",
                    overflow: "hidden",
                    cursor: "default",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                  }}
                >
                  {/* iOS Close Button */}
                  <button 
                    onClick={() => setActiveBook(null)}
                    style={{
                      position: "absolute",
                      top: "14px",
                      right: "14px",
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: isDark ? "#ffffff" : "#000000",
                      zIndex: 10,
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"; }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>

                  {/* Cover in the Pop-up */}
                  <div style={{
                    width: "55%",
                    aspectRatio: "2/3",
                    margin: "0 auto 1.25rem auto",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: isDark ? "5px 10px 30px rgba(0,0,0,0.5)" : "5px 10px 25px rgba(0,0,0,0.2)",
                    backgroundColor: isDark ? "#1c1c1e" : "#f5f5f7",
                    position: "relative",
                    flexShrink: 0
                  }}>
                    <SmartCover book={activeBook} grayscale={false} />
                    <div style={{
                      position: "absolute", left: 0, top: 0, bottom: 0, width: "12%",
                      background: "linear-gradient(to right, rgba(0,0,0,0.2) 0%, transparent 100%)",
                      pointerEvents: "none",
                    }} />
                  </div>

                  {/* Title & Author */}
                  <div style={{ textAlign: "center", marginBottom: "0.75rem", flexShrink: 0 }}>
                    <h2 style={{
                      fontSize: "1.1rem",
                      fontWeight: "800",
                      color: titleColor,
                      margin: "0 0 4px 0",
                      lineHeight: "1.25",
                      letterSpacing: "-0.015em"
                    }}>{activeBook.title}</h2>
                    <p style={{
                      fontSize: "0.82rem",
                      color: authorColor,
                      margin: 0,
                      fontWeight: "500"
                    }}>{activeBook.author}</p>
                  </div>

                  {/* Stars & Read Date */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: separatorColor,
                    borderBottom: separatorColor,
                    borderTopStyle: "solid",
                    borderTopWidth: "1px",
                    borderBottomStyle: "solid",
                    borderBottomWidth: "1px",
                    padding: "10px 4px",
                    marginBottom: "1.25rem",
                    flexShrink: 0
                  }}>
                    <div style={{ fontSize: "0.85rem", color: labelColor, letterSpacing: "1px" }}>
                      {activeBook.status === "completed" && (
                        <>{"★".repeat(activeBook.rating ?? 0)}{"☆".repeat(5 - (activeBook.rating ?? 0))}</>
                      )}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: authorColor, fontWeight: "600", letterSpacing: "-0.01em" }}>
                      {activeBook.completedAt ? `Read ${formatDate(activeBook.completedAt)}` : activeBook.status === "reading" ? `Reading (${activeBook.progress}%)` : "To Read"}
                    </span>
                  </div>

                  {/* Story/Review Text */}
                  <div 
                    className="hide-scrollbar"
                    style={{
                      fontSize: "0.86rem",
                      lineHeight: "1.65",
                      color: reviewTextColor,
                      textAlign: "left",
                      whiteSpace: "pre-wrap",
                      padding: "0 4px",
                      overflowY: "auto",
                      flex: 1
                    }}
                    dangerouslySetInnerHTML={{
                      __html: activeBook.review 
                        ? activeBook.review 
                        : activeBook.status === "reading" 
                          ? `Currently reading — ${activeBook.progress ?? 0}% through. Review coming soon.` 
                          : "No review written yet."
                    }}
                  />

                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
