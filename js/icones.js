// Imagens de classes e armas (pasta img/)

// Chave = nome em inglês usado em CLASS_DATA
const CLASS_ICON_FILES = {
    'Jedi': 'jedi.gif',
    'Noble': 'noble.gif',
    'Scoundrel': 'scoundrel.gif',
    'Scout': 'scout.gif',
    'Soldier': 'soldier.gif',
    'Sith': 'sith-apprentice.gif',
    'Ace Pilot': 'ace-pilot.jpg',
    'Bounty Hunter': 'bounty-hunter.gif',
    'Crime Lord': 'crime-lord.gif',
    'Elite Trooper': 'elite-trooper.gif',
    'Force Adept': 'force-adept.gif',
    'Force Disciple': 'force-disciple.gif',
    'Gunslinger': 'gunslinger.jpg',
    'Jedi Knight': 'jedi-knight.gif',
    'Jedi Master': 'jedi-master.gif',
    'Officer': 'officer.gif',
    'Sith Apprentice': 'sith-apprentice.gif',
    'Sith Lord': 'sith-lord.jpg',
    'Imperial Knight': 'imperial-knight.gif',
    'Gladiator': 'gladiator.gif',
    'Independent Droid': 'droid-independent.gif',
    'Master Privateer': 'master-privateer.gif'
};


// A primeira regra que casar com o nome da arma define o ícone (rifle antes de blaster)
const WEAPON_ICON_RULES = [
    { pattern: /sabre|lightsaber/i, file: 'lightsabers.jpg' },
    { pattern: /rifle|carabina|fuzil|repetidor|canhão|besta|lança-mísseis/i, file: 'rifles.jpg' },
    { pattern: /pistola|pistol|blaster|revólver/i, file: 'pistols.jpg' },
    { pattern: /vibro|espada|lâmina|lança|machado|bastão|cajado|chicote|eletro|clava|martelo/i, file: 'advanced-melee-weapons.jpg' }
];

// Aceita o nome em português (o que fica salvo na ficha) ou a chave em inglês
function findClassEntry(className) {
    return Object.entries(CLASS_DATA).find(([key, data]) => data.nome === className || key === className);
}

function getClassIconUrl(className) {
    const entry = findClassEntry(className);
    const file = entry && CLASS_ICON_FILES[entry[0]];
    return file ? `img/classes/${file}` : '';
}

function getInitials(text) {
    const words = String(text || '').trim().split(/\s+/).filter(word => word.length > 2);
    return words.slice(0, 2).map(word => word[0].toUpperCase()).join('') || '?';
}

function renderClassIcon(className, extraClass = '') {
    const url = getClassIconUrl(className);
    return url
        ? `<img class="class-icon ${extraClass}" src="${url}" alt="" draggable="false">`
        : `<span class="class-icon ${extraClass}" aria-hidden="true">${escapeHtml(getInitials(className))}</span>`;
}

// Imagem "Skill Training" da perícia. Se o arquivo não existir, o <img> é removido
// e o span vazio mostra a sigla do atributo (ver .skill-icon:empty no CSS).
function renderSkillIcon(skill) {
    const img = skill.icon
        ? `<img src="img/pericias/skill-training-${skill.icon}.jpg" alt="" draggable="false" onerror="this.remove()">`
        : '';
    return `<span class="skill-icon" data-attr="${skill.attr}" aria-hidden="true">${img}</span>`;
}

// Imagem das defesas e do Limiar de Dano (img/defesas/<nome>.png); sem o arquivo, fica só a moldura
function renderDefenseIcon(name) {
    return `<span class="defense-icon" aria-hidden="true"><img src="img/defesas/${name}.png" alt="" draggable="false" onerror="this.remove()"></span>`;
}

function getWeaponIconFile(weaponName, weaponType = '') {
    if (Object.hasOwn(WEAPON_TYPES, weaponType)) return WEAPON_TYPES[weaponType].file;
    return WEAPON_ICON_RULES.find(rule => rule.pattern.test(weaponName || ''))?.file || 'simple-weapons.jpg';
}

