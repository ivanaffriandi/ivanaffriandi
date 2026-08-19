/**
 * IVAN AFFRIANDI · PERSONAL CHANNEL & NEWSLETTER ENGINE
 * Minimalist Swiss / VisionOS Editorial Template
 * Ultra-clean typography, left-aligned header, 100% Dark & Light Mode compatible.
 */

export interface WelcomeEmailProps {
  subscriberEmail?: string;
}

export interface EditorialEmailProps {
  noteNumber?: string;
  date?: string;
  title: string;
  subtitle?: string;
  bodyHtml: string;
  articleUrl?: string;
  ctaText?: string;
  previewText?: string;
}

export interface ProjectUpdateEmailProps {
  tag?: string;
  title: string;
  subtitle?: string;
  descriptionHtml: string;
  previewImageUrl?: string;
  ctaUrl: string;
  ctaText?: string;
}

// ─── BASE EMAIL WRAPPER & RESPONSIVE STYLES ─────────────────────────────────
function wrapInEmailBoilerplate(contentHtml: string, previewText: string = ''): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>Ivan Affriandi</title>
  <style type="text/css">
    /* Base resets */
    :root {
      color-scheme: light only;
      supported-color-schemes: light only;
    }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F7F5F0 !important; color: #1C1917 !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
    
    /* Permanent Paper Mode (Strict consistency in both Light and Dark OS modes) */
    @media (prefers-color-scheme: dark) {
      body, .email-bg { background-color: #F7F5F0 !important; color: #1C1917 !important; }
      .email-card { background-color: #FFFFFF !important; border-color: rgba(0, 0, 0, 0.08) !important; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04) !important; color: #1C1917 !important; }
      .text-primary { color: #1C1917 !important; }
      .text-secondary { color: #44403C !important; }
      .text-muted { color: #78716C !important; }
      .divider-line { background-color: #E7E2D8 !important; border-color: #E7E2D8 !important; }
      .callout-box { background-color: #F5F2EB !important; border-color: #E7E2D8 !important; }
      .cta-button { background-color: #1C1917 !important; color: #FFFFFF !important; }
      .tag-pill { background-color: #E7E2D8 !important; color: #44403C !important; }
    }

    /* Mobile adjustments */
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 8px !important; }
      .email-card { padding: 24px 18px !important; border-radius: 20px !important; }
      .headline-text { font-size: 22px !important; line-height: 1.25 !important; }
      .body-text { font-size: 14.5px !important; line-height: 1.65 !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F5F0; color: #1C1917; -webkit-font-smoothing: antialiased;">
  <!-- Hidden preview snippet -->
  <div style="display: none; font-size: 1px; color: #F7F5F0; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    ${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-bg" style="background-color: #F7F5F0;">
    <tr>
      <td align="center" style="padding: 36px 16px 52px 16px;">
        <!-- Container max-width 560px -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px;" class="email-container">
          
          <!-- TOP CLEAN HEADER (SIMPLE LEFT-ALIGNED TEXT, NO LOGO ICON) -->
          <tr>
            <td align="left" style="padding-bottom: 16px; padding-left: 4px;">
              <a href="https://ivanaffriandi.com" target="_blank" style="text-decoration: none; display: inline-block;">
                <span class="text-primary" style="font-size: 13.5px; font-weight: 700; color: #1C1917; letter-spacing: -0.02em;">
                  Ivan Affriandi
                </span>
                <span class="text-muted" style="font-size: 12px; color: #78716C; margin-left: 6px; font-weight: 400;">
                  · Notes
                </span>
              </a>
            </td>
          </tr>

          <!-- MAIN CARD WRAPPER (PERMANENT PAPER MODE: WARM TACTILE LETTERHEAD) -->
          <tr>
            <td>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-card" style="background-color: #FFFFFF; border-radius: 24px; border: 1px solid rgba(0, 0, 0, 0.08); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); overflow: hidden; padding: 36px 32px;">
                <tr>
                  <td>
                    ${contentHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="left" style="padding-top: 22px; padding-left: 4px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="left" class="text-muted" style="font-size: 11.5px; color: #78716C; line-height: 1.6;">
                    Sent from <a href="https://ivanaffriandi.com" style="color: #78716C; text-decoration: underline;">ivanaffriandi.com</a>. Hit reply anytime.
                    <span style="color: #A8A29E; margin: 0 6px;">·</span>
                    <a href="https://ivanaffriandi.com/api/newsletter?action=unsubscribe" style="color: #78716C; text-decoration: underline;">Unsubscribe</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── TEMPLATE 1: CASUAL WELCOME / INTRO EMAIL ──────────────────────────────
export function renderWelcomeEmail(props?: WelcomeEmailProps): string {
  const contentHtml = `
    <!-- Top Meta Date / Note -->
    <div class="text-muted" style="font-size: 12px; color: #71717A; margin-bottom: 12px; font-weight: 500;">
      Welcome Note
    </div>

    <!-- Simple Left-Aligned Headline -->
    <h1 class="text-primary headline-text" style="margin: 0 0 18px 0; font-size: 24px; font-weight: 700; color: #09090B; letter-spacing: -0.025em; line-height: 1.25;">
      Glad you're here.
    </h1>

    <!-- Casual Body Content -->
    <div class="text-secondary body-text" style="font-size: 15px; color: #3F3F46; line-height: 1.7; letter-spacing: -0.01em;">
      <p style="margin: 0 0 16px 0;">
        Thanks for leaving your email. Think of this as my little personal corner on the internet.
      </p>
      
      <p style="margin: 0 0 16px 0;">
        I write whenever something interesting is on my mind — whether it's software craft, design details, things I’m building, tailoring &amp; atelier pieces, or just random thoughts and observations about life.
      </p>

      <p style="margin: 0 0 20px 0;">
        No rigid schedule and definitely no spam. Just honest notes whenever there's something genuinely worth sharing with you.
      </p>

      <!-- Soft callout note -->
      <div class="callout-box" style="background-color: #F9FAFB; border-radius: 14px; border: 1px solid #F3F4F6; padding: 16px 18px; margin: 22px 0;">
        <p style="margin: 0; font-size: 13.5px; color: #4B5563; line-height: 1.6;">
          <strong>Quick tip:</strong> If you ever have thoughts, questions, or just want to chat about anything, feel free to reply directly to this email. Every reply goes straight to my inbox.
        </p>
      </div>

      <p style="margin: 0 0 26px 0;">
        In the meantime, feel free to check out some of my recent writings and projects:
      </p>
    </div>

    <!-- CTA Button -->
    <table border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
      <tr>
        <td align="left">
          <a href="https://ivanaffriandi.com" target="_blank" class="cta-button" style="display: inline-block; background-color: #111827; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 11px 22px; border-radius: 9999px; letter-spacing: -0.01em; box-shadow: 0 2px 6px rgba(0,0,0,0.06);">
            Explore my website ↗
          </a>
        </td>
      </tr>
    </table>

    <!-- Signature -->
    <div style="border-top: 1px solid #F4F4F5; padding-top: 18px;" class="divider-line">
      <div class="text-primary" style="font-size: 14px; font-weight: 700; color: #111827;">Ivan Affriandi</div>
      <div class="text-muted" style="font-size: 11.5px; color: #71717A; margin-top: 2px;">Jakarta, ID</div>
    </div>
  `;

  return wrapInEmailBoilerplate(
    contentHtml,
    "Glad you're here — welcome to my personal channel."
  );
}

// ─── TEMPLATE 2: CASUAL NOTE / DISPATCH ────────────────────────────────────
export function renderEditorialEmail(props: EditorialEmailProps): string {
  const contentHtml = `
    <!-- Top Date / Note Tag -->
    <div class="text-muted" style="font-size: 12px; color: #71717A; margin-bottom: 12px; font-weight: 500;">
      ${props.noteNumber || 'Note'} · ${props.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
    </div>

    <!-- Main Headline -->
    <h1 class="text-primary headline-text" style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: #09090B; letter-spacing: -0.025em; line-height: 1.25;">
      ${props.title}
    </h1>

    ${
      props.subtitle
        ? `<p class="text-secondary" style="margin: 0 0 20px 0; font-size: 15px; color: #52525B; line-height: 1.5;">
            ${props.subtitle}
           </p>`
        : ''
    }

    <!-- Divider -->
    <div class="divider-line" style="height: 1px; background-color: #F4F4F5; margin: 18px 0;"></div>

    <!-- Body -->
    <div class="text-primary body-text" style="font-size: 15px; color: #27272A; line-height: 1.75; letter-spacing: -0.01em;">
      ${props.bodyHtml}
    </div>

    ${
      props.articleUrl
        ? `<!-- Link button -->
          <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #F4F4F5;" class="divider-line">
            <a href="${props.articleUrl}" target="_blank" class="cta-button" style="display: inline-block; background-color: #111827; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 11px 22px; border-radius: 9999px; letter-spacing: -0.01em;">
              ${props.ctaText || 'Read full piece on web ↗'}
            </a>
          </div>`
        : ''
    }

    <!-- Sign-off -->
    <div style="margin-top: 28px;">
      <p class="text-secondary" style="margin: 0 0 6px 0; font-size: 14.5px; color: #52525B;">
        Talk soon,
      </p>
      <div class="text-primary" style="font-size: 14px; font-weight: 700; color: #111827;">Ivan</div>
    </div>
  `;

  return wrapInEmailBoilerplate(
    contentHtml,
    props.previewText || props.subtitle || props.title
  );
}

// ─── TEMPLATE 3: CASUAL PROJECT UPDATE / EXPERIMENT SHARE ───────────────────
export function renderStudioReleaseEmail(props: ProjectUpdateEmailProps): string {
  const contentHtml = `
    <!-- Top Tag -->
    <div class="text-muted" style="font-size: 12px; color: #71717A; margin-bottom: 12px; font-weight: 500;">
      ${props.tag || 'Project Update'}
    </div>

    <!-- Headline -->
    <h1 class="text-primary headline-text" style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; color: #09090B; letter-spacing: -0.025em; line-height: 1.25;">
      ${props.title}
    </h1>

    ${
      props.subtitle
        ? `<p class="text-secondary" style="margin: 0 0 18px 0; font-size: 14.5px; color: #52525B; line-height: 1.5;">
            ${props.subtitle}
           </p>`
        : ''
    }

    ${
      props.previewImageUrl
        ? `<!-- Preview Image -->
          <div style="margin-bottom: 20px; border-radius: 16px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06);">
            <img src="${props.previewImageUrl}" alt="${props.title}" style="width: 100%; display: block; max-height: 360px; object-fit: cover;" />
          </div>`
        : ''
    }

    <!-- Description -->
    <div class="text-secondary body-text" style="font-size: 14.5px; color: #3F3F46; line-height: 1.7; margin-bottom: 24px;">
      ${props.descriptionHtml}
    </div>

    <!-- CTA Button -->
    <table border="0" cellpadding="0" cellspacing="0">
      <tr>
        <td align="left">
          <a href="${props.ctaUrl}" target="_blank" class="cta-button" style="display: inline-block; background-color: #111827; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 11px 22px; border-radius: 9999px; letter-spacing: -0.01em;">
            ${props.ctaText || 'Check it out ↗'}
          </a>
        </td>
      </tr>
    </table>

    <!-- Sign-off -->
    <div style="margin-top: 28px; border-top: 1px solid #F4F4F5; padding-top: 18px;" class="divider-line">
      <div class="text-primary" style="font-size: 14px; font-weight: 700; color: #111827;">Ivan</div>
    </div>
  `;

  return wrapInEmailBoilerplate(
    contentHtml,
    props.subtitle || props.title
  );
}
