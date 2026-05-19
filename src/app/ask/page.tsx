"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { addQuestion, getAnsweredQuestions, QuestionItem } from "@/lib/questions";
import confetti from "canvas-confetti";

const iosSpring = { type: "spring" as const, stiffness: 400, damping: 30 };
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.04
    }
  }
};
const fadeRise = {
  initial: { opacity: 0, y: 12, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 350, damping: 28 } }
};

// Exact Brand Color Palette (Light Mode) sorted strictly from LIGHTEST to DARKEST
const PALETTE_LIGHT = [
  { bg: "rgba(231, 229, 219, 0.85)", border: "rgba(222, 220, 209, 0.9)", text: "#191A1E", secondary: "rgba(25, 26, 30, 0.6)" }, // Goat Milk (lightest)
  { bg: "rgba(200, 194, 183, 0.85)", border: "rgba(188, 182, 170, 0.9)", text: "#191A1E", secondary: "rgba(25, 26, 30, 0.6)" }, // Antique Marble
  { bg: "rgba(173, 158, 137, 0.85)", border: "rgba(160, 145, 123, 0.9)", text: "#191A1E", secondary: "rgba(25, 26, 30, 0.6)" }, // Sandlight
  { bg: "rgba(86, 72, 59, 0.85)", border: "rgba(71, 59, 48, 0.9)", text: "#E7E5DB", secondary: "rgba(231, 229, 219, 0.7)" }, // Woodland
  { bg: "rgba(73, 17, 11, 0.85)", border: "rgba(59, 10, 6, 0.9)", text: "#E7E5DB", secondary: "rgba(231, 229, 219, 0.7)" }, // Mulled Wine
  { bg: "rgba(25, 26, 30, 0.85)", border: "rgba(16, 17, 19, 0.9)", text: "#E7E5DB", secondary: "rgba(231, 229, 219, 0.7)" }  // Charcoal Smoke (darkest)
];

// Dark Mode glass equivalents sorted strictly from LIGHTEST to DARKEST
const PALETTE_DARK = [
  { bg: "rgba(42, 43, 48, 0.8)", border: "rgba(56, 58, 65, 0.85)", text: "#E7E5DB", secondary: "rgba(231, 229, 219, 0.7)" }, // Dark Goat Milk (lightest)
  { bg: "rgba(61, 57, 52, 0.8)", border: "rgba(76, 72, 66, 0.85)", text: "#E7E5DB", secondary: "rgba(231, 229, 219, 0.7)" }, // Dark Antique Marble
  { bg: "rgba(72, 64, 55, 0.8)", border: "rgba(88, 80, 70, 0.85)", text: "#E7E5DB", secondary: "rgba(231, 229, 219, 0.7)" }, // Dark Sandlight
  { bg: "rgba(58, 49, 40, 0.8)", border: "rgba(74, 64, 54, 0.85)", text: "#E7E5DB", secondary: "rgba(231, 229, 219, 0.7)" }, // Dark Woodland
  { bg: "rgba(48, 19, 16, 0.8)", border: "rgba(66, 32, 28, 0.85)", text: "#E7E5DB", secondary: "rgba(231, 229, 219, 0.7)" }, // Dark Mulled Wine
  { bg: "rgba(19, 20, 23, 0.8)", border: "rgba(31, 33, 38, 0.85)", text: "#E7E5DB", secondary: "rgba(231, 229, 219, 0.7)" }  // Dark Charcoal Smoke (darkest)
];

interface QACardProps {
  qa: QuestionItem;
  index: number;
  isExpanded: boolean;
  isLast: boolean;
  onToggle: () => void;
}

