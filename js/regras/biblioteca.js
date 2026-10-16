// Nomes e aliases compartilhados pela Biblioteca e regras de escolhas.

const CHOICE_LIBRARY_CATEGORIES = { talento: 'talents', aptidao: 'aptitudes', poder: 'forcePowers', tecnica: 'forceTechniques', segredo: 'forceSecrets' };

function normalizeSearch(text) {
    return String(text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

function resolveLibraryItemName(itemName, categoryKey) {
    const typed = normalizeSearch(itemName).trim();
    const alias = Object.entries(LIBRARY_ITEM_RENAMES[categoryKey] || {}).find(([oldName]) =>
        typed === normalizeSearch(oldName) || typed === normalizeSearch(choiceShortName(oldName)));
    return alias ? alias[1] : itemName;
}

function shortTreeName(name) {
    return name.replace(/^Árvore de [^:]+:\s*/, '');
}
