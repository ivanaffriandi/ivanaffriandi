"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAudio, MomentMusicMeta } from "@/contexts/AudioContext";

interface MomentMusicPlayerProps {
  meta: MomentMusicMeta;
}

export default function MomentMusicPlayer({ meta }: MomentMusicPlayerProps) {
  const { momentMusicPlaying, playMomentMusic, pauseMomentMusic, momentMusicMeta } = useAudio();

  // Determine if THIS track is the currently loaded/playing one
  const isThisTrack = momentMusicMeta?.url === meta.url;
  const isPlaying = isThisTrack && momentMusicPlaying;

  const handleToggle = () => {
    if (isPlaying) {
      pauseMomentMusic();
    } else {
      playMomentMusic(meta);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.97 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 12px",
        marginBottom: "0.85rem",
        borderRadius: "14px",
        background: isPlaying
          ? "linear-gradient(135deg, rgba(30,215,96,0.12) 0%, rgba(30,215,96,0.05) 100%)"
          : "rgba(30,215,96,0.05)",
        border: `1px solid ${isPlaying ? "rgba(30,215,96,0.28)" : "rgba(30,215,96,0.14)"}`,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        cursor: "pointer",
        transition: "background 0.3s ease, border-color 0.3s ease",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      onClick={handleToggle}
      role="button"
      aria-label={isPlaying ? "Pause music" : "Play music"}
    >
      {/* Vinyl Record */}
      <div style={{ position: "relative", width: "34px", height: "34px", flexShrink: 0 }}>
        {/* Outer ring */}
        <motion.div
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={
            isPlaying
              ? { duration: 4, ease: "linear", repeat: Infinity }
              : { duration: 0 }
          }
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "conic-gradient(from 0deg, #1ED760, #121212 30%, #1ED760 60%, #121212 80%, #1ED760 100%)",
            boxShadow: isPlaying ? "0 0 12px rgba(30,215,96,0.4)" : "none",
            transition: "box-shadow 0.4s ease",
          }}
        />
        {/* Center hole */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "11px",
            height: "11px",
            borderRadius: "50%",
            background: isPlaying ? "rgba(30,215,96,0.9)" : "var(--bg-color)",
            border: "2px solid rgba(0,0,0,0.3)",
            transition: "background 0.3s ease",
          }}
        />
      </div>

      {/* Track info */}
      <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
        <div
          style={{
            fontSize: "0.73rem",
            fontWeight: "700",
            color: "var(--text-primary)",
            lineHeight: "1.2",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontFamily: "var(--font-sans)",
          }}
        >
          {meta.title}
        </div>
        <div
          style={{
            fontSize: "0.65rem",
            color: isPlaying ? "rgba(30,215,96,0.85)" : "var(--text-secondary)",
            marginTop: "2px",
            lineHeight: "1.2",
            fontFamily: "var(--font-sans)",
            transition: "color 0.3s ease",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {meta.artist}
        </div>
      </div>

      {/* Waveform / Play icon */}
      <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
        <AnimatePresence mode="wait" initial={false}>
          {isPlaying ? (
            <motion.div
              key="waveform"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "16px" }}
            >
              {[0, 0.15, 0.3, 0.45].map((delay, i) => (
                <motion.div
                  key={i}
                  animate={{ height: ["3px", `${8 + i * 2}px`, "3px"] }}
                  transition={{ duration: 0.7, delay, ease: "easeInOut", repeat: Infinity }}
                  style={{
                    width: "2.5px",
                    borderRadius: "2px",
                    background: "rgba(30,215,96,0.85)",
                  }}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="play"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "rgba(30,215,96,0.12)",
                  border: "1px solid rgba(30,215,96,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="8"
                  height="8"
                  viewBox="0 0 24 24"
                  fill="rgba(30,215,96,0.9)"
                  style={{ marginLeft: "1px" }}
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spotify-style label */}
      <div
        style={{
          fontSize: "0.55rem",
          fontWeight: "700",
          color: "rgba(30,215,96,0.6)",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          fontFamily: "var(--font-sans)",
          flexShrink: 0,
        }}
      >
        Music
      </div>
    </motion.div>
  );
}
