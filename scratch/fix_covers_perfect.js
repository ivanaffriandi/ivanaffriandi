const fs = require('fs');
const path = require('path');
const https = require('https');

const BOOKS_PATH = path.join(__dirname, '../src/data/books.json');
const DELAY = 500;

// Known exact covers for hard-to-find or frequently-wrong books
const manualCovers = {
  "PATA": "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1706663242i/206716035.jpg",
  "THE COMMUNIST MANIFESTO": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Communist-manifesto.png/500px-Communist-manifesto.png",
  "IN THE DREAM HOUSE": "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1551276073i/43317482.jpg",
  "ENTANGLED LIFE": "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1587572719i/52668915.jpg",
  "A LITTLE LIFE": "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1446469502i/22822858.jpg",
  "THE ROAD": "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1600241424i/6288.jpg",
  "PACHINKO": "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1462393298i/34051011.jpg",
  "THE BELL JAR": "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1554582218i/6514.jpg",
  "THE METAMORPHOSIS": "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1359061917i/485894.jpg",
  "GENDER TROUBLE": "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1344265773i/857571.jpg"
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

const delay = ms => new Promise(r => setTimeout(r, ms));

async function fetchAppleBooks(title, author) {
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(title + " " + author)}&media=ebook&limit=3`;
  const data = await fetchJson(url);
  if (data && data.results && data.results.length > 0) {
    for (let res of data.results) {
      // Basic sanity check to ensure it's not totally random
      if (res.trackName.toLowerCase().includes(title.toLowerCase().split(' ')[0]) || 
          res.artistName.toLowerCase().includes(author.toLowerCase().split(' ')[0])) {
        return res.artworkUrl100.replace('100x100bb.jpg', '600x600bb.jpg');
      }
    }
  }
  return null;
}

async function fetchWikipedia(title) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(title)}&pithumbsize=500&format=json`;
  const data = await fetchJson(url);
  if (data && data.query && data.query.pages) {
    const pages = Object.values(data.query.pages);
    if (pages[0] && pages[0].thumbnail) {
      return pages[0].thumbnail.source;
    }
  }
  return null;
}

async function main() {
  const books = JSON.parse(fs.readFileSync(BOOKS_PATH, 'utf8'));
  let updated = 0;

  for (let i = 0; i < books.length; i++) {
    const b = books[i];
    
    // 1. Manual covers (100% accurate)
    if (manualCovers[b.title]) {
      books[i].coverUrl = manualCovers[b.title];
      console.log(`[MANUAL] ${b.title}`);
      updated++;
      continue;
    }

    // 2. Apple Books (Extremely accurate)
    let cover = await fetchAppleBooks(b.title, b.author);
    if (cover) {
      books[i].coverUrl = cover;
      console.log(`[APPLE]  ${b.title}`);
      updated++;
      await delay(DELAY);
      continue;
    }

    // 3. Wikipedia (Great for classics)
    cover = await fetchWikipedia(b.title);
    if (cover) {
      books[i].coverUrl = cover;
      console.log(`[WIKI]   ${b.title}`);
      updated++;
      await delay(DELAY);
      continue;
    }

    console.log(`[KEEP]   ${b.title} (falling back to existing)`);
  }

  fs.writeFileSync(BOOKS_PATH, JSON.stringify(books, null, 2));
  console.log(`\n🎉 Processed all covers! Updated ${updated} books with highly accurate sources.`);
}

main();
