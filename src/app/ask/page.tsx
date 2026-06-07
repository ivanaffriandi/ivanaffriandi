"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { addQuestion, getAnsweredQuestions, QuestionItem } from "@/lib/questions";
import confetti from "canvas-confetti";
import { useLanguage } from "@/contexts/LanguageContext";
import { triggerLightClick, triggerActionClick } from "@/lib/haptic";

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
      
      {/* Spine line */}
      {!isLast && (
        <div style={{
          position: "absolute",
          top: "24px",
          bottom: "calc(-1.1rem - 24px)",
          left: "7px",
          width: "1.5px",
          background: `linear-gradient(to bottom, ${color.border} 0%, var(--border-color) 100%)`,
          opacity: 0.55,
          borderRadius: "2px",
          zIndex: 0,
        }} />
      )}

      {/* 2-COLUMN ROW LAYOUT */}
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", width: "100%" }}>
        
        {/* Left Column: Timeline Dot */}
        <div style={{ 
          width: "16px", 
          display: "flex", 
          justifyContent: "center", 
          marginTop: "19px", 
          flexShrink: 0, 
          position: "relative" 
        }}>
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

        {/* Right Column: QACard */}
        <div style={{ flexGrow: 1, minWidth: 0 }}>
          <motion.div
            variants={fadeRise}
            layout
            onClick={onToggle}
            whileHover={{ scale: 0.995 }}
            whileTap={{ scale: 0.985 }}
            style={{
              padding: "14px 16px",
              borderRadius: "16px",
              backgroundColor: color.bg,
              border: `1px solid ${color.border}`,
              backdropFilter: "blur(12px)",
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
                 {new Date(qa.published).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
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
                  flexGrow: 1,
                  whiteSpace: "pre-wrap"
                }}>
                  {qa.content}
                </p>
                
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

            {/* THE ANSWER */}
            <AnimatePresence>
              {isExpanded && qa.answer && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, scale: 0.98 }}
                  animate={{ opacity: 1, height: "auto", scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  style={{ overflow: "hidden" }}
                >
                  <div 
                    onClick={(e) => e.stopPropagation()}
                    style={{ 
                      backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.13)",
                      borderRadius: "12px",
                      padding: "12px 14px",
                      border: isDarkMode ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.05)",
                      boxShadow: isDarkMode 
                        ? "inset 0 3px 8px rgba(0,0,0,0.5)" 
                        : "inset 0 3px 8px rgba(0,0,0,0.12)",
                      marginTop: "4px",
                      marginBottom: "2px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      cursor: "text"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
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
                      <span style={{
                        fontSize: "0.58rem",
                        fontFamily: "var(--font-sans)",
                        color: color.text,
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        opacity: 0.55
                      }}>
                        {new Date(qa.answeredAt || qa.published).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>

                    <p style={{ 
                      margin: 0, 
                      fontFamily: "var(--font-sans)",
                      fontSize: "0.83rem",
                      color: color.text, 
                      lineHeight: "1.46",
                      fontWeight: "400",
                      opacity: 0.95,
                      whiteSpace: "pre-wrap"
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

const parseSources = (text: string) => {
  // Regex to match [Sources: Name1|Url1; Name2|Url2]
  const regex = /\[Sources:\s*([^\]]+)\]/i;
  const match = text.match(regex);
  if (!match) return { cleanText: text, sources: [] };

  const fullTag = match[0];
  const sourcesContent = match[1];
  
  const sources = sourcesContent.split(";").map(s => {
    const parts = s.split("|");
    return {
      title: parts[0]?.trim() || "Source",
      url: parts[1]?.trim() || "#"
    };
  }).filter(s => s.url && s.url !== "#");

  const cleanText = text.replace(fullTag, "").trim();
  return { cleanText, sources };
};

export default function AskPage() {
  const { t, lang, isRtl } = useLanguage();
  const [answeredList, setAnsweredList] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Tab segment: "ai" (Live Chat with Ivan's Clone) or "qa" (Q&A Board)
  const [activeTab, setActiveTab] = useState<"qa" | "ai">("ai");

  // Multi-open accordion for Q&A
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleCard = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  // Question submission form state
  const [content, setContent] = useState("");
  const [senderName, setSenderName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // High-fidelity morphing state
  const [isMaximized, setIsMaximized] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Info popup & terms accordion state
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  // Live Chat clone states — starts EMPTY (welcome card shown instead)
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "model"; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [chatScrolled, setChatScrolled] = useState(false);

  // Derived: true when no conversation has started yet
  const isWelcomeState = chatMessages.length === 0;

  // Reset chat — returns to welcome screen
  const handleResetChat = () => {
    triggerLightClick();
    setChatMessages([]);
    setChatInput("");
    setChatScrolled(false);
    setShowInfoPopup(false);
  };

  // Auto-scroll chat board — scrolls the container div to bottom
  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    } else {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };
  useEffect(() => {
    if (activeTab === "ai") {
      setTimeout(scrollToBottom, 50);
    }
  }, [chatMessages, activeTab]);

  // Suggested Prompts to kickstart creative conversations
  const suggestedPrompts = [
    "What do you think of Orwell's 1984?",
    "Why did you rate The 5 AM Club 3 stars?",
    "Tell me about Mun Kayoung's PATA.",
    "What is your take on Judith Butler's gender theory?",
    "You seem pretty snarky on this portfolio."
  ];

  // Send message to Ivan AI
  const handleSendChat = async (e?: React.FormEvent, textOverride?: string) => {
    if (e) e.preventDefault();
    const queryText = (textOverride || chatInput).trim();
    if (!queryText || chatLoading) return;

    triggerLightClick();
    if (!textOverride) setChatInput("");

    const updatedMessages = [...chatMessages, { role: "user" as const, content: queryText }];
    setChatMessages(updatedMessages);
    setChatLoading(true);

    try {
      const res = await fetch("/api/ask/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      if (!res.ok) throw new Error("API call failed");
      const data = await res.json();
      setChatMessages([...updatedMessages, { role: "model" as const, content: data.reply }]);
    } catch (err) {
      console.error(err);
      setChatMessages([
        ...updatedMessages,
        { role: "model" as const, content: "Sorry, it seems my AI brain is experiencing a connection glitch. Mind trying again?" }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

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

  // Lock body scroll for the Ask Page so that only nested containers scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Load live answered Q&As & track mounting
  useEffect(() => {
    setMounted(true);
    document.title = t("ask_ivan");
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

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    triggerActionClick();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const landingReferrer = typeof window !== "undefined" ? (sessionStorage.getItem("ivan_landing_referrer") || "") : "";
      const entryPage = typeof window !== "undefined" ? window.location.href : "";

      await addQuestion(
        content.trim(),
        senderName.trim(),
        chatMessages.length > 1 ? chatMessages : undefined,
        landingReferrer,
        entryPage
      );
      setContent("");
      setSenderName("");
      setIsMaximized(false); // Gracefully morph card back to capsule
      
      confetti({
        particleCount: 85,
        spread: 60,
        origin: { y: 0.82 },
        colors: ["#007aff", "#E2DDD5", "#B47A3E", "#A09E9B"]
      });

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      const data = await getAnsweredQuestions();
      setAnsweredList(data);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Failed to submit question");
    } finally {
      setIsSubmitting(false);
    }
  };

  const sortedQuestions = [...answeredList].sort((a, b) => {
    const timeA = new Date(a.answeredAt || a.published).getTime();
    const timeB = new Date(b.answeredAt || b.published).getTime();
    return timeB - timeA;
  });

  // In AI mode the wrapper becomes a true full-viewport fixed layer so nothing else scrolls
  // Unified page wrapper style for both Q&A and AI tabs
  const pageWrapperStyle: React.CSSProperties = {
    position: "relative" as const,
    backgroundColor: "var(--bg-color)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    boxSizing: "border-box" as const,
  };

  return (
    <div className={`ask-page-wrapper ai-tab-${activeTab}`} style={pageWrapperStyle}>
      <style>{`
        footer, .footer, [class*="footer"], [id*="footer"] {
          display: none !important;
        }

        input::placeholder, textarea::placeholder {
          color: var(--text-secondary) !important;
          opacity: 0.9 !important;
          font-weight: 500;
          transition: opacity 0.15s ease;
        }
        input:focus::placeholder, textarea:focus::placeholder {
          opacity: 0.55 !important;
        }

        /* Suggested chips hide scrollbar */
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }

        /* === DEFAULT (both modes, all sizes) === */
        .ask-page-wrapper {
          height: calc(100dvh - 120px);
          max-height: calc(100dvh - 120px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 0.5rem 4vw 0 4vw;
        }
        @media (max-width: 767px) {
          .ask-page-wrapper {
            height: calc(100dvh - 110px);
            max-height: calc(100dvh - 110px);
            padding: 0.25rem 4vw 0 4vw;
          }
        }

        /* === RESPONSIVE LAYOUT FOR DESKTOP (QA mode) === */
        @media (min-width: 768px) {
          .ai-tab-qa .floating-capsule-portal {
            display: none !important;
          }
          .ai-tab-qa .desktop-composer-container {
            display: block !important;
            margin-top: 1.8rem;
          }
          .ai-tab-qa .ask-container {
            max-width: 960px !important;
            display: grid !important;
            grid-template-columns: 360px 1fr !important;
            gap: 48px !important;
            margin: 0 auto !important;
            height: 100%;
          }
          .ai-tab-qa .ask-left-panel {
            position: sticky !important;
            top: 2.5rem !important;
            height: fit-content !important;
          }
        }

        /* === MOBILE: Q&A mode === */
        @media (max-width: 767px) {
          .ai-tab-qa .floating-capsule-portal {
            display: flex !important;
          }
          .ai-tab-qa .desktop-composer-container {
            display: none !important;
          }
          .ai-tab-qa .ask-container {
            max-width: 100% !important;
            margin: 0 auto !important;
            display: flex !important;
            flex-direction: column !important;
            height: 100% !important;
          }
        }

        /* === AI MODE: Full-screen layout === */
        .ai-tab-ai {
          /* no-op */
        }

        /* Smooth thin scrollbar for the chat list */
        .ai-chat-portal-container {
          scrollbar-width: none;
        }
        .ai-chat-portal-container::-webkit-scrollbar {
          display: none;
        }

        /* Smooth thin scrollbar for the right panel card list */
        .ask-right-panel {
          scrollbar-width: thin;
          scrollbar-color: var(--border-color) transparent;
        }
        .ask-right-panel::-webkit-scrollbar {
          width: 4px;
        }
        .ask-right-panel::-webkit-scrollbar-track {
          background: transparent;
        }
        .ask-right-panel::-webkit-scrollbar-thumb {
          background-color: var(--border-color);
          border-radius: 99px;
        }

        /* Desktop: AI mode two-column layout */
        @media (min-width: 768px) {
          .ai-tab-ai .ai-ask-container-grid {
            display: grid !important;
            grid-template-columns: 300px 1fr !important;
            gap: 48px !important;
          }
          .ai-tab-ai .ai-left-panel {
            flex-shrink: 0;
          }
        }

        /* Hide desktop composer in AI mode (has its own description panel in left) */
        .ai-tab-ai .desktop-composer-container {
          display: none !important;
        }
      `}</style>

      {/* ===== UNIFIED BRANDING & TAB SWITCHER ===== */}
      <div style={{ flexShrink: 0, paddingTop: "0.2rem" }}>
        <div style={{ marginBottom: "0.6rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
            <h1 style={{ 
              fontFamily: "var(--font-sans)",
              fontSize: "clamp(1.4rem, 4vw, 2rem)", 
              fontWeight: "800", 
              margin: "0 0 0.2rem 0", 
              letterSpacing: "-0.03em", 
              lineHeight: "1.1", 
              color: "var(--text-primary)" 
            }}>
              {t("ask_ivan")}
            </h1>
            {/* ⓘ Info button — appears only after conversation starts */}
            <AnimatePresence>
              {!isWelcomeState && activeTab === "ai" && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 400, damping: 26 }}
                  onClick={() => setShowInfoPopup(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: "4px",
                    padding: "4px",
                    borderRadius: "50%",
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.75 }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <p style={{ 
            fontSize: "0.82rem", 
            color: "var(--text-secondary)", 
            lineHeight: "1.4", 
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontWeight: 500
          }}>
            {activeTab === "qa" ? t("ask_subtitle_qa") : t("ask_subtitle_ai")}
          </p>
        </div>

        {/* Tab Switcher — AI on left, Q&A on right */}
        <div style={{
          display: "inline-flex",
          width: "118px",
          backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
          borderRadius: "99px",
          padding: "3px",
          marginBottom: "0.75rem",
          position: "relative",
          border: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)",
          zIndex: 10,
          boxSizing: "border-box"
        }}>
          {/* AI — left button */}
          <button
            onClick={() => {
              triggerLightClick();
              setActiveTab("ai");
            }}
            style={{
              width: "56px",
              padding: "5px 0",
              borderRadius: "99px",
              border: "none",
              background: "none",
              fontSize: "0.72rem",
              fontWeight: "700",
              fontFamily: "var(--font-sans)",
              color: activeTab === "ai" ? (isDarkMode ? "#121214" : "#FDFBF7") : "var(--text-secondary)",
              cursor: "pointer",
              position: "relative",
              zIndex: 2,
              transition: "color 0.25s ease",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            AI
          </button>
          {/* Q&A — right button */}
          <button
            onClick={() => {
              triggerLightClick();
              setActiveTab("qa");
            }}
            style={{
              width: "56px",
              padding: "5px 0",
              borderRadius: "99px",
              border: "none",
              background: "none",
              fontSize: "0.72rem",
              fontWeight: "700",
              fontFamily: "var(--font-sans)",
              color: activeTab === "qa" ? (isDarkMode ? "#121214" : "#FDFBF7") : "var(--text-secondary)",
              cursor: "pointer",
              position: "relative",
              zIndex: 2,
              transition: "color 0.25s ease",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            Q&A
          </button>
          
          <motion.div
            layoutId="activeTabPillUnified"
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            style={{
              position: "absolute",
              top: "3px",
              bottom: "3px",
              left: activeTab === "ai" ? "3px" : "59px",
              width: "56px",
              backgroundColor: "var(--text-primary)",
              borderRadius: "99px",
              zIndex: 1
            }}
          />
        </div>
      </div>

      {/* Elegant separator border between tab switch section and portals */}
      <div style={{
        height: "1.5px",
        width: "100%",
        backgroundColor: "var(--text-primary)",
        opacity: isDarkMode ? 0.08 : 0.05,
        marginBottom: "0.85rem",
        flexShrink: 0
      }} />

      {/* ===== UNIFIED CONTENT PORTALS ===== */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        {activeTab === "ai" ? (
          /* ===== AI MODE: Fixed full-screen layout ===== */
          <div style={{
            position: "relative",
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column"
          }}>
            {/* Top fade gradient — hides clipped text elegantly on scroll */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "40px",
              background: `linear-gradient(to bottom, var(--bg-color) 0%, transparent 100%)`,
              zIndex: 5,
              pointerEvents: "none",
              opacity: chatScrolled ? 1 : 0,
              transition: "opacity 0.25s ease"
            }} />

            <div
              ref={chatScrollRef}
              className="ai-chat-portal-container"
              onScroll={(e) => {
                const el = e.currentTarget;
                requestAnimationFrame(() => {
                  const scrolled = el.scrollTop > 5;
                  if (scrolled !== chatScrolled) {
                    setChatScrolled(scrolled);
                  }
                });
              }}
              style={{
                flex: 1,
                overflowY: "auto",
                overflowX: "hidden",
                minHeight: 0,
                paddingBottom: "4.2rem",
                paddingRight: "2px",
                paddingTop: "8px",
                WebkitOverflowScrolling: "touch",
                contain: "layout style paint"
              }}
            >
              <AnimatePresence mode="wait">
                {isWelcomeState ? (
                  /* ===== WELCOME CARD — shown before any conversation ===== */
                  <motion.div
                    key="welcome-card"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 340, damping: 26 }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      padding: "1.5rem 0.5rem 1rem",
                      gap: "0.9rem",
                      minHeight: "220px"
                    }}
                  >
                    {/* Welcome heading */}
                    <div style={{ marginBottom: "0.1rem" }}>
                      <h2 style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "1.55rem",
                        fontWeight: "800",
                        letterSpacing: "-0.03em",
                        color: "var(--text-primary)",
                        margin: 0,
                        lineHeight: "1.1"
                      }}>
                        Hey there.
                      </h2>
                      <p style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.8rem",
                        color: "var(--text-secondary)",
                        margin: "0.38rem 0 0",
                        fontWeight: 500,
                        lineHeight: "1.45"
                      }}>
                        {t("ai_greeting")}
                      </p>
                    </div>

                    {/* Collapsible About/Terms */}
                    <div style={{
                      width: "100%",
                      maxWidth: "300px",
                      borderRadius: "14px",
                      border: isDarkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)",
                      overflow: "hidden",
                      backgroundColor: isDarkMode ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.022)",
                      textAlign: "left"
                    }}>
                      <button
                        onClick={() => setTermsOpen(o => !o)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "9px 13px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "var(--font-sans)",
                          fontSize: "0.68rem",
                          fontWeight: "700",
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em"
                        }}
                      >
                        <span>About this space</span>
                        <motion.span
                          animate={{ rotate: termsOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {termsOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                            style={{ overflow: "hidden" }}
                          >
                            <div style={{ padding: "0 13px 12px", display: "flex", flexDirection: "column", gap: "9px" }}>
                              <div style={{ height: "1px", backgroundColor: "var(--text-primary)", opacity: 0.06, marginBottom: "2px" }} />
                              {[
                                { icon: "✦", label: "Ivan AI", desc: "Trained on Ivan's actual writing, book reviews & notes. It responds like him — not like a generic assistant." },
                                { icon: "◎", label: "Q&A", desc: "Questions are reviewed and personally answered by Ivan before being published publicly." },
                                { icon: "◈", label: "Privacy", desc: "Session data is collected for safety & moderation. Your identity is never shared publicly." }
                              ].map(item => (
                                <div key={item.label} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                                  <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)", opacity: 0.45, paddingTop: "2px", flexShrink: 0 }}>{item.icon}</span>
                                  <div>
                                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.69rem", fontWeight: "700", color: "var(--text-primary)", display: "block" }}>{item.label}</span>
                                    <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.66rem", color: "var(--text-secondary)", lineHeight: "1.4", display: "block" }}>{item.desc}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Suggested prompts */}
                    <div style={{ width: "100%", maxWidth: "300px", textAlign: "left" }}>
                      <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.62rem", color: "var(--text-secondary)", opacity: 0.5, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "700", margin: "0 0 7px" }}>Try asking</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                        {suggestedPrompts.slice(0, 3).map((prompt, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.01, backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSendChat(undefined, prompt)}
                            style={{
                              width: "100%",
                              textAlign: "left",
                              padding: "7px 11px",
                              borderRadius: "10px",
                              border: isDarkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)",
                              backgroundColor: "transparent",
                              color: "var(--text-primary)",
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.73rem",
                              fontWeight: "500",
                              cursor: "pointer",
                              lineHeight: "1.3",
                              transition: "background-color 0.15s ease"
                            }}
                          >
                            {prompt}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div ref={chatEndRef} />
                  </motion.div>
                ) : (
                  /* ===== NORMAL CHAT MESSAGES ===== */
                  <motion.div
                    key="chat-messages"
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    style={{ display: "flex", flexDirection: "column", gap: "0.65rem", width: "100%" }}
                  >
                    {chatMessages.map((msg, i) => {
                      const isUser = msg.role === "user";
                      const { cleanText, sources } = isUser ? { cleanText: msg.content, sources: [] } : parseSources(msg.content);
                      return (
                        <motion.div
                          key={i}
                          variants={fadeRise}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: isUser ? "flex-end" : "flex-start",
                            width: "100%"
                          }}
                        >
                          <div style={{
                            maxWidth: "82%",
                            padding: "8px 12px",
                            borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                            backgroundColor: isUser
                              ? "var(--text-primary)"
                              : (isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                            border: isUser
                              ? "none"
                              : (isDarkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.07)"),
                            color: isUser ? "var(--bg-color)" : "var(--text-primary)",
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.81rem",
                            lineHeight: "1.45",
                            boxShadow: isUser
                              ? "0 3px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.15)"
                              : "0 2px 8px rgba(0,0,0,0.03)"
                          }}>
                            {isUser ? (
                              <span style={{ whiteSpace: "pre-wrap" }}>{cleanText}</span>
                            ) : (
                              <span style={{ display: "block" }}>
                                {cleanText.split(/\n/).map((line, li) => {
                                  const parts = line.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
                                  return (
                                    <span key={li}>
                                      {li > 0 && <br />}
                                      {parts.map((seg, si) => {
                                        if (seg.startsWith("**") && seg.endsWith("**") && seg.length > 4)
                                          return <strong key={si}>{seg.slice(2, -2)}</strong>;
                                        if (seg.startsWith("*") && seg.endsWith("*") && seg.length > 2)
                                          return <em key={si}>{seg.slice(1, -1)}</em>;
                                        return <React.Fragment key={si}>{seg}</React.Fragment>;
                                      })}
                                    </span>
                                  );
                                })}
                              </span>
                            )}
                          </div>
                          {!isUser && sources.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px", marginLeft: "4px", maxWidth: "82%" }}>
                              {sources.map((src, idx) => (
                                <a key={idx} href={src.url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "4px", padding: "4px 8px", borderRadius: "99px", backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", border: isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)", fontSize: "0.68rem", fontWeight: "600", color: "var(--text-secondary)", textDecoration: "none", cursor: "pointer" }}>
                                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                  <span>{src.title}</span>
                                </a>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                    <div ref={chatEndRef} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          /* ===== Q&A MODE ===== */
          <div className="ask-container" style={{ flex: 1, minHeight: 0 }}>
            {/* Left Column: Composer Panel */}
            <div className="ask-left-panel">
              {/* Desktop static composer (for Q&A mode) */}
              <div className="desktop-composer-container">
                <form onSubmit={handleSubmit} style={{
                  padding: "20px",
                  borderRadius: "20px",
                  border: isFocused ? "1px solid var(--text-primary)" : "1px solid var(--border-color)",
                  backgroundColor: isDarkMode ? "rgba(20, 19, 18, 0.45)" : "rgba(253, 251, 247, 0.55)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,0.15)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  transition: "border 0.15s ease, background-color 0.2s ease, box-shadow 0.15s ease"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{
                      fontSize: "0.65rem",
                      fontFamily: "var(--font-sans)",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "var(--text-secondary)",
                      fontWeight: "700"
                    }}>
                      Ask a Question
                    </span>
                    <span style={{
                      fontSize: "0.65rem",
                      fontFamily: "var(--font-sans)",
                      color: "var(--text-secondary)",
                      opacity: 0.65,
                      fontWeight: "600"
                    }}>
                      {300 - content.length} left
                    </span>
                  </div>

                  {errorMsg && (
                    <div style={{
                      backgroundColor: "rgba(255, 60, 60, 0.1)",
                      border: "1px solid rgba(255, 60, 60, 0.3)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      color: "#ff4d4d",
                      fontSize: "0.75rem",
                      fontFamily: "var(--font-sans)",
                      fontWeight: "600",
                      lineHeight: "1.4"
                    }}>
                      {errorMsg}
                    </div>
                  )}

                  <div style={{ height: "1px", backgroundColor: "var(--border-color)", opacity: 0.6 }} />

                  {/* Sender Name Input */}
                  <div style={{
                    backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.25)" : "rgba(0, 0, 0, 0.04)",
                    borderRadius: "12px",
                    padding: "8px 12px",
                    border: isDarkMode ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0, 0, 0, 0.04)",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    <span style={{ 
                      fontSize: "0.8rem", 
                      color: "var(--text-secondary)", 
                      marginRight: "6px",
                      fontWeight: "600",
                      fontFamily: "var(--font-sans)",
                      userSelect: "none"
                    }}>From:</span>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder={t("name_optional")}
                      maxLength={40}
                      disabled={isSubmitting}
                      style={{
                        flexGrow: 1,
                        border: "none",
                        background: "none",
                        outline: "none",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.8rem",
                        color: "var(--text-primary)",
                        padding: "1px 0",
                        fontWeight: "500"
                      }}
                    />
                  </div>

                  {/* Textarea Composition Tray */}
                  <div style={{
                    backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.05)",
                    borderRadius: "14px",
                    padding: "10px 14px",
                    border: isDarkMode ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.05)",
                    boxShadow: isDarkMode 
                      ? "inset 0 3px 8px rgba(0,0,0,0.5)" 
                      : "inset 0 3px 8px rgba(0,0,0,0.08)",
                    display: "flex",
                    minHeight: "120px"
                  }}>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder={t("placeholder_qa")}
                      maxLength={300}
                      rows={4}
                      disabled={isSubmitting}
                      style={{
                        border: "none",
                        outline: "none",
                        background: "none",
                        resize: "none",
                        fontSize: "0.88rem",
                        color: "var(--text-primary)",
                        fontFamily: "var(--font-sans)",
                        width: "100%",
                        lineHeight: "1.4",
                        fontWeight: "500"
                      }}
                    />
                  </div>

                  <div style={{ height: "1px", backgroundColor: "var(--border-color)", opacity: 0.6 }} />

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    {content.trim() && (
                      <motion.button
                        type="button"
                        onClick={() => { setContent(""); setSenderName(""); }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "12px",
                          border: "none",
                          backgroundColor: "transparent",
                          color: "var(--text-secondary)",
                          fontSize: "0.82rem",
                          fontWeight: "600",
                          cursor: "pointer",
                          fontFamily: "var(--font-sans)"
                        }}
                      >
                        Clear
                      </motion.button>
                    )}

                    <motion.button
                      type="submit"
                      disabled={!content.trim() || isSubmitting}
                      whileHover={content.trim() ? { scale: 1.02 } : {}}
                      whileTap={content.trim() ? { scale: 0.98 } : {}}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "14px",
                        border: content.trim() ? "none" : "1px solid var(--border-color)",
                        backgroundColor: content.trim() 
                          ? "var(--text-primary)" 
                          : (isDarkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)"),
                        color: content.trim() ? "var(--bg-color)" : "var(--text-secondary)",
                        opacity: content.trim() ? 1 : 0.65,
                        fontSize: "0.82rem",
                        fontWeight: "700",
                        cursor: content.trim() ? "pointer" : "not-allowed",
                        fontFamily: "var(--font-sans)",
                        boxShadow: content.trim() 
                          ? "0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)" 
                          : "none",
                        transition: "background-color 0.2s ease, color 0.2s ease, opacity 0.2s ease"
                      }}
                    >
                      {isSubmitting ? t("connecting") : t("submit")}
                    </motion.button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Q&A Stream */}
            <div 
              className="ask-right-panel no-scrollbar" 
              style={{ 
                width: "100%",
                flex: 1,
                overflowY: "auto",
                minHeight: 0,
                paddingBottom: "8rem",
                WebkitOverflowScrolling: "touch",
                contain: "layout style paint"
              }}
            >
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
                  <div style={{ width: "14px", height: "14px", borderRadius: "50%", border: "2px solid rgba(150,150,150,0.2)", borderTopColor: "var(--text-primary)", animation: "spin 0.8s linear infinite" }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : (
                <div style={{ position: "relative", width: "100%" }}>
                  <motion.div 
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    style={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "1.1rem", 
                      width: "100%",
                      zIndex: 1,
                      position: "relative"
                    }}
                  >
                    {sortedQuestions.length > 0 ? (
                      sortedQuestions.map((qa, index) => (
                        <QACard 
                          key={qa.id} 
                          qa={qa} 
                          index={index} 
                          isExpanded={expandedIds.has(qa.id)}
                          isLast={index === sortedQuestions.length - 1}
                          onToggle={() => toggleCard(qa.id)}
                        />
                      ))
                    ) : (
                      <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-secondary)", border: "1px dashed var(--border-color)", borderRadius: "12px" }}>
                        <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: "500", color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>{t("no_qa_yet")}</p>
                        <p style={{ margin: "2px 0 0 0", fontSize: "0.7rem", color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>{t("ask_first_anon")}</p>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {mounted && isMaximized && activeTab === "qa" && typeof window !== "undefined" && createPortal(
        <div 
          onClick={() => setIsMaximized(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9998,
            backgroundColor: "transparent",
            cursor: "default"
          }}
        />,
        document.body
      )}

      {/* Floating Input Capsule — visible only in Q&A / AI tabs on mobile */}
      {mounted && typeof window !== "undefined" && createPortal(
        <>
          <div
            className="floating-capsule-portal"
            style={{
              position: "fixed",
              bottom: "2.5rem",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 9999,
              width: "85%",
              boxSizing: "border-box",
              maxWidth: (activeTab === "qa" && isMaximized) ? "360px" : "340px",
              height: (activeTab === "qa" && isMaximized) ? "316px" : (activeTab === "ai" && chatLoading) ? "36px" : "40px",
              padding: (activeTab === "qa" && isMaximized) ? "16px 18px" : (activeTab === "ai" && chatLoading) ? "0px 6px" : "4px 6px 4px 8px",
              borderRadius: (activeTab === "qa" && isMaximized) ? "24px" : "20px",
              border: isFocused 
                ? "1px solid var(--text-primary)" 
                : (isDarkMode ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.10)"),
              backgroundColor: isDarkMode ? "rgba(20, 19, 18, 0.98)" : "rgba(253, 251, 247, 0.98)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: (activeTab === "qa" && isMaximized)
                ? "0 24px 60px rgba(0,0,0,0.16), 0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.2)"
                : (isFocused 
                    ? "0 12px 36px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.2)" 
                    : "0 10px 30px rgba(0,0,0,0.14), 0 2px 10px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.15)"),
              display: "flex",
              flexDirection: "column",
              justifyContent: (activeTab === "qa" && isMaximized) ? "stretch" : "center",
              transition: "all 0.32s cubic-bezier(0.16, 1, 0.3, 1), border 0.15s ease, box-shadow 0.15s ease",
              overflow: "hidden"
            }}
          >
            <AnimatePresence mode="wait">
              {activeTab === "ai" ? (
                /* AI TAB CAPSULE VIEW */
                <motion.div
                  key="ai-capsule-mode"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    height: "100%"
                  }}
                >
                  <form 
                    onSubmit={handleSendChat}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      height: "100%"
                    }}
                  >
                    {/* Reset button — always visible */}
                    <motion.button
                      type="button"
                      onClick={handleResetChat}
                      disabled={chatLoading}
                      whileHover={!chatLoading ? { scale: 1.15, opacity: 1 } : {}}
                      whileTap={!chatLoading ? { scale: 0.88 } : {}}
                      title={t("reset_chat")}
                      style={{
                        width: "26px",
                        height: "26px",
                        border: "none",
                        backgroundColor: "transparent",
                        color: "var(--text-primary)",
                        cursor: chatLoading ? "default" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        opacity: chatLoading ? 0.35 : 0.85,
                        transition: "opacity 0.2s ease"
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="1 4 1 10 7 10"></polyline>
                        <path d="M3.51 15a9 9 0 1 0 .49-3.51"></path>
                      </svg>
                    </motion.button>

                    {/* Divider */}
                    <div style={{ 
                      width: "1.5px", height: "16px",
                      backgroundColor: "var(--text-primary)",
                      opacity: chatLoading ? 0.08 : 0.15,
                      flexShrink: 0,
                      transition: "opacity 0.2s ease"
                    }} />

                    {/* MIDDLE: input OR typing indicator */}
                    <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <AnimatePresence mode="wait">
                        {chatLoading ? (
                          /* TYPING STATE — authentic iOS iMessage dot animation */
                          <motion.div
                            key="typing-indicator"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.85 }}
                            transition={{ duration: 0.18, ease: [0.34, 1.56, 0.64, 1] }}
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}
                          >
                            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                              {[0, 1, 2].map((dot) => (
                                <motion.div
                                  key={dot}
                                  animate={{ opacity: [0.2, 1, 0.2] }}
                                  transition={{
                                    duration: 1.4,
                                    repeat: Infinity,
                                    delay: dot * 0.22,
                                    ease: "easeInOut"
                                  }}
                                  style={{
                                    width: "5px", height: "5px",
                                    borderRadius: "50%",
                                    backgroundColor: "var(--text-primary)",
                                    flexShrink: 0
                                  }}
                                />
                              ))}
                            </div>
                          </motion.div>
                        ) : (
                          /* NORMAL STATE — text input */
                          <motion.input
                            key="chat-input"
                            type="text"
                            value={chatInput}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder={t("placeholder_ai")}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.12 }}
                            style={{
                              width: "100%",
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
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Send button — always visible, clearer styling */}
                    <motion.button
                      type="submit"
                      disabled={!chatInput.trim() || chatLoading}
                      whileHover={chatInput.trim() && !chatLoading ? { scale: 1.08 } : {}}
                      whileTap={chatInput.trim() && !chatLoading ? { scale: 0.92 } : {}}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        border: chatInput.trim() && !chatLoading ? "none" : "1.5px solid var(--text-primary)",
                        backgroundColor: chatInput.trim() && !chatLoading
                          ? "var(--text-primary)"
                          : "transparent",
                        color: chatInput.trim() && !chatLoading ? "var(--bg-color)" : "var(--text-primary)",
                        opacity: chatLoading ? 0.3 : chatInput.trim() ? 1 : 0.75,
                        cursor: chatInput.trim() && !chatLoading ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                        flexShrink: 0,
                        transition: "all 0.2s ease"
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="19" x2="12" y2="5"></line>
                        <polyline points="5 12 12 5 19 12"></polyline>
                      </svg>
                    </motion.button>
                  </form>
                </motion.div>
              ) : !isMaximized ? (
                /* Q&A TAB CAPSULE VIEW */
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

                    <motion.button
                      type="submit"
                      disabled={!content.trim() || isSubmitting}
                      whileHover={content.trim() ? { scale: 1.05 } : {}}
                      whileTap={content.trim() ? { scale: 0.95 } : {}}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        border: content.trim() ? "none" : "1.5px solid var(--text-primary)",
                        backgroundColor: content.trim() 
                          ? "var(--text-primary)" 
                          : "transparent",
                        color: content.trim() ? "var(--bg-color)" : "var(--text-primary)",
                        opacity: isSubmitting ? 0.3 : content.trim() ? 1 : 0.75,
                        cursor: content.trim() ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s ease",
                        padding: 0,
                        flexShrink: 0
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="19" x2="12" y2="5"></line>
                        <polyline points="5 12 12 5 19 12"></polyline>
                      </svg>
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                /* CARD VIEW */
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

                  {errorMsg && (
                    <div style={{
                      backgroundColor: "rgba(255, 60, 60, 0.1)",
                      border: "1px solid rgba(255, 60, 60, 0.3)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      color: "#ff4d4d",
                      fontSize: "0.75rem",
                      fontFamily: "var(--font-sans)",
                      fontWeight: "600",
                      lineHeight: "1.4"
                    }}>
                      {errorMsg}
                    </div>
                  )}

                  <div style={{ height: "1px", backgroundColor: "var(--border-color)", width: "100%", opacity: 0.6 }} />

                  <div style={{
                    backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.25)" : "rgba(0, 0, 0, 0.04)",
                    borderRadius: "12px",
                    padding: "6px 12px",
                    border: isDarkMode ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0, 0, 0, 0.04)",
                    boxShadow: isDarkMode 
                      ? "inset 0 1.5px 3px rgba(0,0,0,0.4)" 
                      : "inset 0 1.5px 3px rgba(0,0,0,0.06)",
                    display: "flex",
                    alignItems: "center"
                  }}>
                    <span style={{ 
                      fontSize: "0.78rem", 
                      color: "var(--text-secondary)", 
                      marginRight: "6px",
                      fontWeight: "600",
                      fontFamily: "var(--font-sans)",
                      userSelect: "none"
                    }}>From:</span>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Name / Nickname (Optional)"
                      maxLength={40}
                      disabled={isSubmitting}
                      style={{
                        flexGrow: 1,
                        border: "none",
                        background: "none",
                        outline: "none",
                        fontFamily: "var(--font-sans)",
                        fontSize: "0.78rem",
                        color: "var(--text-primary)",
                        padding: "1px 0",
                        fontWeight: "500"
                      }}
                    />
                  </div>

                  <div style={{
                    backgroundColor: isDarkMode ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.05)",
                    borderRadius: "14px",
                    padding: "8px 12px",
                    border: isDarkMode ? "1px solid rgba(255,255,255,0.04)" : "1px solid rgba(0,0,0,0.05)",
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

                  <div style={{ height: "1px", backgroundColor: "var(--border-color)", width: "100%", opacity: 0.6 }} />

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", width: "100%" }}>
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

                    <motion.button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!content.trim() || isSubmitting}
                      whileHover={content.trim() ? { scale: 1.02 } : {}}
                      whileTap={content.trim() ? { scale: 0.98 } : {}}
                      style={{
                        padding: "8px 18px",
                        borderRadius: "14px",
                        border: content.trim()
                          ? "none"
                          : (isDarkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)"),
                        backgroundColor: content.trim() 
                          ? "var(--text-primary)" 
                          : (isDarkMode ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)"),
                        color: content.trim() ? "var(--bg-color)" : "var(--text-secondary)",
                        opacity: content.trim() ? 1 : 0.65,
                        fontSize: "0.82rem",
                        fontWeight: "700",
                        cursor: content.trim() ? "pointer" : "not-allowed",
                        fontFamily: "var(--font-sans)",
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

          {/* Success Toast */}
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

          {/* ===== FLOATING INFO POPUP ===== */}
          <AnimatePresence>
            {showInfoPopup && (
              <>
                {/* Scrim */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => setShowInfoPopup(false)}
                  style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 10001,
                    backgroundColor: "rgba(0,0,0,0.22)",
                    backdropFilter: "blur(5px)",
                    WebkitBackdropFilter: "blur(5px)"
                  }}
                />
                {/* Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, x: "-50%", y: "-47%" }}
                  animate={{ opacity: 1, scale: 1, x: "-50%", y: "-55%" }}
                  exit={{ opacity: 0, scale: 0.96, x: "-50%", y: "-47%" }}
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    zIndex: 10002,
                    width: "min(90vw, 315px)",
                    backgroundColor: isDarkMode ? "rgba(26, 27, 31, 0.85)" : "rgba(253, 251, 247, 0.88)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    borderRadius: "22px",
                    border: isDarkMode ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.2), 0 4px 16px rgba(0,0,0,0.05)",
                    overflow: "hidden",
                    fontFamily: "var(--font-sans)"
                  }}
                >
                  {/* Popup header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 15px 10px", borderBottom: isDarkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)" }}>
                    <span style={{ fontSize: "0.68rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-primary)" }}>About this space</span>
                    <button
                      onClick={() => setShowInfoPopup(false)}
                      style={{ width: "22px", height: "22px", borderRadius: "50%", border: "none", backgroundColor: isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: "700", padding: 0 }}
                    >✕</button>
                  </div>
                  {/* Popup body */}
                  <div style={{ padding: "12px 15px 15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                      { icon: "✦", label: "Ivan AI", desc: "Trained on Ivan's actual writing, book reviews & notes. Responds like him — not a generic assistant." },
                      { icon: "◎", label: "Q&A", desc: "Questions are reviewed and personally answered by Ivan before being published." },
                      { icon: "◈", label: "Privacy", desc: "Session data is collected for safety & moderation. Your identity is never shared publicly." }
                    ].map(item => (
                      <div key={item.label} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <span style={{ fontSize: "0.62rem", color: "var(--text-secondary)", opacity: 0.4, paddingTop: "2px", flexShrink: 0 }}>{item.icon}</span>
                        <div>
                          <span style={{ fontSize: "0.71rem", fontWeight: "700", color: "var(--text-primary)", display: "block", marginBottom: "2px" }}>{item.label}</span>
                          <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)", lineHeight: "1.45", display: "block" }}>{item.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </div>
  );
}
