"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithGoogle } from "@/lib/firebase";
import { getAllCommentsForAdmin, approveComment, deleteComment, replyComment, CommentItem } from "@/lib/comments";
import { getAllQuestionsForAdmin, answerQuestion, deleteQuestion, QuestionItem } from "@/lib/questions";
import { getAllMoments, addMoment, deleteMoment, updateMoment, uploadMomentPhoto, MomentItem } from "@/lib/moments";
import { getAllCalendarEvents, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent, CalendarEvent } from "@/lib/calendar";
import { BookItem, getAllBooks, addBook, updateBook, deleteBook } from "@/lib/books";

const iosSpring = { type: "spring" as const, stiffness: 420, damping: 32 };
const staggerContainer = { animate: { transition: { staggerChildren: 0.03 } } };
const fadeRise = {
  initial: { opacity: 0, y: 8, filter: "blur(3px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring" as const, stiffness: 380, damping: 30 } }
};
const iosFontStack = '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

function GlassModal({ isOpen, onClose, children, theme }: { isOpen: boolean; onClose: () => void; children: React.ReactNode; theme: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !isOpen) return null;
  return createPortal(
    <motion.div
      key="glass-modal-overlay"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem",
        backgroundColor: theme === "dark" ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.3)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 14 }}
        transition={{ type: "spring", stiffness: 480, damping: 36 }}
        className="hide-scrollbar"
        style={{
          width: "100%", maxWidth: "440px", maxHeight: "88vh", overflowY: "auto", padding: "22px",
          background: theme === "dark"
            ? "linear-gradient(145deg, rgba(28,28,32,0.96) 0%, rgba(18,18,22,0.98) 100%)"
            : "linear-gradient(145deg, rgba(255,255,255,0.97) 0%, rgba(245,245,250,0.99) 100%)",
          backdropFilter: "blur(60px) saturate(220%)", WebkitBackdropFilter: "blur(60px) saturate(220%)",
          border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.13)" : "rgba(255,255,255,0.95)"}`,
          borderRadius: "28px",
          boxShadow: theme === "dark"
            ? "0 32px 80px rgba(0,0,0,0.8), 0 2px 0 rgba(255,255,255,0.08) inset"
            : "0 32px 80px rgba(0,0,0,0.18), 0 2px 0 rgba(255,255,255,1) inset, 0 0 0 0.5px rgba(0,0,0,0.05)",
        }}
      >
        {children}
      </motion.div>
    </motion.div>,
    document.body
  );
}

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    // This site uses prefers-color-scheme media query — not a class or data-theme attribute
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setTheme(mq.matches ? "dark" : "light");
    const handler = (e: MediaQueryListEvent) => setTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<"inbox" | "calendar" | "comments" | "moments" | "books" | "security">("comments");
  const [inboxFilter, setInboxFilter] = useState<"all" | "pending" | "answered">("pending");

  // Blocked IPs state
  const [blockedIPs, setBlockedIPs] = useState<{ id: string; ip: string; note?: string; blockedAt?: string; isSystem?: boolean }[]>([]);
  const [newIPToBlock, setNewIPToBlock] = useState("");
  const [newIPNote, setNewIPNote] = useState("");
  const [isSubmittingIP, setIsSubmittingIP] = useState(false);
  const [ipError, setIpError] = useState("");

  const [adminQuestions, setAdminQuestions] = useState<QuestionItem[]>([]);
  const [adminComments, setAdminComments] = useState<CommentItem[]>([]);
  const [adminMoments, setAdminMoments] = useState<MomentItem[]>([]);
  const [adminCalendarEvents, setAdminCalendarEvents] = useState<CalendarEvent[]>([]);
  const [adminBooks, setAdminBooks] = useState<BookItem[]>([]);

  // Books
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookCoverUrl, setBookCoverUrl] = useState("");
  const [bookProgress, setBookProgress] = useState(0);
  const [bookStatus, setBookStatus] = useState<"reading" | "completed" | "on_hold" | "to_read">("reading");
  const [bookReview, setBookReview] = useState("");
  const [bookRating, setBookRating] = useState(5);
  const [showBookModal, setShowBookModal] = useState(false);
  const [isSubmittingBook, setIsSubmittingBook] = useState(false);
  const [isUploadingBookCover, setIsUploadingBookCover] = useState(false);

  // Book Quick Search (used in modal add/edit)
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ title: string; author: string; coverUrl: string; source: string }>>([]);

  // Per-row cover update
  const [coverSearchBookId, setCoverSearchBookId] = useState<string | null>(null);
  const [coverSearchQuery, setCoverSearchQuery] = useState("");
  const [coverSearching, setCoverSearching] = useState(false);
  const [coverSearchResults, setCoverSearchResults] = useState<Array<{ title: string; author: string; coverUrl: string; source: string }>>([]);

  const handleSearchBooks = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    
    const results: Array<{ title: string; author: string; coverUrl: string; source: string }> = [];
    const query = encodeURIComponent(searchQuery.trim());
    
    // 1. Fetch from Google Books API
    try {
      const gRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=5`);
      if (gRes.ok) {
        const data = await gRes.json();
        if (data.items) {
          data.items.forEach((item: any) => {
            const info = item.volumeInfo;
            if (info) {
              const title = info.title || "";
              const authors = info.authors ? info.authors.join(", ") : "Unknown Author";
              const coverUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "";
              const secureCoverUrl = coverUrl ? coverUrl.replace("http://", "https://").replace("zoom=1", "zoom=2") : "";
              results.push({
                title,
                author: authors,
                coverUrl: secureCoverUrl,
                source: "Google Play Books"
              });
            }
          });
        }
      }
    } catch (err) {
      console.error("Google Books search error:", err);
    }
    
    // 2. Fetch from Open Library API
    try {
      const olRes = await fetch(`https://openlibrary.org/search.json?q=${query}&limit=5`, {
        headers: {
          "User-Agent": "IvanPortfolioBookFetcher/1.0 (ivanaffriandi@gmail.com)",
          "Accept": "application/json"
        }
      });
      if (olRes.ok) {
        const data = await olRes.json();
        if (data.docs) {
          data.docs.forEach((doc: any) => {
            const title = doc.title || "";
            const authors = doc.author_name ? doc.author_name.join(", ") : "Unknown Author";
            let coverUrl = "";
            if (doc.cover_i) {
              coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
            } else if (doc.isbn && doc.isbn.length > 0) {
              coverUrl = `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
            }
            results.push({
              title,
              author: authors,
              coverUrl,
              source: doc.id_amazon ? "Amazon Kindle" : "Open Library"
            });
          });
        }
      }
    } catch (err) {
      console.error("Open Library search error:", err);
    }
    
    // De-duplicate
    const uniqueMap = new Map<string, typeof results[0]>();
    results.forEach(res => {
      const key = `${res.title.toLowerCase()}::${res.author.toLowerCase()}`;
      if (!uniqueMap.has(key) || (res.coverUrl && !uniqueMap.get(key)!.coverUrl)) {
        uniqueMap.set(key, res);
      }
    });
    
    setSearchResults(Array.from(uniqueMap.values()).slice(0, 8));
    setSearching(false);
  };

  const selectSearchResult = (result: any) => {
    setBookTitle(result.title.toUpperCase());
    setBookAuthor(result.author);
    setBookCoverUrl(result.coverUrl);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleCoverSearch = async (query: string) => {
    if (!query.trim()) return;
    setCoverSearching(true);
    setCoverSearchResults([]);
    const results: Array<{ title: string; author: string; coverUrl: string; source: string }> = [];
    const q = encodeURIComponent(query.trim());
    try {
      const gRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=8`);
      if (gRes.ok) {
        const data = await gRes.json();
        if (data.items) {
          data.items.forEach((item: any) => {
            const info = item.volumeInfo;
            if (info) {
              const coverUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "";
              const secureCoverUrl = coverUrl ? coverUrl.replace("http://", "https://").replace("zoom=1", "zoom=3") : "";
              if (secureCoverUrl) results.push({ title: info.title || "", author: (info.authors || [""]).join(", "), coverUrl: secureCoverUrl, source: "Google Play Books" });
            }
          });
        }
      }
    } catch (e) { /* ignore */ }
    try {
      const olRes = await fetch(`https://openlibrary.org/search.json?q=${q}&limit=5`, { headers: { "Accept": "application/json" } });
      if (olRes.ok) {
        const data = await olRes.json();
        if (data.docs) {
          data.docs.forEach((doc: any) => {
            let coverUrl = "";
            if (doc.cover_i) coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
            else if (doc.isbn?.length > 0) coverUrl = `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
            if (coverUrl) results.push({ title: doc.title || "", author: (doc.author_name || [""]).join(", "), coverUrl, source: "Open Library" });
          });
        }
      }
    } catch (e) { /* ignore */ }
    // deduplicate by coverUrl
    const seen = new Set<string>();
    setCoverSearchResults(results.filter(r => { if (seen.has(r.coverUrl)) return false; seen.add(r.coverUrl); return true; }).slice(0, 10));
    setCoverSearching(false);
  };

  const applyNewCover = async (bookId: string, newCoverUrl: string) => {
    const book = adminBooks.find(b => b.id === bookId);
    if (!book) return;
    const success = await updateBook(bookId, { ...book, coverUrl: newCoverUrl });
    if (success) {
      setAdminBooks(prev => prev.map(b => b.id === bookId ? { ...b, coverUrl: newCoverUrl } : b));
      setCoverSearchBookId(null);
      setCoverSearchResults([]);
      setCoverSearchQuery("");
      router.refresh();
    }
  };

  // Comment Reply
  const [replyingCommentId, setReplyingCommentId] = useState<string | null>(null);
  const [commentReplyText, setCommentReplyText] = useState("");

  // Calendar
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState("08");
  const [calendarDay, setCalendarDay] = useState("03");
  const [calendarName, setCalendarName] = useState("");
  const [calendarEmoji, setCalendarEmoji] = useState("🎂");
  const [calendarType, setCalendarType] = useState<CalendarEvent["type"]>("ivan");
  const [isSubmittingCalendar, setIsSubmittingCalendar] = useState(false);

  // Moment Upload
  const [isUploadingMoment, setIsUploadingMoment] = useState(false);
  const [momentFile, setMomentFile] = useState<File | null>(null);
  const [momentPreviewUrl, setMomentPreviewUrl] = useState<string | null>(null);
  const [momentTitle, setMomentTitle] = useState("");
  const [momentLocation, setMomentLocation] = useState("");
  const [momentDate, setMomentDate] = useState("");
  const [momentStory, setMomentStory] = useState("");

  // Moment Edit (NEW)
  const [editingMomentId, setEditingMomentId] = useState<string | null>(null);
  const [editMomentTitle, setEditMomentTitle] = useState("");
  const [editMomentLocation, setEditMomentLocation] = useState("");
  const [editMomentDate, setEditMomentDate] = useState("");
  const [editMomentStory, setEditMomentStory] = useState("");
  const [showEditMomentModal, setShowEditMomentModal] = useState(false);
  const [isSavingMoment, setIsSavingMoment] = useState(false);

  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showMomentModal, setShowMomentModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bookReviewRef = useRef<HTMLTextAreaElement>(null);

  const applyFormat = (tag: string) => {
    if (!bookReviewRef.current) return;
    const textarea = bookReviewRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = bookReview.substring(start, end);
    let newText = "";
    if (tag === 'ul') {
      const formattedList = selectedText ? selectedText.split('\n').map(line => `<li>${line}</li>`).join('\n') : "<li>List item</li>";
      newText = bookReview.substring(0, start) + `<ul>\n${formattedList}\n</ul>` + bookReview.substring(end);
    } else {
      newText = bookReview.substring(0, start) + `<${tag}>${selectedText}</${tag}>` + bookReview.substring(end);
    }
    setBookReview(newText);
    setTimeout(() => {
      textarea.focus();
    }, 0);
  };

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean; title: string; message: string;
    confirmText?: string; cancelText?: string; onConfirm: () => void | Promise<void>;
  }>({ isOpen: false, title: "", message: "", confirmText: "Delete", cancelText: "Cancel", onConfirm: () => {} });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void | Promise<void>, confirmText = "Delete") => {
    setConfirmModal({
      isOpen: true, title, message, confirmText, cancelText: "Cancel",
      onConfirm: async () => {
        try { await onConfirm(); } catch (e) { console.error(e); }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Process a successfully-obtained Google result (popup or redirect)
  const processGoogleResult = async (email: string | null | undefined) => {
    if (!email || email !== "ivanaffriandi@kakao.com") {
      setLoginError(`Access denied. Authorized accounts only.`);
      setLoading(false);
      return;
    }
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login-google", email })
    });
    const data = await res.json();
    if (data.success) {
      setIsAuthenticated(true);
      const list = await getAllQuestionsForAdmin();
      setAdminQuestions(list.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()));
    } else {
      setLoginError(data.error || "Server auth failed.");
    }
    setLoading(false);
  };

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Check existing session
        const res = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "check" }) });
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabParam = searchParams.get("tab");
  useEffect(() => {
    if (tabParam && ["inbox", "calendar", "comments", "moments", "books", "security"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [tabParam]);

  const handleTabChange = (tabId: typeof activeTab) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `/x?tab=${tabId}`);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      getAllCommentsForAdmin().then(setAdminComments).catch(err => console.error("Failed to load comments:", err));
      getAllQuestionsForAdmin().then(list => setAdminQuestions(list.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime()))).catch(err => console.error("Failed to load questions:", err));
      getAllMoments().then(setAdminMoments).catch(err => console.error("Failed to load moments:", err));
      getAllCalendarEvents().then(list => setAdminCalendarEvents(list.sort((a, b) => a.dateKey.localeCompare(b.dateKey)))).catch(err => console.error("Failed to load calendar:", err));
      getAllBooks().then(setAdminBooks).catch(err => console.error("Failed to load books:", err));
      loadBlockedIPs();
    }
  }, [isAuthenticated]);

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

  const handleBlockIP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIPToBlock.trim()) return;
    setIsSubmittingIP(true);
    setIpError("");
    try {
      const res = await fetch("/api/blocked-ips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: newIPToBlock, note: newIPNote })
      });
      if (res.ok) {
        setNewIPToBlock("");
        setNewIPNote("");
        loadBlockedIPs();
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
    if (!confirm("Are you sure you want to unblock this IP address?")) return;
    try {
      const res = await fetch(`/api/blocked-ips?id=${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        loadBlockedIPs();
      }
    } catch (err) {
      console.error("Failed to unblock IP:", err);
    }
  };

  useEffect(() => {
    if (!momentFile) { setMomentPreviewUrl(null); return; }
    const objectUrl = URL.createObjectURL(momentFile);
    setMomentPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [momentFile]);

  // ---- HANDLERS ----

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim() || !bookAuthor.trim()) return;
    setIsSubmittingBook(true);

    try {
      const bookData = {
        title: bookTitle.trim(),
        author: bookAuthor.trim(),
        coverUrl: bookCoverUrl.trim(),
        progress: bookProgress,
        status: bookStatus,
        review: bookReview.trim(),
        rating: bookRating,
        startedAt: editingBookId ? (adminBooks.find(b => b.id === editingBookId)?.startedAt || new Date().toISOString()) : new Date().toISOString(),
        completedAt: bookStatus === "completed" ? new Date().toISOString() : ""
      };

      if (editingBookId) {
        const success = await updateBook(editingBookId, bookData);
        if (success) {
          setAdminBooks(prev => prev.map(b => b.id === editingBookId ? { ...b, ...bookData } : b));
          router.refresh();
          alert("Book review and details updated successfully!");
        } else {
          alert("Failed to update book. Please try again.");
        }
      } else {
        const newBook = await addBook(bookData);
        if (newBook) {
          setAdminBooks(prev => [newBook, ...prev]);
          router.refresh();
          alert("New book added successfully!");
        } else {
          alert("Failed to add book. Please try again.");
        }
      }
      setShowBookModal(false);
      setEditingBookId(null);
    } catch (err) {
      console.error("Failed to save book:", err);
      alert("An error occurred while saving the book.");
    } finally {
      setIsSubmittingBook(false);
    }
  };

  const handleDeleteBook = (id: string) => {
    const book = adminBooks.find(b => b.id === id);
    triggerConfirm(
      "Delete Book",
      `Permanently delete "${book?.title ?? "this book"}"? This cannot be undone.`,
      async () => {
        const success = await deleteBook(id);
        if (success) {
          setAdminBooks(prev => prev.filter(b => b.id !== id));
          router.refresh();
          alert("Book deleted successfully!");
        } else {
          alert("Failed to delete book. Please try again.");
        }
      }
    );
  };

  const handleBookCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBookCover(true);
    try {
      const path = `books/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { url } = await uploadMomentPhoto(file, path);
      setBookCoverUrl(url);
    } catch (err) {
      console.error("Failed to upload book cover:", err);
      alert("Cover upload failed.");
    } finally {
      setIsUploadingBookCover(false);
    }
  };

  const handleReplyComment = async (id: string) => {
    if (!commentReplyText.trim()) return;
    const targetComment = adminComments.find(c => c.id === id);
    if (targetComment && !targetComment.approved) await approveComment(id);
    const success = await replyComment(id, commentReplyText.trim());
    if (success) {
      setAdminComments(prev => prev.map(c => c.id === id ? { ...c, approved: true, reply: commentReplyText.trim() } : c));
      setReplyingCommentId(null); setCommentReplyText("");
      router.refresh();
    }
  };

  const handleSaveCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calendarName.trim() || !calendarEmoji.trim()) return;
    const dateKey = `${calendarMonth.padStart(2, "0")}-${calendarDay.padStart(2, "0")}`;
    const eventPayload: Omit<CalendarEvent, "id"> = { dateKey, name: calendarName.trim(), emoji: calendarEmoji.trim(), type: calendarType };
    setIsSubmittingCalendar(true);
    try {
      if (editingEventId) {
        const success = await updateCalendarEvent(editingEventId, eventPayload);
        if (success) {
          setAdminCalendarEvents(prev => prev.map(ev => ev.id === editingEventId ? { ...ev, ...eventPayload } : ev).sort((a, b) => a.dateKey.localeCompare(b.dateKey)));
          setEditingEventId(null); setCalendarName("");
          router.refresh();
        }
      } else {
        const newEvent = await addCalendarEvent(eventPayload);
        setAdminCalendarEvents(prev => [...prev, newEvent].sort((a, b) => a.dateKey.localeCompare(b.dateKey)));
        setCalendarName("");
        router.refresh();
      }
    } catch (err) { console.error("Failed to save calendar event:", err); alert("Failed to save calendar event."); }
    finally { setIsSubmittingCalendar(false); }
  };

  const handleDeleteCalendarEvent = (id: string) => {
    triggerConfirm("Delete Event", "Permanently delete this calendar event?", async () => {
      const success = await deleteCalendarEvent(id);
      if (success) {
        setAdminCalendarEvents(prev => prev.filter(ev => ev.id !== id));
        router.refresh();
      }
    });
  };

  const handleGoogleLogin = async () => {
    setLoading(true); setLoginError("");
    try {
      const result = await signInWithGoogle();
      await processGoogleResult(result?.user?.email);
    } catch (error: any) {
      let errMsg = error?.message ?? "Sign-in failed. Check console for details.";
      if (errMsg.includes("auth/configuration-not-found")) {
        errMsg = "Google Sign-In is not enabled. Enable it in Firebase Console > Authentication > Sign-in method.";
      } else if (errMsg.includes("auth/popup-closed-by-user") || errMsg.includes("auth/cancelled-popup-request")) {
        errMsg = "Sign-in popup was closed. Please try again.";
      }
      setLoginError(errMsg);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
      setIsAuthenticated(false);
    } catch (err) { console.error(err); }
  };

  const handleAnswerQuestion = async (id: string) => {
    if (!answerText.trim()) return;
    const success = await answerQuestion(id, answerText.trim());
    if (success) {
      setAdminQuestions(prev => prev.map(q => q.id === id ? { ...q, answered: true, answer: answerText.trim(), answeredAt: new Date().toISOString() } : q));
      setAnsweringQuestionId(null); setAnswerText("");
      router.refresh();
    }
  };

  const handleDeleteQuestion = (id: string) => {
    triggerConfirm("Delete Question", "Permanently delete this question? This cannot be undone.", async () => {
      const success = await deleteQuestion(id);
      if (success) {
        setAdminQuestions(prev => prev.filter(q => q.id !== id));
        router.refresh();
      }
    });
  };

  const handleApproveComment = async (id: string) => {
    const success = await approveComment(id);
    if (success) {
      setAdminComments(prev => prev.map(c => c.id === id ? { ...c, approved: true } : c));
      router.refresh();
    }
  };

  const handleDeleteComment = (id: string) => {
    triggerConfirm("Delete Comment", "Permanently delete this comment from the database?", async () => {
      const success = await deleteComment(id);
      if (success) {
        setAdminComments(prev => prev.filter(c => c.id !== id));
        router.refresh();
      }
    });
  };

  const handleUploadMoment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!momentFile || !momentLocation || !momentDate) return;
    setIsUploadingMoment(true);
    try {
      const path = `moments/${Date.now()}_${momentFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const { url, storagePath } = await uploadMomentPhoto(momentFile, path);
      const newMoment = await addMoment({ url, storagePath, title: momentTitle || "Untitled", location: momentLocation, date: momentDate, story: momentStory });
      setAdminMoments(prev => [newMoment, ...prev]);
      setMomentFile(null); setMomentTitle(""); setMomentLocation(""); setMomentDate(""); setMomentStory("");
      router.refresh();
    } catch (err) { console.error("Failed to upload moment:", err); alert("Upload failed. See console."); }
    finally { setIsUploadingMoment(false); }
  };

  const handleDeleteMoment = (id: string, storagePath?: string) => {
    triggerConfirm("Delete Photo", "Permanently delete this photo from your moments gallery?", async () => {
      const success = await deleteMoment(id, storagePath);
      if (success) {
        setAdminMoments(prev => prev.filter(m => m.id !== id));
        router.refresh();
      }
    });
  };

  // NEW: Save edited moment metadata
  const handleSaveEditMoment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMomentId || !editMomentLocation.trim() || !editMomentDate.trim()) return;
    setIsSavingMoment(true);
    try {
      const updates: Partial<MomentItem> = {
        location: editMomentLocation.trim(),
        date: editMomentDate.trim(),
        title: editMomentTitle.trim() || "Untitled",
        story: editMomentStory.trim()
      };
      await updateMoment(editingMomentId, updates);
      setAdminMoments(prev => prev.map(m => m.id === editingMomentId ? { ...m, ...updates } : m));
      setShowEditMomentModal(false);
      setEditingMomentId(null);
      router.refresh();
    } catch (err) { console.error("Failed to update moment:", err); alert("Failed to save changes."); }
    finally { setIsSavingMoment(false); }
  };

  const handleSetHomepageSlot = async (momentId: string, slotStr: string) => {
    const slotVal = slotStr === "none" ? 0 : parseInt(slotStr);
    setAdminMoments(prev => prev.map(m => m.id === momentId ? { ...m, showOnHomepage: slotVal !== 0, homepageOrder: slotVal !== 0 ? slotVal : undefined } : m));
    try {
      await updateMoment(momentId, { showOnHomepage: slotVal !== 0, homepageOrder: slotVal !== 0 ? slotVal : undefined });
      router.refresh();
    } catch (err) { console.error("Failed to update homepage slot:", err); alert("Failed to update slot."); }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) setMomentFile(file); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) setMomentFile(file);
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

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1rem", backgroundColor: theme === "dark" ? "#141312" : "#FDFBF7", position: "relative" }}>
        {/* Global style injection to hide navigation header and footer on login page */}
        <style>{`
          header, footer {
            display: none !important;
          }
        `}</style>

        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: theme === "dark"
            ? "radial-gradient(circle at 25px 25px, rgba(255,255,255,0.02) 1.5%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255,255,255,0.02) 1.5%, transparent 0%)"
            : "radial-gradient(circle at 25px 25px, rgba(0,0,0,0.035) 1.5%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(0,0,0,0.035) 1.5%, transparent 0%)",
          backgroundSize: "100px 100px",
          zIndex: 0
        }} />

        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={iosSpring}
          style={{
            maxWidth: "320px",
            width: "100%",
            padding: "2rem 1.75rem",
            backgroundColor: theme === "dark" ? "rgba(28, 28, 30, 0.94)" : "rgba(255, 255, 255, 0.94)",
            backdropFilter: "blur(30px) saturate(190%)",
            WebkitBackdropFilter: "blur(30px) saturate(190%)",
            border: theme === "dark" ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(0, 0, 0, 0.08)",
            borderRadius: "24px",
            textAlign: "center",
            boxShadow: theme === "dark"
              ? "0 24px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)"
              : "0 20px 50px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
            zIndex: 1,
            fontFamily: iosFontStack
          }}
        >
          <div style={{
            display: "inline-flex",
            padding: "12px",
            borderRadius: "14px",
            backgroundColor: theme === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
            border: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
            marginBottom: "1.2rem",
            color: theme === "dark" ? "#ffffff" : "#000000"
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 style={{
            fontFamily: iosFontStack,
            fontSize: "1.2rem",
            fontWeight: "800",
            margin: "0 0 0.3rem 0",
            letterSpacing: "-0.02em",
            color: theme === "dark" ? "#ffffff" : "#000000"
          }}>
            Studio Vault
          </h1>
          <p style={{
            fontSize: "0.74rem",
            color: theme === "dark" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.55)",
            marginBottom: "1.6rem",
            fontWeight: "500",
            lineHeight: "1.4"
          }}>
            Authenticate to manage calendar, moments, comments, and replies.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <motion.button 
              type="button" 
              onClick={handleGoogleLogin} 
              whileHover={{ scale: 1.015, boxShadow: theme === "dark" ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 12px rgba(0,0,0,0.04)" }} 
              whileTap={{ scale: 0.985 }}
              style={{ 
                width: "100%", 
                padding: "11px 14px", 
                backgroundColor: theme === "dark" ? "rgba(255,255,255,0.07)" : "#ffffff", 
                color: theme === "dark" ? "#ffffff" : "#1f1f1f", 
                border: theme === "dark" ? "1px solid rgba(255,255,255,0.15)" : "1.5px solid rgba(150,150,150,0.22)", 
                borderRadius: "12px", 
                fontFamily: iosFontStack, 
                fontSize: "0.78rem", 
                fontWeight: "700", 
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: theme === "dark" ? "none" : "0 2px 4px rgba(0,0,0,0.02)",
                boxSizing: "border-box"
              }}
            >
              {/* Native Google Icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </motion.button>
            {loginError && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ fontSize: "0.68rem", color: "#ff453a", fontWeight: "600", marginTop: "6px", fontFamily: iosFontStack }}>⚠️ {loginError}</motion.div>}
          </div>
        </motion.div>
      </div>
    );
  }

  const pendingQuestionsCount = adminQuestions.filter(q => !q.answered).length;
  const pendingCommentsCount = adminComments.filter(c => !c.approved).length;
  const totalQuestions = adminQuestions.length;
  const totalComments = adminComments.length;
  const totalMoments = adminMoments.length;

  const today = new Date();
  const todayMM = String(today.getMonth() + 1).padStart(2, "0");
  const todayDD = String(today.getDate()).padStart(2, "0");
  const todayKey = `${todayMM}-${todayDD}`;
  const todayEventsCount = adminCalendarEvents.filter(ev => ev.dateKey === todayKey).length;
  const readingBooksCount = adminBooks.filter(b => b.status === "reading").length;

  const tabs = [
    {
      id: "inbox" as const, label: "Inbox", count: pendingQuestionsCount,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="5" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      )
    },
    {
      id: "calendar" as const, label: "Calendar", count: todayEventsCount,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="5" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      )
    },
    {
      id: "comments" as const, label: "Comments", count: pendingCommentsCount,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
        </svg>
      )
    },
    {
      id: "moments" as const, label: "Moments", count: totalMoments,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="6" />
          <circle cx="9" cy="9" r="2.5" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
      )
    },
    {
      id: "books" as const, label: "Books", count: readingBooksCount,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 0-2.5-2.5z" />
        </svg>
      )
    }
  ];

  const GlassCard = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div className="admin-glass-card" style={style}>{children}</div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg-color)", fontFamily: iosFontStack }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* === FORM INPUTS === */
        .admin-form-input {
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid rgba(150, 150, 150, 0.14);
          background: rgba(255, 255, 255, 0.55);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          color: var(--text-primary);
          font-size: 0.82rem;
          font-weight: 500;
          font-family: ${iosFontStack};
          outline: none;
          transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          width: 100%;
          box-sizing: border-box;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8);
        }
        .admin-form-input:focus {
          border-color: rgba(0, 122, 255, 0.55);
          background: rgba(255, 255, 255, 0.88);
          box-shadow: 0 0 0 3.5px rgba(0, 122, 255, 0.12), inset 0 1px 0 rgba(255,255,255,1);
        }
        @media (prefers-color-scheme: dark) {
          .admin-form-input {
            background: rgba(255, 255, 255, 0.07);
            border-color: rgba(255, 255, 255, 0.11);
            color: rgba(255, 255, 255, 0.92);
            box-shadow: 0 1px 3px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06);
          }
          .admin-form-input:focus {
            background: rgba(255, 255, 255, 0.12);
            border-color: rgba(0, 122, 255, 0.65);
            box-shadow: 0 0 0 3.5px rgba(0, 122, 255, 0.22), inset 0 1px 0 rgba(255,255,255,0.08);
          }
        }
        .custom-select {
          appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg fill='none' stroke='%238e8e93' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><polyline points='6 9 12 15 18 9'></polyline></svg>");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 10px;
          padding-right: 28px !important;
        }
        .admin-auto-textarea {
          field-sizing: content;
          min-height: 60px;
          max-height: 180px;
          resize: none;
          overflow-y: auto;
        }

        /* === GLASS CARD === */
        .admin-glass-card {
          padding: 14px 16px;
          border-radius: 18px;
          border: 1px solid rgba(0, 0, 0, 0.09);
          backdrop-filter: blur(24px) saturate(190%);
          -webkit-backdrop-filter: blur(24px) saturate(190%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.95), 0 6px 20px -2px rgba(0, 0, 0, 0.04);
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.52) 100%);
        }
        @media (prefers-color-scheme: dark) {
          .admin-glass-card {
            border-color: rgba(255, 255, 255, 0.14);
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 8px 32px -4px rgba(0, 0, 0, 0.35);
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%);
          }
        }

        /* === LAYOUT === */
        .admin-layout { display: flex; min-height: 100vh; }

        /* === SIDEBAR (Desktop only) === */
        .admin-sidebar {
          display: none;
          flex-direction: column;
          width: 240px;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
          padding: 1.5rem 0.75rem;
          border-right: 1px solid rgba(150, 150, 150, 0.08);
        }
        .sidebar-nav-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 12px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.18s ease;
          width: 100%;
          text-align: left;
          font-family: ${iosFontStack};
        }
        .sidebar-nav-btn:hover { background: rgba(150,150,150,0.06); }

        /* === MAIN CONTENT === */
        .admin-main { flex: 1; overflow-y: auto; min-width: 0; }
        .admin-main-inner {
          max-width: 680px;
          margin: 0 auto;
          padding: 1.5rem 1.2rem 7rem 1.2rem;
        }

        /* === GLOBAL FOOTER HIDING === */
        .yunox-single-footer {
          display: none !important;
        }

        /* === BOTTOM BAR (Floating Pillbar) - always visible === */
        .admin-bottom-bar {
          display: flex;
          position: fixed;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 40px);
          max-width: 320px;
          height: 50px;
          z-index: 99999;
          border-radius: 25px;
          overflow: visible;
          padding: 0 4px;
          align-items: center;
          box-sizing: border-box;
        }
        .bottom-nav-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          height: 42px;
          border-radius: 21px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-family: ${iosFontStack};
          transition: color 0.2s ease;
          position: relative;
          z-index: 1;
        }
        .bottom-nav-btn:active {
          transform: scale(0.93);
          transition: transform 0.1s ease;
        }

        /* === RESPONSIVE BREAKPOINTS === */
        @media (min-width: 768px) {
          .admin-sidebar { display: none !important; }
          .admin-main-inner {
            padding: 2rem 2rem 7rem 2rem;
            max-width: 680px;
          }
        }
      `}</style>

      <div className="admin-layout" style={{ justifyContent: "center" }}>
        {/* ===== MAIN CONTENT ===== */}
        <main className="admin-main">
          <div className="admin-main-inner">

            {/* Active section title */}
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={iosSpring} style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.03em", margin: 0 }}>
                {tabs.find(t => t.id === activeTab)?.label || "Security"}
              </h2>
            </motion.div>

            {/* ===== CONTENT PANELS ===== */}
            <AnimatePresence mode="wait">

              {/* ---- INBOX ---- */}
              {activeTab === "inbox" && (
                <motion.div key="inbox" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "8px" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>Anonymous Q&A</span>
                    <div style={{ display: "flex", gap: "2px", backgroundColor: "rgba(150,150,150,0.05)", border: "1px solid rgba(150,150,150,0.06)", padding: "2px", borderRadius: "10px" }}>
                      {(["pending", "answered", "all"] as const).map(filter => (
                        <button key={filter} onClick={() => setInboxFilter(filter)} style={{ padding: "3px 10px", fontSize: "0.6rem", fontWeight: "750", borderRadius: "7px", border: "none", cursor: "pointer", backgroundColor: inboxFilter === filter ? "var(--text-primary)" : "transparent", color: inboxFilter === filter ? "var(--bg-color)" : "var(--text-secondary)", transition: "all 0.15s ease", fontFamily: iosFontStack, textTransform: "capitalize" }}>{filter}</button>
                      ))}
                    </div>
                  </div>
                  <motion.div variants={staggerContainer} initial="initial" animate="animate" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {filteredQuestions.length > 0 ? filteredQuestions.map(q => (
                      <motion.div key={q.id} variants={fadeRise} layoutId={`qcard-${q.id}`} className="admin-glass-card">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "0.6rem", color: "#FF9500", fontWeight: "700" }}>{new Date(q.published).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                            <span style={{ fontSize: "0.55rem", fontWeight: "800", backgroundColor: q.answered ? "rgba(52,199,89,0.08)" : "rgba(255,149,0,0.08)", color: q.answered ? "#34C759" : "#FF9500", border: q.answered ? "0.5px solid rgba(52,199,89,0.18)" : "0.5px solid rgba(255,149,0,0.18)", padding: "2px 6px", borderRadius: "6px" }}>{q.answered ? "Answered" : "New"}</span>
                          </div>
                          <motion.button whileHover={{ scale: 1.1, color: "#ef4444" }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteQuestion(q.id)} style={{ width: "22px", height: "22px", backgroundColor: "transparent", border: "none", borderRadius: "50%", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </motion.button>
                        </div>
                        <p style={{ margin: "0 0 8px 0", fontSize: "0.84rem", color: "var(--text-primary)", lineHeight: "1.45", fontWeight: "600", letterSpacing: "-0.01em" }}>"{q.content}"</p>
                        {(q.name || q.ip || q.location || q.device) && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "10px" }}>
                            {q.name && <span style={{ fontSize: "0.6rem", fontWeight: "600", backgroundColor: theme === "dark" ? "rgba(10,132,255,0.15)" : "rgba(0,122,255,0.06)", color: theme === "dark" ? "#64D2FF" : "#007AFF", border: `0.5px solid ${theme === "dark" ? "rgba(10,132,255,0.3)" : "rgba(0,122,255,0.14)"}`, padding: "2px 6px", borderRadius: "6px" }}>👤 {q.name}</span>}
                            {q.ip && <span style={{ fontSize: "0.6rem", fontWeight: "600", backgroundColor: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(142,142,147,0.07)", color: "var(--text-secondary)", border: `0.5px solid ${theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(142,142,147,0.15)"}`, padding: "2px 6px", borderRadius: "6px" }}>🌐 {q.ip}</span>}
                            {q.location && <span style={{ fontSize: "0.6rem", fontWeight: "600", backgroundColor: theme === "dark" ? "rgba(48,209,88,0.15)" : "rgba(52,199,89,0.06)", color: theme === "dark" ? "#30D158" : "#34C759", border: `0.5px solid ${theme === "dark" ? "rgba(48,209,88,0.3)" : "rgba(52,199,89,0.14)"}`, padding: "2px 6px", borderRadius: "6px" }}>📍 {q.location}</span>}
                            {q.device && <span style={{ fontSize: "0.6rem", fontWeight: "600", backgroundColor: theme === "dark" ? "rgba(191,90,242,0.15)" : "rgba(175,82,222,0.06)", color: theme === "dark" ? "#BF5AF2" : "#AF52DE", border: `0.5px solid ${theme === "dark" ? "rgba(191,90,242,0.3)" : "rgba(175,82,222,0.14)"}`, padding: "2px 6px", borderRadius: "6px" }}>📱 {q.device}</span>}
                          </div>
                        )}
                        {/* AI Chat History log (if it exists for this question) */}
                        {q.chatHistory && Array.isArray(q.chatHistory) && q.chatHistory.length > 0 && (
                          <div style={{
                            marginTop: "8px",
                            marginBottom: "8px",
                            padding: "10px",
                            backgroundColor: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                            border: theme === "dark" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
                            borderRadius: "12px",
                          }}>
                            <span style={{ fontSize: "0.58rem", fontWeight: "800", color: "var(--text-secondary)", textTransform: "uppercase", display: "block", marginBottom: "6px", letterSpacing: "0.03em" }}>
                              💬 AI Chat Log Session
                            </span>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "150px", overflowY: "auto", paddingRight: "4px" }}>
                              {q.chatHistory.map((chat: any, cIdx: number) => {
                                const isAI = chat.role === "model" || chat.role === "assistant";
                                return (
                                  <div key={cIdx} style={{ fontSize: "0.7rem", lineHeight: "1.4" }}>
                                    <strong style={{ color: isAI ? "#007AFF" : "var(--text-primary)" }}>
                                      {isAI ? "AI: " : "User: "}
                                    </strong>
                                    <span style={{ color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>{chat.content}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        {q.answered && q.answer && (
                          <div style={{ padding: "10px 12px", backgroundColor: "rgba(0,0,0,0.02)", borderRadius: "12px", border: "1px solid rgba(150,150,150,0.06)", marginTop: "8px" }}>
                            <span style={{ fontSize: "0.55rem", fontWeight: "800", color: "#10b981", letterSpacing: "0.03em", display: "block", marginBottom: "4px" }}>Reply from Ivan</span>
                            <p style={{ margin: "0 0 8px 0", fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: "1.4", fontWeight: "500" }}>{q.answer}</p>
                            {answeringQuestionId !== q.id && (
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setAnsweringQuestionId(q.id); setAnswerText(q.answer || ""); }} style={{ padding: "4px 8px", backgroundColor: "transparent", border: "1px solid rgba(150,150,150,0.15)", borderRadius: "14px", color: "var(--text-primary)", fontSize: "0.62rem", fontWeight: "750", cursor: "pointer", fontFamily: iosFontStack }}>Edit Reply</motion.button>
                            )}
                          </div>
                        )}
                        {!q.answered && answeringQuestionId !== q.id && (
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setAnsweringQuestionId(q.id); setAnswerText(""); }} style={{ padding: "5px 12px", marginTop: "2px", backgroundColor: "rgba(150,150,150,0.04)", border: "1px solid rgba(150,150,150,0.08)", borderRadius: "20px", color: "var(--text-primary)", fontSize: "0.65rem", fontWeight: "750", cursor: "pointer", fontFamily: iosFontStack }}>Reply anonymously</motion.button>
                        )}
                        {answeringQuestionId === q.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px", overflow: "hidden" }}>
                            <div style={{ backgroundColor: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: "12px", padding: "8px 12px", border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(150,150,150,0.08)"}` }}>
                              <textarea placeholder="Write your answer… (⌘↵ to publish)" value={answerText} onChange={(e) => setAnswerText(e.target.value)} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); if (answerText.trim()) handleAnswerQuestion(q.id); } }} className="admin-auto-textarea" style={{ width: "100%", border: "none", backgroundColor: "transparent", color: "var(--text-primary)", fontFamily: iosFontStack, fontSize: "0.78rem", lineHeight: "1.45", outline: "none", fontWeight: "500" }} />
                            </div>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <motion.button whileHover={answerText.trim() ? { scale: 1.02 } : {}} whileTap={answerText.trim() ? { scale: 0.98 } : {}} onClick={() => handleAnswerQuestion(q.id)} disabled={!answerText.trim()} style={{ padding: "5px 12px", backgroundColor: "var(--text-primary)", color: "var(--bg-color)", border: "none", borderRadius: "20px", fontSize: "0.65rem", fontWeight: "750", cursor: answerText.trim() ? "pointer" : "not-allowed", opacity: answerText.trim() ? 1 : 0.4, fontFamily: iosFontStack }}>Publish Reply</motion.button>
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setAnsweringQuestionId(null)} style={{ padding: "5px 12px", backgroundColor: "rgba(150,150,150,0.05)", border: "1px solid rgba(150,150,150,0.1)", borderRadius: "20px", color: "var(--text-secondary)", fontSize: "0.65rem", fontWeight: "750", cursor: "pointer", fontFamily: iosFontStack }}>Cancel</motion.button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )) : (
                      <div style={{ padding: "3rem 1rem", textAlign: "center", border: "1px dashed rgba(150,150,150,0.12)", borderRadius: "16px" }}>
                        <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: "750", color: "var(--text-primary)" }}>Empty Inbox</p>
                        <p style={{ margin: "2px 0 0", fontSize: "0.68rem", color: "var(--text-secondary)" }}>{inboxFilter === "pending" ? "All questions answered!" : "No items found."}</p>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {/* ---- CALENDAR ---- */}
              {activeTab === "calendar" && (
                <motion.div key="calendar" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>Dynamic Date Events</span>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => { setEditingEventId(null); setCalendarName(""); setCalendarEmoji("🎂"); setCalendarType("ivan"); setShowCalendarModal(true); }} style={{ padding: "6px 14px", backgroundColor: "var(--text-primary)", color: "var(--bg-color)", border: "none", borderRadius: "20px", fontSize: "0.68rem", fontWeight: "750", cursor: "pointer", fontFamily: iosFontStack, display: "flex", alignItems: "center", gap: "4px" }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Add Event
                    </motion.button>
                  </div>

                  <GlassModal isOpen={!!(showCalendarModal || editingEventId)} onClose={() => { setShowCalendarModal(false); setEditingEventId(null); }} theme={theme}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>{editingEventId ? "Edit Event" : "New Calendar Event"}</h3>
                      <button onClick={() => { setShowCalendarModal(false); setEditingEventId(null); }} style={{ width: "26px", height: "26px", borderRadius: "50%", border: "none", background: "rgba(150,150,150,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                    <form onSubmit={async (e) => { await handleSaveCalendarEvent(e); setShowCalendarModal(false); setEditingEventId(null); }} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Month</label>
                          <select value={calendarMonth} onChange={(e) => setCalendarMonth(e.target.value)} className="admin-form-input custom-select">
                            {Array.from({ length: 12 }).map((_, i) => { const mVal = String(i + 1).padStart(2, "0"); return <option key={mVal} value={mVal}>{new Date(2026, i, 1).toLocaleDateString("en-US", { month: "long" })}</option>; })}
                          </select>
                        </div>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Day</label>
                          <select value={calendarDay} onChange={(e) => setCalendarDay(e.target.value)} className="admin-form-input custom-select">
                            {Array.from({ length: 31 }).map((_, i) => { const dVal = String(i + 1).padStart(2, "0"); return <option key={dVal} value={dVal}>{i + 1}</option>; })}
                          </select>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Event Title</label>
                        <input className="admin-form-input" type="text" placeholder="e.g. Vera's Birthday" value={calendarName} onChange={(e) => setCalendarName(e.target.value)} required autoFocus />
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Theme</label>
                          <select value={calendarType} onChange={(e) => setCalendarType(e.target.value as any)} className="admin-form-input custom-select">
                            <option value="ivan">👑 Ivan&apos;s Birthday</option>
                            <option value="female">🌸 Pink (Female)</option>
                            <option value="male">🔹 Blue (Male)</option>
                            <option value="both">🟣 Purple (Joint)</option>
                            <option value="idul_fitri">🌙 Idul Fitri</option>
                            <option value="idul_adha">🐏 Idul Adha</option>
                            <option value="christmas">🎄 Christmas</option>
                            <option value="chinese_new_year">🏮 Lunar New Year</option>
                            <option value="nyepi">🌌 Nyepi</option>
                            <option value="waisak">🪷 Waisak</option>
                            <option value="general_holiday">🔸 General Holiday</option>
                          </select>
                        </div>
                        <div style={{ width: "80px", display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Emoji</label>
                          <input className="admin-form-input" type="text" value={calendarEmoji} onChange={(e) => setCalendarEmoji(e.target.value)} style={{ textAlign: "center" }} required />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {["🎂", "👑", "🎄", "🌙", "🏮", "🧘", "🎉", "🇮🇩", "🪷", "🌸", "💙", "💖"].map(emoji => (
                          <button key={emoji} type="button" onClick={() => setCalendarEmoji(emoji)} style={{ padding: "4px 7px", fontSize: "0.65rem", backgroundColor: calendarEmoji === emoji ? "rgba(150,150,150,0.12)" : "rgba(150,150,150,0.03)", border: calendarEmoji === emoji ? "1px solid rgba(150,150,150,0.22)" : "1px solid rgba(150,150,150,0.06)", borderRadius: "8px", cursor: "pointer", fontFamily: iosFontStack }}>{emoji}</button>
                        ))}
                      </div>
                      <motion.button type="submit" disabled={isSubmittingCalendar || !calendarName.trim()} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} style={{ padding: "11px", backgroundColor: "var(--text-primary)", color: "var(--bg-color)", border: "none", borderRadius: "30px", fontSize: "0.78rem", fontWeight: "800", cursor: "pointer", fontFamily: iosFontStack, marginTop: "4px" }}>
                        {isSubmittingCalendar ? "Saving…" : (editingEventId ? "Save Updates" : "Add Event")}
                      </motion.button>
                    </form>
                  </GlassModal>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {adminCalendarEvents.length > 0 ? adminCalendarEvents.map(event => {
                      const monthName = new Date(2026, parseInt(event.dateKey.split("-")[0]) - 1, 1).toLocaleDateString("en-US", { month: "short" });
                      const dayNum = parseInt(event.dateKey.split("-")[1]);
                      const bubbleBg = event.type === "female" ? "rgba(255,92,157,0.08)" : event.type === "ivan" ? "rgba(0,122,255,0.08)" : event.type === "both" ? "rgba(168,85,247,0.08)" : "rgba(180,122,62,0.08)";
                      const bubbleBorder = event.type === "female" ? "rgba(255,92,157,0.15)" : event.type === "ivan" ? "rgba(0,122,255,0.15)" : event.type === "both" ? "rgba(168,85,247,0.15)" : "rgba(180,122,62,0.15)";
                      return (
                        <motion.div key={event.id} layoutId={`evcard-${event.id}`} className="admin-glass-card" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px" }}>
                          <div style={{ width: "36px", height: "36px", backgroundColor: bubbleBg, border: `1px solid ${bubbleBorder}`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>{event.emoji}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.82rem", fontWeight: "750", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{event.name}</div>
                            <div style={{ fontSize: "0.64rem", color: "var(--text-secondary)", fontWeight: "500" }}>Active every {monthName} {dayNum}.</div>
                          </div>
                          <div style={{ display: "flex", gap: "4px", alignItems: "center", flexShrink: 0 }}>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setEditingEventId(event.id); const parts = event.dateKey.split("-"); setCalendarMonth(parts[0]); setCalendarDay(parts[1]); setCalendarName(event.name); setCalendarEmoji(event.emoji); setCalendarType(event.type); setShowCalendarModal(true); }} style={{ width: "28px", height: "28px", backgroundColor: "rgba(150,150,150,0.03)", border: "1px solid rgba(150,150,150,0.08)", borderRadius: "50%", color: "var(--text-primary)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleDeleteCalendarEvent(event.id)} style={{ width: "28px", height: "28px", backgroundColor: "rgba(239,68,68,0.03)", border: "none", borderRadius: "50%", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    }) : (
                      <div style={{ padding: "3rem 1rem", textAlign: "center", border: "1px dashed rgba(150,150,150,0.12)", borderRadius: "16px" }}>
                        <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: "750", color: "var(--text-primary)" }}>Empty Schedule</p>
                        <p style={{ margin: "2px 0 0", fontSize: "0.68rem", color: "var(--text-secondary)" }}>Add custom dates and themes above.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ---- COMMENTS ---- */}
              {activeTab === "comments" && (
                <motion.div key="comments" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
                  <div style={{ marginBottom: "1rem" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>Reader Comments</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {adminComments.length > 0 ? adminComments.map(comment => (
                      <motion.div key={comment.id} layoutId={`ccard-${comment.id}`} className="admin-glass-card" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--text-primary)" }}>{comment.author.displayName}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "0.6rem", color: "#B47A3E", fontWeight: "700" }}>commented {new Date(comment.published).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                              <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>•</span>
                              <a href={`/blog/${comment.postId}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.64rem", color: "var(--text-secondary)", textDecoration: "underline", textUnderlineOffset: "2px", fontWeight: "700" }}>{(comment as any).postTitle || comment.postId}</a>
                            </div>
                          </div>
                          {!comment.approved ? (
                            <span style={{ fontSize: "0.5rem", fontWeight: "800", backgroundColor: "rgba(180,122,62,0.06)", color: "#B47A3E", border: "1px solid rgba(180,122,62,0.12)", padding: "1px 6px", borderRadius: "6px", flexShrink: 0 }}>Pending</span>
                          ) : (
                            <span style={{ fontSize: "0.5rem", fontWeight: "800", backgroundColor: "rgba(16,185,129,0.06)", color: "#10b981", border: "1px solid rgba(16,185,129,0.12)", padding: "1px 6px", borderRadius: "6px", flexShrink: 0 }}>Approved</span>
                          )}
                        </div>
                        <div style={{ padding: "8px 10px", backgroundColor: "rgba(0,0,0,0.015)", border: "1px solid rgba(150,150,150,0.05)", borderRadius: "10px" }}>
                          <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--text-primary)", lineHeight: "1.4", fontWeight: "500" }}>{comment.content}</p>
                        </div>
                        {comment.reply && (
                          <div style={{ padding: "8px 10px", backgroundColor: "rgba(180,122,62,0.04)", border: "1px solid rgba(180,122,62,0.08)", borderRadius: "10px" }}>
                            <span style={{ fontSize: "0.55rem", fontWeight: "800", color: "#B47A3E", letterSpacing: "0.03em", display: "block", marginBottom: "2px" }}>Reply from Ivan</span>
                            <p style={{ margin: 0, fontSize: "0.74rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>{comment.reply}</p>
                          </div>
                        )}
                        <div style={{ display: "flex", gap: "4px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                          {!comment.reply && replyingCommentId !== comment.id && (
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setReplyingCommentId(comment.id); setCommentReplyText(""); }} style={{ padding: "4px 10px", backgroundColor: "rgba(150,150,150,0.05)", border: "1px solid rgba(150,150,150,0.12)", borderRadius: "20px", color: "var(--text-primary)", fontSize: "0.62rem", fontWeight: "750", cursor: "pointer", fontFamily: iosFontStack }}>Reply</motion.button>
                          )}
                          {comment.reply && replyingCommentId !== comment.id && (
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setReplyingCommentId(comment.id); setCommentReplyText(comment.reply || ""); }} style={{ padding: "4px 10px", backgroundColor: "rgba(150,150,150,0.05)", border: "1px solid rgba(150,150,150,0.12)", borderRadius: "20px", color: "var(--text-primary)", fontSize: "0.62rem", fontWeight: "750", cursor: "pointer", fontFamily: iosFontStack }}>Edit Reply</motion.button>
                          )}
                          {!comment.approved && (
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleApproveComment(comment.id)} style={{ padding: "4px 10px", backgroundColor: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)", borderRadius: "20px", color: "#10b981", fontSize: "0.62rem", fontWeight: "750", cursor: "pointer", fontFamily: iosFontStack }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#10b981"; e.currentTarget.style.color = "#fff"; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "rgba(16,185,129,0.06)"; e.currentTarget.style.color = "#10b981"; }}>Approve</motion.button>
                          )}
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleDeleteComment(comment.id)} style={{ padding: "4px 10px", backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: "20px", color: "#ef4444", fontSize: "0.62rem", fontWeight: "750", cursor: "pointer", fontFamily: iosFontStack }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = "#ef4444"; e.currentTarget.style.color = "#fff"; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.06)"; e.currentTarget.style.color = "#ef4444"; }}>Delete</motion.button>
                        </div>
                        {replyingCommentId === comment.id && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} style={{ width: "100%", display: "flex", flexDirection: "column", gap: "6px", overflow: "hidden" }}>
                            <div style={{ backgroundColor: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: "12px", padding: "8px 12px", border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(150,150,150,0.08)"}` }}>
                              <textarea placeholder="Write your reply… (⌘↵ to publish)" value={commentReplyText} onChange={(e) => setCommentReplyText(e.target.value)} onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); if (commentReplyText.trim()) handleReplyComment(comment.id); } }} className="admin-auto-textarea" style={{ width: "100%", border: "none", backgroundColor: "transparent", color: "var(--text-primary)", fontFamily: iosFontStack, fontSize: "0.78rem", lineHeight: "1.45", outline: "none", fontWeight: "500" }} />
                            </div>
                            <div style={{ display: "flex", gap: "4px" }}>
                              <motion.button whileHover={commentReplyText.trim() ? { scale: 1.02 } : {}} whileTap={commentReplyText.trim() ? { scale: 0.98 } : {}} onClick={() => handleReplyComment(comment.id)} disabled={!commentReplyText.trim()} style={{ padding: "5px 12px", backgroundColor: "var(--text-primary)", color: "var(--bg-color)", border: "none", borderRadius: "20px", fontSize: "0.65rem", fontWeight: "750", cursor: commentReplyText.trim() ? "pointer" : "not-allowed", opacity: commentReplyText.trim() ? 1 : 0.4, fontFamily: iosFontStack }}>Publish Reply</motion.button>
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setReplyingCommentId(null)} style={{ padding: "5px 12px", backgroundColor: "rgba(150,150,150,0.05)", border: "1px solid rgba(150,150,150,0.1)", borderRadius: "20px", color: "var(--text-secondary)", fontSize: "0.65rem", fontWeight: "750", cursor: "pointer", fontFamily: iosFontStack }}>Cancel</motion.button>
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    )) : (
                      <div style={{ padding: "3rem 1rem", textAlign: "center", border: "1px dashed rgba(150,150,150,0.12)", borderRadius: "16px" }}>
                        <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: "750", color: "var(--text-primary)" }}>No Comments</p>
                        <p style={{ margin: "2px 0 0", fontSize: "0.68rem", color: "var(--text-secondary)" }}>Reader comments will show up here.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ---- MOMENTS ---- */}
              {activeTab === "moments" && (
                <motion.div key="moments" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>Photo Gallery</span>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => { setMomentFile(null); setMomentTitle(""); setMomentLocation(""); setMomentDate(""); setMomentStory(""); setShowMomentModal(true); }} style={{ padding: "6px 14px", backgroundColor: "var(--text-primary)", color: "var(--bg-color)", border: "none", borderRadius: "20px", fontSize: "0.68rem", fontWeight: "750", cursor: "pointer", fontFamily: iosFontStack, display: "flex", alignItems: "center", gap: "4px" }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Upload
                    </motion.button>
                  </div>

                  {/* Upload Modal */}
                  <GlassModal isOpen={showMomentModal} onClose={() => setShowMomentModal(false)} theme={theme}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>Upload New Moment</h3>
                      <button type="button" onClick={() => setShowMomentModal(false)} style={{ width: "26px", height: "26px", borderRadius: "50%", border: "none", background: "rgba(150,150,150,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                    <form onSubmit={async (e) => { await handleUploadMoment(e); setShowMomentModal(false); }} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                      <div onClick={triggerFileSelect} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} style={{ border: isDragOver ? "1.5px dashed var(--text-primary)" : "1.5px dashed rgba(150,150,150,0.25)", borderRadius: "14px", padding: "14px", textAlign: "center", cursor: "pointer", backgroundColor: isDragOver ? "rgba(150,150,150,0.04)" : (momentPreviewUrl ? "rgba(0,0,0,0.005)" : "transparent"), transition: "all 0.15s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                        {momentPreviewUrl ? (
                          <>
                            <div style={{ width: "52px", height: "52px", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(150,150,150,0.15)", flexShrink: 0 }}>
                              <img src={momentPreviewUrl} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            </div>
                            <div style={{ flex: 1, textAlign: "left" }}>
                              <div style={{ fontSize: "0.7rem", fontWeight: "700", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>{momentFile?.name}</div>
                              <div style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>{momentFile ? `${(momentFile.size / (1024 * 1024)).toFixed(2)} MB` : ""}</div>
                            </div>
                            <motion.button type="button" onClick={(e) => { e.stopPropagation(); setMomentFile(null); }} style={{ padding: "2px 8px", backgroundColor: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: "12px", color: "#ef4444", fontSize: "0.55rem", fontWeight: "750", cursor: "pointer", fontFamily: iosFontStack }} whileTap={{ scale: 0.96 }}>Remove</motion.button>
                          </>
                        ) : (
                          <div style={{ padding: "8px 0" }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "var(--text-primary)" }}>Tap to choose photo</div>
                            <div style={{ fontSize: "0.62rem", color: "var(--text-secondary)", marginTop: "2px" }}>or drag & drop here</div>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Location <span style={{ color: "#ef4444" }}>*</span></label>
                        <input className="admin-form-input" type="text" placeholder="e.g. Rome, Italy" value={momentLocation} onChange={(e) => setMomentLocation(e.target.value)} required />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Date <span style={{ color: "#ef4444" }}>*</span></label>
                        <input className="admin-form-input" type="text" placeholder="e.g. May 2026" value={momentDate} onChange={(e) => setMomentDate(e.target.value)} required />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Title (optional)</label>
                        <input className="admin-form-input" type="text" placeholder="A short title" value={momentTitle} onChange={(e) => setMomentTitle(e.target.value)} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Story (optional)</label>
                        <textarea className="admin-form-input admin-auto-textarea" placeholder="Share a memory…" value={momentStory} onChange={(e) => setMomentStory(e.target.value)} style={{ minHeight: "60px", resize: "none" }} />
                      </div>
                      <motion.button type="submit" disabled={isUploadingMoment || !momentFile || !momentLocation || !momentDate}
                        whileHover={(!isUploadingMoment && momentFile && momentLocation && momentDate) ? { scale: 1.01 } : {}}
                        whileTap={(!isUploadingMoment && momentFile && momentLocation && momentDate) ? { scale: 0.99 } : {}}
                        style={{ padding: "11px", backgroundColor: "var(--text-primary)", color: "var(--bg-color)", border: "none", borderRadius: "30px", fontSize: "0.78rem", fontWeight: "800", cursor: (isUploadingMoment || !momentFile || !momentLocation || !momentDate) ? "not-allowed" : "pointer", opacity: (isUploadingMoment || !momentFile || !momentLocation || !momentDate) ? 0.4 : 1, fontFamily: iosFontStack, marginTop: "4px" }}>
                        {isUploadingMoment ? "Uploading…" : "Publish to Gallery"}
                      </motion.button>
                    </form>
                  </GlassModal>

                  {/* ===== EDIT MOMENT MODAL (NEW) ===== */}
                  <GlassModal isOpen={showEditMomentModal} onClose={() => { setShowEditMomentModal(false); setEditingMomentId(null); }} theme={theme}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>Edit Moment</h3>
                      <button type="button" onClick={() => { setShowEditMomentModal(false); setEditingMomentId(null); }} style={{ width: "26px", height: "26px", borderRadius: "50%", border: "none", background: "rgba(150,150,150,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>

                    {/* Photo preview in edit modal */}
                    {editingMomentId && (() => {
                      const m = adminMoments.find(m => m.id === editingMomentId);
                      return m ? (
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", padding: "10px 12px", backgroundColor: "rgba(150,150,150,0.04)", borderRadius: "12px", border: "1px solid rgba(150,150,150,0.08)", marginBottom: "14px" }}>
                          <div style={{ width: "52px", height: "52px", borderRadius: "10px", overflow: "hidden", flexShrink: 0, border: "1px solid rgba(150,150,150,0.15)" }}>
                            <img src={m.url} alt="moment" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                          <div>
                            <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-primary)" }}>Editing photo</div>
                            <div style={{ fontSize: "0.62rem", color: "var(--text-secondary)" }}>Fields below will be updated</div>
                          </div>
                        </div>
                      ) : null;
                    })()}

                    <form onSubmit={handleSaveEditMoment} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Location <span style={{ color: "#ef4444" }}>*</span></label>
                        <input className="admin-form-input" type="text" placeholder="e.g. Rome, Italy" value={editMomentLocation} onChange={(e) => setEditMomentLocation(e.target.value)} required autoFocus />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Date <span style={{ color: "#ef4444" }}>*</span></label>
                        <input className="admin-form-input" type="text" placeholder="e.g. May 2026" value={editMomentDate} onChange={(e) => setEditMomentDate(e.target.value)} required />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Title</label>
                        <input className="admin-form-input" type="text" placeholder="A short title" value={editMomentTitle} onChange={(e) => setEditMomentTitle(e.target.value)} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Story / Caption</label>
                        <textarea className="admin-form-input admin-auto-textarea" placeholder="Share a memory…" value={editMomentStory} onChange={(e) => setEditMomentStory(e.target.value)} style={{ minHeight: "60px", resize: "none" }} />
                      </div>
                      <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                        <motion.button type="submit" disabled={isSavingMoment || !editMomentLocation.trim() || !editMomentDate.trim()}
                          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          style={{ flex: 1, padding: "11px", backgroundColor: "var(--text-primary)", color: "var(--bg-color)", border: "none", borderRadius: "30px", fontSize: "0.78rem", fontWeight: "800", cursor: "pointer", fontFamily: iosFontStack, opacity: (isSavingMoment || !editMomentLocation.trim() || !editMomentDate.trim()) ? 0.4 : 1 }}>
                          {isSavingMoment ? "Saving…" : "Save Changes"}
                        </motion.button>
                        <motion.button type="button" onClick={() => { setShowEditMomentModal(false); setEditingMomentId(null); }}
                          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          style={{ padding: "11px 16px", backgroundColor: "rgba(150,150,150,0.05)", border: "1px solid rgba(150,150,150,0.12)", borderRadius: "30px", fontSize: "0.78rem", fontWeight: "700", cursor: "pointer", fontFamily: iosFontStack, color: "var(--text-secondary)" }}>
                          Cancel
                        </motion.button>
                      </div>
                    </form>
                  </GlassModal>

                  {/* Gallery List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ fontSize: "0.72rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "0.02em", marginBottom: "4px" }}>Gallery List</div>
                    {adminMoments.length > 0 ? adminMoments.map(moment => (
                      <motion.div key={moment.id} layoutId={`mcard-${moment.id}`} className="admin-glass-card" style={{ display: "flex", gap: "12px", alignItems: "center", padding: "10px 12px" }}>
                        {/* Thumbnail */}
                        <div style={{ position: "relative", width: "56px", height: "56px", borderRadius: "10px", overflow: "hidden", border: moment.homepageOrder !== undefined ? "2px solid #B47A3E" : `1px solid ${theme === "dark" ? "rgba(255,255,255,0.15)" : "rgba(150,150,150,0.12)"}`, boxShadow: moment.homepageOrder !== undefined ? "0 0 8px rgba(180,122,98,0.3)" : "none", flexShrink: 0 }}>
                          <img src={moment.url} alt="moment thumbnail" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: "0.8rem", fontWeight: "800", color: "var(--text-primary)", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>📍 {moment.location}</span>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-secondary)", fontWeight: "500", display: "block" }}>{moment.date}</span>
                          {moment.title && moment.title !== "Untitled" && <span style={{ fontSize: "0.6rem", color: "var(--text-secondary)", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontStyle: "italic" }}>{moment.title}</span>}
                        </div>
                        {/* Homepage Slot */}
                        <select value={moment.homepageOrder !== undefined ? String(moment.homepageOrder) : "none"} onChange={(e) => handleSetHomepageSlot(moment.id, e.target.value)} className="custom-select" style={{ padding: "5px 8px", borderRadius: "8px", border: "1px solid rgba(150,150,150,0.18)", backgroundColor: moment.homepageOrder !== undefined ? "var(--text-primary)" : "rgba(150,150,150,0.04)", color: moment.homepageOrder !== undefined ? "var(--bg-color)" : "var(--text-primary)", fontSize: "0.62rem", fontWeight: "800", outline: "none", cursor: "pointer", fontFamily: iosFontStack, flexShrink: 0 }}>
                          <option value="none">Off Home</option>
                          {[1,2,3,4,5,6,7,8,9].map(num => <option key={num} value={String(num)}>Slot {num}</option>)}
                        </select>
                        {/* Edit Button (NEW) */}
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => { setEditingMomentId(moment.id); setEditMomentLocation(moment.location); setEditMomentDate(moment.date); setEditMomentTitle(moment.title || ""); setEditMomentStory(moment.story || ""); setShowEditMomentModal(true); }} style={{ width: "28px", height: "28px", backgroundColor: "rgba(0,122,255,0.05)", border: "1px solid rgba(0,122,255,0.14)", borderRadius: "50%", color: "#007AFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} title="Edit Moment">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </motion.button>
                        {/* Delete Button */}
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteMoment(moment.id, moment.storagePath)} style={{ width: "28px", height: "28px", backgroundColor: "rgba(239,68,68,0.04)", border: "none", borderRadius: "50%", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} title="Delete Photo">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </motion.button>
                      </motion.div>
                    )) : (
                        <div style={{ padding: "3rem 1rem", textAlign: "center", border: "1px dashed rgba(150,150,150,0.12)", borderRadius: "16px" }}>
                        <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: "750", color: "var(--text-primary)" }}>No moments published yet</p>
                        <p style={{ margin: "2px 0 0", fontSize: "0.68rem", color: "var(--text-secondary)" }}>Upload your first photo above.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ---- BOOKS ---- */}
              {activeTab === "books" && (
                <motion.div key="books" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "var(--text-secondary)" }}>Library / Book Reviews</span>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} 
                      onClick={() => { 
                        setEditingBookId(null); 
                        setBookTitle(""); 
                        setBookAuthor(""); 
                        setBookCoverUrl(""); 
                        setBookProgress(0); 
                        setBookStatus("reading"); 
                        setBookReview(""); 
                        setBookRating(5);
                        setShowBookModal(true); 
                      }} 
                      style={{ padding: "6px 14px", backgroundColor: "var(--text-primary)", color: "var(--bg-color)", border: "none", borderRadius: "20px", fontSize: "0.68rem", fontWeight: "750", cursor: "pointer", fontFamily: iosFontStack, display: "flex", alignItems: "center", gap: "4px" }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      Add Book
                    </motion.button>
                  </div>

                  {/* Add / Edit Book Modal */}
                  <GlassModal isOpen={showBookModal} onClose={() => setShowBookModal(false)} theme={theme}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>{editingBookId ? "Edit Book Status" : "Add New Book"}</h3>
                      <button type="button" onClick={() => setShowBookModal(false)} style={{ width: "26px", height: "26px", borderRadius: "50%", border: "none", background: "rgba(150,150,150,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                    <form onSubmit={handleSaveBook} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {/* ── Quick book search ── */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>🔍 Quick Search <span style={{ fontWeight: "500", opacity: 0.7 }}>(Google Play Books + Open Library)</span></label>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <input className="admin-form-input" type="text" placeholder="Search by title or author…" value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleSearchBooks(); } }}
                            style={{ flex: 1 }} />
                          <motion.button type="button" onClick={handleSearchBooks} disabled={searching || !searchQuery.trim()}
                            whileTap={{ scale: 0.97 }}
                            style={{ padding: "8px 14px", backgroundColor: "var(--text-primary)", color: "var(--bg-color)", border: "none", borderRadius: "10px", fontSize: "0.7rem", fontWeight: "750", cursor: searching || !searchQuery.trim() ? "not-allowed" : "pointer", opacity: searching || !searchQuery.trim() ? 0.4 : 1, fontFamily: iosFontStack, flexShrink: 0 }}>
                            {searching ? "…" : "Search"}
                          </motion.button>
                        </div>
                        {searchResults.length > 0 && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "220px", overflowY: "auto", marginTop: "2px" }}>
                            {searchResults.map((result, i) => (
                              <motion.div key={i} onClick={() => selectSearchResult(result)} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                                style={{ display: "flex", gap: "8px", alignItems: "center", padding: "7px 10px", borderRadius: "10px", border: "1px solid rgba(150,150,150,0.12)", background: theme === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)", cursor: "pointer" }}>
                                {result.coverUrl ? (
                                  <img src={result.coverUrl} alt="" style={{ width: "28px", height: "40px", objectFit: "cover", borderRadius: "4px", flexShrink: 0 }} />
                                ) : (
                                  <div style={{ width: "28px", height: "40px", borderRadius: "4px", background: "rgba(150,150,150,0.1)", flexShrink: 0 }} />
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{result.title}</div>
                                  <div style={{ fontSize: "0.6rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{result.author}</div>
                                  <div style={{ fontSize: "0.5rem", fontWeight: "700", color: result.source === "Google Play Books" ? "#4285f4" : "#10b981", marginTop: "1px" }}>{result.source}</div>
                                </div>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4, flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ height: "1px", background: "rgba(150,150,150,0.12)", margin: "2px 0" }} />
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Title <span style={{ color: "#ef4444" }}>*</span></label>
                        <input className="admin-form-input" type="text" placeholder="e.g. Designing Design" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} required />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Author <span style={{ color: "#ef4444" }}>*</span></label>
                        <input className="admin-form-input" type="text" placeholder="e.g. Kenya Hara" value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} required />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Cover Image</label>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <input className="admin-form-input" type="text" placeholder="https://... or upload file" value={bookCoverUrl} onChange={(e) => setBookCoverUrl(e.target.value)} style={{ flex: 1 }} />
                          <input type="file" id="book-cover-file" accept="image/*" onChange={handleBookCoverUpload} style={{ display: "none" }} />
                          <motion.label htmlFor="book-cover-file" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{ padding: "8px 12px", backgroundColor: "rgba(150,150,150,0.08)", border: "1px solid rgba(150,150,150,0.15)", borderRadius: "10px", color: "var(--text-primary)", fontSize: "0.62rem", fontWeight: "750", cursor: "pointer", fontFamily: iosFontStack, flexShrink: 0 }}>
                            {isUploadingBookCover ? "Uploading…" : "Upload Cover"}
                          </motion.label>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Status</label>
                          <select value={bookStatus} onChange={(e) => {
                            const newStatus = e.target.value as any;
                            setBookStatus(newStatus);
                            if (newStatus === "completed") setBookProgress(100);
                          }} className="admin-form-input custom-select">
                            <option value="reading">📖 Reading</option>
                            <option value="completed">✅ Completed</option>
                            <option value="on_hold">⏸️ On Hold</option>
                            <option value="to_read">⏳ To Read</option>
                          </select>
                        </div>
                        <div style={{ width: "80px", display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Progress %</label>
                          <input className="admin-form-input" type="number" min="0" max="100" value={bookProgress} onChange={(e) => setBookProgress(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} required />
                        </div>
                        <div style={{ width: "80px", display: "flex", flexDirection: "column", gap: "4px" }}>
                          <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Stars</label>
                          <select value={bookRating} onChange={(e) => setBookRating(parseInt(e.target.value))} className="admin-form-input custom-select">
                            {[1,2,3,4,5].map(num => <option key={num} value={num}>{num} ★</option>)}
                          </select>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                          <label style={{ fontSize: "0.6rem", fontWeight: "800", color: "var(--text-secondary)", letterSpacing: "0.02em" }}>Review & Reflection</label>
                          <div style={{ display: "flex", gap: "4px", background: "rgba(128,128,128,0.06)", padding: "2px", borderRadius: "6px", border: "1px solid rgba(128,128,128,0.1)" }}>
                            <button type="button" onClick={() => applyFormat("b")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: "none", background: "transparent", color: "var(--text-primary)", cursor: "pointer", fontWeight: "bold", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center" }} title="Bold">B</button>
                            <button type="button" onClick={() => applyFormat("i")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: "none", background: "transparent", color: "var(--text-primary)", cursor: "pointer", fontStyle: "italic", fontSize: "0.7rem", fontFamily: "serif", display: "flex", alignItems: "center", justifyContent: "center" }} title="Italic">I</button>
                            <button type="button" onClick={() => applyFormat("u")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: "none", background: "transparent", color: "var(--text-primary)", cursor: "pointer", textDecoration: "underline", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center" }} title="Underline">U</button>
                            <button type="button" onClick={() => applyFormat("ul")} style={{ width: "22px", height: "22px", borderRadius: "4px", border: "none", background: "transparent", color: "var(--text-primary)", cursor: "pointer", fontSize: "0.7rem", display: "flex", alignItems: "center", justifyContent: "center" }} title="Bullet List">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                            </button>
                          </div>
                        </div>
                        <textarea ref={bookReviewRef} className="admin-form-input admin-auto-textarea" placeholder="Add book review when completed... (Supports HTML/Markdown formatting via toolbar)" value={bookReview} onChange={(e) => setBookReview(e.target.value)} style={{ minHeight: "120px", resize: "none" }} />
                      </div>
                      <motion.button type="submit" disabled={isSubmittingBook || !bookTitle.trim() || !bookAuthor.trim()}
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        style={{ padding: "11px", backgroundColor: "var(--text-primary)", color: "var(--bg-color)", border: "none", borderRadius: "30px", fontSize: "0.78rem", fontWeight: "800", cursor: "pointer", fontFamily: iosFontStack, marginTop: "4px" }}>
                        {isSubmittingBook ? "Saving…" : "Save Book"}
                      </motion.button>
                    </form>
                  </GlassModal>

                  {/* Books List Grid */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {adminBooks.length > 0 ? adminBooks.map(book => (
                      <motion.div key={book.id} layoutId={`bcard-${book.id}`} className="admin-glass-card"
                        style={{ display: "flex", gap: "10px", alignItems: "center", padding: "9px 12px" }}>
                        {/* Cover thumbnail */}
                        <div style={{ width: "36px", height: "52px", borderRadius: "5px", overflow: "hidden", border: `1px solid ${theme === "dark" ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`, flexShrink: 0, background: "rgba(150,150,150,0.06)" }}>
                          {book.coverUrl
                            ? <img src={book.coverUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity={0.3}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 13h4"/></svg>
                              </div>
                          }
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "var(--text-primary)", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.01em" }}>{book.title}</span>
                          <span style={{ fontSize: "0.64rem", color: "var(--text-secondary)", fontWeight: "500", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>by {book.author}</span>

                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", flexWrap: "wrap" }}>
                            {/* Status badge */}
                            <span style={{ fontSize: "0.56rem", display: "inline-block", padding: "2px 6px", borderRadius: "8px", backgroundColor: book.status === "completed" ? "rgba(16,185,129,0.1)" : book.status === "reading" ? "rgba(59,130,246,0.1)" : "rgba(150,150,150,0.08)", color: book.status === "completed" ? "#10b981" : book.status === "reading" ? "#3b82f6" : "var(--text-secondary)", fontWeight: "800", letterSpacing: "0.03em" }}>
                              {book.status === "reading" ? "READING" : book.status === "completed" ? "DONE" : book.status.replace("_", " ").toUpperCase()} • {book.progress}%
                            </span>

                            {/* Star rating */}
                            {book.rating && (
                              <span style={{ fontSize: "0.6rem", color: "#f59e0b", letterSpacing: "1px" }}>
                                {"★".repeat(book.rating)}{"☆".repeat(5 - (book.rating || 0))}
                              </span>
                            )}

                            {/* Review indicator — no text shown */}
                            {book.review && (
                              <span style={{ fontSize: "0.52rem", display: "inline-flex", alignItems: "center", gap: "2px", padding: "1px 5px", borderRadius: "6px", backgroundColor: "rgba(139,92,246,0.08)", color: "#8b5cf6", fontWeight: "700" }}>
                                <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                                REVIEW
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: "3px", alignItems: "center", flexShrink: 0 }}>
                          {/* Update Cover */}
                          <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
                            onClick={() => { setCoverSearchBookId(book.id); setCoverSearchQuery(`${book.title} ${book.author}`); setCoverSearchResults([]); }}
                            style={{ width: "28px", height: "28px", backgroundColor: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.18)", borderRadius: "50%", color: "#10b981", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Update Cover">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                          </motion.button>
                          {/* Edit — opens modal with full review in textarea */}
                          <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setEditingBookId(book.id);
                              setBookTitle(book.title);
                              setBookAuthor(book.author);
                              setBookCoverUrl(book.coverUrl || "");
                              setBookProgress(book.progress);
                              setBookStatus(book.status);
                              setBookReview(book.review || "");
                              setBookRating(book.rating || 5);
                              setSearchQuery(""); setSearchResults([]);
                              setShowBookModal(true);
                            }}
                            style={{ width: "28px", height: "28px", backgroundColor: "rgba(0,122,255,0.06)", border: "1px solid rgba(0,122,255,0.14)", borderRadius: "50%", color: "#007AFF", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Edit Book">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                          </motion.button>
                          {/* Delete */}
                          <motion.button whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeleteBook(book.id)}
                            style={{ width: "28px", height: "28px", backgroundColor: "rgba(239,68,68,0.04)", border: "none", borderRadius: "50%", color: "#ef4444", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Delete Book">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                          </motion.button>
                        </div>
                      </motion.div>
                    )) : (
                      <div style={{ padding: "3rem 1rem", textAlign: "center", border: "1px dashed rgba(150,150,150,0.12)", borderRadius: "16px" }}>
                        <p style={{ margin: 0, fontSize: "0.75rem", fontWeight: "750", color: "var(--text-primary)" }}>No books cataloged yet</p>
                        <p style={{ margin: "2px 0 0", fontSize: "0.68rem", color: "var(--text-secondary)" }}>Add your first book above.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ===== SECURITY / IP BLOCKER PANEL ===== */}
          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Header Info */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>IP Access Control</h2>
                  <p style={{ margin: 0, fontSize: "0.68rem", color: "var(--text-secondary)", opacity: 0.8 }}>
                    Manage permanently blocked IP addresses. Blocked users will receive a visual Access Denied blackout screen and their API requests will be immediately rejected with 403 Forbidden.
                  </p>
                </div>
              </div>

              {/* Grid: Add Form & Current List */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
                {/* Form to Block New IP */}
                <div style={{ background: "rgba(150, 150, 150, 0.03)", border: "1px solid rgba(150, 150, 150, 0.1)", borderRadius: "16px", padding: "16px 20px" }}>
                  <h3 style={{ fontSize: "0.85rem", fontWeight: 750, color: "var(--text-primary)", margin: "0 0 14px 0", letterSpacing: "-0.01em" }}>Block New Connection</h3>
                  <form onSubmit={handleBlockIP} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label style={{ fontSize: "0.62rem", fontWeight: 650, color: "var(--text-secondary)", display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.03em" }}>IP Address</label>
                      <input
                        className="admin-form-input"
                        type="text"
                        placeholder="e.g. 114.10.25.175"
                        value={newIPToBlock}
                        onChange={e => setNewIPToBlock(e.target.value)}
                        required
                        style={{ width: "100%", fontFamily: "monospace" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: "0.62rem", fontWeight: 650, color: "var(--text-secondary)", display: "block", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.03em" }}>Reason / Note</label>
                      <input
                        className="admin-form-input"
                        type="text"
                        placeholder="e.g. Spammer, Scraping"
                        value={newIPNote}
                        onChange={e => setNewIPNote(e.target.value)}
                        style={{ width: "100%" }}
                      />
                    </div>

                    {ipError && (
                      <div style={{ fontSize: "0.65rem", color: "#ef4444", fontWeight: 600 }}>
                        ⚠️ {ipError}
                      </div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={isSubmittingIP || !newIPToBlock.trim()}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        padding: "10px 14px",
                        backgroundColor: "#ef4444",
                        color: "#ffffff",
                        border: "none",
                        borderRadius: "10px",
                        fontSize: "0.72rem",
                        fontWeight: "750",
                        cursor: isSubmittingIP || !newIPToBlock.trim() ? "not-allowed" : "pointer",
                        opacity: isSubmittingIP || !newIPToBlock.trim() ? 0.5 : 1,
                        fontFamily: iosFontStack,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        marginTop: "4px",
                        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.15)"
                      }}
                    >
                      {isSubmittingIP ? "Blocking..." : "Restrict IP Address"}
                    </motion.button>
                  </form>
                </div>

                {/* List of Blocked IPs */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: "0.85rem", fontWeight: 750, color: "var(--text-primary)", margin: 0, letterSpacing: "-0.01em" }}>Blocked Connections ({blockedIPs.length})</h3>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "400px", overflowY: "auto", paddingRight: "4px" }}>
                    {blockedIPs.length > 0 ? (
                      blockedIPs.map(item => (
                        <motion.div
                          key={item.id}
                          layoutId={`ip-card-${item.id}`}
                          style={{
                            background: item.isSystem 
                              ? (theme === "dark" ? "rgba(142, 142, 147, 0.05)" : "rgba(142, 142, 147, 0.03)")
                              : (theme === "dark" ? "rgba(239, 68, 68, 0.03)" : "rgba(239, 68, 68, 0.01)"),
                            border: item.isSystem
                              ? "1px solid rgba(142, 142, 147, 0.16)"
                              : "1px solid rgba(239, 68, 68, 0.12)",
                            borderRadius: "14px",
                            padding: "10px 14px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "10px"
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <span style={{ fontSize: "0.78rem", fontWeight: 750, color: item.isSystem ? "var(--text-secondary)" : "#ef4444", fontFamily: "monospace" }}>{item.ip}</span>
                              <span style={{ fontSize: "0.55rem", color: "var(--text-secondary)", background: "rgba(150,150,150,0.08)", padding: "2px 6px", borderRadius: "6px", fontWeight: "700" }}>
                                {item.isSystem ? "System Default" : (item.blockedAt ? new Date(item.blockedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Permanent")}
                              </span>
                            </div>
                            {item.note && (
                              <p style={{ margin: "4px 0 0 0", fontSize: "0.65rem", color: "var(--text-secondary)", opacity: 0.85, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                📝 {item.note}
                              </p>
                            )}
                          </div>

                          {item.isSystem ? (
                            <div
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                border: "1px solid rgba(142, 142, 147, 0.15)",
                                background: "rgba(142, 142, 147, 0.05)",
                                color: "var(--text-secondary)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: 0.65
                              }}
                              title="System Fallback Block (Permanent)"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                              </svg>
                            </div>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleUnblockIP(item.id)}
                              style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                border: "1px solid rgba(16, 185, 129, 0.2)",
                                background: "rgba(16, 185, 129, 0.05)",
                                color: "#10b981",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer"
                              }}
                              title="Unblock Connection"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 13V9a4 4 0 0 0-4-4H9" />
                                <path d="M22 9l-4-4-4 4" />
                                <path d="M2 13v4a4 4 0 0 0 4 4h9" />
                                <path d="M22 17a5 5 0 0 1-5 5H6.5a2.5 2.5 0 0 1 0-5H20" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            </motion.button>
                          )}
                        </motion.div>
                      ))
                    ) : (
                      <div style={{ padding: "2.5rem 1rem", textAlign: "center", border: "1px dashed rgba(150,150,150,0.12)", borderRadius: "16px" }}>
                        <p style={{ margin: 0, fontSize: "0.72rem", fontWeight: "700", color: "var(--text-secondary)" }}>No custom blocked IPs in database</p>
                        <p style={{ margin: "2px 0 0 0", fontSize: "0.64rem", color: "var(--text-secondary)", opacity: 0.7 }}>Fallback blocked list is active.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ===== COVER SEARCH MODAL ===== */}
          <GlassModal isOpen={!!coverSearchBookId} onClose={() => { setCoverSearchBookId(null); setCoverSearchResults([]); setCoverSearchQuery(""); }} theme={theme}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: "var(--text-primary)", letterSpacing: "-0.02em", margin: 0 }}>Update Cover</h3>
              <button type="button" onClick={() => { setCoverSearchBookId(null); setCoverSearchResults([]); setCoverSearchQuery(""); }} style={{ width: "26px", height: "26px", borderRadius: "50%", border: "none", background: "rgba(150,150,150,0.1)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {coverSearchBookId && (() => {
              const theBook = adminBooks.find(b => b.id === coverSearchBookId);
              return theBook ? (
                <div style={{ display: "flex", gap: "8px", alignItems: "center", padding: "8px 10px", backgroundColor: "rgba(150,150,150,0.04)", borderRadius: "10px", border: "1px solid rgba(150,150,150,0.08)", marginBottom: "12px" }}>
                  {theBook.coverUrl && <img src={theBook.coverUrl} alt="" style={{ width: "28px", height: "40px", objectFit: "cover", borderRadius: "4px", flexShrink: 0 }} />}
                  <div>
                    <div style={{ fontSize: "0.72rem", fontWeight: "700", color: "var(--text-primary)" }}>{theBook.title}</div>
                    <div style={{ fontSize: "0.6rem", color: "var(--text-secondary)" }}>{theBook.author}</div>
                  </div>
                </div>
              ) : null;
            })()}
            <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
              <input className="admin-form-input" type="text" placeholder="Search title or author…" value={coverSearchQuery}
                onChange={e => setCoverSearchQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleCoverSearch(coverSearchQuery); } }}
                style={{ flex: 1 }} autoFocus />
              <motion.button type="button" onClick={() => handleCoverSearch(coverSearchQuery)} disabled={coverSearching || !coverSearchQuery.trim()}
                whileTap={{ scale: 0.97 }}
                style={{ padding: "8px 14px", backgroundColor: "var(--text-primary)", color: "var(--bg-color)", border: "none", borderRadius: "10px", fontSize: "0.7rem", fontWeight: "750", cursor: coverSearching || !coverSearchQuery.trim() ? "not-allowed" : "pointer", opacity: coverSearching || !coverSearchQuery.trim() ? 0.4 : 1, fontFamily: iosFontStack, flexShrink: 0 }}>
                {coverSearching ? "…" : "Search"}
              </motion.button>
            </div>
            {coverSearchResults.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
                {coverSearchResults.map((result, i) => (
                  <motion.div key={i} onClick={() => { if (coverSearchBookId && result.coverUrl) applyNewCover(coverSearchBookId, result.coverUrl); }}
                    whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }}
                    style={{ display: "flex", flexDirection: "column", gap: "4px", cursor: result.coverUrl ? "pointer" : "default", opacity: result.coverUrl ? 1 : 0.4 }}>
                    <div style={{ aspectRatio: "2/3", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(150,150,150,0.15)", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                      {result.coverUrl ? (
                        <img src={result.coverUrl} alt={result.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "100%", height: "100%", background: "rgba(150,150,150,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", color: "var(--text-secondary)" }}>No cover</div>
                      )}
                    </div>
                    <div style={{ fontSize: "0.52rem", fontWeight: "600", color: result.source === "Google Play Books" ? "#4285f4" : "#10b981", textAlign: "center" }}>{result.source}</div>
                    <div style={{ fontSize: "0.56rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "center" }}>{result.title}</div>
                  </motion.div>
                ))}
              </div>
            )}
            {coverSearchResults.length === 0 && !coverSearching && (
              <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--text-secondary)", fontSize: "0.72rem" }}>
                Search for a book above to see cover options from Google Play Books &amp; Open Library.
              </div>
            )}
          </GlassModal>
        </main>
      </div>

      {/* ===== BOTTOM TAB BAR (Floating Pillbar — always visible) ===== */}
      {mounted && createPortal(
        <nav
          className="admin-bottom-bar"
          style={{
            background: theme === "dark"
              ? "rgba(30, 30, 34, 0.82)"
              : "rgba(236, 236, 241, 0.82)",
            border: theme === "dark"
              ? "0.5px solid rgba(255,255,255,0.08)"
              : "0.5px solid rgba(0,0,0,0.05)",
            backdropFilter: "blur(28px) saturate(200%)",
            WebkitBackdropFilter: "blur(28px) saturate(200%)",
            boxShadow: theme === "dark"
              ? "0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3), inset 0 0.5px 0 rgba(255,255,255,0.06)"
              : "0 8px 24px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.04), inset 0 0.5px 0 rgba(255,255,255,0.9)",
          }}
        >
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            const activeColor = theme === "dark" ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.9)";
            const inactiveColor = theme === "dark" ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.32)";
            return (
              <button
                key={tab.id}
                className="bottom-nav-btn"
                onClick={() => handleTabChange(tab.id)}
                style={{ color: isActive ? activeColor : inactiveColor }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabPill"
                    transition={{ type: "spring", stiffness: 460, damping: 36 }}
                    style={{
                      position: "absolute",
                      inset: "2px 2px",
                      borderRadius: "20px",
                      background: theme === "dark"
                        ? "rgba(255, 255, 255, 0.10)"
                        : "rgba(255, 255, 255, 0.95)",
                      boxShadow: theme === "dark"
                        ? "0 1px 6px rgba(0,0,0,0.5), inset 0 0.5px 0 rgba(255,255,255,0.08)"
                        : "0 2px 8px rgba(0,0,0,0.10), 0 0.5px 2px rgba(0,0,0,0.05)",
                      border: theme === "dark"
                        ? "0.5px solid rgba(255,255,255,0.06)"
                        : "0.5px solid rgba(0,0,0,0.04)",
                      zIndex: -1,
                    }}
                  />
                )}
                <div style={{ position: "relative", display: "inline-flex", zIndex: 2, lineHeight: 1 }}>
                  <span style={{ opacity: isActive ? 1 : 0.75 }}>{tab.icon}</span>
                  {tab.count > 0 && (
                    <span style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-8px",
                      minWidth: "14px",
                      height: "14px",
                      borderRadius: "7px",
                      backgroundColor: "#FF3B30",
                      color: "#fff",
                      fontSize: "0.45rem",
                      fontWeight: "800",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 2px",
                      boxSizing: "border-box",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                    }}>{tab.count}</span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>,
        document.body
      )}

      {/* ===== CONFIRM DIALOG ===== */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }} />
            <motion.div initial={{ opacity: 0, scale: 0.94, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 8 }} transition={{ type: "spring", damping: 30, stiffness: 400 }} style={{ position: "relative", width: "100%", maxWidth: "270px", backgroundColor: "rgba(255,255,255,0.9)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: "14px", padding: "1.1rem", boxShadow: "0 20px 50px rgba(0,0,0,0.15)", zIndex: 1, display: "flex", flexDirection: "column", textAlign: "center", gap: "0.8rem", fontFamily: iosFontStack }}>
              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "700", color: "#000", letterSpacing: "-0.02em", margin: "0 0 4px" }}>{confirmModal.title}</h3>
                <p style={{ fontSize: "0.78rem", color: "#3a3a3c", lineHeight: "1.4", margin: 0, fontWeight: "400" }}>{confirmModal.message}</p>
              </div>
              <div style={{ display: "flex", gap: "0.5px", borderTop: "0.5px solid rgba(0,0,0,0.15)", margin: "0.5rem -1.1rem -1.1rem -1.1rem", overflow: "hidden" }}>
                <button onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} style={{ flex: 1, padding: "12px 8px", backgroundColor: "transparent", border: "none", borderRight: "0.5px solid rgba(0,0,0,0.15)", color: "#007AFF", fontSize: "0.9rem", fontWeight: "400", cursor: "pointer", fontFamily: iosFontStack }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}>Cancel</button>
                <button onClick={confirmModal.onConfirm} style={{ flex: 1, padding: "12px 8px", border: "none", backgroundColor: "transparent", color: "#FF3B30", fontSize: "0.9rem", fontWeight: "600", cursor: "pointer", fontFamily: iosFontStack }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.04)"} onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}>{confirmModal.confirmText || "Delete"}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-color)" }}>
        <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: "2px solid rgba(150,150,150,0.15)", borderTopColor: "var(--text-primary)", animation: "spin 0.8s linear infinite" }} />
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  );
}
