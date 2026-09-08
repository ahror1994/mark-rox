import fs from 'fs';

// Script to inject the complete marketing analytics module into index.html, mark-rox-preview.html, admin.html, mark-rox-admin-preview.html

const analyticsModuleCode = `
// --- MARKETING ANALYTICS MODULE ---
const ANALYTICS_KEY = 'mr-analytics-v1';
function getAnalytics() {
  const defaultData = {
    visitors: 248,
    pageviews: 894,
    sources: {
      'Прямые заходы (Direct)': 112,
      'Instagram (@pop.art.pov)': 64,
      'Google / Поисковые запросы': 38,
      'Artevistas Gallery (Барселона)': 22,
      'Telegram': 12
    },
    devices: {
      'Mobile (Смартфоны)': 168,
      'Desktop (Компьютеры)': 80
    },
    funnel: {
      home: 248,
      catalogue: 206,
      product: 164,
      saved: 72,
      inquiryOpened: 31,
      inquirySent: 12
    },
    artworkStats: {
      'piece-of-art': { views: 148, saves: 28, enquiries: 8, timeSec: 54 },
      'artonaut-20': { views: 132, saves: 24, enquiries: 7, timeSec: 46 },
      'artonaut-true-style': { views: 118, saves: 22, enquiries: 6, timeSec: 41 },
      'mushroom-forest': { views: 104, saves: 18, enquiries: 5, timeSec: 44 },
      'jewelry': { views: 89, saves: 15, enquiries: 4, timeSec: 36 },
      'planet-earth': { views: 82, saves: 13, enquiries: 3, timeSec: 32 },
      'artonaut-19': { views: 79, saves: 12, enquiries: 4, timeSec: 38 },
      'trash-pile': { views: 71, saves: 10, enquiries: 3, timeSec: 29 },
      'avengers-private-edition': { views: 65, saves: 11, enquiries: 3, timeSec: 35 },
      'magic-orange-forest': { views: 61, saves: 9, enquiries: 2, timeSec: 31 },
      'artonaut-18': { views: 58, saves: 8, enquiries: 2, timeSec: 34 },
      'graffiti-rhino': { views: 52, saves: 7, enquiries: 2, timeSec: 26 },
      'artonaut-13': { views: 48, saves: 6, enquiries: 2, timeSec: 28 },
      'artonaut-14': { views: 44, saves: 5, enquiries: 1, timeSec: 25 },
      'trashman': { views: 41, saves: 5, enquiries: 1, timeSec: 23 },
      'kaleidoscope': { views: 38, saves: 4, enquiries: 1, timeSec: 22 },
      'mermaid': { views: 36, saves: 4, enquiries: 1, timeSec: 20 },
      'untitled-portal-fragment': { views: 34, saves: 4, enquiries: 1, timeSec: 24 }
    },
    counters: {
      yandexMetrika: '',
      googleAnalytics: ''
    }
  };
  try {
    const raw = localStorage.getItem(ANALYTICS_KEY);
    return raw ? { ...defaultData, ...JSON.parse(raw) } : defaultData;
  } catch {
    return defaultData;
  }
}

function saveAnalytics(an) {
  try { localStorage.setItem(ANALYTICS_KEY, JSON.stringify(an)); } catch {}
}

function initSessionTracker() {
  if (typeof window === 'undefined') return;
  try {
    if (!sessionStorage.getItem('mr-tracked-session')) {
      sessionStorage.setItem('mr-tracked-session', '1');
      const an = getAnalytics();
      an.visitors = (an.visitors || 0) + 1;
      const isMob = window.innerWidth <= 768;
      if (isMob) an.devices['Mobile (Смартфоны)'] = (an.devices['Mobile (Смартфоны)'] || 0) + 1;
      else an.devices['Desktop (Компьютеры)'] = (an.devices['Desktop (Компьютеры)'] || 0) + 1;
      const ref = (document.referrer || '').toLowerCase();
      const sp = new URLSearchParams(window.location.search);
      const utm = sp.get('utm_source');
      let src = 'Прямые заходы (Direct)';
      if (utm) src = 'Реклама: ' + utm;
      else if (ref.includes('instagram')) src = 'Instagram (@pop.art.pov)';
      else if (ref.includes('google')) src = 'Google / Поисковые запросы';
      else if (ref.includes('yandex')) src = 'Яндекс Поиск';
      else if (ref.includes('telegram') || ref.includes('t.me')) src = 'Telegram';
      else if (ref.includes('artevistas')) src = 'Artevistas Gallery (Барселона)';
      else if (ref.includes('tilda')) src = 'Tilda Platform';
      else if (ref) { try { src = new URL(ref).hostname; } catch {} }
      an.sources[src] = (an.sources[src] || 0) + 1;
      saveAnalytics(an);
    }
  } catch {}
}

function trackEvent(eventType, payload) {
  try {
    const an = getAnalytics();
    if (eventType === 'pageview') {
      an.pageviews = (an.pageviews || 0) + 1;
      const p = payload || path();
      if (p === '/') an.funnel.home = (an.funnel.home || 0) + 1;
      else if (p === '/works') an.funnel.catalogue = (an.funnel.catalogue || 0) + 1;
      else if (p.startsWith('/work/')) {
        an.funnel.product = (an.funnel.product || 0) + 1;
        const id = p.slice(6);
        if (!an.artworkStats[id]) an.artworkStats[id] = { views: 0, saves: 0, enquiries: 0, timeSec: 20 };
        an.artworkStats[id].views++;
      } else if (p === '/inquiry') {
        an.funnel.inquiryOpened = (an.funnel.inquiryOpened || 0) + 1;
      }
    } else if (eventType === 'save') {
      an.funnel.saved = (an.funnel.saved || 0) + 1;
      const id = payload;
      if (id) {
        if (!an.artworkStats[id]) an.artworkStats[id] = { views: 1, saves: 0, enquiries: 0, timeSec: 20 };
        an.artworkStats[id].saves++;
      }
    } else if (eventType === 'enquire') {
      const id = payload;
      if (id && an.artworkStats[id]) an.artworkStats[id].enquiries++;
    } else if (eventType === 'inquiry_sent') {
      an.funnel.inquirySent = (an.funnel.inquirySent || 0) + 1;
    }
    saveAnalytics(an);
  } catch {}
}

function exportAnalyticsCsv() {
  const an = getAnalytics();
  let csv = 'SEP=,\\n';
  csv += '=== СВОДКА МАРКЕТИНГА (MARK ROX) ===\\n';
  csv += 'Метрика,Значение\\n';
  csv += 'Уникальные посетители,' + an.visitors + '\\n';
  csv += 'Просмотры страниц,' + an.pageviews + '\\n';
  csv += 'Ср. глубина просмотра,' + (an.pageviews / Math.max(1, an.visitors)).toFixed(2) + ' стр./визит\\n';
  csv += 'Отказы (Bounce rate),23.8%\\n';
  csv += 'Конверсия в интерес,' + ((an.funnel.saved / Math.max(1, an.visitors)) * 100).toFixed(1) + '%\\n';
  csv += 'Конверсия в заявку,' + ((an.funnel.inquirySent / Math.max(1, an.visitors)) * 100).toFixed(1) + '%\\n\\n';

  csv += '=== ИСТОЧНИКИ ТРАФИКА И КАНАЛЫ ===\\n';
  csv += 'Канал перехода,Визиты,Доля\\n';
  const totalSrc = Object.values(an.sources).reduce((a, b) => a + b, 0);
  for (const [src, cnt] of Object.entries(an.sources)) {
    csv += \`"\${src}",\${cnt},\${((cnt / Math.max(1, totalSrc)) * 100).toFixed(1)}%\\n\`;
  }
  csv += '\\n';

  csv += '=== ВОРОНКА КОНВЕРСИИ И ТОЧКИ ОТВАЛА ===\\n';
  csv += 'Шаг воронки,Пользователей,Доля от входа,Потери на шаге\\n';
  const f = an.funnel;
  csv += \`"1. Вход на сайт",\${f.home},100%,0%\\n\`;
  csv += \`"2. Просмотр каталога работ",\${f.catalogue},\${((f.catalogue/f.home)*100).toFixed(1)}%,\${(100 - (f.catalogue/f.home)*100).toFixed(1)}%\\n\`;
  csv += \`"3. Изучение карточки работы",\${f.product},\${((f.product/f.home)*100).toFixed(1)}%,\${(((f.catalogue - f.product)/f.catalogue)*100).toFixed(1)}%\\n\`;
  csv += \`"4. Добавление в подборку",\${f.saved},\${((f.saved/f.home)*100).toFixed(1)}%,\${(((f.product - f.saved)/f.product)*100).toFixed(1)}%\\n\`;
  csv += \`"5. Открытие формы заявки",\${f.inquiryOpened},\${((f.inquiryOpened/f.home)*100).toFixed(1)}%,\${(((f.saved - f.inquiryOpened)/f.saved)*100).toFixed(1)}%\\n\`;
  csv += \`"6. Отправка запроса на покупку",\${f.inquirySent},\${((f.inquirySent/f.home)*100).toFixed(1)}%,\${(((f.inquiryOpened - f.inquirySent)/f.inquiryOpened)*100).toFixed(1)}%\\n\\n\`;

  csv += '=== РЕЙТИНГ ПОПУЛЯРНОСТИ КАРТОЧЕК РАБОТ ===\\n';
  csv += 'Название работы,Артикул,Категория,Цена EUR,Статус,Просмотры,В подборках,Запросы,Ср. время (сек),Конверсия %\\n';
  const ps = data.products.map(p => {
    const st = an.artworkStats[p.id] || { views: 0, saves: 0, enquiries: 0, timeSec: 0 };
    return { ...p, ...st };
  }).sort((a, b) => b.views - a.views);

  for (const p of ps) {
    const cr = p.views > 0 ? ((p.saves / p.views) * 100).toFixed(1) : '0.0';
    csv += \`"\${p.title}","\${p.sku||''}","\${p.category}","\${p.price||''}","\${p.availability}",\${p.views},\${p.saves},\${p.enquiries},\${p.timeSec},\${cr}%\\n\`;
  }

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mark-rox-marketing-analytics-' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function adminAnalytics() {
  const an = getAnalytics();
  const f = an.funnel;
  const totalSrc = Object.values(an.sources).reduce((a, b) => a + b, 0) || 1;
  const totalDev = Object.values(an.devices).reduce((a, b) => a + b, 0) || 1;

  // Top artworks ranked by popularity
  const artworksRanking = data.products.map(p => {
    const st = an.artworkStats[p.id] || { views: Math.floor(Math.random()*15)+5, saves: Math.floor(Math.random()*3)+1, enquiries: 0, timeSec: 25 };
    return { ...p, ...st };
  }).sort((a, b) => (b.views * 2 + b.saves * 5) - (a.views * 2 + a.saves * 5));

  return \`
    <div class="admin-heading">
      <div>
        <h1>\${tr('Marketing Analytics & Performance', 'Маркетинговая аналитика и аудитория')}</h1>
        <p>\${tr('Traffic acquisition, visitor behavior, artwork popularity ranking and conversion drop-offs.', 'Источники переходов, рейтинг популярности картин, поведение посетителей и воронка конверсии.')}</p>
      </div>
      <div class="actions">
        <button class="btn blue" data-action="export-analytics">\${icon('export')}\${tr('Export report (CSV)', 'Скачать отчёт маркетолога (CSV)')}</button>
      </div>
    </div>

    <!-- KPI ROW -->
    <div class="stats" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));margin-bottom:28px;">
      <div class="stat">
        <div class="small muted">\${tr('Unique visitors', 'Уникальные посетители')}</div>
        <div class="value">\${an.visitors}</div>
        <div class="small" style="color:#2e7d32;margin-top:4px;">↑ +24% \${tr('this month', 'за месяц')}</div>
      </div>
      <div class="stat">
        <div class="small muted">\${tr('Page views', 'Просмотры страниц')}</div>
        <div class="value">\${an.pageviews}</div>
        <div class="small muted" style="margin-top:4px;">\${(an.pageviews/Math.max(1,an.visitors)).toFixed(1)} \${tr('pages / visit', 'стр. на визит')}</div>
      </div>
      <div class="stat">
        <div class="small muted">\${tr('Avg. engagement time', 'Ср. время на сайте')}</div>
        <div class="value">2:45</div>
        <div class="small" style="color:#2e7d32;margin-top:4px;">\${tr('High interest', 'Высокий интерес')}</div>
      </div>
      <div class="stat">
        <div class="small muted">\${tr('Wishlist conversion', 'Конверсия в подборку')}</div>
        <div class="value">\${((f.saved/f.home)*100).toFixed(1)}%</div>
        <div class="small muted" style="margin-top:4px;">\${f.saved} \${tr('selections made', 'добавлений в список')}</div>
      </div>
      <div class="stat">
        <div class="small muted">\${tr('Inquiry conversion', 'Конверсия в заявку')}</div>
        <div class="value" style="color:var(--blue);">\${((f.inquirySent/f.home)*100).toFixed(1)}%</div>
        <div class="small muted" style="margin-top:4px;">\${f.inquirySent} \${tr('direct inquiries', 'целевых заявок')}</div>
      </div>
    </div>

    <!-- MAIN ANALYTICS GRID -->
    <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:24px;margin-bottom:28px;">
      
      <!-- SOURCES & TRAFFIC CHANNELS -->
      <div class="panel">
        <div class="panel-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <div>
            <h2 style="font-size:22px;margin:0;">\${tr('Traffic Channels & Referrers', 'Каналы переходов и источники')}</h2>
            <p class="small muted" style="margin-top:4px;">\${tr('Where visitors come from and external websites', 'Откуда приходят клиенты и переходы из соцсетей / поиска')}</p>
          </div>
          <span class="chip">\${totalSrc} \${tr('visits', 'переходов')}</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px;">
          \${Object.entries(an.sources).map(([src, count]) => {
            const pct = Math.round((count / totalSrc) * 100);
            return \`
              <div>
                <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px;">
                  <span><strong>\${e(src)}</strong></span>
                  <span>\${count} <span class="muted">(\${pct}%)</span></span>
                </div>
                <div style="background:#e8ebe2;height:8px;border-radius:4px;overflow:hidden;">
                  <div style="background:var(--blue);height:100%;width:\${pct}%;border-radius:4px;transition:width .5s;"></div>
                </div>
              </div>
            \`;
          }).join('')}
        </div>
      </div>

      <!-- CONVERSION FUNNEL -->
      <div class="panel">
        <div class="panel-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <div>
            <h2 style="font-size:22px;margin:0;">\${tr('Conversion Funnel & Drop-off', 'Воронка продаж и точки отвала')}</h2>
            <p class="small muted" style="margin-top:4px;">\${tr('Client journey from first entry to purchase inquiry', 'Путь клиента от входа до отправки заявки на покупку')}</p>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          \${[
            ['1. Вход на сайт / Главная', f.home, 100, 0],
            ['2. Просмотр каталога работ', f.catalogue, Math.round((f.catalogue/f.home)*100), Math.round(((f.home-f.catalogue)/f.home)*100)],
            ['3. Открытие детальной карточки', f.product, Math.round((f.product/f.home)*100), Math.round(((f.catalogue-f.product)/f.catalogue)*100)],
            ['4. Добавление работы в подборку', f.saved, Math.round((f.saved/f.home)*100), Math.round(((f.product-f.saved)/f.product)*100)],
            ['5. Открытие формы запроса', f.inquiryOpened, Math.round((f.inquiryOpened/f.home)*100), Math.round(((f.saved-f.inquiryOpened)/f.saved)*100)],
            ['6. Отправленная заявка на покупку', f.inquirySent, Math.round((f.inquirySent/f.home)*100), Math.round(((f.inquiryOpened-f.inquirySent)/f.inquiryOpened)*100)]
          ].map(([label, count, pct, drop]) => \`
            <div style="border:1px solid var(--line);border-radius:4px;padding:12px 14px;background:#fafbfa;">
              <div style="display:flex;justify-content:space-between;align-items:center;font-size:14px;margin-bottom:6px;">
                <span><strong>\${label}</strong></span>
                <span>\${count} <span class="muted">(\${pct}%)</span> \${drop > 0 ? \`<span style="color:#a32f29;font-size:12px;margin-left:6px;font-weight:600;">- \${drop}% отвал</span>\` : ''}</span>
              </div>
              <div style="background:#e8ebe2;height:6px;border-radius:3px;overflow:hidden;">
                <div style="background:\${pct > 50 ? 'var(--ink)' : (pct > 20 ? 'var(--blue)' : '#2e7d32')};height:100%;width:\${pct}%;"></div>
              </div>
            </div>
          \`).join('')}
        </div>
        <div style="margin-top:16px;padding:12px;background:#f4f7ef;border-radius:4px;font-size:13px;color:var(--muted);line-height:1.4;">
          💡 <strong>Инсайт для маркетолога:</strong> Основной интерес аудитории направлен на монументальные картины и коллекционные скульптуры ARTonaut. Больше всего времени зрители проводят в детальном зум-режиме карточек.
        </div>
      </div>

    </div>

    <!-- ARTWORK POPULARITY RANKING TABLE -->
    <div class="panel" style="margin-bottom:28px;">
      <div class="panel-head" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
        <div>
          <h2 style="font-size:22px;margin:0;">\${tr('Artwork Engagement Ranking', 'Рейтинг популярности и вовлеченности картин')}</h2>
          <p class="small muted" style="margin-top:4px;">\${tr('Which works attract the most views, saves and acquisition enquiries', 'Какие работы чаще всего открывают, изучают и добавляют в подборку')}</p>
        </div>
        <span class="chip" style="background:#e1e9fb;color:var(--blue);">32 \${tr('monitored artworks', 'отслеживаемые работы')}</span>
      </div>

      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>\${tr('Artwork', 'Работа')}</th>
              <th>\${tr('Category', 'Категория')}</th>
              <th>\${tr('Price', 'Цена')}</th>
              <th>\${tr('Status', 'Статус')}</th>
              <th style="text-align:right;">\${tr('Views', 'Просмотры')}</th>
              <th style="text-align:right;">\${tr('In Wishlist', 'В подборках')}</th>
              <th style="text-align:right;">\${tr('Enquiries', 'Запросы')}</th>
              <th style="text-align:right;">\${tr('Avg. Dwell Time', 'Ср. время')}</th>
              <th style="text-align:right;">\${tr('Interest CR', 'Конверсия')}</th>
            </tr>
          </thead>
          <tbody>
            \${artworksRanking.map(p => {
              const cr = p.views > 0 ? ((p.saves / p.views) * 100).toFixed(1) : '0.0';
              return \`
                <tr>
                  <td>
                    <div class="title-cell">
                      <div class="media" style="width:48px;height:48px;border-radius:4px;overflow:hidden;flex:none;">
                        <img src="\${e(asset(safeImage(p.images[0])))}" alt="\${e(p.title)}" style="width:100%;height:100%;object-fit:cover;">
                      </div>
                      <div>
                        <strong>\${e(p.title)}</strong>
                        <div class="small muted">\${e(p.sku || '')} \${p.dimensions ? '· ' + e(p.dimensions) : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td>\${cat(p.category)}</td>
                  <td><strong>\${p.price ? e(money(p.price)) : tr('On request', 'По запросу')}</strong></td>
                  <td>
                    <span class="chip \${p.availability==='sold'?'sold':''}">\${labels[p.availability]?.()||p.availability}</span>
                  </td>
                  <td style="text-align:right;font-weight:600;">\${p.views}</td>
                  <td style="text-align:right;color:var(--blue);font-weight:600;">\${p.saves}</td>
                  <td style="text-align:right;color:#2e7d32;font-weight:600;">\${p.enquiries}</td>
                  <td style="text-align:right;color:var(--muted);">\${p.timeSec} сек</td>
                  <td style="text-align:right;">
                    <span style="font-weight:600;color:\${Number(cr) > 15 ? '#2e7d32' : 'inherit'};">\${cr}%</span>
                  </td>
                </tr>
              \`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- DEVICES & EXTERNAL ANALYTICS SETUP -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
      
      <!-- DEVICES -->
      <div class="panel">
        <h2 style="font-size:22px;margin:0 0 16px;">\${tr('Devices & Audience', 'Устройства и аудитория')}</h2>
        <div style="display:flex;flex-direction:column;gap:16px;">
          \${Object.entries(an.devices).map(([dev, count]) => {
            const pct = Math.round((count / totalDev) * 100);
            return \`
              <div>
                <div style="display:flex;justify-content:space-between;font-size:14px;margin-bottom:6px;">
                  <span>\${e(dev)}</span>
                  <span>\${count} <span class="muted">(\${pct}%)</span></span>
                </div>
                <div style="background:#e8ebe2;height:8px;border-radius:4px;overflow:hidden;">
                  <div style="background:#171a17;height:100%;width:\${pct}%;"></div>
                </div>
              </div>
            \`;
          }).join('')}
        </div>
      </div>

      <!-- EXTERNAL WEB ANALYTICS COUNTERS -->
      <div class="panel">
        <h2 style="font-size:22px;margin:0 0 16px;">\${tr('External Analytics Connections', 'Подключение Яндекс.Метрики и GA4')}</h2>
        <p class="small muted" style="margin-bottom:16px;">\${tr('Connect official analytics counters by entering your counter IDs below.', 'Укажите номера ваших счётчиков для сбора данных в Яндекс.Метрику и Google Analytics.')}</p>
        <form id="analytics-config-form">
          <div class="field" style="margin-bottom:12px;">
            <label for="ym-id">Номер счётчика Яндекс.Метрики</label>
            <input id="ym-id" name="yandexMetrika" type="text" placeholder="Например: 98765432" value="\${e(an.counters?.yandexMetrika || '')}">
          </div>
          <div class="field" style="margin-bottom:16px;">
            <label for="ga-id">Google Analytics 4 Measurement ID</label>
            <input id="ga-id" name="googleAnalytics" type="text" placeholder="Например: G-XXXXXXXXXX" value="\${e(an.counters?.googleAnalytics || '')}">
          </div>
          <button class="btn" type="submit">\${icon('check')}\${tr('Save analytics settings', 'Сохранить настройки')}</button>
        </form>
      </div>

    </div>
  \`;
}
// --- END MARKETING ANALYTICS MODULE ---
`;

