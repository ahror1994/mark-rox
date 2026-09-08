import fs from 'fs';
const files = ['index.html', 'admin.html', 'mark-rox-preview.html', 'mark-rox-admin-preview.html'];
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
  if (scriptMatch) {
    try {
      new Function(scriptMatch[1]);
      console.log(`[OK] ${f} syntax is 100% VALID`);
    } catch (err) {
      console.error(`[ERR] ${f}:`, err.message);
    }
  }
}
