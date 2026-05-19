"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TweetItem {
  id: string;
  text: string;
  created_at: string;
  url?: string;
}

export default function TwitterStatus() {
  const [tweets, setTweets] = useState<TweetItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/twitter")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTweets(data.slice(0, 3)); // Display the 3 latest updates
        }
      })
      .catch((err) => console.error("Error loading X thoughts list:", err))
      .finally(() => setLoading(false));
  }, []);

  // Format date helper to relative/readable time
  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
    } catch {
      return "Recently";
    }
  };

  return (
    <div 
      style={{
        marginTop: "2rem",
        marginBottom: "2.5rem",
        width: "100%",
        maxWidth: "520px"
      }}
      className="editorial-note-wrapper"
    >
      <div style={{
        fontSize: "0.72rem",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--text-secondary)",
        marginBottom: "1rem",
        borderBottom: "1px solid var(--grid-line)",
        paddingBottom: "0.5rem"
      }}>
        Latest Notes & Thoughts
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            style={{ 
              fontFamily: "var(--font-serif, 'Lora', Georgia, serif)", 
              fontSize: "0.88rem", 
              fontStyle: "italic",
              color: "var(--text-secondary)",
              padding: "1rem 0"
            }}
          >
            Retrieving latest thoughts stream...
          </motion.div>
        ) : (
          <motion.div
            key="loaded"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {tweets.length > 0 ? (
              tweets.map((item, index) => (
                <a 
                  key={item.id}
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{
                    display: "block",
                    textDecoration: "none",
                    color: "inherit",
                    backgroundColor: "var(--bg-card, rgba(0,0,0,0.015))",
                    borderLeft: "2px solid var(--grid-line)",
                    padding: "1rem 1.25rem",
                    transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                    cursor: "pointer"
                  }}
                  className="editorial-feed-card"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-card-hover, rgba(0,0,0,0.035))";
                    e.currentTarget.style.borderLeft = "2px solid var(--text-primary)";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-card, rgba(0,0,0,0.015))";
                    e.currentTarget.style.borderLeft = "2px solid var(--grid-line)";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  {/* Small clean date tag */}
                  <div style={{
                    fontSize: "0.68rem",
                    fontWeight: "500",
                    color: "var(--text-secondary)",
                    marginBottom: "0.4rem",
                    fontFamily: "monospace"
                  }}>
                    [ {getRelativeTime(item.created_at)} ]
                  </div>

                  {/* Elegant italic thought text */}
                  <p style={{
                    fontFamily: "var(--font-serif, 'Lora', Georgia, serif)",
                    fontSize: "0.94rem",
                    fontStyle: "italic",
                    lineHeight: "1.5",
                    color: "var(--text-primary)",
                    margin: 0,
                    letterSpacing: "-0.01em"
                  }}>
                    "{item.text}"
                  </p>
                </a>
              ))
            ) : (
              <div style={{
                fontFamily: "var(--font-serif, 'Lora', Georgia, serif)",
                fontSize: "0.9rem",
                fontStyle: "italic",
                color: "var(--text-secondary)",
                padding: "1rem 0",
                borderLeft: "2px solid var(--grid-line)"
              }}>
                "Notes list currently empty."
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
