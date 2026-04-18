import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const entries = [
  {
    date: 'APRIL 18',
    time: 'ꦱꦼꦮꦼꦔꦶ',
    title: 'THE BREATHING',
    content: 'The archive exhaled today. I felt it on the back of my neck. ꦌꦭꦶꦁ... you are not the first to look.',
    status: 'ꦥꦱ꧀ꦠꦶ'
  },
  {
    date: 'APRIL 17',
    time: 'ꦠꦼꦔꦃꦮꦼꦔꦶ',
    title: 'THE MIRROR',
    content: 'I reached into the static and something held my hand. ꦱꦸꦏ꧀ꦩ... my soul is a choir of screaming shadows.',
    status: 'ꦕꦶꦭꦏ'
  },
  {
    date: 'APRIL 16',
    time: 'ꦌꦱꦸꦏ꧀ꦄꦮꦤ꧀',
    title: 'THE HOLE',
    content: 'The emptiness is growing teeth. ꦱꦸꦮꦸꦁ... it is hungry.',
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
      className="min-h-screen pt-28 md:pt-48 pb-40 px-6 md:px-12 max-w-5xl mx-auto"
    >
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="searchlight-applied flex flex-col md:flex-row justify-between items-start md:items-baseline mb-12 md:mb-24 border-b border-void-white/5 pb-8 md:pb-16 p-6 md:p-12 cursor-crosshair group"
      >
        <div className="flex flex-col">
          <h2 className="text-6xl md:text-[12rem] font-horror text-void-white tracking-tighter uppercase relative z-20 group-hover:text-void-blood transition-all shiver chromatic-text">DHIWUK</h2>
          <span className="font-aksara text-xl md:text-3xl text-void-blood/40 mt-1 md:mt-2">ꦱꦏ꧀ꦱꦶ</span>
        </div>
        <span className="font-syne text-[10px] md:text-[14px] text-gray-700 uppercase tracking-[0.4em] md:tracking-[0.6em] font-bold z-20 italic mt-4 md:mt-0">Whispering Spirits</span>
      </div>

      <div className="flex flex-col gap-12 md:gap-32">
        {entries.map((entry, i) => (
          <motion.div 
            key={i}
            className="group cursor-pointer relative border-l border-void-white/5 pl-6 md:pl-16 py-4 md:py-6"
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 md:mb-10 gap-4 md:gap-8">
              <div className="flex flex-col gap-1 md:gap-3">
                <span className="font-aksara text-sm md:text-xl text-void-blood/50 italic uppercase tracking-widest">{entry.date} // {entry.time}</span>
                <h3 className="font-horror text-3xl md:text-7xl group-hover:text-void-blood transition-all group-hover:shiver">
                  {entry.title}
                </h3>
              </div>
              <span className={`text-sm md:text-xl font-aksara border border-void-white/5 px-4 md:px-6 py-1 md:py-2 group-hover:border-void-blood/40 group-hover:text-void-blood transition-all`}>
                {entry.status}
              </span>
            </div>
            <p className="font-special text-sm md:text-xl leading-[1.8] md:leading-[2] text-gray-500 group-hover:text-void-white transition-colors duration-500 max-w-3xl">
              {entry.content}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 md:mt-48 flex flex-col items-center gap-8 md:gap-12 opacity-15">
        <div className="w-16 md:w-32 h-[1px] bg-void-blood"></div>
        <p className="font-aksara text-xl md:text-3xl text-gray-600 tracking-[0.6em] md:tracking-[1em] uppercase italic shiver">ꦌꦭꦶꦁ</p>
      </div>
    </motion.section>
  );
}
