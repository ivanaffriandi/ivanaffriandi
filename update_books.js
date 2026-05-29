const fs = require('fs');

const path = './src/data/books.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

// Sample long review template with bullet points in casual Indonesian
const longReview = (title) => `Gila sih, pas gue kelar baca buku ${title} ini, gue ngerasa dapet insight yang luar biasa banget! Gue bener-bener rekomen buku ini ke siapa aja yang pengen dapetin sudut pandang baru yang lebih dalem. Bahasanya enak banget, flow-nya ngalir, dan yang paling penting, banyak banget pelajaran yang bisa langsung dipraktekin.

Nih, gue rangkum beberapa poin penting yang bikin gue ngerasa buku ini worth it banget buat lo semua baca:

• Perspektif Baru: Buku ini ngasih pandangan yang jarang banget dibahas di tempat lain. Lo bakal diajak mikir out of the box dan ngelihat masalah dari angle yang bener-bener beda. Beneran mind-blowing!
• Solusi Praktis: Nggak cuma teori doang, tapi ada langkah-langkah nyata yang gampang diaplikasiin di kehidupan sehari-hari. Gue sendiri udah nyoba dan kerasa banget perubahannya.
• Gaya Bahasa Nyantai: Asli deh, nulisnya kek ngobrol bareng temen di tongkrongan. Ga kaku sama sekali, jadi gampang dicerna dan lo nggak bakal cepet bosen pas bacanya.
• Penuh Inspirasi: Habis baca ini, energi gue rasanya langsung ke-recharge. Banyak banget quotes dan cerita inspiratif yang bikin semangat hidup gue naik drastis.

Pokoknya, lo wajib banget masukin buku ini ke reading list lo. Kapan lagi dapet ilmu daging tapi dengan gaya penyampaian yang se-chill ini? Buruan baca deh, dijamin ga nyesel!`;

data.forEach(book => {
  book.title = book.title.toUpperCase();
  // Ensure the review is updated
  book.review = longReview(book.title);
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('books.json updated successfully!');
