import { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import useSound from '../hooks/useSound';

const HALLUCINATIONS = ["ꦆꦥ꦳ꦤ꧀", "ꦒꦼꦠꦶꦃ", "ꦱꦸꦮꦸꦁ", "HELP", "ꦌꦭꦶꦁ", "ꦩꦠ궧", "ꦱꦏ꧀ꦱꦶ"];

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
    }, 80);

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
        <h2 className="text-7xl md:text-[8rem] font-aksara mb-16 text-void-white uppercase tracking-tighter">ꦱꦸꦏ꧀ꦩ</h2>
        
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* NIGHTMARE REVELATION PHOTO */}
          <div 
            onClick={triggerNightmare}
            className="w-full lg:w-[45%] aspect-square bg-black border border-void-white/5 relative overflow-hidden cursor-crosshair group active:scale-[0.98] transition-all"
          >
             <div className={`absolute inset-0 w-full h-full transition-opacity duration-150 ${isRevealing ? 'opacity-100' : 'opacity-0'}`}>
               <img src="/subject.jpg" alt="The Soul" className="w-full h-full object-cover grayscale-[20%]" />
             </div>
             
             <motion.div animate={ghostControls} className="absolute inset-0 z-10 pointer-events-none mix-blend-difference">
                <img src="/subject.jpg" alt="Ghost" className="w-full h-full object-cover invert brightness-150 opacity-40 translate-x-4" />
             </motion.div>

             <motion.div animate={controls} className={`absolute inset-0 z-20 ${isRevealing ? 'opacity-70' : 'opacity-100'}`}>
                <img 
                  src="/subject.jpg" 
                  alt="Vessel" 
                  className="w-full h-full object-cover grayscale-[100%] contrast-[180%] brightness-[0.35] filter url(#abstract-distortion)"
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
                    <span className="font-aksara text-void-blood text-4xl md:text-8xl drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] tracking-widest bg-black/40 px-6">
                      {currentMessage}
                    </span>
                 </motion.div>
               )}
             </AnimatePresence>

             {isRevealing && (
                <div className="absolute inset-0 z-40 bg-void-blood/5 mix-blend-overlay pointer-events-none overflow-hidden">
                  <div className="w-full h-full animate-strobe-fast bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(255,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,255,0.02),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%]"></div>
                </div>
             )}

             <div className="absolute top-6 left-6 bg-void-blood text-black font-aksara text-lg px-3 py-1 z-50 font-bold uppercase tracking-[0.3em] shadow-[0_0_15px_rgba(255,0,0,0.6)]">
               {isRevealing ? 'ꦱꦸꦏ꧀ꦩꦩꦼꦭꦼꦏ꧀' : 'ꦱꦼꦤ꧀ꦠꦸꦃꦄꦏꦸ'}
             </div>
          </div>
          
          <div className="w-full lg:w-[55%] flex flex-col gap-12 font-special">
            <div>
              <span className="text-void-blood font-aksara text-xl uppercase tracking-[0.5em] font-bold">Identitas</span>
              <h3 className="text-void-white text-4xl md:text-7xl font-horror mt-4 hover:text-void-blood transition-colors group-hover:animate-pulse">IVAN AFFRIANDI</h3>
            </div>
            
            <p className="text-gray-400 leading-[1.8] text-base md:text-xl italic max-w-xl">
              "Every breath here is an offering. I am no longer Ivan. I am the echo in the corner of your eye. You touch the static and think you see a face, but you only see a mirror of your own fear. ꦌꦭꦶꦁ?"
            </p>

            <div className="border border-void-white/5 p-8 bg-white/[0.01] relative group overflow-hidden border-l-2 border-l-void-blood/30">
              <span className="font-aksara text-xl text-void-blood/70 uppercase tracking-[0.4em] font-bold">Remnants</span>
              <p className="text-[14px] text-gray-700 mt-4 font-mono group-hover:text-void-blood transition-colors leading-relaxed">
                ꦆꦱꦶꦃꦈꦫꦶꦥ꧀... ALONE<br/>
                ꦒꦼꦠꦶꦃ... THE BLOOD RUNS COLD<br/>
                ꦱꦸꦮꦸꦁ... THE EMPTINESS IS LOUD
              </p>
            </div>

            <div className="mt-12 flex items-center gap-8 opacity-20 group-hover:opacity-100 transition-opacity">
               <div className="flex-1 h-[2px] bg-void-white/5 relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-void-blood/60"
                    animate={{ x: ['-100%', '100%'], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                  />
               </div>
               <span className="font-aksara text-lg text-gray-700 tracking-[0.3em] uppercase italic">ꦱꦩ꧀ꦥꦸꦤ꧀ꦫꦩ꧀ꦥꦸꦁ?</span>
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
