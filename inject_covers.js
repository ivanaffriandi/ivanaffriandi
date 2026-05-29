const fs = require('fs');
const path = './src/data/books.json';
let data = JSON.parse(fs.readFileSync(path, 'utf8'));

const manualCovers = {
  "ATOMIC HABITS": "https://m.media-amazon.com/images/I/81bGKUa1e0L._AC_UF1000,1000_QL80_.jpg",
  "SAPIENS": "https://m.media-amazon.com/images/I/713jIoMO3UL._AC_UF1000,1000_QL80_.jpg",
  "DEEP WORK": "https://m.media-amazon.com/images/I/81PB8xETU3L._AC_UF1000,1000_QL80_.jpg",
  "THE SUBTLE ART OF NOT GIVING A F*CK": "https://m.media-amazon.com/images/I/71QKQ9mwV7L._AC_UF1000,1000_QL80_.jpg",
  "MAN'S SEARCH FOR MEANING": "https://m.media-amazon.com/images/I/61r59w8TwwL._AC_UF1000,1000_QL80_.jpg",
  "MINDSET": "https://m.media-amazon.com/images/I/71Uq2P0F38L._AC_UF1000,1000_QL80_.jpg",
  "ESSENTIALISM": "https://m.media-amazon.com/images/I/81lU2YJpP8L._AC_UF1000,1000_QL80_.jpg",
  "DESIGNING DESIGN": "https://m.media-amazon.com/images/I/41D9K3yG5bL._AC_UF1000,1000_QL80_.jpg",
  "GRID SYSTEMS IN GRAPHIC DESIGN": "https://m.media-amazon.com/images/I/61U0T7C214L._AC_UF1000,1000_QL80_.jpg",
  "THE DESIGN OF EVERYDAY THINGS": "https://m.media-amazon.com/images/I/81zpLhP1gWL._AC_UF1000,1000_QL80_.jpg",
  "THOUGHTS ON DESIGN": "https://m.media-amazon.com/images/I/61z+R6QhKwL._AC_UF1000,1000_QL80_.jpg",
  "THE ELEMENTS OF TYPOGRAPHIC STYLE": "https://m.media-amazon.com/images/I/71u9sJm9qEL._AC_UF1000,1000_QL80_.jpg",
  "DESIGN AS ART": "https://m.media-amazon.com/images/I/81xG-Y3+s7L._AC_UF1000,1000_QL80_.jpg",
  "TEN PRINCIPLES FOR GOOD DESIGN": "https://m.media-amazon.com/images/I/71YF98rRkBL._AC_UF1000,1000_QL80_.jpg"
};

data.forEach(book => {
  if (manualCovers[book.title]) {
    book.coverUrl = manualCovers[book.title];
  } else if (!book.coverUrl) {
    // Leave blank for DefaultCover
  }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log("Injected exact Amazon covers for the main books!");
