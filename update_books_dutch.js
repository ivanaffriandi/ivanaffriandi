const fs = require('fs');

const path = './src/data/books.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Very long, calm, insightful review in Dutch with bullet points.
const dutchReview = (title) => `Ik heb net de laatste pagina van ${title} omgeslagen, en ik voel me nog steeds volledig overweldigd door de diepe inzichten die dit boek biedt. Het is een zeldzame leeservaring waarbij je echt even stil wilt staan om alles wat je hebt gelezen rustig te verwerken. De auteur heeft een ongelooflijk kalme en bedachtzame manier van schrijven, waardoor je als lezer meegesleept wordt op een reis van zelfreflectie zonder dat het ooit gehaast of geforceerd aanvoelt. Dit is absoluut een van die boeken die nog heel lang in mijn gedachten zal blijven hangen.

Hier zijn een paar van de meest waardevolle lessen die ik uit dit prachtige boek heb gehaald:

• Een nieuwe manier van kijken: Het boek daagt je uit om met een zachtere, meer accepterende blik naar de wereld en jezelf te kijken. Het haalt je uit je dagelijkse automatische piloot en laat je zien hoeveel schoonheid er schuilt in bewuste aandacht.
• Praktische wijsheid voor rust: Waar veel boeken blijven steken in abstracte theorieën, biedt dit boek juist kalmerende, praktische handvatten. Het leert je hoe je kleine momenten van stilte kunt creëren te midden van alle chaos.
• Ontroerend en persoonlijk: De voorbeelden en verhalen voelen zo authentiek aan. Het voelt alsof je luistert naar een oude, wijze vriend die precies de juiste woorden kiest om je te troosten en aan te moedigen.
• Tijdloze lessen: Dit is geen boek dat je na één keer lezen in de kast laat verstoffen. De inzichten zijn zo gelaagd dat ik er zeker van ben dat ik het over een paar jaar opnieuw ga oppakken, en er dan weer heel nieuwe dingen uit zal leren.

Al met al is dit echt een prachtig, kalmerend meesterwerk. Als je op zoek bent naar een boek dat je helpt vertragen, dieper laat nadenken, en je een vrediger gevoel geeft, dan kan ik dit met heel mijn hart aanbevelen. Een absolute must-read!`;

data.forEach(book => {
  book.title = book.title.toUpperCase();
  book.review = dutchReview(book.title);
  
  // Also, for 'PATA', clean up any remaining empty coverUrls just in case, though proxy handles it.
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('books.json updated with Dutch reviews successfully!');
