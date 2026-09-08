import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const code = scriptMatch[1];

let appHtml = '';
let thrown = null;

const createElem = () => ({
  innerHTML: '',
  setAttribute: () => {},
  classList: { add: () => {}, remove: () => {}, toggle: () => {} },
  style: {},
  addEventListener: () => {},
  dataset: {}
});

const fakeDoc = {
  querySelector: (s) => {
    if (s === '#app') {
      const el = createElem();
      el._html = '';
      Object.defineProperty(el, 'innerHTML', {
        set(v) { appHtml = v; },
        get() { return appHtml; }
      });
      return el;
    }
    return createElem();
  },
  querySelectorAll: () => [],
  documentElement: { lang: 'en' },
  body: createElem(),
  addEventListener: () => {}
};

const fakeWin = {
  RUNTIME: { demo: true, admin: false, publicUrl: '/' },
  location: { protocol: 'https:', pathname: '/', search: '', hash: '' },
  addEventListener: () => {},
  scrollTo: () => {}
};

const fakeStorage = {
  getItem: (k) => null,
  setItem: () => {}
};

try {
  const fn = new Function('window', 'document', 'localStorage', 'location', code);
  fn(fakeWin, fakeDoc, fakeStorage, fakeWin.location);
} catch (e) {
  thrown = e;
}

console.log('Error thrown?', thrown ? thrown.stack : 'NO ERROR');
console.log('App HTML length:', appHtml.length);
if (appHtml.length > 0) {
  console.log('App HTML snippet:', appHtml.substring(0, 300));
}
