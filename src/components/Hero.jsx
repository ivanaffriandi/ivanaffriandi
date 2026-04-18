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
        className="searchlight-applied relative mb-12 text-center select-none p-24"
      >
        <motion.h1 
          className="text-9xl sm:text-[16rem] lg:text-[20rem] font-horror text-void-white tracking-tighter leading-none relative z-20"
          data-text="IVAN"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          IVAN
        </motion.h1>
        
        <motion.div 
          className="absolute -top-4 left-1/2 -translate-x-1/2 font-syne text-[10px] tracking-[0.8em] text-void-blood/40 uppercase whitespace-nowrap z-30"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 4 }}
        >
          Ora ana sing langgeng
        </motion.div>
      </div>
      
      <motion.div 
        className="font-special text-xl md:text-3xl tracking-[0.4em] text-void-blood max-w-3xl text-center uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        DO YOU HEAR ME BREATHING?
        <br/><br/>
        <motion.div 
          className="text-[14px] md:text-[16px] text-gray-500 mt-8 leading-relaxed normal-case tracking-[0.1em] font-special max-w-lg mx-auto italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
        >
          "I am the whisper in the static. The one who watched you walk through the door. Kowe ora dewekan... you are not alone."
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
