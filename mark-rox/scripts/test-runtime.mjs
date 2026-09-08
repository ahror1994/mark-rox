import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const code = scriptMatch[1];

// Mock browser globals
const window = {
  RUNTIME: { demo: true, admin: false, publicUrl: '/' },
  location: { protocol: 'https:', pathname: '/', search: '', hash: '' },
  addEventListener: () => {},
  scrollTo: () => {}
};
const document = {
  querySelector: (sel) => {
    return { innerHTML: '', setAttribute: () => {}, style: {}, addEventListener: () => {} };
  },
  querySelectorAll: () => [],
  documentElement: { lang: 'ru' },
  body: { style: {} },
  addEventListener: () => {}
};
const localStorage = {
  getItem: () => null,
  setItem: () => {}
};
const location = window.location;

// Run script
try {
  const runner = new Function('window', 'document', 'localStorage', 'location', code);
  runner(window, document, localStorage, location);
  console.log('Script executed without throwing!');
  console.log('MARKROX_READY:', window.MARKROX_READY);
} catch (err) {
  console.error('RUNTIME ERROR IN CODE:', err);
  console.error(err.stack);
}
