import { useEffect, useRef } from 'react';

export default function CustomCursor({ children }) {
  const cursorRef = useRef(null);

  useEffect(() => {
    const handleMove = (e) => {
      const x = e.clientX;
      const y = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <>
      {/* Standard minimalist cursor for desktop */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 border border-void-blood/50 pointer-events-none z-[100] transform-gpu will-change-transform hidden lg:block -translate-x-1/2 -translate-y-1/2"
      />
      {children}
    </>
  );
}
