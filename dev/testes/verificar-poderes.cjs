// node dev/testes/verificar-poderes.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const context = vm.createContext({ assert, console, window: {}, document: { addEventListener() {} } });
for (const file of ['js/estado.js', 'js/dados/biblioteca.js', 'js/dados/biblioteca-detalhes.js', 'js/dados/prerequisitos-talentos.js', 'js/regras/biblioteca.js', 'js/referencia.js', 'js/regras/talentos.js', 'js/talentos.js']) {
    vm.runInContext(file === 'js/estado.js' ? read(file).split('let syncStatusTimer')[0] : read(file), context);
}
vm.runInContext(`
    const power = 'Explosão da Força (Force Blast)';
    const other = 'Arremeter (Surge)';
    const legacy = 'Meu poder personalizado';
    const sheet = { id: 1, classes: [], escolhas: [], forcePowers: [power, power, legacy], noteDetails: {} };
    sheet.noteDetails['force_' + encodeURIComponent(power)] = 'Minha anotação';
    sheets = [sheet, { id: 2, forcePowers: [other] }];
    let saved = [];
    function findSheet(id) { return sheets.find(sheet => sheet.id === id); }
    function renderLibraryIcon() { return '<img alt="">'; }
    function closeModal() {}
    function renderSheets() {}
    function scheduleSave(id) { saved.push(id); }
    assert.equal(findForcePowerName('Force Blast'), power);
    assert.equal(findForcePowerName('explosão da força'), power);
    assert.equal(findForcePowerName('Outro nome (Force Blast)'), power);
    assert.equal(findForcePowerName(legacy), null);
    assert.equal(findForcePowerName(''), null);
    const memoryName = 'Caminhada pela Memória (Memory Walk)';
    assert.equal(findForcePowerName('Memory Walk'), memoryName);
    assert.ok(LIBRARY_DATA.forcePowers.items.includes(memoryName));
    const memory = LIBRARY_ITEM_DETAILS[memoryName];
    assert.deepEqual(memory.checks.map(row => row.cd), ['20', '25', '30', '35']);
    assert.ok(memory.text.includes('Defesa de Vontade'));
    assert.ok(memory.text.includes('2d6'));
    assert.ok(memory.text.includes('Inteligência 3'));
    assert.ok(memory.checks[3].effect.includes('a ação padrão e a ação rápida'));
    assert.ok(memory.special.includes('CD 15 + dano sofrido'));
    assert.equal(findForcePowerName('Impulso'), other);
    assert.equal(findForcePowerName('Impulso (Surge)'), other);
    assert.equal(findForcePowerName('Pressão da Força'), 'Aperto da Força (Force Grip)');
    assert.equal(findForcePowerName('Refutar (Rebuke)'), 'Repreender (Rebuke)');
    assert.equal(resolveLibraryItemName('Impulso (Surge)', 'aptitudes'), 'Impulso (Surge)', 'Aptidão Surge permanece separada do poder');
    assert.ok(LIBRARY_DATA.aptitudes.trees.some(tree => tree.items.includes('Impulso (Surge)')));
    for (const [category, aliases] of Object.entries(LIBRARY_ITEM_RENAMES)) {
        const data = LIBRARY_DATA[category];
        const names = data.items || data.trees.flatMap(tree => tree.items);
        for (const target of Object.values(aliases)) assert.ok(names.includes(target), target + ': alias sem destino');
    }
    for (const name of ['Arremeter (Surge)', 'Aperto da Força (Force Grip)', 'Repreender (Rebuke)']) {
        assert.ok(LIBRARY_ITEM_DETAILS[name]?.source.includes('v1.05'), name + ': sem referência ao livro');
    }
    assert.ok(LIBRARY_ITEM_DETAILS[other].text.includes('Ação livre'));
    assert.ok(LIBRARY_ITEM_DETAILS[other].special.includes('Ponto de Destino'));
    assert.ok(LIBRARY_ITEM_DETAILS['Aperto da Força (Force Grip)'].text.includes('6 quadrados'));
    assert.ok(!LIBRARY_ITEM_DETAILS['Aperto da Força (Force Grip)'].text.includes('12 quadrados'));
    const migrated = { escolhas: [{ tipo: 'tecnica', nome: 'Pressão da Força Aprimorada (Improved Force Grip)' }, { tipo: 'talento', nome: 'Maestria em Poder da Força (Force Power Mastery)', detalhe: 'Impulso' }] };
    assert.equal(renameOldLibraryChoices(migrated), true);
    assert.equal(migrated.escolhas[0].nome, 'Aperto da Força Aprimorado (Improved Force Grip)');
    assert.equal(migrated.escolhas[1].detalhe, 'Arremeter');
    assert.equal(renameOldLibraryChoices(migrated), false, 'Migração deve ser idempotente');
    const oldNotes = { forcePowers: ['Impulso (Surge)', 'Impulso (Surge)', other, legacy], escolhas: [], noteDetails: {} };
    oldNotes.noteDetails['force_' + encodeURIComponent('Impulso (Surge)')] = 'Anotação antiga';
    oldNotes.noteDetails['force_' + encodeURIComponent(other)] = 'Anotação nova';
    assert.equal(renameOldLibraryChoices(oldNotes), true);
    assert.deepEqual(oldNotes.forcePowers, [other, other, other, legacy], 'Migração preserva cópias e poderes personalizados');
    assert.equal(oldNotes.noteDetails['force_' + encodeURIComponent(other)], 'Anotação nova\\n\\nAnotação antiga', 'Notas com nomes diferentes são preservadas juntas');
    assert.equal(renameOldLibraryChoices(oldNotes), false);
    const gripReq = FORCE_TECHNIQUE_PREREQUISITES['Aperto da Força Aprimorado (Improved Force Grip)'][0];
    assert.equal(evaluateRequirement({ forcePowers: ['Pressão da Força'] }, gripReq, []).status, 'ok');
    assert.equal(evaluateRequirement({ forcePowers: ['Repreender (Rebuke)'] }, gripReq, []).status, 'blocked');
    const original = JSON.stringify(sheet);
    assert.ok(renderForcePowersCard(sheet).includes(legacy));
    assert.equal(JSON.stringify(sheet), original, 'Consultar não pode alterar dados antigos');
    const candidates = buildCandidates(sheet, null, 'poder');
    assert.equal(candidates.length, LIBRARY_DATA.forcePowers.items.length - 4);
    assert.ok(candidates.every(candidate => candidate.tipo === 'poder'));
    assert.ok(candidates.every(candidate => LIBRARY_ITEM_DETAILS[candidate.nome]?.kind !== 'aptitude'));
    const oldAptitude = { id: 3, forcePowers: ['Dreno de Vida (Force Drain)'], escolhas: [], noteDetails: { preserved: 'Nota antiga' } };
    const originalAptitude = JSON.stringify(oldAptitude);
    assert.ok(renderForcePowersCard(oldAptitude).includes('Aptidão · escolha antiga preservada'));
    assert.ok(renderForcePowersCard(oldAptitude).includes('openLibraryItem'));
    assert.equal(JSON.stringify(oldAptitude), originalAptitude, 'Consultar aptidão legada não altera a ficha');
    const invalidAptitude = JSON.stringify(sheet);
    choiceState = { sheetId: 1, tipo: 'poder', slotKey: null, powerIndex: null, candidates: [{ tipo: 'poder', nome: 'Dreno de Vida (Force Drain)' }], selected: 0 };
    confirmChoice();
    assert.equal(JSON.stringify(sheet), invalidAptitude, 'Aptidão não pode ser adicionada como novo poder');
    const choose = (name, index) => {
        choiceState = { sheetId: 1, tipo: 'poder', slotKey: null, powerIndex: index, candidates: [{ tipo: 'poder', nome: name }], selected: 0 };
        confirmChoice();
    };
    choose(other, 0);
    assert.deepEqual(sheet.forcePowers, [other, power, legacy]);
    assert.equal(sheet.noteDetails['force_' + encodeURIComponent(power)], 'Minha anotação', 'Cópia restante mantém sua nota');
    assert.equal(sheet.noteDetails['force_' + encodeURIComponent(other)], 'Minha anotação');
    choose(other, null);
    assert.deepEqual(sheet.forcePowers, [other, power, legacy, other], 'Repetir mantém cópias separadas');
    assert.deepEqual(sheet.escolhas, [], 'Poderes não ocupam vagas de Talentos/Aptidões');
    assert.deepEqual(sheets[1].forcePowers, [other], 'Outra ficha não pode mudar');
    const beforeInvalid = JSON.stringify(sheet);
    choose(legacy, null);
    assert.equal(JSON.stringify(sheet), beforeInvalid, 'Só aceita itens da Biblioteca');
    choose(other, 99);
    assert.equal(JSON.stringify(sheet), beforeInvalid, 'Índice inválido não pode alterar dados');
    assert.deepEqual(saved, [1, 1]);
    assert.ok(renderLibraryChecks(LIBRARY_ITEM_DETAILS[power]).includes('<table'));
    console.log('Poderes: biblioteca, dados antigos, cópias, notas e isolamento: OK.');
`, context);
