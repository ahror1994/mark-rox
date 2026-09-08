import fs from 'fs';

function patchFiles(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove restriction in selection
  content = content.replace(
    'if(!p||[\'sold\',\'reserved\'].includes(p.availability))return;',
    'if(!p)return;'
  );

  // Remove restriction in demoApi
  content = content.replace(
    'if(items.some(x=>!x?.published||[\'sold\',\'reserved\'].includes(x.availability)))throw Error(tr(\'A selected work is no longer available. Refresh your selection.\',\'Одна из работ больше недоступна. Обновите список.\'));',
    '// allow sold in inquiry'
  );

  fs.writeFileSync(filePath, content, 'utf8');
}

patchFiles('index.html');
patchFiles('mark-rox-preview.html');
console.log('Patched selection restrictions.');
