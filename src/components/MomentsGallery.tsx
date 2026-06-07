"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MomentItem } from "@/lib/moments";
import { IGProfile } from "@/app/moments/page";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAudio, MomentMusicMeta } from "@/contexts/AudioContext";
import CopyrightText from "@/components/CopyrightText";
import FooterAbout from "@/components/FooterAbout";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import MomentMusicPlayer from "@/components/MomentMusicPlayer";

// Format date to shorter form: "February 9, 2026" -> "Feb 9, 2026"
function formatShortDate(dateStr: string) {
  if (!dateStr) return "";
  return dateStr
    .replace("January", "Jan").replace("February", "Feb").replace("March", "Mar")
    .replace("April", "Apr").replace("June", "Jun").replace("July", "Jul")
    .replace("August", "Aug").replace("September", "Sep").replace("October", "Oct")
    .replace("November", "Nov").replace("December", "Dec");
}

/* ─── Carousel within BackgroundPhoto ────────────────────────────────── */
/* ─── Carousel within BackgroundPhoto ────────────────────────────────── */
function CarouselPhoto({
  images,
  momentId,
  onRatioChange,
  slide,
  setSlide,
}: {
  images: { url: string; videoUrl?: string }[];
  momentId: string;
  onRatioChange: (r: number) => void;
  slide: number;
  setSlide: (s: number) => void;
}) {
  const total = images.length;

  // Load natural ratio for CURRENT photo (images[slide])
  useEffect(() => {
    const currentImg = images[Math.min(slide, total - 1)];
    if (!currentImg) return;
    if (currentImg.videoUrl) {
      const v = document.createElement("video");
      v.src = currentImg.videoUrl;
      v.onloadedmetadata = () => onRatioChange(v.videoWidth / v.videoHeight || 1);
    } else {
      const img = new Image();
      img.src = currentImg.url;
      img.onload = () => onRatioChange(img.naturalWidth / img.naturalHeight || 1);
      img.onerror = () => onRatioChange(1);
    }
  }, [images, slide, total, onRatioChange]);

  const go = (newSlide: number) => {
    setSlide(Math.max(0, Math.min(newSlide, total - 1)));
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      {/* Horizontal Slider Track */}
      <motion.div
        animate={{ x: `-${slide * 100}%` }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
        }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            style={{
              width: "100%",
              minWidth: "100%",
              maxWidth: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              position: "relative",
            }}
          >
            {img.videoUrl ? (
              <video
                src={img.videoUrl}
                autoPlay loop playsInline muted
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center", display: "block" }}
              />
            ) : (
              <img
                src={img.url}
                alt=""
                draggable={false}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center", display: "block" }}
              />
            )}
          </div>
        ))}
      </motion.div>

      {/* Prev Button */}
      {total > 1 && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            if (slide > 0) go(slide - 1);
          }}
          disabled={slide === 0}
          animate={{
            opacity: slide === 0 ? 0 : 1,
            pointerEvents: slide === 0 ? "none" : "auto"
          }}
          whileHover={{ scale: 1.08, backgroundColor: "rgba(255,255,255,0.88)" }}
          whileTap={{ scale: 0.93 }}
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.45)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background-color 0.2s ease, opacity 0.25s ease",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </motion.button>
      )}

      {/* Next Button */}
      {total > 1 && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            if (slide < total - 1) go(slide + 1);
          }}
          disabled={slide === total - 1}
          animate={{
            opacity: slide === total - 1 ? 0 : 1,
            pointerEvents: slide === total - 1 ? "none" : "auto"
          }}
          whileHover={{ scale: 1.08, backgroundColor: "rgba(255,255,255,0.88)" }}
          whileTap={{ scale: 0.93 }}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.45)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.12)",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "background-color 0.2s ease, opacity 0.25s ease",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="3" strokeLinecap="round">
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </motion.button>
      )}

      {/* Dots */}
      {total > 1 && (
        <div style={{
          position: "absolute",
          bottom: "42px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "5px",
          zIndex: 15,
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          padding: "4px 7px",
          borderRadius: "100px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          border: "0.5px solid rgba(255,255,255,0.15)"
        }}>
          {images.map((_, i) => (
            <motion.div
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                go(i);
              }}
              animate={{ width: i === slide ? 14 : 5, backgroundColor: i === slide ? "#fff" : "rgba(255,255,255,0.45)" }}
              style={{ height: "5px", borderRadius: "3px", cursor: "pointer" }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Full-Viewport Background Photo ─────────────────────────────────── */
function BackgroundPhoto({
  moment,
  heightCss,
  onRatioChange,
  activeSlide,
  setActiveSlide,
}: {
  moment: MomentItem;
  heightCss: string;
  onRatioChange: (r: number) => void;
  activeSlide: number;
  setActiveSlide: (s: number) => void;
}) {
  const images: { url: string; videoUrl?: string }[] =
    moment.mediaType === "CAROUSEL_ALBUM" && moment.children?.length
      ? moment.children
      : [{ url: moment.url, videoUrl: moment.videoUrl }];

  const blurSrc = images[Math.min(activeSlide, images.length - 1)]?.url ?? moment.url;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        backgroundColor: "#000",
      }}
    >
      {/* Blurred ambient background — crossfades on moment/slide change */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.img
          key={`bg-${moment.id}-${activeSlide}`}
          src={blurSrc}
          alt=""
          draggable={false}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            filter: "blur(28px) brightness(0.45)",
            opacity: 0.55,
            transform: "scale(1.12)",
          }}
        />
      </AnimatePresence>

      {/* Sharp foreground — crossfades on moment change for an ultra-smooth iOS feel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: heightCss,
          transition: "height 0.45s cubic-bezier(0.16,1,0.3,1)",
          overflow: "hidden",
        }}
      >
        <AnimatePresence initial={false}>
          <motion.div
            key={moment.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          >
            <CarouselPhoto
              images={images}
              momentId={moment.id}
              onRatioChange={onRatioChange}
              slide={activeSlide}
              setSlide={setActiveSlide}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom gradient to blend into drawer bg */}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: "160px",
          background: "linear-gradient(to top, var(--bg-color) 0%, transparent 100%)",
          zIndex: 3, pointerEvents: "none",
        }}
      />
    </div>
  );
}

