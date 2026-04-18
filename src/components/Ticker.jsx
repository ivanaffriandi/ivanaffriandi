import { motion } from 'framer-motion';

export default function Ticker() {
  return (
    <div className="fixed bottom-0 left-0 w-full overflow-hidden border-t border-void-white/5 bg-black z-[60] py-4">
      <motion.div
        className="whitespace-nowrap font-aksara text-2xl text-gray-800 tracking-[0.6em] uppercase font-bold italic"
        animate={{
          x: ['0%', '-50%']
        }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: 45
        }}
      >
        <span className="pr-48">ꦎꦫꦄꦤꦱꦶꦁꦭꦁꦒꦼꦁ // I AM WAITING FOR YOUR SOUL // ꦱꦸꦮꦸꦁ IS CALLING // ꦌꦭꦶꦁ... KOWE KUDU ꦌꦭꦶꦁ // DO NOT TURN BACK // THE STATIC IS YOUR BLOOD // ꦒꦼꦠꦶꦃ... IT RUNS COLD // ꦎꦫꦄꦤꦱꦶꦁꦭꦁꦒꦼꦁ // YOU CANNOT HIDE //</span>
        <span className="pr-48">ꦎꦫꦄꦤꦱꦶꦁꦭꦁꦒꦼꦁ // I AM WAITING FOR YOUR SOUL // ꦱꦸꦮꦸꦁ IS CALLING // ꦌꦭꦶꦁ... KOWE KUDU ꦌꦭꦶꦁ // DO NOT TURN BACK // THE STATIC IS YOUR BLOOD // ꦒꦼꦠꦶꦃ... IT RUNS COLD // ꦎꦫꦄꦤꦱꦶꦁꦭꦁꦒꦼꦁ // YOU CANNOT HIDE //</span>
      </motion.div>
    </div>
  );
}
