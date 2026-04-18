import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const entries = [
  {
    date: 'APRIL 18',
    time: 'SEWENGI',
    title: 'THE BREATHING',
    content: 'I woke up and felt someone breathing in the archive. I think it was you. Are you listening to me? Eling... kowe kudu eling.',
    status: 'PASTI'
  },
  {
    date: 'APRIL 17',
    time: 'TENGAH WENGI',
    title: 'THE MIRROR',
    content: 'I looked at my face today, but the glitch made it look like I had four eyes. I don’t think I’m human anymore. My soul—my sukma—is splitting.',
    status: 'CILAKA'
  },
  {
    date: 'APRIL 16',
    time: 'ESUK AWAN',
    title: 'THE HOLE',
    content: 'I found a hole in the bottom of the void. It’s not deep, but it’s very dark. I’m going inside. Don’t look for me. Suwung takes everything.',
    status: 'MATI'
  }
];

export default function Journal() {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.setProperty('--lx', `${mousePos.x}px`);
      containerRef.current.style.setProperty('--ly', `${mousePos.y}px`);
    }
  }, [mousePos]);

  return (
    <motion.section 
      className="min-h-screen pt-32 md:pt-40 pb-40 px-6 md:px-12 max-w-4xl mx-auto"
    >
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="searchlight-applied flex flex-col md:flex-row justify-between items-start md:items-baseline mb-20 border-b border-void-white/10 pb-12 p-12 cursor-crosshair group"
      >
        <h2 className="text-7xl md:text-[10rem] font-horror text-void-white tracking-tighter uppercase relative z-20 group-hover:text-void-blood transition-all">SAKSI</h2>
        <span className="font-syne text-[12px] md:text-[14px] text-gray-700 uppercase tracking-[0.4em] font-bold z-20">The Witness</span>
      </div>

      <div className="flex flex-col gap-16 md:gap-24">
        {entries.map((entry, i) => (
          <motion.div 
            key={i}
            className="group cursor-pointer relative border-l border-void-white/10 pl-8 md:pl-12 py-4"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
              <div className="flex flex-col gap-2">
                <span className="font-special text-[12px] text-void-blood/60 italic uppercase tracking-widest">{entry.date} // {entry.time}</span>
                <h3 className="font-horror text-4xl md:text-6xl group-hover:text-void-blood transition-colors underline-offset-8 group-hover:underline">
                  {entry.title}
                </h3>
              </div>
              <span className={`text-[11px] font-syne border border-void-white/10 px-4 py-1 font-bold tracking-[0.2em] group-hover:border-void-blood group-hover:text-void-blood transition-all uppercase`}>
                {entry.status}
              </span>
            </div>
            <p className="font-special text-base md:text-lg leading-[1.8] text-gray-500 group-hover:text-void-white transition-colors duration-300 max-w-2xl">
              {entry.content}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-40 flex flex-col items-center gap-10 opacity-20">
        <div className="w-24 h-[1px] bg-void-blood"></div>
        <p className="font-syne text-[11px] text-gray-600 tracking-[0.8em] uppercase font-bold italic">Kowe ora dewekan</p>
      </div>
    </motion.section>
  );
}
