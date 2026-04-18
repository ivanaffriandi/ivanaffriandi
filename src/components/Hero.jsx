import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function Hero({ cursorPos, isMuted, playStatic }) {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  
  // High-Lag Stalker Light
  const lightX = useSpring(cursorPos.x, { damping: 40, stiffness: 80 });
  const lightY = useSpring(cursorPos.y, { damping: 40, stiffness: 80 });

  // Minimalist Parallax transforms
  const poemY = useTransform(scrollY, [0, 800], [0, -80]);
  const mainTitleX = useTransform(scrollY, [0, 800], [0, 30]);

  const [flicker, setFlicker] = useState(false);

  useEffect(() => {
    const triggerFlicker = () => {
      setFlicker(true);
      setTimeout(() => setFlicker(false), 50);
      setTimeout(triggerFlicker, Math.random() * 8000 + 4000);
    };
    const timer = setTimeout(triggerFlicker, 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const lx = lightX.get() - rect.left;
      const ly = lightY.get() - rect.top;
      containerRef.current.style.setProperty('--lx', `${lx}px`);
      containerRef.current.style.setProperty('--ly', `${ly}px`);
    }
  }, [lightX, lightY]);

  return (
    <motion.section 
      className="min-h-[110vh] w-full flex flex-col items-center pt-32 md:pt-48 px-6 relative overflow-visible drift-ui"
    >
      {/* ASYMMETRIC WATERMARK */}
      <div className="watermark-aksara top-[10%] opacity-[0.02] select-none text-[15rem] md:text-[30rem] aksara-glow rotate-[5deg] md:rotate-[15deg]">
        ꦱꦸꦮꦸꦁ
      </div>

      {/* HAUNTED POEM - Cleaned Minimalist typography */}
      <motion.div 
        style={{ y: poemY }}
        className="absolute top-[28%] md:top-[30%] left-1/2 -translate-x-1/2 md:-translate-x-[45%] w-full flex flex-col items-center gap-6 pointer-events-none z-0"
      >
        <p className="font-special tracking-widest text-[11px] md:text-[14px] text-gray-500 italic max-w-xs text-center border-b border-void-white/10 pb-4">
          "i can see the reflected light on your face."
        </p>
        <p className="font-aksara text-6xl md:text-8xl opacity-40 aksara-glow">ꦌꦭꦶꦁ</p>
        <p className="font-special text-[12px] md:text-[16px] tracking-[0.4em] md:tracking-[0.6em] text-void-blood/80 font-bold uppercase mt-2">
          i love it when you stare.
        </p>
      </motion.div>

      {/* FIXED TITLE CONTAINER */}
      <div 
        ref={containerRef}
        className={`searchlight-applied relative mt-56 md:mt-48 mb-10 select-none px-4 py-20 md:p-24 transition-opacity duration-75 ${flicker ? 'opacity-30' : 'opacity-100'} w-full flex flex-col items-center`}
      >
        <motion.div 
          className="absolute top-2 md:-top-4 left-1/2 -translate-x-1/2 font-aksara text-3xl md:text-5xl text-void-blood/40 whitespace-nowrap z-30 shiver-micro aksara-glow"
        >
          ꦎꦫꦄꦤꦱꦶꦁꦭꦁꦒꦼꦁ
        </motion.div>

        <motion.h1 
          style={{ x: mainTitleX }}
          className="text-[6rem] md:text-[13rem] font-horror text-gray-200 tracking-widest leading-none relative z-20 shiver-micro chromatic-text text-center mt-8 md:mt-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          IVAN
        </motion.h1>
      </div>

    </motion.section>
  );
}
