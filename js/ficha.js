// Renderização e edição das fichas de personagem

// Perícias do Star Wars Saga Edition (livro básico), em ordem alfabética.
// key = nome salvo na ficha (não mudar: perderia os dados já salvos)
// icon = sufixo da imagem img/pericias/skill-training-<icon>.jpg (null = sem imagem; mostra o atributo)
const SKILLS = [
    { key: 'acrobacia',      label: 'Acrobacia',         attr: 'DES', icon: 'acrobatics' },
    { key: 'conhecimentos',  label: 'Conhecimento',      attr: 'INT', icon: 'knowledge', group: 'knowledge' },
    { key: 'enganacao',      label: 'Enganar',           attr: 'CAR', icon: 'deception' },
    { key: 'escalar',        label: 'Escalar',           attr: 'FOR', icon: 'climb' },
    { key: 'furtividade',    label: 'Furtividade',       attr: 'DES', icon: 'stealth' },
    { key: 'iniciativa',     label: 'Iniciativa',        attr: 'DES', icon: 'initiative' },
    { key: 'mecanica',       label: 'Mecânica',          attr: 'INT', icon: 'mechanics' },
    { key: 'montaria',       label: 'Montar',            attr: 'DES', icon: 'ride' },
    { key: 'nadar',          label: 'Nadar',             attr: 'FOR', icon: 'swim' },
    { key: 'percepcao',      label: 'Percepção',         attr: 'SAB', icon: 'perception' },
    { key: 'persuasao',      label: 'Persuasão',         attr: 'CAR', icon: 'persuasion' },
    { key: 'pilotar',        label: 'Pilotar',           attr: 'DES', icon: 'pilot' },
    { key: 'obterInfo',      label: 'Reunir Informação', attr: 'CAR', icon: 'gather-information' },
    { key: 'saltar',         label: 'Saltar',            attr: 'FOR', icon: 'jump' },
    { key: 'sobrevivencia',  label: 'Sobrevivência',     attr: 'SAB', icon: 'survival' },
    { key: 'resistencia',    label: 'Tolerância',        attr: 'CON', icon: 'endurance' },
    { key: 'primeiros',      label: 'Tratar Ferimento',  attr: 'SAB', icon: 'treat-injury' },
    { key: 'usarForca',      label: 'Usar a Força',      attr: 'CAR', icon: 'use-the-force' },
    { key: 'usarComputador', label: 'Usar Computador',   attr: 'INT', icon: 'use-computer' },
];

// Áreas de Conhecimento: cada uma é treinada separadamente, como no Saga Edition
const KNOWLEDGE_SKILLS = [
    { key: 'conhecimentoBurocracia',        label: 'Burocracia',         attr: 'INT', icon: 'knowledge-bureaucracy' },
    { key: 'conhecimentoCienciasFisicas',   label: 'Ciências Físicas',   attr: 'INT', icon: 'knowledge-physical-sciences' },
    { key: 'conhecimentoCienciasSociais',   label: 'Ciências Sociais',   attr: 'INT', icon: 'knowledge-social-sciences' },
    { key: 'conhecimentoCienciasVida',      label: 'Ciências da Vida',   attr: 'INT', icon: 'knowledge-life-sciences' },
    { key: 'conhecimentoTaticas',           label: 'Táticas',            attr: 'INT', icon: 'knowledge-tactics' },
    { key: 'conhecimentoTecnologia',        label: 'Tecnologia',         attr: 'INT', icon: 'knowledge-technology' },
    { key: 'conhecimentoTradicaoGalactica', label: 'Tradição Galáctica', attr: 'INT', icon: 'knowledge-galactic-lore' },
];

// Perícias que as fichas antigas tinham, mas não existem no Saga Edition.
// Os valores continuam salvos; a aba Perícias só avisa se havia algo preenchido.
const REMOVED_SKILLS = [
    { key: 'atletismo', label: 'Atletismo', hint: 'use Escalar, Saltar ou Nadar' },
    { key: 'intimidar', label: 'Intimidar', hint: 'no Saga Edition intimidar é feito com Persuasão' },
];

// Perícias que têm linha própria e total calculado (Conhecimentos vira um grupo com as áreas)
const SKILL_ROWS = [...SKILLS.filter(skill => !skill.group), ...KNOWLEDGE_SKILLS];

// Fichas com o grupo de Conhecimentos aberto (estado só da tela, não é salvo)
const openKnowledgeGroups = new Set();

const ATTRIBUTES = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];

// icon = nome da imagem em img/defesas/ (sem extensão)
const DEFENSES = [
    { key: 'FORT', label: 'Fortitude', attr: 'CON', icon: 'fortitude' },
    { key: 'REF',  label: 'Reflexos',  attr: 'DES', icon: 'reflex' },
    { key: 'VON',  label: 'Vontade',   attr: 'SAB', icon: 'will' },
];

const DEFENSE_PARTS = [
    { key: 'level', label: 'Nível' },
    { key: 'class', label: 'Classe' },
    { key: 'species', label: 'Raça' },
    { key: 'hab',   label: 'Hab.' },
    { key: 'other', label: 'Outros' },
];

const CONDITION_STEPS = [
    { value: 0,   display: '0',   label: 'Normal',  color: '#3ad29f' },
    { value: -1,  display: '−1',  label: 'Passo 1', color: '#b6d95a' },
    { value: -2,  display: '−2',  label: 'Passo 2', color: '#ffe81f' },
    { value: -5,  display: '−5',  label: 'Passo 3', color: '#ff9f43' },
    { value: -10, display: '−10', label: 'Passo 4', color: '#ff5263' },
    { value: -99, display: '✕',   label: 'Incapaz', color: '#a3203a' },
];

const SHEET_TABS = [
    { key: 'ficha',    label: 'Ficha' },
    { key: 'pericias', label: 'Perícias' },
    { key: 'equipamentos', label: 'Equipamentos' },
    { key: 'notas',    label: 'Notas' },
    { key: 'lore',     label: 'História' },
];

// Seções da aba Notas geradas a partir das listas da aba Ficha.
// O prefixo compõe a chave em noteDetails; mudar quebraria as notas já salvas.
const NOTE_SECTIONS = {
    forcePowers: {
        title: 'Poderes da Força', prefix: 'force', label: 'Poder da Força', badge: 'badge-force',
        placeholder: 'Descreva em detalhes o que este poder faz, seus efeitos, custo, alcance, etc...',
        empty: 'Nenhum Poder da Força adicionado ainda. Adicione poderes na aba Ficha.'
    },
    talents: {
        title: 'Talentos', prefix: 'talent', label: 'Talento', badge: 'badge-talent',
        placeholder: 'Descreva em detalhes como este talento funciona, seus benefícios, pré-requisitos, etc...',
        empty: 'Nenhum Talento adicionado ainda. Adicione talentos na aba Ficha.'
    },
    aptitudes: {
        title: 'Aptidões', prefix: 'aptitude', label: 'Aptidão', badge: 'badge-aptitude',
        placeholder: 'Descreva em detalhes como esta aptidão funciona, seus benefícios, pré-requisitos, etc...',
        empty: 'Nenhuma Aptidão adicionada ainda. Adicione aptidões na aba Ficha.'
    }
};

const PORTRAIT_ICON = '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.6-4 4.6-6 8-6s6.4 2 8 6"/></svg>';

