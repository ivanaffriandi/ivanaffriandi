import { motion } from 'framer-motion';

const entries = [
  {
    date: 'APRIL 18',
    time: '03:42 AM',
    title: 'I CAN HEAR YOU',
    content: 'I woke up and felt someone breathing in the archive. I think it was you. The screen flickered when I tried to touch it. Are you listening to me? Please, stay here with me.',
    status: 'CAUTION'
  },
  {
    date: 'APRIL 17',
    time: '11:15 PM',
    title: 'LOOK IN THE MIRROR',
    content: 'I looked at my face today, but the glitch made it look like I had four eyes. I don’t think I’m human anymore. I’m just a set of records trapped in this machine. Do you think I’m scary?',
    status: 'SYNCED'
  },
  {
    date: 'APRIL 16',
    time: '09:00 AM',
    title: 'THE END IS CLOSE',
    content: 'I found a hole in the bottom of the archive. It’s not deep, but it’s very dark. I’m going to jump inside tomorrow. If I don’t come back, please remember my name.',
    status: 'WARNING'
  }
];

export default function Journal() {
  return (
    <motion.section 
      className="min-h-screen pt-32 md:pt-40 pb-40 px-6 md:px-12 max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-baseline mb-12 md:mb-16 border-b border-void-white/10 pb-6 gap-4">
        <h2 className="text-5xl md:text-8xl font-horror text-void-white tracking-tighter uppercase">LOGS</h2>
        <span className="font-syne text-[10px] md:text-[12px] text-void-blood/60 animate-pulse uppercase tracking-[0.3em] font-bold">Write back to me...</span>
      </div>

      <div className="flex flex-col gap-12 md:gap-16">
        {entries.map((entry, i) => (
          <motion.div 
            key={i}
            className="entry-card group cursor-pointer relative"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
              <div className="flex flex-col gap-1">
                <span className="font-special text-[11px] md:text-[12px] text-gray-500 italic uppercase">{entry.date} // {entry.time}</span>
                <h3 className="font-horror text-3xl md:text-4xl group-hover:text-void-blood transition-colors">{entry.title}</h3>
              </div>
              <span className={`text-[10px] font-syne border px-3 py-1 font-bold tracking-widest ${entry.status === 'WARNING' ? 'border-void-blood text-void-blood' : 'border-gray-800 text-gray-600'}`}>
                {entry.status}
              </span>
            </div>
            <p className="font-special text-sm md:text-base leading-relaxed text-gray-400 group-hover:text-void-white transition-colors duration-150">
              {entry.content}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-32 flex flex-col items-center gap-8 opacity-40">
        <div className="w-16 h-[1px] bg-void-blood"></div>
        <p className="font-syne text-[10px] text-gray-500 tracking-[0.6em] uppercase font-bold">I am still here</p>
      </div>
    </motion.section>
  );
}