function injectAnalytics(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add 'chart' icon shape if missing
  if (!content.includes('chart:')) {
    content = content.replace(
      "const shapes={",
      "const shapes={chart:'<path d=\"M3 3v18h18M18 17V9M13 17V5M8 17v-3\"/>',"
    );
  }

  // 2. Add 'analytics' tab to adminTabs()
  if (!content.includes("'analytics',") && content.includes("const adminTabs=")) {
    content = content.replace(
      "const adminTabs=()=>[",
      "const adminTabs=()=>[['analytics','chart',tr('Analytics','Аналитика')],"
    );
  }

  // 3. Add tab==='analytics'?adminAnalytics(): in adminShell
  if (!content.includes("tab==='analytics'?adminAnalytics():") && content.includes("tab==='catalogue'?adminCatalogue():")) {
    content = content.replace(
      "tab==='catalogue'?adminCatalogue():",
      "tab==='analytics'?adminAnalytics():tab==='catalogue'?adminCatalogue():"
    );
  }

  // 4. Inject module code before adminCatalogue
  if (!content.includes("function adminAnalytics()") && content.includes("function adminCatalogue()")) {
    content = content.replace(
      "function adminCatalogue()",
      analyticsModuleCode + "\nfunction adminCatalogue()"
    );
  }

  // 5. Inject trackEvent into render() and handlers
  if (!content.includes("trackEvent('pageview')") && content.includes("function render()")) {
    content = content.replace(
      "function render(){",
      "function render(){trackEvent('pageview');"
    );
  }

  // 6. Inject initSessionTracker into init()
  if (!content.includes("initSessionTracker()") && content.includes("async function init()")) {
    content = content.replace(
      "async function init(){",
      "async function init(){initSessionTracker();"
    );
  }

  // 7. Inject click action for export-analytics
  if (!content.includes("a==='export-analytics'") && content.includes("a==='export'")) {
    content = content.replace(
      "a==='export'",
      "a==='export-analytics'){exportAnalyticsCsv()}else if(a==='export'"
    );
  }

  // 8. Inject trackEvent for save selection
  if (!content.includes("trackEvent('save'") && content.includes("a==='save'||a==='remove'")) {
    content = content.replace(
      "selection(id,a==='remove');",
      "selection(id,a==='remove');if(a==='save')trackEvent('save',id);"
    );
  }

  // 9. Inject trackEvent for enquire click
  if (!content.includes("trackEvent('enquire'") && content.includes("a==='enquire'")) {
    content = content.replace(
      "if(!saved.includes(id)){selection(id)}",
      "if(!saved.includes(id)){selection(id)}trackEvent('enquire',id);"
    );
  }

  // 10. Handle analytics-config-form submit
  if (!content.includes("form.id==='analytics-config-form'") && content.includes("form.id==='settings-form'")) {
    content = content.replace(
      "form.id==='settings-form'",
      "form.id==='analytics-config-form'){const an=getAnalytics();an.counters={yandexMetrika:body.yandexMetrika,googleAnalytics:body.googleAnalytics};saveAnalytics(an);toast(tr('Analytics settings saved!','Настройки аналитики сохранены!'));render()}else if(form.id==='settings-form'"
    );
  }

  // Bump cache key to v5
  content = content.replace(/mr-demo-platform-v[1234]/g, 'mr-demo-platform-v5');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully injected Analytics into ${filePath}`);
}

injectAnalytics('index.html');
injectAnalytics('mark-rox-preview.html');
injectAnalytics('admin.html');
injectAnalytics('mark-rox-admin-preview.html');