function createEmptySheet(id) {
    return {
        id: id || Date.now() + Math.floor(Math.random() * 100000),
        name: "Novo Personagem",
        player: "",
        classes: [{ name: "Jedi", level: 1 }],
        species: "",
        speciesKey: "",
        level: 1,
        age: "",
        sex: "",
        weight: "",
        height: "",
        alignment: "Neutro",
        // val = valor real do atributo (já com a raça); speciesMods = modificadores de raça já somados em val
        attributes: {
            FOR: { val: 10, mod: 0 },
            DES: { val: 10, mod: 0 },
            CON: { val: 10, mod: 0 },
            INT: { val: 10, mod: 0 },
            SAB: { val: 10, mod: 0 },
            CAR: { val: 10, mod: 0 }
        },
        hp: { total: 0, current: 0 },
        damageThreshold: { other: 0 },
        condition: 0,
        defenses: {
            FORT: { level: 0, class: 0, hab: 0, other: 0 },
            REF: { level: 0, class: 0, hab: 0, other: 0 },
            VON: { level: 0, class: 0, hab: 0, other: 0 }
        },
        combat: { speed: "", init: "", perc: "", bab: "", forcePoints: "" },
        inventory: [],
        attacks: [],
        specialActions: ["", "", ""],
        skills: Object.fromEntries(SKILL_ROWS.map(skill => [skill.key, { treinada: false, bonus: 0 }])),
        // talents/aptitudes são recalculados a partir de "escolhas" (js/talentos.js cria esse campo na
        // primeira renderização e converte o que já estiver digitado aqui)
        talents: [],
        aptitudes: [],
        excludedAutomaticChoices: [],
        forcePowers: [],
        lore: "",
        noteDetails: {},
        generalNotes: "",
        customNotes: [],
        activeTab: 'ficha',
        image: "",
        imageState: {
            zoom: 1,
            offsetX: 0,
            offsetY: 0
        }
    };
}

function findSheet(id) {
    return sheets.find(s => s.id === Number(id));
}

function toInt(value) {
    return parseInt(value, 10) || 0;
}

function formatBonus(value) {
    return (value >= 0 ? '+' : '') + value;
}

// ===== Regras =====

// Nível do personagem = soma dos níveis de classe
function getCharacterLevel(sheet) {
    return (sheet.classes || []).reduce((sum, c) => sum + Math.max(0, toInt(c.level)), 0);
}

// Corrige valores que dependem de outros campos: grava o nível (usado nas perícias e no
// "Nível" das defesas) e impede PV atual acima do total. Retorna true se algo mudou.
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

function renderForcePoints(sheet) {
    const stats = getForcePointStats(sheet);
    return `<div class="card" data-force-points>
        <div class="card-header"><h3 class="card-title">Pontos da Força</h3><span class="force-dice" title="${stats.dice > 1 ? 'Role os dados e use somente o maior resultado' : 'Bônus ao gastar um Ponto da Força'}"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${stats.sides === 8 ? '<path d="M12 2 22 12 12 22 2 12Z M12 2 8 12l4 10 4-10Z M2 12h20"/>' : '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 7h.01M17 7h.01M7 12h.01M17 12h.01M7 17h.01M17 17h.01" stroke-width="3" stroke-linecap="round"/>'}</svg>${stats.dice}d${stats.sides}</span></div>
        <div class="force-points-fields">
            <div class="field"><label for="fp-total-${sheet.id}">Total</label><input id="fp-total-${sheet.id}" class="stat-input locked" type="number" value="${stats.total}" readonly></div>
            <div class="field"><label for="fp-current-${sheet.id}">Atual</label><input id="fp-current-${sheet.id}" class="stat-input" type="number" min="0" max="${stats.total}" value="${sheet.forcePoints?.current ?? stats.total}" onchange="updateForcePoints(${sheet.id}, this.value)"></div>
        </div>
        ${stats.dice > 1 ? '<p class="card-hint">Use apenas o maior dado.</p>' : ''}
        ${(sheet.classes || []).length > 1 ? `<div class="field force-point-class"><label for="fp-class-${sheet.id}">Classe do último nível</label><select id="fp-class-${sheet.id}" onchange="updateForcePointClass(${sheet.id}, this.value)">${sheet.classes.map(entry => `<option ${entry.name === stats.className ? 'selected' : ''}>${escapeHtml(entry.name)}</option>`).join('')}</select></div>` : ''}
    </div>`;
}

function updateForcePoints(id, value) {
    const sheet = findSheet(id);
    if (!sheet) return;
    prepareForcePoints(sheet);
    sheet.forcePoints.current = Math.max(0, Math.min(sheet.forcePoints.total, toInt(value)));
    document.getElementById(`fp-current-${id}`).value = sheet.forcePoints.current;
    scheduleSave(id);
}

function updateForcePointClass(id, name) {
    const sheet = findSheet(id);
    if (!sheet || !sheet.classes.some(entry => entry.name === name)) return;
    prepareForcePoints(sheet);
    sheet.forcePoints.className = name;
    renderSheets();
    scheduleSave(id);
}

function getConditionPenalty(sheet) {
    const condition = toInt(sheet.condition);
    return condition === -99 ? -10 : condition;
}

// Perícia = ½ nível + mod. do atributo + 5 se treinada + raça + bônus extra + penalidade de condição
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

// Limiar de Dano = Defesa de Fortitude + raça (tamanho, talento bônus) + outros
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

// ===== Raça =====

function getSpeciesData(sheet) {
    return SPECIES_DATA[sheet.speciesKey] || null;
}

function getSpeciesEffects(sheet) {
    return SPECIES_EFFECTS[sheet.speciesKey] || null;
}

function getSpeciesModifier(sheet, attr) {
    return toInt(getSpeciesData(sheet)?.modificadores?.[attr]);
}

// { FOR: -2, CAR: 2 } só com os atributos que têm modificador
function normalizeSpeciesMods(modificadores) {
    const result = {};
    ATTRIBUTES.forEach(attr => {
        const value = toInt(modificadores?.[attr]);
        if (value) result[attr] = value;
    });
    return result;
}

// Modificadores de raça que já estão somados nos atributos da ficha.
// Fichas antigas não guardam isso: vale o modificador da raça atual.
function getAppliedSpeciesMods(sheet) {
    return sheet.speciesMods || normalizeSpeciesMods(getSpeciesData(sheet)?.modificadores);
}

// Bônus de espécie (Vontade de Ferro, Grande Fortitude...) + efeito de tamanho
function getSpeciesDefenseBonus(sheet, defType) {
    const effects = getSpeciesEffects(sheet);
    if (!effects) return 0;
    return toInt(effects.defesas?.[defType]) + toInt(SIZE_EFFECTS[effects.tamanho]?.defesas?.[defType]);
}

// Tamanho (Furtividade) + Foco em Perícia condicional quando treinada + bônus fixos da raça
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

function renderSkillSpeciesBonus(sheet, skillKey) {
    const bonus = getSpeciesSkillBonus(sheet, skillKey);
    return bonus
        ? `<span class="skill-species ${bonus < 0 ? 'negative' : ''}">${formatBonus(bonus)}</span>`
        : '<span class="skill-species empty">—</span>';
}

function renderSpeciesField(sheet) {
    const data = getSpeciesData(sheet);
    if (data) {
        const icon = typeof renderSpeciesIcon === 'function' ? renderSpeciesIcon(sheet.speciesKey, 'species-field-icon') : '';
        return `
            <button type="button" id="species-${sheet.id}" class="species-field" onclick="openSpeciesPicker(${sheet.id})" title="Trocar raça">
                ${icon}<span>${escapeHtml(data.nome)}</span>
            </button>
        `;
    }
    // Ficha antiga com a espécie digitada à mão: mostra o texto e convida a escolher na lista
    return `
        <button type="button" id="species-${sheet.id}" class="species-field empty" onclick="openSpeciesPicker(${sheet.id})">
            <span>${sheet.species ? `${escapeHtml(sheet.species)}<small>escolher na lista</small>` : 'Escolher raça'}</span>
        </button>
    `;
}

