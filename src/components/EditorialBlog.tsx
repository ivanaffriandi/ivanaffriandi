"use client";

import React, { useState, useMemo, useEffect } from "react";
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

  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // Find previous and next post for pagination in reader
  const { prevPost, nextPost } = useMemo(() => {
    if (!currentPost) return { prevPost: null, nextPost: null };
    const currentIndex = sortedPosts.findIndex((p) => p.id === currentPost.id);
    if (currentIndex === -1) return { prevPost: null, nextPost: null };

    // Previous = newer post (index - 1)
    const prev = currentIndex > 0 ? sortedPosts[currentIndex - 1] : null;
    // Next = older post (index + 1)
    const next = currentIndex < sortedPosts.length - 1 ? sortedPosts[currentIndex + 1] : null;

    return { prevPost: prev, nextPost: next };
  }, [sortedPosts, currentPost]);

  const handleSelectPost = (postId: string) => {
    setActivePostId(postId);
    setIsMenuOpen(false);
    // Instant snap to top of the selected article
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", `/blog/${postId}`);
    }
  };

  const handleGoHome = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setActivePostId("");
    setIsMenuOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
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

        /* ── MINIMALIST FULLSCREEN MENU OVERLAY ── */
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
          padding: 2.2rem 4rem;
          box-sizing: border-box;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        @media (max-width: 860px) {
          .menu-inner-container {
            padding: calc(1.1rem + env(safe-area-inset-top, 0px)) 1.25rem 2rem 1.25rem;
          }
        }

        .menu-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .menu-top-links {
          display: flex;
          align-items: center;
          gap: 1.6rem;
        }

        @media (max-width: 860px) {
          .menu-top-links {
            gap: 1.1rem;
          }
        }

        .menu-top-link {
          color: var(--blog-fg);
          font-size: 0.95rem;
          font-weight: 500;
          text-decoration: none;
          opacity: 0.85;
          transition: opacity 0.2s ease;
        }

        .menu-top-link:hover {
          opacity: 1;
        }

        @media (max-width: 600px) {
          .menu-top-link {
            font-size: 0.86rem;
          }
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

        .menu-content-center {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 3.5rem 0;
          width: 100%;
        }

        @media (max-width: 860px) {
          .menu-content-center {
            padding: 2.5rem 0;
          }
        }

        .menu-articles-list {
          display: flex;
          flex-direction: column;
          gap: 1.8rem;
          width: 100%;
          max-width: 760px;
        }

        @media (max-width: 860px) {
          .menu-articles-list {
            gap: 1.45rem;
          }
        }

        .menu-article-item {
          display: flex;
          align-items: baseline;
          text-align: left;
          background: transparent;
          border: none;
          padding: 0.2rem 0;
          cursor: pointer;
          width: 100%;
          color: var(--blog-fg);
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .menu-article-item:hover {
          opacity: 0.6;
          transform: translateX(4px);
        }

        .menu-article-item.active-item {
          font-weight: 600;
        }

        .menu-article-num {
          font-size: 0.88rem;
          color: var(--blog-fg-muted);
          width: 2.5rem;
          flex-shrink: 0;
          letter-spacing: 0.02em;
          font-variant-numeric: tabular-nums;
        }

        @media (max-width: 600px) {
          .menu-article-num {
            font-size: 0.82rem;
            width: 2.1rem;
          }
        }

        .menu-article-title {
          font-size: clamp(1.1rem, 2.2vw, 1.4rem);
          font-weight: 500;
          line-height: 1.32;
          letter-spacing: -0.02em;
          color: var(--blog-fg);
        }

        @media (max-width: 600px) {
          .menu-article-title {
            font-size: clamp(1.05rem, 4.6vw, 1.2rem);
            line-height: 1.34;
          }
        }

        .menu-bottom-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding-top: 1.5rem;
          border-top: 1px solid var(--blog-border);
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

        /* Left: Minimal 2-Bar Toggle (Opens Sidebar Menu) */
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
          padding: 2.5rem 2rem 4rem 2rem;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        @media (max-width: 860px) {
          .editorial-toc-wrap {
            padding: 1.8rem 1.25rem 3rem 1.25rem;
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
          padding: 1.5rem 4rem 4rem 4rem;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        @media (max-width: 860px) {
          .editorial-content-wrap {
            padding: 1rem 1.25rem 3rem 1.25rem;
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

        /* ── PREVIOUS & NEXT BLOG NAVIGATION (TIGHT, CLEAN, PROPORTIONATE) ── */
        .editorial-bottom-nav {
          margin-top: 2.2rem;
          padding-top: 1.4rem;
          border-top: 1px solid var(--blog-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          box-sizing: border-box;
          gap: 1.25rem;
        }

        @media (max-width: 600px) {
          .editorial-bottom-nav {
            margin-top: 1.8rem;
            padding-top: 1.1rem;
            gap: 0.85rem;
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
          font-size: 0.88rem;
          font-weight: 500;
          color: var(--blog-fg);
          line-height: 1.25;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
        }

        @media (max-width: 600px) {
          .nav-title {
            font-size: 0.82rem;
            max-width: 140px;
          }
        }

        /* ── MINIMALIST FOOTER: TIGHTLY ATTACHED UNDER NAVIGATION (NO BIG GAP) ── */
        .editorial-footer {
          margin-top: 1.8rem;
          padding-top: 1.2rem;
          border-top: 1px solid var(--blog-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          box-sizing: border-box;
        }

        @media (max-width: 600px) {
          .editorial-footer {
            margin-top: 1.35rem;
            padding-top: 1rem;
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
        {/* Left: Minimal 2-Bar Toggle Button (Opens Sidebar Menu) */}
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

      {/* ── MINIMALIST FULLSCREEN SIDEBAR MENU ── */}
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
          >
            <div className="menu-inner-container">
              {/* Top Bar: works & ask on Left, Close Button on Right */}
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
                    ask
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

              {/* Center: List of Writings / Daftar Isi */}
              <div className="menu-content-center">
                <div className="menu-articles-list">
                  {sortedPosts.map((p, idx) => {
                    const isActive = p.id === activePostId;
                    const formattedNum = String(idx + 1).padStart(2, "0");
                    const cleanTitle = cleanChapterTitle(p.title);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        className={`menu-article-item ${isActive ? "active-item" : ""}`}
                        onClick={() => handleSelectPost(p.id)}
                      >
                        <span className="menu-article-num">{formattedNum}</span>
                        <span className="menu-article-title">{cleanTitle}</span>
                      </button>
                    );
                  })}
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

            {/* Footnote / Footer: Snug and balanced */}
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

        {/* ── VIEW 2: ARTICLE READER VIEW (NO TOP BACK BUTTON, CLEAN PREV/NEXT, SNUG FOOTNOTE) ── */}
        {activePostId && currentPost && (
          <article className="editorial-content-wrap">
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

                {/* Bottom Navigation: Previous & Next Blog */}
                <div className="editorial-bottom-nav">
                  {prevPost ? (
                    <button
                      type="button"
                      className="editorial-nav-btn prev-btn"
                      onClick={() => handleSelectPost(prevPost.id)}
                    >
                      <span className="nav-arrow">←</span>
                      <span className="nav-label">
                        <span className="nav-dir">previous</span>
                        <span className="nav-title">{cleanChapterTitle(prevPost.title)}</span>
                      </span>
                    </button>
                  ) : (
                    <div className="editorial-nav-placeholder" />
                  )}

                  {nextPost ? (
                    <button
                      type="button"
                      className="editorial-nav-btn next-btn"
                      onClick={() => handleSelectPost(nextPost.id)}
                    >
                      <span className="nav-label text-right">
                        <span className="nav-dir">next</span>
                        <span className="nav-title">{cleanChapterTitle(nextPost.title)}</span>
                      </span>
                      <span className="nav-arrow">→</span>
                    </button>
                  ) : (
                    <div className="editorial-nav-placeholder" />
                  )}
                </div>

                {/* Footnote / Footer: Placed tightly right below nav without big gap */}
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
