'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { CalendarAgendaWidget } from '@/components/CalendarAgendaWidget';
import { Header } from '@/components/Header';
import { MessageList } from '@/components/MessageList';
import { MessageView } from '@/components/MessageView';
import { ComposerModal } from '@/components/ComposerModal';
import { Toast, ToastMessage } from '@/components/Toast';
import { ImportContactsModal } from '@/components/ImportContactsModal';
import { SubscriptionsModal } from '@/components/SubscriptionsModal';
import { sound } from '@/lib/sound';
import { Folder, MessageSummary, MessageDetail } from '@/types/mail';
import {
  fetchFolders,
  fetchMessages,
  fetchMessageDetail,
  markAsRead,
  markAsUnread,
} from '@/lib/api';
import { isAuthenticated, getUserEmail, clearSession } from '@/lib/auth';
import { initThemeListener } from '@/lib/theme';
import { RefreshCw, WifiOff, Feather } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

function playChime() {
  try {
    const AC = (window.AudioContext || (window as unknown as Record<string, unknown>).webkitAudioContext) as typeof AudioContext | undefined;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch { /* ignore */ }
}

export default function MailApp() {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [userEmail, setUserEmail] = useState('hello@ivanaffriandi.com');

  // ── Data state ────────────────────────────────────────────────────────────
  const [folders, setFolders] = useState<Folder[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string>('');
  const [messages, setMessages] = useState<MessageSummary[]>([]);
  const [selectedMessageId, setSelectedMessageIdRaw] = useState<string | null>(null);
  const [selectedMessageDetail, setSelectedMessageDetail] = useState<MessageDetail | null>(null);

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isSubscriptionsOpen, setIsSubscriptionsOpen] = useState(false);
  const [composeContext, setComposeContext] = useState<{ to?: string; subject?: string; body?: string; in_reply_to?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ── Poll tracking ─────────────────────────────────────────────────────────
  const prevCountRef = useRef(0);
  const prevMsgIdsRef = useRef<Set<string>>(new Set());
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Toasts ────────────────────────────────────────────────────────────────
  const addToast = useCallback((
    type: 'success' | 'error' | 'info',
    text: string,
    duration = 4500,
    options?: {
      isIncomingMail?: boolean;
      sender?: string;
      subject?: string;
      snippet?: string;
      onClick?: () => void;
    }
  ) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [
      ...prev,
      {
        id,
        type,
        text,
        isIncomingMail: options?.isIncomingMail,
        sender: options?.sender,
        subject: options?.subject,
        snippet: options?.snippet,
        onClick: options?.onClick,
      },
    ]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const setSelectedMessageId = useCallback((id: string | null) => {
    setSelectedMessageIdRaw(id);
  }, []);

  // ── Auth guard & Theme Listener ─────────────────────────────────────────
  useEffect(() => {
    const cleanupTheme = initThemeListener();
    if (!isAuthenticated()) {
      router.replace('/login');
    } else {
      setUserEmail(getUserEmail() || 'hello@ivanaffriandi.com');
      setIsAuthChecked(true);
    }
    return () => {
      cleanupTheme();
    };
  }, [router]);

  // ── Load folders ──────────────────────────────────────────────────────────
  const loadFolders = useCallback(async () => {
    try {
      const f = await fetchFolders();
      setFolders(f);
      if (f.length > 0 && !activeFolderId) {
        const inbox = f.find((b) => b.type === 'inbox') ?? f[0];
        setActiveFolderId(inbox.id);
      }
    } catch (err) {
      console.error('Folders load error:', err);
    }
  }, [activeFolderId]);

  useEffect(() => {
    if (isAuthChecked) loadFolders();
  }, [isAuthChecked, loadFolders]);

  // ── Load messages for active folder ──────────────────────────────────────
  const loadMessages = useCallback(async (folderId: string, silent = false) => {
    if (!folderId || folderId === 'subscriptions') return;
    if (!silent) setIsLoading(true);
    setLoadError(null);
    try {
      const fresh = await fetchMessages(folderId);
      setMessages(fresh);

      const freshUnread = fresh.filter((m) => !m.is_read).length;
      setFolders((prev) =>
        prev.map((f) =>
          f.id === folderId ? { ...f, unread_count: freshUnread, total_count: fresh.length } : f
        )
      );

      const newIds = new Set(fresh.map((m) => m.id));
      if (prevMsgIdsRef.current.size > 0) {
        const arrivedMessages = fresh.filter((m) => !prevMsgIdsRef.current.has(m.id) && !m.is_read);
        if (arrivedMessages.length > 0) {
          sound.playInbound();
          arrivedMessages.forEach((m) => {
            addToast(
              'info',
              `New mail from ${m.sender_name || m.sender_address}`,
              15000,
              {
                isIncomingMail: true,
                sender: m.sender_name || m.sender_address,
                subject: m.subject || '(No Subject)',
                snippet: m.snippet || 'Tap to view new message content...',
                onClick: () => setSelectedMessageId(m.id),
              }
            );

            // Native Browser Notification
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(`New Email: ${m.sender_name || m.sender_address}`, {
                  body: m.subject || 'You received a new message.',
                  icon: '/favicon.svg',
                });
              } catch { /* ignore notification errors */ }
            }
          });
        }
      }
      prevCountRef.current = fresh.length;
      prevMsgIdsRef.current = newIds;
    } catch (err) {
      if (!silent) setLoadError(`Could not load messages. Check your connection.`);
      console.error('Messages load error:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (!activeFolderId || !isAuthChecked) return;
    prevCountRef.current = 0;
    prevMsgIdsRef.current = new Set();
    setMessages([]);
    setSelectedMessageIdRaw(null);
    setSelectedMessageDetail(null);
    loadMessages(activeFolderId);
  }, [activeFolderId, isAuthChecked, loadMessages]);

  // ── 5-second polling ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeFolderId || !isAuthChecked) return;
    pollRef.current = setInterval(() => loadMessages(activeFolderId, true), 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeFolderId, isAuthChecked, loadMessages]);

  // ── Load message detail ───────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedMessageId || !isAuthChecked) {
      setSelectedMessageDetail(null);
      return;
    }
    let cancelled = false;
    setIsLoadingDetail(true);
    fetchMessageDetail(selectedMessageId)
      .then((detail) => {
        if (cancelled) return;
        setSelectedMessageDetail(detail);
        setMessages((prev) =>
          prev.map((m) => (m.id === selectedMessageId ? { ...m, is_read: true } : m))
        );
        setFolders((prev) =>
          prev.map((f) => {
            if (f.id === activeFolderId) {
              return { ...f, unread_count: Math.max(0, f.unread_count - 1) };
            }
            return f;
          })
        );
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Detail load error:', err);
        addToast('error', 'Could not load this message.');
        setSelectedMessageDetail(null);
      })
      .finally(() => { if (!cancelled) setIsLoadingDetail(false); });
    return () => { cancelled = true; };
  }, [selectedMessageId, isAuthChecked, activeFolderId, addToast]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectFolder = (id: string) => {
    setSelectedMessageId(null);
    if (id === activeFolderId) {
      if (id !== 'subscriptions') loadMessages(id);
      return;
    }
    setActiveFolderId(id);
    if (id !== 'subscriptions') {
      loadMessages(id);
    }
  };

  const handleReply = useCallback(() => {
    if (!selectedMessageDetail) return;
    const cleanSub = (selectedMessageDetail.subject || "").trim();
    const subject = /^re:\s*/i.test(cleanSub) ? cleanSub : `Re: ${cleanSub}`;
    setComposeContext({
      to: selectedMessageDetail.sender_address,
      subject: subject,
      in_reply_to: selectedMessageDetail.message_id_header || selectedMessageDetail.id,
    });
    setIsComposeOpen(true);
  }, [selectedMessageDetail]);

  const handleUseSuggestedReply = useCallback((draftBody: string) => {
    if (!selectedMessageDetail) return;
    const cleanSub = (selectedMessageDetail.subject || "").trim();
    const subject = /^re:\s*/i.test(cleanSub) ? cleanSub : `Re: ${cleanSub}`;
    setComposeContext({
      to: selectedMessageDetail.sender_address,
      subject: subject,
      body: draftBody,
      in_reply_to: selectedMessageDetail.message_id_header || selectedMessageDetail.id,
    });
    setIsComposeOpen(true);
  }, [selectedMessageDetail]);

  const handleForward = useCallback(() => {
    if (!selectedMessageDetail) return;
    setComposeContext({
      subject: `Fwd: ${selectedMessageDetail.subject}`,
      body: `\n\n---------- Forwarded message ----------\nFrom: ${selectedMessageDetail.sender_address}\nSubject: ${selectedMessageDetail.subject}\n\n${selectedMessageDetail.body_plain || ''}`,
    });
    setIsComposeOpen(true);
  }, [selectedMessageDetail]);

  const handleToggleStar = useCallback(async (id?: string) => {
    const targetId = id || selectedMessageId;
    if (!targetId) return;

    // Optimistic UI update
    setMessages((prev) =>
      prev.map((m) => (m.id === targetId ? { ...m, is_starred: !m.is_starred } : m))
    );
    if (selectedMessageDetail && selectedMessageDetail.id === targetId) {
      setSelectedMessageDetail((prev) =>
        prev ? { ...prev, is_starred: !prev.is_starred } : null
      );
    }

    try {
      await fetch(`${API_BASE}/messages/${targetId}/star`, { method: 'PATCH' });
    } catch (err) {
      console.error('Star error:', err);
    }
  }, [selectedMessageId, selectedMessageDetail]);

  const handleMarkUnread = useCallback((id?: string) => {
    const targetId = id || selectedMessageId;
    if (!targetId) return;
    setMessages((prev) =>
      prev.map((m) => (m.id === targetId ? { ...m, is_read: false } : m))
    );
    setFolders((prev) =>
      prev.map((f) => {
        if (f.id === activeFolderId) {
          return { ...f, unread_count: f.unread_count + 1 };
        }
        return f;
      })
    );
    if (selectedMessageId === targetId) setSelectedMessageId(null);
    markAsUnread(targetId);
    addToast('info', 'Marked as unread');
  }, [selectedMessageId, setSelectedMessageId, addToast, activeFolderId]);

  const handleArchive = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedMessageId === id) setSelectedMessageId(null);
    addToast('info', 'Message moved to Archive');
    fetch(`${API_BASE}/messages/${id}/archive`, { method: 'PATCH' }).catch(() => {});
  }, [selectedMessageId, setSelectedMessageId, addToast]);

  const handleDelete = useCallback((id: string) => {
    const isTrashFolder = folders.find((f) => f.id === activeFolderId)?.type === 'trash';
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedMessageId === id) setSelectedMessageId(null);
    addToast('info', isTrashFolder ? 'Message permanently deleted' : 'Message moved to Trash');
    fetch(`${API_BASE}/messages/${id}`, { method: 'DELETE' }).catch(() => {});
  }, [selectedMessageId, setSelectedMessageId, addToast, folders, activeFolderId]);

  const handleBatchAction = useCallback(async (action: 'read' | 'unread' | 'star' | 'archive' | 'delete', ids: string[]) => {
    const idSet = new Set(ids);
    const isTrashFolder = folders.find((f) => f.id === activeFolderId)?.type === 'trash';

    if (action === 'read') {
      setMessages((prev) => prev.map((m) => idSet.has(m.id) ? { ...m, is_read: true } : m));
      setFolders((prev) =>
        prev.map((f) => {
          if (f.id === activeFolderId) {
            const newlyRead = messages.filter((m) => idSet.has(m.id) && !m.is_read).length;
            return { ...f, unread_count: Math.max(0, f.unread_count - newlyRead) };
          }
          return f;
        })
      );
      addToast('success', `Marked ${ids.length} messages as read`);
      ids.forEach((id) => markAsRead(id));
    } else if (action === 'unread') {
      setMessages((prev) => prev.map((m) => idSet.has(m.id) ? { ...m, is_read: false } : m));
      setFolders((prev) =>
        prev.map((f) => {
          if (f.id === activeFolderId) {
            const newlyUnread = messages.filter((m) => idSet.has(m.id) && m.is_read).length;
            return { ...f, unread_count: f.unread_count + newlyUnread };
          }
          return f;
        })
      );
      addToast('info', `Marked ${ids.length} messages as unread`);
      ids.forEach((id) => markAsUnread(id));
    } else if (action === 'star') {
      setMessages((prev) => prev.map((m) => idSet.has(m.id) ? { ...m, is_starred: !m.is_starred } : m));
      addToast('success', `Updated star status for ${ids.length} messages`);
      ids.forEach((id) => fetch(`${API_BASE}/messages/${id}/star`, { method: 'PATCH' }).catch(() => {}));
    } else if (action === 'archive') {
      setMessages((prev) => prev.filter((m) => !idSet.has(m.id)));
      if (selectedMessageId && idSet.has(selectedMessageId)) setSelectedMessageId(null);
      addToast('info', `Archived ${ids.length} messages`);
      ids.forEach((id) => fetch(`${API_BASE}/messages/${id}/archive`, { method: 'PATCH' }).catch(() => {}));
    } else if (action === 'delete') {
      setMessages((prev) => prev.filter((m) => !idSet.has(m.id)));
      if (selectedMessageId && idSet.has(selectedMessageId)) setSelectedMessageId(null);
      addToast('info', isTrashFolder ? `Permanently deleted ${ids.length} messages` : `Moved ${ids.length} messages to Trash`);
      ids.forEach((id) => fetch(`${API_BASE}/messages/${id}`, { method: 'DELETE' }).catch(() => {}));
    }
  }, [selectedMessageId, setSelectedMessageId, addToast, folders, activeFolderId, messages]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthChecked) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'j') {
        const idx = messages.findIndex((m) => m.id === selectedMessageId);
        if (idx < messages.length - 1) setSelectedMessageId(messages[idx + 1].id);
      } else if (e.key === 'k') {
        const idx = messages.findIndex((m) => m.id === selectedMessageId);
        if (idx > 0) setSelectedMessageId(messages[idx - 1].id);
      } else if (e.key === 'c') {
        setComposeContext({});
        setIsComposeOpen(true);
      } else if (e.key === 'r' && selectedMessageDetail) {
        handleReply();
      } else if (e.key === 's' && selectedMessageId) {
        handleToggleStar(selectedMessageId);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAuthChecked, messages, selectedMessageId, selectedMessageDetail, handleReply, handleToggleStar, setSelectedMessageId]);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
  };

  const handleRefresh = () => {
    loadMessages(activeFolderId);
    addToast('success', 'Mailbox refreshed');
  };

  const handleSignOut = () => {
    clearSession();
    router.replace('/login');
  };

  const [showImportModal, setShowImportModal] = useState(false);

  const handleComposeSent = (info: { to: string; subject: string }) => {
    sound.playSend();
    addToast('success', `✓ Email sent to ${info.to}`);
    loadFolders();
  };

  const handleImportSuccess = (imported: any[]) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mail_contacts_list');
      let currentContacts: any[] = [];
      if (saved) {
        try { currentContacts = JSON.parse(saved); } catch {}
      }
      const existingEmails = new Set(currentContacts.map(c => c.email.toLowerCase()));
      const newItems = imported.filter(c => !existingEmails.has(c.email.toLowerCase()));
      const merged = [...newItems, ...currentContacts];
      localStorage.setItem('mail_contacts_list', JSON.stringify(merged));
      addToast('success', `✓ Successfully imported ${newItems.length} contacts!`);
    }
  };

  // Filtered messages (searches sender, email, subject, and snippet)
  const displayMessages = searchQuery
    ? messages.filter(
        (m) =>
          m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.sender_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.sender_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (m.snippet || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  if (!isAuthChecked) {
    return (
      <div className="h-screen w-screen bg-[var(--bg-color)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center animate-pulse">
            <RefreshCw className="w-5 h-5 text-white animate-spin" />
          </div>
          <p className="text-xs text-[var(--text-muted)] font-semibold font-sans">Connecting to Mailbox…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mail-desktop-grid bg-[var(--bg-color)] text-[var(--text-primary)] font-sans">
      {/* Toast Banner System */}
      <Toast toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />

      {/* Desktop Sidebar */}
      <div
        className="hidden lg:flex flex-col items-center justify-center h-full mail-sidebar-fixed relative z-50 overflow-visible"
        style={{ width: "68px", minWidth: "68px", maxWidth: "68px", flex: "0 0 68px" }}
      >
        <Sidebar
          folders={folders}
          activeFolderId={activeFolderId}
          onSelectFolder={handleSelectFolder}
          onOpenCompose={(toEmail?: string) => {
            setComposeContext(toEmail ? { to: toEmail } : {});
            setIsComposeOpen(true);
          }}
          userEmail={userEmail}
          onSignOut={handleSignOut}
          selectedMessage={selectedMessageDetail}
          onReplyCurrentMessage={handleReply}
        />
      </div>

      {/* Mobile Drawer Sidebar (Floating Card) */}
      {isMobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[999] flex items-center justify-start p-3 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div
            className="w-72 sm:w-80 h-full max-h-[96vh] animate-slide-right flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar
              folders={folders}
              activeFolderId={activeFolderId}
              onSelectFolder={(id) => {
                handleSelectFolder(id);
                setIsMobileSidebarOpen(false);
              }}
              onOpenCompose={(toEmail?: string) => {
                setComposeContext(toEmail ? { to: toEmail } : {});
                setIsComposeOpen(true);
                setIsMobileSidebarOpen(false);
              }}
              userEmail={userEmail}
              onSignOut={handleSignOut}
              selectedMessage={selectedMessageDetail}
              onReplyCurrentMessage={() => {
                handleReply();
                setIsMobileSidebarOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex flex-col h-full overflow-hidden min-w-0 flex-1 relative z-10">
        <Header
          activeFolderName={
            activeFolderId === "starred"
              ? "Starred"
              : activeFolderId === "snoozed"
              ? "Snoozed"
              : folders.find((f) => f.id === activeFolderId)?.name ?? "Inbox"
          }
          totalMessagesCount={displayMessages.length}
          messages={messages}
          selectedMessage={selectedMessageDetail}
          onBack={() => setSelectedMessageId(null)}
          onSearch={handleSearch}
          onSelectMessage={(id) => setSelectedMessageId(id)}
          onComposeContact={(email) => {
            setComposeContext({ to: email });
            setIsComposeOpen(true);
          }}
          userEmail={userEmail}
          onSignOut={handleSignOut}
          onRefresh={handleRefresh}
          onOpenImportContacts={() => setShowImportModal(true)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Connection Error Banner */}
        {loadError && (
          <div className="mx-0 mt-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-2 text-xs text-red-500 font-bold animate-toast">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
            <button onClick={handleRefresh} className="ml-auto underline text-red-500 font-extrabold">
              Retry
            </button>
          </div>
        )}

        {/* Mail Split Pane */}
        <main className="flex-1 flex min-h-0 overflow-hidden pt-0 md:pt-1.5 gap-0 md:gap-3 w-full">
          {/* Message List */}
          <div
            className={`relative h-full mail-list-fixed ${
              selectedMessageId
                ? 'hidden md:block'
                : 'block'
            }`}
            style={{ width: '360px', minWidth: '360px', maxWidth: '360px', flex: '0 0 360px' }}
          >
            {isLoading && (
              <div className="absolute inset-0 bg-[var(--card-bg)]/60 backdrop-blur-xs z-10 flex items-center justify-center rounded-3xl">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <MessageList
              messages={displayMessages}
              selectedMessageId={selectedMessageId}
              onSelectMessage={setSelectedMessageId}
              onToggleStar={(id) => handleToggleStar(id)}
              onRefresh={handleRefresh}
              onBatchAction={handleBatchAction}
            />
          </div>

          {/* Message View */}
          <div
            className={`mail-view-flexible relative h-full ${selectedMessageId ? 'block' : 'hidden md:block'}`}
            style={{ flex: '1 1 0%', minWidth: 0, width: 0, overflow: 'hidden' }}
          >
            {isLoadingDetail && selectedMessageId && (
              <div className="absolute inset-0 bg-[var(--card-bg)]/60 backdrop-blur-xs z-10 flex items-center justify-center rounded-3xl">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <MessageView
              message={selectedMessageDetail}
              onReply={handleReply}
              onForward={handleForward}
              onArchive={() => selectedMessageId && handleArchive(selectedMessageId)}
              onDelete={() => selectedMessageId && handleDelete(selectedMessageId)}
              onToggleStar={() => selectedMessageId && handleToggleStar(selectedMessageId)}
              onMarkUnread={handleMarkUnread}
              onBack={() => setSelectedMessageId(null)}
              onReplySuccess={(info) => {
                sound.playSend();
                addToast('success', `✓ Reply dispatched to ${info.to}`);
                loadFolders();
              }}
            />
          </div>
                  {/* Right Side Calendar & Agenda Pane */}
          <div
            className="hidden xl:block h-full mail-calendar-fixed"
            style={{ width: "270px", minWidth: "270px", maxWidth: "270px", flex: "0 0 270px" }}
          >
            <CalendarAgendaWidget />
          </div>
        </main>
      </div>

      {/* Composer Modal */}
      <ComposerModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        initialTo={composeContext.to ?? ''}
        initialSubject={composeContext.subject ?? ''}
        initialBody={composeContext.body ?? ''}
        onSuccess={handleComposeSent}
      />

      {/* Import Contacts Modal */}
      <ImportContactsModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportSuccess}
      />

      {/* Subscriptions Popup Modal */}
      <SubscriptionsModal
        isOpen={isSubscriptionsOpen}
        onClose={() => setIsSubscriptionsOpen(false)}
        messages={messages}
        onFilterSender={(senderEmail) => setSearchQuery(senderEmail)}
        onToast={(type, text) => addToast(type, text)}
      />
    </div>
  );
}
