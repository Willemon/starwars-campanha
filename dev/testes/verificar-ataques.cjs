// node dev/testes/verificar-ataques.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '../..');
let nextId = 0;
const context = vm.createContext({ assert, console, window: {}, crypto: { randomUUID: () => 'id-' + ++nextId },
    document: { addEventListener() {}, getElementById() { return null; }, querySelector() { return null; }, querySelectorAll() { return []; } } });
for (const file of ['js/estado.js', 'js/dados/classes.js', 'js/dados/biblioteca.js', 'js/dados/progressao.js', 'js/modelos/ficha.js', 'js/regras/ficha.js', 'js/ficha.js', 'js/regras/biblioteca.js', 'js/referencia.js', 'js/modelos/equipamentos.js', 'js/icones.js', 'js/regras/talentos.js', 'js/talentos.js', 'js/regras/equipamentos.js', 'js/equipamentos.js', 'js/regras/ataques.js', 'js/ataques.js']) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    vm.runInContext(file === 'js/estado.js' ? source.split('let syncStatusTimer')[0]
        : file === 'js/ficha.js' ? source.replace(/renderSheets\(\);\s*$/, '') : source, context);
}
vm.runInContext(`
    let confirmation, saves = [];
    function showConfirmModal(message, apply) { confirmation = { message, apply }; }
    function scheduleSave(id) { saves.push(id); }
    function renderSheets() {}
    function closeModal() { finishAttackEditor(); }
    const sheet = createEmptySheet(1), other = createEmptySheet(2);
    sheet.classes = [{ name: 'Soldado', level: 4 }];
    sheet.attributes.FOR.mod = 2;
    const weapon = { ...createInventoryItem('weapon'), name: 'Aurora', damage: '2d8', weaponType: 'lightsabers', weight: 1, cost: 3000, equipped: true };
    const replacement = { ...createInventoryItem('weapon'), name: 'Outro sabre', damage: '1d8' };
    const foreign = { ...createInventoryItem('weapon'), name: 'Arma de outra ficha' };
    const armor = { ...createInventoryItem('armor'), name: 'Armadura' };
    sheet.inventory = [weapon, replacement, armor]; other.inventory = [foreign];
    sheets = [sheet, other];
    const otherBefore = JSON.stringify(other);
    assert.equal(prepareAttacks(sheet), false);
    assert.equal(sheet.attacks.length, 0, 'Criar ou equipar arma não cria ataque');
    sheet.attacks = ['Normal', 'Poderoso', 'Defensivo'].map(name => ({ ...createAttack(weapon), name }));
    sheet.attacks[1].attackBonus = -2; sheet.attacks[1].damageBonus = 4;
    sheet.attacks[2].attackBonus = -5;
    assert.equal(new Set(sheet.attacks.map(a => a.id)).size, 3);
    assert.deepEqual(sheet.attacks.map(a => getAttackStats(sheet, a).attack), [6, 4, 1]);
    assert.deepEqual(sheet.attacks.map(a => getAttackStats(sheet, a).damage), ['2d8+4', '2d8+8', '2d8+4']);
    assert.deepEqual(getInventoryTotals(sheet), { weight: 1, cost: 3000 }, 'Ataques não multiplicam peso ou preço');
    const before = JSON.stringify(sheet.attacks);
    weapon.damage = '4d8'; weapon.name = 'Aurora renomeada'; weapon.weaponType = 'rifles';
    assert.equal(JSON.stringify(sheet.attacks), before, 'Editar arma não sobrescreve ataques');
    assert.ok(renderAttackRows(sheet).includes('Aurora renomeada'));
    assert.ok(renderAttackRows(sheet).includes('img/armas/rifles.jpg'));
    weapon.equipped = false; weapon.quantity = 0;
    assert.equal((renderAttackRows(sheet).match(/<article/g) || []).length, 3, 'Desequipar ou zerar estoque preserva ataques');
    assert.ok(renderAttackRows(sheet).includes('Arma sem unidades'));
    weapon.quantity = 1;
    assert.ok(renderAttackRows(sheet).includes('Arma não equipada'));
    const removedId = sheet.attacks[1].id;
    removeAttack(1, removedId);
    assert.equal(sheet.attacks.length, 3, 'Cancelar preserva ataque');
    confirmation.apply();
    assert.equal(sheet.attacks.length, 2); assert.equal(sheet.inventory.length, 3);
    assert.equal(sheet.attacks[0].name, 'Normal'); assert.equal(sheet.attacks[1].name, 'Defensivo');

    // Exercita o mesmo salvamento do formulário, incluindo vínculo e validação.
    let formValues, formError = { textContent: '' };
    document.getElementById = id => id === 'attackForm' ? {
        reportValidity: () => true, elements: { namedItem: key => ({ value: String(formValues[key] ?? ''), checked: formValues[key] }) }
    } : id === 'attackFormError' ? formError : null;
    function submit(values, attackId = null) {
        formValues = values; attackEditorState = { sheetId: 1, attackId };
        saveAttack({ preventDefault() {} });
    }
    const first = sheet.attacks[0], last = JSON.stringify(sheet.attacks[1]);
    submit({ ...first, weaponId: replacement.id, damage: '3d10', attackBonus: 7 }, first.id);
    assert.equal(first.weaponId, replacement.id); assert.equal(first.damage, '3d10');
    assert.equal(first.attackBonus, 7); assert.equal(JSON.stringify(sheet.attacks[1]), last);
    assert.equal(replacement.damage, '1d8', 'Editar ataque não altera arma');
    const valid = { ...createAttack(weapon), name: 'Novo' };
    for (const invalid of [{ weaponId: foreign.id }, { weaponId: armor.id }, { weaponId: 'missing' }, { mode: 'invalid' }, { attackBonus: NaN }, { damageBonus: 1.5 }, { hands: 3 }, { name: ' ' }, { damage: 'x'.repeat(81) }]) {
        assert.equal(isValidAttack(sheet, { ...valid, ...invalid }), false);
        const snapshot = JSON.stringify(sheet);
        submit({ ...valid, ...invalid });
        assert.equal(JSON.stringify(sheet), snapshot, 'Formulário rejeita dados inválidos sem alterar ficha');
    }
    const oldLength = sheet.attacks.length;
    submit(valid); assert.equal(sheet.attacks.length, oldLength + 1);
    assert.equal(sheet.inventory.length, 3);
    const preserved = JSON.stringify(sheet.attacks);
    removeInventoryItem(1, weapon.id); confirmation.apply();
    assert.equal(JSON.stringify(sheet.attacks), preserved, 'Excluir arma mantém configurações de ataque');
    assert.ok(renderAttackRows(sheet).includes('Arma não encontrada'));
    submit({ ...sheet.attacks[1], weaponId: replacement.id }, sheet.attacks[1].id);
    assert.equal(sheet.attacks[1].weaponId, replacement.id, 'Ataque órfão pode ser vinculado a outra arma');
    assert.equal(JSON.stringify(other), otherBefore, 'Outra ficha fica intacta');
    assert.ok(saves.every(id => id === 1));

    const legacy = { inventory: [{ ...weapon, equipped: true, quantity: 1, attackBonus: 3, damageBonus: 9 }, replacement] };
    assert.equal(prepareAttacks(legacy), true); assert.equal(legacy.attacks.length, 1);
    assert.equal(legacy.attacks[0].attackBonus, 3); assert.equal(legacy.attacks[0].damageBonus, 9);
    legacy.attacks[0].damage = '5d6';
    assert.equal(legacy.inventory[0].damage, '4d8', 'Migração copia dados sem compartilhar objetos');
    assert.equal(prepareAttacks(legacy), false);
    assert.equal(prepareAttacks(JSON.parse(JSON.stringify(legacy))), false);
    legacy.attacks = []; assert.equal(prepareAttacks(legacy), false);
    assert.equal(legacy.attacks.length, 0, 'Ataques excluídos não reaparecem');
    console.log('Ataques: múltiplos por arma, migração, CRUD independente, vínculos e validação: OK.');
`, context);
