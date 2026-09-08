import fs from 'fs';
const html = fs.readFileSync('index.html', 'utf8');
const idx = html.indexOf('adminTabs');
console.log(html.substring(idx - 100, idx + 600));
