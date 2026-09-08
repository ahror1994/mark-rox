import fs from 'fs';
const existingSeed = JSON.parse(fs.readFileSync('mark-rox/seed.json', 'utf8'));

function updateAdmin(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  const seedRegex = /window\.SEED\s*=\s*\{[\s\S]*?\};\s*window\.ASSETS/;
  if (seedRegex.test(content)) {
    content = content.replace(seedRegex, `window.SEED=${JSON.stringify(existingSeed)};window.ASSETS`);
    content = content.replace(/mr-demo-platform-v1/g, 'mr-demo-platform-v2');
    content = content.replace(
      /\['www\.artevistas\.eu',\s*'artevistas\.eu'\]\.includes\(x\.hostname\)/g,
      `['www.artevistas.eu','artevistas.eu','static.tildacdn.one','static.tildacdn.net','static.tildacdn.com'].includes(x.hostname)`
    );
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

updateAdmin('admin.html');
updateAdmin('mark-rox-admin-preview.html');