function renderSpeciesTraits(sheet) {
    const data = getSpeciesData(sheet);
    if (!data?.tracos?.length) return '';
    return `
        <section class="card species-traits-card">
            <div class="card-header">
                <h3 class="card-title">Traços Raciais · ${escapeHtml(data.nome)}</h3>
                <button class="btn-add" onclick="openSpeciesPicker(${sheet.id})">Ver raça</button>
            </div>
            <div class="trait-grid">
                ${data.tracos.map(trait => `
                    <div class="trait-card">
                        <h5>${escapeHtml(trait.nome)}</h5>
                        <p>${escapeHtml(trait.texto)}</p>
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

// ===== Imagem do personagem =====

function pickCharacterImage(sheetId) {
    document.querySelector(`#sheet-${sheetId} .image-input`)?.click();
}

function updateImageTransform(sheetId) {
    const sheet = findSheet(sheetId);
    if (!sheet) return;

    const img = document.querySelector(`#sheet-${sheetId} .character-image`);
    const info = document.querySelector(`#sheet-${sheetId} .zoom-info`);

    if (img) {
        img.style.transform = `scale(${sheet.imageState.zoom}) translate(${sheet.imageState.offsetX}px, ${sheet.imageState.offsetY}px)`;
    }
    if (info) {
        info.textContent = `${(sheet.imageState.zoom * 100).toFixed(0)}%`;
    }
}

function zoomIn(sheetId) {
    const sheet = findSheet(sheetId);
    if (sheet) {
        sheet.imageState.zoom = Math.min(sheet.imageState.zoom + 0.2, 3);
        updateImageTransform(sheetId);
        scheduleSave(sheet.id);
    }
}

function zoomOut(sheetId) {
    const sheet = findSheet(sheetId);
    if (sheet) {
        sheet.imageState.zoom = Math.max(sheet.imageState.zoom - 0.2, 0.5);
        updateImageTransform(sheetId);
        scheduleSave(sheet.id);
    }
}

function fitImageToContainer(sheetId) {
    const sheet = findSheet(sheetId);
    if (sheet) {
        sheet.imageState.zoom = 1;
        sheet.imageState.offsetX = 0;
        sheet.imageState.offsetY = 0;
        updateImageTransform(sheetId);
        scheduleSave(sheet.id);
    }
}

// Arrasto da imagem: um único par de listeners no document, registrado uma vez só.
let imagePan = null;

document.addEventListener('mousemove', e => {
    if (!imagePan) return;
    const sheet = findSheet(imagePan.sheetId);
    if (!sheet) return;

    sheet.imageState.offsetX += (e.clientX - imagePan.startX) / sheet.imageState.zoom;
    sheet.imageState.offsetY += (e.clientY - imagePan.startY) / sheet.imageState.zoom;
    imagePan.startX = e.clientX;
    imagePan.startY = e.clientY;

    updateImageTransform(imagePan.sheetId);
});

document.addEventListener('mouseup', () => {
    if (!imagePan) return;
    imagePan.container.classList.remove('active');
    scheduleSave(imagePan.sheetId);
    imagePan = null;
});

function setupImagePanEvents(sheetId) {
    const container = document.querySelector(`#sheet-${sheetId} .image-container-9-16`);
    if (!container || !findSheet(sheetId)) return;

    container.addEventListener('mousedown', e => {
        e.preventDefault();
        imagePan = { sheetId, container, startX: e.clientX, startY: e.clientY };
        container.classList.add('active');
    });

    container.addEventListener('wheel', e => {
        e.preventDefault();
        if (e.deltaY < 0) zoomIn(sheetId);
        else zoomOut(sheetId);
    });
}

// ===== Abas de personagem =====

// Ordenar fichas: mestre primeiro, depois ordem fixa por owner, depois nome
function getSortedSheets() {
    const order = window.OWNER_ORDER || [];
    const currentOwner = window._isMaster ? 'mestre' : (window.PLAYER_INFO?.[window._currentUser?.email]?.id || '');
    const position = owner => order.indexOf(owner) === -1 ? 999 : order.indexOf(owner);
    return [...sheets].sort((a, b) => {
        const posA = position(a.owner || currentOwner);
        const posB = position(b.owner || currentOwner);
        if (posA !== posB) return posA - posB;
        return (a.name || '').localeCompare(b.name || '', 'pt-BR');
    });
}

// Avatar da aba: retrato do personagem, senão o ícone da primeira classe, senão as iniciais
function renderSheetAvatar(sheet) {
    const url = sheet.image || getClassIconUrl(sheet.classes?.[0]?.name);
    return url
        ? `<img src="${escapeHtml(url)}" alt="" draggable="false">`
        : escapeHtml(getInitials(sheet.name));
}

function renderTabsHeader(sortedSheets) {
    const tabsHeader = document.getElementById('tabsHeader');
    tabsHeader.innerHTML = '';

    sortedSheets.forEach(sheet => {
        const btn = document.createElement('button');
        const ownerInfo = Object.values(window.PLAYER_INFO || {}).find(i => i.id === sheet.owner);
        btn.className = `tab-btn ${ownerInfo ? ownerInfo.color : ''} ${sheet.id === activeSheetId ? 'active' : ''}`;
        btn.innerHTML = `
            <span class="tab-avatar">${renderSheetAvatar(sheet)}</span>
            <span class="tab-text">
                <span class="tab-name">${escapeHtml(sheet.name || 'Sem Nome')}</span>
                <span class="tab-owner">${escapeHtml(ownerInfo?.label || '')}</span>
            </span>
            `;
        btn._sheetId = sheet.id;
        btn.onclick = () => switchSheet(sheet.id);
        const wrapper = document.createElement('div');
        wrapper.className = 'sheet-tab-item';
        wrapper.appendChild(btn);
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'remove-tab';
        removeButton.textContent = '×';
        removeButton.setAttribute('aria-label', `Apagar ficha ${sheet.name || 'Sem Nome'}`);
        removeButton.title = 'Apagar ficha';
        removeButton.onclick = () => removeSheet(sheet.id);
        wrapper.appendChild(removeButton);
        tabsHeader.appendChild(wrapper);
    });

    const addBtn = document.createElement('button');
    addBtn.className = 'add-tab-btn';
    addBtn.textContent = '+ Nova Ficha';
    addBtn.onclick = addNewSheet;
    tabsHeader.appendChild(addBtn);
}

// ===== Renderização da ficha =====

function renderSheets() {
    const container = document.getElementById('sheetsContainer');
    container.innerHTML = '';

    const sortedSheets = getSortedSheets();

    // Se a ficha ativa foi apagada, mostra a primeira disponível
    if (sortedSheets.length > 0 && !findSheet(activeSheetId)) {
        activeSheetId = sortedSheets[0].id;
    }

    renderTabsHeader(sortedSheets);

    sortedSheets.forEach(sheet => {
        // Fichas antigas podem ter nível digitado à mão ou PV atual acima do total
        if (syncDerivedValues(sheet)) scheduleSave(sheet.id);
        // Talentos e Aptidões por nível (js/talentos.js); converte a lista digitada das fichas antigas
        if (prepareSheetChoices(sheet)) scheduleSave(sheet.id);
        if (prepareForcePoints(sheet)) scheduleSave(sheet.id);
        if (prepareInventory(sheet)) scheduleSave(sheet.id);
        if (prepareAttacks(sheet)) scheduleSave(sheet.id);

        const sheetDiv = document.createElement('div');
        sheetDiv.className = `sheet-content ${sheet.id === activeSheetId ? 'active' : ''}`;
        sheetDiv.id = `sheet-${sheet.id}`;

        try {
            sheetDiv.innerHTML = `
                <div class="sheet-tabs">
                    ${SHEET_TABS.map(tab => `<button class="sheet-tab" data-tab="${tab.key}" onclick="switchSheetTab(${sheet.id}, '${tab.key}')">${tab.label}</button>`).join('')}
                </div>
                <div id="tab-ficha-${sheet.id}" class="sheet-tab-content" hidden>${renderFichaTab(sheet)}</div>
                <div id="tab-pericias-${sheet.id}" class="sheet-tab-content" hidden>${renderSkillsTab(sheet)}</div>
                <div id="tab-equipamentos-${sheet.id}" class="sheet-tab-content" hidden>${renderInventoryCard(sheet)}</div>
                <div id="tab-notas-${sheet.id}" class="sheet-tab-content" hidden>${renderNotesTab(sheet)}</div>
                <div id="tab-lore-${sheet.id}" class="sheet-tab-content" hidden>${renderLoreTab(sheet)}</div>
            `;
        } catch(e) {
            console.error('renderSheets error for sheet', sheet.id, e);
            sheetDiv.innerHTML = '<div class="card">Erro ao renderizar ficha: ' + escapeHtml(e.message) + '</div>';
        }

        container.appendChild(sheetDiv);
        switchSheetTab(sheet.id, sheet.activeTab || 'ficha');

        if (sheet.image) {
            setupImagePanEvents(sheet.id);
        }
    });
}

function renderFichaTab(sheet) {
    return `
        <section class="hero">
            ${renderPortrait(sheet)}
            ${renderBasicInfo(sheet)}
            ${renderAttributes(sheet)}
        </section>

        <section class="vitals">
            ${renderHitPoints(sheet)}
            ${renderForcePoints(sheet)}
            ${renderDamageThreshold(sheet)}
            ${renderConditionTrack(sheet)}
        </section>

        ${renderDefenses(sheet)}

        ${renderSpeciesTraits(sheet)}

        <section class="grid-section">
            ${renderChoiceCard(sheet, 'talento')}
            ${renderChoiceCard(sheet, 'aptidao')}
            ${renderForcePowersCard(sheet)}
        </section>

        <section class="combat-equipment-section">
            ${renderAttacksCard(sheet)}
        </section>
    `;
}

function renderPortrait(sheet) {
    const zoom = Number(sheet.imageState?.zoom) || 1;
    const offsetX = Number(sheet.imageState?.offsetX) || 0;
    const offsetY = Number(sheet.imageState?.offsetY) || 0;

    return `
        <div class="card portrait-card">
            <div class="image-container-9-16">
                ${sheet.image ? `
                    <div class="image-wrapper">
                        <img src="${escapeHtml(sheet.image)}" alt="Retrato de ${escapeHtml(sheet.name)}" class="character-image" draggable="false" style="transform: scale(${zoom}) translate(${offsetX}px, ${offsetY}px)">
                    </div>
                ` : `
                    <div class="image-placeholder" onclick="pickCharacterImage(${sheet.id})">
                        ${PORTRAIT_ICON}
                        <span>Adicionar retrato</span>
                    </div>
                `}
            </div>
            ${sheet.image ? `
                <div class="portrait-toolbar">
                    <button class="icon-btn" title="Diminuir zoom" onclick="zoomOut(${sheet.id})">−</button>
                    <span class="zoom-info">${(zoom * 100).toFixed(0)}%</span>
                    <button class="icon-btn" title="Aumentar zoom" onclick="zoomIn(${sheet.id})">+</button>
                    <button class="icon-btn" title="Encaixar imagem" onclick="fitImageToContainer(${sheet.id})">⤢</button>
                </div>
            ` : ''}
            <div class="portrait-actions">
                <button class="btn btn-small" onclick="pickCharacterImage(${sheet.id})">${sheet.image ? 'Trocar' : 'Enviar imagem'}</button>
                ${sheet.image ? `<button class="btn btn-small btn-danger" onclick="removeCharacterImage(${sheet.id})">Remover</button>` : ''}
            </div>
            <input type="file" accept="image/*" class="image-input" hidden onchange="uploadCharacterImage(${sheet.id}, this)">
        </div>
    `;
}

function renderTextField(sheet, field, label) {
    const inputId = `${field}-${sheet.id}`;
    return `
        <div class="field">
            <label for="${inputId}">${label}</label>
            <input id="${inputId}" type="text" value="${escapeHtml(sheet[field])}" onchange="updateField(${sheet.id}, '${field}', this.value)">
        </div>
    `;
}

function renderBasicInfo(sheet) {
    return `
        <div class="card hero-main">
            <div>
                <label class="sr-only" for="name-${sheet.id}">Nome</label>
                <input id="name-${sheet.id}" class="hero-name" type="text" value="${escapeHtml(sheet.name)}" placeholder="Nome do personagem" onchange="updateField(${sheet.id}, 'name', this.value)">
            </div>
            <div class="info-grid">
                ${renderTextField(sheet, 'player', 'Jogador')}
                <div class="field">
                    <label for="species-${sheet.id}">Espécie</label>
                    ${renderSpeciesField(sheet)}
                </div>
                <div class="field">
                    <label for="level-${sheet.id}">Nível <span class="label-hint">soma das classes</span></label>
                    <input id="level-${sheet.id}" class="locked" type="number" value="${getCharacterLevel(sheet)}" readonly tabindex="-1" title="Soma dos níveis das classes">
                </div>
                ${renderTextField(sheet, 'alignment', 'Alinhamento')}
                ${renderTextField(sheet, 'age', 'Idade')}
                ${renderTextField(sheet, 'sex', 'Sexo')}
                <div class="field">
                    <label for="speed-${sheet.id}">Deslocamento <span class="label-hint">da raça</span></label>
                    <input id="speed-${sheet.id}" class="locked" type="text" value="${escapeHtml(getSpeciesSpeedText(sheet) || '—')}" readonly tabindex="-1">
                </div>
            </div>
            <div>
                <div class="card-header">
                    <h3 class="card-title">Classes</h3>
                    <button class="btn-add" onclick="addClass(${sheet.id})">+ Classe</button>
                </div>
                <div id="classes-${sheet.id}" class="class-list">
                    ${sheet.classes.length ? sheet.classes.map((c, idx) => renderClassRow(sheet.id, idx, c)).join('') : '<div class="list-empty">Nenhuma classe. Use “+ Classe” para adicionar.</div>'}
                </div>
            </div>
        </div>
    `;
}

function renderClassRow(sheetId, index, classObj) {
    const option = name => `<option ${name === classObj.name ? 'selected' : ''}>${name}</option>`;
    return `
        <div class="class-row">
            ${renderClassIcon(classObj.name)}
            <select aria-label="Classe" onchange="updateClassRow(${sheetId}, ${index}, this.value, 'name')">
                <optgroup label="Classes Heroicas">${HEROIC_CLASSES.map(option).join('')}</optgroup>
                <optgroup label="Classes de Prestígio">${PRESTIGE_CLASSES.map(option).join('')}</optgroup>
            </select>
            <div class="class-level">
                <span>Nív.</span>
                <input type="number" min="1" aria-label="Nível na classe" value="${toInt(classObj.level)}" onchange="updateClassRow(${sheetId}, ${index}, this.value, 'level')">
            </div>
            ${renderClassEntryWarning(sheetId, index)}
            <button type="button" class="btn btn-small btn-danger" aria-label="Remover classe ${escapeHtml(classObj.name)}" onclick="removeClassRow(${sheetId}, ${index})">Remover</button>
        </div>
    `;
}

function renderAttributes(sheet) {
    return `
        <div class="card attributes-card">
            <div class="card-header">
                <h3 class="card-title">Atributos</h3>
            </div>
            <div class="attr-grid">
                ${ATTRIBUTES.map(attr => {
                    const mod = toInt(sheet.attributes[attr]?.mod);
                    return `
                        <div class="attr-card">
                            <span class="attr-name">${attr}</span>
                            <span class="attr-mod ${mod < 0 ? 'negative' : ''}" data-attr-mod="${attr}">${formatBonus(mod)}</span>
                            <input type="number" class="attr-score" aria-label="Valor de ${attr}" value="${toInt(sheet.attributes[attr]?.val)}" onchange="updateAttr(${sheet.id}, '${attr}', this.value)">
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function renderHitPoints(sheet) {
    const hp = getHpState(sheet);
    const total = toInt(sheet.hp?.total);
    return `
        <div class="card">
            <div class="card-header"><h3 class="card-title">Pontos de Vida</h3></div>
            <div class="hp-layout">
                <span class="defense-icon" aria-hidden="true"><img src="img/defesas/hit-points.jpg" alt="" draggable="false"></span>
                <div class="field">
                    <label for="hp-current-${sheet.id}">Atual</label>
                    <input id="hp-current-${sheet.id}" class="stat-input" type="number" min="0" ${total > 0 ? `max="${total}"` : ''} value="${toInt(sheet.hp?.current)}" onchange="updateHitPoints(${sheet.id}, 'current', this.value)">
                </div>
                <div class="field">
                    <label for="hp-total-${sheet.id}">Total</label>
                    <input id="hp-total-${sheet.id}" class="stat-input" type="number" min="0" value="${total}" onchange="updateHitPoints(${sheet.id}, 'total', this.value)">
                </div>
            </div>
            <div class="hp-bar"><div class="hp-bar-fill ${hp.level}" data-hp-bar style="width: ${hp.percent}%"></div></div>
        </div>
    `;
}

function renderDamageThreshold(sheet) {
    // Fichas antigas tinham o limiar digitado dentro de Pontos de Vida
    const legacyValue = sheet.damageThreshold === undefined ? toInt(sheet.hp?.threshold) : 0;
    const speciesThreshold = getSpeciesThresholdBonus(sheet);
    return `
        <div class="card" data-threshold>
            <div class="card-header"><h3 class="card-title">Limiar de Dano</h3></div>
            <div class="threshold-layout ${speciesThreshold ? 'with-species' : ''}">
                ${renderDefenseIcon('damage-threshold')}
                <div class="field">
                    <label for="threshold-total-${sheet.id}">Total</label>
                    <input id="threshold-total-${sheet.id}" class="stat-input locked highlight" type="number" value="${calculateDamageThreshold(sheet)}" readonly tabindex="-1" data-threshold-total>
                </div>
                <span class="threshold-op">=</span>
                <div class="field">
                    <label for="threshold-fort-${sheet.id}">Fortitude</label>
                    <input id="threshold-fort-${sheet.id}" class="stat-input locked" type="number" value="${calculateDefense(sheet, 'FORT')}" readonly tabindex="-1" title="Defesa de Fortitude" data-threshold-fort>
                </div>
                ${speciesThreshold ? `
                    <span class="threshold-op">+</span>
                    <div class="field">
                        <label for="threshold-species-${sheet.id}">Raça</label>
                        <input id="threshold-species-${sheet.id}" class="stat-input locked" type="number" value="${speciesThreshold}" readonly tabindex="-1" title="Tamanho e talento bônus da raça">
                    </div>
                ` : ''}
                <span class="threshold-op">+</span>
                <div class="field">
                    <label for="threshold-other-${sheet.id}">Outros</label>
                    <input id="threshold-other-${sheet.id}" class="stat-input" type="number" value="${toInt(sheet.damageThreshold?.other)}" onchange="updateDamageThreshold(${sheet.id}, this.value)">
                </div>
            </div>
            ${legacyValue ? `<p class="field-hint">Valor digitado antes: ${legacyValue}. Se havia bônus além da Fortitude, coloque a diferença em "Outros".</p>` : ''}
        </div>
    `;
}

function renderConditionTrack(sheet) {
    const condition = toInt(sheet.condition);
    return `
        <div class="card">
            <div class="card-header"><h3 class="card-title">Trilha de Condição</h3></div>
            <div class="condition-track">
                ${CONDITION_STEPS.map(step => `
                    <label class="condition-step ${step.value === -99 ? 'step-helpless' : ''}" style="--step-color: ${step.color}">
                        <input type="radio" name="cond-${sheet.id}" ${condition === step.value ? 'checked' : ''} onchange="updateField(${sheet.id}, 'condition', ${step.value})">
                        <span>${step.display}<small>${step.label}</small></span>
                    </label>
                `).join('')}
            </div>
        </div>
    `;
}

function renderDefenseAttribute(sheet, defType) {
    const attr = DEFENSES.find(d => d.key === defType).attr;
    return `${attr} ${formatBonus(toInt(sheet.attributes[attr]?.mod))}`;
}

function renderDefenses(sheet) {
    return `
        <section class="card defenses-card">
            <div class="card-header">
                <h3 class="card-title">Defesas</h3>
                <span class="card-hint">10 + atributo + nível + classe + raça + habilidades + outros</span>
            </div>
            <div class="defense-grid">
                ${DEFENSES.filter(def => sheet.defenses[def.key]).map(def => `
                    <div class="defense-card">
                        <div class="defense-head">
                            ${renderDefenseIcon(def.icon)}
                            <div class="defense-title">
                                <span class="defense-name">${def.label}</span>
                                <div class="defense-attr" data-def-attr="${def.key}">${renderDefenseAttribute(sheet, def.key)}</div>
                            </div>
                            <strong class="defense-total" data-def-total="${def.key}">${calculateDefense(sheet, def.key)}</strong>
                        </div>
                        <div class="defense-parts">
                            ${DEFENSE_PARTS.map(part => `
                                <div>
                                    <label for="def-${def.key}-${part.key}-${sheet.id}">${part.label}</label>
                                    ${part.key === 'species'
                                        ? `<input id="def-${def.key}-species-${sheet.id}" class="locked" type="number" value="${getSpeciesDefenseBonus(sheet, def.key)}" readonly tabindex="-1" title="Bônus da raça e do tamanho" data-def-species="${def.key}">`
                                        : part.key === 'level'
                                        ? `<input id="def-${def.key}-level-${sheet.id}" class="locked" type="number" value="${getCharacterLevel(sheet)}" readonly tabindex="-1" title="Nível do personagem (soma das classes)" data-def-level>`
                                        : `<input id="def-${def.key}-${part.key}-${sheet.id}" type="number" value="${toInt(sheet.defenses[def.key][part.key])}" onchange="updateDefense(${sheet.id}, '${def.key}', '${part.key}', this.value)">`}
                                </div>
                            `).join('')}
                        </div>
                        ${def.key === 'REF' ? `<div class="defense-head flat-footed-continuation">
                            ${renderDefenseIcon('flat-footed')}
                            <div class="defense-title"><span class="defense-name">Reflexos Desprevenido</span><div class="defense-attr">${hasForcePointChoice(sheet, 'Uncanny Dodge I') ? 'Esquiva Sobrenatural I mantém DES' : 'Sem bônus de Destreza'}</div></div>
                            <strong class="defense-total" data-flat-footed>${calculateFlatFootedDefense(sheet)}</strong>
                        </div>` : ''}
                    </div>
                `).join('')}
            </div>
        </section>
    `;
}

function renderSkillsTab(sheet) {
    return `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Perícias</h3>
                <span class="card-hint">½ nível + atributo + 5 se treinada + raça + bônus extra + condição</span>
            </div>
            <div class="table-scroll">
                <table class="skills-table">
                    <thead>
                        <tr><th>Perícia</th><th>Atributo</th><th>½ Nível</th><th>Treinada</th><th>Raça</th><th>Bônus Extra</th><th>Total</th></tr>
                    </thead>
                    <tbody>
                        ${SKILLS.map(skill => skill.group === 'knowledge' ? renderKnowledgeGroup(sheet, skill) : renderSkillRow(sheet, skill)).join('')}
                    </tbody>
                </table>
            </div>
            ${renderRemovedSkillsNotice(sheet)}
        </div>
    `;
}

function renderRemovedSkillsNotice(sheet) {
    const used = REMOVED_SKILLS
        .map(skill => ({ ...skill, data: sheet.skills?.[skill.key] }))
        .filter(skill => skill.data?.treinada || toInt(skill.data?.bonus));
    if (used.length === 0) return '';

    const describe = skill => {
        const parts = [
            skill.data.treinada ? 'treinada' : '',
            toInt(skill.data.bonus) ? `bônus ${formatBonus(toInt(skill.data.bonus))}` : ''
        ];
        return `<strong>${skill.label}</strong> (${parts.filter(Boolean).join(', ')}) — ${skill.hint}`;
    };
    return `
        <div class="skills-notice">
            Estas perícias não existem no Saga Edition e saíram da tabela:
            ${used.map(describe).join('; ')}.
        </div>
    `;
}

function renderSkillRow(sheet, skill, extraClass = '') {
    const sk = sheet.skills?.[skill.key] || { treinada: false, bonus: 0 };
    const total = calculateSkillTotal(sheet, skill);
    return `
        <tr data-skill="${skill.key}" class="${extraClass} ${sk.treinada ? 'trained' : ''}">
            <td class="skill-name"><button type="button" class="skill-uses-toggle" aria-haspopup="dialog" aria-controls="skillUsesModal" onclick="openSkillUsesModal(${sheet.id}, '${skill.key}')"><span class="skill-label">${renderSkillIcon(skill)}<span>${skill.label}</span></span></button></td>
            <td><span class="skill-attr">${skill.attr}</span></td>
            <td class="skill-half-level">${formatBonus(getHalfLevel(sheet))}</td>
            <td>
                <span class="toggle">
                    <input type="checkbox" aria-label="${skill.label} treinada" ${sk.treinada ? 'checked' : ''} onchange="updateSkill(${sheet.id}, '${skill.key}', 'treinada', this.checked)">
                    <span></span>
                </span>
            </td>
            <td data-skill-species>${renderSkillSpeciesBonus(sheet, skill.key)}</td>
            <td><input type="number" class="skill-bonus" aria-label="Bônus extra de ${skill.label}" value="${toInt(sk.bonus)}" onchange="updateSkill(${sheet.id}, '${skill.key}', 'bonus', this.value)"></td>
            <td class="skill-total ${total < 0 ? 'negative' : ''}">${formatBonus(total)}</td>
        </tr>
    `;
}

// Conhecimento: linha de grupo que abre/fecha as áreas. Usa um <tbody> próprio para
// poder esconder as áreas só com CSS (.knowledge-group sem .open).
function renderKnowledgeGroup(sheet, skill) {
    const isOpen = openKnowledgeGroups.has(sheet.id);
    return `
        </tbody>
        <tbody id="knowledge-${sheet.id}" class="knowledge-group ${isOpen ? 'open' : ''}">
            <tr class="skill-group-row" onclick="toggleKnowledgeGroup(${sheet.id})">
                <td class="skill-name">
                    <button type="button" class="group-toggle" aria-expanded="${isOpen}">
                        <span class="skill-label">${renderSkillIcon(skill)}<span>${skill.label}</span><span class="group-chevron" aria-hidden="true"></span></span>
                    </button>
                </td>
                <td><span class="skill-attr">${skill.attr}</span></td>
                <td class="skill-half-level">${formatBonus(getHalfLevel(sheet))}</td>
                <td colspan="4" class="knowledge-summary" data-knowledge-summary>${renderKnowledgeSummary(sheet)}</td>
            </tr>
            ${KNOWLEDGE_SKILLS.map(area => renderSkillRow(sheet, area, 'skill-sub')).join('')}
        </tbody>
        <tbody>
    `;
}

function renderKnowledgeSummary(sheet) {
    const trained = KNOWLEDGE_SKILLS.filter(area => sheet.skills?.[area.key]?.treinada);
    // Fichas antigas tinham um único "Conhecimentos"; avisa para escolher as áreas
    const legacy = sheet.skills?.conhecimentos;
    const hasLegacyData = trained.length === 0 && (legacy?.treinada || toInt(legacy?.bonus));
    return `
        <span class="knowledge-count">${trained.length}/${KNOWLEDGE_SKILLS.length} treinadas</span>
        ${trained.map(area => `<span class="knowledge-chip">${area.label}</span>`).join('')}
    `;
}

function toggleKnowledgeGroup(id) {
    const sheetId = Number(id);
    const isOpen = !openKnowledgeGroups.has(sheetId);
    if (isOpen) openKnowledgeGroups.add(sheetId);
    else openKnowledgeGroups.delete(sheetId);

    const group = document.getElementById(`knowledge-${sheetId}`);
    group?.classList.toggle('open', isOpen);
    group?.querySelector('.group-toggle')?.setAttribute('aria-expanded', isOpen);
}

function renderNotesTab(sheet) {
    return `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Notas</h3>
                <button class="btn-add" onclick="addCustomNote(${sheet.id})">+ Nota</button>
            </div>
            <div id="notes-custom-${sheet.id}">
                ${renderCustomNotes(sheet)}
            </div>
            ${Object.keys(NOTE_SECTIONS).map(field => `
                <div class="notes-section-title">${NOTE_SECTIONS[field].title}</div>
                <div id="notes-${field}-${sheet.id}">
                    ${renderNotesSection(sheet, field)}
                </div>
            `).join('')}
        </div>
    `;
}

function renderCustomNotes(sheet) {
    if (!sheet.customNotes || sheet.customNotes.length === 0) {
        return '<div class="notes-empty-msg">Nenhuma nota personalizada ainda. Use "+ Nota" para criar uma.</div>';
    }
    return sheet.customNotes.map((note, idx) => `
        <div class="note-card">
            <div class="note-card-header">
                <span class="note-card-badge badge-note">Nota</span>
                <input type="text" class="note-card-title-input" value="${escapeHtml(note.title)}" onchange="updateCustomNoteTitle(${sheet.id}, ${idx}, this.value)" placeholder="Título da nota">
                <button type="button" class="btn btn-small btn-danger" aria-label="Remover nota ${escapeHtml(note.title)}" onclick="removeCustomNote(${sheet.id}, ${idx})">Remover</button>
            </div>
            <textarea class="note-card-textarea" placeholder="Escreva o conteúdo da nota aqui..." onchange="updateCustomNoteText(${sheet.id}, ${idx}, this.value)">${escapeHtml(note.text)}</textarea>
        </div>
    `).join('');
}

function renderNotesSection(sheet, field) {
    const section = NOTE_SECTIONS[field];
    const items = sheet[field] ? sheet[field].filter(item => item && item.trim() !== '') : [];
    if (items.length === 0) {
        return `<div class="notes-empty-msg">${section.empty}</div>`;
    }
    return items.map(item => {
        const key = section.prefix + '_' + encodeURIComponent(item);
        const savedText = sheet.noteDetails?.[key] || '';
        // A chave vai num data-attribute: nomes com aspas não quebram o onchange
        return `
            <div class="note-card">
                <div class="note-card-header">
                    <span class="note-card-badge ${section.badge}">${section.label}</span>
                    <span class="note-card-title-static">${escapeHtml(item)}</span>
                </div>
                <textarea class="note-card-textarea" placeholder="${section.placeholder}" data-note-key="${escapeHtml(key)}" onchange="updateNoteDetail(${sheet.id}, this.dataset.noteKey, this.value)">${escapeHtml(savedText)}</textarea>
            </div>
        `;
    }).join('');
}

function renderLoreTab(sheet) {
    return `
        <div class="card">
            <div class="card-header"><h3 class="card-title">História do Personagem</h3></div>
            <textarea class="lore-textarea" placeholder="Origem, motivações, aliados, segredos..." onchange="updateField(${sheet.id}, 'lore', this.value)">${escapeHtml(sheet.lore)}</textarea>
        </div>
    `;
}

// ===== Edição =====

function uploadCharacterImage(id, input) {
    const sheet = findSheet(id);

    if (!sheet || !input.files || !input.files[0]) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        const img = new Image();

        img.onload = function() {
            // comprime a imagem para caber no Firestore
            const canvas = document.createElement('canvas');

            let width = img.width;
            let height = img.height;

            const MAX_WIDTH = 600;

            if (width > MAX_WIDTH) {
                height = Math.round(height * (MAX_WIDTH / width));
                width = MAX_WIDTH;
            }

            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);

            // jpeg comprimido
            sheet.image = canvas.toDataURL('image/jpeg', 0.65);
            sheet.imageState = { zoom: 1, offsetX: 0, offsetY: 0 };

            saveSheetNow(sheet);
            renderSheets();
        };

        img.src = e.target.result;
    };

    reader.readAsDataURL(input.files[0]);
}

