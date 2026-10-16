// Calculos e normalizacao da ficha. Recebem dados; nao acessam a interface ou o banco.

function toInt(value) {
    return parseInt(value, 10) || 0;
}

function formatBonus(value) {
    return (value >= 0 ? '+' : '') + value;
}

function getCharacterLevel(sheet) {
    return (sheet.classes || []).reduce((sum, c) => sum + Math.max(0, toInt(c.level)), 0);
}

function syncDerivedValues(sheet) {
    let changed = false;
    const level = getCharacterLevel(sheet);
    if (sheet.level !== level) {
        sheet.level = level;
        changed = true;
    }
    DEFENSES.forEach(({ key }) => {
        const def = sheet.defenses?.[key];
        if (def && def.level !== level) {
            def.level = level;
            changed = true;
        }
    });
    // O valor do atributo é o que está salvo (já com a raça). Se a raça foi editada no
    // cadastro, aplica só a diferença entre os modificadores antigos e os novos.
    if (getSpeciesData(sheet)) {
        const applied = getAppliedSpeciesMods(sheet);
        const current = normalizeSpeciesMods(getSpeciesData(sheet).modificadores);
        // Compara atributo a atributo (o Firestore pode devolver as chaves em outra ordem)
        if (!sheet.speciesMods || ATTRIBUTES.some(attr => toInt(applied[attr]) !== toInt(current[attr]))) {
            ATTRIBUTES.forEach(attr => {
                const data = sheet.attributes?.[attr];
                if (data) data.val = toInt(data.val) - toInt(applied[attr]) + toInt(current[attr]);
            });
            sheet.speciesMods = current;
            changed = true;
        }
    }
    ATTRIBUTES.forEach(attr => {
        const data = sheet.attributes?.[attr];
        if (!data) return;
        // Fichas do jeito antigo guardavam um "valor base" separado; o val já tinha a conta
        if (data.base !== undefined) {
            delete data.base;
            changed = true;
        }
        const mod = Math.floor((toInt(data.val) - 10) / 2);
        if (data.mod !== mod) {
            data.mod = mod;
            changed = true;
        }
    });
    const total = toInt(sheet.hp?.total);
    if (total > 0 && toInt(sheet.hp.current) > total) {
        sheet.hp.current = total;
        changed = true;
    }
    return changed;
}

function getHalfLevel(sheet) {
    return Math.floor(getCharacterLevel(sheet) / 2);
}

function hasForcePointChoice(sheet, english) {
    const names = Array.isArray(sheet.escolhas) ? getOwnedChoices(sheet).map(entry => entry.nome) : [...(sheet.talents || []), ...(sheet.aptitudes || [])];
    return names.some(name => name.endsWith(`(${english})`));
}

function getForcePointStats(sheet) {
    const classes = (sheet.classes || []).filter(entry => toInt(entry.level) > 0);
    const className = classes.find(entry => entry.name === sheet.forcePoints?.className)?.name || classes.at(-1)?.name || '';
    const classData = Object.values(CLASS_DATA).find(entry => entry.nome === className);
    const level = getCharacterLevel(sheet);
    const total = level ? (classData?.forcePointBase || 5) + getHalfLevel(sheet) + (hasForcePointChoice(sheet, 'Force Boon') ? 3 : 0) : 0;
    const dice = level >= 15 ? 3 : level >= 8 ? 2 : 1;
    const sides = hasForcePointChoice(sheet, 'Strong in the Force') ? 8 : 6;
    return { total, dice, sides, className, level };
}

function prepareForcePoints(sheet) {
    const stats = getForcePointStats(sheet);
    const previous = sheet.forcePoints;
    const legacy = sheet.combat?.forcePoints;
    let current = previous?.current ?? (legacy !== '' && legacy != null ? toInt(legacy) : stats.total);
    if (previous && stats.level > previous.level) current = stats.total;
    else if (previous && stats.total !== previous.total) current += stats.total - previous.total;
    const next = { current: Math.max(0, Math.min(stats.total, toInt(current))), total: stats.total, level: stats.level, className: stats.className };
    if (JSON.stringify(previous) === JSON.stringify(next)) return false;
    sheet.forcePoints = next;
    return true;
}

