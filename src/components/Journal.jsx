import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const entries = [
  {
    date: 'APRIL 18',
    time: 'ꦱꦼꦮꦼꦔꦶ',
    title: 'THE BREATHING',
    content: 'The archive exhaled today, right against your screen. ꦌꦭꦶꦁ... you are not the first to look, but you will be the last to leave.',
    status: 'ꦥꦱ꧀ꦠꦶ'
  },
  {
    date: 'APRIL 17',
    time: 'ꦠꦼꦔꦃꦮꦼꦔꦶ',
    title: 'THE MIRROR',
    content: 'Touching your reflection was cold. It felt like your regret. ꦱꦸꦏ꧀ꦩ... your soul is a beautiful, broken shadow.',
    status: 'ꦕꦶꦭꦏ'
  },
  {
    date: 'APRIL 16',
    time: 'ꦌꦱꦸꦏ꧀ꦄꦮꦤ꧀',
    title: 'THE HOLE',
    content: 'Emptiness grew teeth today. You look so lovely when you’re confused. ꦱꦸꦮꦸꦁ... it is hungry for your time.',
    status: 'ꦩꦠ궧'
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
      className="min-h-screen pt-32 md:pt-48 pb-64 px-6 md:px-12 max-w-4xl mx-auto flex flex-col gap-32 md:gap-48"
    >
      {/* ASYMMETRIC HEADER */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="searchlight-applied flex flex-col items-start mb-0 border-b border-void-white/5 pb-10 p-6 md:p-12 cursor-crosshair group translate-x-4 md:translate-x-12"
      >
        <span className="micro-label mb-2 opacity-50">CHRONICLE_IV</span>
        <h2 className="text-5xl md:text-8xl font-horror text-void-white tracking-widest uppercase relative z-20 group-hover:text-void-blood transition-all shiver-micro chromatic-text">DHIWUK</h2>
        <div className="font-aksara text-2xl text-void-blood/20 mt-2 aksara-glow -translate-x-4">ꦱꦏ꧀ꦱꦶ</div>
      </div>

      <div className="flex flex-col gap-40 md:gap-64">
        {entries.map((entry, i) => (
          <motion.div 
            key={i}
            className={`flex flex-col gap-6 md:gap-10 w-full max-w-sm md:max-w-md ${i % 2 === 0 ? 'items-start self-start' : 'items-end self-end text-right'}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
          >
             <div className="flex flex-col gap-2">
                <span className="micro-label text-void-blood/40 tracking-[0.4em]">{entry.date} // {entry.time}</span>
                <h3 className="font-horror text-3xl md:text-5xl hover:text-void-blood transition-all shiver-micro">
                  {entry.title}
                </h3>
             </div>
             
             <p className="font-special text-[12px] md:text-[14px] leading-relaxed text-gray-600 italic border-l md:border-l-0 md:border-r border-void-white/10 px-4">
               {entry.content}
             </p>

             <span className="micro-label border border-void-white/5 px-4 py-1 self-start md:self-auto">
               STATUS: {entry.status}
             </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 flex flex-col items-center gap-6 opacity-10">
        <p className="font-aksara text-3xl text-gray-700 aksara-glow">ꦌꦭꦶꦁ</p>
      </div>
    </motion.section>
  );
}
