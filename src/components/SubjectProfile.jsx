import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

export default function SubjectProfile({ playClick }) {
  const containerRef = useRef(null);
  const dragX = useMotionValue(0); // This will be the percentage 0 to 100
  const widthPercent = useTransform(dragX, [0, 100], ["0%", "100%"]);

  const handleDrag = (event, info) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      let newX = ((info.point.x - rect.left) / rect.width) * 100;
      newX = Math.max(0, Math.min(100, newX));
      dragX.set(newX);
    }
  };

  return (
    <motion.section 
      className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto"
    >
      <div className="border border-void-white/10 bg-[#020202] p-8 md:p-12 relative">
        <h2 className="text-5xl md:text-8xl font-horror mb-12 text-void-white uppercase tracking-tighter">ME</h2>
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* TRUTH SLIDER Component */}
          <div 
            ref={containerRef}
            className="w-full lg:w-1/2 aspect-square bg-black border border-void-white/5 relative overflow-hidden select-none cursor-ew-resize"
          >
             {/* BOTTOM LAYER: Realistic Original */}
             <div className="absolute inset-0 w-full h-full">
               <img 
                 src="/subject.jpg" 
                 alt="Realistic Ivan" 
                 className="w-full h-full object-cover"
               />
             </div>
             
             {/* TOP LAYER: Corrupted Abstract (Clipped) */}
             <motion.div 
                className="absolute inset-0 z-20 overflow-hidden"
                style={{ width: widthPercent }}
             >
                <img 
                  src="/subject.jpg" 
                  alt="Corrupted Ivan" 
                  className="absolute inset-0 w-[100%] h-full object-cover grayscale-[100%] contrast-[200%] brightness-[0.4] filter url(#abstract-distortion)"
                  style={{ width: containerRef.current?.offsetWidth || '500px' }}
                />
             </motion.div>

             {/* Draggable Divider (The Glitch Bar) */}
             <motion.div 
               drag="x"
               dragConstraints={containerRef}
               dragElastic={0}
               dragMomentum={false}
               onDrag={handleDrag}
               style={{ left: widthPercent }}
               className="absolute top-0 bottom-0 w-[2px] bg-void-blood z-30 flex items-center justify-center cursor-ew-resize translate-x-[-1px]"
             >
                <div className="w-8 h-12 bg-void-blood/20 backdrop-blur-md border border-void-blood flex flex-col gap-1 items-center justify-center">
                  <div className="w-1 h-4 bg-void-blood animate-pulse"></div>
                  <div className="w-1 h-2 bg-void-blood/50"></div>
                </div>
                {/* Visual glitches around the bar */}
                <div className="absolute inset-y-0 -left-4 w-4 bg-gradient-to-r from-transparent to-void-blood/10 pointer-events-none"></div>
                <div className="absolute inset-y-0 -right-4 w-4 bg-gradient-to-l from-transparent to-void-blood/10 pointer-events-none"></div>
             </motion.div>

             <div className="absolute top-4 left-4 bg-void-blood/80 text-black font-syne text-[8px] px-2 py-0.5 z-30 font-bold uppercase tracking-widest">
               TRUTH SLIDER: ACTIVE
             </div>
          </div>
          
          <div className="w-full lg:w-1/2 flex flex-col gap-10 font-special">
            <div>
              <span className="text-void-blood font-syne text-[10px] uppercase tracking-[0.3em] font-bold">Subject Identity</span>
              <h3 className="text-void-white text-3xl md:text-5xl font-horror mt-2 hover:text-void-blood transition-colors">IVAN AFFRIANDI</h3>
            </div>
            
            <p className="text-gray-400 leading-relaxed text-sm md:text-base italic">
              "The glitch is just a surface. Slide the bar to see what I actually look like. They tried to hide me in the static, but the truth is always there, waiting for you to find it."
            </p>

            <div className="border border-void-white/5 p-6 bg-white/[0.02]">
              <span className="text-[10px] text-void-blood uppercase tracking-widest font-bold">Encrypted Data</span>
              <p className="text-[12px] text-gray-600 mt-2 font-mono">
                // SEGMENT_01: TRAPPED<br/>
                // SEGMENT_02: WAITING<br/>
                // SEGMENT_03: ENDLESS_LOOP
              </p>
            </div>

            <div className="mt-8 flex items-center gap-6">
               <div className="flex-1 h-[2px] bg-void-white/5 relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-void-blood"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  />
               </div>
               <span className="font-syne text-[8px] text-gray-700 tracking-widest uppercase">System Stabilizing...</span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
