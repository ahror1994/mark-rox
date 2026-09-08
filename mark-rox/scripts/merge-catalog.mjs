import fs from 'fs';

const artevistas = JSON.parse(fs.readFileSync('mark-rox/scripts/parsed-artevistas.json', 'utf8'));
const tilda = JSON.parse(fs.readFileSync('mark-rox/scripts/parsed-tilda.json', 'utf8'));

console.log(`Artevistas count: ${artevistas.length}`);
console.log(`Tilda count: ${tilda.length}`);

// Clean HTML tags and br
function cleanHtml(s) {
  if (!s) return '';
  return s.replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .trim();
}

// Translations and metadata dictionary
const metaDict = {
  'piece-of-art': {
    title: 'Piece of Art',
    titleRu: 'Piece of Art',
    mediumRu: 'Масло на холсте',
    mediumEn: 'Oil on canvas',
    descriptionEn: 'A monumental canvas capturing Mark Rox\'s raw pop-art street style. High-contrast typography and urban textures merge with classic oil technique. Featured at Artevistas Gallery, Barcelona.',
    descriptionRu: 'Монументальное полотно, сочетающее бунтарскую энергию уличного поп-арта и классическую масляную живопись. Слои графики, типографики и городской текстуры создают мощный визуальный манифест.',
    tags: ['Painting', 'Street Art', 'Monumental']
  },
  'jewelry': {
    title: 'Jewelry',
    titleRu: 'Jewelry',
    mediumRu: 'Смешанная техника на холсте',
    mediumEn: 'Mixed media on canvas',
    descriptionEn: 'Urban debris and consumer aesthetics transformed into jewel-like visual compositions. Multi-layered textures with spray paint, acrylics and collage.',
    descriptionRu: 'Эстетика городского хаоса и предметов потребления, переосмысленная в визуальные «драгоценности». Многослойная фактура, аэрозоль, акрил и коллаж.',
    tags: ['Painting', 'Pop Art']
  },
  'trash-pile': {
    title: 'Trash Pile',
    titleRu: 'Trash Pile',
    mediumRu: 'Смешанная техника на холсте',
    mediumEn: 'Mixed media on canvas',
    descriptionEn: 'Part of the eco-manifesto series exploring excess, waste and consumption culture through bold colors and layered street-art techniques.',
    descriptionRu: 'Работа из серии экологического манифеста, исследующая культуру перепотребления через сочные цвета, динамичные мазки и слои уличной графики.',
    tags: ['Painting', 'Eco', 'Street Art']
  },
  'car-garbage-pile': {
    title: 'Car Garbage Pile',
    titleRu: 'Car Garbage Pile',
    mediumRu: 'Смешанная техника на холсте',
    mediumEn: 'Mixed media on canvas',
    descriptionEn: 'Industrial forms and automobile debris reimagined as an energetic abstraction of modern city life and vehicular overload.',
    descriptionRu: 'Индустриальные силуэты и автомобильная эстетика в экспрессивной абстракции, отражающей ритм и перегрузку современного мегаполиса.',
    tags: ['Painting', 'Industrial', 'Pop Art']
  },
  'trash': {
    title: 'Trash',
    titleRu: 'Trash',
    mediumRu: 'Смешанная техника на холсте',
    mediumEn: 'Mixed media on canvas',
    descriptionEn: 'Direct, unapologetic pop-art composition challenging traditional aesthetic boundaries with raw street textures and neon accents.',
    descriptionRu: 'Прямолинейная композиция в стиле поп-арт, бросающая вызов традиционной эстетике с помощью дерзких уличных текстур и неоновых акцентов.',
    tags: ['Painting', 'Pop Art']
  },
  'planet-earth': {
    title: 'Planet Earth',
    titleRu: 'Planet Earth',
    mediumRu: 'Смешанная техника на холсте',
    mediumEn: 'Mixed media on canvas',
    descriptionEn: 'A visionary piece contrasting planetary vulnerability with urban saturation. A dialogue between cosmic scale and street reality.',
    descriptionRu: 'Контраст хрупкости планеты и плотности урбанистического мира. Диалог космического масштаба и приземлённой уличной реальности.',
    tags: ['Painting', 'Space', 'Pop Art']
  },
  'garbage': {
    title: 'Garbage',
    titleRu: 'Garbage',
    mediumRu: 'Смешанная техника на холсте',
    mediumEn: 'Mixed media on canvas',
    descriptionEn: 'Expressionist textures and vibrant palette interrogating modern disposable culture.',
    descriptionRu: 'Экспрессионистские текстуры и сочная палитра, поднимающие тему одноразовой культуры современного общества.',
    tags: ['Painting', 'Pop Art']
  },
  'trashman': {
    title: 'Trashman',
    titleRu: 'Trashman',
    mediumRu: 'Смешанная техника на холсте',
    mediumEn: 'Mixed media on canvas',
    descriptionEn: 'An urban character study blending comic-book aesthetics with underground street art ethos.',
    descriptionRu: 'Городской персонаж на стыке комикс-эстетики и духа андеграундного уличного искусства.',
    tags: ['Painting', 'Character', 'Street Art']
  },
  'artonaut-20': {
    title: 'ARTonaut #20',
    titleRu: 'ARTonaut #20',
    mediumRu: 'Смешанная техника на акриловом цементе',
    mediumEn: 'Mixed media on acrylic cement',
    descriptionEn: 'The milestone 20th sculpture in the ARTonaut odyssey. Sculptural acrylic cement with complex hand-painted pop-art finish and collector edition status.',
    descriptionRu: 'Юбилейная 20-я скульптура в серии ARTonaut. Акриловый цемент с авторской многослойной росписью в фирменном поп-арт стиле.',
    tags: ['ARTonaut', 'Sculpture', 'Milestone']
  },
  'graffiti-rhino': {
    title: 'Graffiti Rhino',
    titleRu: 'Graffiti Rhino',
    mediumRu: 'Смешанная техника на холсте',
    mediumEn: 'Mixed media on canvas',
    descriptionEn: 'Wild animal power fused with urban tag culture and ultraviolet acrylic pigments.',
    descriptionRu: 'Мощь дикой природы, соединённая с культурой уличных тегов и ультрафиолетовым акрилом.',
    tags: ['Painting', 'UV', 'Animal']
  },
  'alberto-blanchart-artonaut-colab': {
    title: 'Alberto Blanchart × ARTonaut #Colab',
    titleRu: 'Alberto Blanchart × ARTonaut #Colab',
    mediumRu: 'Смешанная техника на акриловом цементе',
    mediumEn: 'Mixed media on acrylic cement',
    descriptionEn: 'Exclusive collaborative sculpture created in partnership with Alberto Blanchart. A rare collector\'s item combining distinct artistic languages.',
    descriptionRu: 'Эксклюзивная совместная работа с Альберто Бланшаром. Редкий коллекционный объект, объединивший два уникальных творческих взгляда.',
    tags: ['ARTonaut', 'Sculpture', 'Collaboration']
  }
};

