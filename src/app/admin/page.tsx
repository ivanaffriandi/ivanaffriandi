"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAllCommentsForAdmin, approveComment, deleteComment, replyComment, CommentItem } from "@/lib/comments";
import { getAllQuestionsForAdmin, answerQuestion, deleteQuestion, QuestionItem } from "@/lib/questions";
import { getAllMoments, addMoment, deleteMoment, updateMoment, uploadMomentPhoto, MomentItem } from "@/lib/moments";
import { getAllCalendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent, CalendarEvent } from "@/lib/calendar";

const iosSpring = { type: "spring" as const, stiffness: 420, damping: 32 };
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.03
    }
  }
};
const fadeRise = {
  initial: { opacity: 0, y: 8, filter: "blur(3px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 380, damping: 30 } }
};

const iosFontStack = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

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
  const [adminCalendarEvents, setAdminCalendarEvents] = useState<CalendarEvent[]>([]);

  // Comment Reply States
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [commentReplyText, setCommentReplyText] = useState("");

  // Calendar Form States
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState("08");
  const [calendarDay, setCalendarDay] = useState("03");
  const [calendarName, setCalendarName] = useState("");
  const [calendarEmoji, setCalendarEmoji] = useState("🎂");
  const [calendarType, setCalendarType] = useState<CalendarEvent["type"]>("ivan");
  const [isSubmittingCalendar, setIsSubmittingCalendar] = useState(false);
  
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

  // Fetch calendar events
  useEffect(() => {
    if (isAuthenticated && activeTab === "calendar") {
      const loadEvents = async () => {
        try {
          const list = await getAllCalendarEvents();
          const sorted = list.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
          setAdminCalendarEvents(sorted);
        } catch (err) {
          console.error("Failed to load calendar events:", err);
        }
      };
      loadEvents();
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
    return () => URL.revokeObjectURL(objectUrl);
  }, [momentFile]);

  // Comment Reply Handlers
  const handleReplyComment = async (id: string) => {
    if (!commentReplyText.trim()) return;
    const success = await replyComment(id, commentReplyText.trim());
    if (success) {
      setAdminComments(prev => prev.map(c => c.id === id ? { ...c, reply: commentReplyText.trim() } : c));
      setReplyingCommentId(null);
      setCommentReplyText("");
    }
  };

  // Calendar Event Handlers
  const handleSaveCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calendarName.trim() || !calendarEmoji.trim()) return;

    const dateKey = `${calendarMonth.padStart(2, '0')}-${calendarDay.padStart(2, '0')}`;
    const eventPayload: Omit<CalendarEvent, "id"> = {
      dateKey,
      name: calendarName.trim(),
      emoji: calendarEmoji.trim(),
      type: calendarType
    };

    setIsSubmittingCalendar(true);
    try {
      if (editingEventId) {
        // Edit Mode
        const success = await updateCalendarEvent(editingEventId, eventPayload);
        if (success) {
          setAdminCalendarEvents(prev => prev.map(ev => ev.id === editingEventId ? { ...ev, ...eventPayload } : ev).sort((a, b) => a.dateKey.localeCompare(b.dateKey)));
          setEditingEventId(null);
          setCalendarName("");
        }
      } else {
        // Add Mode
        const newEvent = await addCalendarEvent(eventPayload);
        setAdminCalendarEvents(prev => [...prev, newEvent].sort((a, b) => a.dateKey.localeCompare(b.dateKey)));
        setCalendarName("");
      }
    } catch (err) {
      console.error("Failed to save calendar event:", err);
      alert("Failed to save calendar event.");
    } finally {
      setIsSubmittingCalendar(false);
    }
  };

  const handleDeleteCalendarEvent = async (id: string) => {
    triggerConfirm(
      "Delete Event",
      "Are you sure you want to permanently delete this calendar event? The theme animation for this day will be disabled.",
      async () => {
        const success = await deleteCalendarEvent(id);
        if (success) {
          setAdminCalendarEvents(prev => prev.filter(ev => ev.id !== id));
        }
      }
    );
  };

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
        setLoginError("Access denied. Incorrect passcode.");
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
      "Are you sure you want to permanently delete this photo from your moments gallery?",
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
        <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid rgba(150,150,150,0.15)", borderTopColor: "var(--text-primary)", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // --- COMPACT BRUTALIST LOGIN ---
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem", backgroundColor: "var(--bg-color)", position: "relative" }}>
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle at 25px 25px, rgba(150, 150, 150, 0.05) 1.5%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(150, 150, 150, 0.05) 1.5%, transparent 0%)",
          backgroundSize: "100px 100px",
          zIndex: 0
        }} />

        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={iosSpring}
          style={{
            maxWidth: "300px",
            width: "100%",
            padding: "1.5rem",
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(150, 150, 150, 0.12)",
            borderRadius: "20px",
            textAlign: "center",
            boxShadow: "0 12px 30px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255,255,255,0.7)",
            zIndex: 1,
            fontFamily: iosFontStack
          }}
        >
          <div style={{ display: "inline-flex", padding: "10px", borderRadius: "12px", backgroundColor: "rgba(150, 150, 150, 0.05)", border: "1px solid rgba(150,150,150,0.08)", marginBottom: "1rem" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <h1 style={{ fontFamily: iosFontStack, fontSize: "1.1rem", fontWeight: "800", margin: "0 0 0.2rem 0", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
            Studio Vault
          </h1>
          <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", marginBottom: "1.2rem", fontWeight: "500", lineHeight: "1.35" }}>
            Authenticate to manage calendar, moments, comments, and replies.
          </p>
          
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <input 
              type="password" 
              placeholder="Enter passcode..." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "10px",
                border: "1px solid rgba(150, 150, 150, 0.15)",
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                color: "var(--text-primary)",
                fontFamily: iosFontStack,
                fontSize: "0.8rem",
                fontWeight: "550",
                outline: "none",
                textAlign: "center",
                transition: "all 0.2s ease"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--text-primary)";
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(150, 150, 150, 0.15)";
                e.target.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
              }}
              autoFocus
            />
            {loginError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: "0.68rem", color: "#ef4444", fontWeight: "600", margin: "1px 0", fontFamily: iosFontStack }}>
                ⚠️ {loginError}
              </motion.div>
            )}
            <motion.button 
              type="submit"
              disabled={!password.trim()}
              whileHover={password.trim() ? { scale: 1.01 } : {}}
              whileTap={password.trim() ? { scale: 0.99 } : {}}
              style={{
                width: "100%",
                padding: "9px",
                marginTop: "4px",
                backgroundColor: "var(--text-primary)",
                color: "var(--bg-color)",
                border: "none",
                borderRadius: "10px",
                fontFamily: iosFontStack,
                fontSize: "0.78rem",
                fontWeight: "750",
                cursor: password.trim() ? "pointer" : "not-allowed",
                opacity: password.trim() ? 1 : 0.45,
                transition: "all 0.15s ease"
              }}
            >
              Verify
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  // --- DASHBOARD VIEW (MAX-WIDTH: 420PX STICKY APP PORTRAIT) ---
  return (
    <div className="admin-panel-container" style={{ minHeight: "100vh", padding: "1.5rem 1rem 7rem 1rem", maxWidth: "420px", margin: "0 auto", fontFamily: iosFontStack, backgroundColor: "var(--bg-color)", position: "relative" }}>
      <style>{`
        /* Tab Button */
        .admin-tab-btn {
          position: relative;
          flex: 1;
          text-align: center;
          padding: 6px 4px; 
          border-radius: 16px; 
          font-size: 0.65rem; 
          font-weight: 750; 
          cursor: pointer; 
          border: none;
          background: transparent;
          letter-spacing: 0.04em;
          transition: color 0.15s ease;
          font-family: ${iosFontStack};
        }

        /* Form Inputs */
        .admin-form-input {
          padding: 8px 12px;
          border-radius: 10px;
          border: 1px solid rgba(150, 150, 150, 0.12);
          background-color: rgba(255, 255, 255, 0.35);
          color: var(--text-primary);
          font-size: 0.78rem;
          font-weight: 550;
          font-family: ${iosFontStack};
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
        }

        .admin-form-input:focus {
          border-color: var(--text-primary);
          background-color: rgba(255, 255, 255, 0.95);
        }

        .custom-select {
          appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><polyline points='6 9 12 15 18 9'></polyline></svg>");
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 9px;
          padding-right: 22px !important;
        }
      `}</style>

      {/* Cozy Header */}
      <motion.header 
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={iosSpring}
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "1.2rem", 
          padding: "8px 12px", 
          backgroundColor: "rgba(255, 255, 255, 0.4)", 
          border: "1px solid rgba(150, 150, 150, 0.1)", 
          borderRadius: "16px", 
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.01), inset 0 1px 0 rgba(255,255,255,0.7)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "1rem" }}>🎛️</span>
          <h1 style={{ fontSize: "0.85rem", fontWeight: "800", margin: 0, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Control Panel</h1>
        </div>
        <button 
          onClick={handleLogout} 
          style={{ 
            padding: "4px 10px", 
            backgroundColor: "rgba(239, 68, 68, 0.06)", 
            border: "1px solid rgba(239, 68, 68, 0.1)", 
            borderRadius: "30px", 
            color: "#ef4444", 
            fontSize: "0.62rem", 
            fontWeight: "750", 
            cursor: "pointer", 
            transition: "all 0.2s ease",
            letterSpacing: "0.02em",
            fontFamily: iosFontStack
          }} 
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#ef4444"; e.currentTarget.style.color = "#ffffff"; }} 
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.06)"; e.currentTarget.style.color = "#ef4444"; }}
        >
          Logout
        </button>
      </motion.header>

      {/* Segmented iOS Tabs Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...iosSpring, delay: 0.03 }}
        style={{ 
          display: "flex", 
          gap: "2px", 
          padding: "3px", 
          backgroundColor: "rgba(150, 150, 150, 0.04)", 
          border: "1px solid rgba(150, 150, 150, 0.06)", 
          borderRadius: "20px", 
          marginBottom: "1.2rem",
          position: "relative"
        }}
      >
        {(["inbox", "calendar", "comments", "moments"] as const).map(tab => {
          const tabLabels = { inbox: "Inbox", calendar: "Calendar", comments: "Comments", moments: "Moments" };
          return (
            <button 
              key={tab} 
              className="admin-tab-btn"
              onClick={() => setActiveTab(tab)} 
              style={{ 
                color: activeTab === tab ? "var(--bg-color)" : "var(--text-secondary)",
                zIndex: 1
              }}
            >
              <span style={{ position: "relative", zIndex: 2 }}>{tabLabels[tab]}</span>
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTabHighlight"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "var(--text-primary)",
                    borderRadius: "16px",
                    zIndex: 1
                  }}
                />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Content Panels */}
      <AnimatePresence mode="wait">
        
        {/* --- INBOX TAB --- */}
        {activeTab === "inbox" && (
          <motion.div key="inbox" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "8px" }}>
              <h2 style={{ fontSize: "0.78rem", fontWeight: "800", margin: 0, color: "var(--text-primary)", letterSpacing: "0.04em" }}>Anonymous Q&A</h2>
              
              <div style={{ display: "flex", gap: "2px", backgroundColor: "rgba(150,150,150,0.05)", border: "1px solid rgba(150,150,150,0.06)", padding: "2px", borderRadius: "10px" }}>
                {(["pending", "answered", "all"] as const).map(filter => {
                  const filterLabels = { pending: "Pending", answered: "Answered", all: "All" };
                  return (
                    <button
                      key={filter}
                      onClick={() => setInboxFilter(filter)}
                      style={{
                        padding: "3px 8px",
                        fontSize: "0.58rem",
                        fontWeight: "750",
                        borderRadius: "7px",
                        border: "none",
                        cursor: "pointer",
                        letterSpacing: "0.01em",
                        backgroundColor: inboxFilter === filter ? "var(--text-primary)" : "transparent",
                        color: inboxFilter === filter ? "var(--bg-color)" : "var(--text-secondary)",
                        transition: "all 0.15s ease",
                        fontFamily: iosFontStack
                      }}
                    >
                      {filterLabels[filter]}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <motion.div 
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              style={{ display: "flex", flexDirection: "column", gap: "10px" }}
            >
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map(q => (
                  <motion.div 
                    key={q.id} 
                    variants={fadeRise}
                    layoutId={`qcard-${q.id}`}
                    style={{ 
                      padding: "12px 14px", 
                      backgroundColor: "rgba(255, 255, 255, 0.4)", 
                      backdropFilter: "blur(12px)", 
                      WebkitBackdropFilter: "blur(12px)",
                      border: "1px solid rgba(150, 150, 150, 0.1)", 
                      borderRadius: "16px",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.01), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
                      position: "relative"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "0.58rem", color: "#B47A3E", fontWeight: "700" }}>
                          {new Date(q.published).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span style={{ 
                          fontSize: "0.5rem", 
                          fontWeight: "800", 
                          backgroundColor: q.answered ? "rgba(16,185,129,0.06)" : "rgba(180,122,62,0.06)", 
                          color: q.answered ? "#10b981" : "#B47A3E", 
                          border: q.answered ? "1px solid rgba(16,185,129,0.1)" : "1px solid rgba(180,122,62,0.1)",
                          padding: "1px 6px", 
                          borderRadius: "6px", 
                          letterSpacing: "0.03em" 
                        }}>
                          {q.answered ? "Answered" : "New"}
                        </span>
                      </div>
                      
                      <motion.button 
                        whileHover={{ scale: 1.1, color: "#ef4444" }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteQuestion(q.id)} 
                        style={{ 
                          width: "22px",
                          height: "22px",
                          backgroundColor: "transparent", 
                          border: "none", 
                          borderRadius: "50%",
                          color: "var(--text-secondary)", 
                          cursor: "pointer", 
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "color 0.2s" 
                        }}
                        title="Delete Question"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </motion.button>
                    </div>
 
                    <p style={{ margin: "0 0 8px 0", fontSize: "0.82rem", color: "var(--text-primary)", lineHeight: "1.4", fontWeight: "600", letterSpacing: "-0.01em" }}>
                      "{q.content}"
                    </p>
 
                    {q.answered && q.answer && (
                      <div style={{ 
                        padding: "10px 12px", 
                        backgroundColor: "rgba(0, 0, 0, 0.02)", 
                        borderRadius: "12px", 
                        border: "1px solid rgba(150, 150, 150, 0.06)", 
                        marginTop: "8px",
                        boxShadow: "inset 0 1px 2px rgba(0,0,0,0.01)"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                          <span style={{ 
                            fontSize: "0.55rem", 
                            fontWeight: "800", 
                            color: "#10b981", 
                            letterSpacing: "0.03em"
                          }}>
                            Reply from Ivan
                          </span>
                        </div>
                        <p style={{ margin: "0 0 8px 0", fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.4", fontWeight: "500" }}>{q.answer}</p>
                        
                        {answeringQuestionId !== q.id && (
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setAnsweringQuestionId(q.id);
                              setAnswerText(q.answer || "");
                            }}
                            style={{ 
                              padding: "4px 8px", 
                              backgroundColor: "transparent", 
                              border: "1px solid rgba(150,150,150,0.15)", 
                              borderRadius: "14px", 
                              color: "var(--text-primary)", 
                              fontSize: "0.62rem", 
                              fontWeight: "750", 
                              cursor: "pointer",
                              letterSpacing: "0.01em",
                              fontFamily: iosFontStack
                            }}
                          >
                            Edit Reply
                          </motion.button>
                        )}
                      </div>
                    )}
 
                    {!q.answered && answeringQuestionId !== q.id && (
                      <motion.button 
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(150,150,150,0.05)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setAnsweringQuestionId(q.id);
                          setAnswerText("");
                        }}
                        style={{ 
                          padding: "5px 12px", 
                          marginTop: "2px", 
                          backgroundColor: "rgba(150,150,150,0.04)", 
                          border: "1px solid rgba(150,150,150,0.08)", 
                          borderRadius: "20px", 
                          color: "var(--text-primary)", 
                          fontSize: "0.65rem", 
                          fontWeight: "750", 
                          cursor: "pointer",
                          fontFamily: iosFontStack
                        }}
                      >
                        Reply anonymously
                      </motion.button>
                    )}
 
                    {answeringQuestionId === q.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px", overflow: "hidden" }}
                      >
                        <div style={{
                          backgroundColor: "rgba(0, 0, 0, 0.03)",
                          borderRadius: "12px",
                          padding: "8px 12px",
                          border: "1px solid rgba(150,150,150,0.08)",
                          boxShadow: "inset 0 1.5px 3px rgba(0,0,0,0.04)"
                        }}>
                          <textarea
                            placeholder="Type your response to publish..."
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            style={{
                              width: "100%",
                              minHeight: "75px",
                              border: "none",
                              backgroundColor: "transparent",
                              color: "var(--text-primary)",
                              fontFamily: iosFontStack,
                              fontSize: "0.78rem",
                              lineHeight: "1.45",
                              outline: "none",
                              resize: "none",
                              fontWeight: "550"
                            }}
                          />
                        </div>
                        <div style={{ display: "flex", gap: "4px", marginTop: "2px" }}>
                          <motion.button 
                            whileHover={answerText.trim() ? { scale: 1.02 } : {}}
                            whileTap={answerText.trim() ? { scale: 0.98 } : {}}
                            onClick={() => handleAnswerQuestion(q.id)}
                            disabled={!answerText.trim()}
                            style={{ 
                              padding: "5px 12px", 
                              backgroundColor: "var(--text-primary)", 
                              color: "var(--bg-color)", 
                              border: "none", 
                              borderRadius: "20px", 
                              fontSize: "0.65rem", 
                              fontWeight: "750", 
                              cursor: answerText.trim() ? "pointer" : "not-allowed", 
                              opacity: answerText.trim() ? 1 : 0.4,
                              transition: "opacity 0.2s",
                              fontFamily: iosFontStack
                            }}
                          >
                            Publish Reply
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setAnsweringQuestionId(null)}
                            style={{ 
                              padding: "5px 12px", 
                              backgroundColor: "rgba(150, 150, 150, 0.05)", 
                              border: "1px solid rgba(150, 150, 150, 0.1)", 
                              borderRadius: "20px", 
                              color: "var(--text-secondary)", 
                              fontSize: "0.65rem", 
                              fontWeight: "750", 
                              cursor: "pointer",
                              fontFamily: iosFontStack
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
                <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-secondary)", border: "1px dashed rgba(150,150,150,0.12)", borderRadius: "16px" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: "750", color: "var(--text-primary)" }}>Empty Inbox</p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.68rem", color: "var(--text-secondary)" }}>
                    {inboxFilter === "pending" ? "All questions have been answered!" : "No items found in this inbox queue."}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
 
        {/* --- CALENDAR TAB --- */}
        {activeTab === "calendar" && (
          <motion.div key="calendar" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "0.78rem", fontWeight: "800", margin: 0, color: "var(--text-primary)", letterSpacing: "0.04em" }}>Schedule Manager</h2>
            </div>
            
            {/* Dynamic Calendar Form */}
            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.4)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(150, 150, 150, 0.1)", borderRadius: "16px", padding: "14px", marginBottom: "1.2rem", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.01), inset 0 1px 0 rgba(255,255,255,0.7)" }}>
              <h3 style={{ fontSize: "0.72rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "0.02em", margin: "0 0 8px 0" }}>
                {editingEventId ? `Edit Event: ${calendarName}` : "Add New Calendar Event"}
              </h3>
              
              <form onSubmit={handleSaveCalendarEvent} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.58rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Month</label>
                    <select 
                      value={calendarMonth} 
                      onChange={(e) => setCalendarMonth(e.target.value)}
                      className="admin-form-input custom-select"
                      style={{ padding: "8px 24px 8px 12px" }}
                    >
                      {Array.from({ length: 12 }).map((_, i) => {
                        const mVal = String(i + 1).padStart(2, '0');
                        const mLabel = new Date(2026, i, 1).toLocaleDateString("en-US", { month: "long" });
                        return <option key={mVal} value={mVal}>{mLabel}</option>;
                      })}
                    </select>
                  </div>
                  
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.58rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Day</label>
                    <select 
                      value={calendarDay} 
                      onChange={(e) => setCalendarDay(e.target.value)}
                      className="admin-form-input custom-select"
                      style={{ padding: "8px 24px 8px 12px" }}
                    >
                      {Array.from({ length: 31 }).map((_, i) => {
                        const dVal = String(i + 1).padStart(2, '0');
                        return <option key={dVal} value={dVal}>{i + 1}</option>;
                      })}
                    </select>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.58rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Event Title</label>
                  <input 
                    className="admin-form-input" 
                    type="text" 
                    placeholder="e.g. Vera's Birthday or Christmas Day" 
                    value={calendarName} 
                    onChange={(e) => setCalendarName(e.target.value)} 
                    required 
                  />
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.58rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Theme Style</label>
                    <select 
                      value={calendarType} 
                      onChange={(e) => setCalendarType(e.target.value as any)}
                      className="admin-form-input custom-select"
                      style={{ padding: "8px 24px 8px 12px" }}
                    >
                      <option value="ivan">👑 Ivan's Birthday</option>
                      <option value="female">🌸 Pink (Female Birthday)</option>
                      <option value="male">🔹 Blue (Male Birthday)</option>
                      <option value="both">🟣 Purple (Joint Birthday)</option>
                      <option value="idul_fitri">🌙 Emerald (Idul Fitri)</option>
                      <option value="idul_adha">🐏 Emerald (Idul Adha)</option>
                      <option value="christmas">🎄 Festive Red (Christmas)</option>
                      <option value="chinese_new_year">🏮 Crimson (Lunar New Year)</option>
                      <option value="nyepi">🌌 Indigo (Nyepi Day)</option>
                      <option value="waisak">🪷 Saffron (Waisak Day)</option>
                      <option value="general_holiday">🔸 Warm Orange (General)</option>
                    </select>
                  </div>
                  
                  <div style={{ width: "90px", display: "flex", flexDirection: "column", gap: "4px" }}>
                    <label style={{ fontSize: "0.58rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Emoji</label>
                    <input 
                      className="admin-form-input" 
                      type="text" 
                      value={calendarEmoji} 
                      onChange={(e) => setCalendarEmoji(e.target.value)} 
                      style={{ textAlign: "center" }}
                      required 
                    />
                  </div>
                </div>

                {/* Quick Emoji Suggestion Chips */}
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", margin: "2px 0" }}>
                  {["🎂", "👑", "🎄", "🌙", "🏮", "🧘", "🎉", "🇮🇩", "🪷", "🌸", "💙", "💖"].map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setCalendarEmoji(emoji)}
                      style={{
                        padding: "4px 8px",
                        fontSize: "0.65rem",
                        backgroundColor: calendarEmoji === emoji ? "rgba(150,150,150,0.12)" : "rgba(150,150,150,0.03)",
                        border: calendarEmoji === emoji ? "1px solid rgba(150,150,150,0.22)" : "1px solid rgba(150,150,150,0.06)",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontFamily: iosFontStack,
                        transition: "all 0.15s ease"
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", gap: "6px", marginTop: "2px" }}>
                  <motion.button 
                    type="submit" 
                    disabled={isSubmittingCalendar || !calendarName.trim()} 
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    style={{ 
                      flex: 1,
                      padding: "9px", 
                      backgroundColor: "var(--text-primary)", 
                      color: "var(--bg-color)", 
                      border: "none", 
                      borderRadius: "30px", 
                      fontSize: "0.74rem", 
                      fontWeight: "800", 
                      cursor: "pointer",
                      fontFamily: iosFontStack
                    }}
                  >
                    {isSubmittingCalendar ? "Saving..." : (editingEventId ? "Save Updates" : "Add Event")}
                  </motion.button>

                  {editingEventId && (
                    <motion.button 
                      type="button" 
                      onClick={() => {
                        setEditingEventId(null);
                        setCalendarName("");
                        setCalendarEmoji("🎂");
                        setCalendarType("ivan");
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      style={{ 
                        padding: "9px 16px", 
                        backgroundColor: "rgba(150,150,150,0.05)", 
                        border: "1px solid rgba(150,150,150,0.1)", 
                        borderRadius: "30px", 
                        color: "var(--text-secondary)",
                        fontSize: "0.74rem", 
                        fontWeight: "750", 
                        cursor: "pointer",
                        fontFamily: iosFontStack
                      }}
                    >
                      Cancel
                    </motion.button>
                  )}
                </div>
              </form>
            </div>

            {/* List of dynamic calendar events */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {adminCalendarEvents.length > 0 ? (
                adminCalendarEvents.map(event => {
                  const monthName = new Date(2026, parseInt(event.dateKey.split("-")[0]) - 1, 1).toLocaleDateString("en-US", { month: "short" });
                  const dayNum = parseInt(event.dateKey.split("-")[1]);
                  
                  // Color bubble selector
                  const bubbleBg = event.type === "female" ? "rgba(255,92,157,0.08)" : (event.type === "ivan" ? "rgba(0,122,255,0.08)" : (event.type === "both" ? "rgba(168,85,247,0.08)" : "rgba(180,122,62,0.08)"));
                  const bubbleBorder = event.type === "female" ? "rgba(255,92,157,0.15)" : (event.type === "ivan" ? "rgba(0,122,255,0.15)" : (event.type === "both" ? "rgba(168,85,247,0.15)" : "rgba(180,122,62,0.15)"));

                  return (
                    <motion.div 
                      key={event.id}
                      layoutId={`evcard-${event.id}`}
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        padding: "10px 12px", 
                        backgroundColor: "rgba(255, 255, 255, 0.4)", 
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: "1px solid rgba(150, 150, 150, 0.1)", 
                        borderRadius: "16px",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.01), inset 0 1px 0 rgba(255,255,255,0.7)"
                      }}
                    >
                      <div style={{ 
                        width: "32px", 
                        height: "32px", 
                        backgroundColor: bubbleBg, 
                        border: `1px solid ${bubbleBorder}`, 
                        borderRadius: "10px", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        fontSize: "1rem", 
                        marginRight: "0.65rem",
                        flexShrink: 0
                      }}>
                        {event.emoji}
                      </div>
                      
                      <div style={{ flex: 1, minWidth: "0" }}>
                        <h3 style={{ margin: "0", fontSize: "0.78rem", fontWeight: "750", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {event.name}
                        </h3>
                        <p style={{ margin: 0, fontSize: "0.62rem", color: "var(--text-secondary)", fontWeight: "500" }}>
                          Active every {monthName} {dayNum}.
                        </p>
                      </div>

                      <div style={{ display: "flex", gap: "4px", alignItems: "center", flexShrink: 0, marginLeft: "4px" }}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setEditingEventId(event.id);
                            const parts = event.dateKey.split("-");
                            setCalendarMonth(parts[0]);
                            setCalendarDay(parts[1]);
                            setCalendarName(event.name);
                            setCalendarEmoji(event.emoji);
                            setCalendarType(event.type);
                          }}
                          style={{
                            width: "24px",
                            height: "24px",
                            backgroundColor: "rgba(150,150,150,0.03)",
                            border: "1px solid rgba(150,150,150,0.08)",
                            borderRadius: "50%",
                            color: "var(--text-primary)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                          title="Edit Event"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05, color: "#ef4444" }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteCalendarEvent(event.id)}
                          style={{
                            width: "24px",
                            height: "24px",
                            backgroundColor: "rgba(239,68,68,0.03)",
                            border: "none",
                            borderRadius: "50%",
                            color: "#ef4444",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}
                          title="Delete Event"
                        >
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-secondary)", border: "1px dashed rgba(150,150,150,0.12)", borderRadius: "16px" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: "750", color: "var(--text-primary)" }}>Empty Schedule</p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.68rem", color: "var(--text-secondary)" }}>Add custom dates and themes above.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
 
        {/* --- COMMENTS TAB --- */}
        {activeTab === "comments" && (
          <motion.div key="comments" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "0.78rem", fontWeight: "800", margin: 0, color: "var(--text-primary)", letterSpacing: "0.04em" }}>Comments Moderation</h2>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {adminComments.length > 0 ? (
                adminComments.map(comment => (
                  <motion.div 
                     key={comment.id} 
                     layoutId={`ccard-${comment.id}`}
                     style={{ 
                       padding: "12px 14px", 
                       backgroundColor: "rgba(255, 255, 255, 0.4)", 
                       backdropFilter: "blur(20px)", 
                       WebkitBackdropFilter: "blur(20px)",
                       border: "1px solid rgba(150, 150, 150, 0.1)", 
                       borderRadius: "16px", 
                       display: "flex", 
                       flexDirection: "column",
                       gap: "8px", 
                       boxShadow: "0 4px 20px rgba(0, 0, 0, 0.01), inset 0 1px 0 rgba(255,255,255,0.6)"
                     }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", width: "100%" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.76rem", fontWeight: "800", color: "var(--text-primary)" }}>{comment.author.displayName}</span>
                          <span style={{ fontSize: "0.62rem", color: "var(--text-secondary)", fontWeight: "500" }}>({comment.author.email})</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                          <span style={{ fontSize: "0.58rem", color: "#B47A3E", fontWeight: "700" }}>
                            {new Date(comment.published).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                          <span style={{ fontSize: "0.58rem", color: "var(--text-secondary)" }}>•</span>
                          <a 
                            href={`/blog/${comment.postId}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ 
                              fontSize: "0.62rem", 
                              color: "var(--text-secondary)", 
                              textDecoration: "underline",
                              textUnderlineOffset: "2px",
                              fontWeight: "700"
                            }}
                          >
                            Post: {comment.postId.length > 10 ? `${comment.postId.substring(0, 10)}...` : comment.postId}
                          </a>
                        </div>
                      </div>

                      {!comment.approved ? (
                        <span style={{ fontSize: "0.5rem", fontWeight: "800", backgroundColor: "rgba(180, 122, 62, 0.06)", color: "#B47A3E", border: "1px solid rgba(180, 122, 62, 0.12)", padding: "1px 6px", borderRadius: "6px" }}>Pending</span>
                      ) : (
                        <span style={{ fontSize: "0.5rem", fontWeight: "800", backgroundColor: "rgba(16, 185, 129, 0.06)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.12)", padding: "1px 6px", borderRadius: "6px" }}>Approved</span>
                      )}
                    </div>

                    <div style={{ 
                      padding: "8px 10px", 
                      backgroundColor: "rgba(0, 0, 0, 0.015)", 
                      border: "1px solid rgba(150,150,150,0.05)", 
                      borderRadius: "10px"
                    }}>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-primary)", lineHeight: "1.4", fontWeight: "500" }}>{comment.content}</p>
                    </div>

                    {comment.reply && (
                      <div style={{ 
                        padding: "8px 10px", 
                        backgroundColor: "rgba(180, 122, 62, 0.04)", 
                        border: "1px solid rgba(180, 122, 62, 0.08)", 
                        borderRadius: "10px",
                        marginTop: "2px"
                      }}>
                        <span style={{ fontSize: "0.55rem", fontWeight: "800", color: "#B47A3E", letterSpacing: "0.03em", display: "block", marginBottom: "2px" }}>Reply from Ivan</span>
                        <p style={{ margin: 0, fontSize: "0.74rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>{comment.reply}</p>
                      </div>
                    )}
                    
                    <div style={{ display: "flex", gap: "4px", alignSelf: "flex-end", marginTop: "2px", width: "100%", justifyContent: "flex-end", flexWrap: "wrap" }}>
                      {comment.approved && !comment.reply && replyingCommentId !== comment.id && (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setReplyingCommentId(comment.id);
                            setCommentReplyText("");
                          }}
                          style={{ padding: "4px 10px", backgroundColor: "rgba(150, 150, 150, 0.05)", border: "1px solid rgba(150, 150, 150, 0.12)", borderRadius: "20px", color: "var(--text-primary)", fontSize: "0.62rem", fontWeight: "750", cursor: "pointer", transition: "all 0.15s ease", fontFamily: iosFontStack }}
                        >
                          Reply
                        </motion.button>
                      )}

                      {comment.approved && comment.reply && replyingCommentId !== comment.id && (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setReplyingCommentId(comment.id);
                            setCommentReplyText(comment.reply || "");
                          }}
                          style={{ padding: "4px 10px", backgroundColor: "rgba(150, 150, 150, 0.05)", border: "1px solid rgba(150, 150, 150, 0.12)", borderRadius: "20px", color: "var(--text-primary)", fontSize: "0.62rem", fontWeight: "750", cursor: "pointer", transition: "all 0.15s ease", fontFamily: iosFontStack }}
                        >
                          Edit Reply
                        </motion.button>
                      )}

                      {!comment.approved && (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleApproveComment(comment.id)} 
                          style={{ padding: "4px 10px", backgroundColor: "rgba(16, 185, 129, 0.06)", border: "1px solid rgba(16, 185, 129, 0.12)", borderRadius: "20px", color: "#10b981", fontSize: "0.62rem", fontWeight: "750", cursor: "pointer", transition: "all 0.15s ease", fontFamily: iosFontStack }}
                          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#10b981"; e.currentTarget.style.color = "#ffffff"; }}
                          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.06)"; e.currentTarget.style.color = "#10b981"; }}
                        >
                          Approve
                        </motion.button>
                      )}
                      
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDeleteComment(comment.id)} 
                        style={{ padding: "4px 10px", backgroundColor: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.12)", borderRadius: "20px", color: "#ef4444", fontSize: "0.62rem", fontWeight: "750", cursor: "pointer", transition: "all 0.15s ease", fontFamily: iosFontStack }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#ef4444"; e.currentTarget.style.color = "#ffffff"; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.06)"; e.currentTarget.style.color = "#ef4444"; }}
                      >
                        Delete
                      </motion.button>
                    </div>

                    {replyingCommentId === comment.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        style={{ width: "100%", marginTop: "4px", display: "flex", flexDirection: "column", gap: "6px", overflow: "hidden" }}
                      >
                        <div style={{
                          backgroundColor: "rgba(0, 0, 0, 0.03)",
                          borderRadius: "12px",
                          padding: "8px 12px",
                          border: "1px solid rgba(150,150,150,0.08)",
                          boxShadow: "inset 0 1.5px 3px rgba(0,0,0,0.04)"
                        }}>
                          <textarea
                            placeholder="Type your reply to comment..."
                            value={commentReplyText}
                            onChange={(e) => setCommentReplyText(e.target.value)}
                            style={{
                              width: "100%",
                              minHeight: "65px",
                              border: "none",
                              backgroundColor: "transparent",
                              color: "var(--text-primary)",
                              fontFamily: iosFontStack,
                              fontSize: "0.78rem",
                              lineHeight: "1.45",
                              outline: "none",
                              resize: "none",
                              fontWeight: "550"
                            }}
                          />
                        </div>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <motion.button 
                            whileHover={commentReplyText.trim() ? { scale: 1.02 } : {}}
                            whileTap={commentReplyText.trim() ? { scale: 0.98 } : {}}
                            onClick={() => handleReplyComment(comment.id)}
                            disabled={!commentReplyText.trim()}
                            style={{ 
                              padding: "5px 12px", 
                              backgroundColor: "var(--text-primary)", 
                              color: "var(--bg-color)", 
                              border: "none", 
                              borderRadius: "20px", 
                              fontSize: "0.65rem", 
                              fontWeight: "750", 
                              cursor: commentReplyText.trim() ? "pointer" : "not-allowed", 
                              opacity: commentReplyText.trim() ? 1 : 0.4,
                              fontFamily: iosFontStack
                            }}
                          >
                            Publish Reply
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setReplyingCommentId(null)}
                            style={{ 
                              padding: "5px 12px", 
                              backgroundColor: "rgba(150, 150, 150, 0.05)", 
                              border: "1px solid rgba(150, 150, 150, 0.1)", 
                              borderRadius: "20px", 
                              color: "var(--text-secondary)", 
                              fontSize: "0.65rem", 
                              fontWeight: "750", 
                              cursor: "pointer",
                              fontFamily: iosFontStack
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
                <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-secondary)", border: "1px dashed rgba(150,150,150,0.12)", borderRadius: "16px" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: "750", color: "var(--text-primary)" }}>No Comments</p>
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.68rem", color: "var(--text-secondary)" }}>Reader comments will show up here.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
 
        {/* --- MOMENTS TAB --- */}
        {activeTab === "moments" && (
          <motion.div key="moments" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "0.78rem", fontWeight: "800", margin: 0, color: "var(--text-primary)", letterSpacing: "0.04em" }}>Moments Curation</h2>
            </div>
            
            {/* Compact Form */}
            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.4)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(150, 150, 150, 0.1)", borderRadius: "16px", padding: "14px", marginBottom: "1.5rem", boxShadow: "0 4px 20px rgba(0, 0, 0, 0.01), inset 0 1px 0 rgba(255,255,255,0.7)" }}>
              
              <h3 style={{ fontSize: "0.72rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "0.02em", margin: "0 0 8px 0" }}>Upload New Moment</h3>

              <form onSubmit={handleUploadMoment} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "0.58rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Upload Photo</span>
                  
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
                      border: isDragOver ? "1.5px dashed var(--text-primary)" : "1.5px dashed rgba(150,150,150,0.2)",
                      borderRadius: "12px",
                      padding: "16px 12px",
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundColor: isDragOver 
                        ? "rgba(150,150,150,0.04)" 
                        : (momentPreviewUrl ? "rgba(0,0,0,0.005)" : "rgba(150,150,150,0.01)"),
                      transition: "all 0.15s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px"
                    }}
                  >
                    {momentPreviewUrl ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                        <div style={{ position: "relative", width: "60px", height: "60px", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(150,150,150,0.15)" }}>
                          <img 
                            src={momentPreviewUrl} 
                            alt="preview" 
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                          <span style={{ fontSize: "0.68rem", fontWeight: "700", color: "var(--text-primary)" }}>{momentFile?.name}</span>
                          <span style={{ fontSize: "0.58rem", color: "var(--text-secondary)", fontWeight: "500" }}>
                            {momentFile ? `${(momentFile.size / (1024 * 1024)).toFixed(2)} MB` : ""}
                          </span>
                        </div>
                        <motion.button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMomentFile(null);
                          }}
                          style={{
                            padding: "3px 10px",
                            backgroundColor: "rgba(239, 68, 68, 0.06)",
                            border: "1px solid rgba(239, 68, 68, 0.12)",
                            borderRadius: "16px",
                            color: "#ef4444",
                            fontSize: "0.58rem",
                            fontWeight: "750",
                            cursor: "pointer",
                            letterSpacing: "0.01em",
                            fontFamily: iosFontStack
                          }}
                        >
                          Change
                        </motion.button>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: "1.2rem", filter: "grayscale(100%)", opacity: 0.8 }}>📸</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                          <span style={{ fontSize: "0.72rem", fontWeight: "750", color: "var(--text-primary)" }}>
                            Drag & drop photo here
                          </span>
                          <span style={{ fontSize: "0.62rem", color: "var(--text-secondary)", fontWeight: "500" }}>
                            or tap to browse
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.58rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Title (Optional)</label>
                  <input className="admin-form-input" type="text" placeholder="e.g., Autumn Foliage" value={momentTitle} onChange={(e) => setMomentTitle(e.target.value)} />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.58rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Location</label>
                  <input className="admin-form-input" type="text" placeholder="e.g., Tokyo, Japan" value={momentLocation} onChange={(e) => setMomentLocation(e.target.value)} required />
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.58rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Date Label</label>
                  <input className="admin-form-input" type="text" placeholder="e.g., Aug 2023 or Spring 2025" value={momentDate} onChange={(e) => setMomentDate(e.target.value)} required />
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ fontSize: "0.58rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Story Snippet</label>
                  <textarea className="admin-form-input" placeholder="Cozy memory or story description..." value={momentStory} onChange={(e) => setMomentStory(e.target.value)} style={{ minHeight: "65px", resize: "none" }} />
                </div>
                
                <motion.button 
                  type="submit" 
                  disabled={isUploadingMoment || !momentFile || !momentLocation || !momentDate} 
                  whileHover={(!isUploadingMoment && momentFile && momentLocation && momentDate) ? { scale: 1.01 } : {}}
                  whileTap={(!isUploadingMoment && momentFile && momentLocation && momentDate) ? { scale: 0.99 } : {}}
                  style={{ 
                    padding: "10px", 
                    backgroundColor: "var(--text-primary)", 
                    color: "var(--bg-color)", 
                    border: "none", 
                    borderRadius: "30px", 
                    fontSize: "0.74rem", 
                    fontWeight: "800", 
                    cursor: (isUploadingMoment || !momentFile || !momentLocation || !momentDate) ? "not-allowed" : "pointer", 
                    opacity: (isUploadingMoment || !momentFile || !momentLocation || !momentDate) ? 0.4 : 1, 
                    transition: "opacity 0.2s ease",
                    letterSpacing: "0.02em",
                    fontFamily: iosFontStack
                  }}
                >
                  {isUploadingMoment ? "Uploading..." : "Publish to Gallery"}
                </motion.button>
              </form>
            </div>
 
            {/* Tightly Stacked Moments List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h3 style={{ fontSize: "0.72rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "0.02em", margin: "0 0 2px 0" }}>Gallery List</h3>
              
              {adminMoments.length > 0 ? (
                adminMoments.map(moment => (
                  <motion.div 
                    key={moment.id} 
                    layoutId={`mcard-${moment.id}`}
                    style={{ 
                      display: "flex", 
                      gap: "10px", 
                      padding: "10px", 
                      backgroundColor: "rgba(255, 255, 255, 0.4)", 
                      backdropFilter: "blur(20px)", 
                      WebkitBackdropFilter: "blur(20px)", 
                      border: "1px solid rgba(150, 150, 150, 0.1)", 
                      borderRadius: "16px", 
                      alignItems: "center", 
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.01), inset 0 1px 0 rgba(255,255,255,0.6)"
                    }}
                  >
                    <div style={{ position: "relative", width: "50px", height: "50px", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(150,150,150,0.12)", flexShrink: 0 }}>
                      <img src={moment.url} alt="moment thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>📍 {moment.location}</span>
                      <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", fontWeight: "500" }}>{moment.date}</span>
                    </div>
                    
                    {/* Tiny Homepage Curation Option Dropdown */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", flexShrink: 0 }}>
                      <select 
                        value={moment.homepageOrder !== undefined ? String(moment.homepageOrder) : "none"}
                        onChange={(e) => handleSetHomepageSlot(moment.id, e.target.value)}
                        className="custom-select"
                        style={{ 
                          padding: "4px 6px", 
                          borderRadius: "8px", 
                          border: "1px solid rgba(150, 150, 150, 0.18)", 
                          backgroundColor: moment.homepageOrder !== undefined ? "var(--text-primary)" : "rgba(150,150,150,0.04)", 
                          color: moment.homepageOrder !== undefined ? "var(--bg-color)" : "var(--text-primary)", 
                          fontSize: "0.62rem", 
                          fontWeight: "800",
                          outline: "none",
                          cursor: "pointer",
                          fontFamily: iosFontStack
                        }}
                      >
                        <option value="none">Off Home</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                          <option key={num} value={String(num)}>Slot {num}</option>
                        ))}
                      </select>
                    </div>
   
                    <motion.button 
                      whileHover={{ scale: 1.1, color: "#ef4444" }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteMoment(moment.id, moment.storagePath)} 
                      style={{ 
                        width: "24px", 
                        height: "24px", 
                        backgroundColor: "rgba(239,68,68,0.04)", 
                        border: "none", 
                        borderRadius: "50%", 
                        color: "#ef4444", 
                        cursor: "pointer", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        transition: "all 0.15s ease",
                        flexShrink: 0
                      }} 
                      title="Delete Photo"
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </motion.button>
                  </motion.div>
                ))
              ) : (
                <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--text-secondary)", border: "1px dashed rgba(150,150,150,0.12)", borderRadius: "16px" }}>
                  <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: "750", color: "var(--text-primary)" }}>No moments published yet</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Modal Confirm Box */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
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
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)"
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ type: "spring", damping: 28, stiffness: 420 }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "300px",
                backgroundColor: "var(--bg-color)",
                border: "1px solid rgba(150, 150, 150, 0.15)",
                borderRadius: "20px",
                padding: "1.25rem",
                boxShadow: "0 16px 40px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.75)",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                fontFamily: iosFontStack
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>
                  {confirmModal.title}
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: "1.4", margin: 0, fontWeight: "500" }}>
                  {confirmModal.message}
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "20px",
                    border: "1px solid rgba(150, 150, 150, 0.18)",
                    backgroundColor: "rgba(150, 150, 150, 0.03)",
                    color: "var(--text-primary)",
                    fontSize: "0.78rem",
                    fontWeight: "750",
                    cursor: "pointer",
                    outline: "none",
                    fontFamily: iosFontStack
                  }}
                >
                  {confirmModal.cancelText}
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "20px",
                    border: "none",
                    backgroundColor: "#ef4444",
                    color: "#ffffff",
                    fontSize: "0.78rem",
                    fontWeight: "750",
                    cursor: "pointer",
                    outline: "none",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.15)",
                    fontFamily: iosFontStack
                  }}
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
