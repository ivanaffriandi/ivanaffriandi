const fs = require("fs");
const path = require("path");

const bookDatabase = [
  // DESIGN & TYPOGRAPHY
  { title: "Designing Design", author: "Kenya Hara", review: "A profound meditation on emptiness, white space, and the sensory philosophy of design. Transformed how I look at paper and products.", rating: 5 },
  { title: "Grid Systems in Graphic Design", author: "Josef Müller-Brockmann", review: "The absolute Bible of modular typographic structure. Essential read for any front-end engineer wanting to master layouts.", rating: 5 },
  { title: "The Design of Everyday Things", author: "Don Norman", review: "A foundational text on user-centered design and affordances. Crucial for building digital systems that make intuitive sense.", rating: 5 },
  { title: "Thoughts on Design", author: "Paul Rand", review: "Rand's timeless manifesto on graphic synthesis and functional beauty. Short, precise, and visually arresting.", rating: 5 },
  { title: "The Elements of Typographic Style", author: "Robert Bringhurst", review: "The ultimate guide to typography. Reads like poetry while laying down precise mathematical geometric principles.", rating: 5 },
  { title: "Design as Art", author: "Bruno Munari", review: "Playful, deep, and beautifully accessible. Munari bridged the gap between pure visual arts and functional industrial designs.", rating: 5 },
  { title: "Ten Principles for Good Design", author: "Dieter Rams", review: "The golden rules of functional modernism. Less is more, and rams proves it with absolute clarity.", rating: 5 },
  { title: "Design for the Real World", author: "Victor Papanek", review: "A revolutionary critique of design greed, advocating for socially responsible, ecological design years before it was popular.", rating: 4 },
  { title: "Wabi-Sabi for Artists, Designers, Poets & Philosophers", author: "Leonard Koren", review: "An exquisite exploration of the beauty of things imperfect, impermanent, and incomplete.", rating: 5 },
  { title: "Interaction of Color", author: "Josef Albers", review: "A brilliant masterclass on the relativity of color perception. Eye-opening exercises on visual harmony.", rating: 5 },
  { title: "The Visual Display of Quantitative Information", author: "Edward Tufte", review: "The undisputed masterpiece on data visualization. Exquisite details on graphical excellence.", rating: 5 },
  { title: "About Face: The Essentials of Interaction Design", author: "Alan Cooper", review: "Extremely thorough handbook on user persona patterns and digital product architecture.", rating: 4 },
  { title: "Universal Principles of Design", author: "William Lidwell", review: "A highly practical visual reference card catalog of cognitive and design patterns.", rating: 4 },
  { title: "Responsive Web Design", author: "Ethan Marcotte", review: "The historic monograph that defined fluid grids, media queries, and the modern flexible web.", rating: 5 },
  { title: "Thinking with Type", author: "Ellen Lupton", review: "A clear, beautifully styled textbook for students and designers looking to master layout and grid architecture.", rating: 4 },
  { title: "Logo Design Love", author: "David Airey", review: "Practical guide to brand identity design. Highly readable and filled with authentic client workflow examples.", rating: 4 },

  // MINIMALISM & PHILOSOPHY
  { title: "Goodbye, Things", author: "Fumio Sasaki", review: "A deeply personal guide to extreme Japanese minimalism. Shows how letting go of items creates true mental clarity.", rating: 5 },
  { title: "The Life-Changing Magic of Tidying Up", author: "Marie Kondo", review: "A worldwide phenomenon that elevates organization to a spiritual, joy-evoking practice.", rating: 4 },
  { title: "Meditations", author: "Marcus Aurelius", review: "A remarkable stoic handbook written in the middle of military campaigns. Pure wisdom on focus, control, and duty.", rating: 5 },
  { title: "Letters from a Stoic", author: "Seneca", review: "Timeless advice on friendship, reading, travel, and the avoidance of digital and mental distractions.", rating: 5 },
  { title: "Tao Te Ching", author: "Lao Tzu", review: "Eighty-one poetic verses on yielding, quietude, and the natural flow of the universe.", rating: 5 },
  { title: "The Art of Loving", author: "Erich Fromm", review: "A classic psychoanalytic thesis on love as an active art form requiring practice, focus, and patience.", rating: 4 },
  { title: "The Book of Tea", author: "Kakuzo Okakura", review: "An elegant essay explaining teaism as a sublime aesthetic religion of minimalism and visual peace.", rating: 5 },
  { title: "Zen Mind, Beginner's Mind", author: "Shunryu Suzuki", review: "Simple, direct talks on Zen practice. The philosophy of keeping a fresh, open mind without preconceptions.", rating: 5 },
  { title: "The Wisdom of Insecurity", author: "Alan Watts", review: "Brilliant stoic exploration of anxiety, flow, and the futility of chasing absolute certainty.", rating: 4 },
  { title: "Man's Search for Meaning", author: "Viktor Frankl", review: "A profound psychological account of survival in Nazi camps, showing how finding meaning is humanity's primary drive.", rating: 5 },
  { title: "A Pattern Language", author: "Christopher Alexander", review: "A monumental work on spatial archetypes, from towns to alcoves. Inspires deep structural thinking.", rating: 5 },
  { title: "Walden", author: "Henry David Thoreau", review: "The quintessential American manifesto on simple, deliberate living close to nature.", rating: 4 },
  { title: "Silence: In the Age of Noise", author: "Erling Kagge", review: "A beautiful exploration of quiet spaces by an explorer who walked solo to the South Pole.", rating: 4 },
  { title: "The Courage to Be Disliked", author: "Ichiro Kishimi", review: "An Adlerian dialogue on personal agency, letting go of past trauma, and finding true freedom.", rating: 5 },
  { title: "Quiet: The Power of Introverts", author: "Susan Cain", review: "A highly researched tribute to deep focus, independent thinking, and the power of low-stimulation work environments.", rating: 4 },
  { title: "Deep Work", author: "Cal Newport", review: "Essential strategies for cultivating intense concentration and escaping the trap of shallow digital busyness.", rating: 5 },

  // PROGRAMMING & COMPUTER SCIENCE
  { title: "Clean Code", author: "Robert C. Martin", review: "A classic manual on software craftsmanship. Essential guide for writing highly readable, maintainable functions.", rating: 5 },
  { title: "The Pragmatic Programmer", author: "David Thomas", review: "Outstanding, practical advice on career, testing, tooling, automation, and writing robust software architectures.", rating: 5 },
  { title: "JavaScript: The Good Parts", author: "Douglas Crockford", review: "The elegant monograph that isolated the functional, expressive side of JS from its historical mistakes.", rating: 4 },
  { title: "Eloquent JavaScript", author: "Marijn Haverbeke", review: "A gorgeous, comprehensive textbook that teaches coding as an art form using pure, expressive JS patterns.", rating: 5 },
  { title: "You Don't Know JS: Scope & Closures", author: "Kyle Simpson", review: "Extremely deep dive into the absolute core mechanics of how JavaScript runs under the hood.", rating: 5 },
  { title: "Design Patterns", author: "Erich Gamma", review: "The legendary Gof catalog of reusable object-oriented software engineering structures.", rating: 4 },
  { title: "Refactoring", author: "Martin Fowler", review: "The golden standard for systematically improving codebases without altering dynamic behaviors.", rating: 5 },
  { title: "Clean Architecture", author: "Robert C. Martin", review: "Superb architectural manual outlining clean separation of concerns and dependency inversion.", rating: 5 },
  { title: "Domain-Driven Design", author: "Eric Evans", review: "A complex but brilliant treatise on matching software design to real-world business models.", rating: 5 },
  { title: "The Mythical Man-Month", author: "Frederick Brooks", review: "Timeless essays on software engineering management and why throwing developers at a late project makes it later.", rating: 4 },
  { title: "Structure and Interpretation of Computer Programs", author: "Harold Abelson", review: "The legendary MIT Wizard Book. Mind-bending exploration of abstraction, logic, and recursion.", rating: 5 },
  { title: "Introduction to Algorithms", author: "Thomas H. Cormen", review: "The massive, definitive textbook on sorting, data structures, and mathematical algorithm analysis.", rating: 4 },
  { title: "Code: The Hidden Language of Computer Hardware and Software", author: "Charles Petzold", review: "An absolutely stunning journey from flashlights to modern microprocessors. Highly accessible.", rating: 5 },
  { title: "Working Effectively with Legacy Code", author: "Michael Feathers", review: "Crucial strategies for placing scary, untested codebases under test coverage safely.", rating: 5 },
  { title: "Cracking the Coding Interview", author: "Gayle Laakmann McDowell", review: "The industry standard prep book on algorithm challenges, hash tables, and technical assessments.", rating: 4 },
  { title: "Continuous Delivery", author: "Jez Humble", review: "The foundational framework for reliable, automated software deployment pipelines.", rating: 4 },

  // SCIENCE & HISTORY
  { title: "Gödel, Escher, Bach: An Eternal Golden Braid", author: "Douglas Hofstadter", review: "A monumental, whimsical Pulitzer-prize winning work exploring self-reference, logic, and consciousness.", rating: 5 },
  { title: "Surely You're Joking, Mr. Feynman!", author: "Richard Feynman", review: "Witty, energetic anecdotes from the Nobel-prize winning physicist who investigated space shuttle crashes.", rating: 5 },
  { title: "Steve Jobs", author: "Walter Isaacson", review: "A gripping biography of the Apple co-founder, highlighting his obsessive focus, design ideals, and product vision.", rating: 5 },
  { title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", review: "A breathtaking narrative on how cognitive revolutions, mythologies, and money united human networks.", rating: 5 },
  { title: "Cosmos", author: "Carl Sagan", review: "Poetic, educational exploration of space, human history, and scientific progress.", rating: 5 },
  { title: "The Innovators", author: "Walter Isaacson", review: "A comprehensive history of the digital revolution, from Ada Lovelace to Google.", rating: 4 },
  { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", review: "Brilliant Nobel-laureate account of cognitive biases, heuristic shortcuts, and our two systems of thought.", rating: 5 },
  { title: "Atomic Habits", author: "James Clear", review: "Practical framework for micro-habits and systemic growth using behavioral psychology.", rating: 4 },
  { title: "The Black Swan", author: "Nassim Nicholas Taleb", review: "Provocative critique of statistical models and our blindness to highly impactful, unexpected events.", rating: 4 },
  { title: "Elon Musk", author: "Walter Isaacson", review: "A detailed account of engineering urgency, manufacturing challenges, and bold planetary visions.", rating: 4 },
  { title: "Zero to One", author: "Peter Thiel", review: "Sharp, counter-intuitive notes on startups, monopolies, and building the future.", rating: 4 },
  { title: "Outliers", author: "Malcolm Gladwell", review: "Fascinating examination of cultural backgrounds, practice hours, and systemic luck in human success.", rating: 4 },
  { title: "Guns, Germs, and Steel", author: "Jared Diamond", review: "An epic geographic thesis on why Eurasian societies dominated global technology.", rating: 5 },
  { title: "Sisu: The Finnish Art of Courage", author: "Joanna Nylund", review: "Simple, beautiful monograph on Finnish grit, silent focus, and outdoor resilience.", rating: 4 },
  { title: "Brief Answers to the Big Questions", author: "Stephen Hawking", review: "Clear, profound reflections on black holes, AI, space travel, and our future.", rating: 5 },
  { title: "The Order of Time", author: "Carlo Rovelli", review: "Poetic modern physics exploring why time flows differently depending on speed and gravity.", rating: 5 },

  // ART, ARCHITECTURE & LITERATURE
  { title: "The Fountainhead", author: "Ayn Rand", review: "A controversial but compelling tale of an uncompromising modern architect who values personal integrity above all.", rating: 4 },
  { title: "Ways of Seeing", author: "John Berger", review: "A sharp critique of classical painting and commercial advertisement, changing how we decode visual media.", rating: 5 },
  { title: "The Poetics of Space", author: "Gaston Bachelard", review: "A beautiful phenomenological study of how we experience domestic spaces—from cellars to attics.", rating: 5 },
  { title: "Architectural Grid", author: "Le Corbusier", review: "Deep exploration of scale, modular sizing, and structural layout systems in physical spaces.", rating: 4 },
  { title: "Color and Light", author: "James Gurney", review: "Superb visual guide to lighting, atmospheric colors, and pigment relativity for painters.", rating: 5 },
  { title: "Steal Like an Artist", author: "Austin Kleon", review: "A brief, highly readable booster shot on creative influence, synthesis, and creative play.", rating: 4 },
  { title: "Creativity, Inc.", author: "Ed Catmull", review: "Candid insights on managing creative talent and building peer-feedback structures from Pixar's president.", rating: 5 },
  { title: "The Prophet", author: "Kahlil Gibran", review: "Exquisite prose-poems filled with deep spiritual philosophy on work, love, and silence.", rating: 5 },
  { title: "The Little Prince", author: "Antoine de Saint-Exupéry", review: "A timeless, beautiful children's fable revealing profound truths about human relationships and love.", rating: 5 },
  { title: "Sidhhartha", author: "Hermann Hesse", review: "An exquisite, meditative novel on a man's spiritual journey to finding inner peace and balance.", rating: 5 },
  { title: "Notes on the Synthesis of Form", author: "Christopher Alexander", review: "A technical, logical thesis on decomposition of complex design problems into modular systems.", rating: 4 },
  { title: "The Death and Life of Great American Cities", author: "Jane Jacobs", review: "The legendary urban planning critique celebrating active sidewalks, mixed use, and organic city growth.", rating: 5 },
  { title: "Dune", author: "Frank Herbert", review: "A colossal ecological science-fiction epic dealing with spice economies, religious myths, and desert survival.", rating: 5 },
  { title: "The Old Man and the Sea", author: "Ernest Hemingway", review: "Hemingway's spare, powerful classic on struggle, endurance, and quiet personal dignity.", rating: 5 },
  { title: "Invisible Cities", author: "Italo Calvino", review: "Exquisite prose describing fifty-five fictitious, highly poetic, architectural cities.", rating: 5 },
  { title: "A Philosophy of Walking", author: "Frédéric Gros", review: "Deeply meditative essays exploring how slow, repetitive physical walks clear the mind for deep thinking.", rating: 4 },

  // MODERN ESSAYS & OBSERVATIONS
  { title: "Essays", author: "Michel de Montaigne", review: "The historic father of personal essays. Warm, highly reflective, and incredibly human.", rating: 5 },
  { title: "In Praise of Shadows", author: "Junichiro Tanizaki", review: "An absolute classic on traditional Japanese aesthetics—highlighting paper textures, lacquerware, and subtle candlelit spaces.", rating: 5 },
  { title: "On Writing", author: "Stephen King", review: "The most practical, warm, and inspiring guide on the craft of writing and developing strong habits.", rating: 5 },
  { title: "Small is Beautiful", author: "E. F. Schumacher", review: "Brilliant, compassionate critique of giant economics, advocating for human-scale, local technology.", rating: 4 },
  { title: "The Shallows", author: "Nicholas Carr", review: "A concerning look at how the hyperlinked, high-distraction internet is physically re-wiring our brains away from deep reading.", rating: 5 },
  { title: "Mono-ha: School of Things", author: "Lee Ufan", review: "Art catalog outlining the minimalist Japanese school focusing on raw materials, space, and quiet relations.", rating: 5 },
  { title: "The Checklist Manifesto", author: "Atul Gawande", review: "A simple, powerful argument for how checklists save lives and prevent stupid mistakes in highly complex tasks.", rating: 4 },
  { title: "Anti-Fragile", author: "Nassim Nicholas Taleb", review: "A brilliant, chaotic exploration of things that actually benefit from shocks, disorder, and stressors.", rating: 4 },
  { title: "Range", author: "David Epstein", review: "A great defense of generalists and slow career pivots in a world obsessed with early specialization.", rating: 4 },
  { title: "The Practice", author: "Seth Godin", review: "A brilliant monograph advocating for creative output as a generous, repetitive, daily habit rather than waiting for muses.", rating: 4 },
  { title: "Visual Intelligence", author: "Amy Herman", review: "Fascinating guide on looking at classical art to train NYPD and FBI agents in observation.", rating: 4 },
  { title: "Flow", author: "Mihaly Csikszentmihalyi", review: "The definitive cognitive psychology work on peak performance, absolute immersion, and the joy of creative engagement.", rating: 5 },
  { title: "Grid Systems", author: "Kimberly Elam", review: "Extremely clear, visual breakdown of geometric proportions, circles, and modular grids in graphic layout.", rating: 4 },
  { title: "Less is More: An Anthology", author: "Cecile Andrews", review: "A pleasant collection of essays exploring voluntary simplicity, community, and time wealth.", rating: 4 },
  { title: "The Architecture of Happiness", author: "Alain de Botton", review: "Warm, highly accessible study on how physical spaces influence our emotional and mental well-being.", rating: 4 },
  { title: "The Tao of Pooh", author: "Benjamin Hoff", review: "A delightful, simple introduction to Taoist philosophy using characters from Winnie-the-Pooh.", rating: 4 }
];

// Generate exactly 96 books!
const generatedBooks = [];
const unsplashImages = [
  "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1495640388908-05fa85288e61?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=250&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=250&auto=format&fit=crop"
];

for (let i = 0; i < 96; i++) {
  const template = bookDatabase[i % bookDatabase.length];
  
  // Spread read dates across the past 2 years (monthly)
  const completedDate = new Date(2026, 4 - Math.floor(i / 4), 15 - (i % 28));
  const startedDate = new Date(completedDate.getTime() - (20 + (i % 10)) * 24 * 3600 * 1000);
  
  const coverUrl = unsplashImages[i % unsplashImages.length];

  // Set the first book to active 'reading'
  const isFirst = i === 0;

  generatedBooks.push({
    id: String(i + 1),
    title: template.title,
    author: template.author,
    coverUrl: coverUrl,
    progress: isFirst ? 68 : 100,
    status: isFirst ? "reading" : "completed",
    review: template.review,
    rating: template.rating,
    startedAt: startedDate.toISOString(),
    completedAt: isFirst ? "" : completedDate.toISOString()
  });
}

const dir = path.join(process.cwd(), "src/data");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

fs.writeFileSync(
  path.join(dir, "books.json"),
  JSON.stringify(generatedBooks, null, 2),
  "utf8"
);

console.log("Successfully wrote 96 real books to src/data/books.json!");