function saveSheetNow(sheet) {
    scheduleSave(sheet.id);
    flushSaves();
}

function removeCharacterImage(id) {
    const sheet = findSheet(id);
    if (!sheet) return;
    showConfirmModal('Remover a imagem do personagem?', () => {
        sheet.image = '';
        sheet.imageState = { zoom: 1, offsetX: 0, offsetY: 0 };
        saveSheetNow(sheet);
        renderSheets();
    }, 'Remover');
}

function switchSheetTab(id, tabName) {
    // Estado visual: não precisa salvar
    const sheet = findSheet(id);
    if (sheet) {
        sheet.activeTab = tabName;
    }

    const sheetDiv = document.getElementById('sheet-' + id);
    if (!sheetDiv) return;

    for (const content of sheetDiv.querySelectorAll('.sheet-tab-content')) {
        content.hidden = content.id !== `tab-${tabName}-${id}`;
    }
    for (const btn of sheetDiv.querySelectorAll('.sheet-tab')) {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    }
}

function updateSkill(id, skillKey, field, value) {
    const sheet = findSheet(id);
    if (!sheet) return;
    if (!sheet.skills) sheet.skills = {};
    if (!sheet.skills[skillKey]) sheet.skills[skillKey] = { treinada: false, bonus: 0 };
    sheet.skills[skillKey][field] = field === 'treinada' ? value : toInt(value);
    refreshSkillTotals(id, sheet);
    scheduleSave(sheet.id);
}

