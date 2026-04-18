import { motion } from 'framer-motion';

export default function Ticker() {
  return (
    <div className="fixed bottom-0 left-0 w-full overflow-hidden border-t border-void-white/5 bg-black z-[60] py-4">
      <motion.div
        className="whitespace-nowrap font-special text-[13px] text-gray-800 tracking-[0.6em] uppercase font-bold italic"
        animate={{
          x: ['0%', '-50%']
        }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: 35
        }}
      >
        <span className="pr-48">ORA ANA SING LANGGENG // I AM WAITING FOR YOUR SOUL // SUWUNG IS CALLING // ELING KOWE KUDU ELING // DO NOT TURN BACK // THE STATIC IS YOUR BLOOD // GETIH... IT RUNS COLD // ORA BISA MLAYU // YOU CANNOT HIDE //</span>
        <span className="pr-48">ORA ANA SING LANGGENG // I AM WAITING FOR YOUR SOUL // SUWUNG IS CALLING // ELING KOWE KUDU ELING // DO NOT TURN BACK // THE STATIC IS YOUR BLOOD // GETIH... IT RUNS COLD // ORA BISA MLAYU // YOU CANNOT HIDE //</span>
      </motion.div>
    </div>
  );
}
