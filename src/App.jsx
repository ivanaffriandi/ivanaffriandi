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

  // Ritual Hallucinations
  useEffect(() => {
    if (!isBooted) return;
    const messages = [
      "ꦌꦭꦶꦁ... Do you remember?",
      "Suwung follows you.",
      "The shadow is weightless.",
      "ꦱꦏ꧀ꦱꦶ... Witness the fall.",
      "You are the offering.",
      "ꦒꦼꦠꦶꦃ... It never dries."
    ];
    const trigger = () => {
      if (Math.random() > 0.88) {
        setHallucination({
          text: messages[Math.floor(Math.random() * messages.length)],
          x: cursorPos.x + (Math.random() * 240 - 120),
          y: cursorPos.y + (Math.random() * 240 - 120)
        });
        setTimeout(() => setHallucination(null), 120);
      }
      setTimeout(trigger, Math.random() * 6000 + 4000);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isBooted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-horror p-6">
        <motion.div 
          className="text-void-blood/40 text-4xl font-aksara mb-16 shiver underline underline-offset-[20px] decoration-void-blood/20"
          animate={{ opacity: [0.1, 0.4, 0.1] }}
          transition={{ repeat: Infinity, duration: 5 }}
        >
          ꦩꦼꦭꦼꦏ꧀
        </motion.div>
        <motion.button
          onClick={() => { setIsBooted(true); playClick(); }}
          className="px-16 py-10 border border-void-white/5 text-void-white text-4xl md:text-6xl hover:border-void-blood hover:text-void-blood transition-all duration-150 tracking-[0.6em] uppercase hover:bg-void-blood/[0.02] chromatic-text"
          whileTap={{ scale: 0.96 }}
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
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 0.6, scale: 1.2 }}
              exit={{ opacity: 0 }}
              style={{ left: hallucination.x, top: hallucination.y }}
              className="fixed pointer-events-none z-[100] blur-[1.5px] font-aksara text-void-blood text-3xl md:text-6xl whitespace-nowrap chrome-text shiver"
            >
              {hallucination.text}
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="fixed top-0 left-0 w-full p-10 flex justify-between items-start z-[70] mix-blend-difference">
           <div className="font-horror text-3xl md:text-5xl tracking-tighter cursor-pointer hover:text-void-blood transition-all shiver" onClick={() => handleTabChange('hero')}>
             IVAN
           </div>
           
           <div className="flex items-center gap-10">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 text-void-white/20 hover:text-void-blood transition-colors"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              <ul className="flex gap-8 font-syne font-bold text-[11px] md:text-[12px] tracking-[0.4em]">
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
                        <span className="absolute -bottom-6 left-0 w-full text-center text-sm font-aksara opacity-0 group-hover:opacity-100 transition-all text-void-blood/60 scale-75 group-hover:scale-100">
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
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'hero' && <Hero cursorPos={cursorPos} isMuted={isMuted} playStatic={playStatic} />}
            {activeTab === 'logs' && <Journal />}
            {activeTab === 'me' && <SubjectProfile playClick={playClick} />}
            {activeTab === 'void' && (
               <section className="min-h-screen flex flex-col justify-center items-center py-20 px-6 text-center">
                 <h2 className="text-8xl md:text-[12rem] text-void-blood font-aksara mb-12 shiver chromatic-text">ꦱꦸꦮꦸꦁ</h2>
                 <p className="font-special text-[16px] tracking-[0.6em] text-gray-600 uppercase italic">The ritual has concluded. Sleep.</p>
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
