const fs = require("fs");
const path = require("path");

const BOOKS_FILE_PATH = path.join(__dirname, "../src/data/books.json");

async function main() {
  if (!fs.existsSync(BOOKS_FILE_PATH)) {
    console.error("Books file not found at " + BOOKS_FILE_PATH);
    return;
  }

  const books = JSON.parse(fs.readFileSync(BOOKS_FILE_PATH, "utf8"));
  console.log(`Loaded ${books.length} books. Starting authentic cover fetch...`);

  let fetchedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const needsCover = !book.coverUrl || book.coverUrl.includes("unsplash.com") || book.coverUrl.trim() === "";

    if (!needsCover) {
      console.log(`[${i + 1}/${books.length}] Skipping "${book.title}" - Already has authentic cover: ${book.coverUrl}`);
      skippedCount++;
      continue;
    }

    console.log(`[${i + 1}/${books.length}] Fetching real cover for: "${book.title}" by ${book.author}...`);
    let foundCoverUrl = null;

    // 1. Try Google Books Volumes API
    try {
      const q = encodeURIComponent(`intitle:${book.title} ${book.author ? `inauthor:${book.author}` : ""}`.trim());
      const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&fields=items(volumeInfo/imageLinks)`;
      const res = await fetch(url);
      
      if (res.ok) {
        const data = await res.json();
        const raw = data?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
        if (raw) {
          foundCoverUrl = raw
            .replace("http://", "https://")
            .replace("zoom=1", "zoom=2")
            .replace("&edge=curl", "");
          console.log(`  -> Found via Google Books: ${foundCoverUrl}`);
        }
      }
    } catch (err) {
      console.error(`  Google Books fetch error for "${book.title}":`, err.message);
    }

    // 2. Fallback to Open Library Search API
    if (!foundCoverUrl) {
      try {
        const qTitle = encodeURIComponent(book.title);
        const qAuthor = book.author ? encodeURIComponent(book.author) : "";
        const url = `https://openlibrary.org/search.json?title=${qTitle}${qAuthor ? `&author=${qAuthor}` : ""}&limit=1`;
        const res = await fetch(url, {
          headers: {
            "User-Agent": "IvanPortfolioBookFetcher/1.0 (ivanaffriandi@gmail.com)"
          }
        });

        if (res.ok) {
          const data = await res.json();
          const doc = data?.docs?.[0];
          if (doc) {
            if (doc.cover_i) {
              foundCoverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
              console.log(`  -> Found via Open Library Cover ID: ${foundCoverUrl}`);
            } else if (doc.isbn && doc.isbn.length > 0) {
              foundCoverUrl = `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
              console.log(`  -> Found via Open Library ISBN: ${foundCoverUrl}`);
            }
          }
        }
      } catch (err) {
        console.error(`  Open Library fetch error for "${book.title}":`, err.message);
      }
    }

    if (foundCoverUrl) {
      book.coverUrl = foundCoverUrl;
      fetchedCount++;
      // Save progress incrementally so we don't lose anything if interrupted
      fs.writeFileSync(BOOKS_FILE_PATH, JSON.stringify(books, null, 2), "utf8");
    } else {
      console.warn(`  -> Could not resolve cover for "${book.title}"`);
    }

    // Crucial: Wait 1 second (1000ms) between requests to avoid rate limits (429)
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\nFetch completed!`);
  console.log(`Total books: ${books.length}`);
  console.log(`Fetched new authentic covers: ${fetchedCount}`);
  console.log(`Skipped (already authentic): ${skippedCount}`);
}

main().catch(console.error);
