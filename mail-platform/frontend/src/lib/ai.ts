import { MessageSummary, MessageDetail } from '@/types/mail';

export interface EmailAiInsight {
  summary: string[];
  urgency: 'high' | 'medium' | 'low' | 'fyi';
  urgencyLabel: string;
  needsReply: boolean;
  actionReason: string;
  suggestedReplies: {
    title: string;
    tone: 'formal' | 'friendly' | 'brief';
    body: string;
  }[];
  keyPoints?: string[];
}

export interface UnreadEmailDigest {
  id: string;
  sender: string;
  subject: string;
  priority: 'urgent' | 'action' | 'newsletter' | 'fyi';
  priorityLabel: string;
  summary: string;
  date: string;
}

// Clean HTML tags and entities for NLP extraction
function cleanText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates an executive AI insight, TL;DR summary, action recommendation, and reply drafts for a selected email.
 */
export function analyzeEmailWithAi(message: MessageDetail): EmailAiInsight {
  const content = cleanText(message.body_plain || message.body_html || '');
  const subject = message.subject || '';
  const sender = message.sender_name || message.sender_address;
  const lowerContent = content.toLowerCase();
  const lowerSubject = subject.toLowerCase();

  // 1. Detect Urgency and Needs Reply
  const isNewsletter =
    lowerContent.includes('unsubscribe') ||
    lowerContent.includes('newsletter') ||
    lowerContent.includes('privacy policy') ||
    lowerSubject.includes('digest') ||
    lowerSubject.includes('edition');

  const isReceiptOrTransaction =
    lowerSubject.includes('receipt') ||
    lowerSubject.includes('invoice') ||
    lowerSubject.includes('payment') ||
    lowerSubject.includes('subscription') ||
    lowerContent.includes('total charged') ||
    lowerContent.includes('order number');

  const isUrgent =
    lowerContent.includes('urgent') ||
    lowerContent.includes('asap') ||
    lowerContent.includes('segera') ||
    lowerContent.includes('deadline') ||
    lowerContent.includes('penting') ||
    lowerSubject.includes('urgent') ||
    lowerSubject.includes('important');

  const asksQuestionOrRequest =
    lowerContent.includes('?') ||
    lowerContent.includes('please let me know') ||
    lowerContent.includes('mohon') ||
    lowerContent.includes('bisa') ||
    lowerContent.includes('can you') ||
    lowerContent.includes('could you') ||
    lowerContent.includes('apakah') ||
    lowerContent.includes('kabari');

  let urgency: 'high' | 'medium' | 'low' | 'fyi' = 'medium';
  let urgencyLabel = 'Action Recommended';
  let needsReply = true;
  let actionReason = 'Sender is requesting an update or response.';

  if (isNewsletter) {
    urgency = 'fyi';
    urgencyLabel = 'Newsletter / FYI';
    needsReply = false;
    actionReason = 'Informational newsletter. No reply needed.';
  } else if (isReceiptOrTransaction) {
    urgency = 'low';
    urgencyLabel = 'Billing & Receipt';
    needsReply = false;
    actionReason = 'Automated transaction receipt. Keep for records.';
  } else if (isUrgent) {
    urgency = 'high';
    urgencyLabel = 'Needs Reply: High Priority';
    needsReply = true;
    actionReason = 'Time-sensitive matter. Quick response recommended.';
  } else if (!asksQuestionOrRequest && lowerContent.length < 200) {
    urgency = 'low';
    urgencyLabel = 'Informational Note';
    needsReply = false;
    actionReason = 'Brief informational message.';
  }

  // 2. Generate TL;DR Bullet Points
  const sentences = content
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && !s.toLowerCase().includes('unsubscribe'));

  let summary: string[] = [];
  if (sentences.length > 0) {
    summary = sentences.slice(0, 3);
  } else {
    summary = [
      `Message from ${sender} regarding "${subject || 'email inquiry'}".`,
      content.slice(0, 160) + '...',
    ];
  }

  // 3. Generate Contextual Smart Suggested Reply Drafts
  const senderFirstName = sender.split(' ')[0].replace(/[^a-zA-Z]/g, '') || 'there';
  const myName = 'Ivan Affriandi';

  const suggestedReplies: EmailAiInsight['suggestedReplies'] = [];

  if (needsReply) {
    suggestedReplies.push({
      title: 'Acknowledge & Confirm',
      tone: 'friendly',
      body: `Hi ${senderFirstName},\n\nThank you for reaching out. I have reviewed your message regarding "${subject}" and everything looks good to proceed.\n\nBest regards,\n${myName}`,
    });

    suggestedReplies.push({
      title: 'Request More Details / Time',
      tone: 'formal',
      body: `Hi ${senderFirstName},\n\nThanks for your email. I am currently looking into this and will follow up with complete details shortly.\n\nBest,\n${myName}`,
    });

    suggestedReplies.push({
      title: 'Polite Decline / Reschedule',
      tone: 'formal',
      body: `Hi ${senderFirstName},\n\nThank you for the update. Unfortunately, I won't be able to accommodate this right now due to current scheduling, but let's connect again soon.\n\nRegards,\n${myName}`,
    });
  } else {
    suggestedReplies.push({
      title: 'Quick Thank You',
      tone: 'brief',
      body: `Thanks for the update, ${senderFirstName}! Much appreciated.\n\nBest,\n${myName}`,
    });
  }

  return {
    summary,
    urgency,
    urgencyLabel,
    needsReply,
    actionReason,
    suggestedReplies,
  };
}

/**
 * Analyzes unread / important messages in the mailbox to generate executive overview digest cards.
 */
export function generateUnreadDigest(messages: MessageSummary[]): UnreadEmailDigest[] {
  const unreadOrImportant = messages.filter((m) => !m.is_read || m.is_starred).slice(0, 5);

  return unreadOrImportant.map((msg) => {
    const sender = msg.sender_name || msg.sender_address.split('@')[0];
    const snippet = cleanText(msg.snippet || '');
    const lowerSub = (msg.subject || '').toLowerCase();
    const lowerSnip = snippet.toLowerCase();

    let priority: 'urgent' | 'action' | 'newsletter' | 'fyi' = 'fyi';
    let priorityLabel = 'FYI';

    if (
      lowerSub.includes('urgent') ||
      lowerSnip.includes('urgent') ||
      lowerSnip.includes('segera') ||
      lowerSub.includes('important')
    ) {
      priority = 'urgent';
      priorityLabel = 'Urgent Action';
    } else if (
      lowerSnip.includes('?') ||
      lowerSnip.includes('please') ||
      lowerSnip.includes('confirm') ||
      lowerSnip.includes('mohon')
    ) {
      priority = 'action';
      priorityLabel = 'Reply Needed';
    } else if (
      lowerSub.includes('newsletter') ||
      lowerSub.includes('digest') ||
      lowerSnip.includes('unsubscribe')
    ) {
      priority = 'newsletter';
      priorityLabel = 'Newsletter';
    }

    const summaryText =
      snippet.length > 110 ? snippet.slice(0, 110) + '...' : snippet || msg.subject || 'No preview available.';

    return {
      id: msg.id,
      sender,
      subject: msg.subject || '(No Subject)',
      priority,
      priorityLabel,
      summary: summaryText,
      date: msg.date,
    };
  });
}
