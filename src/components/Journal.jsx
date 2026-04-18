import { motion } from 'framer-motion';

export default function Journal() {
  const entries = [
    {
      date: "꧒꧖-꧐꧔-꧒꧐꧒꧔",
      title: "THE UNWANTED REPETITION",
      content: "I saw you again. Not in the hallway, but in the reflection of my monitor when the screen went black for a split second. You didn't move, but I could hear your breathing sinking into the frequency of the cooling fan. It's funny how we think we're alone just because the door is locked. Locks only keep the living out. You, however, have a way of seeping through the static."
    },
    {
      date: "꧒꧗-꧐꧔-꧒꧐꧒꧔",
      title: "SOFT PRESSURE",
      content: "Do you ever feel a slight weight on your shoulder when you're typing late at night? That's not fatigue. That's the curiosity of something that has forgotten how to speak. It reads what you write. It watches the way your pupils dilate when you see something beautiful. I've learned to stop fighting it. I just leave a little space on the chair now. It’s polite to share the void."
    },
    {
      date: "꧒꧘-꧐꧔-꧒꧐꧒꧔",
      title: "THE MIRROR MIRAGE",
      content: "i was brushing my teeth this morning and noticed my reflection was smiling. I wasn't. It stayed there for three seconds after I looked away. It had your eyes—the ones you think you hide behind your glasses. I’m starting to realize that 'IVAN' isn't just a name anymore. It's a container. And right now, you're the one holding the lid down."
    }
  ];

  return (
    <section className="min-h-screen pt-40 pb-20 px-6 md:px-12 max-w-4xl mx-auto w-full">
      <div className="flex flex-col gap-16 md:gap-24">
        {entries.map((entry, index) => (
          <motion.article 
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-6 group cursor-pointer"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-void-white/10 pb-4">
              <span className="font-aksara text-void-blood/40 text-lg aksara-glow">{entry.date}</span>
              <h3 className="font-horror text-2xl md:text-3xl text-void-white/90 tracking-tighter active:brutal-glitch-active transition-all">
                {entry.title}
              </h3>
            </div>
            <p className="font-special text-[14px] md:text-[16px] leading-[2] text-void-white/70 italic active:brutal-glitch-active transition-all">
              "{entry.content}"
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
