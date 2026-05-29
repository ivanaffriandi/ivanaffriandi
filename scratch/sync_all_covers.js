/**
 * sync_all_covers.js
 * Syncs covers for ALL books in books.json from:
 *   1. Google Books API (highest quality)
 *   2. Open Library Covers API
 * Runs concurrently in small batches to avoid rate limiting.
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const BOOKS_PATH = path.join(__dirname, "../src/data/books.json");
const DELAY_MS = 600; // between each book to avoid rate limits
const BATCH_SIZE = 3;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      {
        headers: {
          "User-Agent": "IvanPortfolioCoverSync/2.0 (ivanaffriandi@gmail.com)",
          Accept: "application/json",
        },
        timeout: 10000,
      },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error("JSON parse fail"));
          }
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Timeout"));
    });
  });
}

/** Check if a URL is actually reachable (HEAD request, not a redirect to placeholder) */
function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith("http")) return resolve(false);
    const lib = url.startsWith("https") ? https : http;
    try {
      const req = lib.request(
        url,
        { method: "HEAD", timeout: 6000 },
        (res) => {
          resolve(res.statusCode >= 200 && res.statusCode < 400);
        }
      );
      req.on("error", () => resolve(false));
      req.on("timeout", () => { req.destroy(); resolve(false); });
      req.end();
    } catch {
      resolve(false);
    }
  });
}

/** Upgrade HTTP → HTTPS and bump zoom for Google Books covers */
function upgradeGoogleCover(url) {
  if (!url) return "";
  return url
    .replace("http://", "https://")
    .replace(/zoom=\d+/, "zoom=3") // zoom=3 = largest
    .replace("&edge=curl", ""); // remove curl effect
}

async function fetchGoogleBooks(title, author) {
  const queries = [
    `intitle:"${title}" inauthor:"${author}"`,
    `"${title}" "${author}"`,
    title,
  ];

  for (const q of queries) {
    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5&printType=books`;
      const data = await fetchJson(url);
      if (!data.items) continue;

      for (const item of data.items) {
        const info = item.volumeInfo;
        const coverRaw =
          info?.imageLinks?.extraLarge ||
          info?.imageLinks?.large ||
          info?.imageLinks?.medium ||
          info?.imageLinks?.thumbnail ||
          info?.imageLinks?.smallThumbnail ||
          "";
        if (coverRaw) {
          return upgradeGoogleCover(coverRaw);
        }
      }
    } catch (e) {
      // continue to next query
    }
    await delay(200);
  }
  return "";
}

async function fetchOpenLibrary(title, author) {
  const queries = [
    `title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`,
    `q=${encodeURIComponent(`${title} ${author}`)}`,
    `q=${encodeURIComponent(title)}`,
  ];

  for (const q of queries) {
    try {
      const data = await fetchJson(`https://openlibrary.org/search.json?${q}&limit=5`);
      if (!data.docs?.length) continue;

      for (const doc of data.docs) {
        if (doc.cover_i) {
          return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
        }
        if (doc.isbn?.length) {
          return `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
        }
      }
    } catch (e) {
      // continue
    }
    await delay(300);
  }
  return "";
}

function needsUpdate(book) {
  const url = book.coverUrl || "";
  if (!url) return true;
  if (url.includes("unsplash.com")) return true;
  if (url.includes("placeholder")) return true;
  // Amazon URLs are often broken, always try to get better
  if (url.includes("m.media-amazon.com")) return true;
  return false;
}

async function fetchBestCover(book) {
  // Try Google Books first (higher quality)
  const googleCover = await fetchGoogleBooks(book.title, book.author);
  if (googleCover) {
    const ok = await checkUrl(googleCover);
    if (ok) return { url: googleCover, source: "Google Books" };
  }

  await delay(300);

  // Fall back to Open Library
  const olCover = await fetchOpenLibrary(book.title, book.author);
  if (olCover) {
    const ok = await checkUrl(olCover);
    if (ok) return { url: olCover, source: "Open Library" };
  }

  return { url: "", source: "none" };
}

async function main() {
  const books = JSON.parse(fs.readFileSync(BOOKS_PATH, "utf8"));
  console.log(`\n📚 Starting cover sync for ${books.length} books...\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const prefix = `[${String(i + 1).padStart(3, " ")}/${books.length}]`;

    if (!needsUpdate(book)) {
      // Still verify existing URL is valid
      const ok = await checkUrl(book.coverUrl);
      if (ok) {
        console.log(`${prefix} ✅ OK     "${book.title}"`);
        skipped++;
        continue;
      } else {
        console.log(`${prefix} 💔 BROKEN  "${book.title}" — fetching new cover...`);
      }
    } else {
      console.log(`${prefix} 🔍 FETCHING "${book.title}"...`);
    }

    const { url, source } = await fetchBestCover(book);

    if (url) {
      books[i] = { ...book, coverUrl: url };
      console.log(`${prefix} 🖼️  FOUND   "${book.title}" → ${source}`);
      updated++;
    } else {
      console.log(`${prefix} ❌ MISSING  "${book.title}"`);
      failed++;
    }

    // Save progress every 10 books
    if ((i + 1) % 10 === 0) {
      fs.writeFileSync(BOOKS_PATH, JSON.stringify(books, null, 2));
      console.log(`\n💾 Saved progress (${i + 1}/${books.length})\n`);
    }

    await delay(DELAY_MS);
  }

  // Final save
  fs.writeFileSync(BOOKS_PATH, JSON.stringify(books, null, 2));

  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ DONE — ${updated} updated, ${skipped} already OK, ${failed} failed`);
  console.log(`📁 Saved to ${BOOKS_PATH}`);
}

main().catch(console.error);