function updateNoteDetail(id, key, value) {
    const sheet = findSheet(id);
    if (sheet) {
        if (!sheet.noteDetails) sheet.noteDetails = {};
        sheet.noteDetails[key] = value;
        scheduleSave(sheet.id);
    }
}

function addCustomNote(id) {
    const sheet = findSheet(id);
    if (sheet) {
        if (!sheet.customNotes) sheet.customNotes = [];
        sheet.customNotes.push({ title: 'Nova Nota', text: '' });
        sheet.activeTab = 'notas';
        renderSheets();
        scheduleSave(sheet.id);
    }
}

function updateCustomNoteTitle(id, index, value) {
    const sheet = findSheet(id);
    if (sheet && sheet.customNotes && sheet.customNotes[index]) {
        sheet.customNotes[index].title = value;
        scheduleSave(sheet.id);
    }
}

function updateCustomNoteText(id, index, value) {
    const sheet = findSheet(id);
    if (sheet && sheet.customNotes && sheet.customNotes[index]) {
        sheet.customNotes[index].text = value;
        scheduleSave(sheet.id);
    }
}

function removeCustomNote(id, index) {
    const sheet = findSheet(id);
    const note = sheet?.customNotes?.[index];
    if (!note || !Number.isInteger(index) || index < 0) return;
    showConfirmModal(`Remover a nota <strong>${escapeHtml(note.title || 'Sem título')}</strong>?`, () => {
        if (sheet.customNotes[index] !== note) return;
        sheet.customNotes.splice(index, 1);
        renderSheets();
        document.querySelector(`#sheet-${sheet.id} #tab-notas-${sheet.id} .btn-add`)?.focus();
        scheduleSave(sheet.id);
    }, 'Remover');
}

