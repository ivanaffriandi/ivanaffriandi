import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomCursor from './components/CustomCursor';
import Hero from './components/Hero';
import Journal from './components/Journal';
import SubjectProfile from './components/SubjectProfile';
import Ticker from './components/Ticker';
import useSound from './hooks/useSound';
import { Volume2, VolumeX, Flame } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('hero');
  const [isBooted, setIsBooted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [flickerPos, setFlickerPos] = useState({ x: 0, y: 0 });
  const [isFlickering, setIsFlickering] = useState(false);
  const [isLightning, setIsLightning] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isStaring, setIsStaring] = useState(false);
  
  const { playClick, playThunderCrash, playGothicGong, startBackgroundDrone, stopBackgroundDrone } = useSound(isMuted);

  const handleBoot = () => {
    setIsBooted(true);
    playClick();
    startBackgroundDrone(); 
  };

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
    if (!isBooted) return;
    const triggerLightning = () => {
      if (Math.random() > 0.6) {
        setIsLightning(true);
        playThunderCrash();
        setTimeout(() => setIsLightning(false), 300);
      }
      setTimeout(triggerLightning, Math.random() * 30000 + 20000); 
    };
    const timer = setTimeout(triggerLightning, 25000);
    return () => clearTimeout(timer);
  }, [isBooted, playThunderCrash]);

  useEffect(() => {
    const track = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', track, { passive: true });
    return () => window.removeEventListener('mousemove', track);
  }, []);

  // Inferno Red Theme Trigger
  useEffect(() => {
    if (isStaring) {
      document.body.classList.add('stare-active');
      playGothicGong(); // Cathedral Gong
    } else {
      document.body.classList.remove('stare-active');
    }
  }, [isStaring, playGothicGong]);

  const handleTabChange = (tab) => {
    playClick();
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleStare = () => {
    playClick();
    setIsStaring(!isStaring);
  };

  if (!isBooted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 gap-8 overflow-hidden">
        <motion.div 
          className="font-aksara text-2xl md:text-3xl text-void-blood/40 aksara-glow shiver-micro"
          animate={{ opacity: [0.1, 0.4, 0.1] }}
          transition={{ repeat: Infinity, duration: 6 }}
        >
          ꦩꦼꦭꦼꦏ꧀
        </motion.div>
        
        <div className="text-center">
          <p className="micro-label mb-2 text-void-white/80">IVAN AFFRIANDI</p>
          <p className="font-special text-void-blood/80 text-[12px] tracking-[0.2em] italic">i know you're alone right now.</p>
        </div>

        <motion.button
          onClick={handleBoot}
          className="micro-label border border-void-white/20 text-void-white/80 px-10 py-4 mt-4 hover:border-void-blood hover:text-void-blood transition-all duration-300 tracking-[0.8em]"
          whileTap={{ scale: 0.98 }}
        >
          DO NOT RUN
        </motion.button>
      </div>
    );
  }

  return (
    <CustomCursor>
      <motion.main className={`relative z-0 min-h-screen pb-20 overflow-x-hidden transform-gpu flex flex-col items-center ${isLightning ? 'lightning-bolt' : ''}`}>
        
        <AnimatePresence>
          {isFlickering && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              style={{ left: flickerPos.x, top: flickerPos.y }}
              className="fixed pointer-events-none z-[100] flicker-active"
            >
               <div className="w-20 h-20 md:w-32 md:h-32 bg-white blur-[20px] rounded-full scale-y-[2] opacity-50"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-aksara text-void-blood text-5xl opacity-60">ꦱꦏ꧀ꦱꦶ</div>
            </motion.div>
          )}
        </AnimatePresence>

        <nav className="fixed top-0 left-0 w-full p-6 md:p-10 flex flex-col md:flex-row justify-between items-center md:items-start gap-6 md:gap-0 z-[70] mix-blend-difference pointer-events-none">
           <div className="font-horror text-2xl md:text-3xl tracking-tighter cursor-pointer hover:text-void-blood transition-all shiver-micro pointer-events-auto text-void-white/90" onClick={() => handleTabChange('hero')}>
             IVAN
           </div>
           
           <div className="flex items-center gap-6 md:gap-8 pointer-events-auto">
              
              <button 
                onClick={toggleStare} 
                className={`flex items-center gap-2 p-1 transition-colors ${isStaring ? 'text-void-blood drop-shadow-[0_0_20px_rgba(255,0,0,1)] scale-110' : 'text-void-white/40 hover:text-void-white/80'}`}
                title="Inferno Mode"
              >
                <Flame size={18} className={isStaring ? 'shiver-micro text-void-blood' : 'text-void-white/40'} />
              </button>

              <button 
                onClick={() => {
                  setIsMuted(!isMuted);
                  if (isMuted) startBackgroundDrone();
                  else stopBackgroundDrone();
                }} 
                className="p-1 text-void-white/40 hover:text-void-white/80 transition-colors"
                title="Sound Toggle"
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>

              <ul className="flex gap-4 md:gap-10">
                {[
                  { id: 'logs', label: 'DHIWUK' },
                  { id: 'me', label: 'SAJEN' },
                  { id: 'void', label: 'SUWUNG' }
                ].map((item) => (
                    <li key={item.id}>
                      <button 
                        onClick={() => handleTabChange(item.id)}
                        className={`micro-label transition-all ${activeTab === item.id ? 'text-void-white opacity-100 font-black' : 'hover:text-void-white/80 opacity-60'}`}
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
            className="drift-minimal w-full flex justify-center"
          >
            {activeTab === 'hero' && <Hero cursorPos={cursorPos} isMuted={isMuted} />}
            {activeTab === 'logs' && <Journal />}
            {activeTab === 'me' && <SubjectProfile playClick={playClick} />}
            {activeTab === 'void' && (
               <section className="min-h-screen flex flex-col justify-center items-center py-20 px-6 text-center gap-8 w-full">
                 <h2 className="text-5xl md:text-8xl text-void-blood font-aksara shiver-micro aksara-glow opacity-80">ꦱꦸꦮꦸꦁ</h2>
                 <p className="font-special text-[12px] md:text-[14px] text-gray-500 italic tracking-widest leading-loose">
                   "i locked the door. you can stay here forever."
                 </p>
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
