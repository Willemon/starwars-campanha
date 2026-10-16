const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '../..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const html = read('star_wars_firebase.html');
const scripts = [...html.matchAll(/<script defer src="([^"]+)"/g)].map(match => match[1]);
const domainFiles = scripts.filter(file => /^js\/(modelos|regras)\//.test(file));
for (const folder of ['modelos', 'regras']) {
    for (const file of fs.readdirSync(path.join(root, 'js', folder))) {
        assert.ok(domainFiles.includes(`js/${folder}/${file}`), `${file}: missing from page`);
        const code = read(`js/${folder}/${file}`).replace(/\/\/[^\n]*/g, '');
        assert.doesNotMatch(code, /\b(document|window|localStorage|sessionStorage|fetch|scheduleSave|setSyncStatus)\b/, `${file}: rules must not depend on browser or storage`);
    }
}
// Exercise domain rules without loading any UI, DOM mocks or Firebase SDK.
let id = 0;
const context = vm.createContext({ assert, crypto: { randomUUID: () => `item-${++id}` } });
for (const file of ['js/dados/classes.js', 'js/dados/especies.js', 'js/dados/biblioteca.js', 'js/dados/progressao.js', 'js/dados/prerequisitos-talentos.js', ...domainFiles]) {
    vm.runInContext(read(file), context, { filename: file });
}
vm.runInContext(`
    const character = createEmptySheet(100);
    character.classes = [{name: 'Jedi', level: 8}];
    character.attributes.FOR.val = 16;
    syncDerivedValues(character);
    prepareSheetChoices(character);
    prepareForcePoints(character);
    const weapon = {...createInventoryItem('weapon'), name: 'Sabre', damage: '2d8', weaponType: 'lightsabers', equipped: true};
    character.inventory.push(weapon);
    character.attacks.push(createAttack(weapon), {...createAttack(weapon), name: 'Defensivo', attackBonus: -5});
    assert.ok(isValidInventoryItem(weapon));
    assert.ok(isValidAttack(character, character.attacks[0]));
    const normal = getAttackStats(character, character.attacks[0]);
    assert.equal(getAttackStats(character, character.attacks[1]).attack, normal.attack - 5);
    setInventoryItemSection(weapon, 'stash');
    assert.equal(getEquippedWeapons(character).length, 0);
    assert.equal(character.attacks.length, 2);
    const restored = JSON.parse(JSON.stringify(character));
    assert.equal(prepareInventory(restored), false);
    assert.equal(prepareAttacks(restored), false);
    assert.equal(prepareForcePoints(restored), false);
    assert.deepEqual(restored.inventory, character.inventory);
    assert.equal(getAttackWeapon(restored, restored.attacks[1]).id, weapon.id);
    assert.equal(getAttackStats(restored, restored.attacks[0]).damage, normal.damage);
    assert.equal(getForcePointStats(restored).dice, 2);
`, context);
// Check the actual save queue payload using a fake transport, not the live database.
const writes = [];
Object.assign(context, {
    window: { _currentUser: { email: 'teste' }, _fbSetDoc: (collection, id, data) => {
        writes.push({ collection, id, data: JSON.parse(JSON.stringify(data)) });
        return Promise.resolve();
    } },
    document: { addEventListener() {} }, setTimeout: () => 0, clearTimeout() {}, setSyncStatus() {},
});
vm.runInContext(`
    restored.owner = 'teste'; restored.firebaseId = 'ficha-teste';
    const sheets = [restored]; const activeSheetId = restored.id;
`, context);
vm.runInContext(read('js/persistencia/salvamento.js'), context);
vm.runInContext('scheduleSave(restored.id); flushSaves();', context);
assert.equal(writes.length, 1);
assert.equal(writes[0].collection, 'sheets_teste');
assert.equal(writes[0].id, 'ficha-teste');
assert.equal(writes[0].data.inventory[0].section, 'stash');
assert.equal(writes[0].data.attacks.length, 2);
assert.equal(writes[0].data.attacks[0].weaponId, writes[0].data.inventory[0].id);
assert.equal(writes[0].data.forcePoints.total, 9);
console.log('Arquitetura: regras sem DOM/Firebase; dados recuperados e enviados completos pela fila de salvamento.');
