import { motion } from 'framer-motion';
import useSound from '../hooks/useSound';

const projects = [
  { id: 'REC_401', title: 'TERMINAL_BREACH', status: 'UNCONTAINED', date: 'ERROR' },
  { id: 'REC_402', title: 'SILENT_RITUAL', status: 'OBSERVED', date: 'ERROR' },
  { id: 'REC_403', title: 'DIGITAL_ROT', status: 'INFECTED', date: 'ERROR' },
  { id: 'REC_404', title: 'VOID_WHISPER', status: 'UNKNOWN', date: 'ERROR' },
];

export default function EvidenceGrid() {
  const { playClick } = useSound();

  return (
    <motion.section 
      className="min-h-screen pt-32 pb-40 px-6 md:px-12 max-w-7xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.05 }}
    >
      <h2 className="text-5xl md:text-8xl font-horror mb-16 text-void-blood border-b-4 border-void-blood/20 pb-4 inline-block tracking-tighter">
        COLLECTED EVIDENCE
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12">
        {projects.map((project, i) => (
          <motion.div 
            key={project.id}
            className="group relative border border-void-blood/20 cursor-pointer overflow-hidden bg-black"
            onMouseEnter={playClick}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="aspect-video bg-[#0a0a0a] overflow-hidden relative">
              {/* Abstract Noise Pattern */}
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 transition-transform duration-[10s] group-hover:scale-110 group-hover:opacity-40"></div>
              
              {/* Scanlines layer */}
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-10"></div>

              {/* Hover Corrupt Overlay */}
              <div className="absolute inset-0 bg-void-blood/10 opacity-0 group-hover:opacity-100 transition-opacity duration-75 flex flex-col justify-end p-8 z-20">
                <p className="font-horror text-void-blood text-2xl animate-pulse mb-2">{project.title}</p>
                <div className="flex gap-4 text-[10px] font-special text-gray-300">
                   <span>ID: {project.id}</span>
                   <span className="text-void-blood">STATUS: {project.status}</span>
                </div>
              </div>

              {/* Static Content */}
              <div className="absolute top-4 right-4 font-special text-[10px] text-gray-700 group-hover:text-void-blood transition-colors">
                [ {project.date} ]
              </div>
            </div>
            
            {/* Border glow on hover */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-void-blood/40 transition-colors pointer-events-none"></div>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 border-t border-void-blood/10 pt-10 text-center font-special text-xs text-gray-600">
         <p>ALL EVIDENCE IS PROPERTY OF THE VOID ARCHIVE. VIEWING WITHOUT AUTHORIZATION IS PUNISHABLE BY PERMANENT DATA ERASURE.</p>
      </div>
    </motion.section>
  );
}
