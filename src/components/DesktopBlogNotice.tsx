"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface DesktopBlogNoticeProps {
  postTitle?: string;
  postUrl?: string;
}

export default function DesktopBlogNotice({ postTitle, postUrl }: DesktopBlogNoticeProps) {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(postUrl || "https://blog.ivanaffriandi.com");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(postUrl || window.location.href);
    }
  }, [postUrl]);

  const handleCopy = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2400);
      }
    } catch {
      // Fallback
    }
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(
    currentUrl
  )}&color=09090b&bgcolor=ffffff`;

  return (
    <div className="desktop-blog-notice-container">
      <style>{`
        .desktop-blog-notice-container {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 99999;
          width: 100vw;
          height: 100vh;
          background-color: #09090b;
          background-image: radial-gradient(circle at 50% 20%, rgba(255, 255, 255, 0.04) 0%, transparent 60%);
          color: #f4f4f5;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          box-sizing: border-box;
          font-family: var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
          overflow-y: auto;
        }

        @media (min-width: 861px) {
          .desktop-blog-notice-container {
            display: flex !important;
          }
          .blog-mobile-only-content {
            display: none !important;
          }
        }

        @media (max-width: 860px) {
          .desktop-blog-notice-container {
            display: none !important;
          }
          .blog-mobile-only-content {
            display: block !important;
          }
        }

        .notice-card {
          width: 100%;
          max-width: 480px;
          border: 1px solid rgba(255, 255, 255, 0.09);
          background: rgba(18, 18, 20, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 16px;
          padding: 2.5rem 2.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7);
        }

        .notice-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 100px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.64rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.65);
          margin-bottom: 1.5rem;
        }

        .notice-badge-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #10B981;
        }

        .notice-title {
          font-family: var(--font-serif, "Lora", Georgia, serif);
          font-size: 1.65rem;
          font-weight: 400;
          line-height: 1.3;
          letter-spacing: -0.01em;
          color: #FFFFFF;
          margin: 0 0 1rem 0;
        }

        .notice-desc {
          font-size: 0.85rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.6);
          margin: 0 0 0.6rem 0;
          max-width: 380px;
        }

        .notice-desc-id {
          font-size: 0.78rem;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.38);
          margin: 0 0 1.75rem 0;
          max-width: 380px;
          font-style: italic;
        }

        .notice-qr-box {
          position: relative;
          background: #FFFFFF;
          padding: 10px;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
          margin-bottom: 1.75rem;
          transition: transform 0.2s ease;
        }
        .notice-qr-box:hover {
          transform: scale(1.02);
        }

        .notice-qr-img {
          display: block;
          width: 140px;
          height: 140px;
          border-radius: 6px;
        }

        .notice-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .notice-copy-btn {
          flex: 1;
          height: 42px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.08);
          color: #FFFFFF;
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.03em;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .notice-copy-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .notice-home-link {
          flex: 1;
          height: 42px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: transparent;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.03em;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .notice-home-link:hover {
          color: #FFFFFF;
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.04);
        }

        .notice-footer {
          margin-top: 1.5rem;
          font-size: 0.65rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.25);
        }
      `}</style>

      <div className="notice-card">
        <div className="notice-badge">
          <span className="notice-badge-dot" />
          <span>Mobile Experience Only</span>
        </div>

        <h1 className="notice-title">
          {postTitle ? "Tailored for Handheld Reading" : "Crafted for Handheld Reading"}
        </h1>

        <p className="notice-desc">
          {postTitle
            ? `"${postTitle}" is currently tailored exclusively for mobile screens. Open on your smartphone for the intended reading experience.`
            : "Ivan's Journal is currently designed and crafted exclusively for mobile screens. Please open this page on your smartphone for the tactile reading experience."}
        </p>

        <p className="notice-desc-id">
          Jurnal ini saat ini dirancang dan dioptimalkan khusus untuk layar ponsel (mobile). Silakan buka melalui smartphone Anda.
        </p>

        <div className="notice-qr-box" title="Scan to open on your phone">
          <img
            src={qrImageUrl}
            alt="Scan QR code to read on mobile"
            className="notice-qr-img"
            width={140}
            height={140}
          />
        </div>

        <div className="notice-actions">
          <button
            type="button"
            className="notice-copy-btn"
            onClick={handleCopy}
            aria-label="Copy page link"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span style={{ color: "#10B981" }}>Link Copied</span>
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                <span>Copy Mobile Link</span>
              </>
            )}
          </button>

          <Link href="/" className="notice-home-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Homepage</span>
          </Link>
        </div>

        <div className="notice-footer">
          Ivan Affriandi · Journal 2026
        </div>
      </div>
    </div>
  );
}
