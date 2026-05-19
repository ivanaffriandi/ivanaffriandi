"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllCommentsForAdmin, approveComment, deleteComment, CommentItem } from "@/lib/comments";
import { getAllQuestionsForAdmin, answerQuestion, deleteQuestion, QuestionItem } from "@/lib/questions";
import { getAllMoments, addMoment, deleteMoment, updateMoment, uploadMomentPhoto, MomentItem } from "@/lib/moments";

const iosSpring = { type: "spring" as const, stiffness: 380, damping: 30 };
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.04
    }
  }
};
const fadeRise = {
  initial: { opacity: 0, y: 10, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 350, damping: 28 } }
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [activeTab, setActiveTab] = useState<"inbox" | "calendar" | "comments" | "moments">("inbox");
  const [inboxFilter, setInboxFilter] = useState<"all" | "pending" | "answered">("pending");
  
  const [adminQuestions, setAdminQuestions] = useState<QuestionItem[]>([]);
  const [adminComments, setAdminComments] = useState<CommentItem[]>([]);
  const [adminMoments, setAdminMoments] = useState<MomentItem[]>([]);
  
  // Moment Form States
  const [isUploadingMoment, setIsUploadingMoment] = useState(false);
  const [momentFile, setMomentFile] = useState<File | null>(null);
  const [momentPreviewUrl, setMomentPreviewUrl] = useState<string | null>(null);
  const [momentTitle, setMomentTitle] = useState("");
  const [momentLocation, setMomentLocation] = useState("");
  const [momentDate, setMomentDate] = useState("");
  const [momentStory, setMomentStory] = useState("");

  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Confirmation Dialog state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Delete",
    cancelText: "Cancel",
    onConfirm: () => {}
  });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void | Promise<void>, confirmText = "Delete") => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await onConfirm();
        } catch (e) {
          console.error(e);
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "check" })
        });
        const data = await res.json();
        setIsAuthenticated(data.authenticated === true);
      } catch (err) {
        console.error("Auth status verification failed:", err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    verifyAuth();
  }, []);

  // Fetch comments
  useEffect(() => {
    if (isAuthenticated && activeTab === "comments") {
      const loadComments = async () => {
        try {
          const list = await getAllCommentsForAdmin();
          setAdminComments(list);
        } catch (err) {
          console.error("Failed to load comments:", err);
        }
      };
      loadComments();
    }
  }, [isAuthenticated, activeTab]);

  // Fetch questions
  useEffect(() => {
    if (isAuthenticated && activeTab === "inbox") {
      const loadQuestions = async () => {
        try {
          const list = await getAllQuestionsForAdmin();
          const sorted = list.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
          setAdminQuestions(sorted);
        } catch (err) {
          console.error("Failed to load questions:", err);
        }
      };
      loadQuestions();
    }
  }, [isAuthenticated, activeTab]);

  // Fetch moments
  useEffect(() => {
    if (isAuthenticated && activeTab === "moments") {
      const loadMoments = async () => {
        try {
          const list = await getAllMoments();
          setAdminMoments(list);
        } catch (err) {
          console.error("Failed to load moments:", err);
        }
      };
      loadMoments();
    }
  }, [isAuthenticated, activeTab]);

  // File Preview generator
  useEffect(() => {
    if (!momentFile) {
      setMomentPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(momentFile);
    setMomentPreviewUrl(objectUrl);
    
    // Free memory when component unmounts or file changes!
    return () => URL.revokeObjectURL(objectUrl);
  }, [momentFile]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    
    setLoading(true);
    setLoginError("");
    
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", password })
      });
      const data = await res.json();
      
      if (data.success) {
        setIsAuthenticated(true);
        setPassword("");
        const list = await getAllQuestionsForAdmin();
        const sorted = list.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
        setAdminQuestions(sorted);
      } else {
        setLoginError("Access denied. Incorrect password.");
      }
    } catch (error) {
      console.error("Login action failed with error:", error);
      setLoginError("System error: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" })
      });
      setIsAuthenticated(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswerQuestion = async (id: string) => {
    if (!answerText.trim()) return;
    const success = await answerQuestion(id, answerText.trim());
    if (success) {
      setAdminQuestions(prev => prev.map(q => q.id === id ? { ...q, answered: true, answer: answerText.trim() } : q));
      setAnsweringQuestionId(null);
      setAnswerText("");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    triggerConfirm(
      "Delete Question",
      "Are you sure you want to delete this question forever? This action cannot be undone.",
      async () => {
        const success = await deleteQuestion(id);
        if (success) {
          setAdminQuestions(prev => prev.filter(q => q.id !== id));
        }
      }
    );
  };

  const handleApproveComment = async (id: string) => {
    const success = await approveComment(id);
    if (success) {
      setAdminComments(prev => prev.map(c => c.id === id ? { ...c, approved: true } : c));
    }
  };

  const handleDeleteComment = async (id: string) => {
    triggerConfirm(
      "Delete Comment",
      "Are you sure you want to delete this comment from the database?",
      async () => {
        const success = await deleteComment(id);
        if (success) {
          setAdminComments(prev => prev.filter(c => c.id !== id));
        }
      }
    );
  };

  const handleUploadMoment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!momentFile || !momentLocation || !momentDate) return;
    
    setIsUploadingMoment(true);
    try {
      const path = `moments/${Date.now()}_${momentFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { url, storagePath } = await uploadMomentPhoto(momentFile, path);
      
      const newMoment = await addMoment({
        url,
        storagePath,
        title: momentTitle || "Untitled",
        location: momentLocation,
        date: momentDate,
        story: momentStory
      });
      
      setAdminMoments(prev => [newMoment, ...prev]);
      
      // Reset form
      setMomentFile(null);
      setMomentTitle("");
      setMomentLocation("");
      setMomentDate("");
      setMomentStory("");
    } catch (err) {
      console.error("Failed to upload moment:", err);
      alert("Upload failed. See console for details.");
    } finally {
      setIsUploadingMoment(false);
    }
  };

  const handleDeleteMoment = async (id: string, storagePath?: string) => {
    triggerConfirm(
      "Delete Photo",
      "Are you sure you want to permanently delete this photo from your Moments gallery?",
      async () => {
        const success = await deleteMoment(id, storagePath);
        if (success) {
          setAdminMoments(prev => prev.filter(m => m.id !== id));
        }
      }
    );
  };

  const handleSetHomepageSlot = async (momentId: string, slotStr: string) => {
    const slotVal = slotStr === "none" ? 0 : parseInt(slotStr);
    
    setAdminMoments(prev => prev.map(m => 
      m.id === momentId 
        ? { ...m, showOnHomepage: slotVal !== 0, homepageOrder: slotVal !== 0 ? slotVal : undefined } 
        : m
    ));

    try {
      await updateMoment(momentId, {
        showOnHomepage: slotVal !== 0,
        homepageOrder: slotVal !== 0 ? slotVal : undefined
      });
    } catch (err) {
      console.error("Failed to update homepage slot:", err);
      alert("Failed to update homepage slot selection.");
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setMomentFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setMomentFile(file);
    }
  };

  const filteredQuestions = adminQuestions.filter(q => {
    if (inboxFilter === "pending") return !q.answered;
    if (inboxFilter === "answered") return q.answered;
    return true;
  });

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-color)" }}>
        <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: "2px solid rgba(150,150,150,0.15)", borderTopColor: "var(--text-primary)", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // --- BRUTALIST LOGIN VIEW ---
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.25rem", backgroundColor: "var(--bg-color)", position: "relative" }}>
        
        {/* Subtle grid pattern matching root */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle at 25px 25px, rgba(150, 150, 150, 0.08) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(150, 150, 150, 0.08) 2%, transparent 0%)",
          backgroundSize: "100px 100px",
          zIndex: 0
        }} />

        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={iosSpring}
          style={{
            maxWidth: "340px",
            width: "100%",
            padding: "2rem",
            backgroundColor: "rgba(255, 255, 255, 0.45)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1.5px solid rgba(150, 150, 150, 0.15)",
            borderRadius: "26px",
            textAlign: "center",
            boxShadow: "0 20px 50px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255,255,255,0.75)",
            zIndex: 1
          }}
        >
          <div style={{ display: "inline-flex", padding: "12px", borderRadius: "16px", backgroundColor: "rgba(150, 150, 150, 0.06)", border: "1.5px solid rgba(150,150,150,0.1)", marginBottom: "1.25rem" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.35rem", fontWeight: "800", margin: "0 0 0.25rem 0", letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
            Studio Vault
          </h1>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "1.5rem", fontWeight: "500", lineHeight: "1.4" }}>
            Authenticate to manage calendar events, moments, comments, and inbox replies.
          </p>
          
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <input 
              type="password" 
              placeholder="Enter studio password..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "14px",
                border: "1.5px solid rgba(150, 150, 150, 0.18)",
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.86rem",
                fontWeight: "550",
                outline: "none",
                textAlign: "center",
                transition: "all 0.25s ease"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--text-primary)";
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.95)";
                e.target.style.boxShadow = "0 0 0 4px rgba(150, 150, 150, 0.06)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(150, 150, 150, 0.18)";
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
                e.target.style.boxShadow = "none";
              }}
              autoFocus
            />
            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: "600", textAlign: "center", margin: "2px 0" }}
              >
                ⚠️ {loginError}
              </motion.div>
            )}
            <motion.button 
              type="submit"
              disabled={!password.trim()}
              whileHover={password.trim() ? { scale: 1.015 } : {}}
              whileTap={password.trim() ? { scale: 0.985 } : {}}
              style={{
                width: "100%",
                padding: "11px",
                marginTop: "6px",
                backgroundColor: "var(--text-primary)",
                color: "var(--bg-color)",
                border: "none",
                borderRadius: "14px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.85rem",
                fontWeight: "750",
                cursor: password.trim() ? "pointer" : "not-allowed",
                opacity: password.trim() ? 1 : 0.45,
                transition: "all 0.2s ease",
                boxShadow: password.trim() ? "0 4px 14px rgba(0, 0, 0, 0.08)" : "none"
              }}
            >
              Verify Credentials
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- PREMIUM DASHBOARD VIEW ---
  return (
    <div className="admin-panel-container" style={{ minHeight: "100vh", padding: "2.5rem 1.5rem 8rem 1.5rem", maxWidth: "720px", margin: "0 auto", fontFamily: "var(--font-sans)", backgroundColor: "var(--bg-color)", position: "relative" }}>
      <style>{`
        /* Segmented control pill animations */
        .admin-tab-btn {
          position: relative;
          flex: 1;
          text-align: center;
          padding: 8px 12px; 
          border-radius: 24px; 
          font-size: 0.72rem; 
          font-weight: 750; 
          cursor: pointer; 
          border: none;
          background: transparent;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          transition: color 0.2s ease;
        }

        .admin-form-input {
          padding: 10px 14px;
          border-radius: 12px;
          border: 1.5px solid rgba(150, 150, 150, 0.16);
          background-color: rgba(255, 255, 255, 0.45);
          color: var(--text-primary);
          font-size: 0.8rem;
          font-weight: 500;
          font-family: var(--font-sans);
          outline: none;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
        }

        .admin-form-input:focus {
          border-color: var(--text-primary);
          background-color: rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 0 4px rgba(150, 150, 150, 0.06);
        }

        .custom-select {
          appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg fill='none' stroke='currentColor' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><polyline points='6 9 12 15 18 9'></polyline></svg>");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 11px;
          padding-right: 28px !important;
        }

        @media (max-width: 600px) {
          .admin-panel-container {
            padding: 1.5rem 1rem 6rem 1rem !important;
          }
          .grid-2col {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
        }
      `}</style>

      {/* Elegant Frosted Header */}
      <motion.header 
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={iosSpring}
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "1.8rem", 
          padding: "12px 20px", 
          backgroundColor: "rgba(255, 255, 255, 0.45)", 
          border: "1.5px solid rgba(150, 150, 150, 0.15)", 
          borderRadius: "22px", 
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.015), inset 0 1px 0 rgba(255,255,255,0.75)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.2rem", filter: "grayscale(100%)" }}>🎛️</span>
          <h1 style={{ fontSize: "1.02rem", fontWeight: "800", margin: 0, letterSpacing: "-0.03em", color: "var(--text-primary)", textTransform: "uppercase" }}>Studio Control</h1>
        </div>
        <button 
          onClick={handleLogout} 
          style={{ 
            padding: "6px 14px", 
            backgroundColor: "rgba(239, 68, 68, 0.07)", 
            border: "1.5px solid rgba(239, 68, 68, 0.12)", 
            borderRadius: "30px", 
            color: "#ef4444", 
            fontSize: "0.68rem", 
            fontWeight: "750", 
            cursor: "pointer", 
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            textTransform: "uppercase",
            letterSpacing: "0.03em"
          }} 
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#ef4444"; e.currentTarget.style.color = "#ffffff"; }} 
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.07)"; e.currentTarget.style.color = "#ef4444"; }}
        >
          Logout
        </button>
      </motion.header>

      {/* Segmented iOS-Style Pill Tabs Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...iosSpring, delay: 0.05 }}
        style={{ 
          display: "flex", 
          gap: "2px", 
          padding: "4px", 
          backgroundColor: "rgba(150, 150, 150, 0.05)", 
          border: "1.5px solid rgba(150, 150, 150, 0.08)", 
          borderRadius: "28px", 
          marginBottom: "1.8rem",
          position: "relative"
        }}
      >
        {(["inbox", "calendar", "comments", "moments"] as const).map(tab => (
          <button 
            key={tab} 
            className="admin-tab-btn"
            onClick={() => setActiveTab(tab)} 
            style={{ 
              color: activeTab === tab ? "var(--bg-color)" : "var(--text-secondary)",
              zIndex: 1
            }}
          >
            <span style={{ position: "relative", zIndex: 2 }}>{tab}</span>
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabHighlight"
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundColor: "var(--text-primary)",
                  borderRadius: "24px",
                  zIndex: 1
                }}
              />
            )}
          </button>
        ))}
      </motion.div>

      {/* Content Panels with smooth exit/entrance */}
      <AnimatePresence mode="wait">
        
        {/* --- INBOX TAB --- */}
        {activeTab === "inbox" && (
          <motion.div key="inbox" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            
            {/* Inbox header & Filter Toggle system */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "10px" }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: "800", margin: 0, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Anonymous Questions</h2>
              
              {/* Internal segmented filter */}
              <div style={{ display: "flex", gap: "2px", backgroundColor: "rgba(150,150,150,0.06)", border: "1px solid rgba(150,150,150,0.08)", padding: "2px", borderRadius: "12px" }}>
                {(["pending", "answered", "all"] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setInboxFilter(filter)}
                    style={{
                      padding: "4px 10px",
                      fontSize: "0.62rem",
                      fontWeight: "750",
                      borderRadius: "9px",
                      border: "none",
                      cursor: "pointer",
                      textTransform: "uppercase",
                      letterSpacing: "0.02em",
                      backgroundColor: inboxFilter === filter ? "var(--text-primary)" : "transparent",
                      color: inboxFilter === filter ? "var(--bg-color)" : "var(--text-secondary)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
            
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map(q => (
                  <motion.div 
                    key={q.id} 
                    variants={fadeRise}
                    layoutId={`qcard-${q.id}`}
                    style={{ 
                      padding: "18px 20px", 
                      backgroundColor: "rgba(255, 255, 255, 0.45)", 
                      backdropFilter: "blur(20px)", 
                      WebkitBackdropFilter: "blur(20px)",
                      border: "1.5px solid rgba(150, 150, 150, 0.14)", 
                      borderRadius: "22px",
                      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.015), inset 0 1px 0 rgba(255, 255, 255, 0.75)",
                      position: "relative",
                      transition: "border-color 0.2s ease, box-shadow 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "0.62rem", color: "#B47A3E", fontWeight: "700", letterSpacing: "0.01em" }}>
                          {new Date(q.published).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span style={{ 
                          fontSize: "0.55rem", 
                          fontWeight: "800", 
                          backgroundColor: q.answered ? "rgba(16,185,129,0.08)" : "rgba(180,122,62,0.08)", 
                          color: q.answered ? "#10b981" : "#B47A3E", 
                          border: q.answered ? "1px solid rgba(16,185,129,0.15)" : "1px solid rgba(180,122,62,0.15)",
                          padding: "2px 8px", 
                          borderRadius: "8px", 
                          letterSpacing: "0.04em" 
                        }}>
                          {q.answered ? "ANSWERED" : "NEW QUESTION"}
                        </span>
                      </div>
                      
                      <motion.button 
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.08)", color: "#ef4444" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteQuestion(q.id)} 
                        style={{ 
                          width: "26px",
                          height: "26px",
                          backgroundColor: "transparent", 
                          border: "none", 
                          borderRadius: "50%",
                          color: "var(--text-secondary)", 
                          cursor: "pointer", 
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.2s ease" 
                        }}
                        title="Delete Question"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </motion.button>
                    </div>
 
                    <p style={{ margin: "0 0 12px 0", fontSize: "0.90rem", color: "var(--text-primary)", lineHeight: "1.45", fontWeight: "600", letterSpacing: "-0.01em" }}>
                      "{q.content}"
                    </p>
 
                    {q.answered && q.answer && (
                      <div style={{ 
                        padding: "14px 16px", 
                        backgroundColor: "rgba(0, 0, 0, 0.03)", 
                        borderRadius: "16px", 
                        border: "1.5px solid rgba(150, 150, 150, 0.08)", 
                        marginTop: "12px",
                        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.02)"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ 
                            fontSize: "0.58rem", 
                            fontWeight: "800", 
                            backgroundColor: "rgba(16, 185, 129, 0.08)", 
                            color: "#10b981", 
                            padding: "2px 6px", 
                            borderRadius: "5px", 
                            letterSpacing: "0.04em",
                            textTransform: "uppercase"
                          }}>
                            Reply from Ivan
                          </span>
                        </div>
                        <p style={{ margin: "0 0 10px 0", fontSize: "0.80rem", color: "var(--text-secondary)", lineHeight: "1.5", fontWeight: "500" }}>{q.answer}</p>
                        
                        {answeringQuestionId !== q.id && (
                          <motion.button 
                            whileHover={{ scale: 1.03, backgroundColor: "rgba(150,150,150,0.06)" }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              setAnsweringQuestionId(q.id);
                              setAnswerText(q.answer || "");
                            }}
                            style={{ 
                              padding: "5px 12px", 
                              backgroundColor: "transparent", 
                              border: "1.5px solid rgba(150,150,150,0.18)", 
                              borderRadius: "20px", 
                              color: "var(--text-primary)", 
                              fontSize: "0.68rem", 
                              fontWeight: "750", 
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              textTransform: "uppercase",
                              letterSpacing: "0.02em"
                            }}
                          >
                            Edit Reply
                          </motion.button>
                        )}
                      </div>
                    )}
 
                    {!q.answered && answeringQuestionId !== q.id && (
                      <motion.button 
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(150,150,150,0.08)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setAnsweringQuestionId(q.id);
                          setAnswerText("");
                        }}
                        style={{ 
                          padding: "6px 14px", 
                          marginTop: "4px", 
                          backgroundColor: "rgba(150,150,150,0.05)", 
                          border: "1.5px solid rgba(150,150,150,0.12)", 
                          borderRadius: "30px", 
                          color: "var(--text-primary)", 
                          fontSize: "0.7rem", 
                          fontWeight: "750", 
                          cursor: "pointer", 
                          transition: "all 0.2s ease" 
                        }}
                      >
                        Reply anonymously
                      </motion.button>
                    )}
 
                    {answeringQuestionId === q.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px", overflow: "hidden" }}
                      >
                        {/* Recessed textbox tray */}
                        <div style={{
                          backgroundColor: "rgba(0, 0, 0, 0.04)",
                          borderRadius: "16px",
                          padding: "10px 14px",
                          border: "1.5px solid rgba(150,150,150,0.1)",
                          boxShadow: "inset 0 2px 5px rgba(0,0,0,0.05)"
                        }}>
                          <textarea
                            placeholder="Type your response to publish on the site..."
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            style={{
                              width: "100%",
                              minHeight: "90px",
                              border: "none",
                              backgroundColor: "transparent",
                              color: "var(--text-primary)",
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.82rem",
                              lineHeight: "1.5",
                              outline: "none",
                              resize: "none",
                              fontWeight: "550"
                            }}
                          />
                        </div>
                        <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                          <motion.button 
                            whileHover={answerText.trim() ? { scale: 1.02 } : {}}
                            whileTap={answerText.trim() ? { scale: 0.98 } : {}}
                            onClick={() => handleAnswerQuestion(q.id)}
                            disabled={!answerText.trim()}
                            style={{ 
                              padding: "7px 16px", 
                              backgroundColor: "var(--text-primary)", 
                              color: "var(--bg-color)", 
                              border: "none", 
                              borderRadius: "30px", 
                              fontSize: "0.7rem", 
                              fontWeight: "750", 
                              cursor: answerText.trim() ? "pointer" : "not-allowed", 
                              opacity: answerText.trim() ? 1 : 0.45,
                              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
                              transition: "opacity 0.2s" 
                            }}
                          >
                            Publish Reply
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setAnsweringQuestionId(null)}
                            style={{ 
                              padding: "7px 16px", 
                              backgroundColor: "rgba(150, 150, 150, 0.06)", 
                              border: "1.5px solid rgba(150, 150, 150, 0.12)", 
                              borderRadius: "30px", 
                              color: "var(--text-secondary)", 
                              fontSize: "0.7rem", 
                              fontWeight: "750", 
                              cursor: "pointer" 
                            }}
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div style={{ padding: "4rem 1rem", textAlign: "center", color: "var(--text-secondary)", border: "1.5px dashed rgba(150,150,150,0.15)", borderRadius: "24px" }}>
                  <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: "750", color: "var(--text-primary)" }}>No questions here</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "500" }}>
                    {inboxFilter === "pending" ? "All questions have been fully answered!" : "This inbox list filter is completely empty."}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
 
        {/* --- CALENDAR TAB --- */}
        {activeTab === "calendar" && (
          <motion.div key="calendar" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: "800", margin: 0, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Schedule Management</h2>
            </div>
            
            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.45)", border: "1.5px solid rgba(150,150,150,0.15)", borderRadius: "24px", overflow: "hidden", boxShadow: "0 8px 30px rgba(0, 0, 0, 0.015)" }}>
              
              {/* Ivan's Birthday locked row */}
              <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: "1.5px solid rgba(150,150,150,0.08)", backgroundColor: "rgba(255, 255, 255, 0.2)" }}>
                <div style={{ width: "36px", height: "36px", backgroundColor: "rgba(230,183,65,0.12)", border: "1px solid rgba(230,183,65,0.18)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.05rem", marginRight: "0.85rem" }}>
                  🎂
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 0.1rem 0", fontSize: "0.82rem", fontWeight: "750", color: "var(--text-primary)" }}>Ivan's Birthday celebration</h3>
                  <p style={{ margin: 0, fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: "500" }}>Fires beautiful custom balloon floaters every August 3rd.</p>
                </div>
                <div style={{ fontSize: "0.58rem", fontWeight: "800", backgroundColor: "rgba(150,150,150,0.08)", border: "1px solid rgba(150,150,150,0.12)", padding: "3px 10px", borderRadius: "8px", color: "var(--text-secondary)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  System Locked
                </div>
              </div>
              
              <div style={{ padding: "4rem 1rem", textAlign: "center", color: "var(--text-secondary)" }}>
                <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: "700", color: "var(--text-primary)" }}>Archival Seasonal System</p>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.70rem", color: "var(--text-secondary)", fontWeight: "500", maxWidth: "340px", marginInline: "auto", lineHeight: "1.4" }}>
                  Holiday animations (Idul Fitri, Christmas snows, Lunar New Year lanterns) are locked to trigger dynamically using native client calendars.
                </p>
              </div>
            </div>
          </motion.div>
        )}
 
        {/* --- COMMENTS TAB --- */}
        {activeTab === "comments" && (
          <motion.div key="comments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: "800", margin: 0, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Comment Moderation</h2>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {adminComments.length > 0 ? (
                adminComments.map(comment => (
                  <motion.div 
                     key={comment.id} 
                     layoutId={`ccard-${comment.id}`}
                     style={{ 
                       padding: "16px 18px", 
                       backgroundColor: "rgba(255, 255, 255, 0.45)", 
                       backdropFilter: "blur(20px)", 
                       WebkitBackdropFilter: "blur(20px)",
                       border: "1.5px solid rgba(150, 150, 150, 0.14)", 
                       borderRadius: "22px", 
                       display: "flex", 
                       flexDirection: "column",
                       gap: "10px", 
                       boxShadow: "0 8px 30px rgba(0, 0, 0, 0.015), inset 0 1px 0 rgba(255,255,255,0.75)"
                     }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", width: "100%" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                          <span style={{ fontSize: "0.80rem", fontWeight: "800", color: "var(--text-primary)" }}>{comment.author.displayName}</span>
                          <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: "500", opacity: 0.85 }}>({comment.author.email})</span>
                          <span style={{ fontSize: "0.62rem", color: "#B47A3E", fontWeight: "700", fontFamily: "monospace" }}>
                            {new Date(comment.published).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "0.62rem", color: "var(--text-secondary)", fontWeight: "600" }}>Post ID:</span>
                          <a 
                            href={`/blog/${comment.postId}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ 
                              fontSize: "0.65rem", 
                              color: "var(--text-secondary)", 
                              textDecoration: "underline",
                              textUnderlineOffset: "2.5px",
                              fontWeight: "700",
                              transition: "color 0.2s" 
                            }}
                            onMouseOver={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                            onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                          >
                            {comment.postId.length > 14 ? `${comment.postId.substring(0, 14)}...` : comment.postId}
                          </a>
                        </div>
                      </div>

                      {/* Approval badge */}
                      {!comment.approved ? (
                        <span style={{ fontSize: "0.55rem", fontWeight: "800", backgroundColor: "rgba(180, 122, 62, 0.08)", color: "#B47A3E", border: "1px solid rgba(180, 122, 62, 0.15)", padding: "2px 8px", borderRadius: "8px", letterSpacing: "0.04em", textTransform: "uppercase" }}>PENDING</span>
                      ) : (
                        <span style={{ fontSize: "0.55rem", fontWeight: "800", backgroundColor: "rgba(16, 185, 129, 0.08)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.15)", padding: "2px 8px", borderRadius: "8px", letterSpacing: "0.04em", textTransform: "uppercase" }}>APPROVED</span>
                      )}
                    </div>

                    <div style={{ 
                      padding: "10px 12px", 
                      backgroundColor: "rgba(0, 0, 0, 0.02)", 
                      border: "1px solid rgba(150,150,150,0.06)", 
                      borderRadius: "12px", 
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.01)" 
                    }}>
                      <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-primary)", lineHeight: "1.45", fontWeight: "500" }}>{comment.content}</p>
                    </div>
                    
                    <div style={{ display: "flex", gap: "6px", alignSelf: "flex-end", marginTop: "4px" }}>
                      {!comment.approved && (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleApproveComment(comment.id)} 
                          style={{ padding: "5px 12px", backgroundColor: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.15)", borderRadius: "20px", color: "#10b981", fontSize: "0.68rem", fontWeight: "750", cursor: "pointer", transition: "all 0.2s" }}
                          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#10b981"; e.currentTarget.style.color = "#ffffff"; }}
                          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.08)"; e.currentTarget.style.color = "#10b981"; }}
                        >
                          Approve
                        </motion.button>
                      )}
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDeleteComment(comment.id)} 
                        style={{ padding: "5px 12px", backgroundColor: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "20px", color: "#ef4444", fontSize: "0.68rem", fontWeight: "750", cursor: "pointer", transition: "all 0.2s" }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#ef4444"; e.currentTarget.style.color = "#ffffff"; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.08)"; e.currentTarget.style.color = "#ef4444"; }}
                      >
                        Delete
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div style={{ padding: "4rem 1rem", textAlign: "center", color: "var(--text-secondary)", border: "1.5px dashed rgba(150,150,150,0.15)", borderRadius: "24px" }}>
                  <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: "750", color: "var(--text-primary)" }}>No comments submitted yet</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "500" }}>Comments from readers will require approval before displaying.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
 
        {/* --- MOMENTS TAB --- */}
        {activeTab === "moments" && (
          <motion.div key="moments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: "800", margin: 0, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Moments Gallery Curation</h2>
            </div>
            
            {/* Elegant Form */}
            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.45)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1.5px solid rgba(150,150,150,0.15)", borderRadius: "24px", padding: "22px", marginBottom: "2rem", boxShadow: "0 10px 40px rgba(0, 0, 0, 0.01), inset 0 1px 0 rgba(255,255,255,0.75)" }}>
              
              <h3 style={{ fontSize: "0.78rem", fontWeight: "800", color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.03em", margin: "0 0 1rem 0" }}>Publish New Moment</h3>

              <form onSubmit={handleUploadMoment} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                
                {/* Cozy Clickable Drag-and-Drop Upload Area */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "0.62rem", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Upload Photo</span>
                  
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*" 
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />

                  <div 
                    onClick={triggerFileSelect}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                      border: isDragOver ? "2px dashed var(--text-primary)" : "2.2px dashed rgba(150,150,150,0.22)",
                      borderRadius: "16px",
                      padding: "24px 16px",
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundColor: isDragOver 
                        ? "rgba(150,150,150,0.06)" 
                        : (momentPreviewUrl ? "rgba(0,0,0,0.01)" : "rgba(150,150,150,0.02)"),
                      transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px"
                    }}
                  >
                    {momentPreviewUrl ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", position: "relative" }}>
                        <div style={{ position: "relative", width: "90px", height: "90px", borderRadius: "12px", overflow: "hidden", border: "1.5px solid rgba(150,150,150,0.2)", boxShadow: "0 6px 16px rgba(0,0,0,0.06)" }}>
                          <img 
                            src={momentPreviewUrl} 
                            alt="preview" 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-primary)" }}>{momentFile?.name}</span>
                          <span style={{ fontSize: "0.62rem", color: "var(--text-secondary)", fontWeight: "500" }}>
                            {momentFile ? `${(momentFile.size / (1024 * 1024)).toFixed(2)} MB` : ""}
                          </span>
                        </div>
                        <motion.button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMomentFile(null);
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            padding: "4px 12px",
                            backgroundColor: "rgba(239, 68, 68, 0.08)",
                            border: "1px solid rgba(239, 68, 68, 0.15)",
                            borderRadius: "20px",
                            color: "#ef4444",
                            fontSize: "0.62rem",
                            fontWeight: "750",
                            cursor: "pointer",
                            textTransform: "uppercase",
                            letterSpacing: "0.02em",
                            marginTop: "4px"
                          }}
                        >
                          Change Photo
                        </motion.button>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: "1.5rem", filter: "grayscale(100%)", opacity: 0.85 }}>📸</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "0.76rem", fontWeight: "750", color: "var(--text-primary)" }}>
                            Drag & drop your photo here
                          </span>
                          <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: "500" }}>
                            or tap to browse files
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* 2-Column form grid */}
                <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.62rem", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Title (Optional)</label>
                    <input className="admin-form-input" type="text" placeholder="e.g., Autumn Foliage" value={momentTitle} onChange={(e) => setMomentTitle(e.target.value)} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.62rem", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Location</label>
                    <input className="admin-form-input" type="text" placeholder="e.g., Kyoto, Japan" value={momentLocation} onChange={(e) => setMomentLocation(e.target.value)} required />
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.62rem", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Date Label</label>
                  <input className="admin-form-input" type="text" placeholder="e.g., Aug 2023 or Spring 2025" value={momentDate} onChange={(e) => setMomentDate(e.target.value)} required />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.62rem", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Story or context</label>
                  <textarea className="admin-form-input" placeholder="Write a cozy memory or journal snippet for this photo..." value={momentStory} onChange={(e) => setMomentStory(e.target.value)} style={{ minHeight: "80px", resize: "none" }} />
                </div>
                
                <motion.button 
                  type="submit" 
                  disabled={isUploadingMoment || !momentFile || !momentLocation || !momentDate} 
                  whileHover={(!isUploadingMoment && momentFile && momentLocation && momentDate) ? { scale: 1.01 } : {}}
                  whileTap={(!isUploadingMoment && momentFile && momentLocation && momentDate) ? { scale: 0.99 } : {}}
                  style={{ 
                    padding: "12px", 
                    backgroundColor: "var(--text-primary)", 
                    color: "var(--bg-color)", 
                    border: "none", 
                    borderRadius: "30px", 
                    fontSize: "0.78rem", 
                    fontWeight: "800", 
                    cursor: (isUploadingMoment || !momentFile || !momentLocation || !momentDate) ? "not-allowed" : "pointer", 
                    opacity: (isUploadingMoment || !momentFile || !momentLocation || !momentDate) ? 0.45 : 1, 
                    transition: "opacity 0.2s ease",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                    textTransform: "uppercase",
                    letterSpacing: "0.03em"
                  }}
                >
                  {isUploadingMoment ? "Uploading photo to storage..." : "Publish to gallery"}
                </motion.button>
              </form>
            </div>
 
            {/* Gallery Grid List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <h3 style={{ fontSize: "0.78rem", fontWeight: "800", color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.03em", margin: "0 0 4px 0" }}>Active Moments List</h3>
              
              {adminMoments.length > 0 ? (
                adminMoments.map(moment => (
                  <motion.div 
                    key={moment.id} 
                    layoutId={`mcard-${moment.id}`}
                    style={{ 
                      display: "flex", 
                      gap: "14px", 
                      padding: "14px 16px", 
                      backgroundColor: "rgba(255, 255, 255, 0.45)", 
                      backdropFilter: "blur(20px)", 
                      WebkitBackdropFilter: "blur(20px)", 
                      border: "1.5px solid rgba(150, 150, 150, 0.14)", 
                      borderRadius: "22px", 
                      alignItems: "center", 
                      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.01), inset 0 1px 0 rgba(255,255,255,0.75)",
                      flexWrap: "wrap"
                    }}
                  >
                    <div style={{ position: "relative", width: "65px", height: "65px", borderRadius: "12px", overflow: "hidden", border: "1px solid rgba(150,150,150,0.15)", flexShrink: 0 }}>
                      <img src={moment.url} alt="moment thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: "120px", display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "var(--text-primary)" }}>📍 {moment.location}</span>
                      <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: "500" }}>{moment.date}</span>
                      {moment.title && moment.title !== "Untitled" && (
                        <span style={{ fontSize: "0.62rem", color: "var(--text-secondary)", fontStyle: "italic", opacity: 0.85 }}>"{moment.title}"</span>
                      )}
                    </div>
                    
                    {/* Homepage slot manager dropdown pill */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginRight: "6px" }}>
                      <span style={{ fontSize: "0.58rem", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Homepage Curation</span>
                      <select 
                        value={moment.homepageOrder !== undefined ? String(moment.homepageOrder) : "none"}
                        onChange={(e) => handleSetHomepageSlot(moment.id, e.target.value)}
                        className="custom-select"
                        style={{ 
                          padding: "5px 12px", 
                          borderRadius: "10px", 
                          border: "1.5px solid rgba(150,150,150,0.22)", 
                          backgroundColor: moment.homepageOrder !== undefined ? "var(--text-primary)" : "rgba(150,150,150,0.05)", 
                          color: moment.homepageOrder !== undefined ? "var(--bg-color)" : "var(--text-primary)", 
                          fontSize: "0.68rem", 
                          fontWeight: "800",
                          outline: "none",
                          cursor: "pointer",
                          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
                        }}
                      >
                        <option value="none">Not on Homepage</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                          <option key={num} value={String(num)}>Slot {num} Grid</option>
                        ))}
                      </select>
                    </div>
   
                    <motion.button 
                      whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.08)", color: "#ef4444" }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteMoment(moment.id, moment.storagePath)} 
                      style={{ 
                        width: "30px", 
                        height: "30px", 
                        backgroundColor: "rgba(239,68,68,0.05)", 
                        border: "none", 
                        borderRadius: "50%", 
                        color: "#ef4444", 
                        cursor: "pointer", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        transition: "all 0.2s ease",
                        flexShrink: 0
                      }} 
                      title="Delete Photo"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </motion.button>
                  </motion.div>
                ))
              ) : (
                <div style={{ padding: "4rem 1rem", textAlign: "center", color: "var(--text-secondary)", border: "1.5px dashed rgba(150,150,150,0.15)", borderRadius: "24px" }}>
                  <p style={{ margin: 0, fontSize: "0.8rem", fontWeight: "750", color: "var(--text-primary)" }}>No moments published yet</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.72rem", color: "var(--text-secondary)", fontWeight: "500" }}>Upload your first moment card above!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS-Style High-Fidelity Custom Confirmation Dialog Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1.25rem",
          }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
              style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)"
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: "spring", damping: 26, stiffness: 380 }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "340px",
                backgroundColor: "var(--bg-color)",
                border: "1.5px solid rgba(150, 150, 150, 0.18)",
                borderRadius: "26px",
                padding: "1.5rem",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255,255,255,0.8)",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "1.1rem"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <h3 style={{ fontSize: "1.08rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.03em", margin: 0 }}>
                  {confirmModal.title}
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.45", margin: 0, fontWeight: "500" }}>
                  {confirmModal.message}
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "2px" }}>
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "30px",
                    border: "1.5px solid rgba(150, 150, 150, 0.2)",
                    backgroundColor: "rgba(150, 150, 150, 0.04)",
                    color: "var(--text-primary)",
                    fontSize: "0.82rem",
                    fontWeight: "750",
                    cursor: "pointer",
                    outline: "none",
                    transition: "background 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(150, 150, 150, 0.08)"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(150, 150, 150, 0.04)"}
                >
                  {confirmModal.cancelText}
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "30px",
                    border: "none",
                    backgroundColor: "#ef4444",
                    color: "#ffffff",
                    fontSize: "0.82rem",
                    fontWeight: "750",
                    cursor: "pointer",
                    outline: "none",
                    boxShadow: "0 6px 16px rgba(239, 68, 68, 0.2)",
                    transition: "opacity 0.2s"
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = "0.9"}
                  onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
