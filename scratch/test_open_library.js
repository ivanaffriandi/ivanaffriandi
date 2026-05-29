async function test() {
  const title = "DESIGNING DESIGN";
  const author = "Kenya Hara";
  
  const qTitle = encodeURIComponent(title);
  const qAuthor = encodeURIComponent(author);
  const url = `https://openlibrary.org/search.json?title=${qTitle}&author=${qAuthor}&limit=1`;
  console.log(`URL: ${url}`);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "IvanPortfolioBookFetcher/1.0 (ivanaffriandi@gmail.com)"
      }
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log(`Found docs: ${data.docs?.length || 0}`);
    if (data.docs && data.docs[0]) {
      console.log(`First doc title: ${data.docs[0].title}`);
      console.log(`First doc cover_i: ${data.docs[0].cover_i}`);
      console.log(`First doc isbn: ${data.docs[0].isbn?.slice(0, 3)}`);
    }
  } catch (err) {
    console.error(`Error:`, err.message);
  }
}

test();
