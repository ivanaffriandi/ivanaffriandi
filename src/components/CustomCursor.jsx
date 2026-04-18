import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor({ children }) {
  const cursorRef = useRef(null);
  const trailRef = useRef(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const updatePosition = (x, y) => {
      // Direct DOM manipulation for zero-lag mask
      document.documentElement.style.setProperty('--x', `${x}px`);
      document.documentElement.style.setProperty('--y', `${y}px`);
      
      // Update the dot position directly on the ref if possible, or via requestAnimationFrame
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${x - 2}px, ${y - 2}px, 0)`;
      }
    };

    const handleMove = (e) => {
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      if (x !== undefined && y !== undefined) {
        updatePosition(x, y);
      }
    };

    const handleTouchStart = (e) => {
      setIsTouch(true);
      handleMove(e);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleMove);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none flashlight-mask bg-black z-40"></div>
      
      {/* Primary Dot (Zero-Lag) */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-1 h-1 rounded-full bg-void-blood pointer-events-none z-50 will-change-transform"
      />

      {/* Trailing Aura (Framer Motion for smoothness) */}
      <motion.div
        className="fixed top-0 left-0 w-16 h-16 rounded-full bg-void-blood/10 pointer-events-none z-50 blur-[6px]"
        animate={{
          x: "var(--x)",
          y: "var(--y)",
        }}
        style={{ translateX: '-50%', translateY: '-50%' }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 30,
          mass: 0.4
        }}
      />
      {children}
    </>
  );
}
