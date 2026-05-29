const fs = require('fs');
const path = './src/data/books.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchCover(title, author) {
  try {
    // Try Google Books first
    const q = encodeURIComponent(`intitle:${title} inauthor:${author}`);
    const gRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&fields=items(volumeInfo/imageLinks)`);
    if (gRes.ok) {
      const gData = await gRes.json();
      const raw = gData?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
      if (raw) {
        return raw.replace("http://", "https://").replace("zoom=1", "zoom=2").replace("&edge=curl", "");
      }
    }
  } catch(e) {}

  // Fallback OpenLibrary
  try {
    const olRes = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=1`);
    if (olRes.ok) {
      const olData = await olRes.json();
      const doc = olData?.docs?.[0];
      if (doc?.cover_i) {
        return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
      }
    }
  } catch(e) {}
  
  return null;
}

async function run() {
  let updated = 0;
  for (let i = 0; i < data.length; i++) {
    const book = data[i];
    // If coverUrl is unsplash or empty, fetch a real one
    if (!book.coverUrl || book.coverUrl.includes("unsplash.com")) {
      const realUrl = await fetchCover(book.title, book.author);
      if (realUrl) {
        book.coverUrl = realUrl;
        updated++;
        console.log(`[${i+1}/${data.length}] Found cover for ${book.title}`);
      } else {
        console.log(`[${i+1}/${data.length}] No cover found for ${book.title}`);
      }
      // Wait 1.5s to avoid rate limits on Google/OpenLibrary
      await delay(500);
    }
  }

  if (updated > 0) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    console.log(`Saved ${updated} new real covers directly to books.json!`);
  }
}

run();
