import { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import useSound from '../hooks/useSound';

const HALLUCINATIONS = ["ꦆꦥ꦳ꦤ꧀", "ꦒꦼꦠꦶꦃ", "ꦱꦸꦮꦸꦁ", "I SEE YOU", "ꦌꦭꦶꦁ", "STAY", "ꦱꦏ꧀ꦱꦶ"];

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
    }, 85);

    controls.start({
      x: [0, 10, -10, 5, -5, 10, 0],
      scale: [1, 1.05, 0.98, 1.1, 1],
      filter: [
        "invert(0) contrast(100%)",
        "invert(1) contrast(300%) hue-rotate(90deg)",
        "invert(0) contrast(150%) brightness(0.5)",
        "invert(1) contrast(500%) sepia(1)",
        "invert(0) contrast(100%)"
      ],
      transition: { duration: 1, times: [0, 0.1, 0.3, 0.6, 1], ease: "anticipate" }
    });

    ghostControls.start({
      opacity: [0, 0.8, 0.2, 0.6, 0.9, 0],
      x: [0, -20, 20, 0],
      scale: [1, 1.1, 1.2, 1],
      transition: { duration: 1 }
    });

    setTimeout(() => {
      clearInterval(msgInterval);
      setCurrentMessage("");
      setIsRevealing(false);
    }, 1000);
  };

  return (
    <motion.section 
      className="min-h-screen pt-40 pb-64 px-6 md:px-12 max-w-6xl mx-auto flex flex-col items-center"
    >
      <div className="w-full flex flex-col md:flex-row gap-20 md:gap-32 items-center md:items-start text-center md:text-left">
        
        {/* VESSEL PHOTO - Minimalist Box */}
        <div 
          onClick={triggerNightmare}
          className="w-full max-w-[280px] md:max-w-sm aspect-square bg-black border border-void-white/5 relative overflow-hidden cursor-crosshair group active:scale-[0.98] transition-all"
        >
           <div className={`absolute inset-0 w-full h-full transition-opacity duration-150 ${isRevealing ? 'opacity-100' : 'opacity-0'}`}>
             <img src="/subject.jpg" alt="Vessel" className="w-full h-full object-cover grayscale-[20%]" />
           </div>
           
           <motion.div animate={ghostControls} className="absolute inset-0 z-10 pointer-events-none mix-blend-difference">
              <img src="/subject.jpg" alt="Ghost" className="w-full h-full object-cover invert brightness-150 opacity-40 translate-x-4" />
           </motion.div>

           <motion.div animate={controls} className={`absolute inset-0 z-20 ${isRevealing ? 'opacity-70' : 'opacity-100'}`}>
              <img 
                src="/subject.jpg" 
                alt="Record" 
                className="w-full h-full object-cover grayscale-[100%] contrast-[180%] brightness-[0.3] filter url(#abstract-distortion)"
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
                  <span className="font-horror text-void-blood text-4xl md:text-7xl drop-shadow-[0_0_15px_rgba(255,0,0,1)] tracking-widest bg-black/50 px-6 shiver-micro">
                    {currentMessage}
                  </span>
               </motion.div>
             )}
           </AnimatePresence>

           <div className="absolute top-4 left-4 bg-void-blood text-black font-aksara text-sm px-2 py-1 z-50 font-bold uppercase tracking-[0.2em] shadow-[0_0_10px_rgba(255,0,0,0.8)]">
             {isRevealing ? 'ꦱꦸꦏ꧀ꦩꦩꦼꦭꦼꦏ꧀' : 'ꦱꦼꦤ꧀ꦠꦸꦃꦄꦏꦸ'}
           </div>
        </div>
        
        <div className="flex flex-col gap-10 md:gap-16 items-center md:items-start max-w-lg">
          <div className="flex flex-col gap-2">
            <h2 className="text-5xl md:text-7xl font-horror text-void-white uppercase tracking-widest shiver-micro chromatic-text">SAJEN</h2>
            <div className="flex items-center gap-4">
              <span className="micro-label text-void-blood">OFFERING_TYPE: SOUL</span>
              <span className="font-aksara text-2xl text-void-blood/30 aksara-glow">ꦱꦸꦏ꧀ꦩ</span>
            </div>
          </div>
          
          <p className="font-special text-[12px] md:text-[14px] leading-loose text-gray-500 italic border-l border-void-white/10 pl-6">
            "You keep looking for a person. But there is no Ivan here. Only the echo of your shadow. ꦌꦭꦶꦁ... stay and watch the static."
          </p>

          <div className="flex flex-col gap-4 w-full">
            <p className="micro-label opacity-40 text-left">REMNANTS:</p>
             <div className="flex flex-col gap-2 font-mono text-[10px] md:text-[12px] text-gray-700 tracking-widest shiver-micro">
                <span className="hover:text-void-blood transition-colors ring-1 ring-void-white/5 p-2 bg-white/[0.01]">ꦆꦱꦶꦃꦈꦫꦶꦥ꧀ // STILL BREATHING</span>
                <span className="hover:text-void-blood transition-colors ring-1 ring-void-white/5 p-2 bg-white/[0.01]">ꦒꦼꦠꦶꦃ // THE STATIC IS BLEEDING</span>
                <span className="hover:text-void-blood transition-colors ring-1 ring-void-white/5 p-2 bg-white/[0.01]">ꦱꦸꦮꦸꦁ // WELCOME HOME</span>
             </div>
          </div>
        </div>

      </div>

      <div className="mt-32 md:mt-48 flex items-center gap-8 opacity-10">
         <div className="flex-1 h-[1px] bg-void-white/10"></div>
         <span className="font-aksara text-xl text-gray-700 aksara-glow">ꦱꦩ꧀ꦥꦸꦤ꧀ꦫꦩ꧀ꦥꦸꦁ?</span>
         <div className="flex-1 h-[1px] bg-void-white/10"></div>
      </div>

    </motion.section>
  );
}
