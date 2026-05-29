const fs = require('fs');
const path = require('path');

const BOOKS_FILE_PATH = path.join(__dirname, '../src/data/books.json');
const delay = ms => new Promise(res => setTimeout(res, ms));

const headers = {
  "User-Agent": "IvanPortfolioBookFetcher/1.0 (ivanaffriandi@gmail.com)",
  "Accept": "application/json"
};

async function isUrlValid(url) {
  if (!url) return false;
  if (url.includes("unsplash.com")) return false;
  if (url.includes("picsum.photos")) return false;
  if (url.includes("openlibrary.org")) return true; // Open Library covers are assumed valid to optimize speed!
  try {
    const res = await fetch(url, { method: 'HEAD', headers, timeout: 3000 });
    if (res.status === 200) return true;
    
    // HEAD failed or returned non-200. Try GET to be certain.
    const getRes = await fetch(url, { method: 'GET', headers, timeout: 3000 });
    return getRes.status === 200;
  } catch (err) {
    return false;
  }
}

async function fetchCover(title, author) {
  // Try Open Library first (since Google Books is currently rate-limited/exhausted)
  console.log(`  -> [Open Library] Searching for: "${title}" by ${author}...`);
  try {
    const qTitle = encodeURIComponent(title);
    const qAuthor = author ? encodeURIComponent(author) : "";
    const olRes = await fetch(`https://openlibrary.org/search.json?title=${qTitle}${qAuthor ? `&author=${qAuthor}` : ""}&limit=1`, { headers });
    if (olRes.ok) {
      const olData = await olRes.json();
      const doc = olData?.docs?.[0];
      if (doc) {
        if (doc.cover_i) {
          const url = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
          console.log(`    -> Found Open Library cover ID: ${doc.cover_i}. URL: ${url}`);
          return url;
        } else if (doc.isbn && doc.isbn.length > 0) {
          const url = `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
          console.log(`    -> Found Open Library cover via ISBN: ${doc.isbn[0]}. URL: ${url}`);
          return url;
        }
      }
      console.log(`    -> No document matched or no covers found in Open Library.`);
    } else {
      console.log(`    -> Open Library request failed with status: ${olRes.status}`);
    }
  } catch (e) {
    console.error(`    -> Open Library error:`, e.message);
  }

  // Try Google Books as a fallback (will only work if quota isn't exhausted)
  console.log(`  -> [Google Books] Searching for: "${title}" by ${author}...`);
  try {
    const q = encodeURIComponent(`${title} ${author}`.trim());
    const gRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&fields=items(volumeInfo/imageLinks)`);
    if (gRes.ok) {
      const gData = await gRes.json();
      const raw = gData?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
      if (raw) {
        const highResUrl = raw
          .replace("http://", "https://")
          .replace("zoom=1", "zoom=2")
          .replace("&edge=curl", "");
        console.log(`    -> Found Google Books cover: ${highResUrl}`);
        return highResUrl;
      }
    } else {
      console.log(`    -> Google Books request failed with status: ${gRes.status}`);
    }
  } catch (e) {
    console.error(`    -> Google Books error:`, e.message);
  }

  return null;
}

async function run() {
  if (!fs.existsSync(BOOKS_FILE_PATH)) {
    console.error(`Books file not found at: ${BOOKS_FILE_PATH}`);
    return;
  }

  const books = JSON.parse(fs.readFileSync(BOOKS_FILE_PATH, 'utf8'));
  console.log(`Loaded ${books.length} books. Checking and fixing covers...`);

  let updatedCount = 0;

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const currentCover = book.coverUrl;
    
    let needsCover = false;
    
    if (!currentCover || currentCover.trim() === "") {
      needsCover = true;
      console.log(`\n[${i + 1}/${books.length}] "${book.title}" has no cover URL.`);
    } else if (currentCover.includes("unsplash.com") || currentCover.includes("picsum.photos")) {
      needsCover = true;
      console.log(`\n[${i + 1}/${books.length}] "${book.title}" has a placeholder cover URL: ${currentCover}`);
    } else {
      // Verify if the current cover URL is active
      const valid = await isUrlValid(currentCover);
      if (!valid) {
        needsCover = true;
        console.log(`\n[${i + 1}/${books.length}] "${book.title}" has a BROKEN cover URL: ${currentCover}`);
      }
    }

    if (needsCover) {
      const newCover = await fetchCover(book.title, book.author);
      if (newCover) {
        book.coverUrl = newCover;
        updatedCount++;
        console.log(`  [UPDATED] Set genuine cover for "${book.title}"`);
      } else {
        console.log(`  [FAILED] No genuine cover found for "${book.title}". Clearing URL for elegant DefaultCover.`);
        book.coverUrl = ""; // Clear broken URL so it displays the stylish text-based DefaultCover
        updatedCount++;
      }
      
      // Delay 300ms to avoid rate limits
      await delay(300);
    }
  }

  if (updatedCount > 0) {
    fs.writeFileSync(BOOKS_FILE_PATH, JSON.stringify(books, null, 2), 'utf8');
    console.log(`\nSuccessfully updated ${updatedCount} books in books.json!`);
  } else {
    console.log(`\nAll book covers are valid! No updates needed.`);
  }
}

run();