const allProducts = [];
const seenSlugs = new Set();

// 1. Process Artevistas products
for (const art of artevistas) {
  let slug = art.id.replace(/^mark-rox-?/i, '');
  if (slug === 'artonaut-20') slug = 'artonaut-20';
  seenSlugs.add(slug);

  const dict = metaDict[slug] || {};
  
  // Find matching Tilda item if exists
  const tildaMatch = tilda.find(t => {
    const tTitle = t.title.toLowerCase();
    const aTitle = art.title.toLowerCase();
    if (tTitle.includes('piece of art') && aTitle.includes('piece of art')) return true;
    if (tTitle.includes('19') && aTitle.includes('19')) return true;
    if (tTitle.includes('13') && aTitle.includes('13')) return true;
    if (tTitle.includes('12') && aTitle.includes('12')) return true;
    if (tTitle.includes('11') && aTitle.includes('11')) return true;
    if (tTitle.includes('orange forest') && aTitle.includes('mushroom forest')) return true;
    return false;
  });

  let title = dict.title || art.title;
  let price = art.price;
  let availability = art.availability;
  let dimensions = art.dimensions;
  let year = art.year;
  let mediumEn = dict.mediumEn || art.mediumEn;
  let mediumRu = dict.mediumRu || (art.category === 'sculpture' ? 'Смешанная техника на акриловом цементе' : 'Смешанная техника на холсте');
  let descriptionEn = dict.descriptionEn || '';
  let descriptionRu = dict.descriptionRu || '';
  let images = [...art.images];

  if (tildaMatch) {
    if (tildaMatch.price && !price) price = parseFloat(tildaMatch.price);
    if (tildaMatch.text) {
      const cleanDesc = cleanHtml(tildaMatch.text);
      if (!descriptionEn) descriptionEn = cleanDesc;
      if (!descriptionRu) descriptionRu = cleanDesc;
    }
    // Add images from Tilda gallery
    try {
      const tGal = JSON.parse(tildaMatch.gallery || '[]');
      for (const item of tGal) {
        if (item.img && !images.includes(item.img)) images.push(item.img);
      }
    } catch {}
  }

  if (!descriptionEn) {
    descriptionEn = art.category === 'sculpture'
      ? 'A sculptural work from the ARTonaut collection, made with mixed media on acrylic cement. Explore the object from different angles in the image gallery.'
      : 'Original artwork by Mark Rox, created with mixed media techniques. Layered textures and expressive urban forms.';
  }
  if (!descriptionRu) {
    descriptionRu = art.category === 'sculpture'
      ? 'Скульптура из коллекции ARTonaut, выполненная в смешанной технике на акриловом цементе. Рассмотрите работу с разных ракурсов в галерее фотографий.'
      : 'Оригинальная работа Mark Rox, выполненная в смешанной технике. Многослойная фактура и экспрессивные формы городского искусства.';
  }

  allProducts.push({
    id: slug,
    title,
    category: art.category,
    availability,
    price,
    year,
    dimensions: dimensions || '38 × 22 × 24 cm',
    mediumEn,
    mediumRu,
    descriptionEn,
    descriptionRu,
    images,
    sku: art.sku || ('MRX-' + slug.toUpperCase().slice(0, 8)),
    tags: dict.tags || (art.category === 'sculpture' ? ['ARTonaut', 'Sculpture'] : ['Painting', 'Pop Art']),
    sourceUrl: art.sourceUrl,
    featured: ['piece-of-art', 'artonaut-20', 'artonaut-true-style', 'planet-earth'].includes(slug),
    published: true,
    version: 1
  });
}

