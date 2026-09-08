import fs from 'fs';

const mergedProducts = JSON.parse(fs.readFileSync('mark-rox/scripts/merged-products.json', 'utf8'));
const existingSeed = JSON.parse(fs.readFileSync('mark-rox/seed.json', 'utf8'));

existingSeed.products = mergedProducts;
existingSeed.sourceDate = new Date().toISOString().slice(0, 10);
fs.writeFileSync('mark-rox/seed.json', JSON.stringify(existingSeed, null, 2), 'utf8');
console.log('Updated mark-rox/seed.json with', mergedProducts.length, 'products');

function updateHtmlFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Update window.SEED
  const seedRegex = /window\.SEED\s*=\s*\{[\s\S]*?\};\s*window\.ASSETS/;
  const newSeedStr = `window.SEED=${JSON.stringify(existingSeed)};window.ASSETS`;
  if (!seedRegex.test(content)) {
    console.error(`Could not find window.SEED in ${filePath}`);
    return;
  }
  content = content.replace(seedRegex, newSeedStr);

  // 2. Update cache key to v2
  content = content.replace(/mr-demo-platform-v1/g, 'mr-demo-platform-v2');

  // 3. Update safeImage to allow Tilda CDN domains
  content = content.replace(
    /x\.hostname\s*===\s*'https:'\s*&&\s*\[['"]www\.artevistas\.eu['"],\s*['"]artevistas\.eu['"]\]\.includes\(x\.hostname\)/g,
    `x.protocol==='https:'&&['www.artevistas.eu','artevistas.eu','static.tildacdn.one','static.tildacdn.net','static.tildacdn.com'].includes(x.hostname)`
  );
  content = content.replace(
    /\['www\.artevistas\.eu',\s*'artevistas\.eu'\]\.includes\(x\.hostname\)/g,
    `['www.artevistas.eu','artevistas.eu','static.tildacdn.one','static.tildacdn.net','static.tildacdn.com'].includes(x.hostname)`
  );

  // 4. Update workCard to display price for sold works as well
  const oldWorkCardPrice = `<p class="price">\${p.availability==='sold'?tr('Archive work','Архивная работа'):e(money(p.price))}</p>`;
  const newWorkCardPrice = `<p class="price">\${p.price!==null&&p.price!==undefined?e(money(p.price))+(p.availability==='sold'?' · <span class="muted">'+tr('Sold','Продано')+'</span>':''):tr('Archive work · Sold','Архивная работа · Продано')}</p>`;
  if (content.includes(oldWorkCardPrice)) {
    content = content.replace(oldWorkCardPrice, newWorkCardPrice);
    console.log(`Updated workCard price in ${filePath}`);
  } else {
    console.warn(`Could not find oldWorkCardPrice in ${filePath}`);
  }

  // 5. Update productPage price
  const oldProdPrice = `<p class="product-price">\${p.availability==='sold'?tr('Sold · archive','Продано · архив'):e(money(p.price))}</p>`;
  const newProdPrice = `<p class="product-price">\${p.price!==null&&p.price!==undefined?e(money(p.price))+(p.availability==='sold'?' <span class="muted" style="font-size:0.65em">· '+tr('Sold','Продано')+'</span>':''):tr('Price on request','Цена по запросу')}</p>`;
  if (content.includes(oldProdPrice)) {
    content = content.replace(oldProdPrice, newProdPrice);
    console.log(`Updated productPage price in ${filePath}`);
  } else {
    console.warn(`Could not find oldProdPrice in ${filePath}`);
  }

  // 6. Update productPage actions for sold items to allow saving or enquiring similar
  content = content.replace(
    /\${!\[['"]sold['"],\s*['"]reserved['"]\]\.includes\(p\.availability\)\?`<button class="icon/g,
    `\${true?\`<button class="icon`
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully updated ${filePath}`);
}

updateHtmlFile('index.html');
updateHtmlFile('mark-rox-preview.html');
