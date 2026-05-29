const fs = require("fs");
const path = require("path");

const BOOKS_FILE_PATH = path.join(__dirname, "../src/data/books.json");

async function main() {
  if (!fs.existsSync(BOOKS_FILE_PATH)) {
    console.error("Books file not found at " + BOOKS_FILE_PATH);
    return;
  }

  const books = JSON.parse(fs.readFileSync(BOOKS_FILE_PATH, "utf8"));
  console.log(`Loaded ${books.length} books. Starting fallback cover fetch for remaining Unsplash books...`);

  let fetchedCount = 0;

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const isUnsplash = book.coverUrl && book.coverUrl.includes("unsplash.com");

    if (!isUnsplash) {
      continue;
    }

    console.log(`[${i + 1}/${books.length}] Fetching broad cover for: "${book.title}" by ${book.author}...`);
    let foundCoverUrl = null;

    // Try Google Books broad query
    try {
      const q = encodeURIComponent(`${book.title} ${book.author}`.trim());
      const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=3&fields=items(volumeInfo/imageLinks)`;
      const res = await fetch(url);
      
      if (res.ok) {
        const data = await res.json();
        const items = data?.items || [];
        for (const item of items) {
          const raw = item?.volumeInfo?.imageLinks?.thumbnail;
          if (raw) {
            foundCoverUrl = raw
              .replace("http://", "https://")
              .replace("zoom=1", "zoom=2")
              .replace("&edge=curl", "");
            break;
          }
        }
      }
    } catch (err) {
      console.error(`  Google Books broad search error for "${book.title}":`, err.message);
    }

    // Try Open Library broad fallback
    if (!foundCoverUrl) {
      try {
        const q = encodeURIComponent(`${book.title} ${book.author}`);
        const url = `https://openlibrary.org/search.json?q=${q}&limit=3`;
        const res = await fetch(url, {
          headers: {
            "User-Agent": "IvanPortfolioBookFetcher/1.0 (ivanaffriandi@gmail.com)"
          }
        });

        if (res.ok) {
          const data = await res.json();
          const docs = data?.docs || [];
          for (const doc of docs) {
            if (doc.cover_i) {
              foundCoverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
              break;
            } else if (doc.isbn && doc.isbn.length > 0) {
              foundCoverUrl = `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
              break;
            }
          }
        }
      } catch (err) {
        console.error(`  Open Library search error for "${book.title}":`, err.message);
      }
    }

    if (foundCoverUrl) {
      book.coverUrl = foundCoverUrl;
      fetchedCount++;
      console.log(`  -> Found real cover: ${foundCoverUrl}`);
      // Save progress incrementally
      fs.writeFileSync(BOOKS_FILE_PATH, JSON.stringify(books, null, 2), "utf8");
    } else {
      console.warn(`  -> Could not resolve cover for "${book.title}" even with fallback broad search.`);
    }

    // Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\nFallback fetch completed!`);
  console.log(`Updated ${fetchedCount} remaining books with genuine covers.`);
}

main().catch(console.error);
