import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function Hero({ cursorPos, isMuted, playStatic }) {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  
  // Parallax transforms for the poem
  const poemY = useTransform(scrollY, [0, 1000], [0, -300]);
  const poemOpacity = useTransform(scrollY, [0, 500], [0.15, 0]);
  const mainTitleY = useTransform(scrollY, [0, 1000], [0, 100]);

  const [flicker, setFlicker] = useState(false);

  useEffect(() => {
    const triggerFlicker = () => {
      setFlicker(true);
      setTimeout(() => setFlicker(false), 50 + Math.random() * 100);
      setTimeout(triggerFlicker, Math.random() * 5000 + 2000);
    };
    const timer = setTimeout(triggerFlicker, 3000);
    return () => clearTimeout(timer);
  }, []);

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
      className="min-h-[150vh] flex flex-col items-center py-40 px-6 relative"
    >
      {/* BACKGROUND WATERMARK */}
      <div className="watermark-aksara top-40 left-1/2 -translate-x-1/2 opacity-5 select-none">
        ꦱꦸꦮꦸꦁ
      </div>

      {/* HAUNTED PARALLAX POEM */}
      <motion.div 
        style={{ y: poemY, opacity: poemOpacity }}
        className="absolute top-[20%] left-0 w-full flex flex-col items-center gap-12 font-special text-gray-700 pointer-events-none z-0"
      >
        <p className="text-xl md:text-3xl tracking-[0.8em] italic">Your shadow is longer than the day...</p>
        <p className="text-4xl md:text-7xl font-aksara opacity-40">ꦌꦭꦶꦁ</p>
        <p className="text-lg md:text-2xl tracking-[1em] uppercase">The bone remembers what the mind forgets.</p>
        <p className="text-xl md:text-3xl tracking-[0.8em] italic">Blood in the static. Static in the blood.</p>
        <p className="text-5xl md:text-9xl font-aksara opacity-20">ꦱꦸꦏ꧀ꦩ</p>
      </motion.div>

      <div 
        ref={containerRef}
        className={`searchlight-applied relative mb-20 text-center select-none p-24 transition-opacity duration-75 ${flicker ? 'opacity-40' : 'opacity-100'}`}
      >
        <motion.h1 
          style={{ y: mainTitleY }}
          className="text-[12rem] sm:text-[20rem] lg:text-[28rem] font-horror text-void-white tracking-tighter leading-none relative z-20 shiver chromatic-text"
          data-text="IVAN"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          IVAN
        </motion.h1>
        
        <motion.div 
          className="absolute -top-16 left-1/2 -translate-x-1/2 font-aksara text-4xl md:text-7xl text-void-blood/40 whitespace-nowrap z-30 shiver"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ repeat: Infinity, duration: 6 }}
        >
          ꦎꦫꦄꦤꦱꦶꦁꦭꦁꦒꦼꦁ
        </motion.div>
      </div>
      
      <motion.div 
        className="font-special text-2xl md:text-4xl tracking-[0.5em] text-void-blood max-w-4xl text-center uppercase chromatic-text mt-40"
      >
        I AM THE ECHO IN YOUR MARROW
        <br/><br/>
        <motion.div 
          className="text-[16px] md:text-[18px] text-gray-500 mt-12 leading-relaxed normal-case tracking-[0.1em] font-special max-w-md mx-auto italic"
        >
          "Do you feel the pull? The archive isn't made of code. It's made of the things you buried. ꦆꦱꦶꦃꦈꦫꦶꦥ꧀... still breathing, still waiting."
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