const QACard = ({ qa, index, isExpanded, isLast, onToggle }: QACardProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Bulletproof dark mode detector (System preference + Class Fallback)
  useEffect(() => {
    const checkDark = () => {
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const hasClassDark = document.documentElement.classList.contains("book-theme-dark");
      setIsDarkMode(isSystemDark || hasClassDark);
    };
    checkDark();
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => checkDark();
    mediaQuery.addEventListener("change", listener);

    // Listen for manual theme toggling class mutations
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    
    return () => {
      mediaQuery.removeEventListener("change", listener);
      observer.disconnect();
    };
  }, []);

  const palette = isDarkMode ? PALETTE_DARK : PALETTE_LIGHT;
  // MATHEMATICALLY GUARANTEED MODULO: Repeating color palette strictly stable down to infinite/unlimited questions list
  const color = palette[index % palette.length];

  return (
    <div style={{ position: "relative", width: "100%" }}>
      
      {/* 2-COLUMN ROW LAYOUT (For Mathematically Perfect Sub-Pixel Alignment) */}
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", width: "100%" }}>
        
        {/* Left Column: Timeline Dot (Width: 16px, Centered, flex-shrink: 0) */}
        <div style={{ 
          width: "16px", 
          display: "flex", 
          justifyContent: "center", 
          marginTop: "19px", // Centered perfectly with Date text row
          flexShrink: 0, 
          position: "relative" 
        }}>
          {/* Dynamic Spine Line connecting to the next QA card */}
          {!isLast && (
            <div style={{ 
              position: "absolute",
              top: "12px", 
              bottom: "-32px", 
              left: "7.25px", 
              width: "1.5px", 
              backgroundColor: "var(--border-color)",
              opacity: 0.35,
              zIndex: 1
            }} />
          )}

          {/* Timeline Dot dynamically colored to match its card background */}
          <motion.div
            animate={{
              scale: isExpanded ? 1.25 : 1,
              backgroundColor: isExpanded ? color.bg : "var(--bg-color)",
              borderColor: color.border
            }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              border: `2px solid ${color.border}`,
              boxShadow: isExpanded ? `0 0 10px ${color.border}` : "none",
              zIndex: 2,
              cursor: "pointer"
            }}
            onClick={onToggle}
          />
        </div>

        {/* Right Column: QACard (Fills remaining width) */}
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <motion.div
            variants={fadeRise}
            layout // Magical accordion height transitions
            onClick={onToggle}
            whileHover={{ scale: 0.995 }}
            whileTap={{ scale: 0.985 }}
            style={{
              padding: "14px 16px",
              borderRadius: "16px",
              backgroundColor: color.bg,
              border: `1px solid ${color.border}`,
              backdropFilter: "blur(12px)", // Frosted glass effect
              WebkitBackdropFilter: "blur(12px)",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 4px 16px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.25)",
              transition: "background-color 0.2s ease, border-color 0.2s ease"
            }}
          >
            {/* THE QUESTION & DATE HEADER */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
              <span style={{ 
                fontSize: "0.58rem", 
                fontFamily: "var(--font-sans)", 
                color: color.text,
                opacity: 0.7,
                fontWeight: "700",
                letterSpacing: "0.04em",
                textTransform: "uppercase"
              }}>
                {new Date(qa.published).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                <p style={{ 
                  margin: 0, 
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.88rem",
                  color: color.text,
                  fontWeight: "600",
                  lineHeight: "1.4",
                  letterSpacing: "-0.01em",
                  flexGrow: 1
                }}>
                  {qa.content}
                </p>
                
                {/* Chevron parallel to question */}
                <motion.div 
                  animate={{ rotate: isExpanded ? 180 : 0 }} 
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  style={{ color: color.text, opacity: 0.6, marginTop: "2px", flexShrink: 0 }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </motion.div>
              </div>
            </div>

            {/* THE ANSWER (Recessed/Molded morphoism effect with quiet "Ivan" label) */}
            <AnimatePresence>
              {isExpanded && qa.answer && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, scale: 0.98 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  style={{ overflow: "hidden" }}
                >
                  {/* Recessed tray: darker translucent background + deep inward shadow */}
                  {/* onClick stopPropagation and cursor: text allows normal user text selection without collapsing card! */}
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                      backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.13)", // Deep glass recess
                      borderRadius: "12px",
                      padding: "12px 14px",
                      border: isDarkMode ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.05)",
                      // Deep, tactile debossed morphoism inner shadow
                      boxShadow: isDarkMode 
                        ? "inset 0 3px 8px rgba(0,0,0,0.5)" 
                        : "inset 0 3px 8px rgba(0,0,0,0.12)",
                      marginTop: "4px",
                      marginBottom: "2px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      cursor: "text" // Set selection cursor properly inside text tray
                    }}
                  >
                    {/* Elegant uppercase "IVAN" label at the top-left */}
                    <span style={{
                      fontSize: "0.58rem",
                      fontFamily: "var(--font-sans)",
                      color: color.text,
                      fontWeight: "750",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      opacity: 0.65
                    }}>
                      Ivan
                    </span>

                    {/* Answer text beautifully matching parent card's contrast */}
                    <p style={{ 
                      margin: 0, 
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.83rem",
                      color: color.text, 
                      lineHeight: "1.46",
                      fontWeight: "400",
                      opacity: 0.95
                    }}>
                      {qa.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default function AskPage() {
  const [answeredList, setAnsweredList] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Single open accordion state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Question submission form state
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  // High-fidelity morphing state
  const [isMaximized, setIsMaximized] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when capsule transforms into card
  useEffect(() => {
    if (isMaximized && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isMaximized]);

  // Bulletproof dark mode detector (System preference + Class Fallback)
  useEffect(() => {
    const checkDark = () => {
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const hasClassDark = document.documentElement.classList.contains("book-theme-dark");
      setIsDarkMode(isSystemDark || hasClassDark);
    };
    checkDark();
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => checkDark();
    mediaQuery.addEventListener("change", listener);

    // Listen for theme mutations
    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    
    return () => {
      mediaQuery.removeEventListener("change", listener);
      observer.disconnect();
    };
  }, []);

  // Load live answered Q&As & track mounting (purged MOCK_QUESTIONS strictly for live visitor interactions)
  useEffect(() => {
    setMounted(true);
    document.title = "Ask Ivan";
    const loadQAs = async () => {
      try {
        const data = await getAnsweredQuestions();
        setAnsweredList(data);
      } catch (err) {
        console.error("Failed to load Q&As:", err);
        setAnsweredList([]);
      } finally {
        setLoading(false);
      }
    };
    loadQAs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      await addQuestion(content.trim());
      setContent("");
      setIsMaximized(false); // Gracefully morph card back to capsule
      
      // Fire premium design confetti celebratory burst
      confetti({
        particleCount: 85,
        spread: 60,
        origin: { y: 0.82 },
        colors: ["#007aff", "#E2DDD5", "#B47A3E", "#A09E9B"]
      });

      // Show floating premium iMessage success toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Refresh list in background
      const data = await getAnsweredQuestions();
      setAnsweredList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sort Q&As descending by date (latest question/answer is always at the top)
  const sortedQuestions = [...answeredList].sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());

  return (
    <div style={{ 
      minHeight: "100vh", 
      padding: "2rem 4vw 9rem 4vw",
      backgroundColor: "var(--bg-color)",
      position: "relative"
    }}>
      <style>{`
        /* Force-hide any global footer components on this page to achieve a clean app-like feed */
        footer, .footer, [class*="footer"], [id*="footer"] {
          display: none !important;
        }

        /* Highly legible placeholder styles for both light and dark mode */
        input::placeholder, textarea::placeholder {
          color: var(--text-secondary) !important;
          opacity: 0.9 !important; /* Maximized contrast opacity for high legibility */
          font-weight: 500;
          transition: opacity 0.15s ease;
        }
        input:focus::placeholder, textarea:focus::placeholder {
          opacity: 0.55 !important;
        }
      `}</style>

      {/* Cozy, highly curated single-column container */}
      <div style={{ maxWidth: "420px", margin: "0 auto" }}>
        
        {/* Header Block — Warm, Inviting "Ask Ivan" Swiss Header */}
        <div style={{ marginBottom: "1.8rem" }}>
          <h1 style={{ 
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(1.65rem, 5vw, 2.1rem)", 
            fontWeight: "700", 
            margin: "0 0 0.4rem 0", 
            letterSpacing: "-0.03em", 
            lineHeight: "1.1", 
            color: "var(--text-primary)" 
          }}>
            Ask Ivan
          </h1>
          <p style={{ 
            fontSize: "0.85rem", 
            color: "var(--text-secondary)", 
            lineHeight: "1.4", 
            margin: 0,
            fontFamily: "var(--font-sans)"
          }}>
            Ask me anything anonymously.
          </p>
        </div>

        {/* Chronological Timeline stream of questions and answers */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
            <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid rgba(150,150,150,0.2)", borderTopColor: "var(--text-primary)", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ position: "relative", width: "100%" }}>
            
            {/* Main timeline stream */}
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "1.1rem", // Open, archival visual rhythm
                width: "100%",
                zIndex: 1,
                position: "relative"
              }}
            >
              {sortedQuestions.length > 0 ? (
                sortedQuestions.map((qa, index) => {
                  return (
                    <QACard 
                      key={qa.id} 
                      qa={qa} 
                      index={index} 
                      isExpanded={expandedId === qa.id}
                      isLast={index === sortedQuestions.length - 1}
                      onToggle={() => setExpandedId(expandedId === qa.id ? null : qa.id)}
                    />
                  );
                })
              ) : (
                <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-secondary)", border: "1px dashed var(--border-color)", borderRadius: "12px" }}>
                  <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: "500", color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>No questions answered yet</p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.7rem", color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>Ask the first anonymous question below!</p>
                </div>
              )}
            </motion.div>
          </div>
        )}

      </div>

      {/* Transparent Click Catcher Overlay: Tap anywhere outside expanded card to collapse back to capsule */}
      {mounted && isMaximized && typeof window !== "undefined" && createPortal(
        <div 
          onClick={() => setIsMaximized(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9998, // Placed exactly below the morphing container
            backgroundColor: "transparent",
            cursor: "default"
          }}
        />,
        document.body
      )}

      {/* Centered Wrapper inside React Portal to completely bypass page transforms and stay fixed at all times */}
      {mounted && typeof window !== "undefined" && createPortal(
        <>
          {/* Permanent Floating Input Capsule which transitions IN-PLACE directly into a Composition Card */}
          {/* USES NATIVE HIGH-PERFORMANCE CSS TRANSITIONS FOR WIDTH, HEIGHT, BORDER-RADIUS, AND PADDING TO ELIMINATE BORDER-RADIUS WARPING COMPLETELY */}
          <div
            style={{
              position: "fixed",
              bottom: "2.5rem",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9999,
              width: "85%",
              boxSizing: "border-box", // Strictly locked border-box calculation
              // Dynamic dimensions smoothly morphing without distortion
              maxWidth: isMaximized ? "360px" : "340px",
              height: isMaximized ? "272px" : "44px", // Adjusted to 272px to easily hold the new recessed inner textarea card!
              padding: isMaximized ? "16px 18px" : "6px 8px 6px 10px",
              // MATHEMATICALLY PERFECT BORDER RADIUS TO COMPLETELY ELIMINATE EYE-SHAPE WARPING
              // 22px is exactly half of the 44px height, creating a mathematically flawless round capsule pill on close!
              borderRadius: isMaximized ? "24px" : "22px",
              // HIGHLY DEFINED borders for supreme visual clarity
              border: isFocused 
                ? "1.5px solid var(--text-primary)" 
                : "1px solid var(--border-color)",
              // Solid frosted base (opacity 0.96) to ground it clearly over card overlaps
              backgroundColor: isDarkMode ? "rgba(20, 19, 18, 0.96)" : "rgba(253, 251, 247, 0.96)",
              // Thick, premium frosted backdrop filter
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              // Soft premium shadow shifts as it transforms
              boxShadow: isMaximized
                ? "0 24px 60px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.2)"
                : (isFocused 
                    ? "0 12px 36px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.2)" 
                    : "0 10px 30px rgba(0,0,0,0.12), 0 2px 10px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.15)"),
              display: "flex",
              flexDirection: "column",
              justifyContent: isMaximized ? "stretch" : "center",
              // Precise, sub-pixel browser-native morphing transition
              transition: "width 0.35s cubic-bezier(0.16, 1, 0.3, 1), height 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-radius 0.35s cubic-bezier(0.16, 1, 0.3, 1), padding 0.35s cubic-bezier(0.16, 1, 0.3, 1), border 0.15s ease, box-shadow 0.15s ease, background-color 0.2s ease",
              overflow: "hidden"
            }}
          >
            <AnimatePresence mode="wait">
              {!isMaximized ? (
                /* CAPSULE VIEW (Horizontal single-line input) */
                <motion.div
                  key="capsule-mode"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%"
                  }}
                >
                  <form 
                    onSubmit={handleSubmit}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%"
                    }}
                  >
                    {/* Ultra-Minimalist corner-arrow expand button - HIGH VISIBILITY */}
                    <motion.button
                      type="button"
                      onClick={() => setIsMaximized(true)}
                      whileHover={{ scale: 1.15, opacity: 1 }}
                      whileTap={{ scale: 0.93 }}
                      style={{
                        width: "24px",
                        height: "24px",
                        border: "none",
                        backgroundColor: "transparent",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        opacity: 0.9,
                        transition: "opacity 0.15s ease"
                      }}
                      title="Fullscreen composer"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <polyline points="9 21 3 21 3 15"></polyline>
                      </svg>
                    </motion.button>

                    {/* HIGH VISIBILITY Divider line */}
                    <div style={{ 
                      width: "1.5px",
                      height: "16px", 
                      backgroundColor: "var(--text-primary)", 
                      opacity: 0.2, 
                      flexShrink: 0 
                    }} />

                    <input
                      type="text"
                      value={content}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your question here"
                      maxLength={300}
                      disabled={isSubmitting}
                      style={{
                        flexGrow: 1,
                        border: "none",
                        background: "none",
                        outline: "none",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.85rem",
                        color: "var(--text-primary)",
                        padding: "4px 0",
                        lineHeight: "1.2",
                        fontWeight: "500"
                      }}
                    />

                    {/* Remaining character counter */}
                    {content.length > 0 && (
                      <span style={{ 
                        fontSize: "0.6rem", 
                        color: "var(--text-secondary)", 
                        opacity: 0.5, 
                        fontFamily: "var(--font-sans)",
                        marginRight: "2px",
                        fontWeight: "600"
                      }}>
                        {300 - content.length}
                      </span>
                    )}

                    {/* Bold outlined Send button */}
                    <motion.button
                      type="submit"
                      disabled={!content.trim() || isSubmitting}
                      whileHover={content.trim() ? { scale: 1.05 } : {}}
                      whileTap={content.trim() ? { scale: 0.95 } : {}}
                      style={{
                        width: "30px",
                        height: "30px",
                        borderRadius: "50%",
                        border: content.trim() ? "none" : "1px solid var(--border-color)",
                        backgroundColor: content.trim() 
                          ? "var(--text-primary)" 
                          : (isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"),
                        color: "var(--text-primary)",
                        opacity: content.trim() ? 1 : 0.8,
                        cursor: content.trim() ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, opacity 0.2s ease",
                        padding: 0,
                        flexShrink: 0
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: content.trim() ? "var(--bg-color)" : "var(--text-primary)" }}>
                        <line x1="12" y1="19" x2="12" y2="5"></line>
                        <polyline points="5 12 12 5 19 12"></polyline>
                      </svg>
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                /* CARD VIEW (Vertical multiline composition card morph) */
                <motion.div
                  key="card-mode"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    width: "100%",
                    height: "100%"
                  }}
                >
                  {/* Card Header row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <span style={{
                      fontSize: "0.62rem",
                      fontFamily: "var(--font-sans)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--text-secondary)",
                      fontWeight: "700"
                    }}>
                      Write Question
                    </span>
                    <span style={{
                      fontSize: "0.62rem",
                      fontFamily: "var(--font-sans)",
                      color: "var(--text-secondary)",
                      opacity: 0.65,
                      fontWeight: "600"
                    }}>
                      {300 - content.length} left
                    </span>
                  </div>

                  {/* Header Separator Line */}
                  <div style={{ height: "1px", backgroundColor: "var(--border-color)", width: "100%", opacity: 0.6 }} />

                  {/* CARD-INSIDE-A-CARD: Gorgeous tactile recessed/debossed morphoism writing tray */}
                  <div style={{
                    backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.05)",
                    borderRadius: "14px",
                    padding: "8px 12px",
                    border: isDarkMode ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.05)",
                    // Tactile recessed debossed inner shadow
                    boxShadow: isDarkMode 
                      ? "inset 0 3px 8px rgba(0,0,0,0.5)" 
                      : "inset 0 3px 8px rgba(0,0,0,0.08)",
                    display: "flex",
                    flexGrow: 1
                  }}>
                    <textarea
                      ref={textareaRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your question here"
                      maxLength={300}
                      rows={5}
                      disabled={isSubmitting}
                      style={{
                        border: "none",
                        outline: "none",
                        background: "none",
                        resize: "none",
                        fontSize: "0.90rem",
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-sans)",
                        width: "100%",
                        lineHeight: "1.4",
                        padding: "2px 0",
                        fontWeight: "500",
                        height: "100%"
                      }}
                    />
                  </div>

                  {/* Footer Separator Line */}
                  <div style={{ height: "1px", backgroundColor: "var(--border-color)", width: "100%", opacity: 0.6 }} />

                  {/* Actions Row with stunning debossed morphoism buttons */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", width: "100%" }}>
                    
                    {/* Tactile debossed/quiet cancel button */}
                    <motion.button
                      type="button"
                      onClick={() => setIsMaximized(false)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "12px",
                        border: isDarkMode ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
                        backgroundColor: isDarkMode ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.04)",
                        // Subtle recessed shadows
                        boxShadow: isDarkMode 
                          ? "inset 0 1px 2px rgba(0,0,0,0.4)" 
                          : "inset 0 1px 2px rgba(0,0,0,0.08)",
                        color: "var(--text-secondary)",
                        fontSize: "0.82rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        fontFamily: "var(--font-sans)",
                        transition: "background-color 0.2s ease"
                      }}
                    >
                      Cancel
                    </motion.button>

                    {/* Outlined, highly tactile debossed (inactive) / proud popped (active) Send button */}
                    <motion.button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!content.trim() || isSubmitting}
                      whileHover={content.trim() ? { scale: 1.02 } : {}}
                      whileTap={content.trim() ? { scale: 0.98 } : {}}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "14px",
                        // Dynamic borders for active/inactive deboss
                        border: content.trim()
                          ? "none"
                          : (isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)"),
                        // Debossed morphoism fill when inactive, solid popped primary color when active
                        backgroundColor: content.trim() 
                          ? "var(--text-primary)" 
                          : (isDarkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)"),
                        color: content.trim() ? "var(--bg-color)" : "var(--text-secondary)",
                        opacity: content.trim() ? 1 : 0.65,
                        fontSize: "0.82rem",
                        fontWeight: "700",
                        cursor: content.trim() ? "pointer" : "not-allowed",
                        fontFamily: "var(--font-sans)",
                        // Premium popped shadow when active, tactile debossed inner shadow when inactive!
                        boxShadow: content.trim() 
                          ? "0 4px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.2)" 
                          : (isDarkMode 
                              ? "inset 0 2px 5px rgba(0,0,0,0.5)" 
                              : "inset 0 2px 5px rgba(0,0,0,0.08)"),
                        transition: "background-color 0.2s ease, color 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease"
                      }}
                    >
                      {isSubmitting ? "Sending..." : "Send Question"}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Slide-Down Premium Success Toast */}
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: -24, x: "-50%" }}
                animate={{ opacity: 1, y: 0, x: "-50%" }}
                exit={{ opacity: 0, y: -24, x: "-50%" }}
                transition={iosSpring}
                style={{
                  position: "fixed",
                  top: "2.5rem",
                  left: "50%",
                  zIndex: 10000,
                  padding: "9px 18px",
                  borderRadius: "99px",
                  backgroundColor: "var(--text-primary)",
                  color: "var(--bg-color)",
                  fontSize: "0.78rem",
                  fontWeight: "600",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontFamily: "var(--font-sans)"
                }}
              >
                <span>✨ Question sent!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </div>
  );
}
