// node dev/testes/verificar-equipamentos.cjs
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '../..');
let nextId = 0;
const context = vm.createContext({ assert, console, window: {}, crypto: { randomUUID: () => 'item-' + ++nextId }, document: { addEventListener() {}, getElementById() { return null; }, querySelector() { return null; } } });
for (const file of ['js/estado.js', 'js/dados/classes.js', 'js/dados/biblioteca.js', 'js/dados/progressao.js', 'js/modelos/ficha.js', 'js/regras/ficha.js', 'js/ficha.js', 'js/regras/biblioteca.js', 'js/referencia.js', 'js/modelos/equipamentos.js', 'js/icones.js', 'js/regras/talentos.js', 'js/talentos.js', 'js/regras/equipamentos.js', 'js/equipamentos.js', 'js/regras/ataques.js', 'js/ataques.js']) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    const code = file === 'js/estado.js' ? source.split('let syncStatusTimer')[0]
        : file === 'js/ficha.js' ? source.replace(/renderSheets\(\);\s*$/, '') : source;
    vm.runInContext(code, context);
}
vm.runInContext(`
    const sheet = createEmptySheet(1);
    sheet.classes = [{ name: 'Nobre', level: 4 }, { name: 'Soldado', level: 2 }];
    sheet.attributes.FOR.mod = 2;
    sheet.attributes.DES.mod = 3;
    sheet.condition = -1;
    const sword = { ...createInventoryItem('weapon'), name: 'Sabre', damage: '2d8', equipped: true };
    sheet.inventory.push(sword);
    sheet.attacks.push(createAttack(sword));
    const attackBeforeType = getAttackStats(sheet, sword);
    sword.weaponType = 'rifles';
    assert.equal(getWeaponIconFile(sword.name, sword.weaponType), 'rifles.jpg', 'Tipo escolhido prevalece sobre o nome');
    assert.ok(renderAttackRows(sheet).includes('img/armas/rifles.jpg'));
    assert.ok(renderInventoryCard(sheet).includes('img/armas/rifles.jpg'));
    assert.ok(renderInventoryCard(sheet).includes('<small>Rifles</small>'));
    assert.deepEqual(getAttackStats(sheet, sword), attackBeforeType, 'Imagem não altera os cálculos do ataque');
    assert.equal(getWeaponIconFile('Rifle blaster'), 'rifles.jpg', 'Itens antigos continuam reconhecidos pelo nome');
    assert.equal(getWeaponIconFile('Arma personalizada'), 'simple-weapons.jpg');
    assert.equal(getWeaponIconFile('Sabre', '__proto__'), 'lightsabers.jpg');
    assert.ok(renderWeaponIcon('', 'pistols').includes('img/armas/pistols.jpg'), 'Prévia funciona antes de preencher o nome');
    assert.equal(getAttackStats(sheet, sword).attack, 6, 'BBA 5 + FOR 2 - condição 1');
    assert.equal(getAttackStats(sheet, sword).damage, '2d8+5', 'Meio nível heroico + FOR');
    sword.hands = 2;
    assert.equal(getAttackStats(sheet, sword).damage, '2d8+7');
    sword.light = true;
    assert.equal(getAttackStats(sheet, sword).damage, '2d8+5', 'Arma leve não duplica Vigor');
    sword.light = false;
    sheet.attributes.FOR.mod = -2;
    assert.equal(getAttackStats(sheet, sword).damage, '2d8+1', 'Vigor negativo não é duplicado');
    sheet.attributes.FOR.mod = 2;
    const blaster = { ...createInventoryItem('weapon'), name: 'Blaster', mode: 'ranged', attackAttribute: 'DES', damageAttribute: 'none', damage: '3d6', equipped: true };
    sheet.inventory.push(blaster);
    assert.equal(getAttackStats(sheet, blaster).attack, 7);
    assert.equal(getAttackStats(sheet, blaster).damage, '3d6+3');
    blaster.proficient = false;
    assert.equal(getAttackStats(sheet, blaster).attack, 2, 'Sem proficiência: -5');
    blaster.attackBonus = 2;
    blaster.damageBonus = -4;
    assert.equal(getAttackStats(sheet, blaster).attack, 4);
    assert.equal(getAttackStats(sheet, blaster).damage, '3d6-1');
    sheet.condition = -5;
    assert.equal(getAttackStats(sheet, blaster).damage, '3d6-1', 'Condição não altera o dano');
    sheet.condition = -99;
    assert.equal(getAttackStats(sheet, sword).available, false);
    assert.ok(renderAttackRows(sheet).includes('Incapaz'));
    sword.quantity = 0;
    blaster.equipped = false;
    assert.equal(getEquippedWeapons(sheet).length, 0);
    sword.quantity = 1;
    assert.equal(getEquippedWeapons(sheet).length, 1);
    const armor = { ...createInventoryItem('armor'), name: 'Armadura', equipped: true };
    sheet.inventory.push(armor);
    assert.equal(getEquippedWeapons(sheet).length, 1, 'Armaduras não criam ataques');

    const legacy = { weapons: ['Sabre de Luz — 2d8', 'Arma especial com regras próprias'], equipments: ['Medpac', '<script>item</script>'] };
    const original = JSON.stringify([legacy.weapons, legacy.equipments]);
    assert.equal(prepareInventory(legacy), true);
    assert.equal(legacy.inventory.length, 4);
    assert.equal(new Set(legacy.inventory.map(item => item.id)).size, 4);
    assert.equal(legacy.inventory[0].name, 'Sabre de Luz');
    assert.equal(legacy.inventory[0].damage, '2d8');
    assert.equal(legacy.inventory[0].legacyText, 'Sabre de Luz — 2d8');
    assert.equal(legacy.inventory[1].name, legacy.weapons[1]);
    assert.equal(legacy.inventory[1].needsReview, true);
    assert.equal(JSON.stringify([legacy.weapons, legacy.equipments]), original);
    assert.equal(prepareInventory(legacy), false, 'Importação não duplica os itens');
    assert.equal(prepareAttacks(legacy), true);
    assert.equal(legacy.attacks.length, 2);
    assert.equal(prepareAttacks(legacy), false, 'Migração não duplica os ataques');
    const html = renderInventoryCard({ ...legacy, id: 1 });
    assert.ok(!html.includes('<script>item</script>'));
    assert.ok(html.includes('&lt;script&gt;item&lt;/script&gt;'));
    const valid = { ...createInventoryItem(), name: 'Kit' };
    assert.equal(isValidInventoryItem(valid), true);
    const oldItem = { ...valid };
    delete oldItem.weaponType;
    assert.equal(isValidInventoryItem(oldItem), true, 'Itens anteriores sem tipo permanecem válidos');
    for (const type of Object.keys(WEAPON_TYPES)) assert.equal(isValidInventoryItem({ ...valid, weaponType: type }), true);
    for (const invalid of [{ name: ' ' }, { quantity: -1 }, { quantity: 1.2 }, { cost: Infinity }, { weight: -1 }, { category: '__proto__' }, { attackAttribute: 'INVALID' }, { attackBonus: NaN }, { weaponType: 'unknown' }, { weaponType: '__proto__' }, { weaponType: {} }]) {
        assert.equal(isValidInventoryItem({ ...valid, ...invalid }), false, JSON.stringify(invalid));
    }
    let saved = [], rendered = 0;
    function scheduleSave(id) { saved.push(id); }
    function renderSheets() { rendered++; }
    sheets = [sheet, { id: 2, inventory: [valid] }];
    setInventoryEquipped(1, blaster.id, true);
    assert.equal(blaster.equipped, true);
    const quantityInput = { value: '1.5' };
    setInventoryQuantity(1, blaster.id, quantityInput);
    assert.equal(blaster.quantity, 1);
    setInventoryQuantity(1, blaster.id, { value: '0' });
    assert.equal(blaster.quantity, 0);
    assert.ok(!getEquippedWeapons(sheet).includes(blaster));
    setInventoryEquipped(1, 'missing', false);
    assert.deepEqual(saved, [1, 1]);
    assert.equal(sheets[1].inventory[0].quantity, 1);
    assert.equal(rendered, 0, 'Quantidade não substitui o campo durante a edição');
    assert.deepEqual(getInventoryTotals({ inventory: [{ quantity: 3, weight: .5, cost: 100 }, { quantity: 0, weight: 8, cost: 600 }] }), { weight: 1.5, cost: 300 });
    {
        const personal = { ...createInventoryItem('weapon'), name: 'Pessoal', equipped: true, weight: 2, cost: 20 };
        const stash = { ...createInventoryItem('weapon', 'stash'), name: 'Guardado', equipped: true, weight: 3, cost: 30 };
        const implant = { ...createInventoryItem('equipment', 'cybernetics'), name: '<b>Olho</b>', cyberneticRegion: 'eyes', equipped: true };
        const inactiveImplant = { ...implant, id: 'implant-zero', name: 'Reserva', quantity: 0 };
        const vehicle = { ...createInventoryItem('equipment', 'vehicles'), name: 'Speeder' };
        const artifact = { ...createInventoryItem('weapon', 'artifacts'), name: 'Relíquia', notes: 'Efeito manual' };
        const legacyItem = { ...createInventoryItem(), name: 'Antigo' }; delete legacyItem.section; delete legacyItem.cyberneticRegion;
        const divided = { ...createEmptySheet(3), inventory: [personal, stash, implant, inactiveImplant, vehicle, artifact, legacyItem] };
        assert.equal(getInventorySection(legacyItem), 'personal');
        assert.equal(isValidInventoryItem(legacyItem), true, 'Ficha antiga permanece válida sem migração destrutiva');
        assert.deepEqual(getInventoryTotals(divided, 'personal'), { weight: 2, cost: 20 });
        assert.deepEqual(getInventoryTotals(divided, 'stash'), { weight: 3, cost: 30 });
        assert.equal(getEquippedWeapons(divided).length, 1, 'Arma guardada não conta como equipada');
        divided.attacks = [createAttack(stash)];
        assert.ok(renderAttackRows(divided).includes('Arma guardada (Stash)'));
        const allHtml = renderInventoryCard(divided);
        assert.equal((allHtml.match(/data-inventory-section=/g) || []).length, 5);
        assert.equal((allHtml.match(/>Guardado<\\/button>/g) || []).length, 1, 'Um item aparece só na sua seção');
        assert.ok(allHtml.includes('&lt;b&gt;Olho&lt;/b&gt;') && !allHtml.includes('<b>Olho</b>'));
        assert.ok(allHtml.includes('id="installed-implants-3">1</strong>'));
        assert.ok(allHtml.includes('ficha completa de veículos e naves será adicionada depois'));
        for (const invalid of [{ section: 'bad' }, { section: '__proto__' }, { section: ['stash'] }, { section: {} }, { cyberneticRegion: 'bad' }, { cyberneticRegion: '__proto__' }, { cyberneticRegion: ['eyes'] }]) {
            assert.equal(isValidInventoryItem({ ...personal, ...invalid }), false);
        }
        assert.equal(getInventorySection({ section: ['stash'] }), 'personal', 'Dados inválidos não escondem itens da ficha');
        // Salvar a mudança de seção mantém id, propriedades e vínculos de ataque.
        sheets.push(divided);
        let formValues = { ...personal, section: 'stash' };
        const error = { textContent: '' };
        document.getElementById = id => id === 'inventoryForm' ? {
            reportValidity: () => true,
            elements: { equipped: { checked: formValues.equipped }, light: { checked: formValues.light },
                namedItem: key => ({ value: String(formValues[key] ?? '') }) }
        } : id === 'inventoryFormError' ? error : null;
        document.querySelectorAll = () => [];
        function closeModal() { finishInventoryEditor(); }
        const attackBefore = JSON.stringify(divided.attacks);
        const countBefore = divided.inventory.length;
        inventoryEditorState = { sheetId: 3, itemId: personal.id };
        saveInventoryItem({ preventDefault() {} });
        assert.equal(personal.section, 'stash'); assert.equal(personal.equipped, true);
        assert.equal(divided.inventory.length, countBefore);
        assert.equal(divided.inventorySection, 'stash', 'Após mover, mostra a seção de destino');
        assert.equal(JSON.stringify(divided.attacks), attackBefore);
        assert.equal(getInventorySection(JSON.parse(JSON.stringify(personal))), 'stash', 'Seção persiste ao recarregar');
        assert.deepEqual(getInventoryTotals(divided, 'stash'), { weight: 5, cost: 50 });
        formValues = { ...personal, section: 'bad' };
        const unchanged = JSON.stringify(divided);
        inventoryEditorState = { sheetId: 3, itemId: personal.id };
        saveInventoryItem({ preventDefault() {} });
        assert.equal(JSON.stringify(divided), unchanged, 'Seção inválida não altera o inventário');
        assert.ok(error.textContent);
        assert.equal(sheets[1].inventory[0].name, 'Kit', 'Mover item não altera outra ficha');
    }
    console.log('Inventário: importação, validação, isolamento e ataques conforme Saga: OK.');
    {
        const storageSheet = createEmptySheet(4);
        const arm = { ...createInventoryItem('weapon', 'cybernetics'), name: 'Braço cibernético', cyberneticRegion: 'leftArm', equipped: true, notes: 'Propriedades próprias', damage: '2d6', weight: 2, cost: 50, customField: 'preservar' };
        storageSheet.inventory.push(arm);
        storageSheet.attacks.push(createAttack(arm));
        sheets.push(storageSheet);
        const original = JSON.parse(JSON.stringify(arm)), originalAttacks = JSON.stringify(storageSheet.attacks);
        const otherBefore = JSON.stringify(sheets[1]);
        assert.ok(renderCybernetics(storageSheet, [arm]).includes('<table'));
        assert.ok(!renderCybernetics(storageSheet, [arm]).includes('<img'));
        moveInventoryItem(4, arm.id, 'stash');
        assert.deepEqual(arm, { ...original, section: 'stash', equipped: false, stashOrigin: 'cybernetics' });
        assert.equal(storageSheet.inventory.length, 1, 'Mover não duplica o implante');
        assert.equal(storageSheet.inventorySection, 'stash');
        assert.ok(renderInventoryCard(storageSheet).includes('Mover para Implantes'));
        assert.equal(JSON.stringify(storageSheet.attacks), originalAttacks, 'Ataques e vínculos são preservados');
        assert.equal(JSON.parse(JSON.stringify(arm)).stashOrigin, 'cybernetics', 'Origem persiste ao recarregar');
        moveInventoryItem(4, arm.id, 'cybernetics');
        assert.equal(arm.section, 'cybernetics'); assert.equal(arm.equipped, false, 'Voltar ao corpo não instala automaticamente');
        assert.equal(arm.cyberneticRegion, 'leftArm'); assert.equal(arm.stashOrigin, null);
        setInventoryEquipped(4, arm.id, true);
        assert.equal(arm.equipped, true);
        const unchanged = JSON.stringify(storageSheet), savedBefore = saved.length;
        moveInventoryItem(4, arm.id, '__proto__'); moveInventoryItem(2, arm.id, 'stash'); moveInventoryItem(4, 'missing', 'stash');
        assert.equal(JSON.stringify(storageSheet), unchanged); assert.equal(saved.length, savedBefore);
        assert.equal(JSON.stringify(sheets[1]), otherBefore, 'Outra ficha fica intacta');
        // O editor segue a mesma regra do botão de guardar.
        let formValues = { ...arm, section: 'stash' };
        document.getElementById = id => id === 'inventoryForm' ? { reportValidity: () => true,
            elements: { equipped: { checked: true }, light: { checked: formValues.light }, namedItem: key => ({ value: String(formValues[key] ?? '') }) }
        } : null;
        inventoryEditorState = { sheetId: 4, itemId: arm.id };
        saveInventoryItem({ preventDefault() {} });
        assert.equal(arm.section, 'stash'); assert.equal(arm.equipped, false);
        formValues = { ...arm, section: 'cybernetics' };
        inventoryEditorState = { sheetId: 4, itemId: arm.id };
        saveInventoryItem({ preventDefault() {} });
        assert.equal(arm.section, 'cybernetics'); assert.equal(arm.stashOrigin, null, 'Editor também limpa origem ao retornar');
        assert.equal(arm.customField, 'preservar');
        console.log('Implantes: tabela sem imagem, corpo/Stash, instalação, dados e vínculos preservados: OK.');
    }
`, context);
const weaponTypes = vm.runInContext('Object.values(WEAPON_TYPES)', context);
for (const type of weaponTypes) assert.ok(fs.existsSync(path.join(root, 'img/armas', type.file)), type.file + ': imagem existente');
