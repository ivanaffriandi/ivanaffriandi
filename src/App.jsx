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
  const [flickerPos, setFlickerPos] = useState({ x: 0, y: 0 });
  const [isFlickering, setIsFlickering] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const { playClick, playStatic } = useSound(isMuted);

  // Subliminal Flicker Engine (Peripheral Jumpscares)
  useEffect(() => {
    if (!isBooted) return;
    const triggerFlicker = () => {
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      setFlickerPos({ x, y });
      setIsFlickering(true);
      setTimeout(() => setIsFlickering(false), 80);
      setTimeout(triggerFlicker, Math.random() * 20000 + 10000);
    };
    const timer = setTimeout(triggerFlicker, 15000);
    return () => clearTimeout(timer);
  }, [isBooted]);

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
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 gap-12 overflow-hidden">
        <motion.div 
          className="font-aksara text-2xl text-void-blood/20 aksara-glow shiver-micro"
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ repeat: Infinity, duration: 8 }}
        >
          ꦩꦼꦭꦼꦏ꧀
        </motion.div>
        
        <div className="text-center">
          <p className="micro-label mb-2">IVAN AFFRIANDI</p>
          <p className="font-special text-void-blood/60 text-[10px] tracking-[0.4em] italic uppercase">The ritual of witnessing.</p>
        </div>

        <motion.button
          onClick={() => { setIsBooted(true); playClick(); }}
          className="micro-label border border-void-white/10 px-12 py-4 hover:border-void-blood hover:text-void-blood transition-all duration-300 tracking-[1em]"
          whileTap={{ scale: 0.98 }}
        >
          AWAKEN
        </motion.button>
      </div>
    );
  }

  return (
    <CustomCursor>
      <motion.main className="relative text-void-white z-0 min-h-screen pb-20 overflow-x-hidden transform-gpu flex flex-col items-center">
        
        {/* SUBLIMINAL FLICKER */}
        <AnimatePresence>
          {isFlickering && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              exit={{ opacity: 0 }}
              style={{ left: flickerPos.x, top: flickerPos.y }}
              className="fixed pointer-events-none z-[100] flicker-active"
            >
               <div className="w-16 h-16 md:w-32 md:h-32 bg-white blur-[30px] rounded-full scale-y-150 opacity-40"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-aksara text-void-blood text-4xl opacity-40">ꦱꦏ꧀ꦱꦶ</div>
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="fixed top-0 left-0 w-full p-8 md:p-12 flex justify-between items-center z-[70] mix-blend-difference pointer-events-none">
           <div className="font-horror text-2xl md:text-3xl tracking-tighter cursor-pointer hover:text-void-blood transition-all shiver-micro pointer-events-auto" onClick={() => handleTabChange('hero')}>
             IVAN
           </div>
           
           <div className="flex items-center gap-8 pointer-events-auto">
              <button onClick={() => setIsMuted(!isMuted)} className="p-1 text-void-white/20 hover:text-void-blood">
                {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
              </button>

              <ul className="flex gap-6 md:gap-10">
                {[
                  { id: 'logs', label: 'DHIWUK' },
                  { id: 'me', label: 'SAJEN' },
                  { id: 'void', label: 'SUWUNG' }
                ].map((item) => (
                    <li key={item.id}>
                      <button 
                        onClick={() => handleTabChange(item.id)}
                        className={`micro-label transition-all ${activeTab === item.id ? 'text-void-blood' : 'hover:text-void-white'}`}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="drift-minimal w-full"
          >
            {activeTab === 'hero' && <Hero cursorPos={cursorPos} isMuted={isMuted} playStatic={playStatic} />}
            {activeTab === 'logs' && <Journal />}
            {activeTab === 'me' && <SubjectProfile playClick={playClick} />}
            {activeTab === 'void' && (
               <section className="min-h-screen flex flex-col justify-center items-center py-20 px-6 text-center gap-8">
                 <h2 className="text-4xl md:text-6xl text-void-blood font-aksara shiver-micro aksara-glow opacity-30">ꦱꦸꦮꦸꦁ</h2>
                 <p className="micro-label tracking-[0.8em] text-gray-700 italic">The breathing has stopped.</p>
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
