"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { GALLERY_ITEMS, type GalleryItem } from "@/lib/gallery";
import { useLanguage } from "@/contexts/LanguageContext";

export default function GalleryPage() {
  const { lang } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [items, setItems] = useState<GalleryItem[]>(GALLERY_ITEMS);

  const galleryStrings = {
    returnHome: lang === "ar" ? "← العودة إلى الرئيسية" : lang === "zh" ? "← 返回主页" : lang === "nl" ? "← Terug naar Home" : "← Return to Home",
    sectionLabel: lang === "ar" ? "معرض مرئي" : lang === "zh" ? "视觉展览" : lang === "nl" ? "Visuele Galerij" : "Visual Gallery",
    heading: lang === "ar" ? "الأرشيف المرئي" : lang === "zh" ? "视觉档案馆" : lang === "nl" ? "Visueel Archief" : "Visual Archive",
    desc: lang === "ar" ? "فهرس مُنقّح من السجلات الفوتوغرافية التي تستكشف تقاطع البنية المعمارية، والهندسة الخرسانية الخام، والفضاءات الطبيعية الهادئة." : lang === "zh" ? "精心策划的摄影档案索引，探索建筑结构、原始混凝土几何与宁静自然空间之间的交汇。" : lang === "nl" ? "Een gecureerde index van fotografische records die het snijpunt verkennen van architecturale structuur, ruwe betongeometrie en stille natuurruimtes." : "A curated index of photographic records exploring the intersection of architectural structure, raw concrete geometry, and quiet natural spaces.",
    location: lang === "ar" ? "الموقع" : lang === "zh" ? "位置" : lang === "nl" ? "Locatie" : "Location",
    close: lang === "ar" ? "إغلاق" : lang === "zh" ? "关闭" : lang === "nl" ? "Sluiten" : "Close",
    viewOnInstagram: lang === "ar" ? "عرض على إنستغرام →" : lang === "zh" ? "在 Instagram 上查看 →" : lang === "nl" ? "Bekijk op Instagram →" : "View on Instagram →",
  };

  useEffect(() => {
    fetch("/api/instagram")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data);
        }
      })
      .catch((err) => console.error("Error loading Instagram gallery:", err));
  }, []);

  return (
    <div style={{ paddingBottom: "6rem" }}>
      {/* Back to Home Link */}
      <div style={{ marginBottom: "3rem" }}>
        <Link 
          href="/" 
          style={{ 
            fontSize: "0.85rem", 
            color: "var(--text-secondary)", 
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase"
          }}
          className="minimal-link"
        >
          {galleryStrings.returnHome}
        </Link>
      </div>

      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "4rem", marginBottom: "5rem" }} className="feed-header-grid">
        <div>
          <span style={{ fontSize: "0.8rem", color: "var(--text-primary)", fontWeight: "600", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {galleryStrings.sectionLabel}
          </span>
        </div>
        <div>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", fontWeight: "600", letterSpacing: "-0.04em", margin: "0 0 1.5rem 0", lineHeight: "1", color: "var(--text-primary)" }}>
            {galleryStrings.heading}
          </h1>
          <p style={{ fontSize: "1.15rem", color: "var(--text-secondary)", margin: 0, lineHeight: "1.6", maxWidth: "600px" }}>
            {galleryStrings.desc}
          </p>
        </div>
      </div>

      {/* Gallery Grid: Instagram-Style 3-Column Square Layout */}
      <div 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(3, 1fr)", 
          gap: "8px",
          borderTop: "1px solid var(--grid-line)",
          paddingTop: "3rem"
        }} 
        className="gallery-grid-instagram"
      >
        {items.map((item) => (
          <div 
            key={item.id} 
            onClick={() => setSelectedImage(item)}
            style={{ 
              cursor: "pointer", 
              position: "relative",
              width: "100%",
              aspectRatio: "1/1",
              backgroundColor: "var(--grid-line)",
              overflow: "hidden",
              border: "1px solid var(--grid-line)"
            }}
            className="gallery-square-card"
          >
            <img 
              src={item.url} 
              alt={item.title} 
              decoding="async"
              loading="lazy"
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "cover", 
                filter: "grayscale(100%)",
                transition: "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
              }} 
              className="gallery-square-image"
            />
            
            {/* Instagram-style Hover Overlay */}
            <div 
              className="instagram-hover-overlay"
              style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: "rgba(10, 10, 10, 0.85)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "1.5rem",
                opacity: 0,
                transition: "opacity 0.25s ease",
                textAlign: "center"
              }}
            >
              <span style={{ 
                fontSize: "0.8rem", 
                color: "#a09e9a", 
                textTransform: "uppercase", 
                letterSpacing: "0.05em",
                marginBottom: "0.5rem" 
              }}>
                {item.date}
              </span>
              <h3 style={{ 
                fontFamily: "var(--font-serif, 'Lora', Georgia, serif)", 
                fontSize: "clamp(0.9rem, 2vw, 1.25rem)", 
                fontWeight: "500", 
                fontStyle: "italic", 
                margin: 0, 
                color: "#ffffff",
                lineHeight: "1.2"
              }}>
                {item.title}
              </h3>
              <span style={{ 
                fontSize: "0.8rem", 
                color: "#e4e1db", 
                opacity: 0.7,
                marginTop: "0.5rem",
                textTransform: "uppercase",
                letterSpacing: "0.02em"
              }}>
                {item.location.split(" (")[0]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Fully Immersive Lightbox Overlay */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(10, 10, 10, 0.95)",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "2rem",
              cursor: "zoom-out"
            }}
          >
            {/* Lightbox Content Container */}
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: "100%",
                maxWidth: "900px",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem"
              }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
            >
              {/* Breathtaking Distressed Image */}
              <div style={{ 
                width: "100%", 
                maxHeight: "75vh",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                backgroundColor: "#151413"
              }}>
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.title} 
                  decoding="async"
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "contain",
                    maxHeight: "75vh",
                    filter: "grayscale(100%)" 
                  }} 
                />
              </div>

              {/* Elegant Metadata Footer inside Lightbox */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", color: "#e4e1db", borderTop: "1px solid rgba(255, 255, 255, 0.15)", paddingTop: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "#9e9a93" }}>
                    {selectedImage.date}
                  </span>
                  <h2 style={{ fontFamily: "var(--font-serif, 'Lora', Georgia, serif)", fontSize: "1.5rem", fontWeight: "500", fontStyle: "italic", margin: 0 }}>
                    {selectedImage.title}
                  </h2>
                  {selectedImage.permalink && (
                    <a 
                      href={selectedImage.permalink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "0.8rem",
                        color: "#6366F1",
                        textDecoration: "underline",
                        textUnderlineOffset: "3px",
                        marginTop: "0.25rem",
                        display: "inline-flex",
                        alignItems: "center"
                      }}
                      className="instagram-permalink-link"
                    >
                      {galleryStrings.viewOnInstagram}
                    </a>
                  )}
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem", fontSize: "0.85rem" }}>
                  <span style={{ color: "#9e9a93", fontSize: "0.75rem", textTransform: "uppercase" }}>{galleryStrings.location}</span>
                  <span>{selectedImage.location}</span>
                </div>
              </div>
            </motion.div>

            {/* Floating Close Button */}
            <button 
              onClick={() => setSelectedImage(null)}
              style={{
                position: "absolute",
                top: "2rem",
                right: "2rem",
                background: "none",
                border: "none",
                color: "#e4e1db",
                fontSize: "0.85rem",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }}
            >
              {galleryStrings.close} &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
