import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const adminHtml = fs.readFileSync('admin.html', 'utf8');

console.log('admin.html exists and size is:', adminHtml.length);
const m = adminHtml.match(/window\.RUNTIME\s*=\s*(\{[\s\S]*?\});/);
console.log('admin.html RUNTIME:', m ? m[1] : 'null');
