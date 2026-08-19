// Smart avatar and brand logo resolver

const CORPORATE_BRANDS: Record<string, string> = {
  'kakaotalk': 'https://www.google.com/s2/favicons?domain=kakaocorp.com&sz=128',
  'kakao.com': 'https://www.google.com/s2/favicons?domain=kakaocorp.com&sz=128',
  'resend.com': 'https://www.google.com/s2/favicons?domain=resend.com&sz=128',
  'resend.dev': 'https://www.google.com/s2/favicons?domain=resend.com&sz=128',
  'linear.app': 'https://www.google.com/s2/favicons?domain=linear.app&sz=128',
  'github.com': 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
  'cloudflare.com': 'https://www.google.com/s2/favicons?domain=cloudflare.com&sz=128',
  'vercel.com': 'https://www.google.com/s2/favicons?domain=vercel.com&sz=128',
  'oracle.com': 'https://www.google.com/s2/favicons?domain=oracle.com&sz=128',
  'stripe.com': 'https://www.google.com/s2/favicons?domain=stripe.com&sz=128',
  'notion.so': 'https://www.google.com/s2/favicons?domain=notion.so&sz=128',
  'figma.com': 'https://www.google.com/s2/favicons?domain=figma.com&sz=128',
  'slack.com': 'https://www.google.com/s2/favicons?domain=slack.com&sz=128',
  'spotify.com': 'https://www.google.com/s2/favicons?domain=spotify.com&sz=128',
};

const PERSONAL_DOMAINS = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'outlook.com',
  'hotmail.com', 'live.com', 'msn.com', 'icloud.com', 'me.com', 'mac.com',
  'aol.com', 'proton.me', 'protonmail.com', 'zoho.com', 'mail.com'
];

const PASTEL_GRADIENTS: [string, string][] = [
  ['#3b82f6', '#1d4ed8'],
  ['#6366f1', '#4338ca'],
  ['#ec4899', '#be185d'],
  ['#14b8a6', '#0f766e'],
  ['#f59e0b', '#b45309'],
  ['#8b5cf6', '#6d28d9'],
  ['#ef4444', '#b91c1c'],
  ['#10b981', '#047857'],
  ['#06b6d4', '#0e7490'],
  ['#f97316', '#c2410c'],
];

export function getAvatarGradient(key: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < (key || '').length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PASTEL_GRADIENTS[Math.abs(hash) % PASTEL_GRADIENTS.length];
}

export function getAvatarColor(key: string): string {
  return getAvatarGradient(key)[0];
}

export function getBrandOrAvatarUrl(email: string, name?: string): string | null {
  const cleanEmail = (email || '').toLowerCase().trim();
  const cleanName = (name || '').toLowerCase().trim();

  // 1. Check user uploaded custom avatar for Ivan Affriandi across all his addresses
  if (typeof window !== 'undefined') {
    const userAvatar = localStorage.getItem('mail_user_avatar');
    if (userAvatar) {
      if (
        cleanEmail.includes('ivanaffriandi') ||
        cleanEmail.includes('ivan') ||
        cleanName.includes('ivan affriandi') ||
        cleanName === 'ivan'
      ) {
        return userAvatar;
      }
    }

    // 2. Check saved contacts custom avatar
    const savedContactsRaw = localStorage.getItem('mail_contacts_list');
    if (savedContactsRaw) {
      try {
        const contacts = JSON.parse(savedContactsRaw);
        const match = contacts.find((c: any) => c.email && c.email.toLowerCase() === cleanEmail);
        if (match && match.avatar) return match.avatar;
      } catch {}
    }
  }

  if (!cleanEmail || !cleanEmail.includes('@')) return null;
  const domain = cleanEmail.split('@')[1] || '';

  // 3. Corporate Brand Logos (Only for real tech/corporate domains)
  for (const [brandKey, url] of Object.entries(CORPORATE_BRANDS)) {
    if (domain === brandKey || domain.endsWith('.' + brandKey) || cleanName.includes(brandKey)) {
      return url;
    }
  }

  // 4. Personal Email Providers: Query Gravatar for actual uploaded user avatars
  if (PERSONAL_DOMAINS.includes(domain)) {
    return `https://unavatar.io/gravatar/${encodeURIComponent(cleanEmail)}?fallback=false`;
  }

  // 5. Custom Company Domains: Try Gravatar first, fallback to domain favicon
  return `https://unavatar.io/${encodeURIComponent(cleanEmail)}?fallback=https%3A%2F%2Fwww.google.com%2Fs2%2Ffavicons%3Fdomain%3D${encodeURIComponent(domain)}%26sz%3D128`;
}
