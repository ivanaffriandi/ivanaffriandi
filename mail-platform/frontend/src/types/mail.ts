export interface Folder {
  id: string;
  name: string;
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'archive' | 'spam' | 'custom';
  unread_count: number;
  total_count: number;
}

export interface Attachment {
  id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  is_inline: boolean;
  checksum_sha256: string;
}

export interface MessageSummary {
  id: string;
  thread_id?: string;
  mailbox_id: string;
  sender_name?: string;
  sender_address: string;
  recipient_to: string;
  subject: string;
  date: string;
  snippet?: string;
  is_read: boolean;
  is_starred: boolean;
  is_draft?: boolean;
  has_attachments: boolean;
  spam_score: number;
  spam_status: 'ham' | 'spam' | 'quarantine';
}

export interface MessageDetail extends MessageSummary {
  recipient_cc?: string;
  recipient_bcc?: string;
  message_id_header?: string;
  in_reply_to_header?: string;
  references_header?: string;
  body_plain?: string;
  body_html?: string;
  created_at?: string;
  attachments: Attachment[];
}

export type Message = MessageDetail;

export interface DeliverabilityStats {
  inbound_count: number;
  outbound_count: number;
  bounce_count: number;
  spam_detected_count: number;
  spf_success_rate: number;
  dkim_success_rate: number;
  dmarc_success_rate: number;
  queue_depth: number;
}

export interface AgendaItem {
  id: string;
  dateStr: string;
  title: string;
  time?: string;
  recurrence?: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  completed: boolean;
}

export interface SubscriptionItem {
  id: string;
  sender_name: string;
  sender_address: string;
  latest_subject: string;
  latest_date: string;
  total_emails: number;
  unsubscribe_url?: string;
  unsubscribe_email?: string;
  is_unsubscribed?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'occasional';
}

