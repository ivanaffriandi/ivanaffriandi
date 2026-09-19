import * as htmlToImage from 'html-to-image';

/**
 * Converts a base64 Data URL into a browser File object synchronously.
 * 0ms delay ensures iOS Safari user gesture activation remains valid for navigator.share().
 */
export function dataUrlToFileSync(dataUrl: string, fileName: string): File {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mime });
}

export const dataUrlToFile = dataUrlToFileSync;

/**
 * Optional manual helper to download an image (exported for backwards compatibility).
 * NOTE: Never automatically called during mobile share flow.
 */
export function downloadImage(dataUrl: string, fileName: string): void {
  if (typeof document === 'undefined') return;
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export interface ShareResult {
  shared: boolean;
  copied: boolean;
  downloaded?: boolean;
  message: string;
}

/**
 * Captures an HTML element to PNG Data URL.
 * Optimized with fontEmbedCSS: '' to avoid parsing document stylesheets on mobile.
 */
export async function captureElementToPng(element: HTMLElement): Promise<string> {
  return await htmlToImage.toPng(element, {
    quality: 0.95,
    pixelRatio: 1, // Element is already 1080x1920
    cacheBust: false,
    skipAutoScale: true,
    fontEmbedCSS: '', // Skip document stylesheet parsing for 5x faster mobile performance
  });
}

/**
 * Shares the story directly via Web Share API without forcing an automatic download.
 * Automatically copies the article URL to clipboard so the user can easily paste it
 * into Instagram's native Link Sticker.
 */
export async function shareOrDownloadStory(
  dataUrl: string,
  title: string,
  slug = 'story',
  articleUrl = 'https://blog.ivanaffriandi.com'
): Promise<ShareResult> {
  const fileName = `${slug.replace(/[^a-zA-Z0-9_-]/g, '_')}-story.png`;

  // 1. Copy article link to clipboard so user can paste directly into Instagram's Link Sticker
  let linkCopied = false;
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(articleUrl);
      linkCopied = true;
    } catch {
      // safe fallback
    }
  }

  // 2. Synchronous File creation (0ms, keeps user activation alive)
  const file = dataUrlToFileSync(dataUrl, fileName);

  const sharePayloadWithUrl = {
    files: [file],
    title,
    text: `Read "${title}": ${articleUrl}`,
    url: articleUrl,
  };

  const sharePayloadFileOnly = {
    files: [file],
    title,
  };

  let canShareWithUrl = false;
  let canShareFileOnly = false;

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    if (typeof navigator.canShare === 'function') {
      try {
        canShareWithUrl = navigator.canShare(sharePayloadWithUrl);
      } catch {
        canShareWithUrl = false;
      }
      try {
        canShareFileOnly = navigator.canShare(sharePayloadFileOnly);
      } catch {
        canShareFileOnly = false;
      }
    } else {
      canShareFileOnly = true;
    }
  }

  if (canShareWithUrl || canShareFileOnly) {
    try {
      // Try sharing with URL first if supported, otherwise file only
      if (canShareWithUrl) {
        try {
          await navigator.share(sharePayloadWithUrl);
          return {
            shared: true,
            copied: linkCopied,
            downloaded: false,
            message: 'Link copied! In Instagram Story, paste it using the Link Sticker.',
          };
        } catch (shareWithUrlErr: unknown) {
          // If browser rejected sharing files+url together, retry with file only
          if (shareWithUrlErr instanceof Error && shareWithUrlErr.name === 'AbortError') {
            return {
              shared: false,
              copied: linkCopied,
              downloaded: false,
              message: 'Share cancelled.',
            };
          }
          if (canShareFileOnly) {
            await navigator.share(sharePayloadFileOnly);
            return {
              shared: true,
              copied: linkCopied,
              downloaded: false,
              message: 'Link copied! In Instagram Story, paste it using the Link Sticker.',
            };
          }
          throw shareWithUrlErr;
        }
      } else {
        await navigator.share(sharePayloadFileOnly);
        return {
          shared: true,
          copied: linkCopied,
          downloaded: false,
          message: 'Link copied! In Instagram Story, paste it using the Link Sticker.',
        };
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return {
          shared: false,
          copied: linkCopied,
          downloaded: false,
          message: 'Share cancelled.',
        };
      }
      console.warn('Share error:', err);
    }
  }

  // 3. DO NOT force automatic browser download.
  // Notify user that the link was copied.
  return {
    shared: false,
    copied: linkCopied,
    downloaded: false,
    message: linkCopied
      ? 'Story link copied to clipboard! Paste it with the Link Sticker in Stories.'
      : 'Use the share button to post.',
  };
}

