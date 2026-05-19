"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

export default function BirthdayCelebration() {
  const [isBirthday, setIsBirthday] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if today is August 3rd
    const today = new Date();
    // For testing purposes, uncomment the line below to force the birthday animation to show:
    // const isAug3 = true; 
    const isAug3 = today.getMonth() === 7 && today.getDate() === 3;

    if (isAug3) {
      setIsBirthday(true);
      setShowModal(true);
      
      // Fire confetti
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults, particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults, particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);
    }
  }, []);

  if (!isBirthday) return null;

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(18, 17, 16, 0.8)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)"
          }}
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{
              backgroundColor: "var(--bg-color)",
              padding: "3.5rem 2rem",
              borderRadius: "32px",
              maxWidth: "480px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              border: "1px solid rgba(150,150,150,0.15)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: "4.5rem", marginBottom: "1rem" }}>🎂</div>
            <h2 style={{ 
              fontFamily: "var(--font-sans)", 
              fontSize: "2.2rem", 
              fontWeight: "700",
              color: "var(--text-primary)",
              marginBottom: "1rem",
              letterSpacing: "-0.02em"
            }}>
              Happy Birthday Ivan!
            </h2>
            <p style={{ 
              fontFamily: "var(--font-sans)", 
              fontSize: "1.05rem", 
              color: "var(--text-secondary)",
              lineHeight: "1.6",
              marginBottom: "2.5rem",
              padding: "0 1rem"
            }}>
              Wishing you a year filled with brilliant design ideas, perfect aesthetics, endless creativity, and peaceful journaling moments. May your code always compile and your minimalist grids always align perfectly! 🌟🍄
            </p>
            <button 
              onClick={() => setShowModal(false)}
              style={{
                padding: "14px 36px",
                backgroundColor: "var(--text-primary)",
                color: "var(--bg-color)",
                border: "none",
                borderRadius: "24px",
                fontFamily: "var(--font-sans)",
                fontSize: "1.05rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "opacity 0.2s, transform 0.2s"
              }}
              onMouseOver={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "scale(1.02)"; }}
              onMouseOut={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
            >
              Thank You!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