// 2. Process unique Tilda products not in Artevistas
for (const t of tilda) {
  // Generate slug from title
  let cleanTitle = t.title.replace(/^[🚀🪐🌍\s]+/, '').trim();
  let slug = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  
  // Check if already matched
  if (allProducts.some(p => p.id === slug || p.title.toLowerCase() === cleanTitle.toLowerCase())) {
    continue;
  }
  if (seenSlugs.has(slug)) continue;

  const tPrice = t.price ? parseFloat(t.price) : null;
  const isSold = t.quantity === '0' || t.quantity === 0;
  const availability = isSold ? 'sold' : (tPrice ? 'available' : 'on_request');
  const isSculpture = /artonaut/i.test(cleanTitle);

  // Gallery
  const images = [];
  try {
    const tGal = JSON.parse(t.gallery || '[]');
    for (const item of tGal) {
      if (item.img && !images.includes(item.img)) images.push(item.img);
    }
  } catch {}
  if (t.editions?.[0]?.img && !images.includes(t.editions[0].img)) {
    images.unshift(t.editions[0].img);
  }

  const cleanDesc = cleanHtml(t.text || t.descr || '');
  
  // Dimensions
  let dimensions = '';
  if (t.pack_x && t.pack_y) {
    dimensions = `${t.pack_x} × ${t.pack_y} cm`;
  }
  const dimMatch = cleanDesc.match(/(\d+(?:[.,]\d+)?\s*[×x]\s*\d+(?:[.,]\d+)?(?:\s*[×x]\s*\d+(?:[.,]\d+)?)?\s*cm)/i);
  if (dimMatch) dimensions = dimMatch[1];
  if (!dimensions) dimensions = isSculpture ? '38 × 22 × 24 cm' : '150 × 100 cm';

  allProducts.push({
    id: slug,
    title: cleanTitle,
    category: isSculpture ? 'sculpture' : 'painting',
    availability,
    price: tPrice,
    year: 2026,
    dimensions,
    mediumEn: isSculpture ? 'Mixed media on acrylic cement' : 'Mixed media on canvas',
    mediumRu: isSculpture ? 'Смешанная техника на акриловом цементе' : 'Смешанная техника на холсте',
    descriptionEn: cleanDesc || 'Exclusive work from Mark Rox studio collection.',
    descriptionRu: cleanDesc || 'Эксклюзивная работа из студийной коллекции Mark Rox.',
    images: images.filter(Boolean),
    sku: t.externalid ? 'TIL-' + t.externalid.slice(0, 8).toUpperCase() : 'TIL-' + slug.toUpperCase().slice(0, 8),
    tags: isSculpture ? ['ARTonaut', 'Sculpture'] : ['Painting', 'Pop Art', 'UV'],
    sourceUrl: t.url || 'https://project12074511.tilda.ws/',
    featured: ['artonaut-9', 'avengers-private-edition', 'magic-orange-forest'].includes(slug),
    published: true,
    version: 1
  });
}

