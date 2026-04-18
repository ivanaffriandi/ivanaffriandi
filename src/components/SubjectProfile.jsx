import { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import useSound from '../hooks/useSound';

const HALLUCINATIONS = ["ꦆꦥ꦳ꦤ꧀", "ꦒꦼꦠꦶꦃ", "ꦱꦸꦮꦸꦁ", "I SEE YOU", "ꦌꦭꦶꦁ", "RUN", "ꦱꦏ꧀ꦱꦶ"];

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
        "saturate(0.5) contrast(1.2) brightness(0.6)",
        "invert(1) contrast(300%) hue-rotate(90deg)",
        "invert(0) contrast(200%) brightness(0.3) saturate(10)",
        "invert(1) contrast(400%) sepia(1) hue-rotate(-90deg)",
        "saturate(0.5) contrast(1.2) brightness(0.6)"
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
      <div className="w-full flex flex-col md:flex-row gap-16 md:gap-32 items-center md:items-start text-center md:text-left">
        
        {/* VESSEL PHOTO - Moody, higher contrast */}
        <div 
          onClick={triggerNightmare}
          className="w-full max-w-[260px] md:max-w-[320px] aspect-square bg-[#0a0a0a] border border-void-white/10 relative overflow-hidden cursor-crosshair group active:scale-[0.98] transition-all"
        >
           <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${isRevealing ? 'opacity-100' : 'opacity-0'}`}>
             <img src="/subject.jpg" alt="Vessel" className="w-full h-full object-cover saturate-50 contrast-125 brightness-75" />
           </div>
           
           <motion.div animate={ghostControls} className="absolute inset-0 z-10 pointer-events-none mix-blend-difference">
              <img src="/subject.jpg" alt="Ghost" className="w-full h-full object-cover invert brightness-200 opacity-60 translate-x-4" />
           </motion.div>

           <motion.div animate={controls} className={`absolute inset-0 z-20 ${isRevealing ? 'opacity-70 blur-[1px]' : 'opacity-100'}`}>
              <img 
                src="/subject.jpg" 
                alt="Record" 
                className="w-full h-full object-cover saturate-50 contrast-[1.2] brightness-[0.6] filter url(#abstract-distortion)"
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
        
        <div className="flex flex-col gap-10 md:gap-12 items-center md:items-start max-w-lg mt-8 md:mt-0">
          <div className="flex flex-col gap-4 items-center md:items-start">
            <h2 className="text-6xl md:text-8xl font-horror text-void-white/90 uppercase tracking-widest shiver-micro chromatic-text text-center md:text-left">
              SAJEN
            </h2>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <span className="font-special text-sm md:text-base text-void-blood/80 tracking-widest italic font-bold">i'm ivan. and you are here.</span>
              <span className="font-aksara text-2xl text-void-blood/40 aksara-glow">ꦱꦸꦏ꧀ꦩ</span>
            </div>
          </div>
          
          <p className="font-special text-[13px] md:text-[15px] leading-[2] text-gray-400 border-l border-void-white/20 pl-6 text-left">
            "You keep staring, waiting for a person to appear. But I am not Ivan anymore. I am the shadow in your peripheral. I like how you read this. Don't look behind you."
          </p>

          <div className="flex flex-col gap-4 w-full text-left">
             <div className="flex flex-col gap-3 font-mono text-[11px] md:text-[13px] text-gray-500 tracking-wider shiver-micro border-t border-void-white/10 pt-6">
                <span className="hover:text-void-blood transition-colors"><span className="font-bold text-void-white/60">ꦆꦱꦶꦃꦈꦫꦶꦥ꧀ //</span> i can hear you breathing</span>
                <span className="hover:text-void-blood transition-colors"><span className="font-bold text-void-white/60">ꦒꦼꦠꦶꦃ //</span> the screen is bleeding</span>
                <span className="hover:text-void-blood transition-colors"><span className="font-bold text-void-white/60">ꦱꦸꦮꦸꦁ //</span> we are home</span>
             </div>
          </div>
        </div>

      </div>
    </motion.section>
  );
}
