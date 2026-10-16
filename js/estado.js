// Estado compartilhado entre os scripts: fichas carregadas, ficha ativa e salvamento no Firebase

let sheets = [];
let activeSheetId = null;

Object.defineProperty(window, '_sheets', {
    get() { return sheets; },
    set(value) { sheets = value; }
});

Object.defineProperty(window, '_activeSheetId', {
    get() { return activeSheetId; },
    set(value) { activeSheetId = value; }
});

// Escapa texto vindo das fichas antes de colocá-lo em HTML (conteúdo ou atributo)
function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
}

let syncStatusTimer = null;

function setSyncStatus(text, clearAfterMs) {
    const statusEl = document.getElementById('syncStatus');
    if (!statusEl) return;
    clearTimeout(syncStatusTimer);
    statusEl.textContent = text;
    if (clearAfterMs) {
        syncStatusTimer = setTimeout(() => { statusEl.textContent = ''; }, clearAfterMs);
    }
}

let creatingSheet = false;
window._sheetCreationLock = false;

async function addNewSheet() {

    if (creatingSheet || window._sheetCreationLock) {
        return;
    }

    creatingSheet = true;
    window._sheetCreationLock = true;

    document.querySelectorAll('.add-tab-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
    });

    try {

        const userEmail = window._currentUser.email;
        const userInfo = window.PLAYER_INFO[userEmail];

        if (!userInfo) return;

        const newSheet = createEmptySheet();

        newSheet.owner = userInfo.id;
        newSheet.firebaseId = crypto.randomUUID();

        await window._fbSetDoc(
            `sheets_${userInfo.id}`,
            newSheet.firebaseId,
            newSheet
        );

        activeSheetId = newSheet.id;

    } finally {

        setTimeout(() => {
            creatingSheet = false;
            window._sheetCreationLock = false;

            document.querySelectorAll('.add-tab-btn').forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            });

        }, 2000);
    }
}
