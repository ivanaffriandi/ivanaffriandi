"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export interface BlogPostItem {
  id: string;
  title: string;
  content: string;
  published: string;
  updated?: string;
  url?: string;
  labels?: string[];
  source?: "medium" | "blogger";
}

interface EditorialBlogProps {
  posts?: BlogPostItem[];
  initialPost?: BlogPostItem;
  currentPost?: BlogPostItem;
  prevPost?: BlogPostItem | null;
  nextPost?: BlogPostItem | null;
  initialComments?: any[];
}

interface InstagramPhoto {
  id: string;
  url: string;
  permalink?: string;
}

// All 45 authentic Instagram moments sorted by newest upload first
const ALL_MOMENTS_PHOTOS: InstagramPhoto[] = [
  { id: "627657157", url: "/images/moments/627657157_18090374564098563_1965153477745201663_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "623927781", url: "/images/moments/623927781_18089496431098563_7808236183056324880_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "612080824", url: "/images/moments/612080824_18087988394098563_4793774317004810121_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "608733839", url: "/images/moments/608733839_18086400230098563_8740604376033242248_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "608079301", url: "/images/moments/608079301_18086400239098563_3466106499873906770_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "607699037", url: "/images/moments/607699037_18086400221098563_7021199692187129737_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "601019678", url: "/images/moments/601019678_18085107524098563_5188627750063439998_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "598943412", url: "/images/moments/598943412_18085107533098563_2022381096122126117_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "584402021", url: "/images/moments/584402021_18082934018098563_6233301052415354921_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "584050535", url: "/images/moments/584050535_18082706678098563_5045516575306761751_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "582780594", url: "/images/moments/582780594_18082460615098563_6690568124177631838_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "539376687", url: "/images/moments/539376687_18073420037098563_2976323886970570360_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "539303572", url: "/images/moments/539303572_18073420046098563_1129254407547625674_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "539061835", url: "/images/moments/539061835_18073356941098563_4201444421477967261_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "538768606", url: "/images/moments/538768606_18073342169098563_2772787166870506295_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "538227209", url: "/images/moments/538227209_18073379072098563_248479474581214442_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "538062225", url: "/images/moments/538062225_18073306205098563_7466739179204313472_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "537479019", url: "/images/moments/537479019_18073342178098563_2165331162839779568_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "534677239", url: "/images/moments/534677239_18072433487098563_5147692994739687807_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "532047345", url: "/images/moments/532047345_18072433496098563_2204613642408576842_n..webp", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "523862377", url: "/images/moments/523862377_18070433870098563_7668524055374905760_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "515676788", url: "/images/moments/515676788_18068683484098563_5157626447354344841_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "515622791", url: "/images/moments/515622791_18068594354098563_7231367687985952977_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "515043142", url: "/images/moments/515043142_18068610035098563_4316722369364790783_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "509414434", url: "/images/moments/509414434_18067394924098563_6080711151400069719_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "506309709", url: "/images/moments/506309709_18066652295098563_5386843721917006306_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "504834828", url: "/images/moments/504834828_18066125465098563_815024945322165390_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "504450417", url: "/images/moments/504450417_18066122246098563_6518676063245732615_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "504422500", url: "/images/moments/504422500_18066124592098563_8697462423336798581_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "504008913", url: "/images/moments/504008913_18067303157098563_6545214301628971265_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "503547357", url: "/images/moments/503547357_18067303154098563_5284700593180224536_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "503461548", url: "/images/moments/503461548_18067303139098563_1767564915053915259_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "491109336", url: "/images/moments/491109336_18060820190098563_779269879364280171_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "490494934", url: "/images/moments/490494934_18060829358098563_6690275826446676296_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "490362933", url: "/images/moments/490362933_18060828515098563_4365648610343813957_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "490307779", url: "/images/moments/490307779_18060821810098563_6672692916374320684_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "490289674", url: "/images/moments/490289674_18060831101098563_7940423172567879925_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "490264363", url: "/images/moments/490264363_18060820598098563_7427301390244621778_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "489981712", url: "/images/moments/489981712_18060820535098563_7970226616275307425_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "489831318", url: "/images/moments/489831318_18060819218098563_9042912996466521959_n..jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "ig_sync_17901629463337008", url: "/images/moments/ig_sync_17901629463337008.jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "ig_sync_17923486992168198", url: "/images/moments/ig_sync_17923486992168198.jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "ig_sync_18031313687503181", url: "/images/moments/ig_sync_18031313687503181.jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "ig_sync_18289868383251215", url: "/images/moments/ig_sync_18289868383251215.jpg", permalink: "https://instagram.com/ivanaffriandi" },
  { id: "ig_sync_18547178128038926", url: "/images/moments/ig_sync_18547178128038926.jpg", permalink: "https://instagram.com/ivanaffriandi" },
];

function extractFirstImage(html: string): string | null {
  if (!html) return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!match) return null;
  let url = match[1];
  if (url.includes("tracking") || url.includes("pixel") || url.includes("1x1")) return null;
  url = url.replace(/\/s\d+(-c)?\//, "/s1600/").replace(/\/w\d+-h\d+(-c)?\//, "/s1600/");
  url = url.replace(/\/resize:fit:\d+\//, "/resize:fit:1600/");
  return url;
}

function cleanHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<font[^>]*>/gi, "")
    .replace(/<\/font>/gi, "")
    .replace(/\s*style="[^"]*"/gi, "")
    .replace(/\s*face="[^"]*"/gi, "")
    .replace(/\s*size="[^"]*"/gi, "")
    .replace(/<p[^>]*>\s*(?:&nbsp;|<br\s*\/?>|\s)*<\/p>/gi, "")
    .replace(/(<br\s*\/?>[\s]*){3,}/gi, "<br><br>");
}

function cleanChapterTitle(title: string): string {
  if (!title) return "";
  return title.replace(/^Chapter\s+\d+:\s*/i, "").trim();
}

function formatPostDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    const month = months[d.getMonth()];
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return "";
  }
}