/* ─── Main Gallery Component ──────────────────────────────────────────── */
export default function MomentsGallery({
  initialMoments,
  profile,
}: {
  initialMoments: MomentItem[];
  profile?: IGProfile;
  initialStories?: MomentItem[];
}) {
  const { lang } = useLanguage();
  const { clearMomentMusic, playMomentMusic } = useAudio();
  const [moments, setMoments] = useState<MomentItem[]>(initialMoments);
  const [activeMoment, setActiveMoment] = useState<MomentItem | null>(initialMoments[0] || null);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [activeSlide, setActiveSlide] = useState(0);
  const [ratioCache, setRatioCache] = useState<Record<string, number>>({});
  const [likedMoments, setLikedMoments] = useState<Record<string, boolean>>({});
  const [captionVisible, setCaptionVisible] = useState(false);
  const [heartBurst, setHeartBurst] = useState<{ id: number; glyph: string; x: number; y: number; rotate: number; scale: number; delay: number }[]>([]);
  // Music map: postId → MomentMusicMeta
  const [musicMap, setMusicMap] = useState<Record<string, MomentMusicMeta>>({});

  // Reset slide state to 0 when activeMoment changes
  useEffect(() => {
    setActiveSlide(0);
  }, [activeMoment?.id]);

  // Pre-load all initial moments first image aspect ratio on mount
  useEffect(() => {
    if (!initialMoments || initialMoments.length === 0) return;
    initialMoments.forEach((moment) => {
      const imagesList = moment.mediaType === "CAROUSEL_ALBUM" && moment.children?.length
        ? moment.children
        : [{ url: moment.url, videoUrl: moment.videoUrl }];
      const url = imagesList[0]?.url || moment.url;
      if (!url) return;

      if (moment.videoUrl) {
        const v = document.createElement("video");
        v.src = moment.videoUrl;
        v.onloadedmetadata = () => {
          setRatioCache((prev) => ({ ...prev, [moment.id]: v.videoWidth / v.videoHeight || 1 }));
        };
      } else {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          setRatioCache((prev) => ({ ...prev, [moment.id]: img.naturalWidth / img.naturalHeight || 1 }));
        };
      }
    });
  }, [initialMoments]);

  const displayUsername = profile?.username || "ivanaffriandi";

  // Fetch fresh moments on mount for dynamic live update
  useEffect(() => {
    fetch("/api/moments")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMoments(data);
          setActiveMoment((prevActive) => {
            if (!prevActive) return data[0];
            const found = data.find((m) => m.id === prevActive.id);
            return found || data[0];
          });
        }
      })
      .catch((err) => console.warn("⚠️ Client failed to fetch dynamic moments:", err));
  }, []);

  // Load music map from public/moment-music.json
  useEffect(() => {
    fetch("/moment-music.json")
      .then((res) => res.json())
      .then((data) => {
        if (data?.posts && typeof data.posts === "object") {
          setMusicMap(data.posts);
        }
      })
      .catch(() => {/* silently fail — music is optional */});
  }, []);

  // Toggle moments-page body class
  useEffect(() => {
    document.body.classList.add("moments-page");
    return () => document.body.classList.remove("moments-page");
  }, []);

  // Handle music when active moment changes
  useEffect(() => {
    if (!activeMoment) return;
    const music = musicMap[activeMoment.id];
    if (!music) {
      clearMomentMusic();
    }
    // If there IS music, we don't auto-play — user must press play
    // (respecting browser autoplay policies)
  }, [activeMoment?.id, musicMap, clearMomentMusic]);

  // Load liked status from localStorage on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ivan_liked_moments");
      if (saved) {
        try {
          setLikedMoments(JSON.parse(saved));
        } catch (err) {
          console.warn("⚠️ Failed to parse liked moments:", err);
        }
      }
    }
  }, []);

  // Reset state on moment change
  useEffect(() => {
    setCaptionExpanded(false);
    setCaptionVisible(false);
    setAspectRatio(1);
  }, [activeMoment?.id]);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeMoment) return;
    const momentId = activeMoment.id;
    const alreadyLiked = likedMoments[momentId];

    const updated = {
      ...likedMoments,
      [momentId]: !alreadyLiked,
    };

    setLikedMoments(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("ivan_liked_moments", JSON.stringify(updated));
    }

    if (!alreadyLiked) {
      const now = Date.now();
      const newBurst = [
        { glyph: "❤", x: -34, y: -34, rotate: -18, scale: 1.05, delay: 0 },
        { glyph: "✦", x: -12, y: -42, rotate: 12, scale: 0.8, delay: 0.03 },
        { glyph: "❤", x: 24, y: -38, rotate: 18, scale: 0.92, delay: 0.06 },
        { glyph: "✧", x: 42, y: -14, rotate: -12, scale: 0.86, delay: 0.09 },
        { glyph: "❤", x: 34, y: 22, rotate: 20, scale: 0.78, delay: 0.12 },
        { glyph: "✦", x: 2, y: 34, rotate: -8, scale: 0.76, delay: 0.15 },
        { glyph: "❤", x: -38, y: 16, rotate: -24, scale: 0.82, delay: 0.1 },
        { glyph: "✧", x: -48, y: -8, rotate: 16, scale: 0.72, delay: 0.05 },
        { glyph: "❤", x: -18, y: -58, rotate: -10, scale: 0.76, delay: 0.08 },
        { glyph: "✦", x: 16, y: -58, rotate: 10, scale: 0.72, delay: 0.11 },
        { glyph: "❤", x: 56, y: -30, rotate: 24, scale: 0.7, delay: 0.14 },
        { glyph: "✧", x: 58, y: 8, rotate: -18, scale: 0.68, delay: 0.17 },
        { glyph: "❤", x: 18, y: 48, rotate: 14, scale: 0.72, delay: 0.19 },
        { glyph: "✦", x: -18, y: 48, rotate: -14, scale: 0.66, delay: 0.2 },
        { glyph: "❤", x: -58, y: 4, rotate: -20, scale: 0.72, delay: 0.16 },
        { glyph: "✧", x: -56, y: -28, rotate: 20, scale: 0.68, delay: 0.13 },
      ].map((item, index) => ({ ...item, id: now + index }));

      setHeartBurst(newBurst);
      window.setTimeout(() => setHeartBurst([]), 900);
    }
  };

  const getLikeText = (moment: MomentItem) => {
    const isLiked = likedMoments[moment.id];
    const count = (moment.likeCount ?? 0) + (isLiked ? 1 : 0);

    if (isLiked) {
      if (lang === "nl") return `Leuk gevonden!`;
      if (lang === "ar") return `تم الإعجاب!`;
      if (lang === "zh") return `已赞!`;
      return `Liked!`;
    }

    if (lang === "nl") return `${count} leuks`;
    if (lang === "ar") return `${count} إعجاب`;
    if (lang === "zh") return `${count} 赞`;
    return `${count} ${count === 1 ? "like" : "likes"}`;
  };

  const selectMoment = useCallback((moment: MomentItem) => {
    setActiveMoment(moment);
    window.scrollTo({ top: 0 });
  }, []);

  // Derive caption/title display logic
  const storyText = activeMoment?.story || "";
  const titleText = activeMoment?.title || "";
  const showTitle = titleText && storyText &&
    !storyText.toLowerCase().startsWith(titleText.toLowerCase().trim().slice(0, 20));
  const showTitleOnly = titleText && !storyText;
  const hasCaption = !!(showTitle || showTitleOnly || storyText);

  // The opening height based on the photo's natural aspect ratio
  // Extra offset so drawer starts slightly above the photo's bottom edge, hiding corner cuts
  const activeRatio = activeMoment ? (ratioCache[activeMoment.id] || aspectRatio) : aspectRatio;
  const H = `clamp(40vh, ${100 / activeRatio}vw, 72vh)`;

  return (
    <>
      {/* ── Fixed full-viewport background photo ── */}
      {activeMoment && (
        <BackgroundPhoto
          moment={activeMoment}
          heightCss={H}
          onRatioChange={(newRatio) => {
            setRatioCache((prev) => {
              if (prev[activeMoment.id] === newRatio) return prev;
              return { ...prev, [activeMoment.id]: newRatio };
            });
            setAspectRatio(newRatio);
          }}
          activeSlide={activeSlide}
          setActiveSlide={setActiveSlide}
        />
      )}

      {/* ── Full-width Drawer Sheet ── */}
      <div
        style={{
          marginLeft: "calc(-4vw)",
          marginRight: "calc(-4vw)",
          width: "calc(100% + 8vw)",
          position: "relative",
          zIndex: 20,
          marginTop: `calc(${H} - 70px)`,
          transition: "margin-top 0.45s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div
          id="moments-drawer"
          style={{
            backgroundColor: "var(--bg-color)",
            borderTop: "1px solid var(--border-color)",
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.10)",
          }}
        >
          {/* Inner content */}
          <div style={{
            maxWidth: 850,
            margin: "0 auto",
            padding: "1.5rem 4vw 0 4vw",
            fontFamily: "var(--font-sans)",
          }}>
            {/* ── Header row ── */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeMoment?.id ?? "header"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16,1,0.3,1] }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  borderBottom: "1px solid rgba(150,150,150,0.12)",
                  paddingBottom: "0.8rem",
                  marginBottom: "0.85rem",
                }}>
                  {/* Left: Date + Location */}
                  <div>
                    <h1 style={{
                      fontSize: "1.0rem",
                      fontWeight: "600",
                      lineHeight: "1.15",
                      color: "var(--text-primary)",
                      margin: 0,
                      letterSpacing: "-0.01em",
                      fontFamily: "var(--font-sans)",
                    }}>
                      {formatShortDate(activeMoment?.date || "—")}
                    </h1>
                    <p style={{
                      fontSize: "0.7rem",
                      color: "var(--text-secondary)",
                      margin: "3px 0 0 0",
                      opacity: 0.65,
                      fontWeight: "500",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}>
                      {activeMoment?.location && activeMoment.location !== "Unknown" && activeMoment.location !== "" ? (
                        <>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {activeMoment.location}
                        </>
                      ) : (
                        <span style={{ opacity: 0.45 }}>
                          {lang === "nl" ? "Geen locatie" : lang === "ar" ? "بدون موقع" : lang === "zh" ? "无位置" : "No location"}
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Right: Likes pill — solid red, contrasting text, now interactive! */}
                  <div style={{ position: "relative", zIndex: 15, flexShrink: 0, display: "flex", alignItems: "center", gap: "7px" }}>
                    {hasCaption && (
                      <motion.button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCaptionVisible((prev) => !prev);
                        }}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.94 }}
                        title={captionVisible ? "Hide caption" : "Show caption"}
                        aria-label={captionVisible ? "Hide caption" : "Show caption"}
                        style={{
                          height: "24.5px",
                          minWidth: "42px",
                          padding: "0 11px",
                          borderRadius: "20px",
                          border: "1px solid rgba(150,150,150,0.18)",
                          background: captionVisible ? "var(--text-primary)" : "rgba(150,150,150,0.08)",
                          color: captionVisible ? "var(--bg-color)" : "var(--text-primary)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: captionVisible ? "0 6px 16px rgba(0,0,0,0.14)" : "0 3px 10px rgba(0,0,0,0.06)",
                        }}
                      >
                        {captionVisible ? (
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        ) : (
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.15" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7.5 5.5h9A4.5 4.5 0 0 1 21 10v3a4.5 4.5 0 0 1-4.5 4.5h-4.8L7.6 20a.9.9 0 0 1-1.35-.78v-2.04A4.45 4.45 0 0 1 3 13V10a4.5 4.5 0 0 1 4.5-4.5Z" />
                          </svg>
                        )}
                      </motion.button>
                    )}

                    {activeMoment?.likeCount !== undefined && (
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <motion.button
                        onClick={handleLikeClick}
                        whileHover={{ scale: 1.035 }}
                        whileTap={{ scale: 0.94 }}
                        animate={{
                          boxShadow: likedMoments[activeMoment.id]
                            ? [
                              "0 3px 10px rgba(225, 48, 108, 0.32)",
                              "0 0 0 5px rgba(255, 120, 170, 0.16), 0 0 24px rgba(225, 48, 108, 0.45)",
                              "0 3px 10px rgba(225, 48, 108, 0.32)"
                            ]
                            : "0 3px 10px rgba(225, 48, 108, 0.28)",
                        }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: "5px",
                          padding: "5px 12px", borderRadius: "20px",
                          background: likedMoments[activeMoment.id]
                            ? "linear-gradient(135deg, #E1306C 0%, #C2185B 100%)"
                            : "#E1306C",
                          border: "none", cursor: "pointer",
                          outline: "none",
                          position: "relative",
                          overflow: "visible",
                        }}
                      >
                        <motion.svg
                          width="11"
                          height="11"
                          viewBox="0 0 24 24"
                          fill="#fff"
                          animate={{ scale: likedMoments[activeMoment.id] ? [1, 1.24, 1] : 1 }}
                          transition={{ duration: 0.42, ease: "easeOut" }}
                          style={{ transformOrigin: "center" }}
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </motion.svg>
                        <span style={{ fontSize: "0.73rem", fontWeight: "700", color: "#fff", fontFamily: "var(--font-sans)" }}>
                          {getLikeText(activeMoment)}
                        </span>
                      </motion.button>

                      {/* Simple love sparkle burst */}
                      <AnimatePresence>
                        {heartBurst.map((item) => (
                          <motion.span
                            key={item.id}
                            initial={{ opacity: 0, x: 0, y: 0, scale: 0.35, rotate: 0 }}
                            animate={{ opacity: [0, 1, 0], x: item.x, y: item.y, scale: [0.35, item.scale, 0.55], rotate: item.rotate }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.72, delay: item.delay, ease: "easeOut" }}
                            style={{
                              position: "absolute",
                              left: "50%",
                              top: "50%",
                              pointerEvents: "none",
                              color: item.glyph === "❤" ? "#FF4F8B" : "#FFD7E8",
                              fontSize: item.glyph === "❤" ? "0.95rem" : "0.8rem",
                              lineHeight: 1,
                              textShadow: item.glyph === "❤"
                                ? "0 0 12px rgba(255, 79, 139, 0.65)"
                                : "0 0 10px rgba(255, 215, 232, 0.9)",
                              zIndex: 100,
                            }}
                          >
                            {item.glyph}
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                    )}
                  </div>
                </div>

                {/* ── Music Player ── */}
                <AnimatePresence>
                  {activeMoment && musicMap[activeMoment.id] && (
                    <MomentMusicPlayer
                      key={activeMoment.id}
                      meta={musicMap[activeMoment.id]}
                    />
                  )}
                </AnimatePresence>

                {/* ── Caption Card ── */}
                {hasCaption && captionVisible && (
                  <div style={{
                    background: "var(--bg-secondary, rgba(120,120,120,0.06))",
                    border: "1px solid var(--border-color)",
                    borderRadius: "12px",
                    padding: "0.8rem 1rem",
                    marginBottom: "1rem",
                    fontFamily: "var(--font-sans)",
                  }}>
                    {(showTitle || showTitleOnly) && (
                      <h3 style={{
                        fontSize: "0.8rem", fontWeight: "700",
                        color: "var(--text-primary)",
                        margin: storyText ? "0 0 0.4rem 0" : 0,
                        lineHeight: "1.4",
                      }}>
                        {titleText}
                      </h3>
                    )}
                    {storyText && (
                      <div>
                        <p style={{
                          fontSize: "0.77rem", lineHeight: "1.55",
                          color: "var(--text-primary)", opacity: 0.78,
                          margin: 0, whiteSpace: "pre-line",
                        }}>
                          {storyText.length > 200 && !captionExpanded
                            ? storyText.slice(0, 170).trim() + "…"
                            : storyText}
                        </p>
                        {storyText.length > 200 && (
                          <button
                            onClick={() => setCaptionExpanded(!captionExpanded)}
                            style={{
                              background: "none", border: "none", padding: "3px 0",
                              color: "var(--text-secondary)", fontSize: "0.72rem",
                              fontWeight: "600", cursor: "pointer",
                              display: "inline-flex", alignItems: "center", gap: "3px", marginTop: "4px",
                            }}
                          >
                            {captionExpanded ? "Less" : "More"}
                            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
                              style={{ transform: captionExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* ── 3-column photo grid ── */}
            {moments.length > 0 && (
              <div className="moments-ios-grid">
                {moments.map((moment, idx) => {
                  const isActive = activeMoment?.id === moment.id;
                  return (
                    <motion.div
                      key={moment.id}
                      onClick={() => selectMoment(moment)}
                      className={`moments-ios-grid-cell${isActive ? " active" : ""}`}
                      style={{
                        backgroundColor: "#f0ece6",
                        outline: isActive ? "2.5px solid var(--text-primary)" : "2.5px solid transparent",
                        outlineOffset: "2px",
                        transition: "outline 0.2s ease",
                      }}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(idx * 0.012, 0.35), duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <img
                        src={moment.url}
                        alt={moment.title}
                        decoding="async"
                        loading="lazy"
                        className="moments-ios-grid-img"
                        onError={(e) => { e.currentTarget.src = "/nature_hero.png"; }}
                      />
                      {/* Carousel badge */}
                      {moment.mediaType === "CAROUSEL_ALBUM" && (
                        <div style={{
                          position: "absolute", top: "6px", right: "6px",
                          background: "rgba(0,0,0,0.52)", borderRadius: "5px", padding: "3px 5px",
                          display: "flex", alignItems: "center",
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                            <rect x="2" y="2" width="9" height="9" rx="1.5" />
                            <rect x="13" y="2" width="9" height="9" rx="1.5" />
                            <rect x="2" y="13" width="9" height="9" rx="1.5" />
                            <rect x="13" y="13" width="9" height="9" rx="1.5" />
                          </svg>
                        </div>
                      )}
                      {/* Video badge */}
                      {moment.mediaType === "VIDEO" && !moment.children && (
                        <div style={{
                          position: "absolute", bottom: "6px", right: "6px",
                          background: "rgba(0,0,0,0.55)", borderRadius: "50%",
                          width: "22px", height: "22px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                      {/* Music badge */}
                      {musicMap[moment.id] && (
                        <div style={{
                          position: "absolute", top: "6px", left: "6px",
                          background: "rgba(30,215,96,0.85)", borderRadius: "50%",
                          width: "18px", height: "18px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          backdropFilter: "blur(4px)",
                        }}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                            <path d="M9 18V5l12-2v13" />
                            <circle cx="6" cy="18" r="3" />
                            <circle cx="18" cy="16" r="3" />
                          </svg>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Instagram link */}
            <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "center" }}>
              <a
                href={`https://instagram.com/${displayUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  padding: "5px 13px", borderRadius: "12px",
                  background: "rgba(150,150,150,0.06)", border: "1px solid rgba(150,150,150,0.14)",
                  color: "var(--text-secondary)", fontSize: "0.7rem", fontWeight: "600",
                  textDecoration: "none", transition: "all 0.2s ease",
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
                View on Instagram
              </a>
            </div>

            {/* Footer */}
            <footer style={{ 
              width: "100%",
              padding: "0.75rem 0",
              marginTop: "1.25rem",
              borderTop: "1px solid var(--border-color)",
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              alignItems: "center",
              boxSizing: "border-box",
              paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
            }}>
              <CopyrightText />
              <FooterAbout />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", fontSize: "0.78rem", color: "var(--text-secondary)", fontWeight: "500", fontFamily: "var(--font-sans)", letterSpacing: "0.01em" }}>
                <LanguageSwitcher />
              </div>
            </footer>

          </div>
        </div>
      </div>
    </>
  );
}
