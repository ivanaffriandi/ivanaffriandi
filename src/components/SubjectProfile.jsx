import { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import useSound from '../hooks/useSound';

const HALLUCINATIONS = ["ꦆꦥ꦳ꦤ꧀", "ꦒꦼꦠꦶꦃ", "ꦱꦸꦮꦸꦁ", "I SEE YOU", "ꦌꦭꦶꦁ", "M1N3", "ꦱꦏ꧀ꦱꦶ"];

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
    }, 60);

    // Chaotic Glitch: Moving from Grayscale to Violent Color
    controls.start({
      x: [0, -40, 40, -20, 20, -50, 0],
      y: [0, 20, -20, 15, -15, 30, 0],
      skewX: [0, 20, -20, 10, -10, 0],
      scale: [1, 1.3, 0.8, 1.4, 0.9, 1.2, 1],
      filter: [
        "grayscale(1) brightness(0.7)",
        "grayscale(0) saturate(5) contrast(3) invert(1) hue-rotate(90deg)",
        "grayscale(0) saturate(10) contrast(5) brightness(1.5)",
        "grayscale(0) saturate(3) invert(1) sepia(1)",
        "grayscale(1) brightness(0.7)"
      ],
      transition: { duration: 0.8, times: [0, 0.2, 0.4, 0.7, 1], ease: "easeInOut" }
    });

    ghostControls.start({
      opacity: [0, 1, 0.3, 1, 0],
      x: [0, 60, -60, 0],
      scale: [1, 1.5, 0.5, 1],
      transition: { duration: 0.8 }
    });

    setTimeout(() => {
      clearInterval(msgInterval);
      setCurrentMessage("");
      setIsRevealing(false);
    }, 800);
  };

  return (
    <motion.section 
      className="min-h-screen pt-32 pb-48 px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center justify-center overflow-hidden"
    >
      <div className="w-full flex flex-col items-center text-center gap-0">
        
        {/* VESSEL PHOTO - TRUE B&W */}
        <div 
          onClick={triggerNightmare}
          className="w-full max-w-[280px] md:max-w-[340px] aspect-square bg-black border border-void-white/20 relative overflow-hidden cursor-crosshair group active:scale-[0.95] transition-transform"
        >
           <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isRevealing ? 'opacity-100' : 'opacity-0'}`}>
             <img src="/subject.jpg" alt="Vessel" className="w-full h-full object-cover grayscale-0 saturate-100" />
           </div>
           
           <motion.div animate={ghostControls} className="absolute inset-0 z-10 pointer-events-none mix-blend-difference">
              <img src="/subject.jpg" alt="Ghost" className="w-full h-full object-cover invert brightness-150 opacity-40 translate-x-4" />
           </motion.div>

           <motion.div animate={controls} className={`absolute inset-0 z-20 ${isRevealing ? 'opacity-80' : 'opacity-100'}`}>
              <img 
                src="/subject.jpg" 
                alt="Record" 
                className="w-full h-full object-cover grayscale brightness-[0.7] contrast-[1.2]"
              />
           </motion.div>

           <AnimatePresence>
             {isRevealing && currentMessage && (
               <motion.div 
                 key={currentMessage}
                 initial={{ opacity: 0, scale: 0.5 }}
                 animate={{ opacity: 1, scale: 1.5 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
               >
                  <span className="font-horror text-void-blood text-6xl md:text-9xl drop-shadow-[0_0_30px_rgba(255,0,0,1)] tracking-tighter shiver-micro">
                    {currentMessage}
                  </span>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
        
        {/* Centered Identity - Reduced Gap */}
        <div className="flex flex-col gap-4 items-center max-w-lg mt-6">
          <div className="flex flex-col gap-2 items-center">
            <h2 className="text-7xl md:text-9xl font-horror text-void-white/90 uppercase tracking-widest shiver-micro chromatic-text text-center leading-none">
              IVAN
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <span className="font-special text-[12px] md:text-sm text-void-blood/80 tracking-[0.4em] italic font-bold">you look so fragile tonight.</span>
              <span className="font-aksara text-3xl text-void-blood/30 aksara-glow">ꦱꦸꦏ꧀ꦩ</span>
            </div>
          </div>
          
          <p className="font-special text-[13px] md:text-[14px] leading-[1.8] text-gray-500 mt-2 text-center max-w-xs md:max-w-md">
            "i love how your pulse spikes when it goes dark. don't look away from the screen. i'm right here with you. if you leave... things might break."
          </p>
        </div>

      </div>
    </motion.section>
  );
}
