import fs from 'fs';
const seed = JSON.parse(fs.readFileSync('mark-rox/seed.json', 'utf8'));
const js = `window.SEED = ${JSON.stringify(seed, null, 2)};\n`;
fs.writeFileSync('mark-rox/public/seed.js', js, 'utf8');
console.log('Updated mark-rox/public/seed.js');
