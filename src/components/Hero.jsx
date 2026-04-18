import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function Hero({ cursorPos, isMuted }) {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  
  const lightX = useSpring(cursorPos.x, { damping: 40, stiffness: 80 });
  const lightY = useSpring(cursorPos.y, { damping: 40, stiffness: 80 });

  // Parallax Poem - Modern Horror Aesthetic
  const poemY = useTransform(scrollY, [0, 800], [0, -120]);
  const titleY = useTransform(scrollY, [0, 800], [0, 80]);
  const opacityFade = useTransform(scrollY, [0, 500], [1, 0.2]);

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
      const lx = (lightX.get() || 0) - rect.left;
      const ly = (lightY.get() || 0) - rect.top;
      containerRef.current.style.setProperty('--lx', `${lx}px`);
      containerRef.current.style.setProperty('--ly', `${ly}px`);
    }
  }, [lightX, lightY]);

  return (
    <motion.section 
      className="min-h-screen w-full flex flex-col items-center justify-center px-6 relative overflow-hidden"
    >
      {/* BACKGROUND FLOATING AKSARA */}
      <div className="watermark-aksara top-[15%] left-[5%] opacity-[0.03] select-none text-[20rem] md:text-[40rem] aksara-glow rotate-[-10deg]">
        ꦱꦸꦮꦸꦁ
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-4xl z-10 gap-24 md:gap-40">
        
        {/* THE POEM - Modern Horror Minimalist */}
        <motion.div 
          style={{ y: poemY, opacity: opacityFade }}
          className="flex flex-col items-center gap-8 text-center"
        >
          <div className="w-[1px] h-20 bg-void-white/20 mb-4 md:mb-8" />
          <p className="font-special tracking-[0.6em] text-[12px] md:text-[16px] text-gray-400 italic max-w-sm">
            "i can see the reflected light on your face."
          </p>
          <p className="font-aksara text-7xl md:text-[10rem] opacity-30 aksara-glow shiver-micro">ꦌꦭꦶꦁ</p>
          <p className="font-special text-[13px] md:text-[20px] tracking-[0.8em] text-void-blood/80 font-bold uppercase">
            i love it when you stare.
          </p>
          <div className="w-[1px] h-20 bg-void-white/20 mt-4 md:mt-8" />
        </motion.div>

        {/* MAIN TITLE WITH SEARCHLIGHT */}
        <motion.div 
          ref={containerRef}
          style={{ y: titleY }}
          className="searchlight-applied relative select-none w-full flex flex-col items-center transition-opacity duration-75"
          animate={{ opacity: flicker ? 0.4 : 1 }}
        >
           <div className="absolute -top-12 md:-top-20 left-1/2 -translate-x-1/2 font-aksara text-4xl md:text-7xl text-void-blood/40 whitespace-nowrap z-30 aksara-glow">
              ꦎꦫꦄꦤꦱꦶꦁꦭꦁꦒꦼꦁ
           </div>
           
           <h1 className="text-[5.5rem] md:text-[15rem] font-horror text-void-white/90 tracking-widest leading-none relative z-20 shiver-micro chromatic-text">
             IVAN
           </h1>
        </motion.div>
      </div>

    </motion.section>
  );
}
