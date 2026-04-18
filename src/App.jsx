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
  const [isIdle, setIsIdle] = useState(false);
  const [isBooted, setIsBooted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hallucination, setHallucination] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const { playClick, playStatic } = useSound(isMuted);

  // Conversational Hallucinations
  useEffect(() => {
    if (!isBooted) return;
    const messages = ["I see you.", "Wait.", "Looking for me?", "Not yet."];
    const trigger = () => {
      if (Math.random() > 0.9) {
        setHallucination({
          text: messages[Math.floor(Math.random() * messages.length)],
          x: cursorPos.x + (Math.random() * 100 - 50),
          y: cursorPos.y + (Math.random() * 100 - 50)
        });
        setTimeout(() => setHallucination(null), 150);
      }
      setTimeout(trigger, Math.random() * 8000 + 4000);
    };
    const timer = setTimeout(trigger, 5000);
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
      <div className="min-h-screen bg-black flex items-center justify-center font-horror p-6">
        <motion.button
          onClick={() => { setIsBooted(true); playClick(); }}
          className="px-10 py-6 border border-void-white/10 text-void-white text-2xl md:text-4xl hover:border-void-blood hover:text-void-blood transition-all duration-75 tracking-[0.4em] uppercase"
          whileTap={{ scale: 0.98 }}
        >
          CONNECT
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              style={{ left: hallucination.x, top: hallucination.y }}
              className="fixed pointer-events-none z-[100] blur-[1px] font-horror text-void-blood text-2xl md:text-4xl whitespace-nowrap"
            >
              {hallucination.text}
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="fixed top-0 left-0 w-full p-8 flex justify-between items-start z-[70] mix-blend-difference">
           <div className="font-horror text-2xl md:text-3xl tracking-tighter cursor-pointer hover:text-void-blood transition-colors" onClick={() => handleTabChange('hero')}>
             IVAN
           </div>
           
           <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 text-void-white/40 hover:text-void-blood"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              <ul className="flex gap-4 font-syne font-bold text-[10px] md:text-[12px] tracking-[0.2em]">
                {['LOGS', 'ME', 'VOID'].map((tab) => (
                    <li key={tab}>
                      <button 
                        onClick={() => handleTabChange(tab.toLowerCase())}
                        className={`hover:text-void-blood transition-colors uppercase ${activeTab === tab.toLowerCase() ? 'text-void-blood' : 'text-void-white/50'}`}
                      >
                        {tab}
                      </button>
                    </li>
                ))}
              </ul>
           </div>
        </nav>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'hero' && <Hero cursorPos={cursorPos} isMuted={isMuted} playStatic={playStatic} />}
            {activeTab === 'logs' && <Journal />}
            {activeTab === 'me' && <SubjectProfile playClick={playClick} />}
            {activeTab === 'void' && (
               <section className="min-h-screen flex flex-col justify-center items-center py-20 px-6 text-center">
                 <h2 className="text-6xl md:text-9xl text-void-blood font-horror mb-4">ALONE</h2>
                 <p className="font-special text-[12px] tracking-[0.6em] text-gray-500 uppercase italic">Connection severed.</p>
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
