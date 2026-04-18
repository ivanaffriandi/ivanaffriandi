import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function Hero({ cursorPos, isMuted, playStatic }) {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  
  // High-Lag Stalker Light
  const lightX = useSpring(cursorPos.x, { damping: 40, stiffness: 80 });
  const lightY = useSpring(cursorPos.y, { damping: 40, stiffness: 80 });

  // Minimalist Parallax transforms
  const poemY = useTransform(scrollY, [0, 800], [0, -100]);
  const mainTitleX = useTransform(scrollY, [0, 800], [0, 40]); // Subtle lateral drift

  const [flicker, setFlicker] = useState(false);

  useEffect(() => {
    const triggerFlicker = () => {
      setFlicker(true);
      setTimeout(() => setFlicker(false), 60);
      setTimeout(triggerFlicker, Math.random() * 8000 + 4000);
    };
    const timer = setTimeout(triggerFlicker, 5000);
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
      className="min-h-[120vh] w-full flex flex-col items-center pt-48 md:pt-64 px-6 relative overflow-visible"
    >
      {/* ASYMMETRIC WATERMARK */}
      <div className="watermark-aksara top-[20%] right-[-5%] opacity-[0.015] select-none text-[10rem] md:text-[20rem] aksara-glow rotate-[-15deg]">
        ꦱꦸꦮꦸꦁ
      </div>

      {/* HAUNTED POEM - Asymmetric Floating */}
      <motion.div 
        style={{ y: poemY }}
        className="absolute top-[30%] md:top-[35%] left-1/2 -translate-x-[45%] w-full max-w-sm md:max-w-xl flex flex-col items-start gap-8 md:gap-12 pointer-events-none z-0"
      >
        <p className="micro-label text-void-blood/40 italic">I can see the reflected light on your face.</p>
        <p className="font-aksara text-6xl md:text-9xl opacity-10 aksara-glow -translate-x-8">ꦌꦭꦶꦁ</p>
        <p className="micro-label tracking-[1em] text-gray-800">Your heart is loud. I like the rhythm.</p>
      </motion.div>

      <div 
        ref={containerRef}
        className={`searchlight-applied relative mb-24 md:mb-32 select-none p-12 md:p-24 transition-opacity duration-75 ${flicker ? 'opacity-30' : 'opacity-100'} -translate-x-4 md:-translate-x-8`}
      >
        <motion.h1 
          style={{ x: mainTitleX }}
          className="text-7xl md:text-[12rem] font-horror text-void-white tracking-widest leading-none relative z-20 shiver-micro chromatic-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3 }}
        >
          IVAN
        </motion.h1>
        
        <motion.div 
          className="absolute -top-4 md:-top-10 left-4 md:left-8 font-aksara text-2xl md:text-5xl text-void-blood/20 whitespace-nowrap z-30 shiver-micro aksara-glow"
        >
          ꦎꦫꦄꦤꦱꦶꦁꦭꦁꦒꦼꦁ
        </motion.div>
      </div>
      
      <motion.div 
        className="flex flex-col items-start w-full max-w-xs md:max-w-md gap-6 md:gap-10 mt-32 md:mt-48 self-center md:self-end md:mr-32"
      >
        <p className="micro-label text-void-blood/60 shiver-micro tracking-[0.8em]">MARROW ECHO</p>
        <p className="font-special text-[12px] md:text-[14px] text-gray-600 leading-relaxed italic border-l border-void-white/10 pl-6">
          "The static isn't code. It's what you buried. Still breathing. Still watching you."
        </p>
        <div className="font-aksara text-3xl md:text-5xl text-gray-800/10 select-none">ꦆꦱꦶꦃꦈꦫꦶꦥ꧀</div>
      </motion.div>
    </motion.section>
  );
}
