const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const BOOKS_PATH = path.join(__dirname, "../src/data/books.json");
const DELAY_MS = 1000; // 1s to avoid rate limits

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const req = lib.get(
      url,
      {
        headers: {
          "User-Agent": "IvanPortfolioCoverSync/3.0",
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

function upgradeGoogleCover(url) {
  if (!url) return "";
  return url
    .replace("http://", "https://")
    .replace(/zoom=\d+/, "zoom=3") 
    .replace("&edge=curl", "");
}

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function fetchGoogleBooksStrict(title, author) {
  // Query with exact title
  const q = `intitle:"${title}" inauthor:"${author.split(' ')[0]}"`;
  const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5&printType=books`;
  
  try {
    const data = await fetchJson(url);
    if (!data.items) return "";

    for (const item of data.items) {
      const info = item.volumeInfo;
      
      // Strict title check: ensure the result title is very similar to requested title
      const resTitle = normalize(info.title || "");
      const reqTitle = normalize(title);
      
      // If the result title contains our requested title (or vice versa), it's a match
      if (resTitle.includes(reqTitle) || reqTitle.includes(resTitle)) {
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
    }
  } catch (e) {
    console.error("Google API error for:", title);
  }
  return "";
}

async function fetchOpenLibraryStrict(title, author) {
  const q = `title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`;
  const url = `https://openlibrary.org/search.json?${q}&limit=5`;
  
  try {
    const data = await fetchJson(url);
    if (!data.docs?.length) return "";

    for (const doc of data.docs) {
      const resTitle = normalize(doc.title || "");
      const reqTitle = normalize(title);
      
      if (resTitle.includes(reqTitle) || reqTitle.includes(resTitle)) {
        if (doc.cover_i) {
          return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
        }
        if (doc.isbn?.length) {
          return `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
        }
      }
    }
  } catch (e) {
    console.error("OpenLibrary error for:", title);
  }
  return "";
}

async function fetchBestCoverStrict(book) {
  const googleCover = await fetchGoogleBooksStrict(book.title, book.author);
  if (googleCover) {
    const ok = await checkUrl(googleCover);
    if (ok) return { url: googleCover, source: "Google Books" };
  }

  await delay(500);

  const olCover = await fetchOpenLibraryStrict(book.title, book.author);
  if (olCover) {
    const ok = await checkUrl(olCover);
    if (ok) return { url: olCover, source: "Open Library" };
  }

  return { url: "", source: "none" };
}

async function main() {
  const books = JSON.parse(fs.readFileSync(BOOKS_PATH, "utf8"));
  console.log(`\n📚 Starting STRICT cover sync for ${books.length} books...\n`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const prefix = `[${String(i + 1).padStart(3, " ")}/${books.length}]`;

    console.log(`${prefix} 🔍 FETCHING STRICT "${book.title}"...`);
    const { url, source } = await fetchBestCoverStrict(book);

    if (url) {
      books[i] = { ...book, coverUrl: url };
      console.log(`${prefix} 🖼️  FOUND   "${book.title}" → ${source}`);
      updated++;
    } else {
      console.log(`${prefix} ❌ FAILED  "${book.title}" - No strict match found`);
      failed++;
    }

    if ((i + 1) % 10 === 0) {
      fs.writeFileSync(BOOKS_PATH, JSON.stringify(books, null, 2));
    }
    await delay(DELAY_MS);
  }

  fs.writeFileSync(BOOKS_PATH, JSON.stringify(books, null, 2));
  console.log(`\n✅ DONE — ${updated} updated with strict matches, ${failed} failed`);
}

main().catch(console.error);
