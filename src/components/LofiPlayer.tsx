"use client";

import { useState, useRef, useEffect } from "react";
import { useAudio } from "@/contexts/AudioContext";

export default function LofiPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { registerLofi, onLofiPlay, onLofiPause } = useAudio();

  // Premium Bossa Nova ambient track (Loaded locally from public/bossa-nova.mp3)
  const TRACK_URL = "/bossa-nova.mp3";

  useEffect(() => {
    // Avoid SSR issues by instantiating inside useEffect
    audioRef.current = new Audio(TRACK_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.25; // Gentle background volume

    // Register with global audio context
    registerLofi(audioRef.current);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      registerLofi(null);
    };
  }, [registerLofi]);

  // Listen for forced pause from AudioContext (when moment music plays)
  useEffect(() => {
    const handleForcedPause = () => {
      setIsPlaying(false);
    };
    window.addEventListener("ivan-lofi-forced-pause", handleForcedPause);
    return () => window.removeEventListener("ivan-lofi-forced-pause", handleForcedPause);
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onLofiPause();
    } else {
      audioRef.current.play().catch((err) => console.log("Audio play prevented:", err));
      setIsPlaying(true);
      onLofiPlay();
    }
  };

  return (
    <div 
      onClick={togglePlay}
      className="ambient-wave-toggle"
      title={isPlaying ? "Pause ambient music" : "Play ambient music"}
    >
      <div 
        className="wave-bar"
        style={{ 
          height: isPlaying ? "8px" : "3px", 
          animation: isPlaying ? "soundwave 0.8s ease-in-out infinite" : "none"
        }} 
      />
      <div 
        className="wave-bar"
        style={{ 
          height: isPlaying ? "10px" : "3px", 
          animation: isPlaying ? "soundwave 0.8s ease-in-out infinite 0.2s" : "none"
        }} 
      />
      <div 
        className="wave-bar"
        style={{ 
          height: isPlaying ? "6px" : "3px", 
          animation: isPlaying ? "soundwave 0.8s ease-in-out infinite 0.4s" : "none"
        }} 
      />

      <style>{`
        @keyframes soundwave {
          0% { height: 3px; }
          50% { height: 10px; }
          100% { height: 3px; }
        }
        .ambient-wave-toggle {
          display: flex;
          gap: 2px;
          align-items: flex-end;
          height: 12px;
          width: 12px;
          cursor: pointer;
          padding: 2px 0;
        }
        .ambient-wave-toggle .wave-bar {
          width: 2px;
          background-color: var(--nav-text-color, var(--text-secondary));
          border-radius: 1px;
          transition: background-color 0.2s ease;
        }
        .ambient-wave-toggle:hover .wave-bar {
          background-color: var(--nav-text-color, var(--text-primary));
        }
      `}</style>
    </div>
  );
}
