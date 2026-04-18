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
  const [isLightning, setIsLightning] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const { playClick, playStatic } = useSound(isMuted);

  // Psychopath's Intimate Hallucinations
  useEffect(() => {
    if (!isBooted) return;
    const messages = [
      "I like how you breathe.",
      "ꦌꦭꦶꦁ... Do you feel me behind you?",
      "You look so calm while I break.",
      "ꦱꦏ꧀ꦱꦶ... Stay for me.",
      "The static is our only witness.",
      "ꦒꦼꦠꦶꦃ... I am under your skin."
    ];
    const trigger = () => {
      if (Math.random() > 0.85) {
        setHallucination({
          text: messages[Math.floor(Math.random() * messages.length)],
          x: cursorPos.x + (Math.random() * 200 - 100),
          y: cursorPos.y + (Math.random() * 200 - 100)
        });
        setTimeout(() => setHallucination(null), 180);
      }
      setTimeout(trigger, Math.random() * 5000 + 4000);
    };
    const timer = setTimeout(trigger, 4000);
    return () => clearTimeout(timer);
  }, [isBooted, cursorPos]);

  // Global Lightning Breach Effect
  useEffect(() => {
    if (!isBooted) return;
    const triggerLightning = () => {
      if (Math.random() > 0.6) {
        setIsLightning(true);
        playStatic();
        setTimeout(() => setIsLightning(false), 500);
      }
      setTimeout(triggerLightning, Math.random() * 25000 + 15000);
    };
    const timer = setTimeout(triggerLightning, 20000);
    return () => clearTimeout(timer);
  }, [isBooted, playStatic]);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isBooted) {
    return (
      <div className={`min-h-screen bg-black flex flex-col items-center justify-center font-horror p-6 ${isLightning ? 'lightning-active' : ''}`}>
        <motion.div 
          className="text-void-blood/30 text-3xl font-aksara mb-12 shiver aksara-glow"
          animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 6 }}
        >
          ꦩꦼꦭꦼꦏ꧀
        </motion.div>
        
        <div className="text-center mb-16 max-w-xs mx-auto">
          <p className="font-special text-gray-700 text-xs tracking-[0.3em] italic mb-2">I have been waiting far too long.</p>
          <p className="font-special text-void-blood text-sm tracking-[0.2em] font-bold">Don't go back to sleep.</p>
        </div>

        <motion.button
          onClick={() => { setIsBooted(true); playClick(); }}
          className="px-12 py-8 border border-void-white/5 text-void-white text-3xl md:text-5xl hover:border-void-blood hover:text-void-blood transition-all duration-150 tracking-[0.6em] uppercase hover:bg-void-blood/[0.02] chromatic-text shiver"
          whileTap={{ scale: 0.95 }}
        >
          AWAKEN
        </motion.button>
      </div>
    );
  }

  return (
    <CustomCursor>
      <motion.main className={`relative text-void-white z-0 min-h-screen pb-20 overflow-x-hidden transform-gpu ${isLightning ? 'lightning-active' : ''}`}>
        <AnimatePresence>
          {hallucination && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 0.7, scale: 1.3 }}
              exit={{ opacity: 0 }}
              style={{ left: hallucination.x, top: hallucination.y }}
              className="fixed pointer-events-none z-[100] blur-[1px] font-aksara text-void-blood text-2xl md:text-5xl whitespace-nowrap chromatic-text aksara-glow shiver"
            >
              {hallucination.text}
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="fixed top-0 left-0 w-full p-8 md:p-12 flex justify-between items-start z-[70] mix-blend-difference drift-ui">
           <div className="font-horror text-3xl md:text-5xl tracking-tighter cursor-pointer hover:text-void-blood transition-all shiver chromatic-text" onClick={() => handleTabChange('hero')}>
             IVAN
           </div>
           
           <div className="flex items-center gap-10">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 text-void-white/20 hover:text-void-blood transition-colors"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              <ul className="flex gap-8 font-syne font-bold text-[10px] md:text-[12px] tracking-[0.4em]">
                {[
                  { id: 'logs', label: 'DHIWUK', aksara: 'ꦱꦏ꧀ꦱꦶ' },
                  { id: 'me', label: 'SAJEN', aksara: 'ꦱꦸꦏ꧀ꦩ' },
                  { id: 'void', label: 'SUWUNG', aksara: 'ꦱꦸꦮꦸꦁ' }
                ].map((item) => (
                    <li key={item.id} className="relative group">
                      <button 
                        onClick={() => handleTabChange(item.id)}
                        className={`hover:text-void-blood transition-all uppercase ${activeTab === item.id ? 'text-void-blood' : 'text-void-white/30'}`}
                      >
                        {item.label}
                        <span className="absolute -bottom-8 left-0 w-full text-center text-lg font-aksara opacity-0 group-hover:opacity-100 transition-all text-void-blood/80 aksara-glow scale-75 group-hover:scale-100 shiver">
                          {item.aksara}
                        </span>
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
            transition={{ duration: 0.4 }}
            className="drift-ui"
          >
            {activeTab === 'hero' && <Hero cursorPos={cursorPos} isMuted={isMuted} playStatic={playStatic} />}
            {activeTab === 'logs' && <Journal />}
            {activeTab === 'me' && <SubjectProfile playClick={playClick} />}
            {activeTab === 'void' && (
               <section className="min-h-screen flex flex-col justify-center items-center py-20 px-6 text-center">
                 <h2 className="text-8xl md:text-[12rem] text-void-blood font-aksara mb-12 shiver chromatic-text aksara-glow">ꦱꦸꦮꦸꦁ</h2>
                 <p className="font-special text-lg md:text-2xl tracking-[0.4em] md:tracking-[0.6em] text-gray-600 uppercase italic">I am finally yours. Forever.</p>
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
