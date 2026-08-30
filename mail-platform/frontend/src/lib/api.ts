import { Folder, MessageSummary, MessageDetail, DeliverabilityStats, AgendaItem } from '@/types/mail';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// ─── Read-state tracking (client-side optimistic) ───────────────────────────
function getReadMessageIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem('read_message_ids');
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

export function markMessageAsReadInStorage(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const set = getReadMessageIds();
    set.add(id);
    localStorage.setItem('read_message_ids', JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

export function markMessageAsUnreadInStorage(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const set = getReadMessageIds();
    set.delete(id);
    localStorage.setItem('read_message_ids', JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

// ─── Folders ────────────────────────────────────────────────────────────────
export async function fetchFolders(): Promise<Folder[]> {
  const res = await fetch(`${API_BASE}/folders`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load folders: ${res.status}`);
  return res.json();
}

// ─── Messages ────────────────────────────────────────────────────────────────
export async function fetchMessages(folderId?: string): Promise<MessageSummary[]> {
  const url = folderId
    ? `${API_BASE}/messages?folder_id=${folderId}`
    : `${API_BASE}/messages`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load messages: ${res.status}`);
  const data: MessageSummary[] = await res.json();
  return data.map((msg) => ({
    ...msg,
    is_read: Boolean(msg.is_read),
  }));
}

// ─── Message Detail ──────────────────────────────────────────────────────────
export async function fetchMessageDetail(id: string): Promise<MessageDetail> {
  markMessageAsReadInStorage(id);
  const res = await fetch(`${API_BASE}/messages/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load message: ${res.status}`);
  const data = await res.json();
  return { ...data, is_read: true };
}

// ─── Mark as read (server-side) ──────────────────────────────────────────────
export async function markAsRead(id: string): Promise<void> {
  markMessageAsReadInStorage(id);
  try {
    await fetch(`${API_BASE}/messages/${id}/read`, { method: 'PATCH', cache: 'no-store' });
  } catch {
    // best-effort
  }
}

// ─── Mark as unread (server-side) ────────────────────────────────────────────
export async function markAsUnread(id: string): Promise<void> {
  markMessageAsUnreadInStorage(id);
  try {
    await fetch(`${API_BASE}/messages/${id}/unread`, { method: 'PATCH', cache: 'no-store' });
  } catch {
    // best-effort
  }
}

// ─── Toggle Star ─────────────────────────────────────────────────────────────
export async function toggleStar(id: string): Promise<{ is_starred: boolean }> {
  const res = await fetch(`${API_BASE}/messages/${id}/star`, {
    method: 'PATCH',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Star failed: ${res.status}`);
  return res.json();
}

// ─── Send Message ────────────────────────────────────────────────────────────
export async function sendMessage(data: {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body_html: string;
  body_plain?: string;
  in_reply_to?: string;
  attachments?: { filename: string; content_type: string; data_base64: string }[];
}): Promise<{ status: string; message_id: string; id: string; thread_id?: string }> {
  const cleanEmail = (raw: string) => {
    if (!raw) return '';
    const trimmed = raw.trim();
    const match = trimmed.match(/<([^>]+)>/);
    return (match ? match[1] : trimmed).trim();
  };

  const payload = {
    ...data,
    to: (data.to || []).map(cleanEmail).filter(Boolean),
    cc: data.cc ? data.cc.map(cleanEmail).filter(Boolean) : [],
    bcc: data.bcc ? data.bcc.map(cleanEmail).filter(Boolean) : [],
    subject: data.subject || '(No Subject)',
    body_html: data.body_html || `<p>${data.body_plain || ''}</p>`,
    body_plain: data.body_plain || '',
    attachments: data.attachments || [],
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('mail_platform_session_token') : null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/messages/send`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => 'Unknown network error');
    throw new Error(`Send failed (${res.status}): ${err}`);
  }

  return res.json();
}

// ─── Archive / Delete / Move / Empty Trash ───────────────────────────────────
export async function archiveMessage(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/messages/${id}/archive`, {
    method: 'PATCH',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Archive failed: ${res.status}`);
}

export async function deleteMessage(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/messages/${id}`, {
    method: 'DELETE',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}

export async function emptyTrash(): Promise<void> {
  const res = await fetch(`${API_BASE}/messages/trash/empty`, {
    method: 'DELETE',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Empty trash failed: ${res.status}`);
}

// ─── Deliverability Stats ────────────────────────────────────────────────────
export async function fetchDeliverabilityStats(): Promise<DeliverabilityStats> {
  const res = await fetch(`${API_BASE}/stats/deliverability`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Stats fetch failed: ${res.status}`);
  return res.json();
}

// ─── Agenda / Calendar Cloud Sync ────────────────────────────────────────────
export async function fetchAgendas(): Promise<AgendaItem[]> {
  try {
    const res = await fetch(`${API_BASE}/agenda`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id,
      dateStr: item.date_str || item.dateStr,
      title: item.title,
      time: item.time,
      recurrence: item.recurrence || 'once',
      completed: Boolean(item.completed),
    }));
  } catch {
    return [];
  }
}

export async function saveAgenda(agenda: AgendaItem): Promise<AgendaItem | null> {
  try {
    const res = await fetch(`${API_BASE}/agenda`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: agenda.id,
        date_str: agenda.dateStr,
        title: agenda.title,
        time: agenda.time,
        recurrence: agenda.recurrence || 'once',
        completed: agenda.completed,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: data.id,
      dateStr: data.date_str || data.dateStr,
      title: data.title,
      time: data.time,
      recurrence: data.recurrence || 'once',
      completed: Boolean(data.completed),
    };
  } catch {
    return null;
  }
}

export async function toggleAgendaApi(id: string, completed: boolean): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/agenda/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteAgendaApi(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/agenda/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
}
