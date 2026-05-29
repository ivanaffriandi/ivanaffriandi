const fs = require('fs');
const path = require('path');

const BOOKS_PATH = path.join(__dirname, '../src/data/books.json');

// Exact known URLs for the books that failed strict matching due to subtitles
const manualCovers = {
  "ZEALOT: THE LIFE AND TIMES OF JESUS OF NAZARETH": "https://books.google.com/books/publisher/content/images/frontcover/l_C92u42-5YC/fife/w400-h600",
  "THIS EARTH OF MANKIND": "https://books.google.com/books/publisher/content/images/frontcover/bU5gBAAAQBAJ/fife/w400-h600",
  "THE HIDDEN LIFE OF TREES": "https://books.google.com/books/publisher/content/images/frontcover/xJ97DAAAQBAJ/fife/w400-h600",
  "SAPIENS: A BRIEF HISTORY OF HUMANKIND": "https://books.google.com/books/publisher/content/images/frontcover/FmyBAwAAQBAJ/fife/w400-h600",
  "GRIT: THE POWER OF PASSION AND PERSEVERANCE": "https://books.google.com/books/publisher/content/images/frontcover/p_n2CgAAQBAJ/fife/w400-h600",
  "OUTLIERS: THE STORY OF SUCCESS": "https://books.google.com/books/publisher/content/images/frontcover/nNEwBwAAQBAJ/fife/w400-h600",
  "IKIGAI: THE JAPANESE SECRET TO A LONG AND HAPPY LIFE": "https://books.google.com/books/publisher/content/images/frontcover/t58-DwAAQBAJ/fife/w400-h600",
  "THE GENE: AN INTIMATE HISTORY": "https://books.google.com/books/publisher/content/images/frontcover/HqV1CwAAQBAJ/fife/w400-h600",
};

function main() {
  const books = JSON.parse(fs.readFileSync(BOOKS_PATH, 'utf8'));
  let patched = 0;
  
  for (let book of books) {
    if (manualCovers[book.title]) {
      book.coverUrl = manualCovers[book.title];
      patched++;
      console.log(`✅ Patched: ${book.title}`);
    }
  }
  
  fs.writeFileSync(BOOKS_PATH, JSON.stringify(books, null, 2));
  console.log(`\n🎉 Patched ${patched} covers manually!`);
}

main();
