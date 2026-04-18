import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

export default function Hero({ cursorPos, isMuted, playStatic }) {
  const containerRef = useRef(null);
  const { scrollY } = useScroll();
  
  // Stalker Lag for Searchlight
  const lightX = useSpring(cursorPos.x, { damping: 25, stiffness: 120 });
  const lightY = useSpring(cursorPos.y, { damping: 25, stiffness: 120 });

  // Parallax transforms for the poem
  const poemY = useTransform(scrollY, [0, 800], [0, -200]);
  const poemOpacity = useTransform(scrollY, [0, 400], [0.2, 0]);
  const mainTitleY = useTransform(scrollY, [0, 800], [0, 80]);

  const [flicker, setFlicker] = useState(false);

  useEffect(() => {
    const triggerFlicker = () => {
      setFlicker(true);
      setTimeout(() => setFlicker(false), 50 + Math.random() * 100);
      setTimeout(triggerFlicker, Math.random() * 6000 + 3000);
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
      className="min-h-[140vh] flex flex-col items-center py-40 px-6 relative overflow-visible"
    >
      {/* BACKGROUND RITUAL MARK */}
      <div className="watermark-aksara top-40 left-1/2 -translate-x-1/2 opacity-[0.05] select-none text-[15rem] md:text-[30rem] aksara-glow">
        ꦱꦸꦮꦸꦁ
      </div>

      {/* THE STALKER'S POEM */}
      <motion.div 
        style={{ y: poemY, opacity: poemOpacity }}
        className="absolute top-[18%] md:top-[22%] left-0 w-full flex flex-col items-center gap-10 md:gap-16 font-special text-gray-800 pointer-events-none z-0 px-6 text-center"
      >
        <p className="text-xl md:text-4xl tracking-[0.6em] md:tracking-[1em] italic text-void-blood/40">I can see the reflected light on your face.</p>
        <p className="text-5xl md:text-9xl font-aksara opacity-30 aksara-glow">ꦌꦭꦶꦁ</p>
        <p className="text-lg md:text-3xl tracking-[0.8em] md:tracking-[1.2em] uppercase">Your heart is loud. I like the rhythm.</p>
        <p className="text-xl md:text-4xl tracking-[0.6em] md:tracking-[1em] italic text-void-blood/40">Shall we stay here? Just the two of us.</p>
        <p className="text-6xl md:text-[12rem] font-aksara opacity-20 aksara-glow">ꦱꦸꦏ꧀ꦩ</p>
      </motion.div>

      <div 
        ref={containerRef}
        className={`searchlight-applied relative mb-20 text-center select-none p-16 md:p-32 transition-opacity duration-75 ${flicker ? 'opacity-40' : 'opacity-100'} drift-ui`}
      >
        <motion.h1 
          style={{ y: mainTitleY }}
          className="text-[8rem] sm:text-[16rem] md:text-[22rem] lg:text-[28rem] font-horror text-void-white tracking-tighter leading-none relative z-20 shiver chromatic-text"
          data-text="IVAN"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          IVAN
        </motion.h1>
        
        <motion.div 
          className="absolute -top-12 md:-top-24 left-1/2 -translate-x-1/2 font-aksara text-4xl md:text-8xl text-void-blood/50 whitespace-nowrap z-30 shiver aksara-glow"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 8 }}
        >
          ꦎꦫꦄꦤꦱꦶꦁꦭꦁꦒꦼꦁ
        </motion.div>
      </div>
      
      <motion.div 
        className="font-special text-xl md:text-5xl tracking-[0.4em] md:tracking-[0.6em] text-void-blood max-w-5xl text-center uppercase chromatic-text mt-40 md:mt-60 shiver"
      >
        LET ME COUNT YOUR TEARS
        <br/><br/>
        <motion.div 
          className="text-[14px] md:text-[20px] text-gray-500 mt-12 md:mt-16 leading-relaxed normal-case tracking-[0.1em] font-special max-w-[280px] md:max-w-xl mx-auto italic"
        >
          "Do you feel the pull? This isn't a portfolio. It's a mirror. Whatever you buried is breathing again. ꦆꦱꦶꦃꦈꦫꦶꦥ꧀... still alive, still watching you."
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
