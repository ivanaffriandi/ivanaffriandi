"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { getFallbackBooks, getAllBooks } from "@/lib/books";
import type { BookItem } from "@/lib/books";
import { motion, AnimatePresence } from "framer-motion";

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
  if (duAuthors.some(a => book.author.includes(a))) return { label: "NL", color: "#2563eb" };
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
  const initialSrc = needsProxyImmediately ? null : (trimmedCover.startsWith("http") ? trimmedCover : null);

  const [src, setSrc] = useState<string | null>(initialSrc);
  const [ready, setReady] = useState(!needsProxyImmediately && !!initialSrc);
  const [hasTriedProxy, setHasTriedProxy] = useState(false);

  const fetchProxyCover = useCallback(() => {
    setReady(false);
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
    if (!tc || isHotlinkBlocked(tc) || !tc.startsWith("http")) {
      // No usable direct URL → go straight to proxy
      fetchProxyCover();
    } else {
      // Direct URL looks OK — try it, onError will proxy if it fails
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
      <div style={{
        width: "100%", 
        aspectRatio: "2/3",
        borderRadius: "4px 8px 8px 4px", 
        overflow: "hidden",
        boxShadow: hovered 
          ? "0 22px 44px -4px rgba(0,0,0,0.35), 0 14px 16px -6px rgba(0,0,0,0.25), 1px 1px 0px rgba(255,255,255,0.12) inset" 
          : "0 10px 22px -6px rgba(0,0,0,0.28), 0 4px 8px -4px rgba(0,0,0,0.2), 1px 1px 0px rgba(255,255,255,0.08) inset",
        position: "relative",
        backgroundColor: "rgba(128,128,128,0.06)",
        transform: hovered ? "translateY(-6px) scale(1.015) rotateY(-4deg)" : "translateY(0px) scale(1) rotateY(0deg)",
        transformStyle: "preserve-3d",
        perspective: "1000px",
        transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
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
          }}>READING</div>
        )}
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  // Start with static fallback (SSR-safe) then hydrate from API
  const [allBooks, setAllBooks] = useState<BookItem[]>(() => getFallbackBooks());
  const [filter, setFilter] = useState<"all" | "reading" | "completed">("all");
  const [activeBook, setActiveBook] = useState<BookItem | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Hydrate with fresh API data after mount — avoids SSR/client mismatch
    getAllBooks().then(books => {
      if (books && books.length > 0) setAllBooks(books);
    }).catch(() => {/* fallback already in state */});
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDark(media.matches);
      const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, []);

  const displayBooks = allBooks.filter(book => {
    if (filter === "reading") return book.status === "reading";
    if (filter === "completed") return book.status === "completed";
    return book.status === "reading" || book.status === "completed";
  });

  const completedCount = allBooks.filter(b => b.status === "completed").length;

  return (
    <div style={{
      maxWidth: 850, 
      margin: "0 auto",
      padding: "1.5rem 0.5rem 4rem 0.5rem",
      fontFamily: "var(--font-sans)",
    }}>


      <div style={{ 
        marginBottom: "2.5rem", 
        borderBottom: "1px solid rgba(150,150,150,0.15)", 
        paddingBottom: "1rem",
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
          }}>Library</h1>
          <p suppressHydrationWarning style={{
            fontFamily: "var(--font-sans)", fontSize: "0.72rem",
            color: "var(--text-secondary)", margin: 0, opacity: 0.65, fontWeight: "500"
          }}>
            {completedCount} books read
          </p>
        </div>

        {/* Minimalist Filter Toggle */}
        <div style={{
          display: "flex",
          backgroundColor: "rgba(150,150,150,0.06)",
          padding: "1.5px",
          borderRadius: "14px",
          border: "1px solid rgba(150,150,150,0.12)"
        }}>
          {(["all", "reading", "completed"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "4px 10px",
                fontSize: "0.62rem",
                fontWeight: "600",
                fontFamily: "var(--font-sans)",
                borderRadius: "12px",
                border: "none",
                backgroundColor: filter === f ? "var(--text-primary)" : "transparent",
                color: filter === f ? "var(--bg-color)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s",
                textTransform: "capitalize"
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {displayBooks.length === 0 ? (
        <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
          No books found in this category.
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "2.5rem 1.25rem",
        }}>
          {displayBooks.map(book => (
            <LibraryBookCard key={book.id} book={book} onClick={() => setActiveBook(book)} />
          ))}
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
                    overflowY: "auto",
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
                  <div style={{
                    fontSize: "0.86rem",
                    lineHeight: "1.65",
                    color: reviewTextColor,
                    textAlign: "left",
                    whiteSpace: "pre-wrap",
                    padding: "0 4px"
                  }}>
                    {activeBook.review 
                      ? activeBook.review 
                      : activeBook.status === "reading" 
                        ? `Currently reading — ${activeBook.progress ?? 0}% through. Review coming soon.` 
                        : "No review written yet."}
                  </div>

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
