// node dev/testes/verificar-html.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'star_wars_firebase.html'), 'utf8');
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)];
assert.equal(scripts.length, (html.match(/<script\b/gi) || []).length, 'Todo script precisa de fechamento; um script aberto esconde os modais seguintes');
for (const [, attributes, body] of scripts) {
    const src = attributes.match(/\bsrc="([^"]+)"/);
    assert.ok(src, 'O HTML usa scripts externos; não reinserir o código antigo dentro da página');
    assert.equal(body.trim(), '', 'Scripts externos não devem conter código duplicado');
    assert.ok(fs.existsSync(path.join(root, src[1])), `Script ausente: ${src[1]}`);
}
const markup = html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
const ids = [...markup.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(ids.length, new Set(ids).size, 'IDs do HTML devem ser únicos');
for (const id of ['classModal', 'classSelector', 'classDetails', 'speciesModal', 'speciesFormModal', 'speciesIconModal', 'skillUsesModal', 'choiceModal', 'inventoryModal', 'attackModal', 'libraryModal', 'libraryTabs', 'librarySearch', 'libraryList', 'libraryDetails']) {
    assert.ok(ids.includes(id), `Elemento ausente fora dos scripts: ${id}`);
}
console.log('HTML: scripts externos íntegros e modais presentes sem IDs duplicados: OK.');
