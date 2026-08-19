"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "tech", label: "Tech & Code" },
  { id: "design", label: "Design & 3D" },
  { id: "philosophy", label: "Philosophy & Books" },
  { id: "personal", label: "Personal" },
];

function getCategoryFromText(text: string): string {
  const lower = (text || "").toLowerCase();
  if (lower.includes("tech") || lower.includes("stack") || lower.includes("coding") || lower.includes("rust") || lower.includes("next") || lower.includes("code") || lower.includes("react") || lower.includes("tutor")) {
    return "tech";
  }
  if (lower.includes("design") || lower.includes("ui") || lower.includes("ux") || lower.includes("3d") || lower.includes("render") || lower.includes("studio") || lower.includes("object")) {
    return "design";
  }
  if (lower.includes("buku") || lower.includes("book") || lower.includes("baca") || lower.includes("mind") || lower.includes("perspektif") || lower.includes("pikiran") || lower.includes("filsafat") || lower.includes("philosophy")) {
    return "philosophy";
  }
  return "personal";
}

function FlippableQACard({ qa }: { qa: any }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rawAnswer = typeof qa.answer === "string" ? qa.answer.trim() : "";
  const hasAnswer =
    rawAnswer.length > 0 &&
    rawAnswer.toLowerCase() !== "null" &&
    rawAnswer.toLowerCase() !== "undefined";

  const questionText = qa.content || qa.question || "";
  const categoryId = getCategoryFromText(questionText);
  const categoryLabel = CATEGORIES.find((c) => c.id === categoryId)?.label || "Question";

  const answerText = hasAnswer
    ? rawAnswer
    : questionText.toLowerCase().includes("tech") || questionText.toLowerCase().includes("stack") || questionText.toLowerCase().includes("coding")
    ? "I rely on Next.js & React for web applications, custom Rust (Axum) for high-performance microservices, Tailwind/CSS for styling, and Figma for design systems."
    : questionText.toLowerCase().includes("baca") || questionText.toLowerCase().includes("book")
    ? "Some of my favorite reads include 'The Design of Everyday Things' by Don Norman, 'Meditations' by Marcus Aurelius, and works on minimal architecture."
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
          willChange: "transform",
        }}
      >
        {!isFlipped ? (
          /* FRONT SIDE (QUESTION) */
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              background: "linear-gradient(145deg, #18181b 0%, #111113 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "18px",
              padding: "1.35rem 1.4rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.95rem",
              boxSizing: "border-box",
              boxShadow: "0 8px 30px rgba(0,0,0,0.35)",
              minHeight: "135px",
              justifyContent: "space-between",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
            }}
            className="qa-card-hover"
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    fontSize: "0.58rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.55)",
                    fontFamily: "var(--font-sans, -apple-system, sans-serif)",
                  }}
                >
                  {qa.name ? qa.name : qa.author ? qa.author : "ANONYMOUS"}
                </span>
                <span
                  style={{
                    fontSize: "0.52rem",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.35)",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    textTransform: "uppercase",
                  }}
                >
                  {categoryLabel}
                </span>
              </div>

              <span
                style={{
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: "rgba(255,255,255,0.75)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontFamily: "var(--font-sans, -apple-system, sans-serif)",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  padding: "3px 8px",
                  borderRadius: "20px",
                }}
              >
                FLIP ↺
              </span>
            </div>

            <p
              style={{
                fontSize: "0.92rem",
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.95)",
                margin: 0,
                fontFamily: "var(--font-sans, -apple-system, sans-serif)",
                fontWeight: 500,
                letterSpacing: "-0.015em",
              }}
            >
              “{questionText}”
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.2rem" }}>
              <span style={{ fontSize: "0.56rem", color: "rgba(255,255,255,0.4)" }}>
                {new Date(qa.published || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <span style={{ fontSize: "0.56rem", color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>
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
              background: "linear-gradient(145deg, #121214 0%, #09090b 100%)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#FFFFFF",
              borderRadius: "18px",
              padding: "1.35rem 1.4rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.95rem",
              boxSizing: "border-box",
              boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
              minHeight: "135px",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.8)", boxShadow: "0 0 6px rgba(255,255,255,0.4)" }} />
                <span style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.1em", color: "#FFFFFF", fontFamily: "var(--font-sans, -apple-system, sans-serif)" }}>
                  IVAN
                </span>
              </div>
              <span
                style={{
                  fontSize: "0.56rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: "var(--font-sans, -apple-system, sans-serif)",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  padding: "3px 8px",
                  borderRadius: "20px",
                }}
              >
                BACK ↻
              </span>
            </div>

            <p
              style={{
                fontSize: "0.88rem",
                lineHeight: 1.62,
                margin: 0,
                color: "rgba(255,255,255,0.92)",
                fontFamily: "var(--font-sans, -apple-system, sans-serif)",
                fontWeight: 400,
                letterSpacing: "-0.01em",
              }}
            >
              {answerText}
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.2rem" }}>
              <span style={{ fontSize: "0.54rem", color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-sans, -apple-system, sans-serif)" }}>
                Answered · {new Date(qa.answeredAt || qa.published || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <span style={{ fontSize: "0.54rem", color: "rgba(255,255,255,0.3)" }}>
                Personal Response
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function AskPage() {
  const [qaList, setQaList] = useState<any[]>([]);
  const [loadingQA, setLoadingQA] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [senderName, setSenderName] = useState("");
  const [qaContent, setQaContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showToast, setShowToast] = useState(false);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`/api/questions?answered=true&t=${Date.now()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setQaList(data);
      }
    } catch {
      setQaList([]);
    } finally {
      setLoadingQA(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const sortedQAs = useMemo(() => {
    return [...qaList]
      .filter((q) => q.content && q.content.trim().length > 0)
      .sort((a, b) => new Date(b.published || 0).getTime() - new Date(a.published || 0).getTime());
  }, [qaList]);

  const filteredQAs = useMemo(() => {
    return sortedQAs.filter((qa) => {
      const content = (qa.content || qa.question || "").toLowerCase();
      const name = (qa.name || qa.author || "").toLowerCase();
      const answer = (qa.answer || "").toLowerCase();

      // Category filter
      if (selectedCategory !== "all") {
        const cat = getCategoryFromText(content);
        if (cat !== selectedCategory) return false;
      }

      // Search filter
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        return content.includes(query) || name.includes(query) || answer.includes(query);
      }

      return true;
    });
  }, [sortedQAs, selectedCategory, searchQuery]);

  const leftCol = useMemo(() => filteredQAs.filter((_, i) => i % 2 === 0), [filteredQAs]);
  const rightCol = useMemo(() => filteredQAs.filter((_, i) => i % 2 === 1), [filteredQAs]);

  const handleQASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qaContent.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: qaContent.trim(), name: senderName.trim() }),
      });
      if (!res.ok) throw new Error("Failed to send question");
      setQaContent("");
      setSenderName("");
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.8 }, colors: ["#3b82f6", "#ffffff", "#60a5fa"] });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      fetchQuestions();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send question");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ask-page-container">
      <style>{`
        /* ── FORCE LAYOUT WRAPPER OVERRIDE FOR SAFARI ── */
        body, html, .layout-wrapper, .content-wrapper, main, main > div {
          margin: 0 !important;
          padding: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
        }

        /* ── ASK PAGE CONTAINER (PINNED VIEWPORT GRID) ── */
        .ask-page-container {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          background: #09090b;
          color: #FFFFFF;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
          display: grid !important;
          grid-template-columns: 440px 1fr !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
          z-index: 100 !important;
        }

        /* ── RIGHT FEED: ANSWERED QUESTIONS (DARK) ── */
        .ask-left-stream {
          width: 100%;
          min-width: 0;
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          box-sizing: border-box;
          padding: 2.2rem 2.4rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background: #09090b;
        }

        .ask-left-stream::-webkit-scrollbar { width: 4px; }
        .ask-left-stream::-webkit-scrollbar-track { background: transparent; }
        .ask-left-stream::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 4px; }

        .ask-stream-header {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          padding-bottom: 0.5rem;
          padding-bottom: 1.1rem;
        }

        .ask-header-top {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
        }

        .ask-stream-title {
          font-size: clamp(1.4rem, 2vw, 1.85rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          color: #FFFFFF;
          margin: 0;
        }

        .ask-filter-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          overflow-x: auto;
          no-scrollbar;
          padding-bottom: 0.2rem;
        }

        .ask-filter-chip {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: -0.01em;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
        }

        .ask-filter-chip:hover {
          background: rgba(255,255,255,0.09);
          color: #FFFFFF;
          border-color: rgba(255,255,255,0.18);
        }

        .ask-filter-chip.active {
          background: #FFFFFF;
          color: #000000;
          border-color: #FFFFFF;
          font-weight: 700;
          box-shadow: 0 2px 10px rgba(255,255,255,0.2);
        }

        .ask-search-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.45rem 0.85rem;
          width: 100%;
          box-sizing: border-box;
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .ask-search-box:focus-within {
          border-color: rgba(255, 255, 255, 0.35);
          background: rgba(255, 255, 255, 0.08);
        }

        .ask-search-input {
          background: transparent;
          border: none;
          outline: none;
          color: #FFFFFF;
          font-size: 0.8rem;
          width: 100%;
          font-family: inherit;
        }

        .ask-search-input::placeholder {
          color: rgba(255, 255, 255, 0.35);
        }

        .ask-masonry-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 1.1rem;
          align-items: start;
          width: 100%;
        }

        .qa-card-hover:hover {
          border-color: rgba(255, 255, 255, 0.2) !important;
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(0, 0, 0, 0.5) !important;
        }

        /* ── LEFT COLUMN: STICKY OCEAN HERO PHOTO ASK QUESTION FORM ── */
        .ask-right-hero-form {
          position: relative;
          width: 100%;
          height: 100vh;
          background: #000000;
          overflow: hidden;
          box-sizing: border-box;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
        }

        .ask-hero-bg-photo {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background-image: url("/images/ocean_hero_mono.png");
          background-size: cover;
          background-position: center bottom;
          filter: grayscale(100%) contrast(1.15);
          z-index: 1;
          transition: transform 1.2s ease-out;
        }

        .ask-hero-overlay-dark {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            to bottom,
            #000000 0%,
            #000000 35px,
            rgba(0,0,0,0.65) 110px,
            rgba(0,0,0,0.96) 100%
          );
          z-index: 2;
        }

        .ask-hero-content-wrap {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          height: 100%;
          justify-content: flex-end;
          padding: 2.4rem 2rem 2.4rem 5rem;
          box-sizing: border-box;
          color: #FFFFFF;
        }

        .ask-form-title {
          font-size: 1.45rem;
          font-weight: 800;
          margin: 0 0 0.35rem 0;
          color: #FFFFFF;
          letter-spacing: -0.02em;
        }

        .ask-form-sub {
          font-size: 0.8rem;
          line-height: 1.5;
          color: rgba(255,255,255,0.72);
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif);
          margin: 0 0 1.25rem 0;
        }

        .ask-form-card-inner {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .ask-input-box {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 14px;
          padding: 0.75rem 1rem;
          transition: all 0.25s ease;
        }

        .ask-input-box:focus-within {
          border-color: rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 18px rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.12);
        }

        .ask-text-field {
          color: #FFFFFF;
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          font-size: 0.88rem;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif);
          letter-spacing: -0.01em;
        }

        .ask-text-field::placeholder {
          color: rgba(255, 255, 255, 0.4);
          font-style: normal;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif);
        }

        .ask-submit-btn {
          background: #FFFFFF;
          color: #111111;
          border: none;
          border-radius: 20px;
          padding: 0.72rem 1.6rem;
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.25);
          align-self: flex-start;
          margin-top: 0.4rem;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif);
        }

        .ask-submit-btn:hover:not(:disabled) {
          background: #EAEAEA;
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(255, 255, 255, 0.35);
        }

        .ask-submit-btn:active:not(:disabled) {
          transform: scale(0.96);
        }

        .ask-submit-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* ─────────────────────────────────────────────
           PREMIUM MOBILE LAYOUT FOR /ask PAGE
           ───────────────────────────────────────────── */
        @media (max-width: 920px) {
          .ask-page-container {
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 100dvh !important;
            padding-top: 54px !important;
            grid-template-columns: 1fr !important;
            overflow: visible !important;
            background: #080808 !important;
          }

          .ask-right-hero-form {
            position: relative !important;
            width: 100% !important;
            height: auto !important;
            min-height: 380px !important;
            border-right: none !important;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          }

          .ask-hero-content-wrap {
            padding: 2rem 1.4rem !important;
            justify-content: flex-end !important;
          }

          .ask-left-stream {
            height: auto !important;
            padding: 2rem 1.25rem 5rem !important;
            background: #09090b !important;
          }

          .ask-masonry-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ── LEFT: STICKY OCEAN HERO PHOTO ASK QUESTION FORM ── */}
      <div className="ask-right-hero-form">
        <div className="ask-hero-bg-photo" />
        <div className="ask-hero-overlay-dark" />

        <div className="ask-hero-content-wrap">
          <h3 className="ask-form-title">Ask Ivan Anything</h3>
          <p className="ask-form-sub">
            Ask anonymously or with your handle. Read &amp; replied personally.
          </p>

          <form onSubmit={handleQASubmit} className="ask-form-card-inner">
            {errorMsg && (
              <div style={{ border: "1px solid rgba(255,100,100,0.3)", borderRadius: "10px", padding: "8px 12px", color: "#ff6b6b", fontSize: "0.74rem", background: "rgba(255,50,50,0.1)" }}>
                {errorMsg}
              </div>
            )}

            <div className="ask-input-box">
              <textarea
                value={qaContent}
                onChange={(e) => setQaContent(e.target.value)}
                placeholder="Write your question..."
                maxLength={300}
                rows={3}
                disabled={isSubmitting}
                className="ask-text-field"
                style={{ resize: "none" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.4rem", paddingTop: "0.35rem", borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                <span style={{ fontSize: "0.56rem", color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-sans, -apple-system, sans-serif)" }}>
                  Anonymous
                </span>
                <span style={{ fontSize: "0.54rem", color: qaContent.length > 250 ? "#f87171" : "rgba(255,255,255,0.55)", fontWeight: qaContent.length > 250 ? 700 : 400 }}>
                  {qaContent.length} / 300
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !qaContent.trim()}
              className="ask-submit-btn"
            >
              {isSubmitting ? "SENDING..." : "SEND QUESTION ✦"}
            </button>
          </form>
        </div>
      </div>

      {/* ── RIGHT STREAM: ANSWERED QUESTIONS WITH 3D FLIPPABLE CARDS ── */}
      <div className="ask-left-stream">
        <div className="ask-stream-header">
          <div className="ask-header-top">
            <h1 className="ask-stream-title">Questions &amp; Answers</h1>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
              {filteredQAs.length} {filteredQAs.length === 1 ? "Question" : "Questions"}
            </span>
          </div>

          {/* Search Input Bar */}
          <div className="ask-search-box">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search answered questions, topics, or keywords..."
              className="ask-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: "0.75rem", padding: "0 4px" }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {loadingQA ? (
          <div style={{ padding: "5rem 0", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
            Loading answered questions…
          </div>
        ) : filteredQAs.length === 0 ? (
          <div style={{ padding: "5rem 0", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
            <p style={{ margin: 0, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>No matching questions found.</p>
            <p style={{ margin: 0, fontSize: "0.76rem" }}>Try searching with different keywords or switch categories.</p>
          </div>
        ) : (
          <div className="ask-masonry-grid">
            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {leftCol.map((qa) => (
                <FlippableQACard key={qa.id || qa.published} qa={qa} />
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              {rightCol.map((qa) => (
                <FlippableQACard key={qa.id || qa.published} qa={qa} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              position: "fixed",
              bottom: "2rem",
              right: "2rem",
              backgroundColor: "rgba(20,20,24,0.95)",
              color: "#FFFFFF",
              padding: "14px 24px",
              borderRadius: "24px",
              fontSize: "0.82rem",
              fontWeight: 700,
              zIndex: 9999,
              boxShadow: "0 16px 45px rgba(0,0,0,0.5)",
              border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(20px)",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <span style={{ color: "#3b82f6" }}>✦</span>
            <span>Question sent successfully! Ivan will review it shortly.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
