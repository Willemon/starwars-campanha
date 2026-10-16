// Fila de gravacao das fichas; transporte fornecido pelo adaptador Firebase.

// Quantas gravações nossas ainda vão voltar pelo onSnapshot, por firebaseId.
// Essas atualizações são ignoradas para não re-renderizar a ficha enquanto o jogador digita.
window._pendingOwnWrites = new Map();

const pendingSaves = new Set();
let saveTimeout;

// Marca a ficha para salvar; várias edições seguidas viram uma única gravação
function scheduleSave(sheetId) {
    pendingSaves.add(sheetId ?? activeSheetId);
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(flushSaves, 500);
}

function flushSaves() {
    clearTimeout(saveTimeout);

    if (!window._currentUser || !window._fbSetDoc) {
        return;
    }

    const toSave = [...pendingSaves]
        .map(id => sheets.find(s => s.id === id))
        .filter(sheet => sheet && sheet.owner && sheet.firebaseId);
    pendingSaves.clear();

    if (toSave.length === 0) {
        return;
    }

    setSyncStatus('💾 Salvando...');

    const writes = toSave.map(sheet => {
        const pending = window._pendingOwnWrites;
        pending.set(sheet.firebaseId, (pending.get(sheet.firebaseId) || 0) + 1);
        return window._fbSetDoc(`sheets_${sheet.owner}`, sheet.firebaseId, sheet);
    });

    Promise.all(writes)
        .then(() => setSyncStatus('✓ Salvo', 2000))
        .catch(e => {
            console.error('Erro ao salvar ficha:', e);
            setSyncStatus('⚠ Erro ao salvar. Verifique a conexão.');
        });
}

// Grava o que estiver pendente antes de a aba ser fechada ou trocada
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushSaves();
});
