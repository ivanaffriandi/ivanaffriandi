const https = require('https');

https.get('https://html.duckduckgo.com/html/?q=' + encodeURIComponent('book cover The Communist Manifesto Karl Marx'), {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0'
  }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    console.log("Status:", res.statusCode);
    console.log("Length:", data.length);
    if (res.statusCode === 200) {
      // try to extract images
      const matches = [...data.matchAll(/<img[^>]+src="([^"]+)"/g)];
      console.log("Images found:", matches.length);
      matches.slice(0, 5).forEach(m => console.log(m[1]));
    }
  });
});