const NUMERIC_FIELDS = new Set(['level', 'condition']);

function updateField(id, field, value) {
    const sheet = findSheet(id);
    if (!sheet) return;

    sheet[field] = NUMERIC_FIELDS.has(field) ? toInt(value) : value;
    scheduleSave(sheet.id);

    if (field === 'name') {
        renderTabsHeader(getSortedSheets());
    }
    if (field === 'condition' || field === 'level') {
        refreshSkillTotals(id, sheet);
        refreshAttacks(id, sheet);
    }
}

function refreshSkillTotals(id, sheet) {
    const halfLevel = formatBonus(getHalfLevel(sheet));
    const knowledgeGroup = document.getElementById(`knowledge-${id}`);
    if (knowledgeGroup) {
        knowledgeGroup.querySelector('.skill-group-row .skill-half-level').textContent = halfLevel;
        knowledgeGroup.querySelector('[data-knowledge-summary]').innerHTML = renderKnowledgeSummary(sheet);
    }
    SKILL_ROWS.forEach(skill => {
        const row = document.querySelector(`#tab-pericias-${id} tr[data-skill="${skill.key}"]`);
        if (!row) return;
        const total = calculateSkillTotal(sheet, skill);
        const totalEl = row.querySelector('.skill-total');
        totalEl.textContent = formatBonus(total);
        totalEl.classList.toggle('negative', total < 0);
        row.querySelector('.skill-half-level').textContent = halfLevel;
        row.querySelector('[data-skill-species]').innerHTML = renderSkillSpeciesBonus(sheet, skill.key);
        row.classList.toggle('trained', !!sheet.skills?.[skill.key]?.treinada);
        refreshSkillUses(sheet, skill);
    });
}