// 3. Add Graffiti Giraffe from original seed if missing
if (!allProducts.some(p => p.id === 'graffiti-giraffe')) {
  allProducts.push({
    id: 'graffiti-giraffe',
    title: 'Graffiti Giraffe',
    category: 'painting',
    availability: 'sold',
    price: 9500,
    year: 2026,
    dimensions: '195 × 130 × 2 cm',
    mediumEn: 'Mixed media on canvas',
    mediumRu: 'Смешанная техника на холсте',
    descriptionEn: 'Nature meets the visual rhythm of the city. The giraffe becomes a surface for graffiti; ultraviolet acrylic changes the perception of its layered colours. Archive piece.',
    descriptionRu: 'Природа встречается с визуальным ритмом города. Фигура жирафа становится пространством для граффити, а ультрафиолетовый акрил меняет восприятие цветовых слоёв.',
    images: [
      'https://www.artevistas.eu/wp-content/uploads/2026/01/Mark-Rox-Graffiti-Giraffe-scaled.jpg',
      'https://www.artevistas.eu/wp-content/uploads/2026/01/Mark-Rox-Graffiti-Giraffe-UV-scaled.jpeg',
      'https://www.artevistas.eu/wp-content/uploads/2026/01/Mark-Rox-Graffiti-Giraffe-web-scaled.jpg'
    ],
    sku: 'CUMROX3466',
    tags: ['Painting', 'UV', 'AR'],
    sourceUrl: 'https://www.artevistas.eu/product/mark-rox-graffiti-giraffe/',
    featured: false,
    published: true,
    version: 1
  });
}

console.log(`\nTOTAL UNIQUE PRODUCTS: ${allProducts.length}`);
for (const p of allProducts) {
  console.log(`- [${p.availability.toUpperCase()}] ${p.title} (${p.category}) - ${p.price ? p.price + ' EUR' : 'No price'} [${p.images.length} imgs]`);
}

fs.writeFileSync('mark-rox/scripts/merged-products.json', JSON.stringify(allProducts, null, 2), 'utf8');
console.log('Successfully written merged-products.json');
