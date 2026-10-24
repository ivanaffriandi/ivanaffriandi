"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export interface BlogPostItem {
  id: string;
  title: string;
  content: string;
  published: string;
  url?: string;
  labels?: string[];
  source?: "medium" | "blogger";
}

interface EditorialBlogProps {
  posts?: BlogPostItem[];
  initialPost?: BlogPostItem;
  initialComments?: any[];
}

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

export default function EditorialBlog({
  posts = [],
  initialPost,
}: EditorialBlogProps) {
  // Sort posts (newest first)
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const timeA = new Date(a.published).getTime() || 0;
      const timeB = new Date(b.published).getTime() || 0;
      return timeB - timeA;
    });
  }, [posts]);

  // Active post
  const [activePostId, setActivePostId] = useState<string>(() => {
    if (initialPost?.id) return initialPost.id;
    if (sortedPosts.length > 0) return sortedPosts[0].id;
    return "";
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Sync if initialPost changes
  useEffect(() => {
    if (initialPost?.id) {
      setActivePostId(initialPost.id);
    } else if (sortedPosts.length > 0 && !activePostId) {
      setActivePostId(sortedPosts[0].id);
    }
  }, [initialPost, sortedPosts, activePostId]);

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

  const currentPost = useMemo(() => {
    return sortedPosts.find((p) => p.id === activePostId) || sortedPosts[0] || null;
  }, [sortedPosts, activePostId]);

  // Extract photo ONLY if this post actually contains an image
  const postImage = useMemo(() => {
    if (!currentPost?.content) return null;
    return extractFirstImage(currentPost.content);
  }, [currentPost]);

  // Find next post for simple pagination
  const nextPost = useMemo(() => {
    if (!currentPost) return null;
    const currentIndex = sortedPosts.findIndex((p) => p.id === currentPost.id);
    if (currentIndex >= 0 && currentIndex < sortedPosts.length - 1) {
      return sortedPosts[currentIndex + 1];
    }
    if (sortedPosts.length > 1 && currentIndex === sortedPosts.length - 1) {
      return sortedPosts[0];
    }
    return null;
  }, [sortedPosts, currentPost]);

  const handleSelectPost = (postId: string) => {
    setActivePostId(postId);
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/blog/${postId}`);
    }
  };

  return (
    <div className="editorial-canvas">
      <style jsx global>{`
        /* ── DYNAMIC THEME SYSTEM: PURE WHITE IN LIGHT MODE, PURE BLACK IN DARK MODE ── */
        :root {
          --blog-bg: #ffffff;
          --blog-fg: #000000;
          --blog-fg-secondary: #444444;
          --blog-fg-muted: #888888;
          --blog-border: rgba(0, 0, 0, 0.08);
          --blog-line: #000000;
          --blog-img-bg: #f5f5f5;
          --blog-hover: rgba(0, 0, 0, 0.04);
        }

        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) {
            --blog-bg: #000000;
            --blog-fg: #ffffff;
            --blog-fg-secondary: #a8a8a8;
            --blog-fg-muted: #666666;
            --blog-border: rgba(255, 255, 255, 0.12);
            --blog-line: #ffffff;
            --blog-img-bg: #111111;
            --blog-hover: rgba(255, 255, 255, 0.08);
          }
        }

        [data-theme="dark"] {
          --blog-bg: #000000;
          --blog-fg: #ffffff;
          --blog-fg-secondary: #a8a8a8;
          --blog-fg-muted: #666666;
          --blog-border: rgba(255, 255, 255, 0.12);
          --blog-line: #ffffff;
          --blog-img-bg: #111111;
          --blog-hover: rgba(255, 255, 255, 0.08);
        }

        [data-theme="light"] {
          --blog-bg: #ffffff;
          --blog-fg: #000000;
          --blog-fg-secondary: #444444;
          --blog-fg-muted: #888888;
          --blog-border: rgba(0, 0, 0, 0.08);
          --blog-line: #000000;
          --blog-img-bg: #f5f5f5;
          --blog-hover: rgba(0, 0, 0, 0.04);
        }

        /* ── COMPLETE SCROLLER SUPPRESSION: JANGAN ADA INDIKATOR SCROLLER SAMA SEKALI ── */
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

        /* ── SEMUA HURUF KECIL DI SELURUH BLOG WEB SESUAI PERMINTAAN USER ── */
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
          overflow-x: clip;
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
          overflow-x: clip !important;
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

        /* ── MINIMALIST FULLSCREEN MENU OVERLAY (GLOBAL STYLES) ── */
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
          will-change: transform;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          padding: calc(2.25rem + env(safe-area-inset-top, 0px)) 3.5rem calc(2.25rem + env(safe-area-inset-bottom, 0px)) 3.5rem !important;
        }

        @media (max-width: 860px) {
          .editorial-menu-overlay {
            padding: calc(1.5rem + env(safe-area-inset-top, 0px)) 1.75rem calc(1.75rem + env(safe-area-inset-bottom, 0px)) 1.75rem !important;
          }
        }

        .menu-inner-container {
          width: 100%;
          max-width: 840px;
          min-height: 100%;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          box-sizing: border-box;
        }

        /* Menu Top Bar: Selected Works & Ask Q&A on Left, Close on Right */
        .menu-top-bar {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.25rem 0;
          box-sizing: border-box;
        }

        .menu-top-links {
          display: flex;
          align-items: center;
          gap: 1.8rem;
        }

        .menu-top-link {
          font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: var(--blog-fg);
          text-decoration: none;
          opacity: 0.8;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .menu-top-link:hover {
          opacity: 1;
          transform: translateY(-1px);
        }

        @media (max-width: 600px) {
          .menu-top-links {
            gap: 1.25rem;
          }
          .menu-top-link {
            font-size: 0.88rem;
          }
        }

        .menu-close-btn {
          cursor: pointer;
          color: var(--blog-fg);
          font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          font-size: 0.88rem;
          font-weight: 500;
          letter-spacing: -0.01em;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 6px 0;
          opacity: 0.8;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .menu-close-btn:hover {
          opacity: 1;
          transform: scale(1.04);
        }

        .menu-close-btn:active {
          transform: scale(0.92);
        }

        /* Menu Centerpiece: Minimalist, Simple, Spacious */
        .menu-content-center {
          display: flex;
          flex-direction: column;
          gap: 2.2rem;
          margin: auto 0;
          width: 100%;
          box-sizing: border-box;
          padding: 2rem 0;
        }

        @media (max-width: 860px) {
          .menu-content-center {
            gap: 1.8rem;
            padding: 1rem 0;
          }
        }

        /* Articles List */
        .menu-articles-list {
          display: flex;
          flex-direction: column;
          gap: 1.8rem;
          width: 100%;
        }

        .menu-article-item {
          cursor: pointer;
          display: flex;
          align-items: baseline;
          gap: 1rem;
          text-align: left;
          width: 100%;
          padding: 0.25rem 0;
          color: var(--blog-fg-secondary);
          transition: color 0.2s ease, transform 0.2s ease;
        }

        .menu-article-item:hover {
          color: var(--blog-fg);
          transform: translateX(4px);
        }

        .menu-article-item.active-item {
          color: var(--blog-fg);
          font-weight: 500;
        }

        .menu-article-num {
          font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          font-size: 0.88rem;
          font-weight: 400;
          color: var(--blog-fg-muted);
          letter-spacing: -0.01em;
          font-variant-numeric: proportional-nums;
          width: 24px;
          flex-shrink: 0;
        }

        .menu-article-title {
          font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          font-size: clamp(1.35rem, 5.5vw, 1.85rem);
          line-height: 1.32;
          letter-spacing: -0.025em;
          flex: 1;
        }

        /* ── MENU BOTTOM BAR: SINGLE ROW (ICONS ON LEFT, COPYRIGHT ON RIGHT) ── */
        .menu-bottom-bar {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1.5rem;
          box-sizing: border-box;
        }

        .menu-social-icons {
          display: flex;
          gap: 1.25rem;
          align-items: center;
        }

        .menu-icon-btn {
          color: var(--blog-fg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          opacity: 0.65;
          transition: opacity 0.2s ease, transform 0.2s ease;
          border-radius: 4px;
        }

        .menu-icon-btn:hover {
          opacity: 1;
          transform: translateY(-1.5px);
        }

        .menu-copyright {
          font-family: var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          font-size: 0.78rem;
          font-weight: 400;
          color: var(--blog-fg-muted);
          letter-spacing: -0.01em;
          user-select: none;
          white-space: nowrap;
        }

        @media (max-width: 600px) {
          .menu-social-icons {
            gap: 1rem;
          }
          .menu-copyright {
            font-size: 0.72rem;
          }
        }

      `}</style>

      <style jsx>{`
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
          overflow-x: clip;
        }

        /* ── TOP NAVBAR: STICKY AT TOP SO IT NEVER DISAPPEARS ── */
        .editorial-navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 2.2rem 4rem 1.6rem 4rem;
          box-sizing: border-box;
          width: 100%;
          max-width: 100vw;
          position: sticky;
          top: 0;
          z-index: 100;
          background-color: var(--blog-bg);
          transition: background-color 0.3s ease;
        }

        @media (max-width: 860px) {
          .editorial-navbar {
            padding: calc(1.1rem + env(safe-area-inset-top, 0px)) 1.25rem 1rem 1.25rem;
          }
        }

        /* Minimalist 2-Bar Toggle (Tight 3.5px spacing, NO text) */
        .nav-toggle-btn {
          cursor: pointer;
          width: 32px;
          height: 32px;
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
          width: 18px;
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

        /* Center Brand: ivan ─── affriandi */
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          text-decoration: none;
          color: var(--blog-fg);
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          user-select: none;
        }

        .nav-brand-rule {
          display: inline-block;
          width: 34px;
          height: 1.5px;
          background-color: var(--blog-fg);
        }

        @media (max-width: 600px) {
          .nav-brand {
            gap: 0.5rem;
            font-size: 0.88rem;
          }

          .nav-brand-rule {
            width: 20px;
          }
        }

        /* Right: Minimalist @ Icon Link to Instagram */
        .nav-at-link {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          color: var(--blog-fg);
          opacity: 0.85;
          padding: 6px;
          transition: opacity 0.2s ease, transform 0.2s ease;
          text-decoration: none;
        }

        .nav-at-link:hover {
          opacity: 1;
          transform: scale(1.08);
        }

        .nav-at-link:active {
          transform: scale(0.92);
        }

        /* ── EDITORIAL MAIN LAYOUT (DESKTOP: 2 COLUMNS, MOBILE: 1 COLUMN CLEAN STACK) ── */
        .editorial-content-wrap {
          max-width: 1200px;
          width: 100%;
          margin: 2.5rem auto 6rem auto;
          padding: 0 4rem;
          box-sizing: border-box;
          display: grid;
          grid-template-columns: minmax(280px, 38%) minmax(320px, 62%);
          gap: 4.5rem;
          align-items: start;
        }

        @media (max-width: 860px) {
          .editorial-content-wrap {
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 1.25rem !important;
            margin: 1rem auto 4.5rem auto !important;
            gap: 1.25rem !important;
            box-sizing: border-box !important;
            overflow-x: hidden !important;
          }
        }

        /* ── LEFT COLUMN: TITLE + (PHOTO UNDER TITLE IF POST HAS ONE) ── */
        .editorial-left-col {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .editorial-title {
          font-size: clamp(1.85rem, 2.7vw, 2.65rem);
          font-weight: 500;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin: 0;
          color: var(--blog-fg);
          width: 100%;
          max-width: 100%;
          word-break: normal;
          overflow-wrap: break-word;
          hyphens: none;
        }

        @media (max-width: 860px) {
          .editorial-title {
            font-size: clamp(1.5rem, 5.8vw, 1.85rem);
            line-height: 1.22;
            letter-spacing: -0.025em;
          }
        }

        /* Photo under Title in Left Column (Black & White Minimalist) */
        .editorial-left-photo-wrap {
          margin-top: 2rem;
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
            margin-top: 1.25rem;
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

        /* ── RIGHT COLUMN: VERTICAL LINE + BODY PROSE ── */
        .editorial-right-col {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        /* Prominent Vertical Line */
        .editorial-vertical-line {
          width: 1.5px;
          height: 100px;
          background-color: var(--blog-line);
          margin-bottom: 2.2rem;
          display: block;
          flex-shrink: 0;
        }

        @media (max-width: 860px) {
          .editorial-vertical-line {
            height: 38px;
            margin: 0.35rem 0 1.25rem 0;
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

        /* Suppress raw unformatted body images since cover photo is placed under title */
        .editorial-body-prose :global(img) {
          display: none !important;
        }

        /* ── CLEAN NEXT POST LINK ── */
        .editorial-next-wrap {
          margin-top: 3.5rem;
          padding-top: 1.8rem;
          border-top: 1px solid var(--blog-border);
          display: flex;
          justify-content: flex-end;
          width: 100%;
          box-sizing: border-box;
        }

        @media (max-width: 860px) {
          .editorial-next-wrap {
            margin-top: 2.5rem;
            padding-top: 1.4rem;
          }
        }

        .next-post-btn {
          cursor: pointer;
          color: var(--blog-fg);
          font-size: 0.95rem;
          font-weight: 400;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          transition: opacity 0.2s ease, transform 0.2s ease;
          padding: 0.4rem 0;
          text-align: right;
        }

        .next-post-btn:hover {
          opacity: 0.5;
          transform: translateX(4px);
        }

        @media (max-width: 600px) {
          .next-post-btn {
            font-size: 0.9rem;
            text-align: left;
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>

      {/* ── TOP NAVBAR ── */}
      <header className="editorial-navbar">
        {/* Left: Minimal 2-Bar Toggle (Tight 3.5px spacing, NO text) */}
        <button
          type="button"
          className="nav-toggle-btn"
          onClick={() => setIsMenuOpen(true)}
          aria-label="open menu"
          title="menu"
        >
          <span className="toggle-icon-wrap">
            <span className="toggle-line" />
            <span className="toggle-line" />
          </span>
        </button>

        {/* Center: Brand ivan ─── affriandi */}
        <div className="nav-brand">
          <span>ivan</span>
          <span className="nav-brand-rule" />
          <span>affriandi</span>
        </div>

        {/* Right: Minimalist @ Icon linking directly to Instagram */}
        <a
          href="https://instagram.com/ivanaffriandi"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-at-link"
          aria-label="instagram @ivanaffriandi"
          title="instagram @ivanaffriandi"
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
          </svg>
        </a>
      </header>

      {/* ── MINIMALIST FULLSCREEN MENU WITH FLAWLESS BUTTER-SMOOTH CURTAIN SLIDE ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            key="editorial-menu-overlay"
            initial={{ y: "-100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1], // Apple fluid iOS spring curve
            }}
            className="editorial-menu-overlay"
          >
            <div className="menu-inner-container">
              {/* Top Bar: Selected Works & Ask Q&A on Left, Close Button on Right */}
              <div className="menu-top-bar">
                <div className="menu-top-links">
                  <Link
                    href="/work"
                    className="menu-top-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    works
                  </Link>
                  <Link
                    href="/ask"
                    className="menu-top-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    ask q&amp;a
                  </Link>
                </div>

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

              {/* Center: Minimalist, Simple, Spacious Essays List */}
              <div className="menu-content-center">
                <div className="menu-articles-list">
                  {sortedPosts.map((p, idx) => {
                    const isActive = p.id === currentPost?.id;
                    const formattedNum = String(idx + 1).padStart(2, "0");
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={`menu-article-item ${isActive ? "active-item" : ""}`}
                        onClick={() => handleSelectPost(p.id)}
                      >
                        <span className="menu-article-num">{formattedNum}</span>
                        <span className="menu-article-title">{p.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Bar: Single row, icons on bottom-left, copyright on bottom-right */}
              <div className="menu-bottom-bar">
                {/* Left corner: Minimalist Icons for IG, TWT (X), and Email */}
                <div className="menu-social-icons">
                  <a
                    href="https://instagram.com/ivanaffriandi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="menu-icon-btn"
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
                    className="menu-icon-btn"
                    aria-label="x (twitter)"
                    title="x (twitter)"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>

                  <a
                    href="mailto:ivan@ivanaffriandi.com"
                    className="menu-icon-btn"
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

                {/* Right corner: Minimalist Footer Copyright in the same row */}
                <span className="menu-copyright">
                  © 2026 ivan affriandi
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT (2 COLUMNS ON DESKTOP, CLEAN RESPONSIVE STACK ON MOBILE) ── */}
      {currentPost && (
        <main className="editorial-content-wrap">
          {/* LEFT COLUMN: TITLE + (PHOTO UNDER TITLE IF POST HAS ONE, B&W MINIMALIST) */}
          <div className="editorial-left-col">
            <h1 className="editorial-title">{currentPost.title}</h1>

            {/* Photo placed under Title, Black & White Minimalist */}
            {postImage && (
              <div className="editorial-left-photo-wrap">
                <img
                  src={postImage}
                  alt={currentPost.title}
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
              dangerouslySetInnerHTML={{ __html: cleanHtml(currentPost.content) }}
            />

            {/* Minimal Next Post Link */}
            {nextPost && (
              <div className="editorial-next-wrap">
                <button
                  type="button"
                  className="next-post-btn"
                  onClick={() => handleSelectPost(nextPost.id)}
                >
                  <span>next: {nextPost.title}</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
