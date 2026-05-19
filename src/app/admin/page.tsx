"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Replaced Server Actions with robust API routes to prevent proxy crashes
import { getAllCommentsForAdmin, approveComment, deleteComment, CommentItem } from "@/lib/comments";
import { getAllQuestionsForAdmin, answerQuestion, deleteQuestion, QuestionItem } from "@/lib/questions";
import { getAllMoments, addMoment, deleteMoment, updateMoment, uploadMomentPhoto, MomentItem } from "@/lib/moments";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [activeTab, setActiveTab] = useState<"inbox" | "calendar" | "comments" | "moments">("inbox");
  const [adminQuestions, setAdminQuestions] = useState<QuestionItem[]>([]);
  const [adminComments, setAdminComments] = useState<CommentItem[]>([]);
  const [adminMoments, setAdminMoments] = useState<MomentItem[]>([]);
  
  // Moment States
  const [isUploadingMoment, setIsUploadingMoment] = useState(false);
  const [momentFile, setMomentFile] = useState<File | null>(null);
  const [momentTitle, setMomentTitle] = useState("");
  const [momentLocation, setMomentLocation] = useState("");
  const [momentDate, setMomentDate] = useState("");
  const [momentStory, setMomentStory] = useState("");

  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");

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
    // Bulletproof try-catch-finally block to absolutely prevent loading spinner hang!
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

  // Fetch comments when authenticated and comments tab is active
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

  // Fetch questions when authenticated and inbox tab is active
  useEffect(() => {
    if (isAuthenticated && activeTab === "inbox") {
      const loadQuestions = async () => {
        try {
          const list = await getAllQuestionsForAdmin();
          // Sort newest questions first
          const sorted = list.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
          setAdminQuestions(sorted);
        } catch (err) {
          console.error("Failed to load questions:", err);
        }
      };
      loadQuestions();
    }
  }, [isAuthenticated, activeTab]);

  // Fetch moments when authenticated and moments tab is active
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
        // Instantly load and sort active tab questions newest-first
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

  // Answer or Edit Question Action
  const handleAnswerQuestion = async (id: string) => {
    if (!answerText.trim()) return;
    const success = await answerQuestion(id, answerText.trim());
    if (success) {
      setAdminQuestions(prev => prev.map(q => q.id === id ? { ...q, answered: true, answer: answerText.trim() } : q));
      setAnsweringQuestionId(null);
      setAnswerText("");
    }
  };

  // Delete Question Action
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

  // Approve Comment Action
  const handleApproveComment = async (id: string) => {
    const success = await approveComment(id);
    if (success) {
      setAdminComments(prev => prev.map(c => c.id === id ? { ...c, approved: true } : c));
    }
  };

  // Delete Comment Action
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

  // Upload Moment Action
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
      // Reset input element
      const fileInput = document.getElementById("momentFileInput") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err) {
      console.error("Failed to upload moment:", err);
      alert("Upload failed. See console for details.");
    } finally {
      setIsUploadingMoment(false);
    }
  };

  // Delete Moment Action
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

  // Set Homepage Slot Action
  const handleSetHomepageSlot = async (momentId: string, slotStr: string) => {
    const slotVal = slotStr === "none" ? 0 : parseInt(slotStr);
    
    // Optimistic UI update
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

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-color)" }}>
        <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "2px solid rgba(150,150,150,0.2)", borderTopColor: "var(--text-primary)", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // --- COMPACT LOGIN VIEW ---
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem", backgroundColor: "var(--bg-color)" }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: "300px",
            width: "100%",
            padding: "1.5rem",
            backgroundColor: "rgba(150,150,150,0.03)",
            border: "1px solid rgba(150,150,150,0.1)",
            borderRadius: "16px",
            textAlign: "center"
          }}
        >
          <div style={{ display: "inline-flex", padding: "8px", borderRadius: "10px", backgroundColor: "rgba(150,150,150,0.08)", marginBottom: "1rem" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "1.15rem", fontWeight: "700", margin: "0 0 1.25rem 0", letterSpacing: "-0.01em", color: "var(--text-primary)" }}>
            Studio Admin
          </h1>
          
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <input 
              type="password" 
              placeholder="Enter secret password..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(150,150,150,0.2)",
                backgroundColor: "rgba(150,150,150,0.02)",
                color: "var(--text-primary)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.8rem",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--text-primary)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(150,150,150,0.2)"}
              autoFocus
            />
            {loginError && (
              <div style={{ fontSize: "0.7rem", color: "#ef4444", textAlign: "left", paddingLeft: "4px" }}>
                {loginError}
              </div>
            )}
            <button 
              type="submit"
              disabled={!password.trim()}
              style={{
                width: "100%",
                padding: "8px",
                marginTop: "4px",
                backgroundColor: "var(--text-primary)",
                color: "var(--bg-color)",
                border: "none",
                borderRadius: "8px",
                fontFamily: "var(--font-sans)",
                fontSize: "0.8rem",
                fontWeight: "600",
                cursor: password.trim() ? "pointer" : "not-allowed",
                opacity: password.trim() ? 1 : 0.5,
                transition: "opacity 0.2s"
              }}
            >
              Authenticate
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- DASHBOARD VIEW (COMPACT NEAT LAYOUT) ---
  return (
    <div className="admin-panel-container" style={{ minHeight: "100vh", padding: "2rem 1.5rem", maxWidth: "800px", margin: "0 auto", fontFamily: "var(--font-sans)", backgroundColor: "var(--bg-color)" }}>
      <style>{`
        .admin-tabs-container button:active {
          transform: scale(0.97);
        }
        
        .moments-grid-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        
        .moments-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .admin-form-input {
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid rgba(150,150,150,0.18);
          background-color: rgba(150,150,150,0.02);
          color: var(--text-primary);
          font-size: 0.78rem;
          font-family: var(--font-sans);
          outline: none;
          transition: all 0.2s ease;
        }

        .admin-form-input:focus {
          border-color: var(--text-primary);
          background-color: rgba(150,150,150,0.04);
        }

        @media (max-width: 600px) {
          .admin-panel-container {
            padding: 1.5rem 1rem !important;
          }
          .moments-form-row {
            grid-template-columns: 1fr;
          }
          .moments-grid-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Compact Frosted Header */}
      <header style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "1.5rem", 
        padding: "12px 20px", 
        backgroundColor: "rgba(150, 150, 150, 0.03)", 
        border: "1px solid rgba(150, 150, 150, 0.08)", 
        borderRadius: "18px", 
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "1.1rem" }}>🎛️</span>
          <h1 style={{ fontSize: "1.05rem", fontWeight: "800", margin: 0, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Studio Dashboard</h1>
        </div>
        <button onClick={handleLogout} style={{ padding: "6px 12px", backgroundColor: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.15)", borderRadius: "30px", color: "#ef4444", fontSize: "0.68rem", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#ef4444"; e.currentTarget.style.color = "#ffffff"; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.08)"; e.currentTarget.style.color = "#ef4444"; }}>
          Logout
        </button>
      </header>

      {/* Compact Capsule Tabs Pillbar */}
      <div className="admin-tabs-container" style={{ display: "flex", gap: "0.25rem", padding: "4px", backgroundColor: "rgba(150, 150, 150, 0.05)", border: "1px solid rgba(150, 150, 150, 0.08)", borderRadius: "30px", marginBottom: "1.5rem", overflowX: "auto" }}>
        {(["inbox", "calendar", "comments", "moments"] as const).map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            style={{ 
              flex: 1,
              textAlign: "center",
              padding: "8px 14px", 
              borderRadius: "20px", 
              fontSize: "0.72rem", 
              fontWeight: "750", 
              cursor: "pointer", 
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)", 
              backgroundColor: activeTab === tab ? "var(--text-primary)" : "transparent", 
              color: activeTab === tab ? "var(--bg-color)" : "var(--text-secondary)", 
              border: "none",
              textTransform: "uppercase",
              letterSpacing: "0.02em"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Panels */}
      <AnimatePresence mode="wait">
        {activeTab === "inbox" && (
          <motion.div key="inbox" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: "700", margin: 0, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Anonymous Inbox</h2>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {adminQuestions.length > 0 ? (
                adminQuestions.map(q => (
                  <motion.div 
                    key={q.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ 
                      padding: "16px 18px", 
                      backgroundColor: "rgba(255, 255, 255, 0.45)", 
                      backdropFilter: "blur(12px)", 
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(150, 150, 150, 0.12)", 
                      borderRadius: "20px",
                      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.015), inset 0 1px 1px rgba(255, 255, 255, 0.8)",
                      position: "relative",
                      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "0.62rem", color: "#B47A3E", fontWeight: "650", fontFamily: "monospace" }}>
                          {new Date(q.published).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span style={{ 
                          fontSize: "0.55rem", 
                          fontWeight: "750", 
                          backgroundColor: q.answered ? "rgba(16,185,129,0.08)" : "rgba(180,122,62,0.08)", 
                          color: q.answered ? "#10b981" : "#B47A3E", 
                          padding: "2px 6px", 
                          borderRadius: "6px", 
                          letterSpacing: "0.03em" 
                        }}>
                          {q.answered ? "ANSWERED" : "NEW QUESTION"}
                        </span>
                      </div>
                      
                      <motion.button 
                        whileHover={{ scale: 1.1, backgroundColor: "rgba(239, 68, 68, 0.08)", color: "#ef4444" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteQuestion(q.id)} 
                        style={{ 
                          padding: "6px", 
                          backgroundColor: "transparent", 
                          border: "none", 
                          borderRadius: "50%",
                          color: "var(--text-secondary)", 
                          cursor: "pointer", 
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "color 0.2s, background-color 0.2s" 
                        }}
                        title="Delete Question"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </motion.button>
                    </div>
 
                    <p style={{ margin: "0 0 10px 0", fontSize: "0.85rem", color: "var(--text-primary)", lineHeight: "1.45", fontWeight: "600", letterSpacing: "-0.01em" }}>
                      "{q.content}"
                    </p>
 
                    {q.answered && q.answer && (
                      <div style={{ 
                        padding: "12px 14px", 
                        backgroundColor: "rgba(150, 150, 150, 0.03)", 
                        borderRadius: "14px", 
                        border: "1px solid rgba(150, 150, 150, 0.08)", 
                        marginTop: "10px",
                        boxShadow: "inset 1px 1.5px 3px rgba(0,0,0,0.01)"
                      }}>
                        <span style={{ 
                          fontSize: "0.58rem", 
                          fontWeight: "750", 
                          backgroundColor: "rgba(16, 185, 129, 0.08)", 
                          color: "#10b981", 
                          padding: "2px 6px", 
                          borderRadius: "4px", 
                          display: "inline-block", 
                          marginBottom: "6px", 
                          letterSpacing: "0.03em" 
                        }}>
                          REPLY PUBLISHED
                        </span>
                        <p style={{ margin: "0 0 8px 0", fontSize: "0.76rem", color: "var(--text-secondary)", lineHeight: "1.45" }}>{q.answer}</p>
                        
                        {answeringQuestionId !== q.id && (
                          <motion.button 
                            whileHover={{ scale: 1.03, backgroundColor: "rgba(150,150,150,0.05)" }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              setAnsweringQuestionId(q.id);
                              setAnswerText(q.answer || "");
                            }}
                            style={{ 
                              padding: "4px 10px", 
                              backgroundColor: "transparent", 
                              border: "1px solid rgba(150,150,150,0.18)", 
                              borderRadius: "20px", 
                              color: "var(--text-primary)", 
                              fontSize: "0.65rem", 
                              fontWeight: "700", 
                              cursor: "pointer",
                              transition: "all 0.15s ease" 
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
                          marginTop: "6px", 
                          backgroundColor: "rgba(150,150,150,0.04)", 
                          border: "1px solid rgba(150,150,150,0.08)", 
                          borderRadius: "30px", 
                          color: "var(--text-primary)", 
                          fontSize: "0.68rem", 
                          fontWeight: "700", 
                          cursor: "pointer", 
                          transition: "all 0.2s" 
                        }}
                      >
                        Reply anonymously
                      </motion.button>
                    )}
 
                    {answeringQuestionId === q.id && (
                      <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <textarea
                          placeholder="Type your response to publish on the site..."
                          value={answerText}
                          onChange={(e) => setAnswerText(e.target.value)}
                          onFocus={(e) => {
                            e.target.style.borderColor = "var(--text-primary)";
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = "rgba(150, 150, 150, 0.15)";
                          }}
                          style={{
                            width: "100%",
                            minHeight: "90px",
                            padding: "10px 12px",
                            borderRadius: "14px",
                            border: "1.5px solid rgba(150, 150, 150, 0.15)",
                            backgroundColor: "rgba(150, 150, 150, 0.02)",
                            color: "var(--text-primary)",
                            fontFamily: "var(--font-sans)",
                            fontSize: "0.76rem",
                            lineHeight: "1.45",
                            outline: "none",
                            resize: "none",
                            transition: "all 0.25s"
                          }}
                        />
                        <div style={{ display: "flex", gap: "6px" }}>
                          <motion.button 
                            whileHover={{ scale: answerText.trim() ? 1.03 : 1 }}
                            whileTap={{ scale: answerText.trim() ? 0.97 : 1 }}
                            onClick={() => handleAnswerQuestion(q.id)}
                            disabled={!answerText.trim()}
                            style={{ 
                              padding: "6px 14px", 
                              backgroundColor: "var(--text-primary)", 
                              color: "var(--bg-color)", 
                              border: "none", 
                              borderRadius: "30px", 
                              fontSize: "0.68rem", 
                              fontWeight: "700", 
                              cursor: answerText.trim() ? "pointer" : "not-allowed", 
                              opacity: answerText.trim() ? 1 : 0.5,
                              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
                              transition: "opacity 0.2s" 
                            }}
                          >
                            Submit Reply
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setAnsweringQuestionId(null)}
                            style={{ 
                              padding: "6px 14px", 
                              backgroundColor: "rgba(150, 150, 150, 0.06)", 
                              border: "1px solid rgba(150, 150, 150, 0.12)", 
                              borderRadius: "30px", 
                              color: "var(--text-secondary)", 
                              fontSize: "0.68rem", 
                              fontWeight: "700", 
                              cursor: "pointer" 
                            }}
                          >
                            Cancel
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              ) : (
                <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-secondary)", border: "1px dashed rgba(150,150,150,0.15)", borderRadius: "20px" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: "700", color: "var(--text-primary)" }}>Your inbox is empty.</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.68rem", color: "var(--text-secondary)" }}>Anonymous questions will show up here.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
 
        {activeTab === "calendar" && (
          <motion.div key="calendar" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: "700", margin: 0, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Manage Schedule</h2>
              <button style={{ padding: "6px 12px", backgroundColor: "var(--text-primary)", color: "var(--bg-color)", borderRadius: "30px", border: "none", fontSize: "0.7rem", fontWeight: "750", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add
              </button>
            </div>
            
            <div style={{ backgroundColor: "rgba(150,150,150,0.02)", border: "1px solid rgba(150,150,150,0.1)", borderRadius: "20px", overflow: "hidden" }}>
              {/* Ivan's Birthday Event */}
              <div style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid rgba(150,150,150,0.08)" }}>
                <div style={{ width: "32px", height: "32px", backgroundColor: "rgba(230,183,65,0.12)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem", marginRight: "0.75rem" }}>
                  🎂
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 0.1rem 0", fontSize: "0.78rem", fontWeight: "700", color: "var(--text-primary)" }}>Ivan's Birthday</h3>
                  <p style={{ margin: 0, fontSize: "0.65rem", color: "var(--text-secondary)" }}>Active every August 3rd.</p>
                </div>
                <div style={{ fontSize: "0.58rem", fontWeight: "750", backgroundColor: "rgba(150,150,150,0.06)", padding: "3px 8px", borderRadius: "6px", color: "var(--text-secondary)", letterSpacing: "0.03em" }}>
                  LOCKED
                </div>
              </div>
              
              <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-secondary)" }}>
                <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: "600", color: "var(--text-primary)" }}>No other schedules yet.</p>
              </div>
            </div>
          </motion.div>
        )}
 
        {activeTab === "comments" && (
          <motion.div key="comments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: "700", margin: 0, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Comment Moderation</h2>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {adminComments.length > 0 ? (
                adminComments.map(comment => (
                  <div 
                     key={comment.id} 
                     style={{ 
                       padding: "14px 16px", 
                       backgroundColor: "rgba(255, 255, 255, 0.45)", 
                       backdropFilter: "blur(12px)", 
                       WebkitBackdropFilter: "blur(12px)",
                       border: "1px solid rgba(150, 150, 150, 0.12)", 
                       borderRadius: "20px", 
                       display: "flex", 
                       justifyContent: "space-between", 
                       gap: "12px", 
                       alignItems: "flex-start",
                       boxShadow: "0 8px 30px rgba(0, 0, 0, 0.015)"
                     }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: "750", color: "var(--text-primary)" }}>{comment.author.displayName}</span>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", opacity: 0.7 }}>{comment.author.email}</span>
                        <span style={{ fontSize: "0.62rem", color: "#B47A3E", fontWeight: "650", fontFamily: "monospace" }}>{new Date(comment.published).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", opacity: 0.5 }}>•</span>
                        <a 
                          href={`/blog/${comment.postId}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          style={{ 
                            fontSize: "0.65rem", 
                            color: "var(--text-secondary)", 
                            textDecoration: "underline",
                            textUnderlineOffset: "2px",
                            transition: "color 0.2s" 
                          }}
                          onMouseOver={(e) => e.currentTarget.style.color = "var(--text-primary)"}
                          onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
                        >
                          on post: {comment.postId.length > 10 ? `${comment.postId.substring(0, 10)}...` : comment.postId}
                        </a>
                        {!comment.approved && (
                          <span style={{ fontSize: "0.55rem", fontWeight: "750", backgroundColor: "rgba(180, 122, 62, 0.08)", color: "#B47A3E", padding: "2px 6px", borderRadius: "6px", letterSpacing: "0.03em" }}>PENDING</span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.45" }}>{comment.content}</p>
                    </div>
                    
                    <div style={{ display: "flex", gap: "6px" }}>
                      {!comment.approved && (
                        <button 
                          onClick={() => handleApproveComment(comment.id)} 
                          style={{ padding: "6px 12px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "none", borderRadius: "20px", color: "#10b981", fontSize: "0.65rem", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.15)"}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.1)"}
                        >
                          Approve
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteComment(comment.id)} 
                        style={{ padding: "6px 12px", backgroundColor: "rgba(239, 68, 68, 0.1)", border: "none", borderRadius: "20px", color: "#ef4444", fontSize: "0.65rem", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.15)"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)"}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-secondary)", border: "1px dashed rgba(150,150,150,0.15)", borderRadius: "20px" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: "700", color: "var(--text-primary)" }}>No comments submitted yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
 
        {activeTab === "moments" && (
          <motion.div key="moments" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h2 style={{ fontSize: "0.85rem", fontWeight: "700", margin: 0, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Manage Moments Gallery</h2>
            </div>
            
            {/* Elegant Form */}
            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.4)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(150,150,150,0.15)", borderRadius: "20px", padding: "20px", marginBottom: "24px" }}>
              <form onSubmit={handleUploadMoment} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label htmlFor="momentFileInput" style={{ fontSize: "0.62rem", fontWeight: "750", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Upload Photo</label>
                  <input id="momentFileInput" type="file" accept="image/*" onChange={(e) => setMomentFile(e.target.files?.[0] || null)} style={{ fontSize: "0.75rem", color: "var(--text-primary)" }} required />
                </div>
                
                <div className="moments-form-row">
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.62rem", fontWeight: "750", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Title</label>
                    <input className="admin-form-input" type="text" placeholder="Title (Optional)" value={momentTitle} onChange={(e) => setMomentTitle(e.target.value)} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.62rem", fontWeight: "750", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Location</label>
                    <input className="admin-form-input" type="text" placeholder="e.g., Tokyo, Japan" value={momentLocation} onChange={(e) => setMomentLocation(e.target.value)} required />
                  </div>
                </div>
                
                <div className="moments-form-row">
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.62rem", fontWeight: "750", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Date</label>
                    <input className="admin-form-input" type="text" placeholder="e.g., Aug 2023" value={momentDate} onChange={(e) => setMomentDate(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.62rem", fontWeight: "750", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Story or description</label>
                  <textarea className="admin-form-input" placeholder="Write the story behind this moment..." value={momentStory} onChange={(e) => setMomentStory(e.target.value)} style={{ minHeight: "80px", resize: "none" }} />
                </div>
                
                <button type="submit" disabled={isUploadingMoment || !momentFile || !momentLocation || !momentDate} style={{ padding: "12px", backgroundColor: "var(--text-primary)", color: "var(--bg-color)", border: "none", borderRadius: "30px", fontSize: "0.75rem", fontWeight: "750", cursor: (isUploadingMoment || !momentFile || !momentLocation || !momentDate) ? "not-allowed" : "pointer", opacity: (isUploadingMoment || !momentFile || !momentLocation || !momentDate) ? 0.5 : 1, transition: "opacity 0.2s" }}>
                  {isUploadingMoment ? "Uploading to Cloud..." : "Publish Moment"}
                </button>
              </form>
            </div>
 
            {/* List of Moments */}
            <div className="moments-grid-container">
              {adminMoments.map(moment => (
                <div key={moment.id} style={{ display: "flex", gap: "10px", padding: "12px", backgroundColor: "rgba(255, 255, 255, 0.4)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(150,150,150,0.12)", borderRadius: "20px", alignItems: "center", boxShadow: "0 8px 30px rgba(0, 0, 0, 0.015)" }}>
                  <img src={moment.url} alt="thumbnail" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "12px" }} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-primary)" }}>📍 {moment.location}</span>
                    <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", fontWeight: "500" }}>{moment.date}</span>
                  </div>
                  
                  {/* Home Slot Selector Pill */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginRight: "10px" }}>
                    <span style={{ fontSize: "0.58rem", fontWeight: "750", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>Home Slot</span>
                    <select 
                      value={moment.homepageOrder !== undefined ? String(moment.homepageOrder) : "none"}
                      onChange={(e) => handleSetHomepageSlot(moment.id, e.target.value)}
                      style={{ 
                        padding: "4px 8px", 
                        borderRadius: "8px", 
                        border: "1px solid rgba(150,150,150,0.25)", 
                        backgroundColor: moment.homepageOrder !== undefined ? "var(--text-primary)" : "rgba(150,150,150,0.04)", 
                        color: moment.homepageOrder !== undefined ? "var(--bg-color)" : "var(--text-primary)", 
                        fontSize: "0.68rem", 
                        fontWeight: "750",
                        outline: "none",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                    >
                      <option value="none">None</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <option key={num} value={String(num)}>Slot {num}</option>
                      ))}
                    </select>
                  </div>
 
                  <button onClick={() => handleDeleteMoment(moment.id, moment.storagePath)} style={{ padding: "8px", backgroundColor: "rgba(239,68,68,0.1)", border: "none", borderRadius: "50%", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "28px", height: "28px", transition: "all 0.2s" }} title="Delete Photo">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                  </button>
                </div>
              ))}
              {adminMoments.length === 0 && (
                <div style={{ gridColumn: "1 / -1", padding: "2rem", textAlign: "center", color: "var(--text-secondary)", border: "1px dashed rgba(150,150,150,0.15)", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "600" }}>
                  No moments published yet.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Confirmation Modal Overlay */}
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
                backdropFilter: "blur(8px)"
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "340px",
                backgroundColor: "var(--bg-color)",
                border: "1px solid rgba(150, 150, 150, 0.15)",
                borderRadius: "22px",
                padding: "1.5rem",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "1rem"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <h3 style={{ fontSize: "1.02rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
                  {confirmModal.title}
                </h3>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.45", margin: 0, fontWeight: "500" }}>
                  {confirmModal.message}
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "30px",
                    border: "1px solid rgba(150, 150, 150, 0.2)",
                    backgroundColor: "rgba(150, 150, 150, 0.04)",
                    color: "var(--text-primary)",
                    fontSize: "0.82rem",
                    fontWeight: "700",
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
                    fontWeight: "700",
                    cursor: "pointer",
                    outline: "none",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.2)",
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
