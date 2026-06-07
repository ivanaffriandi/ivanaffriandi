"use client";

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type AudioSource = "none" | "lofi" | "moment";

export interface MomentMusicMeta {
  title: string;
  artist: string;
  url: string;
  coverUrl?: string;
}

interface AudioContextType {
  /** Which source is currently playing */
  activeSource: AudioSource;
  /** Metadata of the currently playing moment music (if any) */
  momentMusicMeta: MomentMusicMeta | null;
  /** Is the moment music currently playing? */
  momentMusicPlaying: boolean;

  /** Called by LofiPlayer to register its audio element */
  registerLofi: (audio: HTMLAudioElement | null) => void;
  /** Called by LofiPlayer to notify state change */
  onLofiPlay: () => void;
  onLofiPause: () => void;

  /** Play moment music — pauses lofi automatically */
  playMomentMusic: (meta: MomentMusicMeta) => void;
  /** Pause moment music */
  pauseMomentMusic: () => void;
  /** Toggle moment music */
  toggleMomentMusic: () => void;
  /** Stop and clear moment music (e.g. when switching to a post with no music) */
  clearMomentMusic: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AudioCtx = createContext<AudioContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const lofiRef = useRef<HTMLAudioElement | null>(null);
  const momentAudioRef = useRef<HTMLAudioElement | null>(null);

  const [activeSource, setActiveSource] = useState<AudioSource>("none");
  const [momentMusicMeta, setMomentMusicMeta] = useState<MomentMusicMeta | null>(null);
  const [momentMusicPlaying, setMomentMusicPlaying] = useState(false);

  // Pause lofi helper
  const pauseLofi = useCallback(() => {
    if (lofiRef.current && !lofiRef.current.paused) {
      lofiRef.current.pause();
      // Notify LofiPlayer via custom event
      window.dispatchEvent(new CustomEvent("ivan-lofi-forced-pause"));
    }
  }, []);

  // ── LofiPlayer registration ──
  const registerLofi = useCallback((audio: HTMLAudioElement | null) => {
    lofiRef.current = audio;
  }, []);

  const onLofiPlay = useCallback(() => {
    // If moment music is playing, pause it
    if (momentAudioRef.current && !momentAudioRef.current.paused) {
      momentAudioRef.current.pause();
      setMomentMusicPlaying(false);
    }
    setActiveSource("lofi");
  }, []);

  const onLofiPause = useCallback(() => {
    setActiveSource((prev) => (prev === "lofi" ? "none" : prev));
  }, []);

  // ── Moment music ──
  const playMomentMusic = useCallback((meta: MomentMusicMeta) => {
    // Pause lofi
    pauseLofi();

    if (!momentAudioRef.current || momentAudioRef.current.src !== meta.url) {
      if (momentAudioRef.current) {
        momentAudioRef.current.pause();
        momentAudioRef.current.src = "";
      }
      momentAudioRef.current = new Audio(meta.url);
      momentAudioRef.current.loop = true;
      momentAudioRef.current.volume = 0.72;
    }

    setMomentMusicMeta(meta);
    momentAudioRef.current
      .play()
      .then(() => {
        setMomentMusicPlaying(true);
        setActiveSource("moment");
      })
      .catch((err) => {
        console.warn("Moment music play blocked:", err);
      });
  }, [pauseLofi]);

  const pauseMomentMusic = useCallback(() => {
    if (momentAudioRef.current && !momentAudioRef.current.paused) {
      momentAudioRef.current.pause();
    }
    setMomentMusicPlaying(false);
    setActiveSource((prev) => (prev === "moment" ? "none" : prev));
  }, []);

  const toggleMomentMusic = useCallback(() => {
    if (!momentMusicMeta) return;
    if (momentMusicPlaying) {
      pauseMomentMusic();
    } else {
      playMomentMusic(momentMusicMeta);
    }
  }, [momentMusicMeta, momentMusicPlaying, pauseMomentMusic, playMomentMusic]);

  const clearMomentMusic = useCallback(() => {
    if (momentAudioRef.current) {
      momentAudioRef.current.pause();
      momentAudioRef.current.src = "";
      momentAudioRef.current = null;
    }
    setMomentMusicMeta(null);
    setMomentMusicPlaying(false);
    setActiveSource((prev) => (prev === "moment" ? "none" : prev));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (momentAudioRef.current) {
        momentAudioRef.current.pause();
      }
    };
  }, []);

  return (
    <AudioCtx.Provider
      value={{
        activeSource,
        momentMusicMeta,
        momentMusicPlaying,
        registerLofi,
        onLofiPlay,
        onLofiPause,
        playMomentMusic,
        pauseMomentMusic,
        toggleMomentMusic,
        clearMomentMusic,
      }}
    >
      {children}
    </AudioCtx.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAudio() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}
