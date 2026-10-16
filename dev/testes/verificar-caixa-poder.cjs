const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const read = file => fs.readFileSync(path.join(__dirname, '../..', file), 'utf8');
const context = vm.createContext({
    document: { addEventListener() {} }, window: {},
    getLibraryImageUrl: () => '',
});
vm.runInContext(read('js/estado.js').split('let syncStatusTimer')[0], context);
for (const file of ['js/dados/biblioteca.js', 'js/dados/biblioteca-detalhes.js', 'js/regras/biblioteca.js', 'js/referencia.js']) vm.runInContext(read(file), context);
context.assert = assert;
vm.runInContext(String.raw`
    LIBRARY_DATA.forcePowers.items.forEach((name, index) => {
        const detail = LIBRARY_ITEM_DETAILS[name];
        const html = renderForcePowerCard(name, detail, index);
        for (const line of detail.text.split('\n').filter(Boolean)) {
            const colon = line.indexOf(':');
            const expected = /^(Tempo|Alvos?):/.test(line) ? line.slice(colon + 1).trim() : line;
            assert.ok(html.includes(escapeHtml(expected)), name + ': missing text');
        }
        if (detail.special) assert.ok(html.includes(escapeHtml(detail.special)), name + ': special');
        for (const row of detail.checks || []) assert.ok(html.includes(escapeHtml(row.effect)), name + ': table');
        if (detail.descriptor?.includes('Lado Sombrio')) assert.ok(html.includes('dark-side'));
        if (detail.descriptor?.includes('Lado Claro')) assert.ok(html.includes('light-side'));
        if (detail.descriptor?.includes('Forma de Sabre')) {
            assert.ok(html.includes('saber-form'));
            assert.ok(html.includes(escapeHtml(LIGHTSABER_FORM_RULES)));
        }
        assert.ok(!html.includes('<strong>Descritor:</strong>'));
    });
    assert.ok(renderForcePowerCard('<script>', { text: '<img onerror=test>' }, 0).includes('&lt;img onerror=test&gt;'));
`, context);
console.log('OK: 91 power cards preserve text, tables, descriptors and escaping.');
