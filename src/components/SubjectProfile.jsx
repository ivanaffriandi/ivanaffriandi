import { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import useSound from '../hooks/useSound';

const HALLUCINATIONS = ["MISTAKE", "I SEE YOU", "NOT ME", "HELP", "WATCHING", "LIAR", "STILL HERE"];

export default function SubjectProfile({ playClick }) {
  const [isRevealing, setIsRevealing] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const controls = useAnimation();
  const ghostControls = useAnimation();

  const triggerNightmare = async () => {
    if (isRevealing) return;
    setIsRevealing(true);
    playClick();

    // Chaotic Hallucination Loop
    const msgInterval = setInterval(() => {
      setCurrentMessage(HALLUCINATIONS[Math.floor(Math.random() * HALLUCINATIONS.length)]);
    }, 80);

    // Violent Nightmare Sequence
    // Primary Photo Glitch
    controls.start({
      x: [0, 20, -20, 10, -10, 30, 0],
      y: [0, -10, 15, -20, 5, -5, 0],
      scale: [1, 1.1, 0.9, 1.3, 1.05, 1.2, 1],
      filter: [
        "invert(0) contrast(100%) brightness(1)",
        "invert(1) contrast(300%) brightness(1.5) hue-rotate(90deg)",
        "invert(0) contrast(150%) brightness(0.5)",
        "invert(1) contrast(500%) sepia(1) saturate(10)",
        "invert(0) contrast(100%) brightness(1)"
      ],
      transition: { duration: 1.2, times: [0, 0.1, 0.3, 0.6, 1], ease: "anticipate" }
    });

    // Ghosting Offset Glitch
    ghostControls.start({
      opacity: [0, 0.8, 0.2, 0.6, 0.9, 0],
      x: [0, -40, 40, -20, 10, 0],
      scale: [1, 1.2, 1.1, 1.4, 0.9, 1],
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
      className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto"
    >
      <div className="border border-void-white/10 bg-[#020202] p-8 md:p-12 relative overflow-hidden group">
        <h2 className="text-5xl md:text-8xl font-horror mb-12 text-void-white uppercase tracking-tighter">ME</h2>
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* NIGHTMARE REVELATION PHOTO */}
          <div 
            onClick={triggerNightmare}
            className="w-full lg:w-1/2 aspect-square bg-black border border-void-white/5 relative overflow-hidden cursor-crosshair group active:scale-[0.98] transition-all"
          >
             {/* Base Layer: Realistic (Revealed via opacity/glitch) */}
             <div className={`absolute inset-0 w-full h-full transition-opacity duration-150 ${isRevealing ? 'opacity-100' : 'opacity-0'}`}>
               <img 
                 src="/subject.jpg" 
                 alt="The Real Face" 
                 className="w-full h-full object-cover grayscale-[20%]"
               />
             </div>
             
             {/* Ghosting Layer (Difference Blend) */}
             <motion.div 
               animate={ghostControls}
               className="absolute inset-0 z-10 pointer-events-none mix-blend-difference"
             >
                <img 
                  src="/subject.jpg" 
                  alt="Ghost Output" 
                  className="w-full h-full object-cover invert brightness-150 opacity-40 translate-x-4"
                />
             </motion.div>

             {/* Primary Animation Layer */}
             <motion.div 
                animate={controls}
                className={`absolute inset-0 z-20 ${isRevealing ? 'opacity-70' : 'opacity-100'}`}
             >
                <img 
                  src="/subject.jpg" 
                  alt="Subject Record" 
                  className="w-full h-full object-cover grayscale-[100%] contrast-[180%] brightness-[0.35] filter url(#abstract-distortion)"
                />
             </motion.div>

             {/* Subconscious Text Overlay */}
             <AnimatePresence>
               {isRevealing && currentMessage && (
                 <motion.div 
                   key={currentMessage}
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1.2 }}
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                 >
                    <span className="font-horror text-void-blood text-4xl md:text-7xl drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] tracking-widest bg-black/40 px-4">
                      {currentMessage}
                    </span>
                 </motion.div>
               )}
             </AnimatePresence>

             {/* Strobe Scanlines */}
             {isRevealing && (
                <div className="absolute inset-0 z-40 bg-void-blood/5 mix-blend-overlay pointer-events-none overflow-hidden">
                  <div className="w-full h-full animate-strobe-fast bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(255,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,255,0.02),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%]"></div>
                </div>
             )}

             <div className="absolute top-4 left-4 bg-void-blood text-black font-syne text-[8px] px-2 py-0.5 z-50 font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(255,0,0,0.5)]">
               {isRevealing ? 'CRITICAL INSTABILITY' : 'REVEAL TRUTH'}
             </div>
          </div>
          
          <div className="w-full lg:w-1/2 flex flex-col gap-10 font-special">
            <div>
              <span className="text-void-blood font-syne text-[10px] uppercase tracking-[0.3em] font-bold">Signal Source</span>
              <h3 className="text-void-white text-3xl md:text-5xl font-horror mt-2 hover:text-void-blood transition-colors group-hover:animate-pulse">IVAN AFFRIANDI</h3>
            </div>
            
            <p className="text-gray-400 leading-relaxed text-sm md:text-base italic max-w-lg">
              "Every time you touch the frame, the facade breaks. You see the parts of me I tried to delete. The B&W is the safer lie. The color is the dangerous truth. Don't look too long... the signal won't hold."
            </p>

            <div className="border border-void-white/5 p-6 bg-white/[0.01] relative group overflow-hidden border-l-2 border-l-void-blood/20">
              <span className="text-[10px] text-void-blood/60 uppercase tracking-widest font-bold">Corruption Log</span>
              <p className="text-[12px] text-gray-700 mt-2 font-mono group-hover:text-void-blood transition-colors">
                // ERR_404: IDENTITY_NOT_FOUND<br/>
                // ALERT: PSYCH_STABILITY_ZERO<br/>
                // LOG: SUBJECT_IS_VOCAL
              </p>
            </div>

            <div className="mt-8 flex items-center gap-6 opacity-30 group-hover:opacity-100 transition-opacity">
               <div className="flex-1 h-[2px] bg-void-white/5 relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-void-blood"
                    animate={{ x: ['-100%', '100%'], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  />
               </div>
               <span className="font-syne text-[8px] text-gray-700 tracking-widest uppercase italic">Do you hear me?</span>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes strobe-fast {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-strobe-fast { animation: strobe-fast 0.05s steps(2) infinite; }
      `}</style>
    </motion.section>
  );
}
