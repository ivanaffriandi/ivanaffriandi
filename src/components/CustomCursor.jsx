import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor({ children }) {
  const cursorRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const updatePosition = (x, y) => {
      // Direct DOM manipulation for zero-lag mask
      document.documentElement.style.setProperty('--x', `${x}px`);
      document.documentElement.style.setProperty('--y', `${y}px`);
      
      // Update the dot position directly on the ref
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${x - 2}px, ${y - 2}px, 0)`;
      }
    };

    const handleMove = (e) => {
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      
      if (x !== undefined && y !== undefined) {
        // Use requestAnimationFrame for smooth interaction during scrolling
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => updatePosition(x, y));
      }
    };

    // Use passive: true to ensure scrolling is never blocked by the cursor script
    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('touchstart', handleMove, { passive: true });
    window.addEventListener('touchmove', handleMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchstart', handleMove);
      window.removeEventListener('touchmove', handleMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none flashlight-mask bg-black z-40 touch-none"></div>
      
      {/* Primary Dot (Zero-Lag) - Hidden on mobile via hover media query in CSS */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-1 h-1 rounded-full bg-void-blood pointer-events-none z-50 will-change-transform hidden sm:block"
      />

      {/* Trailing Aura - Using CSS variables for instant mobile response */}
      <div
        className="fixed top-0 left-0 w-16 h-16 rounded-full bg-void-blood/10 pointer-events-none z-50 blur-[6px] transform-gpu will-change-transform"
        style={{ 
          transform: 'translate3d(calc(var(--x) - 50%), calc(var(--y) - 50%), 0)' 
        }}
      />
      {children}
    </>
  );
}
