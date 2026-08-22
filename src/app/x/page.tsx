"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getAllQuestionsForAdmin, answerQuestion, deleteQuestion, QuestionItem } from "@/lib/questions";

const iosFontStack = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

type AdminTab = "inbox" | "analytics";

function cleanLabel(str: string): string {
  if (!str) return "Unknown";
  try {
    return decodeURIComponent(str).replace(/%20/g, " ").trim();
  } catch {
    return str.replace(/%20/g, " ").trim();
  }
}

function cleanPath(urlOrPath: string): string {
  if (!urlOrPath) return "/";
  try {
    const raw = urlOrPath.split("?")[0].split("#")[0];
    return raw || "/";
  } catch {
    return urlOrPath;
  }
}

function getSessionEntries(visitorSessions: Record<string, any>) {
  return Object.entries(visitorSessions || {})
    .map(([id, session]) => ({ id, ...(session || {}) }))
    .sort((a: any, b: any) => new Date(b.lastSeen || 0).getTime() - new Date(a.lastSeen || 0).getTime());
}

function getTopCounts(items: string[]) {
  const counts = items.filter(Boolean).reduce<Record<string, number>>((acc, raw) => {
    const item = cleanLabel(raw);
    acc[item] = (acc[item] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "Just now";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<AdminTab>("inbox");
  const [inboxFilter, setInboxFilter] = useState<"pending" | "answered">("pending");

  // Questions
  const [adminQuestions, setAdminQuestions] = useState<QuestionItem[]>([]);
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

  // Analytics & Blocked IPs
  const [visitorSessions, setVisitorSessions] = useState<Record<string, any>>({});
  const [blockedIPs, setBlockedIPs] = useState<{ id: string; ip: string; note?: string; blockedAt?: string; isSystem?: boolean }[]>([]);
  const [newIPToBlock, setNewIPToBlock] = useState("");
  const [newIPNote, setNewIPNote] = useState("");
  const [isSubmittingIP, setIsSubmittingIP] = useState(false);
  const [ipError, setIpError] = useState("");

  // Block Modal for specific Question
  const [blockQuestionModal, setBlockQuestionModal] = useState<{
    isOpen: boolean;
    question: QuestionItem | null;
  }>({ isOpen: false, question: null });

  // Generic Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
  }>({ isOpen: false, title: "", message: "", confirmText: "Delete", cancelText: "Cancel", onConfirm: () => {} });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

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
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "check" }),
        });
        const data = await res.json();
        if (data.authenticated === true) {
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };
    verifyAuth();
  }, []);

  const tabParam = searchParams.get("tab");
  useEffect(() => {
    if (tabParam && ["inbox", "analytics"].includes(tabParam)) {
      setActiveTab(tabParam as AdminTab);
    }
  }, [tabParam]);

  const handleTabChange = (tabId: AdminTab) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/x?tab=${tabId}`);
    }
  };

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const list = await getAllQuestionsForAdmin();
      setAdminQuestions(list.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()));
      await Promise.all([loadVisitorSessions(), loadBlockedIPs()]);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadVisitorSessions = async () => {
    try {
      const res = await fetch("/api/visitor-sessions");
      if (res.ok) {
        const data = await res.json();
        setVisitorSessions(data);
      }
    } catch (err) {
      console.error("Failed to load visitor sessions", err);
    }
  };

  const loadBlockedIPs = async () => {
    try {
      const res = await fetch("/api/blocked-ips");
      if (res.ok) {
        const data = await res.json();
        setBlockedIPs(data);
      }
    } catch (err) {
      console.error("Failed to load blocked IPs", err);
    }
  };

  const handleInstagramLogin = async () => {
    setLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login-instagram", username: "ivanaffriandi" }),
      });
      const data = await res.json();
      if (data.success || data.authenticated) {
        setIsAuthenticated(true);
        loadData();
      } else {
        setLoginError(data.error || "Instagram sign-in failed.");
      }
    } catch (err: any) {
      setLoginError(err.message || "Failed to authenticate with Instagram.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      setIsAuthenticated(false);
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  const handleAnswerQuestion = async (id: string) => {
    if (!answerText.trim() || isSubmittingAnswer) return;
    setIsSubmittingAnswer(true);
    try {
      const success = await answerQuestion(id, answerText.trim());
      if (success) {
        setAdminQuestions((prev) =>
          prev.map((q) =>
            q.id === id
              ? {
                  ...q,
                  answered: true,
                  answer: answerText.trim(),
                  answeredAt: new Date().toISOString(),
                }
              : q
          )
        );
        setAnsweringQuestionId(null);
        setAnswerText("");
        showToast("Answer published ✦");
      }
    } catch (e) {
      console.error("Failed to answer question:", e);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const handleDeleteQuestion = (id: string) => {
    triggerConfirm("Delete Question", "Permanently delete this question? This cannot be undone.", async () => {
      const success = await deleteQuestion(id);
      if (success) {
        setAdminQuestions((prev) => prev.filter((q) => q.id !== id));
        showToast("Question deleted");
      }
    });
  };

  const handleBlockSenderFromQuestion = async (deleteAfterBlock: boolean) => {
    const q = blockQuestionModal.question;
    if (!q) return;
    const targetIp = q.ip || "127.0.0.1";
    try {
      await fetch("/api/blocked-ips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: targetIp,
          note: `Blocked sender: ${q.name || "Anonymous"} (${cleanLabel(q.location || "unknown")})`,
        }),
      });

      if (deleteAfterBlock) {
        await deleteQuestion(q.id);
        setAdminQuestions((prev) => prev.filter((item) => item.id !== q.id));
      }

      await loadBlockedIPs();
      setBlockQuestionModal({ isOpen: false, question: null });
      showToast(`IP ${targetIp} Blocked ✦`);
    } catch (err) {
      console.error("Failed to block sender:", err);
    }
  };

  const handleBlockIP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIPToBlock.trim() || isSubmittingIP) return;
    setIsSubmittingIP(true);
    setIpError("");
    try {
      const res = await fetch("/api/blocked-ips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: newIPToBlock.trim(), note: newIPNote.trim() }),
      });
      if (res.ok) {
        setNewIPToBlock("");
        setNewIPNote("");
        loadBlockedIPs();
        showToast("IP added to firewall ✦");
      } else {
        const data = await res.json();
        setIpError(data.error || "Failed to block IP");
      }
    } catch (err) {
      setIpError("System error blocking IP");
    } finally {
      setIsSubmittingIP(false);
    }
  };

  const handleUnblockIP = async (id: string) => {
    triggerConfirm("Unblock IP", "Are you sure you want to unblock this IP address?", async () => {
      try {
        const res = await fetch(`/api/blocked-ips?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        if (res.ok) {
          setBlockedIPs((prev) => prev.filter((item) => item.id !== id));
          showToast("IP unblocked");
        }
      } catch (err) {
        console.error("Failed to unblock IP", err);
      }
    });
  };

  // Loading spinner
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-color)" }}>
        <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid rgba(150,150,150,0.2)", borderTopColor: "var(--text-primary)", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  // Login View
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", backgroundColor: "var(--bg-color)", fontFamily: iosFontStack }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            width: "100%",
            maxWidth: "340px",
            padding: "2rem",
            borderRadius: "24px",
            backgroundColor: "var(--card-bg-1)",
            border: "1px solid var(--border-color)",
            boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.2rem", color: "var(--text-primary)" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 0.4rem", color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
            Ivan HQ
          </h1>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
            Sign in to manage Q&amp;A inbox and visitor analytics.
          </p>

          <button
            type="button"
            onClick={handleInstagramLogin}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "var(--text-primary)",
              color: "var(--bg-color)",
              border: "none",
              borderRadius: "14px",
              fontFamily: iosFontStack,
              fontSize: "0.8rem",
              fontWeight: 800,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            <span>Sign in as @ivanaffriandi</span>
          </button>

          {loginError && (
            <div style={{ fontSize: "0.74rem", color: "#ff453a", fontWeight: 600, marginTop: "12px" }}>
              {loginError}
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  const pendingQuestionsCount = adminQuestions.filter((q) => !q.answered).length;
  const answeredQuestionsCount = adminQuestions.filter((q) => q.answered).length;

  const filteredQuestions = adminQuestions.filter((q) => {
    if (inboxFilter === "pending") return !q.answered;
    if (inboxFilter === "answered") return q.answered;
    return true;
  });

  const analyticsSessions = getSessionEntries(visitorSessions);
  const totalVisits = analyticsSessions.reduce((sum: number, session: any) => sum + (Number(session.count) || 0), 0);

  const topPlatforms = getTopCounts(analyticsSessions.map((s: any) => s.lastPlatform || s.firstPlatform || "Direct / Bookmark"));
  const topLocations = getTopCounts(analyticsSessions.map((s: any) => s.geo?.city || s.location || "Unknown Location"));
  const topPages = getTopCounts(analyticsSessions.flatMap((s: any) => (Array.isArray(s.history) ? s.history : []).map((h: any) => cleanPath(h.page || s.lastPage || "/"))));
  const topDevices = getTopCounts(analyticsSessions.map((s: any) => s.deviceDetails?.deviceType || s.device || "Unknown Device"));

  const maxPlatformCount = Math.max(...topPlatforms.map(([, c]) => c), 1);
  const maxLocationCount = Math.max(...topLocations.map(([, c]) => c), 1);
  const maxPageCount = Math.max(...topPages.map(([, c]) => c), 1);
  const maxDeviceCount = Math.max(...topDevices.map(([, c]) => c), 1);

  return (
    <div
      className="admin-root-view"
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-color)",
        color: "var(--text-primary)",
        fontFamily: iosFontStack,
        paddingBottom: "80px",
        boxSizing: "border-box",
        width: "100%",
      }}
    >
      <style>{`
        /* Scrollbar elimination */
        *::-webkit-scrollbar,
        .admin-no-scrollbar::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }

        .admin-page-container {
          max-width: 680px;
          width: 100%;
          margin: 0 auto;
          padding: 1.4rem 1.25rem 3rem;
          box-sizing: border-box;
        }

        .admin-card {
          background-color: var(--card-bg-1);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 1.3rem;
          box-sizing: border-box;
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
        }

        .admin-grid-2col {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        @media (max-width: 640px) {
          .admin-grid-2col {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .admin-page-container {
            padding: 1rem 1rem 2.5rem;
          }
        }

        .admin-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 750;
          cursor: pointer;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          transition: all 0.2s ease;
        }

        .admin-pill-active {
          background: var(--text-primary) !important;
          color: var(--bg-color) !important;
          border-color: var(--text-primary) !important;
        }

        .admin-textarea {
          width: 100%;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 0.75rem 0.9rem;
          color: var(--text-primary);
          font-size: 0.85rem;
          outline: none;
          font-family: inherit;
          box-sizing: border-box;
          resize: vertical;
          line-height: 1.5;
        }

        .admin-action-btn {
          padding: 7px 14px;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 800;
          cursor: pointer;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: transform 0.15s ease;
        }

        .admin-action-btn:active {
          transform: scale(0.95);
        }

        .progress-track {
          height: 4px;
          width: 100%;
          background: var(--bg-secondary);
          border-radius: 9999px;
          overflow: hidden;
          margin-top: 4px;
        }

        .progress-bar-fill {
          height: 100%;
          background: var(--text-primary);
          border-radius: 9999px;
          transition: width 0.4s ease;
        }

        .icon-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .icon-btn:hover {
          color: var(--text-primary);
          border-color: var(--text-primary);
        }

        .icon-btn:active {
          transform: scale(0.92);
        }

        .rotating-icon {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* ── TOP HEADER (SOLID OPAQUE BACKGROUND, NO TITLE, SWITCH AT TOP LEFT) ── */}
      <header
        style={{
          width: "100%",
          borderBottom: "1px solid var(--border-color)",
          padding: "0.85rem 1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxSizing: "border-box",
          position: "sticky",
          top: 0,
          backgroundColor: "var(--bg-color)",
          zIndex: 99,
        }}
      >
        {/* TOP LEFT: SEGMENTED SWITCH BUTTONS */}
        <div style={{ display: "flex", background: "var(--bg-secondary)", borderRadius: "9999px", padding: "2px", border: "1px solid var(--border-color)" }}>
          <button
            type="button"
            onClick={() => handleTabChange("inbox")}
            style={{
              border: "none",
              background: activeTab === "inbox" ? "var(--card-bg-1)" : "transparent",
              color: activeTab === "inbox" ? "var(--text-primary)" : "var(--text-secondary)",
              padding: "5px 14px",
              borderRadius: "9999px",
              fontSize: "0.74rem",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: activeTab === "inbox" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.15s ease",
            }}
          >
            <span>Inbox</span>
            {pendingQuestionsCount > 0 && (
              <span style={{ background: "#FF3B30", color: "#fff", fontSize: "0.58rem", fontWeight: 850, padding: "1px 5px", borderRadius: "9999px" }}>
                {pendingQuestionsCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("analytics")}
            style={{
              border: "none",
              background: activeTab === "analytics" ? "var(--card-bg-1)" : "transparent",
              color: activeTab === "analytics" ? "var(--text-primary)" : "var(--text-secondary)",
              padding: "5px 14px",
              borderRadius: "9999px",
              fontSize: "0.74rem",
              fontWeight: 800,
              cursor: "pointer",
              boxShadow: activeTab === "analytics" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              transition: "all 0.15s ease",
            }}
          >
            Analytics
          </button>
        </div>

        {/* TOP RIGHT: REFRESH ICON & SIGN OUT */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            type="button"
            onClick={loadData}
            title="Refresh data"
            className="icon-btn"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={isRefreshing ? "rotating-icon" : ""}
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              border: "1px solid var(--border-color)",
              background: "var(--bg-secondary)",
              color: "var(--text-secondary)",
              borderRadius: "9999px",
              padding: "6px 12px",
              fontSize: "0.7rem",
              fontWeight: 750,
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="admin-page-container">
        {/* ── 1. INBOX TAB ── */}
        {activeTab === "inbox" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {/* FILTER PILLS (ONLY PENDING & ANSWERED) */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setInboxFilter("pending")}
                className={`admin-pill-btn ${inboxFilter === "pending" ? "admin-pill-active" : ""}`}
              >
                <span>Pending</span>
                <span>({pendingQuestionsCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setInboxFilter("answered")}
                className={`admin-pill-btn ${inboxFilter === "answered" ? "admin-pill-active" : ""}`}
              >
                <span>Answered</span>
                <span>({answeredQuestionsCount})</span>
              </button>
            </div>

            {/* QUESTIONS LIST */}
            {filteredQuestions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "3.5rem 1rem", border: "1px dashed var(--border-color)", borderRadius: "20px" }}>
                <p style={{ fontSize: "0.88rem", fontWeight: 750, color: "var(--text-primary)", margin: "0 0 4px" }}>
                  No {inboxFilter} questions
                </p>
                <p style={{ fontSize: "0.74rem", color: "var(--text-secondary)", margin: 0 }}>
                  Questions from the /ask page will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {filteredQuestions.map((q) => {
                  const isAnswering = answeringQuestionId === q.id;

                  return (
                    <motion.div
                      key={q.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="admin-card"
                      style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
                    >
                      {/* CARD HEADER */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-primary)" }}>
                            {q.name || "Anonymous"}
                          </span>
                          {!q.answered && (
                            <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#ff9500", background: "rgba(255, 149, 0, 0.12)", padding: "2px 7px", borderRadius: "9999px" }}>
                              New
                            </span>
                          )}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "0.62rem", color: "var(--text-secondary)" }}>
                            {new Date(q.published).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>

                          {/* BLOCK SENDER ICON BUTTON */}
                          <button
                            type="button"
                            onClick={() => setBlockQuestionModal({ isOpen: true, question: q })}
                            style={{
                              border: "none",
                              background: "rgba(255,59,48,0.08)",
                              color: "#ff3b30",
                              cursor: "pointer",
                              padding: "4px 6px",
                              borderRadius: "6px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              lineHeight: 1,
                            }}
                            title="Block Sender IP"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                            </svg>
                          </button>

                          {/* DELETE ICON BUTTON */}
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(q.id)}
                            style={{
                              border: "none",
                              background: "transparent",
                              color: "var(--text-secondary)",
                              cursor: "pointer",
                              padding: "4px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              lineHeight: 1,
                            }}
                            title="Delete Question"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* QUESTION BODY */}
                      <p style={{ fontSize: "0.92rem", lineHeight: 1.55, margin: 0, color: "var(--text-primary)", whiteSpace: "pre-wrap" }}>
                        &ldquo;{q.content}&rdquo;
                      </p>

                      {/* SENDER METADATA SNIPPET (LOCATION & DEVICE) */}
                      {(q.location || q.device) && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.66rem", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                          {q.location && <span>📍 {cleanLabel(q.location)}</span>}
                          {q.device && <span>· 📱 {q.device}</span>}
                          {q.ip && <span>· 🌐 {q.ip}</span>}
                        </div>
                      )}

                      {/* ALREADY ANSWERED VIEW */}
                      {q.answered && !isAnswering && (
                        <div style={{ background: "var(--bg-secondary)", borderRadius: "14px", padding: "0.85rem 1rem", marginTop: "0.2rem" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--text-primary)" }}>
                              Ivan ✦
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setAnsweringQuestionId(q.id);
                                setAnswerText(q.answer || "");
                              }}
                              style={{
                                border: "none",
                                background: "transparent",
                                color: "var(--text-secondary)",
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                cursor: "pointer",
                              }}
                            >
                              Edit Answer
                            </button>
                          </div>
                          <p style={{ fontSize: "0.85rem", lineHeight: 1.5, margin: 0, color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
                            {q.answer}
                          </p>
                        </div>
                      )}

                      {/* REPLY FORM */}
                      {!q.answered && !isAnswering && (
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            onClick={() => {
                              setAnsweringQuestionId(q.id);
                              setAnswerText("");
                            }}
                            className="admin-action-btn"
                            style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-color)" }}
                          >
                            <span>Reply</span>
                            <span>›</span>
                          </button>
                        </div>
                      )}

                      {/* ANSWER INPUT FORM */}
                      {isAnswering && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginTop: "0.3rem" }}>
                          <textarea
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            placeholder="Write your answer as Ivan..."
                            rows={3}
                            autoFocus
                            className="admin-textarea"
                          />

                          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setAnsweringQuestionId(null);
                                setAnswerText("");
                              }}
                              className="admin-action-btn"
                              style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={!answerText.trim() || isSubmittingAnswer}
                              onClick={() => handleAnswerQuestion(q.id)}
                              className="admin-action-btn"
                              style={{
                                backgroundColor: "var(--text-primary)",
                                color: "var(--bg-color)",
                                opacity: !answerText.trim() || isSubmittingAnswer ? 0.5 : 1,
                              }}
                            >
                              <span>{isSubmittingAnswer ? "Saving..." : "Send Answer ✦"}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── 2. ANALYTICS & VISITOR INTELLIGENCE TAB (NO SQUISHING / CUT-OFFS) ── */}
        {activeTab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
            {/* OVERVIEW STATS (RESPONSIVE GRID) */}
            <div className="admin-grid-2col">
              <div className="admin-card" style={{ padding: "1.15rem" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 750, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Unique IP Sessions
                </span>
                <div style={{ fontSize: "1.65rem", fontWeight: 900, color: "var(--text-primary)", marginTop: "4px" }}>
                  {analyticsSessions.length}
                </div>
              </div>

              <div className="admin-card" style={{ padding: "1.15rem" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 750, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Total Page Loads
                </span>
                <div style={{ fontSize: "1.65rem", fontWeight: 900, color: "var(--text-primary)", marginTop: "4px" }}>
                  {totalVisits}
                </div>
              </div>

              <div className="admin-card" style={{ padding: "1.15rem" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 750, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Questions Received
                </span>
                <div style={{ fontSize: "1.65rem", fontWeight: 900, color: "var(--text-primary)", marginTop: "4px" }}>
                  {adminQuestions.length}
                </div>
              </div>

              <div className="admin-card" style={{ padding: "1.15rem" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 750, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Firewall Status
                </span>
                <div style={{ fontSize: "1rem", fontWeight: 800, color: "#34c759", marginTop: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#34c759" }} />
                  <span>{blockedIPs.length} Blocked</span>
                </div>
              </div>
            </div>

            {/* DETAILED BREAKDOWNS (FULL WIDTH CARDS ON MOBILE) */}
            <div className="admin-grid-2col">
              {/* TOP PLATFORMS */}
              <div className="admin-card" style={{ padding: "1.1rem" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Top Referrers
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                  {topPlatforms.map(([name, count]) => {
                    const pct = Math.round((count / maxPlatformCount) * 100);
                    return (
                      <div key={name}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                          <span style={{ color: "var(--text-primary)", fontWeight: 650, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {name}
                          </span>
                          <span style={{ color: "var(--text-secondary)", fontWeight: 800, marginLeft: "8px" }}>{count}</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TOP CITIES */}
              <div className="admin-card" style={{ padding: "1.1rem" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Top Cities
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                  {topLocations.map(([name, count]) => {
                    const pct = Math.round((count / maxLocationCount) * 100);
                    return (
                      <div key={name}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                          <span style={{ color: "var(--text-primary)", fontWeight: 650, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {name}
                          </span>
                          <span style={{ color: "var(--text-secondary)", fontWeight: 800, marginLeft: "8px" }}>{count}</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TOP PAGES */}
              <div className="admin-card" style={{ padding: "1.1rem" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Top Pages
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                  {topPages.map(([name, count]) => {
                    const pct = Math.round((count / maxPageCount) * 100);
                    return (
                      <div key={name}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                          <span style={{ color: "var(--text-primary)", fontWeight: 650, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {name}
                          </span>
                          <span style={{ color: "var(--text-secondary)", fontWeight: 800, marginLeft: "8px" }}>{count}</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TOP DEVICES */}
              <div className="admin-card" style={{ padding: "1.1rem" }}>
                <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Top Devices
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
                  {topDevices.map(([name, count]) => {
                    const pct = Math.round((count / maxDeviceCount) * 100);
                    return (
                      <div key={name}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                          <span style={{ color: "var(--text-primary)", fontWeight: 650, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {name}
                          </span>
                          <span style={{ color: "var(--text-secondary)", fontWeight: 800, marginLeft: "8px" }}>{count}</span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* LIVE SESSIONS LOG (NO OVERLAPPING OR CLIPPED TEXT) */}
            <div className="admin-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 850, color: "var(--text-primary)" }}>
                  Recent Visitor Stream
                </span>
                <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>
                  {analyticsSessions.length} total sessions
                </span>
              </div>

              <div className="admin-no-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "480px", overflowY: "auto" }}>
                {analyticsSessions.slice(0, 40).map((session: any) => {
                  const locationName = cleanLabel(session.geo?.city || session.location || "Unknown Location");
                  const ipAddress = session.ip || session.id;
                  const platform = cleanLabel(session.lastPlatform || session.firstPlatform || "Direct");
                  const device = cleanLabel(session.deviceDetails?.deviceType || session.device || "Browser");
                  const lastCleanPath = cleanPath(session.lastPage || "/");

                  return (
                    <div
                      key={session.id}
                      style={{
                        background: "var(--bg-secondary)",
                        borderRadius: "14px",
                        padding: "12px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        fontSize: "0.76rem",
                        gap: "12px",
                        boxSizing: "border-box",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>
                            {locationName}
                          </span>
                          <span style={{ fontSize: "0.64rem", color: "var(--text-secondary)", opacity: 0.7 }}>
                            · {ipAddress}
                          </span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.68rem", color: "var(--text-secondary)", flexWrap: "wrap", marginTop: "2px" }}>
                          <span style={{ background: "var(--border-color)", padding: "1px 6px", borderRadius: "4px", fontWeight: 700, color: "var(--text-primary)", fontSize: "0.65rem" }}>
                            {lastCleanPath}
                          </span>
                          <span>{platform}</span>
                          <span>·</span>
                          <span>{device}</span>
                          <span>·</span>
                          <span>{formatRelativeTime(session.lastSeen)}</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginTop: "2px" }}>
                        <span style={{ fontSize: "0.68rem", fontWeight: 800, color: "var(--text-secondary)", background: "var(--card-bg-1)", padding: "2px 6px", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                          {session.count}x
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setNewIPToBlock(ipAddress);
                            setNewIPNote(`Blocked from visitor stream (${locationName})`);
                          }}
                          style={{
                            border: "none",
                            background: "rgba(255,59,48,0.1)",
                            color: "#ff3b30",
                            padding: "4px 9px",
                            borderRadius: "6px",
                            fontSize: "0.64rem",
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          Block
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BLOCK IP FIREWALL */}
            <div className="admin-card">
              <span style={{ fontSize: "0.85rem", fontWeight: 850, color: "var(--text-primary)", display: "block", marginBottom: "0.8rem" }}>
                IP Firewall &amp; Security
              </span>

              <form onSubmit={handleBlockIP} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    placeholder="IP address (e.g. 192.168.1.1)"
                    value={newIPToBlock}
                    onChange={(e) => setNewIPToBlock(e.target.value)}
                    className="admin-textarea"
                    style={{ padding: "8px 12px", resize: "none" }}
                  />
                  <input
                    type="text"
                    placeholder="Note / Reason"
                    value={newIPNote}
                    onChange={(e) => setNewIPNote(e.target.value)}
                    className="admin-textarea"
                    style={{ padding: "8px 12px", resize: "none" }}
                  />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {ipError && <span style={{ fontSize: "0.7rem", color: "#ff453a" }}>{ipError}</span>}
                  <button
                    type="submit"
                    disabled={!newIPToBlock.trim() || isSubmittingIP}
                    className="admin-action-btn"
                    style={{
                      backgroundColor: "var(--text-primary)",
                      color: "var(--bg-color)",
                      marginLeft: "auto",
                    }}
                  >
                    <span>{isSubmittingIP ? "Blocking..." : "Block IP"}</span>
                  </button>
                </div>
              </form>

              {/* BLOCKED LIST */}
              {blockedIPs.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "1rem" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--text-secondary)" }}>
                    Currently Blocked ({blockedIPs.length})
                  </span>
                  {blockedIPs.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "7px 10px",
                        background: "var(--bg-secondary)",
                        borderRadius: "8px",
                        fontSize: "0.72rem",
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>{item.ip}</span>
                        {item.note && <span style={{ color: "var(--text-secondary)", marginLeft: "8px" }}>{item.note}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnblockIP(item.id)}
                        style={{ border: "none", background: "transparent", color: "#34c759", fontSize: "0.68rem", fontWeight: 800, cursor: "pointer" }}
                      >
                        Unblock
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── IOS-STYLED MODAL: BLOCK SENDER CONFIRMATION ── */}
      <AnimatePresence>
        {blockQuestionModal.isOpen && blockQuestionModal.question && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.2rem" }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setBlockQuestionModal({ isOpen: false, question: null })}
              style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 10 }}
              transition={{ type: "spring", stiffness: 450, damping: 32 }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "320px",
                backgroundColor: "var(--card-bg-1)",
                border: "1px solid var(--border-color)",
                borderRadius: "22px",
                padding: "1.4rem",
                boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,59,48,0.12)", color: "#ff3b30", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 850, margin: "0 0 4px", color: "var(--text-primary)", textAlign: "center" }}>
                  Block Sender IP
                </h3>
                <p style={{ fontSize: "0.76rem", color: "var(--text-secondary)", margin: 0, textAlign: "center", lineHeight: 1.4 }}>
                  This IP address will be permanently blocked from submitting questions and visiting the portal.
                </p>
              </div>

              {/* SENDER DETAILS BOX */}
              <div style={{ background: "var(--bg-secondary)", borderRadius: "14px", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "5px", fontSize: "0.72rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Sender:</span>
                  <span style={{ fontWeight: 800, color: "var(--text-primary)" }}>{blockQuestionModal.question.name || "Anonymous"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>IP Address:</span>
                  <span style={{ fontWeight: 800, color: "#ff3b30" }}>{blockQuestionModal.question.ip || "127.0.0.1"}</span>
                </div>
                {blockQuestionModal.question.location && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Location:</span>
                    <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{cleanLabel(blockQuestionModal.question.location)}</span>
                  </div>
                )}
                {blockQuestionModal.question.device && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Device:</span>
                    <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>{blockQuestionModal.question.device}</span>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <button
                  type="button"
                  onClick={() => handleBlockSenderFromQuestion(true)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "12px",
                    border: "none",
                    background: "#ff3b30",
                    color: "#fff",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Block IP &amp; Delete Question
                </button>

                <button
                  type="button"
                  onClick={() => handleBlockSenderFromQuestion(false)}
                  style={{
                    width: "100%",
                    padding: "9px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-color)",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    fontSize: "0.78rem",
                    fontWeight: 750,
                    cursor: "pointer",
                  }}
                >
                  Block IP Only
                </button>

                <button
                  type="button"
                  onClick={() => setBlockQuestionModal({ isOpen: false, question: null })}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "12px",
                    border: "none",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── GENERIC CONFIRMATION MODAL ── */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
              style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)" }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "280px",
                backgroundColor: "var(--card-bg-1)",
                border: "1px solid var(--border-color)",
                borderRadius: "18px",
                padding: "1.2rem",
                boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                textAlign: "center",
                gap: "0.8rem",
              }}
            >
              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 800, margin: "0 0 4px", color: "var(--text-primary)" }}>
                  {confirmModal.title}
                </h3>
                <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                  {confirmModal.message}
                </p>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "0.4rem" }}>
                <button
                  type="button"
                  onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "10px",
                    border: "1px solid var(--border-color)",
                    background: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#ff3b30",
                    color: "#fff",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {confirmModal.confirmText || "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            style={{
              position: "fixed",
              top: "1.2rem",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "var(--text-primary)",
              color: "var(--bg-color)",
              padding: "7px 16px",
              borderRadius: "9999px",
              fontSize: "0.72rem",
              fontWeight: 850,
              zIndex: 100001,
              boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
            }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-color)" }}>
          <div style={{ width: "18px", height: "18px", borderRadius: "50%", border: "2px solid rgba(150,150,150,0.2)", borderTopColor: "var(--text-primary)", animation: "spin 0.8s linear infinite" }} />
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