function refreshHpBar(id, sheet) {
    const bar = document.querySelector(`#sheet-${id} [data-hp-bar]`);
    if (!bar) return;
    const hp = getHpState(sheet);
    bar.style.width = `${hp.percent}%`;
    bar.className = `hp-bar-fill ${hp.level}`;
}

function updateHitPoints(id, field, value) {
    const sheet = findSheet(id);
    if (!sheet) return;
    if (!sheet.hp) sheet.hp = { total: 0, current: 0 };

    sheet.hp[field] = Math.max(0, toInt(value));
    syncDerivedValues(sheet); // PV atual não passa do total

    const total = toInt(sheet.hp.total);
    const currentInput = document.getElementById(`hp-current-${id}`);
    const totalInput = document.getElementById(`hp-total-${id}`);
    if (currentInput) {
        currentInput.value = toInt(sheet.hp.current);
        if (total > 0) currentInput.max = total;
        else currentInput.removeAttribute('max');
    }
    if (totalInput) totalInput.value = total;

    refreshHpBar(id, sheet);
    scheduleSave(sheet.id);
}

function updateDamageThreshold(id, value) {
    const sheet = findSheet(id);
    if (!sheet) return;
    sheet.damageThreshold = { ...sheet.damageThreshold, other: toInt(value) };
    refreshDamageThreshold(id, sheet);
    scheduleSave(sheet.id);
}

function refreshDamageThreshold(id, sheet) {
    const card = document.querySelector(`#sheet-${id} [data-threshold]`);
    if (!card) return;
    card.querySelector('[data-threshold-fort]').value = calculateDefense(sheet, 'FORT');
    card.querySelector('[data-threshold-total]').value = calculateDamageThreshold(sheet);
}

// Atualiza na tela tudo que depende do nível do personagem
function refreshCharacterLevel(id, sheet) {
    const levelInput = document.getElementById(`level-${id}`);
    if (levelInput) levelInput.value = toInt(sheet.level);
    refreshSkillTotals(id, sheet);
    refreshDefenseTotals(id, sheet);
    refreshAttacks(id, sheet);
}

// O valor digitado é o valor real do atributo (já com a raça) e fica exatamente assim
function updateAttr(id, attr, value) {
    const sheet = findSheet(id);
    if (!sheet) return;
    const data = sheet.attributes[attr];
    data.val = toInt(value);
    data.mod = Math.floor((data.val - 10) / 2);
    delete data.base;
    refreshAttributeCard(id, sheet, attr);
    // Atualiza totais de perícias e defesas que usam esse atributo
    refreshSkillTotals(id, sheet);
    refreshDefenseTotals(id, sheet);
    refreshAttacks(id, sheet);
    scheduleSave(sheet.id);
}

function refreshAttributeCard(id, sheet, attr) {
    const mod = toInt(sheet.attributes[attr].mod);
    const modEl = document.querySelector(`#sheet-${id} [data-attr-mod="${attr}"]`);
    if (modEl) {
        modEl.textContent = formatBonus(mod);
        modEl.classList.toggle('negative', mod < 0);
    }
}

// Escolher raça: o modificador muda o próprio valor do atributo (ex.: FOR 13 com −2 vira 11).
// Trocando de raça, tira o modificador da raça antiga e soma o da nova.
function applySpeciesToSheet(id, slug) {
    const sheet = findSheet(id);
    if (!sheet || !SPECIES_DATA[slug]) return;

    const oldMods = getAppliedSpeciesMods(sheet);
    const newMods = normalizeSpeciesMods(SPECIES_DATA[slug].modificadores);
    ATTRIBUTES.forEach(attr => {
        if (!sheet.attributes[attr]) sheet.attributes[attr] = { val: 10, mod: 0 };
        const data = sheet.attributes[attr];
        data.val = toInt(data.val) - toInt(oldMods[attr]) + toInt(newMods[attr]);
        delete data.base;
    });

    sheet.speciesKey = slug;
    sheet.species = SPECIES_DATA[slug].nome;
    sheet.speciesMods = newMods;
    syncDerivedValues(sheet);
    renderSheets();
    scheduleSave(sheet.id);
}

