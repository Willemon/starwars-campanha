// node dev/testes/verificar-remocoes.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '../..');
const loggedErrors = [];
const context = vm.createContext({ assert, loggedErrors, console: { log: console.log, error: (...args) => loggedErrors.push(args) }, window: {}, crypto: { randomUUID: () => 'new-item' },
    document: { addEventListener() {}, getElementById() { return null; }, querySelector() { return null; } } });
for (const file of ['js/estado.js', 'js/dados/classes.js', 'js/dados/especies.js', 'js/dados/biblioteca.js',
    'js/dados/biblioteca-detalhes.js', 'js/dados/progressao.js', 'js/modelos/ficha.js', 'js/regras/ficha.js', 'js/ficha.js', 'js/regras/biblioteca.js', 'js/referencia.js', 'js/modelos/equipamentos.js', 'js/icones.js', 'js/especies.js', 'js/regras/talentos.js', 'js/talentos.js', 'js/regras/equipamentos.js', 'js/equipamentos.js', 'js/regras/ataques.js', 'js/ataques.js']) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    vm.runInContext(file === 'js/estado.js' ? source.split('let syncStatusTimer')[0]
        : file === 'js/ficha.js' ? source.replace(/renderSheets\(\);\s*$/, '')
        : file === 'js/especies.js' ? source.replace(/^initIconStage\(\);\s*$/m, '') : source, context);
}
vm.runInContext(`
    let confirmation, closed = [], saves = [], messages = [];
    function showConfirmModal(message, apply) { confirmation = { message, apply }; }
    function renderSheets() {}
    function scheduleSave(id) { saves.push(id); }
    function setSyncStatus(message) { messages.push(message); }
    function closeModal(id) { closed.push(id); if (id === 'inventoryModal') finishInventoryEditor(); }
    const pendingSaves = new Set();
    (async () => {
    const own = createEmptySheet(1), other = createEmptySheet(2);
    own.owner = 'paulo'; other.owner = 'outro';
    own.name = '<b>Teste</b>';
    sheets = [own, other]; activeSheetId = 1;
    const otherBefore = JSON.stringify(other);
    prepareSheetChoices(own);

    const initial = getAutomaticChoices(own)[0];
    const initialCount = getAutomaticChoices(own).length;
    assert.ok(renderChoiceCard(own, 'talento').includes('removeAutomaticChoice'));
    removeAutomaticChoice(1, automaticChoiceKey(initial));
    assert.equal(getAutomaticChoices(own).length, initialCount, 'Pedir confirmação não exclui');
    confirmation.apply();
    prepareSheetChoices(own);
    assert.equal(getAutomaticChoices(own).length, initialCount - 1, 'Inicial não reaparece na renderização');
    assert.equal(getAutomaticChoices(JSON.parse(JSON.stringify(own))).length, initialCount - 1, 'Exclusão persiste após recarregar');
    assert.ok(!hasChoice(getOwnedChoices(own), initial.tipo, initial.nome, initial.detalhe));
    restoreAutomaticChoices(1);
    assert.equal(getAutomaticChoices(own).length, initialCount);

    own.escolhas.push({ vaga: 'classe:removida:2:tecnica', tipo: 'tecnica', nome: 'Técnica antiga' },
        { vaga: 'classe:removida:3:segredo', tipo: 'segredo', nome: 'Segredo antigo' });
    const orphanHtml = renderChoiceCard(own, 'aptidao');
    assert.ok(orphanHtml.includes('Técnica antiga') && orphanHtml.includes('Segredo antigo'), 'Técnicas e segredos sem vaga continuam removíveis');
    removeChoice(1, own.escolhas[0].vaga); confirmation.apply();
    assert.equal(own.escolhas.length, 1);
    own.outrosTalentos.push({ texto: 'Meu talento antigo', lista: 'talents' });
    removeLegacyChoice(1, 0); confirmation.apply();
    assert.equal(own.outrosTalentos.length, 0);

    own.forcePowers = ['Meu poder', 'Outro poder'];
    removeDynamicItem(1, 'forcePowers', 0);
    assert.equal(own.forcePowers.length, 2);
    confirmation.apply(); assert.deepEqual(own.forcePowers, ['Outro poder']);
    own.customNotes = [{ title: 'Nota 1', text: 'Conteúdo' }, { title: 'Nota 2', text: 'Manter' }];
    removeCustomNote(1, 0); confirmation.apply();
    assert.deepEqual(own.customNotes, [{ title: 'Nota 2', text: 'Manter' }]);
    removeCustomNote(1, -1); assert.equal(own.customNotes.length, 1);
    removeClassRow(1, 0); confirmation.apply();
    assert.equal(own.classes.length, 0, 'É possível remover a última classe');
    assert.equal(getCharacterLevel(own), 0);
    addClass(1); assert.equal(own.classes.length, 1);

    own.speciesKey = 'wookiee'; own.species = 'Wookiee'; own.speciesMods = { FOR: 4, DES: -2 };
    own.attributes.FOR.val = 14; own.attributes.DES.val = 8;
    removeSpeciesFromSheet(1); confirmation.apply();
    assert.equal(own.speciesKey, ''); assert.equal(own.species, '');
    assert.equal(own.attributes.FOR.val, 10); assert.equal(own.attributes.DES.val, 10);
    assert.equal(own.attributes.FOR.mod, 0);

    const weapon = { ...createInventoryItem('weapon'), id: 'weapon', name: 'Arma de teste', equipped: true };
    own.inventory = [weapon, { ...createInventoryItem(), id: 'keep', name: 'Manter item' }];
    own.attacks = [createAttack(weapon)];
    inventoryEditorState = { sheetId: 1, itemId: 'weapon' }; closed = [];
    assert.ok(renderAttackRows(own).includes('Remover ataque'));
    removeInventoryItem(1, 'weapon');
    assert.equal(own.inventory.length, 2); assert.equal(closed.length, 0);
    confirmation.apply();
    assert.deepEqual(closed, ['inventoryModal']);
    assert.equal(getEquippedWeapons(own).length, 0);
    assert.equal(own.attacks.length, 1, 'Excluir arma preserva a configuração do ataque');
    assert.ok(renderAttackRows(own).includes('Arma não encontrada'));
    assert.deepEqual(own.inventory.map(item => item.id), ['keep']);
    assert.equal(JSON.stringify(other), otherBefore, 'Remover não afeta outra ficha');

    window.PLAYER_INFO = { 'teste': { id: 'paulo' } }; window._currentUser = { email: 'teste' };
    confirmation = null; removeSheet(2);
    assert.equal(confirmation, null, 'Preserva a permissão de excluir apenas as próprias fichas');
    own.firebaseId = 'own'; pendingSaves.add(1);
    let deleted;
    window._fbDeleteDoc = async (collection, id) => { deleted = [collection, id]; };
    removeSheet(1);
    assert.ok(confirmation.message.includes('&lt;b&gt;Teste&lt;/b&gt;'));
    await confirmation.apply();
    assert.deepEqual(deleted, ['sheets_paulo', 'own']);
    assert.equal(pendingSaves.has(1), false);
    assert.equal(sheets.length, 1); assert.equal(sheets[0].id, 2);
    assert.equal(activeSheetId, 2);
    const failed = { ...createEmptySheet(3), owner: 'paulo', firebaseId: 'failed' };
    sheets.push(failed); activeSheetId = 3; pendingSaves.add(3);
    window._fbDeleteDoc = async () => { throw new Error('Falha simulada'); };
    removeSheet(3); await confirmation.apply();
    assert.ok(sheets.includes(failed), 'Falha de gravação não apaga a ficha local');
    assert.equal(activeSheetId, 3);
    assert.ok(messages.includes('Não foi possível apagar a ficha. Verifique a conexão.'));
    assert.ok(saves.includes(3), 'Falha na exclusão preserva edições pendentes');
    assert.equal(loggedErrors.length, 1);
    console.log('Remoções: iniciais persistentes, classes, raça, escolhas, poderes, notas, itens, fichas e isolamento: OK.');
})()`, context).catch(error => { console.error(error); process.exitCode = 1; });
