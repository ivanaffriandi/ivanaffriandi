import { motion } from 'framer-motion';

export default function Ticker() {
  return (
    <div className="fixed bottom-0 left-0 w-full overflow-hidden border-t border-void-white/10 bg-[#0d0000] z-[60] py-4">
      <motion.div
        className="whitespace-nowrap font-aksara text-lg md:text-2xl text-void-blood/80 tracking-[0.6em] uppercase font-bold italic shiver-micro"
        animate={{
          x: ['0%', '-50%']
        }}
        transition={{
          repeat: Infinity,
          ease: 'linear',
          duration: 40
        }}
      >
        <span className="pr-48">ꦎꦫꦄꦤꦱꦶꦁꦭꦁꦒꦼꦁ // i see your screen glowing in the dark // ꦱꦸꦮꦸꦁ IS CALLING // ꦌꦭꦶꦁ... do not blink // DO NOT TURN AROUND // THE STATIC IS BREATHING // ꦒꦼꦠꦶꦃ... IT RUNS COLD // ꦎꦫꦄꦤꦱꦶꦁꦭꦁꦒꦼꦁ // you cannot hide //</span>
        <span className="pr-48">ꦎꦫꦄꦤꦱꦶꦁꦭꦁꦒꦼꦁ // i see your screen glowing in the dark // ꦱꦸꦮꦸꦁ IS CALLING // ꦌꦭꦶꦁ... do not blink // DO NOT TURN AROUND // THE STATIC IS BREATHING // ꦒꦼꦠꦶꦃ... IT RUNS COLD // ꦎꦫꦄꦤꦱꦶꦁꦭꦁꦒꦼꦁ // you cannot hide //</span>
      </motion.div>
    </div>
  );
}
