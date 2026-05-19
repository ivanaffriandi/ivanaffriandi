"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllMoments, MomentItem } from '@/lib/moments';

export default function MomentsPage() {
  const [activePhoto, setActivePhoto] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mounted, setMounted] = useState(false);
  const [moments, setMoments] = useState<MomentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const fetchMoments = async () => {
      try {
        const data = await getAllMoments();
        setMoments(data);
      } catch (err) {
        console.error("Failed to load moments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMoments();
  }, []);
  const displayMoments: MomentItem[] = moments.length > 0 
    ? moments 
    : Array.from({ length: 18 }).map((_, idx) => ({ 
        id: String(idx), 
        url: `https://picsum.photos/seed/${idx + 15}/800/800`, 
        title: `Aesthetic Placeholder ${idx + 1}`,
        story: `This is a temporary aesthetic placeholder generated to maintain the layout while the gallery is being populated with your uploaded moments.`,
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        location: "Nature Sanctuary",
        published: new Date().toISOString()
      }));

  return (
    <div style={{ minHeight: "auto", paddingBottom: "4rem", paddingTop: "0.5rem", backgroundColor: "var(--bg-color)" }}>
      <div style={{ 
        maxWidth: "850px", 
        margin: "0 auto", 
        padding: "0 0.5rem" 
      }}>
        {/* Header / Title */}
        <div style={{ 
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(150,150,150,0.15)",
          paddingBottom: "0.5rem"
        }}>
          <div>
            <h1 style={{ 
              fontSize: "1.45rem", 
              fontWeight: "800", 
              color: "var(--text-primary)", 
              margin: 0,
              fontFamily: "var(--font-sans)",
              letterSpacing: "-0.02em",
              lineHeight: "1.1"
            }}>
              Moments
            </h1>
            <span style={{
              fontSize: "0.72rem",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-sans)",
              fontWeight: "500",
              opacity: 0.6,
              display: "block",
              marginTop: "2px"
            }}>
              Curated Visuals
            </span>
          </div>
          
          {/* Minimalist Pill Toggle on the far right */}
          <div style={{
            display: "flex",
            backgroundColor: "rgba(150,150,150,0.06)",
            padding: "1.5px",
            borderRadius: "14px",
            border: "1px solid rgba(150,150,150,0.12)"
          }}>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                padding: "3px 9px",
                fontSize: "0.62rem",
                fontWeight: "600",
                fontFamily: "var(--font-sans)",
                borderRadius: "12px",
                border: "none",
                backgroundColor: viewMode === "grid" ? "var(--text-primary)" : "transparent",
                color: viewMode === "grid" ? "var(--bg-color)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              style={{
                padding: "3px 9px",
                fontSize: "0.62rem",
                fontWeight: "600",
                fontFamily: "var(--font-sans)",
                borderRadius: "12px",
                border: "none",
                backgroundColor: viewMode === "list" ? "var(--text-primary)" : "transparent",
                color: viewMode === "list" ? "var(--bg-color)" : "var(--text-secondary)",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              List
            </button>
          </div>
        </div>
        
        {viewMode === "list" ? (
          /* List View: Premium vertical timeline cards */
          <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem", marginTop: "0.5rem" }}>
            {loading ? null : displayMoments.length === 0 ? (
               <div style={{ padding: "4rem", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                 No moments have been published yet.
               </div>
            ) : displayMoments.map((moment, idx) => {
              return (
                <motion.div
                  key={moment.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut", delay: Math.min(idx * 0.05, 0.3) }}
                  style={{
                    backgroundColor: "rgba(150,150,150,0.02)",
                    border: "1px solid rgba(150,150,150,0.08)",
                    borderRadius: "24px",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px"
                  }}
                >
                  {/* Aspect Ratio Landscape Image */}
                  <div
                    onClick={() => setActivePhoto(idx)}
                    style={{
                      width: "100%",
                      aspectRatio: "16/10",
                      borderRadius: "16px",
                      overflow: "hidden",
                      cursor: "pointer",
                      backgroundColor: "rgba(150,150,150,0.05)",
                      position: "relative"
                    }}
                  >
                    <img
                      src={moment.url}
                      alt={moment.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: "grayscale(100%) contrast(1.08)",
                        transition: "transform 0.4s ease"
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                      onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                      onError={(e) => { e.currentTarget.src = "/nature_hero.png"; }}
                    />
                  </div>

                  {/* Story & metadata panel */}
                  <div style={{ padding: "0 6px" }}>
                    <p style={{
                      margin: "0 0 16px 0",
                      fontSize: "0.95rem",
                      lineHeight: "1.6",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-sans)",
                      fontStyle: "italic",
                      opacity: 0.9
                    }}>
                      "{moment.story}"
                    </p>

                    {/* Minimalist Location & Date Row */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid rgba(150,150,150,0.08)",
                      paddingTop: "12px",
                      fontFamily: "var(--font-sans)"
                    }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#B47A3E", letterSpacing: "-0.01em" }}>
                        📍 {moment.location}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-secondary)", opacity: 0.65 }}>
                        {moment.date}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Gallery Grid */
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: "2px",
            borderRadius: "16px",
            overflow: "hidden",
            border: "1px solid rgba(150,150,150,0.1)"
          }}>
            {loading ? null : displayMoments.map((moment, idx) => {
              return (
                <motion.div
                  key={moment.id}
                  className="gallery-cell"
                  onClick={() => setActivePhoto(idx)}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: Math.min(idx * 0.03, 0.45),
                    duration: 0.38,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  style={{ 
                    backgroundColor: "rgba(150,150,150,0.06)",
                    position: "relative",
                    overflow: "hidden",
                    aspectRatio: "1/1"
                  }}
                >
                  <img 
                    src={moment.url} 
                    alt={moment.title} 
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover",
                      filter: "grayscale(100%) contrast(1.1)",
                      transition: "transform 0.4s var(--ease-ios-out, ease)",
                    }} 
                    onError={(e) => { e.currentTarget.src = "/nature_hero.png"; }}
                  />
                </motion.div>
              );
            })}
          </div>
        )}
        
      </div>

      {/* LIGHTBOX MODAL: FINE-ART PRINT "SHOT ON IPHONE" */}
      {mounted && typeof window !== "undefined" && createPortal(
        <AnimatePresence>
          {activePhoto !== null && displayMoments[activePhoto] && (() => {
            const activeData = displayMoments[activePhoto];
            return (
              <motion.div
                key="moments-lightbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActivePhoto(null)}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.85)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999,
                  cursor: "zoom-out",
                  padding: "20px"
                }}
              >
                <motion.div
                  initial={{ scale: 0.93, y: 15 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.93, y: 15 }}
                  transition={{ type: "spring", damping: 26, stiffness: 280 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#121212",
                    borderRadius: "20px",
                    padding: "12px 12px 24px 12px",
                    boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
                    width: "100%",
                    maxWidth: "460px",
                    cursor: "default",
                    display: "flex",
                    flexDirection: "column"
                  }}
                >
                  {/* The Grayscale Nature Image */}
                  <div style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    borderRadius: "10px",
                    overflow: "hidden",
                    backgroundColor: "#f5f5f7"
                  }}>
                    <img 
                      src={activeData.url}
                      alt={activeData.title || "Moment"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                      }}
                    />
                  </div>

                  {/* Minimal Fine-Art Polaroid Footer with Location */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "1.25rem",
                    padding: "0 6px",
                    fontFamily: "var(--font-sans)"
                  }}>
                    <span style={{
                      fontSize: "0.85rem",
                      fontWeight: "750",
                      color: "#B47A3E",
                      letterSpacing: "-0.01em"
                    }}>
                      📍 {activeData.location}
                    </span>
                    <span style={{
                      fontSize: "0.75rem",
                      fontWeight: "500",
                      color: "#86868b"
                    }}>
                      {activeData.date}
                    </span>
                  </div>

                  {/* Story/Description Text underneath Polaroid metadata */}
                  {activeData.story && (
                    <div style={{
                      marginTop: "1.25rem",
                      padding: "0 8px",
                      fontSize: "0.9rem",
                      lineHeight: "1.5",
                      color: "#333",
                      fontFamily: "var(--font-sans)",
                      fontStyle: "italic",
                      letterSpacing: "-0.01em",
                      borderTop: "1px solid rgba(0,0,0,0.05)",
                      paddingTop: "1rem"
                    }}>
                      "{activeData.story}"
                    </div>
                  )}

                </motion.div>
              </motion.div>
            );
          })()}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
