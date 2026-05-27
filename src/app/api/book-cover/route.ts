import { NextRequest, NextResponse } from "next/server";

// Simple in-process cache so we don't hit services on every request
const coverCache = new Map<string, string | null>();

const requestHeaders = {
  "User-Agent": "IvanPortfolioBookFetcher/1.0 (ivanaffriandi@gmail.com)",
  "Accept": "application/json"
};

function isbn13To10(isbn13: string): string | null {
  const clean = isbn13.replace(/[^0-9]/g, "");
  if (clean.length !== 13) return null;
  const start = clean.substring(3, 12);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(start[i]) * (10 - i);
  }
  const rem = sum % 11;
  let check = 11 - rem;
  let checkChar = String(check);
  if (check === 10) checkChar = "X";
  if (check === 11) checkChar = "0";
  return start + checkChar;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "";
  const author = searchParams.get("author") ?? "";
  const isbn = searchParams.get("isbn") ?? "";

  if (!title && !isbn) return NextResponse.json({ url: null });

  const cacheKey = `${title}::${author}::${isbn}`.toLowerCase();
  if (coverCache.has(cacheKey)) {
    return NextResponse.json({ url: coverCache.get(cacheKey) });
  }

  let url: string | null = null;

  // 1. Try Open Library direct cover by ISBN (Fast & accurate if available)
  if (isbn && !url) {
    try {
      const olDirectUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
      const res = await fetch(olDirectUrl, { method: "HEAD", headers: requestHeaders, cache: "no-store" });
      if (res.ok) {
        url = olDirectUrl;
      }
    } catch {}
  }

  // 2. Try Amazon Cover API by ISBN-13 and ISBN-10 (Amazon has nearly every cover ever printed)
  if (isbn && !url) {
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, "");
    const isbnsToCheck = [cleanIsbn];
    const isbn10 = isbn13To10(cleanIsbn);
    if (isbn10) isbnsToCheck.push(isbn10);

    for (const code of isbnsToCheck) {
      try {
        const amazonUrl = `https://images.amazon.com/images/P/${code}.01.LZZZZZZZ.jpg`;
        const res = await fetch(amazonUrl, { method: "GET", headers: requestHeaders, cache: "no-store" });
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          const contentLength = res.headers.get("content-length");
          const len = contentLength ? parseInt(contentLength) : 0;
          
          let realLen = len;
          if (realLen === 0) {
            const buf = await res.arrayBuffer();
            realLen = buf.byteLength;
          }

          // Real covers are always > 1KB. Spacer GIFs are around 43 bytes.
          if (contentType?.startsWith("image/") && realLen > 1000) {
            url = amazonUrl;
            break;
          }
        }
      } catch {}
    }
  }

  // 3. Try Google Books Volumes API by ISBN (extremely reliable, zoom=2 high-res)
  if (isbn && !url) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}&maxResults=1&fields=items(volumeInfo/imageLinks)`,
        { headers: requestHeaders, cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        const raw: string | undefined = data?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
        if (raw) {
          url = raw
            .replace("http://", "https://")
            .replace("zoom=1", "zoom=2")
            .replace("&edge=curl", "");
        }
      }
    } catch (err) {
      console.error("Google Books ISBN fetch error:", err);
    }
  }

  // 4. Try Open Library API by ISBN data endpoint (JSON metadata check)
  if (isbn && !url) {
    try {
      const olRes = await fetch(
        `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`,
        { headers: requestHeaders, cache: "no-store" }
      );
      if (olRes.ok) {
        const olData = await olRes.json();
        const bookInfo = olData[`ISBN:${isbn}`];
        const olCoverUrl = bookInfo?.cover?.large || bookInfo?.cover?.medium;
        if (olCoverUrl) {
          url = olCoverUrl;
        }
      }
    } catch (err) {
      console.error("Open Library ISBN fetch error:", err);
    }
  }

  // 5. Try Google Books API by Exact Query (intitle + inauthor)
  if (!url && title) {
    try {
      const q = encodeURIComponent(`intitle:${title} ${author ? `inauthor:${author}` : ""}`.trim());
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&fields=items(volumeInfo/imageLinks)`,
        { headers: requestHeaders, cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        const raw: string | undefined = data?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
        if (raw) {
          url = raw
            .replace("http://", "https://")
            .replace("zoom=1", "zoom=2")
            .replace("&edge=curl", "");
        }
      }
    } catch (err) {
      console.error("Google Books exact fetch error:", err);
    }
  }

  // 6. Try Google Books API by Broad Query (title + author)
  if (!url && title) {
    try {
      const q = encodeURIComponent(`${title} ${author}`.trim());
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1&fields=items(volumeInfo/imageLinks)`,
        { headers: requestHeaders, cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        const raw: string | undefined = data?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
        if (raw) {
          url = raw
            .replace("http://", "https://")
            .replace("zoom=1", "zoom=2")
            .replace("&edge=curl", "");
        }
      }
    } catch (err) {
      console.error("Google Books broad fetch error:", err);
    }
  }

  // 7. Try Open Library Search API by Title + Author
  if (!url && title) {
    try {
      const qTitle = encodeURIComponent(title);
      const qAuthor = author ? encodeURIComponent(author) : "";
      const res = await fetch(
        `https://openlibrary.org/search.json?title=${qTitle}${qAuthor ? `&author=${qAuthor}` : ""}&limit=1`,
        { headers: requestHeaders, cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        const doc = data?.docs?.[0];
        if (doc) {
          if (doc.cover_i) {
            url = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
          } else if (doc.isbn && doc.isbn.length > 0) {
            url = `https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`;
          }
        }
      }
    } catch (err) {
      console.error("Open Library search fetch error:", err);
    }
  }

  if (url) {
    coverCache.set(cacheKey, url);
  }
  
  return NextResponse.json({ url });
}
