const fs = require('fs');
const path = './src/data/books.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const pataBook = {
  id: "999",
  title: "PATA",
  author: "Mun Kayoung",
  progress: 75,
  status: "reading",
  coverUrl: "",
  startedAt: new Date().toISOString(),
  completedAt: "",
  review: data[0].review // Just use the same wise Dutch review for PATA
};

// Make sure PATA is not already there
const existing = data.findIndex(b => b.title === "PATA");
if (existing > -1) {
  data.splice(existing, 1);
}

// Ensure the old reading book is no longer reading to avoid multiple reading badges
data.forEach(b => {
  if (b.status === "reading") {
    b.status = "completed";
    b.progress = 100;
  }
});

// Add PATA to the beginning
data.unshift(pataBook);

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('PATA successfully added as the reading book!');
