const { execSync } = require('child_process');
const fs = require('fs');

if (!fs.existsSync('assets/img/og')) {
  fs.mkdirSync('assets/img/og', { recursive: true });
}

const cards = [
  {
    out: 'og-home.jpg',
    art: 'assets/img/blood-moon-city.webp',
    eyebrow: 'ALYS THORNE · OFFICIAL SITE',
    title: 'Veins of Silver',
    sub: 'The Complete Dark Romantic Fantasy Trilogy',
    desc: 'Slow-burn sapphic romance · Lethal vampires · Blood magic'
  },
  {
    out: 'og-books.jpg',
    art: 'assets/img/book-1.webp',
    eyebrow: 'THE VEINS OF SILVER TRILOGY',
    title: 'Books & Reading Order',
    sub: 'Blood Awakens · Shadows Unbound · The Blood Remembers',
    desc: 'Available on Kindle, Paperback, Hardcover and Kindle Unlimited'
  },
  {
    out: 'og-blood-awakens.jpg',
    art: 'assets/img/book-1.webp',
    eyebrow: 'VEINS OF SILVER · BOOK I',
    title: 'Blood Awakens',
    sub: 'By Alys Thorne',
    desc: '“You shouldn’t exist.” But Isolde cannot look away.'
  },
  {
    out: 'og-shadows-unbound.jpg',
    art: 'assets/img/book-2.webp',
    eyebrow: 'VEINS OF SILVER · BOOK II',
    title: 'Shadows Unbound',
    sub: 'By Alys Thorne',
    desc: 'She should be her enemy. Instead, she’s her anchor.'
  },
  {
    out: 'og-the-blood-remembers.jpg',
    art: 'assets/img/book-3.webp',
    eyebrow: 'VEINS OF SILVER · BOOK III',
    title: 'The Blood Remembers',
    sub: 'The Trilogy Finale · By Alys Thorne',
    desc: 'Bound by blood. Kept alive by love. The final battle begins.'
  },
  {
    out: 'og-characters.jpg',
    art: 'assets/img/tessa-cole.webp',
    eyebrow: 'VEINS OF SILVER · DOSSIER',
    title: 'Faces in the Dark',
    sub: 'Character Profiles of Blackspire',
    desc: 'Tessa Cole, Isolde, Elenia Vein, and Galen'
  },
  {
    out: 'og-lore.jpg',
    art: 'assets/img/bloodlines-runes.webp',
    eyebrow: 'WORLD OF BLACKSPIRE',
    title: 'Lore & Bloodlines',
    sub: 'Ancient Magic, Vampires & The Hollow',
    desc: 'The history and shadows governing the city of Blackspire'
  },
  {
    out: 'og-game.jpg',
    art: 'assets/img/blood-moon-city.webp',
    eyebrow: 'VEINS OF SILVER · MOBILE GAME',
    title: 'Play the Game',
    sub: 'Mobile Touch-Screen Experience',
    desc: 'Survive the shadows of Blackspire on your phone or tablet'
  },
  {
    out: 'og-about.jpg',
    art: 'assets/img/alys-thorne.webp',
    eyebrow: 'AUTHOR SPOTLIGHT',
    title: 'About Alys Thorne',
    sub: 'Author of the Veins of Silver Trilogy',
    desc: 'Gothic romantic fantasy, ancient myths, and defiant love'
  },
  {
    out: 'og-contact.jpg',
    art: 'assets/img/alys-thorne.webp',
    eyebrow: 'CONNECT WITH ALYS THORNE',
    title: 'Newsletter & Contact',
    sub: 'alysthorne@gmail.com',
    desc: 'Direct reader inquiries, updates, and gothic dispatches'
  },
  {
    out: 'og-privacy.jpg',
    art: 'assets/img/blood-moon-city.webp',
    eyebrow: 'ALYS THORNE · OFFICIAL SITE',
    title: 'Privacy Policy',
    sub: 'Reader Privacy & Data Protection',
    desc: 'How your newsletter subscriptions and data are safeguarded'
  },
  {
    out: 'og-tessa-cole.jpg',
    art: 'assets/img/tessa-cole.webp',
    eyebrow: 'CHARACTER PROFILE',
    title: 'Tessa Cole',
    sub: 'The Hybrid · The Blood That Remembers',
    desc: '“I didn’t ask for this power. But I won’t run from it either.”'
  },
  {
    out: 'og-isolde.jpg',
    art: 'assets/img/isolde.webp',
    eyebrow: 'CHARACTER PROFILE',
    title: 'Isolde',
    sub: 'The Shadow · Rogue Vampire Enforcer',
    desc: '“Cross this threshold, and you answer to my steel.”'
  },
  {
    out: 'og-elenia-vein.jpg',
    art: 'assets/img/elenia-vein.webp',
    eyebrow: 'CHARACTER PROFILE',
    title: 'Elenia Vein',
    sub: 'The Bloodbound Oracle',
    desc: '“The threads of fate were severed long ago. We weave in dark.”'
  },
  {
    out: 'og-galen.jpg',
    art: 'assets/img/galen.webp',
    eyebrow: 'CHARACTER PROFILE',
    title: 'Galen',
    sub: 'The Rebel Strategist',
    desc: '“Every battle is decided before the first blade is drawn.”'
  }
];

for (const c of cards) {
  const cmd = `convert -size 1200x630 xc:"#07070b" \\
    \\( "${c.art}" -resize 390x570^ -gravity center -crop 390x570+0+0 \\) \\
    -geometry +730+30 -composite \\
    -stroke "#e5b45a" -strokewidth 1 -fill none -draw "rectangle 20,20 1180,610" \\
    -stroke none -fill "#e5b45a" -font DejaVu-Sans -pointsize 18 -draw "text 70,130 '${c.eyebrow}'" \\
    -fill "#f0ede6" -font DejaVu-Sans-Bold -pointsize 44 -draw "text 70,220 '${c.title}'" \\
    -fill "#e5b45a" -font DejaVu-Sans -pointsize 24 -draw "text 70,280 '${c.sub}'" \\
    -fill "#a49fae" -font DejaVu-Sans -pointsize 19 -draw "text 70,350 '${c.desc}'" \\
    -fill "#e5b45a" -font DejaVu-Sans -pointsize 15 -draw "text 70,550 'https://alys-thorne-site.vercel.app'" \\
    "assets/img/og/${c.out}"`;
  
  execSync(cmd);
  console.log('Created assets/img/og/' + c.out);
}
