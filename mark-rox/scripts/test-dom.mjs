import fs from 'fs';
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const code = scriptMatch[1];

// Let's create a minimal DOM environment to run the script and catch any runtime exception
import { JSDOM } from 'jsdom';
