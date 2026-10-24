"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";

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

function cleanChapterTitle(title: string): string {
  if (!title) return "";
  return title.replace(/^Chapter\s+\d+:\s*/i, "").trim();
}

export default function EditorialBlog({
  posts = [],
  initialPost,
}: EditorialBlogProps) {
  // Sort posts (newest first, reverse-chronological order)
  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const timeA = new Date(a.published).getTime() || 0;
      const timeB = new Date(b.published).getTime() || 0;
      return timeB - timeA;
    });
  }, [posts]);

  // Active post: if initialPost is provided (e.g. /blog/[id]), open that post.
  // On homepage (/), defaults to "" so visitor is immediately greeted with the Daftar Isi (Table of Contents).
  const [activePostId, setActivePostId] = useState<string>(() => {
    if (initialPost?.id) return initialPost.id;
    return "";
  });

  // Sync if initialPost changes or URL has post ID
  useEffect(() => {
    if (initialPost?.id) {
      setActivePostId(initialPost.id);
    } else if (typeof window !== "undefined") {
      const match = window.location.pathname.match(/\/blog\/([^/]+)/);
      if (match && match[1]) {
        setActivePostId(match[1]);
      } else {
        setActivePostId("");
      }
    }
  }, [initialPost]);

  // Listen to browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window !== "undefined") {
        const path = window.location.pathname;
        const match = path.match(/\/blog\/([^/]+)/);
        if (match && match[1]) {
          setActivePostId(match[1]);
        } else {
          setActivePostId("");
        }
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const currentPost = useMemo(() => {
    if (!activePostId) return null;
    return sortedPosts.find((p) => p.id === activePostId) || null;
  }, [sortedPosts, activePostId]);

  // Extract photo ONLY if this post actually contains an image
  const postImage = useMemo(() => {
    if (!currentPost?.content) return null;
    return extractFirstImage(currentPost.content);
  }, [currentPost]);

  // Find next post for pagination in reader
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
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/blog/${postId}`);
    }
  };

  const handleGoHome = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setActivePostId("");
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/");
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
        .editorial-canvas * {
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
        }

        /* ── TOP NAVBAR: FIXED AT TOP SO IT NEVER DISAPPEARS ── */
        .editorial-navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.8rem 4rem 1.4rem 4rem;
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
        }

        @media (max-width: 860px) {
          .editorial-navbar {
            padding: calc(1.1rem + env(safe-area-inset-top, 0px)) 1.25rem 1rem 1.25rem;
          }
        }

        /* Left: works & ask (No 'ask q&a', purely 'ask') */
        .nav-left-links {
          display: flex;
          align-items: center;
          gap: 1.6rem;
        }

        @media (max-width: 860px) {
          .nav-left-links {
            gap: 1rem;
          }
        }

        .nav-text-link {
          color: var(--blog-fg);
          font-size: 0.95rem;
          font-weight: 500;
          letter-spacing: -0.01em;
          text-decoration: none;
          opacity: 0.85;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .nav-text-link:hover {
          opacity: 1;
        }

        @media (max-width: 600px) {
          .nav-text-link {
            font-size: 0.86rem;
          }
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
          transition: opacity 0.2s ease;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
        }

        .nav-brand:hover {
          opacity: 0.65;
        }

        .nav-brand-rule {
          display: inline-block;
          width: 34px;
          height: 1.5px;
          background-color: var(--blog-fg);
        }

        @media (max-width: 600px) {
          .nav-brand {
            gap: 0.45rem;
            font-size: 0.86rem;
          }

          .nav-brand-rule {
            width: 18px;
          }
        }

        /* Right: Minimalist @ Icon Link to Instagram */
        .nav-right-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }

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

        /* ── PAGE BODY WITH TOP OFFSET FOR FIXED NAVBAR ── */
        .editorial-page-body {
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding-top: calc(5.2rem + env(safe-area-inset-top, 0px));
          box-sizing: border-box;
        }

        @media (max-width: 860px) {
          .editorial-page-body {
            padding-top: calc(4.2rem + env(safe-area-inset-top, 0px));
          }
        }

        /* ── HOMEPAGE DAFTAR ISI (TABLE OF CONTENTS) ── */
        .editorial-toc-wrap {
          max-width: 820px;
          width: 100%;
          margin: 0 auto;
          padding: 3rem 2rem 5rem 2rem;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        @media (max-width: 860px) {
          .editorial-toc-wrap {
            padding: 2rem 1.25rem 4rem 1.25rem;
          }
        }

        .editorial-toc-list {
          display: flex;
          flex-direction: column;
          gap: 2.2rem;
          width: 100%;
          margin-bottom: auto;
        }

        @media (max-width: 860px) {
          .editorial-toc-list {
            gap: 1.85rem;
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

        /* ── ARTICLE READER LAYOUT ── */
        .editorial-content-wrap {
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 1.5rem 4rem 6rem 4rem;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        @media (max-width: 860px) {
          .editorial-content-wrap {
            padding: 1rem 1.25rem 4.5rem 1.25rem;
          }
        }

        .editorial-reader-top-bar {
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
        }

        .editorial-back-btn {
          cursor: pointer;
          color: var(--blog-fg-muted);
          font-size: 0.88rem;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          transition: color 0.2s ease, transform 0.2s ease;
          padding: 0.3rem 0;
        }

        .editorial-back-btn:hover {
          color: var(--blog-fg);
          transform: translateX(-3px);
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
            gap: 1.25rem !important;
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

        .editorial-body-prose :global(img) {
          display: none !important;
        }

        /* Bottom Nav inside Reader */
        .editorial-bottom-nav {
          margin-top: 3.5rem;
          padding-top: 1.8rem;
          border-top: 1px solid var(--blog-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          box-sizing: border-box;
          gap: 1.5rem;
        }

        @media (max-width: 860px) {
          .editorial-bottom-nav {
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
          margin-left: auto;
        }

        .next-post-btn:hover {
          opacity: 0.5;
          transform: translateX(4px);
        }

        @media (max-width: 600px) {
          .next-post-btn {
            font-size: 0.88rem;
          }
        }

        /* ── MINIMALIST FOOTER ── */
        .editorial-footer {
          margin-top: 5rem;
          padding-top: 2rem;
          border-top: 1px solid var(--blog-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          box-sizing: border-box;
        }

        @media (max-width: 600px) {
          .editorial-footer {
            margin-top: 3.5rem;
            padding-top: 1.5rem;
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

      {/* ── TOP NAVBAR: ALWAYS VISIBLE EVERYWHERE (FIXED AT TOP) ── */}
      <header className="editorial-navbar">
        {/* Left: works and ask */}
        <div className="nav-left-links">
          <Link href="/work" className="nav-text-link">
            works
          </Link>
          <Link href="/ask" className="nav-text-link">
            ask
          </Link>
        </div>

        {/* Center: brand ivan ─── affriandi (Clicking takes user back to Daftar Isi) */}
        <Link
          href="/"
          onClick={handleGoHome}
          className="nav-brand"
          aria-label="ivan affriandi home"
        >
          <span>ivan</span>
          <span className="nav-brand-rule" />
          <span>affriandi</span>
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
        </div>
      </header>

      {/* ── PAGE BODY ── */}
      <div className="editorial-page-body">
        {/* ── VIEW 1: HOMEPAGE DAFTAR ISI (TABLE OF CONTENTS) ── */}
        {!activePostId && (
          <div className="editorial-toc-wrap">
            <div className="editorial-toc-list">
              {sortedPosts.map((post, idx) => {
                const formattedNum = String(idx + 1).padStart(2, "0");
                const cleanPostTitle = cleanChapterTitle(post.title);
                return (
                  <button
                    key={post.id}
                    type="button"
                    className="editorial-toc-item"
                    onClick={() => handleSelectPost(post.id)}
                  >
                    <span className="editorial-toc-num">{formattedNum}</span>
                    <span className="editorial-toc-title">{cleanPostTitle}</span>
                  </button>
                );
              })}
            </div>

            {/* Minimalist Footer */}
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
        )}

        {/* ── VIEW 2: ARTICLE READER VIEW ── */}
        {activePostId && currentPost && (
          <article className="editorial-content-wrap">
            {/* Top Bar inside reader: back to daftar isi */}
            <div className="editorial-reader-top-bar">
              <button
                type="button"
                className="editorial-back-btn"
                onClick={handleGoHome}
              >
                <span>←</span>
                <span>daftar isi</span>
              </button>
            </div>

            <div className="editorial-main-grid">
              {/* LEFT COLUMN: TITLE + (PHOTO UNDER TITLE IF POST HAS ONE, B&W MINIMALIST) */}
              <div className="editorial-left-col">
                <h1 className="editorial-title">{cleanChapterTitle(currentPost.title)}</h1>

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

                {/* Bottom Navigation */}
                <div className="editorial-bottom-nav">
                  <button
                    type="button"
                    className="editorial-back-btn"
                    onClick={handleGoHome}
                  >
                    <span>←</span>
                    <span>daftar isi</span>
                  </button>

                  {nextPost && (
                    <button
                      type="button"
                      className="next-post-btn"
                      onClick={() => handleSelectPost(nextPost.id)}
                    >
                      <span>next: {cleanChapterTitle(nextPost.title)}</span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
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
          </article>
        )}
      </div>
    </div>
  );
}
