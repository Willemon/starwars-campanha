// Inventario: criacao, compatibilidade, localizacao e totais.

const INVENTORY_CATEGORIES = { weapon: 'Arma', armor: 'Armadura', equipment: 'Equipamento', consumable: 'Consumível' };

const INVENTORY_SECTIONS = {
    personal: { label: 'Pessoal', title: 'Equipamento pessoal', add: 'Item', hint: 'Armas, armaduras e itens que acompanham o personagem.' },
    stash: { label: 'Guardados (Stash)', title: 'Guardados (Stash)', add: 'Item', hint: 'Itens guardados na base, no alojamento ou em outro local. As armas daqui continuam vinculadas aos seus ataques.' },
    vehicles: { label: 'Veículos', title: 'Veículos', add: 'Veículo', hint: 'Registre nome, valor e observações. A ficha completa de veículos e naves será adicionada depois.' },
    cybernetics: { label: 'Implantes', title: 'Implantes cibernéticos', add: 'Implante', hint: 'Organize os implantes por região do corpo. Marque os instalados no cadastro de cada implante.' },
    artifacts: { label: 'Artefatos', title: 'Artefatos da alquimia Sith', add: 'Artefato', hint: 'Registre propriedades e efeitos nas notas do artefato.' },
};

const CYBERNETIC_REGIONS = {
    neural: 'Sistema neural', eyes: 'Olhos', torso: 'Torso',
    leftArm: 'Braço esquerdo', rightArm: 'Braço direito', legs: 'Pernas',
};

function inventoryNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
}

function createInventoryItem(category = 'equipment', section = 'personal') {
    return {
        id: crypto.randomUUID(), name: '', category, quantity: 1, weight: 0, cost: 0,
        equipped: false, notes: '', weaponType: '', section, cyberneticRegion: 'torso', ...DEFAULT_ATTACK_CONFIGURATION,
    };
}

function prepareInventory(sheet) {
    if (Array.isArray(sheet.inventory)) return false;
    sheet.inventory = [];
    for (const [field, category] of [['weapons', 'weapon'], ['equipments', 'equipment']]) {
        (Array.isArray(sheet[field]) ? sheet[field] : []).forEach(value => {
            if (typeof value !== 'string' || !value.trim()) return;
            const item = createInventoryItem(category);
            item.name = value.trim();
            item.legacyText = value;
            item.needsReview = true;
            if (category === 'weapon') {
                const parts = value.split(/\s+[—–-]\s+/);
                if (parts.length === 2 && /^\d+(?:d\d+)?(?:\s*[+-]\s*\d+)?$/i.test(parts[1].trim())) {
                    item.name = parts[0].trim();
                    item.damage = parts[1].trim();
                }
                item.mode = /pistola|rifle|blaster|carabina|fuzil/i.test(item.name) ? 'ranged' : 'melee';
                item.attackAttribute = item.mode === 'ranged' ? 'DES' : 'FOR';
                item.damageAttribute = item.mode === 'ranged' ? 'none' : 'FOR';
                item.equipped = true;
            }
            sheet.inventory.push(item);
        });
    }
    // As listas antigas e legacyText são preservados para não perder o texto original.
    return true;
}

function getInventorySection(item) {
    return typeof item.section === 'string' && Object.hasOwn(INVENTORY_SECTIONS, item.section) ? item.section : 'personal';
}

function setInventoryItemSection(item, section) {
    const previous = getInventorySection(item);
    if (section === previous) return;
    if (section === 'stash') {
        item.stashOrigin = previous;
        if (previous === 'cybernetics') item.equipped = false;
    } else item.stashOrigin = null;
    item.section = section;
}

function getInventoryTotals(sheet, section = null) {
    return (sheet.inventory || []).filter(item => section === null || getInventorySection(item) === section).reduce((totals, item) => {
        const quantity = Math.max(0, inventoryNumber(item.quantity));
        totals.weight += quantity * Math.max(0, inventoryNumber(item.weight));
        totals.cost += quantity * Math.max(0, inventoryNumber(item.cost));
        return totals;
    }, { weight: 0, cost: 0 });
}

function isValidInventoryItem(item) {
    return typeof item.name === 'string' && !!item.name.trim() && item.name.length <= 160 && Object.hasOwn(INVENTORY_CATEGORIES, item.category)
        && (item.section == null || (typeof item.section === 'string' && Object.hasOwn(INVENTORY_SECTIONS, item.section)))
        && (item.stashOrigin == null || (typeof item.stashOrigin === 'string' && Object.hasOwn(INVENTORY_SECTIONS, item.stashOrigin)))
        && (item.cyberneticRegion == null || (typeof item.cyberneticRegion === 'string' && Object.hasOwn(CYBERNETIC_REGIONS, item.cyberneticRegion)))
        && Number.isSafeInteger(item.quantity) && item.quantity >= 0
        && Number.isFinite(item.weight) && item.weight >= 0 && Number.isFinite(item.cost) && item.cost >= 0
        && (item.weaponType == null || item.weaponType === '' || (typeof item.weaponType === 'string' && Object.hasOwn(WEAPON_TYPES, item.weaponType)))
        && isValidAttackConfiguration(item);
}
