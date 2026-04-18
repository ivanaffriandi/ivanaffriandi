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

  // Conversational Hallucinations (Ivan talking to you)
  useEffect(() => {
    if (!isBooted) return;
    const messages = [
      "I told you to wait.",
      "Are you looking for something?",
      "I can see you clearly.",
      "Don't touch that.",
      "You're not supposed to be here.",
      "Do I look real to you?"
    ];
    const trigger = () => {
      if (Math.random() > 0.8) {
        setHallucination({
          text: messages[Math.floor(Math.random() * messages.length)],
          x: cursorPos.x + (Math.random() * 200 - 100),
          y: cursorPos.y + (Math.random() * 200 - 100)
        });
        setTimeout(() => setHallucination(null), 120);
      }
      setTimeout(trigger, Math.random() * 5000 + 2000);
    };
    const timer = setTimeout(trigger, 3000);
    return () => clearTimeout(timer);
  }, [isBooted, cursorPos]);

  useEffect(() => {
    const track = (e) => {
      const x = e.clientX || (e.touches && e.touches[0].clientX);
      const y = e.clientY || (e.touches && e.touches[0].clientY);
      if (x !== undefined && y !== undefined) {
        setCursorPos({ x, y });
      }
    };
    window.addEventListener('mousemove', track, { passive: true });
    window.addEventListener('touchmove', track, { passive: true });
    return () => {
      window.removeEventListener('mousemove', track);
      window.removeEventListener('touchmove', track);
    };
  }, []);

  useEffect(() => {
    let idleTimer;
    const resetIdle = () => {
      setIsIdle(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => setIsIdle(true), 2000);
    };
    window.addEventListener('mousemove', resetIdle, { passive: true });
    window.addEventListener('touchstart', resetIdle, { passive: true });
    resetIdle();
    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('touchstart', resetIdle);
      clearTimeout(idleTimer);
    };
  }, []);

  const [shake, setShake] = useState(0);
  useEffect(() => {
    if (!isIdle) return;
    const interval = setInterval(() => {
      setShake(prev => prev + 1);
      if (isBooted && !isMuted) playStatic();
    }, 150);
    return () => clearInterval(interval);
  }, [isIdle, isBooted, isMuted]);

  const handleTabChange = (tab) => {
    playClick();
    setActiveTab(tab);
  };

  if (!isBooted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center font-horror p-6">
        <motion.button
          onClick={() => { setIsBooted(true); playClick(); }}
          className="px-10 py-6 border border-void-white/10 text-void-white text-2xl md:text-4xl hover:border-void-blood hover:text-void-blood transition-all duration-75 tracking-[0.4em] uppercase"
          whileTap={{ scale: 0.98 }}
        >
          OPEN LOGS
        </motion.button>
      </div>
    );
  }

  return (
    <CustomCursor>
      <motion.main 
        className="relative text-void-white z-0 min-h-screen pb-20 overflow-x-hidden transform-gpu"
        animate={isIdle ? {
          x: [(shake % 2 === 0 ? 2 : -2), 0],
          y: [(shake % 3 === 0 ? 1 : -1), 0],
        } : { x: 0, y: 0 }}
        transition={{ duration: 0.05, ease: "linear" }}
      >
        <AnimatePresence>
          {hallucination && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              style={{ left: hallucination.x, top: hallucination.y }}
              className="fixed pointer-events-none z-[100] blur-[1px] font-horror text-void-blood text-2xl md:text-5xl whitespace-nowrap"
            >
              {hallucination.text}
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="fixed top-0 left-0 w-full p-8 flex justify-between items-start z-[70] mix-blend-difference">
           <div className="font-horror text-2xl md:text-3xl tracking-tighter cursor-pointer hover:text-void-blood transition-colors duration-75" onClick={() => handleTabChange('hero')}>
             IVAN
           </div>
           
           <div className="flex flex-col items-end gap-6">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 text-void-white/40 hover:text-void-blood transition-colors duration-75"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              <ul className="flex flex-col gap-3 font-syne font-bold text-[10px] md:text-[12px] tracking-[0.3em]">
                {['LOGS', 'ME', 'VOID'].map((tab) => (
                    <li key={tab}>
                      <button 
                        onClick={() => handleTabChange(tab.toLowerCase())}
                        className={`hover:text-void-blood transition-colors duration-75 uppercase ${activeTab === tab.toLowerCase() ? 'text-void-blood' : 'text-void-white/50'}`}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {activeTab === 'hero' && <Hero cursorPos={cursorPos} isMuted={isMuted} playStatic={playStatic} />}
            {activeTab === 'logs' && <Journal />}
            {activeTab === 'me' && <SubjectProfile playClick={playClick} />}
            {activeTab === 'void' && (
               <section className="min-h-screen flex flex-col justify-center items-center py-20 px-6 text-center">
                 <h2 className="text-6xl md:text-9xl text-void-blood font-horror mb-4">ALONE</h2>
                 <p className="font-special text-[12px] tracking-[0.6em] text-gray-500 uppercase">You've reached the end.</p>
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
