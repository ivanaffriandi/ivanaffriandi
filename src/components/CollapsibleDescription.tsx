"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function CollapsibleDescription() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={{ marginBottom: "2rem" }}>
      {/* Toggle Trigger */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "none",
          border: "none",
          padding: "0.25rem 0",
          fontSize: "0.75rem",
          color: "var(--text-secondary)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          fontWeight: "600",
          transition: "color 0.2s ease"
        }}
        className="minimal-link"
        aria-expanded={isOpen}
      >
        <span>Info</span>
        <span style={{ 
          fontSize: "0.6rem", 
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          display: "inline-block"
        }}>
          ▼
        </span>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: "0.75rem" }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden" }}
          >
            <p 
              className="book-prologue"
              style={{ 
                fontFamily: "var(--font-serif, 'Lora', Georgia, serif)", 
                fontSize: "1.15rem", 
                color: "var(--text-secondary)", 
                maxWidth: "92%", 
                lineHeight: "1.65",
                fontStyle: "normal",
                margin: 0
              }}
            >
              A continuous, quiet archive of personal thoughts, visual reflections, and daily digital processes recorded in chronological fragments.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
