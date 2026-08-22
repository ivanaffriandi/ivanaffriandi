"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import Link from "next/link";

function TwoCardStackedQA({
  qa,
  isActive,
  onOpen,
  onClose,
}: {
  qa: any;
  isActive: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const rawAnswer = typeof qa.answer === "string" ? qa.answer.trim() : "";
  const hasAnswer =
    rawAnswer.length > 0 &&
    rawAnswer.toLowerCase() !== "null" &&
    rawAnswer.toLowerCase() !== "undefined";

  const questionText = qa.content || qa.question || "";
  const senderName = qa.name ? qa.name : qa.author ? qa.author : "Anonymous";

  const answerText = hasAnswer
    ? rawAnswer
    : questionText.toLowerCase().includes("tech") ||
      questionText.toLowerCase().includes("stack") ||
      questionText.toLowerCase().includes("coding")
    ? "I rely on Next.js & React for frontends, Rust (Axum) for high-performance microservices, Tailwind/CSS for expressive design systems, and Figma for craft."
    : questionText.toLowerCase().includes("baca") ||
      questionText.toLowerCase().includes("book")
    ? "Some of my favorite foundational reads include 'The Design of Everyday Things' by Don Norman, 'Meditations' by Marcus Aurelius, and works on architecture & minimalism."
    : "Thank you for asking! I approach every project with focus on clean aesthetics, tactile interaction details, high performance, and intuitive design.";

  return (
    <div
      className="qa-card-wrapper"
      onClick={(e) => {
        e.stopPropagation();
        if (!isActive) onOpen();
      }}
    >
      <div
        className="qa-stack-container"
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          boxSizing: "border-box",
          overflow: "hidden",
          touchAction: "pan-x",
          borderRadius: "28px",
        }}
      >
        {/* ── CARD 1: QUESTION CARD (TAP ANYWHERE TO OPEN ANSWER) ── */}
        <motion.div
          animate={{
            height: isActive ? 154 : "100%",
            borderRadius: isActive ? 22 : 28,
          }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 26,
            mass: 0.8,
          }}
          className={`qa-question-card ${isActive ? "qa-card-inverted" : "qa-card-normal"}`}
          onClick={() => {
            if (!isActive) onOpen();
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            padding: isActive ? "1rem 1.3rem 0.9rem" : "1.3rem 1.4rem 1.1rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxSizing: "border-box",
            cursor: isActive ? "default" : "pointer",
            boxShadow: "var(--ask-shadow)",
            overflow: "hidden",
            zIndex: 10,
            touchAction: "pan-x",
            willChange: "height, border-radius",
          }}
        >
          {/* TOP ROW: SENDER & DATE */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexShrink: 0 }}>
            <span
              style={{
                fontSize: "0.88rem",
                fontWeight: 800,
                letterSpacing: "-0.01em",
              }}
              className={isActive ? "qa-inv-primary" : "qa-text-primary"}
            >
              {senderName}
            </span>
            <span
              style={{
                fontSize: "0.62rem",
                fontWeight: 500,
              }}
              className={isActive ? "qa-inv-muted" : "qa-text-muted"}
            >
              {new Date(qa.published || Date.now()).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* QUOTE & QUESTION CONTENT */}
          <div
            className="qa-no-scrollbar"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.15rem",
              flex: 1,
              overflowY: "auto",
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              justifyContent: "center",
              margin: isActive ? "0.1rem 0" : "0.4rem 0",
            }}
            onClick={(e) => {
              if (!isActive) {
                onOpen();
              } else {
                e.stopPropagation();
              }
            }}
          >
            <div
              className="qa-quote-mark"
              style={{
                lineHeight: 0.9,
                fontSize: isActive ? "1.6rem" : "2.8rem",
                fontFamily: "Georgia, serif",
                fontWeight: 900,
                userSelect: "none",
                opacity: 0.95,
                flexShrink: 0,
                transition: "font-size 0.3s ease",
              }}
            >
              “
            </div>

            <p
              style={{
                fontSize: isActive ? "0.9rem" : "0.98rem",
                lineHeight: 1.5,
                margin: 0,
                fontWeight: 450,
                letterSpacing: "-0.015em",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
              className={isActive ? "qa-inv-primary" : "qa-text-primary"}
            >
              {questionText}
            </p>
          </div>

          {/* COMPACT IOS FOOTER */}
          {!isActive && (
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                paddingTop: "0.4rem",
                flexShrink: 0,
              }}
              className="qa-card-divider"
            >
              <button
                type="button"
                className="ios-action-pill"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen();
                }}
              >
                <span>Read answer</span>
                <span className="ios-chevron">›</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* ── CARD 2: SEPARATE ANSWER CARD ── */}
        <motion.div
          initial={false}
          animate={{
            y: isActive ? 0 : 320,
            opacity: isActive ? 1 : 0,
            scale: isActive ? 1 : 0.94,
          }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 26,
            mass: 0.8,
          }}
          className="qa-answer-card"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "calc(100% - 162px)",
            borderRadius: "24px",
            padding: "1.1rem 1.3rem 1rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxSizing: "border-box",
            overflow: "hidden",
            background: "var(--ask-card-bg)",
            border: "1px solid var(--ask-border)",
            boxShadow: "var(--ask-shadow)",
            zIndex: 5,
            pointerEvents: isActive ? "auto" : "none",
            touchAction: "pan-x",
            willChange: "transform, opacity",
          }}
        >
          {/* TOP ROW: IVAN & DATE */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <span style={{ fontSize: "0.88rem", fontWeight: 800, letterSpacing: "-0.01em" }} className="qa-text-primary">
                Ivan
              </span>
              <span style={{ fontSize: "0.75rem" }} className="qa-text-primary">✦</span>
            </div>

            <span style={{ fontSize: "0.62rem", fontWeight: 500 }} className="qa-text-muted">
              {new Date(qa.answeredAt || qa.published || Date.now()).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          {/* SCROLLABLE ANSWER CONTENT */}
          <div
            className="qa-no-scrollbar"
            style={{
              flex: 1,
              overflowY: "auto",
              overscrollBehavior: "contain",
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              paddingRight: "0.1rem",
              margin: "0.2rem 0 0.35rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              style={{
                fontSize: "0.92rem",
                lineHeight: 1.6,
                margin: 0,
                letterSpacing: "-0.01em",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
              className="qa-text-primary"
            >
              {answerText}
            </p>
          </div>

          {/* COMPACT IOS BACK BUTTON */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              paddingTop: "0.45rem",
              borderTop: "1px solid var(--ask-border)",
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              className="ios-action-pill"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <span className="ios-chevron-back">‹</span>
              <span>Back</span>
            </button>
          </div>
        </motion.div>
      </div>
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeQAId, setActiveQAId] = useState<string | number | null>(null);

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
      setIsDrawerOpen(false);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.85 },
        colors: ["#FFFFFF", "#888888", "#000000"],
      });
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      fetchQuestions();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send question");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="ask-viewport-root"
      onClick={() => {
        if (activeQAId !== null) setActiveQAId(null);
      }}
    >
      <style>{`
        /* ── SYSTEM THEME SYNCHRONIZATION VIA CSS VARIABLES ── */
        :root {
          --ask-bg: var(--bg-color, #F6F6F4);
          --ask-card-bg: var(--card-bg-1, #FFFFFF);
          --ask-text: var(--text-primary, #121212);
          --ask-text-sub: var(--text-secondary, #525252);
          --ask-border: var(--border-color, rgba(0, 0, 0, 0.08));
          --ask-badge-bg: rgba(0, 0, 0, 0.05);
          --ask-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04);
          
          /* INVERTED CARD IN LIGHT MODE */
          --ask-inv-bg: #121212;
          --ask-inv-text: #FFFFFF;
          --ask-inv-sub: #A0A0A0;
          --ask-inv-border: rgba(255, 255, 255, 0.14);
        }

        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) {
            --ask-bg: var(--bg-color, #121212);
            --ask-card-bg: var(--card-bg-1, #1A1A1A);
            --ask-text: var(--text-primary, #F6F6F4);
            --ask-text-sub: var(--text-secondary, #A0A0A0);
            --ask-border: var(--border-color, rgba(255, 255, 255, 0.1));
            --ask-badge-bg: rgba(255, 255, 255, 0.07);
            --ask-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.6);

            /* INVERTED CARD IN DARK MODE */
            --ask-inv-bg: #FFFFFF;
            --ask-inv-text: #121212;
            --ask-inv-sub: #555555;
            --ask-inv-border: rgba(0, 0, 0, 0.14);
          }
        }

        html[data-theme="dark"] {
          --ask-bg: var(--bg-color, #121212);
          --ask-card-bg: var(--card-bg-1, #1A1A1A);
          --ask-text: var(--text-primary, #F6F6F4);
          --ask-text-sub: var(--text-secondary, #A0A0A0);
          --ask-border: var(--border-color, rgba(255, 255, 255, 0.1));
          --ask-badge-bg: rgba(255, 255, 255, 0.07);
          --ask-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.6);

          /* INVERTED CARD IN DARK MODE */
          --ask-inv-bg: #FFFFFF;
          --ask-inv-text: #121212;
          --ask-inv-sub: #555555;
          --ask-inv-border: rgba(0, 0, 0, 0.14);
        }

        /* ── HIDE ALL SCROLLBARS CLEANLY ── */
        .qa-no-scrollbar::-webkit-scrollbar,
        .qa-carousel-track::-webkit-scrollbar,
        *::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        .qa-no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }

        /* ── LOCK VIEWPORT ── */
        body, html, .layout-wrapper, .content-wrapper, main, main > div {
          margin: 0 !important;
          padding: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
          background: var(--ask-bg) !important;
        }

        .ask-viewport-root {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100dvh !important;
          max-height: 100dvh !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          box-sizing: border-box !important;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
          background: var(--ask-bg);
          color: var(--ask-text);
          padding: calc(env(safe-area-inset-top, 0px) + 1.2rem) 0 calc(env(safe-area-inset-bottom, 0px) + 1.6rem) 0;
          user-select: none;
          transform: translateZ(0);
          backface-visibility: hidden;
          WebkitBackfaceVisibility: hidden;
        }

        /* ── TOP BAR: HOME AT LEFT, ASK AT RIGHT ── */
        .ask-top-bar {
          width: 100%;
          padding: 0 1.5rem;
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 20;
          flex-shrink: 0;
        }

        .ask-home-btn {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 0.35rem !important;
          height: 34px !important;
          box-sizing: border-box !important;
          background: var(--ask-badge-bg) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          border: 1px solid var(--ask-border) !important;
          color: var(--ask-text) !important;
          font-size: 0.65rem !important;
          font-weight: 800 !important;
          letter-spacing: 0.08em !important;
          text-transform: uppercase !important;
          padding: 0 0.85rem !important;
          border-radius: 9999px !important;
          text-decoration: none !important;
          line-height: 1 !important;
          cursor: pointer !important;
          transition: transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1) !important;
        }

        .ask-home-btn:active {
          transform: scale(0.95) !important;
        }

        .ask-top-action-btn {
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 0.45rem !important;
          height: 34px !important;
          box-sizing: border-box !important;
          background: var(--ask-text) !important;
          color: var(--ask-bg) !important;
          border: none !important;
          font-size: 0.68rem !important;
          font-weight: 800 !important;
          letter-spacing: 0.06em !important;
          text-transform: uppercase !important;
          padding: 0 0.95rem !important;
          border-radius: 9999px !important;
          cursor: pointer !important;
          transition: transform 0.2s cubic-bezier(0.2, 0.9, 0.3, 1) !important;
        }

        .ask-top-action-btn:active {
          transform: scale(0.95) !important;
        }

        /* ── CENTER SOCIAL ICONS (INSTAGRAM & X) ── */
        .ask-center-social-wrap {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.75rem;
          padding: 0.1rem 0;
          flex-shrink: 0;
        }

        .ask-social-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--ask-badge-bg);
          border: 1px solid var(--ask-border);
          color: var(--ask-text);
          text-decoration: none;
          transition: all 0.2s cubic-bezier(0.2, 0.9, 0.3, 1);
        }

        .ask-social-link:hover {
          background: var(--ask-border);
          transform: translateY(-2px);
        }

        .ask-social-link:active {
          transform: scale(0.92);
        }

        /* ── BOTTOM STACK: PER-CARD CAROUSEL ── */
        .ask-bottom-stack {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-sizing: border-box;
          z-index: 10;
        }

        .qa-carousel-track {
          width: 100%;
          display: flex;
          align-items: flex-end;
          gap: 1.15rem;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          padding: 0.4rem calc((100vw - min(88vw, 360px)) / 2);
          box-sizing: border-box;
          -webkit-overflow-scrolling: touch;
          transform: translateZ(0);
        }

        .qa-card-wrapper {
          width: min(88vw, 360px);
          height: clamp(370px, 60vh, 460px);
          position: relative;
          flex-shrink: 0;
          scroll-snap-align: center;
          transform: translateZ(0);
        }

        /* ── CARD STATES ── */
        .qa-card-normal {
          background: var(--ask-card-bg);
          border: 1px solid var(--ask-border);
          color: var(--ask-text);
          transition: background-color 0.4s ease, border-color 0.4s ease, color 0.4s ease;
        }

        .qa-card-inverted {
          background: var(--ask-inv-bg);
          border: 1px solid var(--ask-inv-border);
          color: var(--ask-inv-text);
          transition: background-color 0.4s ease, border-color 0.4s ease, color 0.4s ease;
        }

        .qa-text-primary {
          color: var(--ask-text);
          transition: color 0.4s ease;
        }

        .qa-text-muted {
          color: var(--ask-text-sub);
          transition: color 0.4s ease;
        }

        .qa-inv-primary {
          color: var(--ask-inv-text);
          transition: color 0.4s ease;
        }

        .qa-inv-muted {
          color: var(--ask-inv-sub);
          transition: color 0.4s ease;
        }

        .qa-quote-mark {
          color: inherit;
        }

        .qa-card-divider {
          border-top: 1px solid var(--ask-border);
        }

        /* ── COMPACT IOS ACTION PILL BUTTONS ── */
        .ios-action-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.28rem;
          padding: 0.3rem 0.72rem;
          border-radius: 9999px;
          background: var(--ask-badge-bg);
          border: 1px solid var(--ask-border);
          font-size: 0.65rem;
          font-weight: 750;
          letter-spacing: -0.01em;
          color: var(--ask-text);
          cursor: pointer;
          line-height: 1;
          transition: all 0.2s cubic-bezier(0.2, 0.9, 0.3, 1);
        }

        .ios-action-pill:hover {
          background: var(--ask-border);
        }

        .ios-action-pill:active {
          transform: scale(0.93);
          opacity: 0.7;
        }

        .ios-chevron {
          font-size: 0.85rem;
          line-height: 1;
          font-weight: 800;
          color: var(--ask-text-sub);
        }

        .ios-chevron-back {
          font-size: 0.85rem;
          line-height: 1;
          font-weight: 800;
          color: var(--ask-text-sub);
        }

        /* ── IMMERSIVE BACKDROP (PURE GPU COMPOSITE) ── */
        .ask-drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.72);
          z-index: 9999;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 0 1rem calc(env(safe-area-inset-bottom, 0px) + 1.25rem);
          box-sizing: border-box;
          transform: translateZ(0);
        }

        .ask-drawer-card {
          background: var(--ask-card-bg);
          color: var(--ask-text);
          border: 1px solid var(--ask-border);
          border-radius: 28px;
          max-width: 440px;
          width: 100%;
          padding: 1.6rem 1.6rem 1.6rem;
          box-sizing: border-box;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
          position: relative;
          transform: translateZ(0);
          backface-visibility: hidden;
          WebkitBackfaceVisibility: hidden;
        }

        .ask-drawer-header {
          margin-bottom: 1.15rem;
        }

        .ask-drawer-title {
          font-size: 1.2rem;
          font-weight: 850;
          margin: 0;
          letter-spacing: -0.02em;
          color: var(--ask-text);
        }

        .ask-drawer-input {
          width: 100%;
          background: var(--ask-badge-bg);
          border: 1px solid var(--ask-border);
          border-radius: 14px;
          padding: 0.75rem 0.95rem;
          color: var(--ask-text);
          font-size: 0.85rem;
          outline: none;
          box-sizing: border-box;
          font-family: inherit;
        }

        .ask-drawer-input::placeholder,
        .ask-drawer-textarea::placeholder {
          color: var(--ask-text-sub);
          opacity: 0.6;
        }

        .ask-drawer-textarea-box {
          background: var(--ask-badge-bg);
          border: 1px solid var(--ask-border);
          border-radius: 14px;
          padding: 0.75rem 0.95rem;
        }

        .ask-drawer-textarea {
          color: var(--ask-text);
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          font-size: 0.88rem;
          line-height: 1.5;
          box-sizing: border-box;
          font-family: inherit;
        }

        .ask-drawer-submit-btn {
          width: 100%;
          background: var(--ask-text);
          color: var(--ask-bg);
          border: none;
          border-radius: 9999px;
          padding: 0.85rem 1.4rem;
          font-size: 0.76rem;
          font-weight: 850;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          cursor: pointer;
          margin-top: 0.3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }

        .ask-drawer-submit-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>

      {/* ── TOP BAR: HOME AT LEFT, ASK AT RIGHT ── */}
      <div className="ask-top-bar" onClick={(e) => e.stopPropagation()}>
        <Link
          href="/"
          className="ask-home-btn"
          title="Return to Homepage"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>HOME</span>
        </Link>

        {/* TOP-RIGHT ASK BUTTON WITH FEATHER QUILL ICON */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="ask-top-action-btn"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
            <line x1="16" y1="8" x2="2" y2="22" />
            <line x1="17.5" y1="15" x2="9" y2="15" />
          </svg>
          <span>Ask</span>
        </button>
      </div>

      {/* ── CENTER SOCIAL ICONS: INSTAGRAM & X ── */}
      <div className="ask-center-social-wrap" onClick={(e) => e.stopPropagation()}>
        {/* INSTAGRAM */}
        <a
          href="https://instagram.com/ivanaffriandi"
          target="_blank"
          rel="noopener noreferrer"
          className="ask-social-link"
          title="Instagram @ivanaffriandi"
          aria-label="Instagram"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </a>

        {/* X / TWITTER */}
        <a
          href="https://x.com/ivanaffriandi"
          target="_blank"
          rel="noopener noreferrer"
          className="ask-social-link"
          title="X @ivanaffriandi"
          aria-label="X"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.258 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
          </svg>
        </a>
      </div>

      {/* ── BOTTOM STACK: PER-CARD TWO-STACK CAROUSEL ── */}
      <div className="ask-bottom-stack">
        {loadingQA ? (
          <div style={{ width: "100%", textAlign: "center", padding: "2rem 0", color: "var(--ask-text-sub)", fontSize: "0.85rem" }}>
            Loading…
          </div>
        ) : sortedQAs.length === 0 ? (
          <div style={{ width: "100%", textAlign: "center", padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "0.95rem" }}>No questions yet</p>
          </div>
        ) : (
          <div className="qa-carousel-track">
            {sortedQAs.map((qa, index) => {
              const currentId = qa.id || index;
              return (
                <TwoCardStackedQA
                  key={currentId}
                  qa={qa}
                  isActive={activeQAId === currentId}
                  onOpen={() => setActiveQAId(currentId)}
                  onClose={() => setActiveQAId(null)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ── CLEAN BOTTOM DRAWER WITH SPRING ANIMATION ── */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            className="ask-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setIsDrawerOpen(false)}
          >
            <motion.div
              className="ask-drawer-card"
              initial={{ y: "100%", opacity: 0.6 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0.6 }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 30,
                mass: 0.8,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* HEADER (NO 'X' BUTTON) */}
              <div className="ask-drawer-header">
                <h2 className="ask-drawer-title">
                  Ask a Question
                </h2>
              </div>

              {errorMsg && (
                <div style={{ border: "1px solid rgba(255,100,100,0.3)", borderRadius: "10px", padding: "7px 10px", color: "#ff6b6b", fontSize: "0.74rem", background: "rgba(255,50,50,0.1)", marginBottom: "0.85rem" }}>
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleQASubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {/* SENDER NAME */}
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Name or @handle (optional)"
                  className="ask-drawer-input"
                />

                {/* QUESTION TEXTAREA */}
                <div className="ask-drawer-textarea-box">
                  <textarea
                    value={qaContent}
                    onChange={(e) => setQaContent(e.target.value)}
                    placeholder="Write your question..."
                    maxLength={300}
                    rows={3}
                    disabled={isSubmitting}
                    className="ask-drawer-textarea"
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting || !qaContent.trim()}
                  className="ask-drawer-submit-btn"
                >
                  <span>Send</span>
                  <span>✦</span>
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SIMPLE TOP-CENTER TOAST NOTIFICATION: SENT ✦ ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            style={{
              position: "fixed",
              top: "1.3rem",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "var(--ask-card-bg)",
              color: "var(--ask-text)",
              padding: "7px 16px",
              borderRadius: "9999px",
              fontSize: "0.72rem",
              fontWeight: 850,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              zIndex: 99999,
              boxShadow: "0 16px 40px rgba(0,0,0,0.28)",
              border: "1px solid var(--ask-border)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <span>SENT</span>
            <span style={{ fontSize: "0.75rem" }}>✦</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
