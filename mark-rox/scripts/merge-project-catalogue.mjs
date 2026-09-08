import fs from 'fs';

const projectCatalogue = JSON.parse(fs.readFileSync('C:/Users/ahror/Downloads/mark-rox-project/mark-rox/src/lib/catalogue.json', 'utf8'));
const projectSettings = JSON.parse(fs.readFileSync('C:/Users/ahror/Downloads/mark-rox-project/mark-rox/src/lib/site-settings.json', 'utf8'));
const currentSeed = JSON.parse(fs.readFileSync('mark-rox/seed.json', 'utf8'));

console.log(`Current seed products: ${currentSeed.products.length}`);

// 1. Update settings with Instagram & detailed bio
if (projectSettings.instagram) {
  currentSeed.settings.instagram = projectSettings.instagram;
}
if (projectSettings.bioEn) {
  currentSeed.settings.bioEn = projectSettings.bioEn;
}
if (projectSettings.bioRu) {
  currentSeed.settings.bioRu = projectSettings.bioRu;
}

// 2. Check each artwork from projectCatalogue
let addedCount = 0;
for (const art of projectCatalogue) {
  const existing = currentSeed.products.find(p => p.id === art.id || (p.sku && p.sku === art.sku));
  if (!existing) {
    // Add new artwork
    const category = art.category.toLowerCase().includes('sculpt') ? 'sculpture' : 'painting';
    const dimensions = `${art.width} × ${art.height}${art.depth ? ' × ' + art.depth : ''} cm`;
    const price = art.priceCents ? art.priceCents / 100 : null;
    const newArt = {
      id: art.id,
      title: art.titleEn,
      category,
      availability: art.status === 'available' ? 'available' : 'sold',
      price,
      year: art.year || 2026,
      dimensions,
      mediumEn: art.mediumEn || (category === 'sculpture' ? 'Mixed media on acrylic cement' : 'Mixed media on canvas'),
      mediumRu: art.mediumRu || (category === 'sculpture' ? 'Смешанная техника на акриловом цементе' : 'Смешанная техника на холсте'),
      descriptionEn: art.descriptionEn || 'Original artwork by Mark Rox.',
      descriptionRu: art.descriptionRu || 'Оригинальная работа Mark Rox.',
      images: art.images || [],
      sku: art.sku || ('MRX-' + art.id.toUpperCase()),
      tags: art.tags || ['ARTonaut', 'Street art'],
      sourceUrl: art.sourceUrl || '',
      featured: false,
      published: true,
      version: 1
    };
    currentSeed.products.push(newArt);
    addedCount++;
    console.log(`+ Added new artwork from project: ${art.titleEn} (${art.id})`);
  } else {
    // Enhance existing artwork if descriptions/dimensions are better
    if (art.descriptionEn && (!existing.descriptionEn || existing.descriptionEn.length < 50)) {
      existing.descriptionEn = art.descriptionEn;
    }
    if (art.descriptionRu && (!existing.descriptionRu || existing.descriptionRu.length < 50)) {
      existing.descriptionRu = art.descriptionRu;
    }
    if (art.sku && !existing.sku) existing.sku = art.sku;
    if (art.priceCents && !existing.price) existing.price = art.priceCents / 100;
    // Add any missing images
    for (const img of (art.images || [])) {
      if (!existing.images.includes(img)) existing.images.push(img);
    }
    console.log(`~ Enhanced artwork: ${existing.title} (${existing.id})`);
  }
}

console.log(`Added ${addedCount} new artworks. Total products now: ${currentSeed.products.length}`);
fs.writeFileSync('mark-rox/seed.json', JSON.stringify(currentSeed, null, 2), 'utf8');

// Update all HTML files
function updateHtml(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const seedRegex = /window\.SEED\s*=\s*\{[\s\S]*?\};\s*window\.ASSETS/;
  if (seedRegex.test(content)) {
    content = content.replace(seedRegex, `window.SEED=${JSON.stringify(currentSeed)};window.ASSETS`);
    // Bump cache version to v3
    content = content.replace(/mr-demo-platform-v[12]/g, 'mr-demo-platform-v3');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated seed in ${filePath} to v3`);
  }
}

updateHtml('index.html');
updateHtml('mark-rox-preview.html');
updateHtml('admin.html');
updateHtml('mark-rox-admin-preview.html');

// Also update public/seed.js
fs.writeFileSync('mark-rox/public/seed.js', `window.SEED = ${JSON.stringify(currentSeed, null, 2)};\n`, 'utf8');
