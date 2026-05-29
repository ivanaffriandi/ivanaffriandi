async function test() {
  const title = "DESIGNING DESIGN";
  const author = "Kenya Hara";
  
  const q2 = encodeURIComponent(`${title} ${author}`);
  const r2 = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q2}`);
  const d2 = await r2.json();
  console.log(`Response status: ${r2.status}`);
  console.log(`Response content:`, JSON.stringify(d2, null, 2));
}

test();
