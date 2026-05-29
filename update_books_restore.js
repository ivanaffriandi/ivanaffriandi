const fs = require('fs');

const path = './src/data/books.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Wise, reflective Dutch review
const wiseDutchReview = (title) => `Het lezen van ${title} was een ingetogen, reflectieve ervaring. Het boek biedt een rustige verkenning van thema's die vaak over het hoofd worden gezien in de haast van het dagelijks leven. De auteur kiest voor een observerende, beschouwende benadering in plaats van grote, dwingende conclusies op te dringen. Het laat ruimte voor eigen interpretatie en nodigt uit tot stille overpeinzing.

Enkele observaties uit het boek:
• De nadruk ligt op acceptatie en het waarnemen van de realiteit zonder onmiddellijk oordeel.
• Het biedt een nuchter perspectief op persoonlijke verwachtingen en maatschappelijke druk.
• Er is veel aandacht voor de kleine, onopvallende momenten die uiteindelijk de meeste betekenis dragen.
• De schrijfstijl is kalm en bedachtzaam, wat bijdraagt aan een gevoel van mentale ruimte tijdens het lezen.

Het is een werk dat je niet zozeer vertelt wat je moet denken, maar je simpelweg herinnert aan de waarde van stilte en aandacht.`;

data.forEach(book => {
  book.title = book.title.toUpperCase();
  book.review = wiseDutchReview(book.title);
  // Keep original coverUrl intact so real covers from Google/Playbooks remain!
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('books.json updated successfully with wise reviews (cover URLs untouched)!');
