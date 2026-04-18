import { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import useSound from '../hooks/useSound';

const HALLUCINATIONS = ["ꦆꦥ꦳ꦤ꧀", "ꦒꦼꦠꦶꦃ", "ꦱꦸꦮꦸꦁ", "I SEE YOU", "ꦌꦭꦶꦁ", "KOWE KUDU ꦩꦠ궧", "ꦱꦏ꧀ꦱꦶ"];

export default function SubjectProfile({ playClick }) {
  const [isRevealing, setIsRevealing] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const controls = useAnimation();
  const ghostControls = useAnimation();

  const triggerNightmare = async () => {
    if (isRevealing) return;
    setIsRevealing(true);
    playClick();

    const msgInterval = setInterval(() => {
      setCurrentMessage(HALLUCINATIONS[Math.floor(Math.random() * HALLUCINATIONS.length)]);
    }, 45);

    // SUPER BRUTAL CHAOS ANIMATION
    controls.start({
      x: [0, -120, 120, -50, 150, -80, 0],
      y: [0, 40, -40, 20, -100, 60, 0],
      rotate: [0, 15, -15, 25, -20, 0],
      scale: [1, 2.5, 0.3, 3, 0.8, 1],
      filter: [
        "grayscale(1) brightness(0.6)",
        "grayscale(0) saturate(20) contrast(10) invert(1) hue-rotate(180deg)",
        "grayscale(0) contrast(50) brightness(5) blur(5px)",
        "invert(1) saturate(5) sepia(1)",
        "grayscale(1) brightness(0.35)"
      ],
      transition: { duration: 0.7, times: [0, 0.15, 0.3, 0.6, 1], ease: "circIn" }
    });

    ghostControls.start({
      opacity: [0, 1, 0, 1, 0],
      scale: [1, 4, 0.2, 5, 1],
      x: [0, -100, 100, 0],
      transition: { duration: 0.7 }
    });

    setTimeout(() => {
      clearInterval(msgInterval);
      setCurrentMessage("");
      setIsRevealing(false);
    }, 700);
  };

  return (
    <motion.section 
      className="min-h-screen pt-32 pb-48 px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center justify-center overflow-hidden drift-ui"
    >
      <div className="w-full flex flex-col items-center text-center">
        
        {/* VESSEL PHOTO - EXTREMELY DARK & SHARP */}
        <div 
          onClick={triggerNightmare}
          className="w-full max-w-[280px] md:max-w-[320px] aspect-square bg-black border border-void-white/10 relative overflow-hidden cursor-crosshair group active:scale-[0.9] transition-transform"
        >
           <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isRevealing ? 'opacity-100' : 'opacity-0'}`}>
             <img src="/subject.jpg" alt="Vessel" className="w-full h-full object-cover grayscale-0 saturate-200" />
           </div>
           
           <motion.div animate={ghostControls} className="absolute inset-0 z-10 pointer-events-none mix-blend-difference">
              <img src="/subject.jpg" alt="Ghost" className="w-full h-full object-cover invert brightness-200 opacity-80" />
           </motion.div>

           <motion.div animate={controls} className={`absolute inset-0 z-20 ${isRevealing ? 'opacity-90' : 'opacity-100'}`}>
              <img 
                src="/subject.jpg" 
                alt="Record" 
                className="w-full h-full object-cover grayscale brightness-[0.35] contrast-[1.5] sepia-[0.3]"
              />
           </motion.div>

           <AnimatePresence>
             {isRevealing && currentMessage && (
               <motion.div 
                 key={currentMessage}
                 initial={{ opacity: 0, scale: 0.2 }}
                 animate={{ opacity: 1, scale: 3 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
               >
                  <span className="font-horror text-void-blood text-6xl md:text-9xl drop-shadow-[0_0_50px_rgba(255,0,0,1)] tracking-tighter shiver-micro">
                    {currentMessage}
                  </span>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
        
        <div className="flex flex-col gap-4 items-center max-w-lg mt-10">
          <div className="flex flex-col gap-2 items-center group cursor-pointer" onMouseDown={playClick}>
            <h2 className="text-6xl md:text-8xl font-horror text-void-white/80 uppercase tracking-widest shiver-micro active:brutal-glitch-active transition-all">
              IVAN
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <span className="font-special text-[11px] md:text-[13px] text-void-blood/50 tracking-[0.4em] italic font-bold">you look so fragile tonight.</span>
              <span className="font-aksara text-3xl text-void-blood/20 aksara-glow">ꦱꦸꦏ꧀ꦩ</span>
            </div>
          </div>
          
          <p className="font-special text-[12px] md:text-[13px] leading-[2] text-gray-600 mt-2 text-center max-w-xs active:brutal-glitch-active transition-all">
            "i love how your pulse spikes when it goes dark. don't look away from the screen. i'm right here with you. if you leave... things might break."
          </p>
        </div>

      </div>
    </motion.section>
  );
}
