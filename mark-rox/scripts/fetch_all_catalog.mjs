import fs from 'fs';

const artevistasUrls = [
  'https://www.artevistas.eu/product/mark-rox-piece-of-art/',
  'https://www.artevistas.eu/product/mark-rox-jewelry/',
  'https://www.artevistas.eu/product/mark-rox-trash-pile/',
  'https://www.artevistas.eu/product/mark-rox-car-garbage-pile/',
  'https://www.artevistas.eu/product/mark-rox-trash/',
  'https://www.artevistas.eu/product/mark-rox-planet-earth/',
  'https://www.artevistas.eu/product/mark-rox-garbage/',
  'https://www.artevistas.eu/product/mark-rox-trashman/',
  'https://www.artevistas.eu/product/mark-roxartonaut-20/',
  'https://www.artevistas.eu/product/mark-rox-artonaut-19/',
  'https://www.artevistas.eu/product/mark-rox-mushroom-forest/',
  'https://www.artevistas.eu/product/mark-rox-graffiti-rhino/',
  'https://www.artevistas.eu/product/mark-rox-alberto-blanchart-artonaut-colab/',
  'https://www.artevistas.eu/product/mark-rox-artonaut-13-02/',
  'https://www.artevistas.eu/product/mark-rox-artonaut-12-01/',
  'https://www.artevistas.eu/product/mark-rox-artonaut-11-01/',
  'https://www.artevistas.eu/product/mark-rox-artonaut-true-style/',
  'https://www.artevistas.eu/product/mark-rox-artonaut-lazy-genius/'
];

console.log('1. Fetching Tilda products...');
const tildaRes = await fetch('https://store.tildaapi.one/api/getproductslist/?storepartuid=635452420012&recid=1248241296', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
});
const tildaData = await tildaRes.json();
const tildaProducts = tildaData.products || [];
console.log(`Fetched ${tildaProducts.length} products from Tilda.`);

console.log('2. Fetching Artevistas products...');
const artevistasProducts = [];

for (const url of artevistasUrls) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) {
      console.warn(`Failed to fetch ${url}: ${res.status}`);
      continue;
    }
    const html = await res.text();

    // Title
    const titleMatch = html.match(/<h1[^>]*class=\"[^\"]*product_title[^\"]*\"[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').replace(/&#8211;/g, '–').replace(/&amp;/g, '&').trim() : '';
    title = title.replace(/^Mark Rox\s*[–-]\s*/i, '').trim();

    // Price
    let price = null;
    const priceMatch = html.match(/woocommerce-Price-amount[^>]*>[\s\S]*?<bdi>([\s\S]*?)<\/bdi>/i);
    if (priceMatch) {
      const clean = priceMatch[1].replace(/<[^>]+>/g, '').replace(/&euro;|€|&#8364;|\s/g, '').replace(/\./g, '').replace(',', '.');
      const num = parseFloat(clean);
      if (!isNaN(num) && num > 0) price = num;
    }

    // Availability / Sold
    const isSold = /out of stock|agotado|sold/i.test(html);
    const availability = isSold ? 'sold' : (price ? 'available' : 'on_request');

    // SKU
    const skuMatch = html.match(/class=\"sku\">([^<]+)<\/span>/i);
    const sku = skuMatch ? skuMatch[1].trim() : '';

    // OG Description: "Oil on canvas 250 × 150 x 3 cm / 98,4 x 59,0 x 1,1 in 12 kg 2026"
    const ogDescMatch = html.match(/property=\"og:description\"\s+content=\"([^\"]+)\"/i);
    const ogDesc = ogDescMatch ? ogDescMatch[1].trim() : '';

    // Dimensions
    let dimensions = '';
    const dimMatch = ogDesc.match(/(\d+(?:[.,]\d+)?\s*[×x]\s*\d+(?:[.,]\d+)?(?:\s*[×x]\s*\d+(?:[.,]\d+)?)?\s*cm)/i);
    if (dimMatch) dimensions = dimMatch[1];

    // Year
    let year = 2026;
    const yearMatch = ogDesc.match(/\b(202[0-9]|201[0-9])\b/);
    if (yearMatch) year = parseInt(yearMatch[1], 10);

    // Medium
    let mediumEn = '';
    if (ogDesc) {
      const parts = ogDesc.split(/\d+\s*[×x]/);
      if (parts.length > 0 && parts[0].trim()) {
        mediumEn = parts[0].replace(/[\/–,-]$/, '').trim();
      }
    }
    if (!mediumEn) {
      mediumEn = /artonaut|sculpture/i.test(title) ? 'Mixed media on acrylic cement' : 'Mixed media on canvas';
    }

    // Category
    const category = (/artonaut|sculpture/i.test(title) || /acrylic cement|cement|sculpture/i.test(mediumEn)) ? 'sculpture' : 'painting';

    // Images
    const imgMatches = [...html.matchAll(/href=\"(https:\/\/www\.artevistas\.eu\/wp-content\/uploads\/[^\"]+\.(?:jpg|jpeg|png|webp))\"/gi)];
    const rawImages = imgMatches.map(m => m[1]);
    const validImages = [...new Set(rawImages.filter(u => 
      !u.includes('icon') && !u.includes('logo') && !u.includes('avatar') && !u.includes('Foto-de-artista') &&
      !u.includes('-150x') && !u.includes('-300x') && !u.includes('-100x')
    ))];

    // Slug / ID
    const urlSlug = url.replace(/\/$/, '').split('/').pop().replace(/^mark-rox-?/i, '');
    const id = urlSlug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    artevistasProducts.push({
      id,
      title,
      category,
      availability,
      price,
      year,
      dimensions,
      mediumEn,
      sku,
      sourceUrl: url,
      images: validImages,
      ogDesc
    });
    console.log(`Parsed ${title}: price=${price}, availability=${availability}, images=${validImages.length}`);
  } catch (err) {
    console.error(`Error parsing ${url}:`, err.message);
  }
}

fs.writeFileSync('mark-rox/scripts/parsed-artevistas.json', JSON.stringify(artevistasProducts, null, 2), 'utf8');
fs.writeFileSync('mark-rox/scripts/parsed-tilda.json', JSON.stringify(tildaProducts, null, 2), 'utf8');
console.log('Saved parsed files successfully.');