function renderWeaponIcon(weaponName, weaponType = '') {
    if (!String(weaponName || '').trim() && !Object.hasOwn(WEAPON_TYPES, weaponType)) {
        return '<span class="item-icon" data-weapon-icon aria-hidden="true"></span>';
    }
    const file = getWeaponIconFile(weaponName, weaponType);
    return `<img class="item-icon" data-weapon-icon src="img/armas/${file}" alt="" draggable="false">`;
}

// ===== Imagens da Biblioteca =====
// Cada categoria da Biblioteca tem sua pasta em img/ (abaixo), listadas em
// js/dados/imagens-biblioteca.js (gerado por dev/ferramentas/atualizar-imagens-biblioteca.html).
// A imagem é achada pelo nome em inglês entre parênteses: "Esquiva (Dodge)" -> dodge.jpg

// Categoria da Biblioteca -> pasta em img/
const LIBRARY_IMAGE_FOLDERS = {
    talents: 'talentos',
    aptitudes: 'aptidoes',
    forcePowers: 'poderes',
    forceTechniques: 'tecnicas',
    forceSecrets: 'segredos',
};

// Itens com nome só em português, ou cuja imagem tem outro nome -> imagem (sem extensão)
const LIBRARY_IMAGE_ALIASES = {
    'Sensibilidade à Força': 'force-sensitivity',
    'Linguista': 'linguist',
    'Tiro à Queima-Roupa': 'point-blank-shot',
    'Proficiência com Armaduras (Leve, Média)': 'armor-proficiency-light',
    'Bloquear': 'block',
    'Defletir': 'deflect',
    'Defesa com Sabre de Luz': 'lightsaber-defense',
    'Especialização em Arma (sabres de luz)': 'weapon-specialization',
    'Fúria Sombria': 'dark-rage',
    'Presença Sombria': 'dark-presence',
    'Poder do Lado Sombrio': 'power-of-the-dark-side',
    'Poder Rápido': 'swift-power',
    'Vingança': 'revenge',
    'Artes Marciais I, II e III (Martial Arts I, II and III)': 'martial-arts-i',
    'Proficiência com Armadura (Armor Proficiency)': 'armor-proficiency-light',
};

function toImageSlug(text) {
    return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
        .replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Apelidos comparados sem acentos, maiúsculas ou pontuação
const libraryImageAliases = Object.fromEntries(
    Object.entries(LIBRARY_IMAGE_ALIASES).map(([name, image]) => [toImageSlug(name), image])
);

// Sem categoria (ou categoria sem pasta), procura em todas as pastas
function getLibraryImageUrl(itemName, categoryKey) {
    const allFiles = window.LIBRARY_IMAGE_FILES || {};
    const folders = LIBRARY_IMAGE_FOLDERS[categoryKey] ? [LIBRARY_IMAGE_FOLDERS[categoryKey]] : Object.values(LIBRARY_IMAGE_FOLDERS);
    const english = String(itemName || '').match(/\(([^()]*)\)\s*$/)?.[1];
    const candidates = [libraryImageAliases[toImageSlug(itemName)], english && toImageSlug(english), toImageSlug(itemName)];
    for (const folder of folders) {
        const files = allFiles[folder] || {};
        const image = candidates.find(candidate => candidate && files[candidate]);
        if (image) return `img/${folder}/${files[image]}`;
    }
    return '';
}

function renderLibraryIcon(itemName, categoryKey, extraClass = '') {
    const url = getLibraryImageUrl(itemName, categoryKey);
    return url
        ? `<img class="library-icon ${extraClass}" src="${url}" alt="" loading="lazy" draggable="false">`
        : `<span class="library-icon empty ${extraClass}" aria-hidden="true"></span>`;
}

function renderInitialTalentIcon(talentName) {
    const weaponImages = {
        'Proficiência com Sabres de Luz': 'lightsabers.jpg',
        'Proficiência com Armas Simples': 'simple-weapons.jpg',
        'Proficiência com Pistolas': 'pistols.jpg',
        'Proficiência com Rifles': 'rifles.jpg',
    };
    const file = weaponImages[talentName];
    return file
        ? `<img class="library-icon" src="img/armas/${file}" alt="" loading="lazy" draggable="false">`
        : renderLibraryIcon(talentName, 'talents');
}
