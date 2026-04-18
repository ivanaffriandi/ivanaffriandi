import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

export default function Hero({ cursorPos, isMuted, playStatic }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const lx = cursorPos.x - rect.left;
      const ly = cursorPos.y - rect.top;
      containerRef.current.style.setProperty('--lx', `${lx}px`);
      containerRef.current.style.setProperty('--ly', `${ly}px`);
    }
  }, [cursorPos]);

  return (
    <motion.section 
      className="min-h-screen flex flex-col justify-center items-center py-20 px-6 relative"
    >
      <div 
        ref={containerRef}
        className="searchlight-applied relative mb-10 text-center select-none p-20"
      >
        <motion.h1 
          className="text-8xl sm:text-[14rem] lg:text-[18rem] font-horror text-void-white tracking-tighter leading-none relative z-20"
          data-text="IVAN"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          IVAN
        </motion.h1>
        
        {/* Subtle background flicker */}
        <motion.div 
          className="absolute inset-0 bg-void-blood/5 mix-blend-overlay opacity-0 pointer-events-none"
          animate={{ opacity: [0, 0.1, 0] }}
          transition={{ repeat: Infinity, duration: 4, times: [0, 0.5, 1] }}
        />
      </div>
      
      <motion.div 
        className="font-special text-lg md:text-2xl tracking-[0.4em] text-void-blood max-w-2xl text-center uppercase"
      >
        I AM WATCHING YOU
        <br/><br/>
        <motion.div 
          className="text-[12px] md:text-[14px] text-gray-400 mt-6 leading-relaxed normal-case tracking-[0.1em] font-special max-w-md mx-auto italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          Look for the truth in the light.
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
