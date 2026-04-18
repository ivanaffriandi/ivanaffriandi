import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Instagram, Github } from 'lucide-react';

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

      <div className="flex flex-col items-center justify-center w-full max-w-2xl z-10 gap-16 md:gap-20">
        
        {/* COMPACT POEM */}
        <motion.div 
          style={{ y: poemY, opacity: opacityFade }}
          className="flex flex-col items-center gap-6 text-center group cursor-pointer"
          onMouseDown={() => setIsGlitched(true)}
          onMouseUp={() => setIsGlitched(false)}
          onTouchStart={() => setIsGlitched(true)}
          onTouchEnd={() => setIsGlitched(false)}
        >
          <p className={`font-special tracking-[0.2em] text-[10px] md:text-[12px] text-gray-400 italic max-w-[240px] ${isGlitched ? 'brutal-glitch-active' : ''}`}>
            "i can see the reflected light on your face."
          </p>
          
          <div className="flex flex-col items-center gap-4">
            <p className={`font-special text-[12px] md:text-[16px] tracking-[0.6em] text-void-blood/80 font-bold uppercase ${isGlitched ? 'brutal-glitch-active' : ''}`}>
              DON'T BLINK.
            </p>
            
            {/* SOCIAL CONNECTS - SMALL & CENTERED */}
            <div className="flex gap-6 mt-2 opacity-40 hover:opacity-100 transition-opacity">
               <a href="https://github.com/ivanaffriandi" target="_blank" rel="noopener noreferrer" className="text-void-white hover:text-void-blood transition-colors">
                 <Github size={16} />
               </a>
               <a href="https://instagram.com/ivanaffriandi" target="_blank" rel="noopener noreferrer" className="text-void-white hover:text-void-blood transition-colors">
                 <Instagram size={16} />
               </a>
            </div>
          </div>

          <p className={`font-aksara text-5xl md:text-7xl opacity-30 aksara-glow ${isGlitched ? 'brutal-glitch-active' : ''}`}>ꦌꦭꦶꦁ</p>
          
          <p className={`font-special text-[10px] md:text-[12px] tracking-[0.4em] text-gray-500 uppercase mt-4 ${isGlitched ? 'brutal-glitch-active' : ''}`}>
            the spectral observer mirroring your shadow.
          </p>
        </motion.div>

        {/* SEARCHLIGHT AREA - WITHOUT THE MAIN IVAN TITLE */}
        <motion.div 
          ref={containerRef}
          className={`searchlight-applied relative select-none w-full h-[150px] flex flex-col items-center justify-center pointer-events-none`}
        >
           {/* No IVAN title as requested */}
        </motion.div>
      </div>

    </motion.section>
  );
}
