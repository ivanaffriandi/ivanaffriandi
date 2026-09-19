import * as htmlToImage from 'html-to-image';

/**
 * Converts a base64 Data URL into a browser File object.
 */
export async function dataUrlToFile(dataUrl: string, fileName: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], fileName, { type: 'image/png' });
}

/**
 * Copies a PNG data URL directly to the user's clipboard as an image blob.
 * On iOS, this enables Instagram to immediately show "Add Sticker from clipboard" in Stories.
 */
export async function copyImageToClipboard(dataUrl: string): Promise<boolean> {
  if (
    typeof navigator === 'undefined' ||
    !navigator.clipboard ||
    typeof window === 'undefined' ||
    !('ClipboardItem' in window)
  ) {
    return false;
  }
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': blob }),
    ]);
    return true;
  } catch (err) {
    console.warn('Clipboard image write skipped or failed:', err);
    return false;
  }
}

/**
 * Automatically triggers a browser download for an image data URL.
 */
export function downloadImage(dataUrl: string, fileName: string): void {
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
  downloaded: boolean;
  message: string;
}

/**
 * Captures an HTML element and converts it to a high-resolution transparent PNG Data URL.
 * Awaits web fonts and ensures all images are completely loaded.
 */
export async function captureElementToPng(element: HTMLElement): Promise<string> {
  // 1. Wait for custom web fonts
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // safe fallback
    }
  }

  // 2. Wait for internal images to complete loading
  const imgs = Array.from(element.querySelectorAll('img'));
  if (imgs.length > 0) {
    await Promise.all(
      imgs.map((img) => {
        if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
        return new Promise((resolve) => {
          const timer = setTimeout(() => resolve(false), 2500);
          img.onload = () => {
            clearTimeout(timer);
            resolve(true);
          };
          img.onerror = () => {
            clearTimeout(timer);
            resolve(false);
          };
        });
      })
    );
  }

  // 3. Generate transparent sticker PNG
  return await htmlToImage.toPng(element, {
    quality: 0.98,
    pixelRatio: 2, // 2x retina crispness for sticker
    cacheBust: true,
    skipAutoScale: true,
  });
}

/**
 * Shares a generated sticker via Web Share API & clipboard, or triggers fallback download.
 */
export async function shareOrDownloadStory(
  dataUrl: string,
  title: string,
  slug = 'sticker'
): Promise<ShareResult> {
  const fileName = `${slug.replace(/[^a-zA-Z0-9_-]/g, '_')}-sticker.png`;

  // 1. Attempt copying image to clipboard for instant iOS "Add Sticker" in Instagram
  const copied = await copyImageToClipboard(dataUrl);

  // 2. Convert to File object for native share sheet
  const file = await dataUrlToFile(dataUrl, fileName);

  const isWebShareAvailable =
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [file] });

  if (isWebShareAvailable) {
    try {
      await navigator.share({
        files: [file],
        title,
        text: `Read "${title}" on my journal: ivanaffriandi.com`,
      });
      return {
        shared: true,
        copied,
        downloaded: false,
        message: 'Sticker siap! Bisa kamu tempel & pindah-pindahkan di IG Story.',
      };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return {
          shared: false,
          copied,
          downloaded: false,
          message: copied ? 'Sticker disalin! Buka IG Story lalu paste.' : 'Share dibatalkan.',
        };
      }
      console.warn('Web Share failed, falling back to download:', err);
    }
  }

  // 3. Fallback: Automatic download for desktop or unsupported mobile browsers
  downloadImage(dataUrl, fileName);
  return {
    shared: false,
    copied,
    downloaded: true,
    message: 'Sticker tersimpan! Bisa kamu upload & geser-geser di IG Story.',
  };
}
