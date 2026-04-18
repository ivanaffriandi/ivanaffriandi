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

    controls.start({
      x: [0, 15, -15, 10, -10, 20, 0],
      scale: [1, 1.1, 0.95, 1.15, 1],
      filter: [
        "saturate(0.1) contrast(1.5) brightness(0.4)",
        "invert(1) contrast(300%) hue-rotate(90deg)",
        "invert(0) contrast(200%) brightness(0.2) saturate(10)",
        "invert(1) contrast(400%) sepia(1) hue-rotate(-90deg)",
        "saturate(0.1) contrast(1.5) brightness(0.4)"
      ],
      transition: { duration: 1.2, times: [0, 0.1, 0.3, 0.6, 1], ease: "anticipate" }
    });

    ghostControls.start({
      opacity: [0, 0.9, 0.2, 0.8, 1, 0],
      x: [0, -30, 30, 0],
      scale: [1, 1.15, 1.25, 1],
      transition: { duration: 1.2 }
    });

    setTimeout(() => {
      clearInterval(msgInterval);
      setCurrentMessage("");
      setIsRevealing(false);
    }, 1200);
  };

  return (
    <motion.section 
      className="min-h-screen pt-40 pb-48 px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center"
    >
      <div className="w-full flex flex-col items-center text-center">
        
        {/* VESSEL PHOTO - Darker, highly desaturated */}
        <div 
          onClick={triggerNightmare}
          className="w-full max-w-[280px] md:max-w-[320px] aspect-square bg-[#0a0a0a] border border-void-white/10 relative overflow-hidden cursor-crosshair group active:scale-[0.98] transition-all"
        >
           <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isRevealing ? 'opacity-100' : 'opacity-0'}`}>
             <img src="/subject.jpg" alt="Vessel" className="w-full h-full object-cover saturate-10 contrast-[1.3] brightness-[0.4]" />
           </div>
           
           <motion.div animate={ghostControls} className="absolute inset-0 z-10 pointer-events-none mix-blend-difference">
              <img src="/subject.jpg" alt="Ghost" className="w-full h-full object-cover invert brightness-150 opacity-50 translate-x-4" />
           </motion.div>

           <motion.div animate={controls} className={`absolute inset-0 z-20 ${isRevealing ? 'opacity-70 blur-[1px]' : 'opacity-100'}`}>
              <img 
                src="/subject.jpg" 
                alt="Record" 
                className="w-full h-full object-cover saturate-10 contrast-[1.5] brightness-[0.4] filter url(#abstract-distortion)"
              />
           </motion.div>

           <AnimatePresence>
             {isRevealing && currentMessage && (
               <motion.div 
                 key={currentMessage}
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1.2 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
               >
                  <span className="font-horror text-void-blood text-5xl md:text-8xl drop-shadow-[0_0_20px_rgba(255,0,0,1)] tracking-widest bg-black/50 px-6 shiver-micro">
                    {currentMessage}
                  </span>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
        
        <div className="flex flex-col gap-6 md:gap-8 items-center max-w-lg mt-8">
          <div className="flex flex-col gap-3 items-center">
            <h2 className="text-6xl md:text-8xl font-horror text-void-white/90 uppercase tracking-widest shiver-micro chromatic-text text-center">
              IVAN
            </h2>
            <div className="flex flex-col md:flex-row items-center gap-3">
              <span className="font-special text-sm md:text-base text-void-blood/80 tracking-widest italic font-bold">you look so fragile tonight.</span>
              <span className="font-aksara text-3xl text-void-blood/40 aksara-glow">ꦱꦸꦏ꧀ꦩ</span>
            </div>
          </div>
          
          <p className="font-special text-[13px] md:text-[15px] leading-[2] text-gray-400 mt-2 text-center max-w-sm">
            "i love how your pulse spikes when it goes dark. don't look away from the screen. i'm right here with you. if you leave... things might break."
          </p>
        </div>

      </div>
    </motion.section>
  );
}
