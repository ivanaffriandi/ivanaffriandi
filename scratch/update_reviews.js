const fs = require('fs');
const path = require('path');

const booksPath = path.join(__dirname, '../src/data/books.json');
const books = JSON.parse(fs.readFileSync(booksPath, 'utf8'));

const reviews = {
  "2": `Oh my god, seriously, this book is an absolute game-changer! I'm not even exaggerating, it completely rewired how I look at my daily routines. James Clear writes in such an easy, conversational way—it doesn't feel like a dry textbook at all. It feels like you're having coffee with a smart friend who's just dropping wisdom. Here are the big, mind-blowing takeaways I got:

1. The 1% Better Every Day Concept: This is so simple but so powerful. You don't have to overhaul your entire life overnight (which is usually where we fail). Just try to get 1% better every single day. The compounding effect over a year is literally massive! Think about it, 1.01^365 is like a 37x improvement. Absolutely wild!
2. Systems Over Goals: We all focus so much on the end goal, right? But the goal is just the direction. The *system* is what actually gets you there. Don't just focus on losing weight or writing a book; build a system of daily movement or daily writing and enjoy the process.
3. The Four Laws of Behavior Change: To build a good habit, make it *obvious* (put it right in front of you), make it *attractive* (pair it with something you love), make it *easy* (reduce friction, like the 2-minute rule), and make it *satisfying* (give yourself an immediate win).

Honestly, I put this to the test and started reading for just 10 minutes every morning right after brewing my coffee. Now it's a seamless habit and I read way more books without feeling any friction at all. You absolutely need to read this, trust me!`,

  "3": `Okay, let me tell you, this is the most brutally honest and refreshing self-help book I've ever picked up! No sugarcoating, no fake positive vibes—just a massive reality check. Mark Manson basically tells you that life is inherently full of struggles and suffering, so the key is not trying to avoid it, but choosing what kind of suffering you're willing to fight for. Here are the gems I highlighted:

1. Stop Obsessing Over Constant Happiness: The obsession with always feeling positive actually makes us feel *worse* because it highlights what we lack. It's totally okay to admit that life sucks sometimes. Accepting that is extremely liberating!
2. The Backwards Law: This is a classic philosophical point. The harder you pursue a certain ideal or desire, the more you feel like you don't have it. Let go of the chase and find peace in what's already here.
3. You Always Have a Choice: You might not be able to control the crazy things that happen to you, but you are 100% in control of *how* you choose to respond and interpret those events. You are responsible for your own reactions.

Honestly, reading this made me care so much less about other people's expectations and stopped my overthinking in its tracks. It's like a deep, honest chat with your most direct friend.`,

  "4": `If you feel like your attention span has been completely ruined by endless social media scrolls and instant notifications, you *need* to pick up this book! Cal Newport provides a brilliant, practical guide on how to produce high-value, deep work in a world full of shallow distractions. Here is what really stood out to me:

1. Deep Work vs. Shallow Work: Deep work is all about focused, distraction-free concentration that pushes your cognitive limits to create massive value. Shallow work, like answering emails or slack messages, is easy, low-value stuff that feels productive but doesn't actually move the needle.
2. How to Enter the Deep Work Zone: Create a strict ritual. Put your phone in another room, close all browser tabs except the one you need, and block out dedicated hours. You can't just 'willpower' your way into it; you need to build a system that protects your focus.
3. Embrace the Boredom: In our digital age, the moment we feel a micro-second of boredom, we instantly reach for our phones. That ruins our brain's ability to focus! Train your mind to sit with boredom so you can rebuild your deep focus muscles.

I tried blocking out just two hours of absolute silence every morning for my most important coding and writing projects, and my output literally skyrocketed. It's an absolute game-changer!`,

  "5": `This is hands down one of the most intense, profound, and life-altering books I have ever read. You need to read this at least once in your life. Viktor Frankl shares his raw, horrifying experience surviving Nazi concentration camps, but he analyzes it through the lens of a psychiatrist. The insights will give you literal chills:

1. Logotherapy (The Search for Meaning): Frankl argues that the primary human drive isn't pleasure or power, but the search for meaning. Even in the most brutal, hopeless conditions, a person can survive if they have a clear purpose or 'why' to live for. As Nietzsche said, 'He who has a why to live can bear almost any how.'
2. The Last Human Freedom: Everything can be taken from you—your clothes, your home, your family, your physical freedom—but there is one thing that can never be stolen: your freedom to choose your own attitude and response in any given set of circumstances.
3. Finding Meaning in Suffering: We can find meaning through three distinct paths: creating a work or doing a deed, experiencing something or encountering someone (love), and our attitude toward unavoidable suffering.

Honestly, after reading this, I felt so small for complaining about trivial daily inconveniences. It completely reframed my perspective on life and challenges.`,

  "6": `Honestly, this book completely flipped a switch in my brain! The whole concept of a growth mindset vs. a fixed mindset is something I now catch myself using every single day. Dweck breaks down how our beliefs about our own intelligence and talent shape our entire destiny. Here are the core things that blew me away:

1. Fixed vs. Growth Mindset: In a fixed mindset, people believe their basic qualities (like intelligence or talent) are fixed traits that can't be changed. They spend their time trying to look smart rather than learning. In a growth mindset, people believe their most basic abilities can be developed through dedication, hard work, and input from others. This view creates a love of learning and a resilience that is essential for great accomplishment.
2. The Power of 'Yet': Instead of saying 'I can't do this,' changing it to 'I can't do this *yet*' changes the entire chemistry of how your brain approaches a challenge. It turns a failure into a temporary step on the learning curve.
3. Embracing Mistakes: Growth-minded people don't see failure as an identity. They see it as a signal to try a different strategy or put in more effort.

Since reading this, I've stopped apologizing for not knowing things immediately and started looking at difficult coding and design tasks as absolute playgrounds for growing my skills. Seriously, read it!`,

  "7": `Oh my god, this book completely blew my mind and changed how I view human history and modern society! Harari tells the story of humankind in a way that reads like a gripping sci-fi novel. Some of these insights are absolutely brilliant:

1. The Cognitive Revolution & Shared Myths: What allowed Homo Sapiens to dominate the planet wasn't physical strength, but our unique ability to believe in 'imagined realities' and 'shared myths'—like religions, nations, corporations, laws, and money. This is what lets millions of strangers cooperate smoothly!
2. The Agricultural Revolution Was a Trap: Harari makes a compelling argument that transitioning from hunter-gatherers to farmers actually made the lives of individual humans *more* difficult, exhausting, and disease-ridden, even though it successfully increased our total population.
3. Money is the Greatest System of Mutual Trust: Money is essentially just blank paper or digital digits, but it's the most successful system of mutual trust ever created because everyone, regardless of culture or religion, agrees to believe in its value.

Seriously, this book is a masterpiece. It makes you realize that so much of our modern world is built on collective imagination. Highly, highly recommend!`,

  "8": `Okay, if you constantly feel busy but not productive, overworked but underutilized, you need to stop whatever you are doing and read this book right now! Greg McKeown's philosophy of 'Less but better' is literally the ultimate antidote to modern day burnout. It's not about how to get more things done, but how to get the *right* things done. Here are my main highlights:

1. The Paradox of Success: When you succeed at something, you get more options and opportunities. But if you try to take on all of them, you stretch yourself too thin, and your progress across all areas drops to near zero. Success can actually distract you from the very things that made you successful in the first place!
2. The Power of the Selective 'No': If you don't prioritize your life, someone else will! Learning to say 'no' gracefully is a superpower. Every time you say 'yes' to something trivial, you are automatically saying 'no' to something essential.
3. The 90% Rule: When evaluating an option, ask yourself: on a scale of 0 to 100, how much does this align with my main goal? If it's less than a 90, make it a 0 and discard it. It forces you to make decisions based on high standards, not just convenience.

This book literally saved my sanity. I pruned half of my daily commitments, and now I have actual breathing room to focus on what truly matters to me!`,

  "9": `Wow, talk about a short book that packs a massive punch! Don Miguel Ruiz draws on ancient Toltec wisdom to give you four deceptively simple rules that can completely free you from self-limiting beliefs and unnecessary drama. The agreement about not taking things personally alone is worth the price of the book. Here is the point-by-point breakdown:

1. Be Impeccable with Your Word: Speak with integrity. Say only what you mean. Avoid using the word to speak against yourself or to gossip about others. Your words have actual creative power, so use them in the direction of truth and love.
2. Don't Take Anything Personally: Nothing others do is because of you. What others say and do is a projection of their own reality, their own dream. When you are immune to the opinions and actions of others, you won't be the victim of needless suffering.
3. Don't Make Assumptions: Find the courage to ask questions and to express what you really want. Communicate with others as clearly as you can to avoid misunderstandings, sadness, and drama. With just this one agreement, you can completely transform your relationships.
4. Always Do Your Best: Your best is going to change from moment to moment; it will be different when you are healthy as opposed to sick. Under any circumstance, simply do your best, and you will avoid self-judgment, self-abuse, and regret.

This is a beautiful, peaceful guide that I keep on my nightstand and re-read whenever I feel overwhelmed by social expectations.`,

  "10": `You've probably seen Simon Sinek's famous TED Talk, but this book dives deep into the underlying mechanics of how the world's most influential leaders and companies inspire action. The central concept is incredibly elegant: people don't buy *what* you do; they buy *why* you do it. Here are the core pillars:

1. The Golden Circle: Imagine three concentric circles. The outermost is WHAT, the middle is HOW, and the bullseye is WHY. Most organizations start from the outside in. But inspiring leaders (like Apple or Martin Luther King Jr.) think, act, and communicate from the inside out.
2. The Biology of Trust: Sinek connects this directly to the brain. The WHAT corresponds to the neocortex (logical, analytical thought), while the WHY and HOW correspond to the limbic brain (feelings, trust, decision-making, with no capacity for language). This is why gut decisions feel right even if we can't explain them!
3. Clarity, Discipline, and Consistency: You must have clarity of WHY (your belief), discipline of HOW (your values and processes), and consistency of WHAT (the actual products or results). If they are aligned, you build lasting trust and loyalty.

While it gets a bit repetitive in the middle chapters, the core message is a crucial framework for anyone trying to build a brand, a company, or lead a team!`,

  "11": `If you've ever felt discouraged because you think you aren't 'talented' enough, this book is going to give you a massive boost of confidence! Angela Duckworth's research proves that passion and long-term perseverance (what she calls 'grit') matter way more than raw talent or high IQ when it comes to outstanding achievement. Here are the big points:

1. Talent vs. Effort: Duckworth lays out a brilliant equation:
   - Talent × Effort = Skill
   - Skill × Effort = Achievement
   Notice that *effort* appears twice! Talent is how fast your skills improve when you invest effort. But achievement is what happens when you take those skills and put effort into using them.
2. The Four Assets of Grit: Grit is something you can cultivate over time through four specific qualities: Interest (enjoying the process), Practice (daily discipline to improve), Purpose (believing your work matters), and Hope (resilient optimism when times are tough).
3. Deliberate Practice: Gritty people don't just repeat things mindlessly. They engage in deliberate practice: setting a stretch goal, focusing 100%, receiving immediate feedback, and reflecting on how to improve.

Reading this reminded me that showing up and doing the work day in and day out is the real secret to mastery. Absolutely inspiring!`,

  "12": `Okay, this is a deeply spiritual and life-altering book that isn't always easy to read, but when it clicks, it *really* clicks. Eckhart Tolle basically argues that all our anxiety, stress, and suffering come from either obsessing over the past or worrying about the future, whereas the only real thing that exists is the present moment. Here are the keys:

1. You Are Not Your Mind: The constant voice in your head that judges, worries, and plans is not who you are. You are the observer *behind* the voice. Once you realize this, you can detach from negative thought patterns and find deep inner peace.
2. The Illusion of Time: The past is just a memory trace stored in the mind of a former Now. The future is an imagined Now. Nothing ever happened in the past; it happened in the Now. Nothing will ever happen in the future; it will happen in the Now.
3. Active Surrender: Tolle doesn't mean giving up or being passive. He means accepting the current moment as it is without judgment. Once you accept 'what is,' you can take clear, powerful action to change your situation if needed.

This book is a masterclass in mindfulness and emotional freedom. Whenever I catch myself overthinking or feeling anxious, I take a deep breath and remind myself of Tolle's advice to ground myself in the Now.`,

  "13": `This is a short, charming, and peaceful book that explores the Japanese secret to a long, happy, and meaningful life. 'Ikigai' roughly translates to 'a reason for being'—that sweet spot where your passion, mission, vocation, and profession intersect. Here are the beautiful points:

1. The Four Circles of Ikigai: To find your Ikigai, you need to discover the intersection of:
   - What you love
   - What you are good at
   - What the world needs
   - What you can be paid for
2. The Power of Flow: The book talks extensively about the concept of flow—being so completely absorbed in an activity that time flies by and you lose all sense of self. Finding daily activities that bring you into a state of flow is a key driver of happiness.
3. The Okinawa Lifestyle: The authors study the centenarians of Okinawa (who have some of the highest life expectancies). Their secrets are surprisingly simple: never eat until you're completely full (hara hachi bu), stay active with low-intensity movement, cultivate strong community bonds, and maintain a sense of purpose.

It's a beautiful, warm reminder to slow down, find joy in small daily rituals, and stay connected with the people and work you love.`,

  "14": `This is hands down the absolute best personal finance book I have ever read, mostly because it barely talks about the stock market or complex spreadsheets. Instead, Morgan Housel explains that doing well with money has very little to do with how smart you are and everything to do with how you behave. Here are my favorite points:

1. No One's Crazy: Everyone has a unique experience with money based on how they grew up. Your risk tolerance, spending habits, and investment beliefs are shaped by your early life, so what looks crazy to one person makes perfect sense to another.
2. Getting Rich vs. Staying Rich: Getting rich requires taking risks, optimism, and putting yourself out there. Staying rich, however, requires the exact opposite: humility, frugality, and a healthy dose of paranoia that what you made can be taken away just as fast.
3. The Power of Room for Error: The single most important part of any financial plan is having a plan for when your plan isn't going according to plan. Having a cash cushion or a safety margin is what keeps you in the game when things go south.
4. Controlling Your Time: The ultimate value of money is its ability to give you control over your time. Being able to wake up and say 'I can do whatever I want today' is the highest dividend money pays.

It is packed with brilliant storytelling and profound wisdom. An absolute must-read for everyone, regardless of your bank balance!`,

  "15": `An absolute masterpiece of cognitive psychology! Daniel Kahneman summarizes decades of research to show how our brains use two distinct systems of thinking, and how this leads to systematic errors in judgment and decision-making. Here are the core insights:

1. System 1 vs. System 2: System 1 is fast, automatic, emotional, and unconscious (e.g., reading a billboard or driving on an empty road). System 2 is slow, deliberate, logical, and effortful (e.g., multiplying 17 × 24 or parking in a tight space). Most of the time, System 1 runs the show, which is efficient but highly prone to biases.
2. Cognitive Biases: Kahneman walks through a library of mental shortcuts, like Anchoring (being overly influenced by the first number we see), Availability Heuristic (estimating the likelihood of an event based on how easily examples come to mind), and Loss Aversion (the pain of losing is twice as powerful as the pleasure of gaining).
3. The Illusion of Understanding: We constantly construct narratives to make sense of a chaotic, unpredictable world. We assume the past was predictable, which leads to hindsight bias and overconfidence in our ability to predict the future.

It's a dense, heavy book, but it will completely change how you make decisions and view your own thoughts. Absolutely mind-expanding!`,

  "16": `As a natural introvert, reading this book felt like a warm, validating hug! Susan Cain makes a powerful, evidence-based argument that modern society heavily overvalues the 'Extrovert Ideal'—the belief that the ideal self is gregarious, alpha, and comfortable in the spotlight. In doing so, we dramatically undervalue the unique strengths of introverts. Here are the key takeaways:

1. Introversion vs. Extroversion: Introverts are not necessarily shy (shyness is the fear of social disapproval; introversion is a preference for low-stimulation environments). Extroverts crave high levels of stimulation to feel normal, whereas introverts feel overwhelmed by too much noise, small talk, and active crowds.
2. The Power of Quiet Collaboration: Some of the greatest innovations in history (from Apple's first computer by Steve Wozniak to the theory of relativity by Albert Einstein) were born from deep, solitary work. Group brainstorms often lead to groupthink, whereas solitude is a catalyst for creative breakthroughs.
3. The 'Free Trait' Theory: Introverts are fully capable of acting like extroverts for things they care about deeply (their core projects). But they need 'restorative niches'—moments of complete solitude—to recharge afterward.

This book helped me embrace my quiet nature and stop feeling guilty for needing alone time. An absolute masterpiece!`,

  "17": `This is a classic personal finance book that completely changes how you think about wealth and income. Robert Kiyosaki uses the story of his two fathers—his real father (highly educated but financially struggling) and his best friend's father (a self-made multi-millionaire)—to explain the rules of money. Here is the point-by-point breakdown:

1. Assets vs. Liabilities: This is the most crucial lesson. An asset puts money *into* your pocket. A liability takes money *out* of your pocket. Wealthy people buy assets (stocks, real estate, businesses), while poor and middle-class people buy liabilities (luxury cars, credit card debt, expensive items) that they think are assets.
2. The Rich Don't Work for Money: The poor and middle class work for money (trading time for a paycheck). The rich make money work for them by building an army of assets that generate passive income.
3. Mind Your Own Business: Don't just work to make your boss or the government rich. While keeping your day job, start building your own asset column. Focus on building assets that grow over time.

While Kiyosaki's advice is sometimes overly simplistic, the core mental model of assets vs. liabilities is a powerful shift in financial perspective.`,

  "18": `Okay, it might sound crazy to read a whole book about cleaning your room, but Marie Kondo's KonMari method is genuinely life-changing! It's not just about organizing clutter; it's a profound philosophy about mindfulness, gratitude, and choosing what you want to keep in your life. Here are the key points:

1. Tidy by Category, Not Location: Instead of cleaning room by room, gather every single item of a specific category (e.g., all your clothes) from the entire house and pile them on the floor. It forces you to confront the sheer volume of what you own.
2. Does It Spark Joy?: Hold each item in your hands and ask yourself: 'Does this spark joy?' If it does, keep it. If it doesn't, thank the item for its service in your life and let it go. It shifts the focus from 'what to discard' to 'what to keep.'
3. Order Matters: Start with the easiest categories (clothes, books, documents) and end with the hardest (sentimental items). It refines your decision-making muscle before you tackle emotional attachments.

I literally discarded half of my clothes and books after reading this, and my space has never felt more peaceful. It really declutters your mind along with your physical environment!`,

  "19": `A heavy, intense, and deeply necessary book that completely revolutionized how the medical world understands psychological trauma. Bessel van der Kolk explains that trauma is not just a psychological memory in our heads; it literally rewires our brain chemistry and gets stored physically inside our nervous systems and bodies. Here are the key insights:

1. Trauma Rewires the Brain: Severe stress shuts down the prefrontal cortex (the rational brain) and activates the amygdala (the alarm system) in a chronic state. This makes survivors feel like the threat is still happening in the present moment.
2. The Body Remembers: Trauma often manifests physically as chronic pain, digestive issues, auto-immune conditions, or a constant feeling of tension. You cannot just 'talk' your way out of trauma because the rational brain is offline during trauma loops.
3. Paths to Healing: True healing requires reclaiming ownership of your body. Van der Kolk explores highly effective therapies beyond traditional talk therapy, such as yoga, mindfulness, EMDR, neurofeedback, and theater.

It is a deeply empathetic and scientific masterpiece. It will give you a profound level of compassion for yourself and others who are healing from difficult pasts.`,

  "20": `An absolutely breathtaking, gripping, and unforgettable memoir. Tara Westover shares her jaw-dropping journey of growing up in a survivalist, ultra-orthodox family in rural Idaho, isolated from mainstream society, with no birth certificate, no medical care, and no formal education. Yet, she taught herself enough mathematics and grammar to enter college at seventeen and eventually earned a PhD from Cambridge. Here are the core themes:

1. The Definition of Education: For Westover, education was not just about earning degrees; it was a painful, liberating process of self-discovery and learning to see the world through her own eyes instead of her abusive family's perspective.
2. The Weight of Family Loyalty: The book beautifully and painfully depicts the agonizing conflict between loving your family and choosing your own mental sanity and survival.
3. Human Resilience: The sheer mental and emotional strength Tara showed to rise above physical abuse, gaslighting, and isolation is both heartbreaking and deeply inspiring.

This book is a masterclass in writing and a testament to the transformative power of knowledge. You will not be able to put it down!`,

  "21": `Okay, now I understand why this book took over TikTok and became an absolute global phenomenon. It is a deeply emotional, gripping, and incredibly honest exploration of the complexities of domestic abuse, love, and cycle-breaking. Here is my raw breakdown of the themes:

1. Not All Love is Simple: The book does a brilliant job of showing that abusers aren't just one-dimensional monsters. They can be incredibly loving, charming, and supportive, which is what makes leaving them so agonizingly difficult and complex.
2. The Cycle of Abuse: Lily Bloom grows up witnessing her father abuse her mother, promising herself she will never end up in that position. Yet, when she finds herself in a similar situation, she experiences the slow, insidious boundary-eroding pattern of abuse.
3. Finding the Courage to Break the Cycle: The climax of the book is about having the ultimate courage to say 'it ends with us'—to make the hardest possible decision for the sake of future generations, choosing self-respect over romantic attachment.

It is a beautiful, heartbreaking, and ultimately empowering story that stays with you long after the final page. Absolutely beautiful!`
};

let count = 0;
books.forEach(b => {
  if (reviews[b.id]) {
    b.review = reviews[b.id];
    count++;
  }
});

fs.writeFileSync(booksPath, JSON.stringify(books, null, 2), 'utf8');
console.log(`Successfully updated ${count} book reviews to super long English reviews!`);
