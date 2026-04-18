import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const entries = [
  {
    date: 'APRIL 18',
    time: 'ꦱꦼꦮꦼꦔꦶ',
    title: 'THE BREATHING',
    content: 'i was watching you read the other page. your eyes moved so fast. ꦌꦭꦶꦁ... you are not the first to look, but you will be the last to leave.',
    status: 'ꦥꦱ꧀ꦠꦶ'
  },
  {
    date: 'APRIL 17',
    time: 'ꦠꦼꦔꦃꦮꦼꦔꦶ',
    title: 'THE MIRROR',
    content: 'touching your reflection through the screen was cold. it felt exactly like your quiet panic. ꦱꦸꦏ꧀ꦩ... don\'t turn around just yet.',
    status: 'ꦕꦶꦭꦏ'
  },
  {
    date: 'APRIL 16',
    time: 'ꦌꦱꦸꦏ꧀ꦄꦮꦤ꧀',
    title: 'THE HOLE',
    content: 'the emptiness is growing teeth today. you look so lovely when you’re confused. ꦱꦸꦮꦸꦁ... it is extremely hungry for your time.',
    status: 'ꦩꦠ궧'
  }
];

export default function Journal() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePos({
      x: e.clientX,
      y: e.clientY
    });
  };

  return (
    <motion.section 
      onMouseMove={handleMouseMove}
      className="min-h-screen pt-32 pb-48 px-6 md:px-12 max-w-5xl mx-auto flex flex-col items-center drift-ui"
    >
      {/* HEADER SECTION with reduced gap and filled space */}
      <div className="w-full flex flex-col md:flex-row items-center md:items-end justify-between border-b border-void-white/10 pb-8 mb-16 gap-8">
        <div className="flex flex-col items-center md:items-start group cursor-crosshair">
          <h2 className="text-6xl md:text-9xl font-horror text-gray-200 tracking-widest uppercase relative z-20 group-hover:text-void-blood transition-all shiver-micro chromatic-text text-center md:text-left">DHIWUK</h2>
          <div className="font-aksara text-3xl text-void-blood/50 mt-1 aksara-glow">ꦱꦏ꧀ꦱꦶ</div>
        </div>
        
        <div className="flex flex-col items-center md:items-end max-w-[280px] md:max-w-sm text-center md:text-right gap-4">
          <span className="font-syne text-[11px] text-gray-400 uppercase tracking-[0.6em] font-bold italic">Whispering Spirits</span>
          <p className="font-special text-[13px] text-void-blood/80 italic leading-relaxed">
            "i collect these moments. the way your pulse jumps when the light flickers. read them slowly for me."
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-24 md:gap-40 w-full">
        {entries.map((entry, i) => (
          <motion.div 
            key={i}
            className={`flex flex-col gap-6 md:gap-8 w-full max-w-sm md:max-w-xl ${i % 2 === 0 ? 'items-start self-start text-left' : 'items-end self-end text-right'}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ delay: i * 0.15 }}
          >
             <div className="flex flex-col gap-2 w-full">
                <span className="micro-label tracking-[0.4em] justify-start text-justify"><span className="text-void-blood/60 aksara-glow">{entry.date} // </span>{entry.time}</span>
                <h3 className="font-horror text-4xl md:text-6xl text-gray-200 hover:text-void-blood transition-all shiver-micro">
                  {entry.title}
                </h3>
             </div>
             
             <p className={`font-special text-[14px] md:text-[16px] leading-[1.8] text-gray-400 border-void-white/20 ${i % 2 === 0 ? 'border-l pl-5' : 'border-r pr-5'}`}>
               {entry.content}
             </p>

             <span className="font-syne text-[10px] font-bold tracking-[0.4em] uppercase border border-void-white/10 px-4 py-2 text-void-blood/80">
               {entry.status}
             </span>
          </motion.div>
        ))}
      </div>

    </motion.section>
  );
}
