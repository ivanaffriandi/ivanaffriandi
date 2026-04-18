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
      className="min-h-[120vh] w-full flex flex-col items-center pt-32 md:pt-48 px-6 relative overflow-visible drift-ui"
    >
      {/* ASYMMETRIC WATERMARK */}
      <div className="watermark-aksara top-[10%] right-[-10%] opacity-[0.03] select-none text-[12rem] md:text-[25rem] aksara-glow rotate-[15deg]">
        ꦱꦸꦮꦸꦁ
      </div>

      {/* HAUNTED POEM - Tighter Mobile Stacking */}
      <motion.div 
        style={{ y: poemY }}
        className="absolute top-[28%] md:top-[30%] left-1/2 -translate-x-1/2 md:-translate-x-[45%] w-full max-w-[300px] md:max-w-xl flex flex-col items-center md:items-start gap-6 md:gap-10 pointer-events-none z-0 text-center md:text-left"
      >
        <p className="font-special tracking-[0.4em] text-[10px] md:text-[14px] text-gray-400 italic">"i can see the reflected light on your face."</p>
        <p className="font-aksara text-5xl md:text-8xl opacity-30 aksara-glow">ꦌꦭꦶꦁ</p>
        <p className="font-special text-[12px] md:text-[18px] tracking-[0.6em] text-void-blood/80">YOUR HEART IS LOUD. I LIKE IT.</p>
      </motion.div>

      <div 
        ref={containerRef}
        className={`searchlight-applied relative mt-56 md:mt-40 mb-20 select-none px-4 py-16 md:p-24 transition-opacity duration-75 ${flicker ? 'opacity-30' : 'opacity-100'} w-full flex flex-col items-center`}
      >
        <motion.h1 
          style={{ x: mainTitleX }}
          className="text-7xl md:text-[13rem] font-horror text-gray-200 tracking-widest leading-none relative z-20 shiver-micro chromatic-text text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          IVAN
        </motion.h1>
        
        <motion.div 
          className="absolute -top-6 md:-top-12 left-1/2 -translate-x-1/2 font-aksara text-3xl md:text-6xl text-void-blood/40 whitespace-nowrap z-30 shiver-micro aksara-glow"
        >
          ꦎꦫꦄꦤꦱꦶꦁꦭꦁꦒꦼꦁ
        </motion.div>
      </div>
      
      <motion.div 
        className="flex flex-col items-center md:items-start w-full max-w-[300px] md:max-w-lg gap-8 mt-16 md:mt-32 self-center md:self-end md:mr-24 text-center md:text-left"
      >
        <p className="micro-label text-void-blood/80 shiver-micro tracking-[0.6em] md:tracking-[0.8em]">MARROW ECHO</p>
        <p className="font-special text-[13px] md:text-[15px] text-gray-400 leading-relaxed italic border-t md:border-t-0 md:border-l border-void-white/20 pt-4 md:pt-0 md:pl-6">
          "The static isn't a glitch. It's just me. I'm right here. ꦆꦱꦶꦃꦈꦫꦶꦥ꧀... keep scrolling. don't stop looking."
        </p>
      </motion.div>
    </motion.section>
  );
}
