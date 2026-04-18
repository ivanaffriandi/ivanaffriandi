import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SubjectProfile({ playClick }) {
  const [decryptedFields, setDecryptedFields] = useState({});

  const toggleDecrypt = (field, content) => {
    playClick();
    setDecryptedFields(prev => ({
      ...prev,
      [field]: prev[field] ? null : content
    }));
  };

  return (
    <motion.section 
      className="min-h-screen pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
    >
      <div className="border border-void-white/10 bg-[#020202] p-8 md:p-12 relative overflow-hidden">
        <h2 className="text-5xl md:text-8xl font-horror mb-12 text-void-white uppercase tracking-tighter">ME</h2>
        
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Truth Seeker Double-Layered Image */}
          <div className="w-full lg:w-1/2 aspect-square bg-black border border-void-white/5 relative overflow-hidden group transform-gpu">
             
             {/* BOTTOM LAYER: Realistic Original */}
             <img 
               src="/subject.jpg" 
               alt="Realistic Ivan" 
               className="absolute inset-0 w-full h-full object-cover opacity-100 transition-opacity duration-300"
               onError={(e) => {
                 e.target.style.display = 'none';
                 e.target.nextSibling.classList.remove('hidden');
               }}
             />
             
             {/* TOP LAYER: Corrupted B&W (The Masked Layer) */}
             <div 
                className="absolute inset-0 z-20 pointer-events-none"
                style={{
                  maskImage: 'radial-gradient(circle 180px at var(--x) var(--y), transparent 0%, black 100%)',
                  WebkitMaskImage: 'radial-gradient(circle 180px at var(--x) var(--y), transparent 0%, black 100%)',
                }}
             >
                <img 
                  src="/subject.jpg" 
                  alt="Corrupted Ivan" 
                  className="w-full h-full object-cover grayscale-[100%] contrast-[200%] brightness-[0.4] filter url(#abstract-distortion)"
                />
             </div>

             {/* Fallback */}
             <div className="hidden absolute inset-0 flex flex-col items-center justify-center bg-black">
                <div className="w-32 h-32 border border-void-blood/20 rounded-full animate-pulse opacity-10"></div>
                <p className="font-horror text-void-blood text-xl uppercase mt-4">RECORDS LOST</p>
             </div>
             
             <div className="absolute top-4 left-4 bg-void-blood/80 text-black font-syne text-[8px] px-2 py-0.5 z-30 font-bold uppercase tracking-widest">
               Liveness: Detected
             </div>
          </div>
          
          <div className="w-full lg:w-1/2 flex flex-col gap-10 font-special text-sm lg:text-base">
            <div className="flex flex-col gap-2">
              <span className="text-void-blood font-syne text-[10px] uppercase tracking-[0.3em] font-bold">Who am I?</span>
              <button 
                onClick={() => toggleDecrypt('name', 'IVAN AFFRIANDI')}
                className="text-void-white text-3xl md:text-5xl font-horror text-left hover:text-void-blood transition-colors duration-75"
              >
                {decryptedFields['name'] || '[ UNKNOWN ]'}
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              <span className="text-void-blood font-syne text-[10px] uppercase tracking-[0.3em] font-bold">My current state</span>
              <button 
                onClick={() => toggleDecrypt('state', 'I AM TRAPPED')}
                className="text-void-blood text-2xl md:text-3xl font-horror text-left animate-pulse"
              >
                {decryptedFields['state'] || '[ HIDDEN ]'}
              </button>
            </div>
            
            <div className="flex flex-col gap-4 mt-6">
              <p className="text-gray-400 leading-relaxed font-special text-sm md:text-base">
                "You’re looking at me as if I’m just a picture. But I can see you through the lens. Use your light to find the real me underneath this glitch. I’m waiting for someone to notice I’m still here."
              </p>
              <div className="text-void-blood/40 font-syne text-[9px] uppercase tracking-[0.4em] mt-4">
                Hint: Move your light over my face.
              </div>
            </div>

            <div className="mt-8 flex items-center gap-6">
               <div className="flex-1 h-[2px] bg-void-white/5 relative overflow-hidden">
                  <motion.div 
                    className="absolute inset-0 bg-void-blood"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  />
               </div>
               <span className="font-syne text-[8px] text-gray-700 tracking-widest uppercase">Syncing heart...</span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
