const https = require('https');

https.get('https://www.goodreads.com/search?q=The+Communist+Manifesto+Karl+Marx', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    console.log("Response length:", data.length);
    if (data.includes('The Communist Manifesto')) {
      console.log("Success! Found text.");
      // try to extract image
      const match = data.match(/<img class="bookCover"[^>]+src="([^"]+)"/);
      if (match) {
        console.log("Found cover:", match[1]);
      } else {
        console.log("No cover image found.");
      }
    } else {
      console.log("Failed. Cloudflare?");
    }
  });
});
