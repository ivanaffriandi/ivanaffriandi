"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

function FlippableQACard({ qa }: { qa: any }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rawAnswer = typeof qa.answer === "string" ? qa.answer.trim() : "";
  const hasAnswer =
    rawAnswer.length > 0 &&
    rawAnswer.toLowerCase() !== "null" &&
    rawAnswer.toLowerCase() !== "undefined";

  const answerText = hasAnswer
    ? rawAnswer
    : qa.content?.toLowerCase().includes("tech") || qa.content?.toLowerCase().includes("stack")
    ? "I rely on Next.js & React for frontends, Rust (Axum/Tokio) for high-performance microservices, Tailwind/CSS for styling, and Figma for design systems."
    : qa.content?.toLowerCase().includes("time") || qa.content?.toLowerCase().includes("project")
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
              background: "#1A1A1A",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding: "1.25rem 1.35rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
              boxSizing: "border-box",
              boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
              minHeight: "125px",
              justifyContent: "space-between",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans, -apple-system, sans-serif)" }}>
                {qa.name ? qa.name : qa.author ? qa.author : "ANONYMOUS"} · {new Date(qa.published || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <span style={{ fontSize: "0.56rem", fontWeight: 700, letterSpacing: "0.06em", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", gap: "0.25rem", fontFamily: "var(--font-sans, -apple-system, sans-serif)" }}>
                FLIP ↺
              </span>
            </div>

            <p style={{ fontSize: "0.9rem", lineHeight: 1.55, color: "rgba(255,255,255,0.92)", margin: 0, fontFamily: "var(--font-sans, -apple-system, sans-serif)", fontWeight: 500, letterSpacing: "-0.015em" }}>
              “{qa.content || qa.question}”
            </p>
          </div>
        ) : (
          /* BACK SIDE (ANSWER) */
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "#111111",
              color: "#FFFFFF",
              borderRadius: "16px",
              padding: "1.25rem 1.35rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.85rem",
              boxSizing: "border-box",
              boxShadow: "0 14px 40px rgba(0,0,0,0.25)",
              minHeight: "125px",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.12)", paddingBottom: "0.5rem" }}>
              <span style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.12em", color: "#FFFFFF", fontFamily: "var(--font-sans, -apple-system, sans-serif)" }}>
                IVAN AFFRIANDI
              </span>
              <span style={{ fontSize: "0.54rem", fontWeight: 700, letterSpacing: "0.06em", color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-sans, -apple-system, sans-serif)" }}>
                BACK ↻
              </span>
            </div>

            <p style={{ fontSize: "0.86rem", lineHeight: 1.6, margin: 0, color: "rgba(255,255,255,0.95)", fontFamily: "var(--font-sans, -apple-system, sans-serif)", fontWeight: 400, letterSpacing: "-0.01em" }}>
              {answerText}
            </p>

            <span style={{ fontSize: "0.54rem", color: "rgba(255,255,255,0.45)", textAlign: "right", fontFamily: "var(--font-sans, -apple-system, sans-serif)" }}>
              {new Date(qa.answeredAt || qa.published || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function AskPage() {
  const [qaList, setQaList] = useState<any[]>([]);
  const [loadingQA, setLoadingQA] = useState(true);
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

  const leftCol = useMemo(() => sortedQAs.filter((_, i) => i % 2 === 0), [sortedQAs]);
  const rightCol = useMemo(() => sortedQAs.filter((_, i) => i % 2 === 1), [sortedQAs]);

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
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.8 }, colors: ["#ffffff", "#888888", "#cccccc"] });
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
          left: 54px !important;
          right: 0 !important;
          bottom: 0 !important;
          width: calc(100vw - 54px) !important;
          height: 100vh !important;
          background: #0D0D0D;
          color: #FFFFFF;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
          display: grid !important;
          grid-template-columns: 370px 1fr !important;
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
          padding: 2.2rem 2.2rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          background: #0D0D0D;
        }

        .ask-left-stream::-webkit-scrollbar { width: 4px; }
        .ask-left-stream::-webkit-scrollbar-track { background: transparent; }
        .ask-left-stream::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 4px; }

        .ask-stream-header {
          display: flex;
          align-items: baseline;
          gap: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-bottom: 0.85rem;
        }

        .ask-stream-title {
          font-size: clamp(1.4rem, 2vw, 1.85rem);
          font-weight: 700;
          letter-spacing: -0.03em;
          color: #FFFFFF;
          margin: 0;
        }

        .ask-stream-badge {
          font-size: 0.58rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: #888888;
          text-transform: uppercase;
        }

        .ask-masonry-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 1rem;
          align-items: start;
          width: 100%;
        }

        /* ── RIGHT COLUMN: STICKY OCEAN HERO PHOTO ASK QUESTION FORM ── */
        .ask-right-hero-form {
          position: relative;
          width: 100%;
          height: 100vh;
          background: #000000;
          overflow: hidden;
          box-sizing: border-box;
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
          padding: 2.2rem 1.6rem;
          box-sizing: border-box;
          color: #FFFFFF;
        }

        .ask-form-title {
          font-size: 1.4rem;
          font-weight: 700;
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
          font-size: 0.66rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.25);
          align-self: flex-start;
          margin-top: 0.4rem;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, sans-serif);
        }

        .ask-submit-btn:hover:not(:disabled) {
          background: #EAEAEA;
          transform: translateY(-1px);
        }

        .ask-submit-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* ─────────────────────────────────────────────
           PREMIUM MOBILE LAYOUT FOR /ask PAGE
           ───────────────────────────────────────────── */
        @media (max-width: 860px) {
          .ask-page-container {
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: auto !important;
            min-height: 100dvh !important;
            grid-template-columns: 1fr !important;
            overflow: visible !important;
            background: #0D0D0D !important;
          }

          /* Hero form panel: full-width cinematic banner on mobile */
          .ask-right-hero-form {
            position: relative !important;
            width: 100% !important;
            height: 72vw !important;
            min-height: 300px !important;
            max-height: 460px !important;
          }

          /* Show full form on mobile — nothing truncated */
          .ask-hero-content-wrap {
            padding: 1.5rem 1.25rem !important;
            justify-content: flex-end !important;
          }

          .ask-form-title {
            font-size: 1.2rem !important;
          }

          .ask-form-sub {
            font-size: 0.74rem !important;
            margin-bottom: 0.85rem !important;
          }

          /* Dark stream fills below hero seamlessly */
          .ask-left-stream {
            height: auto !important;
            padding: 1.75rem 1.1rem 4rem !important;
            background: #0D0D0D !important;
          }

          .ask-stream-title {
            font-size: 1.2rem !important;
          }

          /* Single-column masonry on mobile */
          .ask-masonry-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 430px) {
          .ask-right-hero-form {
            height: 75vw !important;
            min-height: 280px !important;
          }

          .ask-hero-content-wrap {
            padding: 1.25rem 1rem !important;
          }

          .ask-left-stream {
            padding: 1.5rem 0.9rem 3.5rem !important;
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
              <div style={{ border: "1px solid rgba(255,100,100,0.3)", borderRadius: "8px", padding: "6px 10px", color: "#ff6b6b", fontSize: "0.74rem" }}>
                {errorMsg}
              </div>
            )}

            <div className="ask-input-box">
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your name (optional)"
                maxLength={40}
                disabled={isSubmitting}
                className="ask-text-field"
              />
            </div>

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
                  Anonymous by default
                </span>
                <span style={{ fontSize: "0.54rem", color: "rgba(255,255,255,0.55)" }}>
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
          <h1 className="ask-stream-title">Questions &amp; Answers</h1>
        </div>

        {loadingQA ? (
          <div style={{ padding: "4rem 0", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
            Loading answered questions…
          </div>
        ) : sortedQAs.length === 0 ? (
          <div style={{ padding: "4rem 0", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>
            No answered questions yet. Be the first!
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
    </div>
  );
}
