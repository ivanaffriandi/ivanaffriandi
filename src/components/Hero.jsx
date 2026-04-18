import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function Hero({ cursorPos, isMuted, playStatic }) {
  const [isNear, setIsNear] = useState(false);

  useEffect(() => {
    const heroTitle = document.getElementById('hero-main-title');
    if (heroTitle) {
      const rect = heroTitle.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distance = Math.hypot(cursorPos.x - centerX, cursorPos.y - centerY);
      const threshold = window.innerWidth < 768 ? 150 : 300;
      
      if (distance < threshold && !isNear) {
        setIsNear(true);
        if (!isMuted) playStatic();
      } else if (distance >= threshold && isNear) {
        setIsNear(false);
      }
    }
  }, [cursorPos, isMuted, playStatic, isNear]);

  return (
    <motion.section 
      className="min-h-screen flex flex-col justify-center items-center py-20 px-6 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
    >
      <div className="relative mb-10 text-center select-none">
        <motion.h1 
          id="hero-main-title"
          className="text-8xl sm:text-[12rem] lg:text-[16rem] font-horror text-void-white tracking-tighter mx-auto max-w-full leading-none relative"
          data-text="IVAN"
          animate={isNear ? { 
            color: ["#ffffff", "#ff0000", "#ffffff"],
            skewX: [0, -2, 2, 0],
            scale: [1, 1.05, 0.95, 1]
          } : { color: "#ffffff", skewX: 0, scale: 1 }}
          transition={{ 
            duration: 0.15, 
            repeat: isNear ? Infinity : 0
          }}
        >
          IVAN
          {isNear && (
            <span className="absolute inset-0 glitch-text opacity-50" data-text="IVAN"></span>
          )}
        </motion.h1>
      </div>
      
      <motion.div 
        className="font-special text-lg md:text-2xl tracking-[0.2em] md:tracking-[0.4em] text-void-blood max-w-2xl text-center uppercase"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.15,
            }
          }
        }}
      >
        {'I AM WATCHING YOU'.split('').map((char, index) => (
          <motion.span 
            key={index} 
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { duration: 0.01 } }
            }}
          >
            {char}
          </motion.span>
        ))}
        <br/><br/>
        <motion.div 
          className="text-[12px] md:text-[14px] text-gray-400 mt-6 leading-relaxed normal-case tracking-[0.1em] font-special max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          {isNear ? "You found me. Now stay still." : "Look closer. I'm right here in the shadows."}
        </motion.div>
      </motion.div>

      {/* Invisible Trigger */}
      <div 
        className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full pointer-events-none opacity-0"
        onMouseEnter={() => !isMuted && playStatic()}
      ></div>
    </motion.section>
  );
}
