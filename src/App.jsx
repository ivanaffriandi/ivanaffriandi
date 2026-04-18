import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomCursor from './components/CustomCursor';
import Hero from './components/Hero';
import Journal from './components/Journal';
import SubjectProfile from './components/SubjectProfile';
import Ticker from './components/Ticker';
import useSound from './hooks/useSound';
import { Volume2, VolumeX } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('hero');
  const [isBooted, setIsBooted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hallucination, setHallucination] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const { playClick, playStatic } = useSound(isMuted);

  // Ominous Hallucinations (English mixed with Jawa Kuno)
  useEffect(() => {
    if (!isBooted) return;
    const messages = [
      "Eling, I see you.",
      "Suwung takes everything.",
      "Are you the witness?",
      "Ora bisa mlayu.",
      "You are drowning in the static.",
      "Mati is not the end."
    ];
    const trigger = () => {
      if (Math.random() > 0.85) {
        setHallucination({
          text: messages[Math.floor(Math.random() * messages.length)],
          x: cursorPos.x + (Math.random() * 200 - 100),
          y: cursorPos.y + (Math.random() * 200 - 100)
        });
        setTimeout(() => setHallucination(null), 150);
      }
      setTimeout(trigger, Math.random() * 7000 + 3000);
    };
    const timer = setTimeout(trigger, 4000);
    return () => clearTimeout(timer);
  }, [isBooted, cursorPos]);

  useEffect(() => {
    const track = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', track, { passive: true });
    return () => window.removeEventListener('mousemove', track);
  }, []);

  const handleTabChange = (tab) => {
    playClick();
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (!isBooted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-horror p-6">
        <motion.div 
          className="text-void-blood/50 text-[10px] tracking-[0.6em] mb-12 uppercase"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          Isih ono sing nunggu
        </motion.div>
        <motion.button
          onClick={() => { setIsBooted(true); playClick(); }}
          className="px-12 py-8 border border-void-white/5 text-void-white text-3xl md:text-5xl hover:border-void-blood hover:text-void-blood transition-all duration-75 tracking-[0.5em] uppercase hover:bg-void-blood/5"
          whileTap={{ scale: 0.95 }}
        >
          AWAKEN
        </motion.button>
      </div>
    );
  }

  return (
    <CustomCursor>
      <motion.main className="relative text-void-white z-0 min-h-screen pb-20 overflow-x-hidden transform-gpu">
        <AnimatePresence>
          {hallucination && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.5, scale: 1.1 }}
              exit={{ opacity: 0 }}
              style={{ left: hallucination.x, top: hallucination.y }}
              className="fixed pointer-events-none z-[100] blur-[1px] font-horror text-void-blood text-2xl md:text-5xl whitespace-nowrap"
            >
              {hallucination.text}
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="fixed top-0 left-0 w-full p-8 flex justify-between items-start z-[70] mix-blend-difference">
           <div className="font-horror text-2xl md:text-4xl tracking-tighter cursor-pointer hover:text-void-blood transition-colors" onClick={() => handleTabChange('hero')}>
             IVAN
           </div>
           
           <div className="flex items-center gap-8">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 text-void-white/30 hover:text-void-blood"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              <ul className="flex gap-6 font-syne font-bold text-[10px] md:text-[11px] tracking-[0.3em]">
                {[
                  { id: 'logs', label: 'WHISPERS' },
                  { id: 'me', label: 'SUKMA' },
                  { id: 'void', label: 'MATI' }
                ].map((item) => (
                    <li key={item.id}>
                      <button 
                        onClick={() => handleTabChange(item.id)}
                        className={`hover:text-void-blood transition-colors uppercase ${activeTab === item.id ? 'text-void-blood' : 'text-void-white/40'}`}
                      >
                        {item.label}
                      </button>
                    </li>
                ))}
              </ul>
           </div>
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'hero' && <Hero cursorPos={cursorPos} isMuted={isMuted} playStatic={playStatic} />}
            {activeTab === 'logs' && <Journal />}
            {activeTab === 'me' && <SubjectProfile playClick={playClick} />}
            {activeTab === 'void' && (
               <section className="min-h-screen flex flex-col justify-center items-center py-20 px-6 text-center">
                 <h2 className="text-7xl md:text-[10rem] text-void-blood font-horror mb-8">MATI</h2>
                 <p className="font-special text-[14px] tracking-[0.5em] text-gray-500 uppercase italic">Sampun rampung. Extinguish the light.</p>
               </section>
            )}
          </motion.div>
        </AnimatePresence>

        <Ticker />
      </motion.main>
    </CustomCursor>
  );
}

export default App;
