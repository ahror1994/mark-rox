import fs from 'fs';
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (scriptMatch) {
  try {
    new Function(scriptMatch[1]);
    console.log('JavaScript syntax is 100% VALID!');
  } catch (err) {
    console.error('JS Syntax Error:', err.message);
  }
} else {
  console.error('No script tag found');
}
