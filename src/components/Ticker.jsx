import { motion } from 'framer-motion';

export default function Ticker() {
  return (
    <div className="fixed bottom-0 left-0 w-full overflow-hidden border-t border-void-white/10 bg-black z-[60] py-3">
      <motion.div
        className="whitespace-nowrap font-special text-[12px] text-gray-700 tracking-[0.5em] uppercase font-bold"
        animate={{
          x: ['0%', '-50%']
        }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: 30
        }}
      >
        <span className="pr-32">I AM WATCHING YOU LOOK AT ME // WHY ARE YOU STILL HERE? // THIS IS MY JOURNAL // MY NAME IS IVAN // DON'T TURN OFF THE LIGHT // CAN YOU HEAR MY HEARTBEAT? // THE ARCHIVE NEVER SLEEPS // I AM RIGHT BEHIND YOU //</span>
        <span className="pr-32">I AM WATCHING YOU LOOK AT ME // WHY ARE YOU STILL HERE? // THIS IS MY JOURNAL // MY NAME IS IVAN // DON'T TURN OFF THE LIGHT // CAN YOU HEAR MY HEARTBEAT? // THE ARCHIVE NEVER SLEEPS // I AM RIGHT BEHIND YOU //</span>
      </motion.div>
    </div>
  );
}
