import { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import useSound from '../hooks/useSound';

const HALLUCINATIONS = ["ꦆꦥ꦳ꦤ꧀", "ꦒꦼꦠꦶꦃ", "ꦱꦸꦮꦸꦁ", "MISTAKE", "ꦌꦭꦶꦁ", "MATI", "ꦱꦏ꧀ꦱꦶ"];

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
      className="min-h-screen pt-40 pb-32 px-6 md:px-12 max-w-7xl mx-auto"
    >
      <div className="border border-void-white/5 bg-[#020202] p-10 md:p-16 relative overflow-hidden group">
        {/* Background Watermark */}
        <div className="watermark-aksara top-0 right-0 opacity-[0.02] rotate-12">
          ꦱꦸꦏ꧀ꦩ
        </div>

        <div className="flex flex-col mb-20">
          <h2 className="text-9xl md:text-[14rem] font-horror text-void-white uppercase tracking-tighter shiver chromatic-text">SAJEN</h2>
          <span className="font-aksara text-4xl text-void-blood/40 mt-2">ꦱꦸꦏ꧀ꦩ</span>
          <p className="font-syne text-[14px] text-gray-700 tracking-[0.8em] uppercase italic mt-4">The Final Offering</p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-20 lg:gap-32">
          {/* NIGHTMARE REVELATION PHOTO */}
          <div 
            onClick={triggerNightmare}
            className="w-full lg:w-[48%] aspect-square bg-black border border-void-white/5 relative overflow-hidden cursor-crosshair group active:scale-[0.98] transition-all"
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
                  className="w-full h-full object-cover grayscale-[100%] contrast-[200%] brightness-[0.35] filter url(#abstract-distortion)"
                />
             </motion.div>

             <AnimatePresence>
               {isRevealing && currentMessage && (
                 <motion.div 
                   key={currentMessage}
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1.3 }}
                   exit={{ opacity: 0 }}
                   className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                 >
                    <span className="font-horror text-void-blood text-5xl md:text-9xl drop-shadow-[0_0_20px_rgba(255,0,0,1)] tracking-widest bg-black/50 px-8 shiver">
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

             <div className="absolute top-8 left-8 bg-void-blood text-black font-aksara text-2xl px-4 py-2 z-50 font-bold uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(255,0,0,0.8)] shiver">
               {isRevealing ? 'ꦱꦸꦏ꧀ꦩꦩꦼꦭꦼꦏ꧀' : 'ꦱꦼꦤ꧀ꦠꦸꦃꦄꦏꦸ'}
             </div>
          </div>
          
          <div className="w-full lg:w-[52%] flex flex-col gap-16 font-special">
            <div>
              <span className="text-void-blood font-aksara text-2xl uppercase tracking-[0.6em] font-bold">Identitas</span>
              <h3 className="text-void-white text-5xl md:text-8xl font-horror mt-6 hover:text-void-blood transition-colors shiver">IVAN AFFRIANDI</h3>
            </div>
            
            <p className="text-gray-400 leading-[2] text-lg md:text-2xl italic max-w-2xl">
              "The shadow in the static is tired of hiding. You look at this frame and see a man, but I see a collection of broken memories. The ritual is almost complete. My soul—my ꦱꦸꦏ꧀ꦩ—is finally yours to witness. ꦌꦭꦶꦁ?"
            </p>

            <div className="border border-void-white/5 p-10 bg-white/[0.01] relative group overflow-hidden border-l-4 border-l-void-blood/40">
              <span className="font-aksara text-2xl text-void-blood/80 uppercase tracking-[0.5em] font-bold">Remnants</span>
              <p className="text-[16px] text-gray-700 mt-6 font-mono group-hover:text-void-blood transition-all leading-loose shiver">
                ꦆꦱꦶꦃꦈꦫꦶꦥ꧀... The light is lying.<br/>
                ꦒꦼꦠꦶꦃ... The static is bleeding.<br/>
                ꦱꦸꦮꦸꦁ... The void is home.
              </p>
            </div>

            <div className="mt-20 flex items-center gap-12 opacity-15 group-hover:opacity-100 transition-all">
               <div className="flex-1 h-[3px] bg-void-white/5 relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-void-blood/80"
                    animate={{ x: ['-100%', '100%'], opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  />
               </div>
               <span className="font-aksara text-2xl text-gray-700 tracking-[0.4em] uppercase italic">ꦱꦩ꧀ꦥꦸꦤ꧀ꦫꦩ꧀ꦥꦸꦁ?</span>
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
