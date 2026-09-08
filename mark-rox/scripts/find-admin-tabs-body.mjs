import fs from 'fs';
const html = fs.readFileSync('index.html', 'utf8');
const idx = html.indexOf('function adminShell');
console.log(html.substring(idx + 500, idx + 1500));