function calculateFlatFootedDefense(sheet) {
    const keepDex = hasForcePointChoice(sheet, 'Uncanny Dodge I');
    return calculateDefense(sheet, 'REF') - (keepDex ? 0 : Math.max(0, toInt(sheet.attributes.DES?.mod)));
}

function getConditionPenalty(sheet) {
    const condition = toInt(sheet.condition);
    return condition === -99 ? -10 : condition;
}

function calculateSkillTotal(sheet, skill) {
    const sk = sheet.skills?.[skill.key] || { treinada: false, bonus: 0 };
    const attrMod = toInt(sheet.attributes?.[skill.attr]?.mod);
    return getHalfLevel(sheet) + attrMod + (sk.treinada ? 5 : 0) + getSpeciesSkillBonus(sheet, skill.key) + toInt(sk.bonus) + getConditionPenalty(sheet);
}

function calculateDefense(sheet, defType) {
    const baseDefense = 10;
    const def = sheet.defenses[defType];
    const defense = DEFENSES.find(d => d.key === defType);
    const attrMod = toInt(sheet.attributes[defense.attr]?.mod);
    return baseDefense + attrMod + toInt(def?.level) + toInt(def?.class) + getSpeciesDefenseBonus(sheet, defType) + toInt(def?.hab) + toInt(def?.other);
}

function calculateDamageThreshold(sheet) {
    return calculateDefense(sheet, 'FORT') + getSpeciesThresholdBonus(sheet) + toInt(sheet.damageThreshold?.other);
}

function getHpState(sheet) {
    const total = toInt(sheet.hp?.total);
    const current = toInt(sheet.hp?.current);
    const percent = total > 0 ? Math.max(0, Math.min(100, (current / total) * 100)) : 0;
    const level = percent <= 25 ? 'low' : percent <= 50 ? 'mid' : '';
    return { percent, level };
}

function getSpeciesData(sheet) {
    return SPECIES_DATA[sheet.speciesKey] || null;
}

function getSpeciesEffects(sheet) {
    return SPECIES_EFFECTS[sheet.speciesKey] || null;
}

function getSpeciesModifier(sheet, attr) {
    return toInt(getSpeciesData(sheet)?.modificadores?.[attr]);
}

function normalizeSpeciesMods(modificadores) {
    const result = {};
    ATTRIBUTES.forEach(attr => {
        const value = toInt(modificadores?.[attr]);
        if (value) result[attr] = value;
    });
    return result;
}

function getAppliedSpeciesMods(sheet) {
    return sheet.speciesMods || normalizeSpeciesMods(getSpeciesData(sheet)?.modificadores);
}

function getSpeciesDefenseBonus(sheet, defType) {
    const effects = getSpeciesEffects(sheet);
    if (!effects) return 0;
    return toInt(effects.defesas?.[defType]) + toInt(SIZE_EFFECTS[effects.tamanho]?.defesas?.[defType]);
}

function getSpeciesSkillBonus(sheet, skillKey) {
    const effects = getSpeciesEffects(sheet);
    if (!effects) return 0;
    const size = toInt(SIZE_EFFECTS[effects.tamanho]?.pericias?.[skillKey]);
    const focus = effects.focoPericia === skillKey && sheet.skills?.[skillKey]?.treinada ? 5 : 0;
    const fixed = toInt(effects.pericias?.[skillKey]);
    return size + focus + fixed;
}

function getSpeciesThresholdBonus(sheet) {
    const effects = getSpeciesEffects(sheet);
    if (!effects) return 0;
    return toInt(effects.limiar) + toInt(SIZE_EFFECTS[effects.tamanho]?.limiar);
}

function getSpeciesSpeedText(sheet) {
    const effects = getSpeciesEffects(sheet);
    if (!effects) return '';
    return `${effects.velocidade} quadrados${effects.natacao ? ` (nadando ${effects.natacao})` : ''}`;
}
