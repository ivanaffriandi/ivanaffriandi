const fs = require("fs");
const path = require("path");

const BOOKS_FILE_PATH = path.join(__dirname, "../src/data/books.json");

async function main() {
  if (!fs.existsSync(BOOKS_FILE_PATH)) {
    console.error("Books file not found at " + BOOKS_FILE_PATH);
    return;
  }

  const books = JSON.parse(fs.readFileSync(BOOKS_FILE_PATH, "utf8"));
  console.log(`Loaded ${books.length} books. Starting to fetch real covers...`);

  // Fetch covers sequentially with a small delay to respect Open Library
  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const queryTitle = encodeURIComponent(book.title);
    const queryAuthor = encodeURIComponent(book.author);
    const url = `https://openlibrary.org/search.json?title=${queryTitle}&author=${queryAuthor}&limit=1`;

    console.log(`[${i + 1}/${books.length}] Querying cover for: "${book.title}" by ${book.author}...`);
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "IvanPortfolioBookFetcher/1.0 (ivanaffriandi@gmail.com)",
          "Accept": "application/json"
        }
      });
      
      if (!response.ok) {
        console.warn(`  Failed to search for "${book.title}" (status ${response.status})`);
        continue;
      }
      
      const data = await response.json();
      if (data.docs && data.docs.length > 0) {
        const doc = data.docs[0];
        if (doc.cover_i) {
          const coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`;
          console.log(`  -> Found real cover ID: ${doc.cover_i}. URL: ${coverUrl}`);
          book.coverUrl = coverUrl;
        } else if (doc.isbn && doc.isbn.length > 0) {
          const isbn = doc.isbn[0];
          const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
          console.log(`  -> Found real cover via ISBN ${isbn}. URL: ${coverUrl}`);
          book.coverUrl = coverUrl;
        } else {
          console.log(`  -> No cover ID found in Open Library document.`);
        }
      } else {
        console.log(`  -> No documents matched this book.`);
      }
    } catch (err) {
      console.error(`  Error searching for "${book.title}":`, err.message);
    }

    // Wait 400ms to be a good citizen to Open Library API and prevent rate limits
    await new Promise(resolve => setTimeout(resolve, 400));
  }

  fs.writeFileSync(BOOKS_FILE_PATH, JSON.stringify(books, null, 2), "utf8");
  console.log("Successfully updated src/data/books.json with genuine cover images!");
}

main();
