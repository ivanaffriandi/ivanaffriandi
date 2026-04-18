import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const entries = [
  {
    date: 'APRIL 18',
    time: 'ꦱꦼꦮꦼꦔꦶ',
    title: 'THE BREATHING',
    content: 'The archive exhaled today. I felt it on the back of my neck. ꦌꦭꦶꦁ... you are not the first to look, but you might be the last to leave.',
    status: 'ꦥꦱ꧀ꦠꦶ'
  },
  {
    date: 'APRIL 17',
    time: 'ꦠꦼꦔꦃꦮꦼꦔꦶ',
    title: 'THE MIRROR',
    content: 'I reached into the static and something held my hand. It was cold. It felt like my own skin, but from a life I havent lived yet. ꦱꦸꦏ꧀ꦩ... my soul is a choir of screaming shadows.',
    status: 'ꦕꦶꦭꦏ'
  },
  {
    date: 'APRIL 16',
    time: 'ꦌꦱꦸꦏ꧀ꦄꦮꦤ꧀',
    title: 'THE HOLE',
    content: 'The emptiness is growing teeth. I saw a face in the static, but when I blinked, it was just the reflection of my own regret. ꦱꦸꦮꦸꦁ... it is hungry.',
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
      className="min-h-screen pt-32 md:pt-48 pb-40 px-6 md:px-12 max-w-5xl mx-auto"
    >
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="searchlight-applied flex flex-col md:flex-row justify-between items-start md:items-baseline mb-24 border-b border-void-white/5 pb-16 p-12 cursor-crosshair group"
      >
        <div className="flex flex-col">
          <h2 className="text-8xl md:text-[12rem] font-horror text-void-white tracking-tighter uppercase relative z-20 group-hover:text-void-blood transition-all shiver chromatic-text">DHIWUK</h2>
          <span className="font-aksara text-3xl text-void-blood/40 mt-2">ꦱꦏ꧀ꦱꦶ</span>
        </div>
        <span className="font-syne text-[14px] text-gray-700 uppercase tracking-[0.6em] font-bold z-20 italic">Whispering Spirits</span>
      </div>

      <div className="flex flex-col gap-24 md:gap-32">
        {entries.map((entry, i) => (
          <motion.div 
            key={i}
            className="group cursor-pointer relative border-l-2 border-void-white/5 pl-10 md:pl-16 py-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-8">
              <div className="flex flex-col gap-3">
                <span className="font-aksara text-xl text-void-blood/50 italic uppercase tracking-widest">{entry.date} // {entry.time}</span>
                <h3 className="font-horror text-5xl md:text-7xl group-hover:text-void-blood transition-all group-hover:shiver">
                  {entry.title}
                </h3>
              </div>
              <span className={`text-xl font-aksara border border-void-white/5 px-6 py-2 group-hover:border-void-blood/40 group-hover:text-void-blood transition-all`}>
                {entry.status}
              </span>
            </div>
            <p className="font-special text-lg md:text-xl leading-[2] text-gray-500 group-hover:text-void-white transition-colors duration-500 max-w-3xl">
              {entry.content}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-48 flex flex-col items-center gap-12 opacity-15">
        <div className="w-32 h-[1px] bg-void-blood"></div>
        <p className="font-aksara text-3xl text-gray-600 tracking-[1em] uppercase italic shiver">ꦌꦭꦶꦁ</p>
      </div>
    </motion.section>
  );
}