export default function EditorialBlog({
  posts = [],
  initialPost,
  currentPost: propCurrentPost,
  prevPost: propPrevPost,
  nextPost: propNextPost,
}: EditorialBlogProps) {
  // Sort posts (newest first, reverse-chronological order)
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const timeA = new Date(a.published).getTime() || 0;
      const timeB = new Date(b.published).getTime() || 0;
      return timeB - timeA;
    });
  }, [posts]);

  // Active post: if initialPost or propCurrentPost is provided, we are viewing that specific post page.
  // Otherwise, we are on the homepage / TOC. Each post is its own distinct page.
  const activePost = propCurrentPost || initialPost || null;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showIndex, setShowIndex] = useState(false);
  const [typedCount, setTypedCount] = useState(0);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [instagramPhotos, setInstagramPhotos] = useState<InstagramPhoto[]>(ALL_MOMENTS_PHOTOS);
  const fullMessage = "hi, i'm ivan.";

  // Animated typing text for homepage hero: "hi, i'm ivan." (smooth, no blinking cursor)
  useEffect(() => {
    let count = 0;
    setTypedCount(0);
    const timer = setInterval(() => {
      count++;
      setTypedCount(count);
      if (count >= fullMessage.length) {
        clearInterval(timer);
      }
    }, 60);

    return () => clearInterval(timer);
  }, []);

  // Track scroll percentage for the navbar interactive loading line
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const current = window.scrollY || document.documentElement.scrollTop || 0;
        const pct = Math.min(100, Math.max(0, (current / scrollHeight) * 100));
        setScrollPercent(pct);
      } else {
        setScrollPercent(0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activePost]);

  // Sync fresh photos from API if available
  useEffect(() => {
    let isMounted = true;
    fetch("/api/instagram")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.media && Array.isArray(data.media) && data.media.length > 0) {
          const liveMedia: InstagramPhoto[] = data.media
            .map((m: any) => ({
              id: String(m.id),
              url: m.media_url || m.thumbnail_url,
              permalink: m.permalink || "https://instagram.com/ivanaffriandi",
            }))
            .filter((m: any) => Boolean(m.url));
          if (liveMedia.length > 0) {
            setInstagramPhotos(liveMedia);
          }
        }
      })
      .catch((err) => {
        console.warn("[Instagram] Using built-in moments:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Lock body scroll when menu overlay is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  // Dynamic dark mode & iOS status bar synchronization
  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncThemeToSystem = () => {
      const isDark =
        document.documentElement.getAttribute("data-theme") === "dark" ||
        (!document.documentElement.getAttribute("data-theme") &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      const color = isDark ? "#000000" : "#ffffff";
      const scheme = isDark ? "dark" : "light";

      document.documentElement.style.colorScheme = scheme;
      document.body.style.colorScheme = scheme;
      document.documentElement.style.backgroundColor = color;
      document.body.style.backgroundColor = color;

      const metas = document.querySelectorAll('meta[name="theme-color"]');
      metas.forEach((m) => {
        m.removeAttribute("media");
        m.setAttribute("content", color);
      });
    };

    syncThemeToSystem();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => syncThemeToSystem();
    mediaQuery.addEventListener("change", listener);

    const observer = new MutationObserver(() => syncThemeToSystem());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      mediaQuery.removeEventListener("change", listener);
      observer.disconnect();
    };
  }, []);

  // Extract photo ONLY if this post actually contains an image
  const postImage = useMemo(() => {
    if (!activePost?.content) return null;
    return extractFirstImage(activePost.content);
  }, [activePost]);

  // Find previous and next post for pagination in reader
  const { prevPost, nextPost } = useMemo(() => {
    if (!activePost) return { prevPost: null, nextPost: null };
    if (propPrevPost !== undefined && propNextPost !== undefined) {
      return { prevPost: propPrevPost, nextPost: propNextPost };
    }
    const currentIndex = sortedPosts.findIndex((p) => p.id === activePost.id);
    if (currentIndex === -1) return { prevPost: null, nextPost: null };

    // Previous = newer post in list (index - 1)
    const prev = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;
    // Next = older post in list (index + 1)
    const next = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null;

    return { prevPost: prev, nextPost: next };
  }, [sortedPosts, activePost, propPrevPost, propNextPost]);

  return (
    <div className="editorial-canvas">
      <style jsx global>{`
        /* ── DYNAMIC THEME SYSTEM: PURE WHITE IN LIGHT MODE, PURE BLACK IN DARK MODE ── */
        :root {
          color-scheme: dark light;
          --blog-bg: #ffffff;
          --blog-fg: #000000;
          --blog-fg-secondary: #444444;
          --blog-fg-muted: #888888;
          --blog-border: rgba(0, 0, 0, 0.08);
          --blog-line: #000000;
          --blog-img-bg: #f5f5f5;
          --blog-hover: rgba(0, 0, 0, 0.04);
        }

        :global(html),
        :global(body) {
          background-color: var(--blog-bg) !important;
          color: var(--blog-fg) !important;
        }

        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) {
            color-scheme: dark !important;
            --blog-bg: #000000;
            --blog-fg: #ffffff;
            --blog-fg-secondary: #a8a8a8;
            --blog-fg-muted: #666666;
            --blog-border: rgba(255, 255, 255, 0.12);
            --blog-line: #ffffff;
            --blog-img-bg: #111111;
            --blog-hover: rgba(255, 255, 255, 0.08);
          }
          :global(html:not([data-theme="light"])),
          :global(body:not([data-theme="light"])) {
            color-scheme: dark !important;
            background-color: #000000 !important;
            color: #ffffff !important;
          }
        }

        [data-theme="dark"] {
          color-scheme: dark !important;
          --blog-bg: #000000;
          --blog-fg: #ffffff;
          --blog-fg-secondary: #a8a8a8;
          --blog-fg-muted: #666666;
          --blog-border: rgba(255, 255, 255, 0.12);
          --blog-line: #ffffff;
          --blog-img-bg: #111111;
          --blog-hover: rgba(255, 255, 255, 0.08);
        }

        :global(html[data-theme="dark"]),
        :global(html[data-theme="dark"] body) {
          color-scheme: dark !important;
          background-color: #000000 !important;
          color: #ffffff !important;
        }

        [data-theme="light"] {
          color-scheme: light !important;
          --blog-bg: #ffffff;
          --blog-fg: #000000;
          --blog-fg-secondary: #444444;
          --blog-fg-muted: #888888;
          --blog-border: rgba(0, 0, 0, 0.08);
          --blog-line: #000000;
          --blog-img-bg: #f5f5f5;
          --blog-hover: rgba(0, 0, 0, 0.04);
        }

        :global(html[data-theme="light"]),
        :global(html[data-theme="light"] body) {
          color-scheme: light !important;
          background-color: #ffffff !important;
          color: #000000 !important;
        }

        /* ── COMPLETE SCROLLER SUPPRESSION ── */
        * {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }

        *::-webkit-scrollbar,
        html::-webkit-scrollbar,
        body::-webkit-scrollbar,
        div::-webkit-scrollbar,
        main::-webkit-scrollbar {
          display: none !important;
          width: 0px !important;
          height: 0px !important;
          background: transparent !important;
        }

        /* ── ALL LOWERCASE ACROSS BLOG WEB ── */
        .editorial-canvas,
        .editorial-canvas *,
        .editorial-menu-overlay,
        .editorial-menu-overlay * {
          text-transform: lowercase !important;
          font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        html,
        body {
          background-color: var(--blog-bg) !important;
          color: var(--blog-fg) !important;
          margin: 0;
          padding: 0;
          width: 100%;
          max-width: 100vw;
          font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .layout-wrapper,
        .content-wrapper {
          background-color: var(--blog-bg) !important;
          padding: 0 !important;
          margin: 0 !important;
          max-width: 100% !important;
          width: 100% !important;
        }

        .desktop-nav-bar,
        .mobile-header-bar {
          display: none !important;
        }

        button {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background: transparent;
          border: none;
          outline: none;
          padding: 0;
          margin: 0;
          font: inherit;
          color: inherit;
        }

        /* ── MINIMALIST FULLSCREEN SIDEBAR MENU (EDITORIAL HUB) ── */
        .editorial-menu-overlay {
          position: fixed !important;
          inset: 0 !important;
          z-index: 99999 !important;
          background-color: var(--blog-bg) !important;
          color: var(--blog-fg) !important;
          display: flex !important;
          flex-direction: column !important;
          box-sizing: border-box !important;
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
        }

        .menu-inner-container {
          min-height: 100%;
          display: flex;
          flex-direction: column;
          padding: 1.8rem 4rem 0 4rem;
          box-sizing: border-box;
          max-width: 1000px;
          margin: 0 auto;
          width: 100%;
          justify-content: space-between;
        }

        @media (max-width: 860px) {
          .menu-inner-container {
            padding: calc(1rem + env(safe-area-inset-top, 0px)) 1.5rem 0 1.5rem;
          }
        }

        .menu-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .menu-brand-title {
          font-size: 0.92rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          color: var(--blog-fg);
        }

        .menu-close-btn {
          cursor: pointer;
          color: var(--blog-fg);
          font-size: 0.92rem;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          opacity: 0.85;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .menu-close-btn:hover {
          opacity: 1;
          transform: scale(1.05);
        }

        /* Editorial Hub Content: Primary Nav + Ethos */
        .menu-hub-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 3.5rem;
          padding: 3rem 0;
          width: 100%;
        }

        @media (max-width: 860px) {
          .menu-hub-content {
            gap: 2.4rem;
            padding: 2rem 0;
          }
        }

        .menu-primary-links {
          display: flex;
          flex-direction: column;
          gap: 1.6rem;
        }

        @media (max-width: 860px) {
          .menu-primary-links {
            gap: 1.35rem;
          }
        }

        .menu-hub-link {
          display: flex;
          align-items: baseline;
          gap: 1.2rem;
          text-decoration: none;
          color: var(--blog-fg);
          transition: opacity 0.2s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .menu-hub-link:hover {
          opacity: 0.6;
          transform: translateX(6px);
        }

        .menu-hub-link.disabled {
          pointer-events: none !important;
          cursor: default !important;
          user-select: none !important;
          opacity: 0.35 !important;
        }

        .menu-hub-link.disabled:hover {
          transform: none !important;
          opacity: 0.35 !important;
        }

        .menu-hub-link-title {
          font-size: clamp(1.8rem, 4.2vw, 2.6rem);
          font-weight: 500;
          line-height: 1.1;
          letter-spacing: -0.03em;
        }

        .menu-hub-link-desc {
          font-size: 0.88rem;
          color: var(--blog-fg-muted);
          letter-spacing: 0.02em;
        }

        @media (max-width: 600px) {
          .menu-hub-link-desc {
            display: none;
          }
        }

        /* Ethos statement inside sidebar */
        .menu-ethos-section {
          max-width: 520px;
          border-left: 1.5px solid var(--blog-line);
          padding-left: 1.4rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .menu-ethos-text {
          font-size: 0.96rem;
          line-height: 1.65;
          color: var(--blog-fg-secondary);
          margin: 0;
        }

        .menu-ethos-meta {
          font-size: 0.82rem;
          color: var(--blog-fg-muted);
          letter-spacing: 0.03em;
          display: inline-flex;
          align-items: center;
        }

        .ethos-dash-line {
          display: inline-block;
          width: 44px;
          height: 1.5px;
          background-color: currentColor;
          opacity: 0.35;
          vertical-align: middle;
          margin: 0 0.55rem;
          border-radius: 1px;
        }

        .ethos-dot {
          display: inline-block;
          margin: 0 0.45rem;
          opacity: 0.35;
          font-size: 0.85rem;
        }

        .menu-bottom-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          margin-top: auto;
          padding-top: 0.9rem;
          padding-bottom: 1rem;
          border-top: 1px solid var(--blog-border);
        }

        @media (max-width: 860px) {
          .menu-bottom-bar {
            padding-top: 0.85rem;
            padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
          }
        }

        .menu-social-icons {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }

        .menu-icon-btn {
          color: var(--blog-fg);
          opacity: 0.7;
          display: flex;
          align-items: center;
          transition: opacity 0.2s ease, transform 0.2s ease;
          text-decoration: none;
        }

        .menu-icon-btn:hover {
          opacity: 1;
          transform: translateY(-1px);
        }

        .menu-copyright {
          font-size: 0.82rem;
          color: var(--blog-fg-muted);
        }
      `}</style>

      <style jsx global>{`
        .editorial-canvas {
          min-height: 100vh;
          width: 100%;
          max-width: 100vw;
          background-color: var(--blog-bg);
          color: var(--blog-fg);
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          position: relative;
        }

        /* ── SLIM, ELEGANT FIXED NAVBAR (NOT LEBAR/NOT BULKY) ── */
        .editorial-navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 4rem;
          box-sizing: border-box;
          width: 100%;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background-color: var(--blog-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: background-color 0.3s ease;
          border-bottom: none !important;
        }

        @media (max-width: 860px) {
          .editorial-navbar {
            padding: calc(0.75rem + env(safe-area-inset-top, 0px)) 1.75rem 0.75rem 1.75rem;
          }
        }

        /* Left: Minimal 2-Bar Toggle (Opens Sidebar Menu) */
        .nav-toggle-btn {
          cursor: pointer;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          color: var(--blog-fg);
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .nav-toggle-btn:hover {
          opacity: 0.5;
        }

        .nav-toggle-btn:active {
          transform: scale(0.92);
        }

        .toggle-icon-wrap {
          width: 16px;
          display: flex;
          flex-direction: column;
          gap: 3.5px;
          justify-content: center;
        }

        .toggle-line {
          display: block;
          width: 100%;
          height: 1.5px;
          background-color: var(--blog-fg);
          border-radius: 1px;
          transition: transform 0.2s ease;
        }

        .nav-toggle-btn:hover .toggle-line:first-child {
          transform: translateX(2px);
        }

        .nav-toggle-btn:hover .toggle-line:last-child {
          transform: translateX(-2px);
        }

        /* Center Brand: ivan ─── affriandi with scroll loading line */
        .nav-brand {
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          text-decoration: none;
          color: var(--blog-fg);
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: -0.01em;
          user-select: none;
          transition: opacity 0.2s ease;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
        }

        .brand-word {
          color: var(--blog-fg);
          font-weight: 500;
        }

        .brand-scroll-track {
          display: inline-flex;
          align-items: center;
          position: relative;
          width: clamp(50px, 9vw, 130px);
          height: 1.5px;
          background-color: var(--blog-border);
          border-radius: 999px;
          overflow: hidden;
          vertical-align: middle;
          transform: translateZ(0);
        }

        .brand-scroll-fill {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          background-color: var(--blog-fg);
          border-radius: 999px;
          transform: translateZ(0);
          will-change: width, transform;
          transition: width 0.32s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .nav-brand:hover {
          opacity: 0.65;
        }

        @media (max-width: 600px) {
          .nav-brand {
            font-size: 0.88rem;
            gap: 0.45rem;
          }
          .brand-scroll-track {
            width: clamp(32px, 10vw, 60px);
          }
        }

        /* Right: Minimalist @ Icon Link to Instagram */
        .nav-right-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

        .nav-at-link {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--blog-fg);
          opacity: 1;
          padding: 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
          text-decoration: none;
        }

        .nav-at-link:hover {
          opacity: 0.65;
          transform: scale(1.08);
        }

        .nav-at-link:active {
          transform: scale(0.92);
        }

        /* ── PROPER PAGE BODY TOP OFFSET (GENEROUS SAFE CLEARANCE UNDER NAVBAR) ── */
        .editorial-page-body {
          width: 100%;
          display: flex;
          flex-direction: column;
          flex: 1;
          padding-top: calc(5.2rem + env(safe-area-inset-top, 0px));
          box-sizing: border-box;
        }

        @media (max-width: 860px) {
          .editorial-page-body {
            padding-top: calc(5rem + env(safe-area-inset-top, 0px));
          }
        }

        /* ── HOMEPAGE: CENTERED HERO PHOTO (COMPACT, BLACK & WHITE) ── */
        .editorial-home-wrap {
          display: flex !important;
          flex-direction: column !important;
          flex: 1 !important;
          min-height: calc(100vh - 5.4rem - env(safe-area-inset-top, 0px)) !important;
          width: 100% !important;
          max-width: 960px !important;
          margin: 0 auto !important;
          padding: 1.5rem 2rem 0 2rem !important;
          box-sizing: border-box !important;
        }

        @media (max-width: 860px) {
          .editorial-home-wrap {
            min-height: calc(100vh - 5.2rem - env(safe-area-inset-top, 0px)) !important;
            padding: 1rem 1.5rem 0 1.5rem !important;
          }
        }

        .hero-center-stage {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 2.5rem 0;
          box-sizing: border-box;
        }

        @media (max-width: 860px) {
          .hero-center-stage {
            padding: 1.8rem 0;
          }
        }

        .hero-photo-frame {
          position: relative;
          display: inline-flex;
          flex-direction: column;
        }

        .hero-typing-wrap {
          position: absolute;
          bottom: calc(100% + 0.6rem);
          left: 0;
          display: inline-flex;
          align-items: baseline;
          font-size: clamp(0.92rem, 1.3vw, 1.05rem);
          font-weight: 400;
          color: var(--blog-fg);
          letter-spacing: -0.015em;
          white-space: nowrap;
          user-select: none;
        }

        .hero-typing-text {
          color: var(--blog-fg);
        }

        .hero-name-bold {
          font-weight: 700;
          color: var(--blog-fg);
        }

        /* ── HOMEPAGE: STAGE VIEWPORT & CROSSFADE (100% FLICKER-FREE, ULTRA-SMOOTH) ── */
        .editorial-stage-viewport {
          position: relative !important;
          width: 100% !important;
          display: grid !important;
          grid-template-columns: 100% !important;
          align-items: start !important;
          min-height: calc(100vh - 5.4rem - env(safe-area-inset-top, 0px)) !important;
        }

        .editorial-hero-view,
        .editorial-index-view {
          grid-area: 1 / 1 / 2 / 2 !important;
          width: 100% !important;
          box-sizing: border-box !important;
          display: flex !important;
          flex-direction: column !important;
          min-height: calc(100vh - 5.4rem - env(safe-area-inset-top, 0px)) !important;
          transition: opacity 0.42s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.42s cubic-bezier(0.22, 1, 0.36, 1) !important;
          will-change: opacity, transform !important;
        }

        .editorial-hero-view {
          max-width: 960px !important;
          margin: 0 auto !important;
          padding: 1.5rem 2rem 0 2rem !important;
        }

        .editorial-index-view {
          max-width: 780px !important;
          margin: 0 auto !important;
          padding: 1.25rem 2.5rem 0 2.5rem !important;
        }

        .editorial-hero-view.stage-active {
          opacity: 1 !important;
          transform: translateY(0) scale(1) !important;
          pointer-events: auto !important;
          visibility: visible !important;
          z-index: 2 !important;
        }

        .editorial-hero-view.stage-hidden {
          opacity: 0 !important;
          transform: translateY(-14px) scale(0.99) !important;
          pointer-events: none !important;
          visibility: hidden !important;
          z-index: 1 !important;
          transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                      visibility 0s 0.35s !important;
        }

        .editorial-index-view.stage-active {
          opacity: 1 !important;
          transform: translateY(0) scale(1) !important;
          pointer-events: auto !important;
          visibility: visible !important;
          z-index: 2 !important;
        }

        .editorial-index-view.stage-hidden {
          opacity: 0 !important;
          transform: translateY(16px) scale(0.99) !important;
          pointer-events: none !important;
          visibility: hidden !important;
          z-index: 1 !important;
          transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
                      visibility 0s 0.35s !important;
        }

        @media (max-width: 860px) {
          .editorial-stage-viewport {
            min-height: calc(100vh - 5.2rem - env(safe-area-inset-top, 0px)) !important;
          }
          .editorial-hero-view {
            min-height: calc(100vh - 5.2rem - env(safe-area-inset-top, 0px)) !important;
            padding: 1rem 1.5rem 0 1.5rem !important;
          }
          .editorial-index-view {
            min-height: calc(100vh - 5.2rem - env(safe-area-inset-top, 0px)) !important;
            padding: 0.9rem 1.6rem 0 1.6rem !important;
          }
        }

        /* ── HORIZONTAL SCROLLABLE INSTAGRAM MOMENTS CAROUSEL ── */
        .hero-ig-stage {
          position: relative !important;
          width: 100% !important;
          max-width: 680px !important;
          margin: 0 auto !important;
          display: flex !important;
          flex-direction: column !important;
          box-sizing: border-box !important;
        }

        .hero-typing-wrap {
          align-self: flex-start !important;
          margin-bottom: 0.7rem !important;
          display: inline-flex !important;
          align-items: baseline !important;
          font-size: clamp(0.92rem, 1.3vw, 1.05rem) !important;
          font-weight: 400 !important;
          color: var(--blog-fg) !important;
          letter-spacing: -0.015em !important;
          white-space: nowrap !important;
          user-select: none !important;
        }

        .hero-typing-text {
          color: var(--blog-fg) !important;
        }

        .hero-name-bold {
          font-weight: 700 !important;
          color: var(--blog-fg) !important;
        }

        .hero-ig-carousel {
          display: flex !important;
          gap: 0.85rem !important;
          overflow-x: auto !important;
          scroll-snap-type: x mandatory !important;
          -webkit-overflow-scrolling: touch !important;
          padding: 0.35rem 0.15rem !important;
          width: 100% !important;
          box-sizing: border-box !important;
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }

        :global(.hero-ig-carousel) {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }

        :global(.hero-ig-carousel::-webkit-scrollbar),
        :global(.hero-ig-carousel::-webkit-scrollbar-thumb),
        :global(.hero-ig-carousel::-webkit-scrollbar-track),
        :global(.hero-ig-carousel::-webkit-scrollbar-corner) {
          display: none !important;
          width: 0px !important;
          height: 0px !important;
          max-height: 0px !important;
          background: transparent !important;
          opacity: 0 !important;
          visibility: hidden !important;
          -webkit-appearance: none !important;
        }

        .hero-ig-carousel::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        .hero-ig-item {
          position: relative !important;
          flex: 0 0 clamp(160px, 20vw, 205px) !important;
          aspect-ratio: 4 / 5 !important;
          overflow: hidden !important;
          border-radius: 2px !important;
          background-color: var(--blog-img-bg) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06) !important;
          border: 1px solid var(--blog-border) !important;
          scroll-snap-align: start !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -webkit-touch-callout: none !important;
          touch-action: pan-x !important;
        }

        .hero-ig-img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: center !important;
          display: block !important;
          filter: grayscale(100%) contrast(108%) !important;
          -webkit-filter: grayscale(100%) contrast(108%) !important;
          pointer-events: none !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -webkit-touch-callout: none !important;
        }

        .hero-photo-shield {
          position: absolute !important;
          inset: 0 !important;
          z-index: 5 !important;
          width: 100% !important;
          height: 100% !important;
          background: transparent !important;
          user-select: none !important;
          -webkit-user-select: none !important;
          -webkit-touch-callout: none !important;
          touch-action: pan-x !important;
          pointer-events: auto !important;
          cursor: grab !important;
        }

        .hero-index-wrap {
          align-self: flex-end !important;
          margin-top: 0.75rem !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: flex-end !important;
        }

        .hero-index-btn {
          cursor: pointer !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 0.35rem !important;
          color: var(--blog-fg) !important;
          font-size: clamp(0.92rem, 1.3vw, 1.05rem) !important;
          font-weight: 500 !important;
          letter-spacing: -0.01em !important;
          padding: 0.2rem 0 !important;
          border-bottom: 1px solid transparent !important;
          transition: opacity 0.2s ease, border-bottom-color 0.2s ease, transform 0.2s ease !important;
          background: transparent !important;
          border: none !important;
        }

        .hero-index-btn:hover {
          opacity: 0.65 !important;
          border-bottom-color: var(--blog-fg) !important;
          transform: translateY(1px) !important;
        }

        .hero-index-label {
          color: var(--blog-fg) !important;
          font-weight: 500 !important;
        }

        /* ── CENTERED INDEX STAGE ── */
        .index-center-stage {
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
          align-items: center !important;
          width: 100% !important;
          padding: 1.5rem 0 !important;
          box-sizing: border-box !important;
        }

        .editorial-index-list {
          display: flex !important;
          flex-direction: column !important;
          width: 100% !important;
          margin: 0 !important;
        }

        .editorial-index-item {
          display: flex !important;
          align-items: baseline !important;
          justify-content: space-between !important;
          gap: 1.5rem !important;
          padding: 1.05rem 0 !important;
          border-bottom: 1px solid var(--blog-border) !important;
          text-decoration: none !important;
          color: var(--blog-fg) !important;
          transition: opacity 0.2s ease, transform 0.2s ease !important;
        }

        .editorial-index-item:first-child {
          border-top: 1px solid var(--blog-border) !important;
        }

        .editorial-index-item:hover {
          opacity: 0.6 !important;
          transform: translateX(3px) !important;
        }

        .index-item-left {
          display: flex !important;
          align-items: baseline !important;
          gap: 1.1rem !important;
          min-width: 0 !important;
          flex: 1 !important;
        }

        .editorial-index-num {
          font-size: 0.86rem !important;
          color: var(--blog-fg-muted) !important;
          font-variant-numeric: tabular-nums !important;
          letter-spacing: 0.02em !important;
          flex-shrink: 0 !important;
          width: 2rem !important;
        }

        .editorial-index-title {
          font-size: clamp(1.05rem, 2vw, 1.25rem) !important;
          font-weight: 500 !important;
          line-height: 1.35 !important;
          color: var(--blog-fg) !important;
          letter-spacing: -0.015em !important;
        }

        .editorial-index-date {
          font-size: 0.8rem !important;
          color: var(--blog-fg-muted) !important;
          white-space: nowrap !important;
          letter-spacing: 0.02em !important;
          flex-shrink: 0 !important;
        }

        @media (max-width: 600px) {
          .editorial-index-item {
            padding: 0.9rem 0 !important;
            gap: 0.75rem !important;
          }
          .editorial-index-title {
            font-size: 0.98rem !important;
            line-height: 1.35 !important;
          }
          .editorial-index-date {
            font-size: 0.75rem !important;
          }
          .editorial-index-num {
            font-size: 0.8rem !important;
            width: 1.6rem !important;
          }
          .index-item-left {
            gap: 0.75rem !important;
          }
        }

        .editorial-index-page-wrap .editorial-footer {
          margin-top: auto !important;
          padding-top: 0.9rem !important;
          padding-bottom: 1rem !important;
        }

        @media (max-width: 860px) {
          .editorial-index-page-wrap .editorial-footer {
            margin-top: auto !important;
            padding-top: 0.85rem !important;
            padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px)) !important;
          }
        }
        .editorial-toc-wrap {
          max-width: 780px;
          width: 100%;
          margin: 0 auto;
          padding: 1.25rem 3rem 0 3rem;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: auto;
        }

        @media (max-width: 860px) {
          .editorial-toc-wrap {
            padding: 1rem 1.85rem 0 1.85rem;
            min-height: auto;
          }
        }

        /* ── COMPACT, SLEEK INSTAGRAM FILMSTRIP (ALL 45 PHOTOS, HITAM PUTIH, SCROLLABLE) ── */
        .editorial-ig-strip-wrap {
          width: 100%;
          margin-top: 0.8rem;
          margin-bottom: 2.8rem;
          position: relative;
        }

        @media (max-width: 860px) {
          .editorial-ig-strip-wrap {
            margin-top: 0.8rem;
            margin-bottom: 2.4rem;
            margin-left: 0;
            margin-right: 0;
            width: 100%;
          }
        }

        .editorial-ig-strip {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          scroll-snap-type: x mandatory;
          padding: 0.25rem 0 0.5rem 0;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        @media (max-width: 860px) {
          .editorial-ig-strip {
            padding-left: 0;
            padding-right: 0;
            gap: 0.75rem;
          }
        }

        .editorial-ig-strip::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        /* Sleek compact square thumbnail: 80px on mobile, 90px on desktop */
        .editorial-ig-card {
          flex: 0 0 90px;
          width: 90px;
          height: 90px;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background-color: var(--blog-img-bg);
          scroll-snap-align: start;
          display: block;
          text-decoration: none;
          position: relative;
          box-sizing: border-box;
          border-radius: 4px;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
        }

        @media (max-width: 600px) {
          .editorial-ig-card {
            flex: 0 0 80px;
            width: 80px;
            height: 80px;
            aspect-ratio: 1 / 1;
          }
        }

        .editorial-ig-card:hover {
          transform: translateY(-2px);
        }

        .editorial-ig-card:active {
          transform: scale(0.97);
        }

        .editorial-ig-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: grayscale(100%) contrast(106%);
          transition: filter 0.35s ease, transform 0.35s ease;
        }

        .editorial-ig-card:hover .editorial-ig-img {
          filter: grayscale(0%);
          transform: scale(1.05);
        }

        /* ── DAFTAR ISI LIST ── */
        .editorial-toc-list {
          display: flex;
          flex-direction: column;
          gap: 1.85rem;
          width: 100%;
        }

        @media (max-width: 860px) {
          .editorial-toc-list {
            gap: 1.55rem;
          }
        }

        .editorial-toc-item {
          display: flex;
          align-items: baseline;
          text-align: left;
          background: transparent;
          border: none;
          padding: 0.2rem 0;
          cursor: pointer;
          width: 100%;
          color: var(--blog-fg);
          text-decoration: none;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease;
        }

        .editorial-toc-item:hover {
          opacity: 0.6;
          transform: translateX(4px);
        }

        .editorial-toc-item:active {
          transform: scale(0.99);
        }

        .editorial-toc-num {
          font-size: 0.92rem;
          color: var(--blog-fg-muted);
          width: 2.8rem;
          flex-shrink: 0;
          letter-spacing: 0.02em;
          font-variant-numeric: tabular-nums;
        }

        @media (max-width: 600px) {
          .editorial-toc-num {
            font-size: 0.86rem;
            width: 2.2rem;
          }
        }

        .editorial-toc-title {
          font-size: clamp(1.18rem, 2.4vw, 1.48rem);
          font-weight: 500;
          line-height: 1.32;
          letter-spacing: -0.02em;
          color: var(--blog-fg);
        }

        @media (max-width: 600px) {
          .editorial-toc-title {
            font-size: clamp(1.1rem, 4.8vw, 1.25rem);
            line-height: 1.34;
          }
        }

        /* ── ARTICLE READER LAYOUT (COMFORTABLE BREATHING ROOM UNDER NAVBAR) ── */
        .editorial-content-wrap {
          max-width: 980px;
          width: 100%;
          margin: 0 auto;
          padding: 1.5rem 3.5rem 0 3.5rem;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: auto;
        }

        @media (max-width: 860px) {
          .editorial-content-wrap {
            padding: 1.25rem 1.85rem 0 1.85rem;
            min-height: auto;
          }
        }

        .editorial-main-grid {
          display: grid;
          grid-template-columns: minmax(280px, 38%) minmax(320px, 62%);
          gap: 4.5rem;
          align-items: start;
          width: 100%;
        }

        @media (max-width: 860px) {
          .editorial-main-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 1.5rem !important;
          }
        }

        /* Left Column: Title + Cover Photo */
        .editorial-left-col {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          min-height: auto !important;
          height: auto !important;
          box-sizing: border-box;
        }

        .editorial-title {
          font-size: clamp(1.85rem, 2.7vw, 2.65rem);
          font-weight: 500;
          line-height: 1.18;
          letter-spacing: -0.03em;
          margin: 0.6rem 0 1.8rem 0;
          color: var(--blog-fg);
          width: 100%;
          max-width: 100%;
          word-break: normal;
          overflow-wrap: break-word;
          hyphens: none;
        }

        @media (max-width: 860px) {
          .editorial-title {
            font-size: clamp(1.55rem, 6vw, 1.95rem);
            line-height: 1.24;
            letter-spacing: -0.025em;
            margin: 0.6rem 0 1.6rem 0;
          }
        }

        .editorial-left-photo-wrap {
          margin-top: 1.8rem;
          width: 100%;
          max-width: 100%;
          aspect-ratio: 4 / 3;
          overflow: hidden;
          background-color: var(--blog-img-bg);
          box-sizing: border-box;
        }

        @media (max-width: 860px) {
          .editorial-left-photo-wrap {
            aspect-ratio: 16 / 10;
            margin-top: 1.15rem;
          }
        }

        .editorial-bw-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          filter: grayscale(100%) contrast(106%);
          transition: filter 0.4s ease;
        }

        .editorial-bw-img:hover {
          filter: grayscale(0%);
        }

        /* Right Column: Vertical Line + Body Prose */
        .editorial-right-col {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          min-height: auto !important;
          box-sizing: border-box;
        }

        /* Signature Editorial Vertical Line: visible on both desktop & mobile */
        .editorial-vertical-line {
          width: 1.5px;
          height: 52px;
          background-color: var(--blog-line);
          margin-bottom: 1.8rem;
          display: block;
          flex-shrink: 0;
          opacity: 0.8;
        }

        @media (max-width: 860px) {
          .editorial-vertical-line {
            display: block !important;
            height: 36px !important;
            width: 1.5px !important;
            margin: 0.25rem 0 1.6rem 0 !important;
            opacity: 0.8 !important;
          }
        }

        .editorial-body-prose {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
          font-size: 1.02rem;
          line-height: 1.76;
          color: var(--blog-fg-secondary);
          word-break: normal;
          overflow-wrap: break-word;
        }

        .editorial-body-prose :global(p) {
          margin: 0 0 1.6rem 0;
          max-width: 100%;
          word-break: normal;
          overflow-wrap: break-word;
        }

        @media (max-width: 860px) {
          .editorial-body-prose {
            font-size: 0.98rem;
            line-height: 1.72;
          }

          .editorial-body-prose :global(p) {
            margin: 0 0 1.35rem 0;
          }
        }

        .editorial-body-prose :global(h2),
        .editorial-body-prose :global(h3) {
          font-size: 1.35rem;
          font-weight: 500;
          letter-spacing: -0.02em;
          margin: 2.2rem 0 0.9rem 0;
          color: var(--blog-fg);
          max-width: 100%;
          word-break: normal;
          overflow-wrap: break-word;
        }

        .editorial-body-prose :global(blockquote) {
          margin: 1.8rem 0;
          padding-left: 1.4rem;
          border-left: 2px solid var(--blog-line);
          font-style: italic;
          color: var(--blog-fg-secondary);
          max-width: 100%;
          box-sizing: border-box;
          word-break: normal;
          overflow-wrap: break-word;
        }

        .editorial-body-prose :global(img) {
          display: none !important;
        }

        /* ── PREVIOUS & NEXT BLOG NAVIGATION (SPACIOUS SEPARATION) ── */
        .editorial-bottom-nav {
          margin-top: 4.5rem;
          padding-top: 2rem;
          border-top: 1px solid var(--blog-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          box-sizing: border-box;
          gap: 1.5rem;
        }

        @media (max-width: 600px) {
          .editorial-bottom-nav {
            margin-top: 3.8rem;
            padding-top: 1.6rem;
            gap: 1.2rem;
          }
        }

        .editorial-nav-placeholder {
          flex: 1;
        }

        .editorial-nav-btn {
          cursor: pointer;
          color: var(--blog-fg);
          display: inline-flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.4rem 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
          max-width: 48%;
          text-align: left;
          text-decoration: none;
        }

        .editorial-nav-btn.next-btn {
          text-align: right;
          margin-left: auto;
          justify-content: flex-end;
        }

        .editorial-nav-btn:hover {
          opacity: 0.6;
        }

        .editorial-nav-btn.prev-btn:hover {
          transform: translateX(-3px);
        }

        .editorial-nav-btn.next-btn:hover {
          transform: translateX(3px);
        }

        .nav-arrow {
          font-size: 1.1rem;
          line-height: 1;
          opacity: 0.6;
          flex-shrink: 0;
        }

        .nav-label {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          overflow: hidden;
        }

        .nav-label.text-right {
          align-items: flex-end;
        }

        .nav-dir {
          font-size: 0.72rem;
          color: var(--blog-fg-muted);
          letter-spacing: 0.05em;
          text-transform: lowercase;
        }

        .nav-title {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--blog-fg);
          line-height: 1.35;
          white-space: normal;
          word-break: normal;
          overflow-wrap: break-word;
          max-width: 320px;
        }

        @media (max-width: 600px) {
          .nav-title {
            font-size: 0.84rem;
            max-width: 220px;
            white-space: normal;
          }
        }

        /* ── MINIMALIST FOOTNOTE / FOOTER: BALANCED WITH COMFORTABLE BOTTOM MARGIN ── */
        .editorial-footer {
          margin-top: 2rem;
          padding-top: 0.9rem;
          padding-bottom: 1rem;
          border-top: 1px solid var(--blog-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          box-sizing: border-box;
        }

        .editorial-toc-wrap .editorial-footer,
        .editorial-home-wrap .editorial-footer,
        .editorial-index-page-wrap .editorial-footer {
          margin-top: auto;
          padding-top: 0.9rem;
          padding-bottom: 1rem;
        }

        .editorial-content-wrap .editorial-footer {
          margin-top: 2.2rem;
          padding-top: 0.9rem;
          padding-bottom: 1.25rem;
        }

        @media (max-width: 860px) {
          .editorial-footer {
            margin-top: 1.6rem;
            padding-top: 0.85rem;
            padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
          }

          .editorial-toc-wrap .editorial-footer,
          .editorial-home-wrap .editorial-footer,
          .editorial-index-page-wrap .editorial-footer {
            margin-top: auto;
            padding-top: 0.85rem;
            padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
          }

          .editorial-content-wrap .editorial-footer {
            margin-top: 2rem;
            padding-top: 0.85rem;
            padding-bottom: calc(1.15rem + env(safe-area-inset-bottom, 0px));
          }
        }

        .footer-social-icons {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }

        .footer-icon-btn {
          color: var(--blog-fg);
          opacity: 0.7;
          display: flex;
          align-items: center;
          transition: opacity 0.2s ease, transform 0.2s ease;
          text-decoration: none;
        }

        .footer-icon-btn:hover {
          opacity: 1;
          transform: translateY(-1px);
        }

        .footer-copyright {
          font-size: 0.82rem;
          color: var(--blog-fg-muted);
          letter-spacing: 0.02em;
        }

        @media (max-width: 600px) {
          .footer-copyright {
            font-size: 0.76rem;
          }
        }
      `}</style>

      {/* ── SLIM TOP NAVBAR (FIXED AT TOP, NOT LEBAR/BULKY) ── */}
      <header className="editorial-navbar">
        {/* Left: Minimal 2-Bar Toggle Button (Transforms to iOS Back Chevron when Index is open) */}
        <button
          type="button"
          className={`nav-toggle-btn ${showIndex ? "nav-back-mode" : ""}`}
          onClick={() => {
            if (showIndex) {
              setShowIndex(false);
            } else {
              setIsMenuOpen(true);
            }
          }}
          aria-label={showIndex ? "back to home" : "open menu"}
          title={showIndex ? "back" : "menu"}
        >
          {showIndex ? (
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ios-back-chevron"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          ) : (
            <span className="toggle-icon-wrap">
              <span className="toggle-line" />
              <span className="toggle-line" />
            </span>
          )}
        </button>

        {/* Center: brand ivan ─── affriandi with interactive scroll loading line */}
        <Link
          href="/"
          className="nav-brand"
          aria-label="ivan affriandi home"
          onClick={() => setShowIndex(false)}
        >
          <span className="brand-word">ivan</span>
          <span className="brand-scroll-track" aria-hidden="true">
            <span
              className={`brand-scroll-fill ${!activePost ? "brand-fill-active" : ""}`}
              style={{ width: !activePost ? "100%" : `${scrollPercent}%` }}
            />
          </span>
          <span className="brand-word">affriandi</span>
        </Link>

        {/* Right: Instagram @ */}
        <div className="nav-right-actions">
          <a
            href="https://instagram.com/ivanaffriandi"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-at-link"
            aria-label="instagram @ivanaffriandi"
            title="instagram @ivanaffriandi"
          >
            <svg
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4" />
              <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
            </svg>
          </a>
        </div>
      </header>

      {/* ── MINIMALIST FULLSCREEN SIDEBAR MENU (EDITORIAL HUB & ETHOS) ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="editorial-menu-overlay"
            initial={{ y: "-100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{
              duration: 0.42,
              ease: [0.16, 1, 0.3, 1], // iOS fluid spring curve
            }}
            className="editorial-menu-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100vw",
              height: "100dvh",
              zIndex: 999999,
              backgroundColor: "var(--blog-bg, #000000)",
            }}
          >
            <div className="menu-inner-container">
              {/* Top Bar: Brand on Left, Close on Right */}
              <div className="menu-top-bar">
                <span className="menu-brand-title">ivan affriandi</span>

                <button
                  type="button"
                  className="menu-close-btn"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="close menu"
                >
                  <span>close</span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Center: Editorial Nav Hub (Primary Links: Works & Ask) */}
              <div className="menu-hub-content">
                <div className="menu-primary-links">
                  <div
                    className="menu-hub-link disabled"
                    aria-disabled="true"
                    tabIndex={-1}
                  >
                    <span className="menu-hub-link-title">works</span>
                    <span className="menu-hub-link-desc">— software architecture &amp; interface craft</span>
                  </div>

                  <Link
                    href="/ask"
                    className="menu-hub-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="menu-hub-link-title">ask</span>
                    <span className="menu-hub-link-desc">— interactive anonymous q&amp;a</span>
                  </Link>
                </div>

                {/* Personal Poetic Ethos (In English, Puitis & Metaforik) */}
                <div className="menu-ethos-section">
                  <p className="menu-ethos-text">
                    like water tracing across stone,<br />
                    never rushed, yet always finding a way.<br />
                    we tend to stillness in a restless world,<br />
                    for what holds meaning grows with time.
                  </p>
                  <span className="menu-ethos-meta">
                    <span>ams</span>
                    <span className="ethos-dash-line" aria-hidden="true" />
                    <span>jkt</span>
                    <span className="ethos-dot" aria-hidden="true">·</span>
                    <span>2023</span>
                  </span>
                </div>
              </div>

              {/* Bottom Bar: Social Icons on Left, Copyright on Right */}
              <div className="menu-bottom-bar">
                <div className="menu-social-icons">
                  <a
                    href="https://instagram.com/ivanaffriandi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="menu-icon-btn"
                    aria-label="instagram"
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                  <a
                    href="https://x.com/ivanaffriandi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="menu-icon-btn"
                    aria-label="x"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="mailto:ivan@ivanaffriandi.com"
                    className="menu-icon-btn"
                    aria-label="email"
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </a>
                </div>
                <span className="menu-copyright">© 2026 ivan affriandi</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PAGE BODY: DIRECT PAGE RENDERING (NO MORPHING ANIMATION) ── */}
      <div
        className="editorial-page-body"
        style={{
          display: isMenuOpen ? "none" : undefined,
        }}
        aria-hidden={isMenuOpen}
      >
        {!activePost ? (
          /* ── HOMEPAGE: STAGE VIEWPORT (HERO & INDEX BOTH MOUNTED, ZERO BLANK FRAMES, 100% FLICKER-FREE) ── */
          <div className="editorial-stage-viewport">
            {/* ── STAGE 1: HERO VIEW (HORIZONTAL SCROLLABLE INSTAGRAM MOMENTS) ── */}
            <div
              className={`editorial-hero-view ${!showIndex ? "stage-active" : "stage-hidden"}`}
              aria-hidden={showIndex}
            >
              <div className="hero-center-stage">
                <div className="hero-ig-stage">
                  {/* Top-left of photos: Typing animation "hi, i'm ivan." with bold ivan */}
                  <div className="hero-typing-wrap">
                    <span className="hero-typing-text">
                      {typedCount <= 8 ? (
                        fullMessage.slice(0, typedCount)
                      ) : (
                        <>
                          hi, i'm{" "}
                          <strong className="hero-name-bold">
                            {fullMessage.slice(8, Math.min(12, typedCount))}
                          </strong>
                          {typedCount >= 13 ? "." : ""}
                        </>
                      )}
                    </span>
                  </div>

                  {/* Center: Horizontal Scrollable Instagram Photos (100% monochrome, protected from save/zoom/hold) */}
                  <div
                    className="hero-ig-carousel"
                    tabIndex={0}
                    role="region"
                    aria-label="instagram photos"
                    style={{
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                  >
                    {instagramPhotos.map((photo, idx) => (
                      <div
                        key={photo.id || idx}
                        className="hero-ig-item"
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        <img
                          src={photo.url}
                          alt="ivan affriandi moment"
                          className="hero-ig-img"
                          loading={idx < 4 ? "eager" : "lazy"}
                          draggable={false}
                          onContextMenu={(e) => e.preventDefault()}
                          style={{
                            filter: "grayscale(100%) contrast(108%)",
                            WebkitFilter: "grayscale(100%) contrast(108%)",
                            pointerEvents: "none",
                            userSelect: "none",
                            WebkitUserSelect: "none",
                            WebkitTouchCallout: "none",
                          }}
                        />
                        {/* Transparent overlay shield completely blocking zoom, hold/callout, and save while allowing horizontal pan */}
                        <div
                          className="hero-photo-shield"
                          aria-hidden="true"
                          onContextMenu={(e) => e.preventDefault()}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Bottom-right of photos: Single English word for table of contents */}
                  <div className="hero-index-wrap">
                    <button
                      type="button"
                      className="hero-index-btn"
                      onClick={() => {
                        setShowIndex(true);
                        if (typeof window !== "undefined" && window.scrollY > 40) {
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      aria-label="open index of writings"
                    >
                      <span className="hero-index-label">index</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Footnote / Footer: Snug right below without big gap */}
              <footer className="editorial-footer">
                <div className="footer-social-icons">
                  <a
                    href="https://instagram.com/ivanaffriandi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-icon-btn"
                    aria-label="instagram"
                    title="instagram"
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                  <a
                    href="https://x.com/ivanaffriandi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-icon-btn"
                    aria-label="x (twitter)"
                    title="x (twitter)"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="mailto:ivan@ivanaffriandi.com"
                    className="footer-icon-btn"
                    aria-label="email"
                    title="email"
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </a>
                </div>
                <span className="footer-copyright">© 2026 ivan affriandi</span>
              </footer>
            </div>

            {/* ── STAGE 2: IN-PAGE EMBEDDED INDEX VIEW ("NEMPEK DI PAGE", NO POPUP) ── */}
            <div
              className={`editorial-index-view ${showIndex ? "stage-active" : "stage-hidden"}`}
              aria-hidden={!showIndex}
            >
              <div className="index-center-stage">
                <div className="editorial-index-list">
                  {sortedPosts.map((post, idx) => {
                    const formattedNum = String(idx + 1).padStart(2, "0");
                    const cleanPostTitle = cleanChapterTitle(post.title);
                    const postDate = formatPostDate(post.published);
                    return (
                      <Link
                        key={post.id}
                        href={`/blog/${post.id}`}
                        className="editorial-index-item"
                      >
                        <div className="index-item-left">
                          <span className="editorial-index-num">{formattedNum}</span>
                          <span className="editorial-index-title">{cleanPostTitle}</span>
                        </div>
                        {postDate && (
                          <span className="editorial-index-date">{postDate}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Footnote / Footer: Snug right below without big gap */}
              <footer className="editorial-footer">
                <div className="footer-social-icons">
                  <a
                    href="https://instagram.com/ivanaffriandi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-icon-btn"
                    aria-label="instagram"
                    title="instagram"
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                  <a
                    href="https://x.com/ivanaffriandi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-icon-btn"
                    aria-label="x (twitter)"
                    title="x (twitter)"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a
                    href="mailto:ivan@ivanaffriandi.com"
                    className="footer-icon-btn"
                    aria-label="email"
                    title="email"
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </a>
                </div>
                <span className="footer-copyright">© 2026 ivan affriandi</span>
              </footer>
            </div>
          </div>
        ) : (
          /* ── VIEW 2: ARTICLE READER VIEW (DEDICATED INDIVIDUAL PAGE) ── */
          <article className="editorial-content-wrap">
            <div className="editorial-main-grid">
              {/* LEFT COLUMN: TITLE + DATE + (PHOTO UNDER TITLE IF POST HAS ONE, B&W MINIMALIST) */}
              <div className="editorial-left-col">
                <h1 className="editorial-title">{cleanChapterTitle(activePost.title)}</h1>

                {/* Published Date (Clean, without edited text) */}
                {activePost.published && (
                  <div className="editorial-article-meta">
                    <span className="editorial-article-date">
                      {formatPostDate(activePost.published)}
                    </span>
                  </div>
                )}

                {/* Photo placed under Title, Black & White Minimalist */}
                {postImage && (
                  <div className="editorial-left-photo-wrap">
                    <img
                      src={postImage}
                      alt={activePost.title}
                      className="editorial-bw-img"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: VERTICAL LINE + BODY PROSE */}
              <div className="editorial-right-col">
                {/* The signature vertical line */}
                <div className="editorial-vertical-line" />

                {/* Post Content */}
                <div
                  className="editorial-body-prose"
                  dangerouslySetInnerHTML={{ __html: cleanHtml(activePost.content) }}
                />

                {/* Bottom Navigation: Previous & Next Blog Pages */}
                <div className="editorial-bottom-nav">
                  {prevPost ? (
                    <Link
                      href={`/blog/${prevPost.id}`}
                      className="editorial-nav-btn prev-btn"
                    >
                      <span className="nav-arrow">←</span>
                      <span className="nav-label">
                        <span className="nav-dir">previous</span>
                        <span className="nav-title">{cleanChapterTitle(prevPost.title)}</span>
                      </span>
                    </Link>
                  ) : (
                    <div className="editorial-nav-placeholder" />
                  )}

                  {nextPost ? (
                    <Link
                      href={`/blog/${nextPost.id}`}
                      className="editorial-nav-btn next-btn"
                    >
                      <span className="nav-label text-right">
                        <span className="nav-dir">next</span>
                        <span className="nav-title">{cleanChapterTitle(nextPost.title)}</span>
                      </span>
                      <span className="nav-arrow">→</span>
                    </Link>
                  ) : (
                    <div className="editorial-nav-placeholder" />
                  )}
                </div>

                {/* Footnote / Footer: Snug right below nav without big gap */}
                <footer className="editorial-footer">
                  <div className="footer-social-icons">
                    <a
                      href="https://instagram.com/ivanaffriandi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-icon-btn"
                      aria-label="instagram"
                      title="instagram"
                    >
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    </a>
                    <a
                      href="https://x.com/ivanaffriandi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="footer-icon-btn"
                      aria-label="x (twitter)"
                      title="x (twitter)"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    <a
                      href="mailto:ivan@ivanaffriandi.com"
                      className="footer-icon-btn"
                      aria-label="email"
                      title="email"
                    >
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </a>
                  </div>
                  <span className="footer-copyright">© 2026 ivan affriandi</span>
                </footer>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
