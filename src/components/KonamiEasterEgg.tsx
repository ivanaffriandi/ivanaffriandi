"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function KonamiEasterEgg() {
  const [showToast, setShowToast] = useState(false);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const konamiCode = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];
    let keyBuffer: string[] = [];

    const handleKeyDown = (e: KeyboardEvent) => {
      keyBuffer.push(e.key);
      // Keep buffer length matching the code length
      if (keyBuffer.length > konamiCode.length) {
        keyBuffer.shift();
      }

      // Check match
      const isMatch = konamiCode.every((key, index) => key === keyBuffer[index]);

      if (isMatch) {
        // Fire confetti!
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#B47A3E", "#D4AF37", "#f7f3e8", "#47321e"],
        });

        // Toggle active state
        setIsActive((prev) => {
          const nextState = !prev;
          if (nextState) {
            document.body.classList.add("retro-gold-theme");
          } else {
            document.body.classList.remove("retro-gold-theme");
          }
          return nextState;
        });

        // Show elegant toast
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);

        // Clear buffer
        keyBuffer = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Styles for the secret golden theme */}
      <style dangerouslySetInnerHTML={{ __html: `
        body.retro-gold-theme {
          --bg-color: #FAF4E8 !important; /* Beautiful warm gold aged munken paper */
          --bg-color-rgba: rgba(250, 244, 232, 0.85) !important;
          --text-primary: #3E2B1A !important; /* Elegant dark espresso ink */
          --text-secondary: #8C6A46 !important; /* Warm hazelnut gold */
          --border-color: #E6D8C1 !important; /* Vintage golden-amber grid line */
          --grid-line: #E6D8C1 !important;
          background-color: #FAF4E8 !important;
          color: #3E2B1A !important;
          transition: background-color 0.5s cubic-bezier(0.16, 1, 0.3, 1), color 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        body.retro-gold-theme .editorial-feed-card {
          background-color: rgba(140, 106, 70, 0.03) !important;
          border-left: 2px solid rgba(140, 106, 70, 0.15) !important;
        }

        body.retro-gold-theme .editorial-feed-card:hover {
          background-color: rgba(140, 106, 70, 0.08) !important;
          border-left: 2px solid #B47A3E !important;
        }
        
        body.retro-gold-theme .timeline-card {
          background-color: #FAF4E8 !important;
          border-color: #E6D8C1 !important;
        }
        
        body.retro-gold-theme .timeline-card:hover {
          border-color: #3E2B1A !important;
        }
      `}} />

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: "-50%", scale: 0.9 }}
            animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
            exit={{ opacity: 0, y: -30, x: "-50%", scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            style={{
              position: "fixed",
              top: "2.5rem",
              left: "50%",
              zIndex: 99999,
              width: "90%",
              maxWidth: "360px",
              backgroundColor: "rgba(62, 43, 26, 0.95)",
              border: "1px solid rgba(180, 122, 62, 0.4)",
              borderRadius: "20px",
              padding: "1rem 1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              color: "#FAF4E8"
            }}
          >
            <div style={{ fontSize: "1.75rem" }}>🌟</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ 
                fontFamily: "var(--font-sans)", 
                fontSize: "0.88rem", 
                fontWeight: "700",
                letterSpacing: "-0.01em"
              }}>
                {isActive ? "Retro Gold Theme Unlocked!" : "Returned to Original Grid Theme"}
              </span>
              <span style={{ 
                fontFamily: "var(--font-sans)", 
                fontSize: "0.72rem", 
                opacity: 0.8,
                lineHeight: "1.3"
              }}>
                {isActive 
                  ? "Enter Konami Code again to toggle back." 
                  : "Enjoy the pristine Swiss grid layout!"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
