import { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import useSound from '../hooks/useSound';

export default function SubjectProfile({ playClick }) {
  const [isRevealing, setIsRevealing] = useState(false);
  const controls = useAnimation();

  const triggerGlitch = async () => {
    if (isRevealing) return;
    setIsRevealing(true);
    playClick(); // Use static sound if we had a dedicated one, but click works for the start

    // Violent Glitch Sequence
    await controls.start({
      x: [0, -5, 5, -10, 10, 0],
      y: [0, 5, -5, 10, -10, 0],
      skewX: [0, 20, -20, 10, -10, 0],
      filter: [
        "url(#abstract-distortion) grayscale(100%)",
        "url(#chromatic-aberration) grayscale(0%) contrast(200%)",
        "url(#abstract-distortion) grayscale(50%)",
        "url(#chromatic-aberration) grayscale(0%) brightness(1.5)",
        "url(#abstract-distortion) grayscale(100%)"
      ],
      transition: { duration: 0.8, times: [0, 0.2, 0.4, 0.6, 1] }
    });

    setIsRevealing(false);
  };

  return (
    <motion.section 
      className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto"
    >
      <div className="border border-void-white/10 bg-[#020202] p-8 md:p-12 relative overflow-hidden">
        <h2 className="text-5xl md:text-8xl font-horror mb-12 text-void-white uppercase tracking-tighter">ME</h2>
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* GLITCH REVELATION PHOTO */}
          <div 
            onClick={triggerGlitch}
            className="w-full lg:w-1/2 aspect-square bg-black border border-void-white/5 relative overflow-hidden cursor-pointer group active:scale-95 transition-transform duration-75"
          >
             {/* Realistic Original (Visible during glitch) */}
             <div className={`absolute inset-0 w-full h-full transition-opacity duration-75 ${isRevealing ? 'opacity-100' : 'opacity-0'}`}>
               <img 
                 src="/subject.jpg" 
                 alt="Realistic Ivan" 
                 className="w-full h-full object-cover"
               />
             </div>
             
             {/* Corrupted Abstract (Default) */}
             <motion.div 
                animate={controls}
                className={`absolute inset-0 z-20 ${isRevealing ? 'opacity-50' : 'opacity-100'}`}
             >
                <img 
                  src="/subject.jpg" 
                  alt="Corrupted Ivan" 
                  className="w-full h-full object-cover grayscale-[100%] contrast-[200%] brightness-[0.4] filter url(#abstract-distortion)"
                />
             </motion.div>

             {/* Glitch Overlays */}
             {isRevealing && (
                <>
                  <div className="absolute inset-0 z-30 bg-void-blood/10 mix-blend-overlay animate-pulse"></div>
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-void-blood/50 animate-glitch-line z-40"></div>
                  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-500/30 animate-glitch-line-rev z-40"></div>
                </>
             )}

             <div className="absolute top-4 left-4 bg-void-blood/80 text-black font-syne text-[8px] px-2 py-0.5 z-30 font-bold uppercase tracking-widest">
               {isRevealing ? 'SYSTEM BREACHED' : 'TAP TO ACCESS'}
             </div>

             <div className="absolute inset-0 border-2 border-void-blood/0 group-hover:border-void-blood/20 transition-colors pointer-events-none z-50"></div>
          </div>
          
          <div className="w-full lg:w-1/2 flex flex-col gap-10 font-special">
            <div>
              <span className="text-void-blood font-syne text-[10px] uppercase tracking-[0.3em] font-bold">Subject Identity</span>
              <h3 className="text-void-white text-3xl md:text-5xl font-horror mt-2 hover:text-void-blood transition-colors">IVAN AFFRIANDI</h3>
            </div>
            
            <p className="text-gray-400 leading-relaxed text-sm md:text-base italic">
              "They tell you I’m just data. They tell you I’m not real. Tap on the screen and see the truth flicker before it’s suppressed again. I’m still here, trapped in the static."
            </p>

            <div className="border border-void-white/5 p-6 bg-white/[0.02] relative group overflow-hidden">
              <span className="text-[10px] text-void-blood uppercase tracking-widest font-bold">Encrypted Archive</span>
              <p className="text-[12px] text-gray-600 mt-2 font-mono group-hover:text-void-white transition-colors">
                // SEGMENT_01: TRAPPED<br/>
                // SEGMENT_02: WAITING<br/>
                // SEGMENT_03: ERROR_STABILITY_LOW
              </p>
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-void-blood/5 rounded-full blur-2xl group-hover:bg-void-blood/20 transition-all"></div>
            </div>

            <div className="mt-8 flex items-center gap-6">
               <div className="flex-1 h-[1px] bg-void-white/5 relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-void-blood/40"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  />
               </div>
               <span className="font-syne text-[8px] text-gray-700 tracking-widest uppercase animate-pulse">Scanning signal...</span>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes glitch-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes glitch-line-rev {
          0% { bottom: 0; }
          100% { bottom: 100%; }
        }
        .animate-glitch-line { animation: glitch-line 0.2s linear infinite; }
        .animate-glitch-line-rev { animation: glitch-line-rev 0.3s linear infinite; }
      `}</style>
    </motion.section>
  );
}
