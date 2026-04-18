import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function Hero({ cursorPos }) {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  const [isGlitched, setIsGlitched] = useState(false);
  
  const lightX = useSpring(cursorPos.x, { damping: 40, stiffness: 80 });
  const lightY = useSpring(cursorPos.y, { damping: 40, stiffness: 80 });

  const poemY = useTransform(scrollY, [0, 800], [0, -60]);
  const opacityFade = useTransform(scrollY, [0, 500], [1, 0.1]);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const lx = (lightX.get() || 0) - rect.left;
      const ly = (lightY.get() || 0) - rect.top;
      containerRef.current.style.setProperty('--lx', `${lx}px`);
      containerRef.current.style.setProperty('--ly', `${ly}px`);
    }
  }, [lightX, lightY]);

  return (
    <motion.section 
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 relative overflow-hidden drift-ui"
    >
      <div className="watermark-aksara top-[10%] opacity-[0.015] select-none text-[15rem] md:text-[30rem] aksara-glow rotate-[-5deg]">
        ꦱꦸꦮꦸꦁ
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-2xl z-10 gap-20">
        
        {/* COMPACT POEM */}
        <motion.div 
          style={{ y: poemY, opacity: opacityFade }}
          className="flex flex-col items-center gap-6 text-center group cursor-pointer"
          onMouseDown={() => setIsGlitched(true)}
          onMouseUp={() => setIsGlitched(false)}
          onTouchStart={() => setIsGlitched(true)}
          onTouchEnd={() => setIsGlitched(false)}
        >
          <p className={`font-special tracking-[0.2em] text-[10px] md:text-[12px] text-gray-500 italic max-w-[240px] ${isGlitched ? 'brutal-glitch-active' : ''}`}>
            "i can see the reflected light on your face."
          </p>
          <p className={`font-aksara text-5xl md:text-7xl opacity-30 aksara-glow ${isGlitched ? 'brutal-glitch-active' : ''}`}>ꦌꦭꦶꦁ</p>
          <p className={`font-special text-[11px] md:text-[14px] tracking-[0.4em] text-void-blood/60 font-bold uppercase ${isGlitched ? 'brutal-glitch-active' : ''}`}>
            don't blink.
          </p>
        </motion.div>

        {/* COMPACT TITLE */}
        <motion.div 
          ref={containerRef}
          className={`searchlight-applied relative select-none w-full flex flex-col items-center group cursor-pointer ${isGlitched ? 'brutal-glitch-active' : ''}`}
          onMouseDown={() => setIsGlitched(true)}
          onMouseUp={() => setIsGlitched(false)}
          onTouchStart={() => setIsGlitched(true)}
          onTouchEnd={() => setIsGlitched(false)}
        >
           <div className="absolute -top-8 md:-top-12 left-1/2 -translate-x-1/2 font-aksara text-2xl md:text-5xl text-void-blood/30 aksara-glow opacity-60">
              ꦎꦫꦄꦤꦱꦶꦁꦭꦁꦒꦼꦁ
           </div>
           
           <h1 className="text-[4rem] md:text-[10rem] font-horror text-void-white/80 tracking-widest leading-none relative z-20 shiver-micro">
             IVAN
           </h1>
        </motion.div>
      </div>

    </motion.section>
  );
}
