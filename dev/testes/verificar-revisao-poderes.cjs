// node dev/testes/verificar-revisao-poderes.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const context = vm.createContext({ window: {}, document: { addEventListener() {} } });
vm.runInContext(read('js/estado.js').split('let syncStatusTimer')[0], context);
for (const file of ['js/dados/biblioteca.js', 'js/dados/biblioteca-detalhes.js', 'js/regras/biblioteca.js', 'js/referencia.js']) vm.runInContext(read(file), context);
const data = JSON.parse(vm.runInContext('JSON.stringify({ names: LIBRARY_DATA.forcePowers.items, details: LIBRARY_ITEM_DETAILS })', context));
const sources = JSON.parse(read('dev/referencias/fontes-poderes.json'));
assert.equal(data.names.length, 91, 'Todas as entradas antigas continuam consultáveis');
assert.equal(data.names.filter(name => data.details[name].kind === 'aptitude').length, 4);
for (const source of sources) {
    const detail = data.details[source.name];
    assert.ok(detail, source.name + ': descrição presente');
    assert.equal(detail.reviewedOn, '2026-10-14', source.name + ': revisão completa');
    const url = new URL(detail.sourceUrl);
    assert.equal(url.hostname, 'swse.fandom.com');
    assert.match(url.searchParams.get('oldid') || '', /^\d+$/, source.name + ': revisão da fonte identificada');
    assert.ok(detail.text && !detail.text.includes('\ufffd') && !detail.text.includes('???'), source.name + ': texto íntegro');
    if (detail.kind === 'aptitude') {
        assert.ok(detail.sourceNote, source.name + ': classificação explicada');
        assert.ok(data.details[detail.canonicalName], source.name + ': aptidão correta disponível');
    } else {
        assert.match(detail.text, /Tempo: .*\nAlvos?: /, source.name + ': tempo e alvos');
        if (!detail.source.startsWith('Livro PT-BR')) {
            assert.deepEqual((detail.checks || []).map(row => row.cd), source.cds, source.name + ': CDs da fonte');
            assert.equal(detail.sourceLicense, 'CC-BY-SA');
        }
        if (source.homebrew) assert.match(detail.sourceNote, /[Cc]aseira/);
        if (source.form) assert.ok(detail.special.includes('Forma de Sabre'), source.name + ': benefício da forma');
    }
}
vm.runInContext(`
    const block = LIBRARY_ITEM_DETAILS['Bloqueio Desequilibrante (Unbalancing Block)'];
    const copied = getLibraryCopyText(LIBRARY_DATA.forcePowers.label, 'Bloqueio Desequilibrante', null, block);
    for (const rule of ['Reação', 'metade do dano', 'Defesa de Vontade', 'fim do seu próximo turno', '+2 dados de dano', 'primeiro ataque', 'Ponto da Força', 'não sofrer dano', 'sabre de luz ativado', 'Trakata', 'oldid=86356', 'CC-BY-SA']) {
        if (!copied.includes(rule)) throw new Error('Bloqueio Desequilibrante: regra faltando ' + rule);
    }
    const note = LIBRARY_ITEM_DETAILS['Impulso da Força (Force Thrust)'];
    const output = renderLibrarySource(note);
    if (!output.includes('incompleto') || !output.includes('noopener noreferrer')) throw new Error('Notas e link da fonte');
`, context);
const checks = (english, expected) => {
    const name = data.names.find(name => name.endsWith('(' + english + ')'));
    assert.deepEqual(data.details[name].checks.map(row => [row.cd, row.effect.match(/\d+d\d+/)?.[0] || null]), expected, english);
};
checks('Force Blast', [['15', '2d6'], ['20', '3d6'], ['25', '4d6'], ['30', '5d6']]);
checks('Dark Transfer', [['15', null], ['20', null], ['25', null], ['30', null]]);
checks('Move Object', [['15', '2d6'], ['20', '4d6'], ['25', '6d6'], ['30', '8d6'], ['35', '10d6']]);
assert.ok(data.details['Balistocinese (Ballistakinesis)'].text.includes('3d8'));
assert.ok(data.details['Barreira de Lâminas (Barrier of Blades)'].text.includes('Ação rápida'));
assert.ok(data.details['Dobrar o Espaço (Fold Space)'].text.includes('rodada completa'));
assert.ok(data.details['Aperto da Força (Force Grip)'].sourceNote.includes('ambiguidade'));
assert.ok(read('js/talentos.js').includes('${renderLibrarySource(detail)}'), 'O seletor da ficha também mostra a fonte e as ressalvas');
console.log('91 entradas revisadas: fontes, CDs, classificação, regras críticas e cópia completa: OK.');
