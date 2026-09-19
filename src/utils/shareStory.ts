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
  downloaded: boolean;
  message: string;
}

/**
 * Captures an HTML element and converts it to a high-resolution PNG Data URL.
 */
export async function captureElementToPng(element: HTMLElement): Promise<string> {
  // Ensure custom web fonts are fully loaded before capturing
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch {
      // Safe fallback if document.fonts is not supported
    }
  }

  // Generate crisp 1080x1920 snapshot with pixel ratio 2 for retina fidelity
  return await htmlToImage.toPng(element, {
    quality: 0.98,
    pixelRatio: 1, // Element is already natively sized to 1080x1920
    cacheBust: true,
    skipAutoScale: true,
  });
}

/**
 * Shares a generated story image via Web Share API, or triggers an automatic fallback download.
 */
export async function shareOrDownloadStory(
  dataUrl: string,
  title: string,
  slug = 'story'
): Promise<ShareResult> {
  const fileName = `${slug.replace(/[^a-zA-Z0-9_-]/g, '_')}-story.png`;

  // 1. Convert to File object for navigator.share
  const file = await dataUrlToFile(dataUrl, fileName);

  // 2. Check if mobile Web Share API is available with file sharing support
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
        text: `Read "${title}" on my journal.`,
      });
      return { shared: true, downloaded: false, message: 'Shared successfully!' };
    } catch (err: unknown) {
      // If user aborted or canceled share sheet, do not force download
      if (err instanceof Error && err.name === 'AbortError') {
        return { shared: false, downloaded: false, message: 'Share sheet dismissed.' };
      }
      // For other share errors, proceed to fallback download
      console.warn('Web Share failed, falling back to download:', err);
    }
  }

  // 3. Fallback: Automatic download for desktop or unsupported mobile browsers
  downloadImage(dataUrl, fileName);
  return {
    shared: false,
    downloaded: true,
    message: 'Image saved! You can now upload it to your IG Story.',
  };
}