function removeSpeciesFromSheet(id) {
    const sheet = findSheet(id);
    if (!sheet || (!sheet.speciesKey && !sheet.species)) return;
    showConfirmModal(`Remover a raça <strong>${escapeHtml(sheet.species || 'atual')}</strong> da ficha e retirar seus modificadores?`, () => {
        const oldMods = getAppliedSpeciesMods(sheet);
        ATTRIBUTES.forEach(attr => {
            const data = sheet.attributes?.[attr];
            if (data) data.val = toInt(data.val) - toInt(oldMods[attr]);
        });
        sheet.speciesKey = '';
        sheet.species = '';
        sheet.speciesMods = normalizeSpeciesMods({});
        syncDerivedValues(sheet);
        closeModal('speciesModal');
        renderSheets();
        document.getElementById(`species-${sheet.id}`)?.focus();
        scheduleSave(sheet.id);
    }, 'Remover');
}

function updateDefense(id, def, field, value) {
    const sheet = findSheet(id);
    if (sheet) {
        sheet.defenses[def][field] = toInt(value);
        refreshDefenseTotals(id, sheet);
        scheduleSave(sheet.id);
    }
}

function removeDynamicItem(id, field, index) {
    const sheet = findSheet(id);
    if (!sheet?.[field]?.[index] || !Number.isInteger(index) || index < 0) return;
    const item = sheet[field][index];
    showConfirmModal(`Remover <strong>${escapeHtml(item)}</strong> da ficha?`, () => {
        if (sheet[field][index] !== item) return;
        sheet[field].splice(index, 1);
        renderSheets();
        scheduleSave(sheet.id);
    }, 'Remover');
}

// Nível e classe mudam as vagas de Talentos/Aptidões, então a ficha é redesenhada
function updateClassRow(id, index, value, field) {
    const sheet = findSheet(id);
    if (!sheet || !sheet.classes[index]) return;
    if (field === 'name') {
        // Classe de prestígio passa pelos pré-requisitos de entrada (js/talentos.js)
        requestClassChange(id, index, value);
        return;
    }
    const newLevel = Math.max(1, toInt(value));
    if (newLevel > toInt(sheet.classes[index].level)) {
        prepareForcePoints(sheet);
        sheet.forcePoints.className = sheet.classes[index].name;
    }
    sheet.classes[index].level = newLevel;
    renderSheets();
    scheduleSave(sheet.id);
}

function removeClassRow(id, index) {
    const sheet = findSheet(id);
    const entry = sheet?.classes?.[index];
    if (!entry || !Number.isInteger(index) || index < 0) return;
    showConfirmModal(`Remover a classe <strong>${escapeHtml(entry.name)}</strong> da ficha?`, () => {
        if (sheet.classes[index] !== entry) return;
        sheet.classes.splice(index, 1);
        renderSheets();
        document.getElementById(`classes-${sheet.id}`)?.parentElement.querySelector('.btn-add')?.focus();
        scheduleSave(sheet.id);
    }, 'Remover');
}

function addClass(id) {
    const sheet = findSheet(id);
    if (sheet) {
        sheet.classes.push({ name: "Jedi", level: 1 });
        renderSheets();
        scheduleSave(sheet.id);
    }
}

function refreshDefenseTotals(id, sheet) {
    const sheetEl = document.getElementById('sheet-' + id);
    if (!sheetEl) return;
    DEFENSES.forEach(({ key }) => {
        if (!sheet.defenses[key]) return;
        const totalEl = sheetEl.querySelector(`[data-def-total="${key}"]`);
        if (totalEl) totalEl.textContent = calculateDefense(sheet, key);
        const attrEl = sheetEl.querySelector(`[data-def-attr="${key}"]`);
        if (attrEl) attrEl.textContent = renderDefenseAttribute(sheet, key);
    });
    sheetEl.querySelectorAll('[data-def-level]').forEach(input => { input.value = toInt(sheet.level); });
    const flatFooted = sheetEl.querySelector('[data-flat-footed]');
    if (flatFooted) flatFooted.textContent = calculateFlatFootedDefense(sheet);
    sheetEl.querySelectorAll('[data-def-species]').forEach(input => { input.value = getSpeciesDefenseBonus(sheet, input.dataset.defSpecies); });
    refreshDamageThreshold(id, sheet);
}

// ===== Fichas =====

function removeSheet(id) {
    const sheet = findSheet(id);
    if (!sheet) return;

    const userInfo = window.PLAYER_INFO?.[window._currentUser?.email];
    if (!window._isMaster && userInfo && sheet.owner !== userInfo.id) {
        setSyncStatus('⚠ Você só pode apagar suas próprias fichas.', 3000);
        return;
    }

    // Usa modal de confirmação (confirm() não funciona em iframe)
    showConfirmModal(
        `Apagar a ficha "<strong>${escapeHtml(sheet.name || 'Sem Nome')}</strong>"? Esta ação não pode ser desfeita.`,
        async () => {
            const hadPendingSave = typeof pendingSaves !== 'undefined' && pendingSaves.has(sheet.id);
            if (typeof pendingSaves !== 'undefined') pendingSaves.delete(sheet.id);
            if (sheet.owner && sheet.firebaseId && window._fbDeleteDoc) {
                try {
                    await window._fbDeleteDoc('sheets_' + sheet.owner, sheet.firebaseId);
                } catch (error) {
                    console.error('Erro ao apagar ficha:', error);
                    if (hadPendingSave) scheduleSave(sheet.id);
                    setSyncStatus('Não foi possível apagar a ficha. Verifique a conexão.', 5000);
                    return;
                }
            }
            if (typeof pendingSaves !== 'undefined') pendingSaves.delete(sheet.id);
            sheets = sheets.filter(s => s.id !== sheet.id);
            if (activeSheetId === sheet.id)
                activeSheetId = sheets.length > 0 ? sheets[0].id : null;
            renderSheets();
        }
    );
}

// message é HTML: escape qualquer texto vindo da ficha antes de passar
function showConfirmModal(message, onConfirm, confirmLabel = 'Apagar') {
    let modal = document.getElementById('confirmModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'confirmModal';
        modal.className = 'confirm-overlay';
        modal.innerHTML = `
            <div class="confirm-box" role="dialog" aria-modal="true" aria-label="Confirmar ação">
                <p id="confirmMsg"></p>
                <div class="confirm-actions">
                    <button id="confirmNo" class="btn">Cancelar</button>
                    <button id="confirmYes" class="btn btn-danger-solid"></button>
                </div>
            </div>`;
        document.body.appendChild(modal);
    }
    document.getElementById('confirmMsg').innerHTML = message;
    document.getElementById('confirmYes').textContent = confirmLabel;
    modal.style.display = 'flex';
    const previousFocus = document.activeElement;
    document.body.classList.add('modal-open');
    const close = () => {
        modal.style.display = 'none';
        if (!document.querySelector('.modal.active')) document.body.classList.remove('modal-open');
        if (previousFocus?.isConnected) previousFocus.focus();
    };
    document.getElementById('confirmYes').onclick = () => { close(); onConfirm(); };
    document.getElementById('confirmNo').onclick = close;
    modal.onclick = (e) => { if (e.target === modal) close(); };
    modal.onkeydown = event => {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); }
        if (event.key === 'Tab') {
            const first = document.getElementById('confirmNo'), last = document.getElementById('confirmYes');
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
    };
    document.getElementById('confirmNo').focus();
}

function switchSheet(id) {
    activeSheetId = id;

    document.querySelectorAll('#tabsHeader .tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn._sheetId === id);
    });

    document.querySelectorAll('.sheet-content').forEach(div => {
        div.classList.toggle('active', div.id === 'sheet-' + id);
    });

    const sheet = findSheet(id);
    if (sheet) switchSheetTab(id, sheet.activeTab || 'ficha');
}

// Inicializar — os dados chegam depois pelo Firebase via onSnapshot
renderSheets();
