// Ataques: configuracao, vinculo com armas, compatibilidade e calculos.

const DEFAULT_ATTACK_CONFIGURATION = {
    mode: 'melee', damage: '', damageType: '', critical: '20 / ×2', range: '', ammo: '',
    attackAttribute: 'FOR', damageAttribute: 'FOR', hands: 1, light: false,
    proficient: true, halfLevelDamage: true, attackBonus: 0, damageBonus: 0,
};

function createAttack(weapon = {}) {
    const configuration = Object.fromEntries(Object.entries(DEFAULT_ATTACK_CONFIGURATION)
        .map(([key, fallback]) => [key, weapon[key] ?? fallback]));
    return { id: crypto.randomUUID(), weaponId: weapon.id || '', name: weapon.name || '', notes: weapon.notes || '', ...configuration };
}

function getEquippedWeapons(sheet) {
    return (sheet.inventory || []).filter(item => item.category === 'weapon' && getInventorySection(item) !== 'stash' && item.equipped && inventoryNumber(item.quantity) > 0);
}

function prepareAttacks(sheet) {
    if (Array.isArray(sheet.attacks)) return false;
    // Migra uma única vez os ataques que já apareciam nas fichas anteriores.
    sheet.attacks = getEquippedWeapons(sheet).map(weapon => ({ ...createAttack(weapon), needsReview: !!weapon.needsReview }));
    return true;
}

function getAttackWeapon(sheet, attack) {
    return (sheet.inventory || []).find(item => item.id === attack.weaponId && item.category === 'weapon') || null;
}

function getAttackStats(sheet, item) {
    const bab = getBaseAttackBonus(sheet);
    const attackAttribute = inventoryNumber(sheet.attributes?.[item.attackAttribute]?.mod);
    const proficiency = item.proficient === false ? -5 : 0;
    const condition = getConditionPenalty(sheet);
    const attack = bab + attackAttribute + proficiency + condition + inventoryNumber(item.attackBonus);
    const heroicLevel = (sheet.classes || []).reduce((total, entry) => {
        const progression = getClassProgression(entry.name);
        return total + (['heroica', 'prestigio'].includes(progression?.tipo) ? getClassLevel(entry, progression) : 0);
    }, 0);
    const halfLevel = item.halfLevelDamage === false ? 0 : Math.floor(heroicLevel / 2);
    let damageAttribute = inventoryNumber(sheet.attributes?.[item.damageAttribute]?.mod);
    if (item.mode === 'melee' && item.damageAttribute === 'FOR' && item.hands === 2 && !item.light && damageAttribute > 0) damageAttribute *= 2;
    const damageBonus = halfLevel + damageAttribute + inventoryNumber(item.damageBonus);
    const damage = item.damage ? `${item.damage}${damageBonus ? formatBonus(damageBonus) : ''}` : '—';
    return { attack, damage, bab, attackAttribute, proficiency, condition, halfLevel, damageAttribute, damageBonus, available: toInt(sheet.condition) !== -99 };
}

function isValidAttackConfiguration(item) {
    return ['melee', 'ranged', 'thrown'].includes(item.mode)
        && ['none', ...ATTRIBUTES].includes(item.attackAttribute) && ['none', ...ATTRIBUTES].includes(item.damageAttribute)
        && [1, 2].includes(item.hands) && Number.isSafeInteger(item.attackBonus) && Number.isSafeInteger(item.damageBonus);
}

function isValidAttack(sheet, attack) {
    return typeof attack.name === 'string' && !!attack.name.trim() && attack.name.length <= 160
        && typeof attack.weaponId === 'string' && !!getAttackWeapon(sheet, attack)
        && isValidAttackConfiguration(attack)
        && [['damage', 80], ['damageType', 80], ['critical', 60], ['range', 100], ['ammo', 80], ['notes', 8000]]
            .every(([key, max]) => typeof attack[key] === 'string' && attack[key].length <= max);
}
