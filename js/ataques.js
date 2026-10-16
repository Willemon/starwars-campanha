// Cada ataque tem sua configuração e referencia uma arma por id.
let attackEditorState = null;
let attackEditorTrigger = null;

function renderAttackRows(sheet) {
    const attacks = sheet.attacks || [];
    if (!attacks.length) return '<div class="list-empty">Use “+ Ataque” para criar uma configuração vinculada a uma arma do inventário.</div>';
    return attacks.map(item => {
        const weapon = getAttackWeapon(sheet, item);
        const stats = getAttackStats(sheet, item);
        const status = !weapon ? 'Arma não encontrada — vincule outra arma'
            : getInventorySection(weapon) === 'stash' ? 'Arma guardada (Stash)'
            : inventoryNumber(weapon.quantity) <= 0 ? 'Arma sem unidades no inventário' : !weapon.equipped ? 'Arma não equipada' : '';
        const breakdown = `BBA ${formatBonus(stats.bab)} · ${item.attackAttribute === 'none' ? 'Atributo' : item.attackAttribute} ${formatBonus(stats.attackAttribute)} · Proficiência ${formatBonus(stats.proficiency)} · Condição ${formatBonus(stats.condition)} · Outros ${formatBonus(inventoryNumber(item.attackBonus))}`;
        return `<article class="attack-entry" data-attack-id="${escapeHtml(item.id)}">
            <div class="attack-main">
                <div class="attack-weapon">${renderWeaponIcon(weapon?.name, weapon?.weaponType)}<div>
                    <span class="attack-label">Ataque</span>
                    <button type="button" class="inventory-name" data-attack-id="${escapeHtml(item.id)}" onclick="openAttackEditor(${sheet.id}, this.dataset.attackId)">${escapeHtml(item.name)}</button>
                    <span class="attack-weapon-source">Arma: ${escapeHtml(weapon?.name || 'não encontrada')}</span>
                    ${status ? `<span class="attack-weapon-status">${escapeHtml(status)}</span>` : ''}
                    ${item.needsReview ? '<small class="inventory-review">Importado · conferir configuração</small>' : ''}
                </div></div>
                <div class="attack-stat" title="${escapeHtml(breakdown)}"><span class="attack-label">Bônus de ataque</span><strong class="${stats.attack < 0 ? 'negative' : ''}">${stats.available ? formatBonus(stats.attack) : 'Incapaz'}</strong></div>
                <div class="attack-stat" title="Dano base + metade do nível heroico + atributo + outros"><span class="attack-label">Dano</span><strong>${escapeHtml(stats.damage)}</strong></div>
            </div>
            <dl class="attack-details">
                <div><dt>Crítico</dt><dd>${escapeHtml(item.critical || '—')}</dd></div>
                <div><dt>Tipo</dt><dd>${escapeHtml(item.damageType || '—')}</dd></div>
                <div><dt>Alcance</dt><dd>${escapeHtml(item.range || ({ melee: 'Corpo a corpo', ranged: 'À distância', thrown: 'Arremesso' }[item.mode]) || '—')}</dd></div>
                ${item.ammo ? `<div><dt>Munição</dt><dd>${escapeHtml(item.ammo)}</dd></div>` : ''}
            </dl>
            <p class="attack-calculation">${escapeHtml(breakdown)}</p>
            ${item.notes ? `<p class="attack-notes"><strong>Notas:</strong> ${escapeHtml(item.notes)}</p>` : ''}
            <button type="button" class="btn btn-small btn-danger" aria-label="Remover ataque ${escapeHtml(item.name)}" data-attack-id="${escapeHtml(item.id)}" onclick="removeAttack(${sheet.id}, this.dataset.attackId)">Remover ataque</button>
        </article>`;
    }).join('');
}

function renderAttacksCard(sheet) {
    const hasWeapons = (sheet.inventory || []).some(item => item.category === 'weapon');
    return `<section class="card">
        <div class="card-header"><h3 class="card-title">Ataques</h3><span class="card-count" id="attack-count-${sheet.id}">${(sheet.attacks || []).length}</span>
            <span class="card-hint">Configurações de ataque · BBA ${formatBonus(getBaseAttackBonus(sheet))}</span>
            <button class="btn-add" ${hasWeapons ? '' : 'disabled title="Cadastre uma arma em Equipamentos"'} onclick="openAttackEditor(${sheet.id})">+ Ataque</button>
        </div>
        ${!hasWeapons ? '<p class="field-hint">Cadastre uma arma em Equipamentos para vincular seus ataques.</p>' : ''}
        <div id="attacks-${sheet.id}" class="attack-list">${renderAttackRows(sheet)}</div>
    </section>`;
}

function refreshAttacks(sheetId, sheet = findSheet(sheetId)) {
    if (!sheet) return;
    const list = document.getElementById(`attacks-${sheetId}`);
    if (list) list.innerHTML = renderAttackRows(sheet);
    const count = document.getElementById(`attack-count-${sheetId}`);
    if (count) count.textContent = (sheet.attacks || []).length;
}

function removeAttack(sheetId, attackId) {
    const sheet = findSheet(sheetId);
    const attack = sheet?.attacks?.find(entry => entry.id === attackId);
    if (!attack) return;
    showConfirmModal(`Remover o ataque <strong>${escapeHtml(attack.name)}</strong>? A arma continuará no inventário.`, () => {
        sheet.attacks = sheet.attacks.filter(entry => entry.id !== attackId);
        if (attackEditorState?.sheetId === sheet.id && attackEditorState.attackId === attackId) closeModal('attackModal');
        renderSheets();
        document.querySelector(`#sheet-${sheet.id} [onclick="openAttackEditor(${sheet.id})"]`)?.focus();
        scheduleSave(sheet.id);
    }, 'Remover');
}

function openAttackEditor(sheetId, attackId = null) {
    const sheet = findSheet(sheetId);
    if (!sheet) return;
    const existing = attackId === null ? null : sheet.attacks?.find(attack => attack.id === attackId);
    if (attackId !== null && !existing) return;
    const weapons = (sheet.inventory || []).filter(item => item.category === 'weapon');
    if (!existing && !weapons.length) return;
    const attack = existing || createAttack(weapons[0]);
    const weapon = getAttackWeapon(sheet, attack);
    attackEditorState = { sheetId: sheet.id, attackId };
    attackEditorTrigger = document.activeElement;
    const attributeOptions = selected => ['none', ...ATTRIBUTES].map(attr => `<option value="${attr}" ${selected === attr ? 'selected' : ''}>${attr === 'none' ? 'Nenhum' : ATTRIBUTE_NAMES[attr]}</option>`).join('');
    document.getElementById('attackModalTitle').textContent = existing ? 'Editar ataque' : 'Criar ataque';
    document.getElementById('attackModalBody').innerHTML = `
        <form id="attackForm" onsubmit="saveAttack(event)">
            <div class="inventory-form-grid">
                <label class="field inventory-wide">Nome do ataque<input name="name" maxlength="160" required value="${escapeHtml(attack.name)}" placeholder="Ex.: Ataque normal, ataque poderoso"></label>
                <label class="field">Arma vinculada<select name="weaponId" required onchange="changeAttackWeapon()">${!weapon ? '<option value="">Escolha uma arma</option>' : ''}${weapons.map(item => `<option value="${escapeHtml(item.id)}" ${item.id === attack.weaponId ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}</select></label>
                <div id="attackWeaponPreview" class="inventory-weapon-preview">${renderWeaponIcon(weapon?.name, weapon?.weaponType)}<span>${escapeHtml(weapon?.name || 'Escolha uma arma')}</span></div>
                <label class="field">Uso<select name="mode" onchange="setAttackMode(this.value)">${[['melee', 'Corpo a corpo'], ['ranged', 'À distância'], ['thrown', 'Arremesso']].map(([key, label]) => `<option value="${key}" ${attack.mode === key ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
                <label class="field">Dano base (sem bônus)<input name="damage" maxlength="80" value="${escapeHtml(attack.damage)}" placeholder="Ex.: 2d8"></label>
                <label class="field">Crítico<input name="critical" maxlength="60" value="${escapeHtml(attack.critical)}"></label>
                <label class="field">Tipo de dano<input name="damageType" maxlength="80" value="${escapeHtml(attack.damageType)}"></label>
                <label class="field">Alcance<input name="range" maxlength="100" value="${escapeHtml(attack.range)}"></label>
                <label class="field">Munição<input name="ammo" maxlength="80" value="${escapeHtml(attack.ammo)}"></label>
                <label class="field">Atributo do ataque<select name="attackAttribute">${attributeOptions(attack.attackAttribute)}</select></label>
                <label class="field">Outros ajustes ao ataque<input name="attackBonus" type="number" step="1" required value="${inventoryNumber(attack.attackBonus)}"></label>
                <label class="field">Atributo do dano<select name="damageAttribute">${attributeOptions(attack.damageAttribute)}</select></label>
                <label class="field">Outros ajustes ao dano<input name="damageBonus" type="number" step="1" required value="${inventoryNumber(attack.damageBonus)}"></label>
                <label class="field">Mãos<select name="hands"><option value="1" ${attack.hands !== 2 ? 'selected' : ''}>Uma mão</option><option value="2" ${attack.hands === 2 ? 'selected' : ''}>Duas mãos</option></select></label>
                <div class="inventory-form-checks">
                    <label><input name="light" type="checkbox" ${attack.light ? 'checked' : ''}> Arma leve</label>
                    <label><input name="proficient" type="checkbox" ${attack.proficient !== false ? 'checked' : ''}> Sou proficiente (sem isso: −5 no ataque)</label>
                    <label><input name="halfLevelDamage" type="checkbox" ${attack.halfLevelDamage !== false ? 'checked' : ''}> Somar metade do nível heroico ao dano</label>
                </div>
            </div>
            <button type="button" class="btn btn-small" onclick="loadAttackWeaponDefaults()">Usar dados padrão da arma</button>
            <p class="field-hint">Você pode criar vários ataques para a mesma arma, com configurações diferentes. O ataque soma BBA, atributo, condição e ajustes. Vigor positivo dobra no dano com duas mãos em arma corpo a corpo que não seja leve.</p>
            <label class="field">Notas do ataque<textarea name="notes" rows="3" maxlength="8000">${escapeHtml(attack.notes)}</textarea></label>
            <p id="attackFormError" class="inventory-form-error" role="alert"></p>
            <div class="inventory-form-actions">${existing ? `<button type="button" class="btn btn-danger" data-attack-id="${escapeHtml(attack.id)}" onclick="removeAttack(${sheet.id}, this.dataset.attackId)">Remover ataque</button>` : ''}<button type="button" class="btn" onclick="closeModal('attackModal')">Cancelar</button><button type="submit" class="btn btn-primary">Salvar ataque</button></div>
        </form>`;
    openEquipmentEditorModal('attackModal', 'attackForm');
}

function changeAttackWeapon() {
    const sheet = findSheet(attackEditorState?.sheetId);
    const form = document.getElementById('attackForm');
    const weapon = sheet && getAttackWeapon(sheet, { weaponId: form.elements.weaponId.value });
    document.getElementById('attackWeaponPreview').innerHTML = `${renderWeaponIcon(weapon?.name, weapon?.weaponType)}<span>${escapeHtml(weapon?.name || 'Escolha uma arma')}</span>`;
    if (attackEditorState?.attackId === null) loadAttackWeaponDefaults();
}

function loadAttackWeaponDefaults() {
    const sheet = findSheet(attackEditorState?.sheetId);
    const form = document.getElementById('attackForm');
    const weapon = sheet && getAttackWeapon(sheet, { weaponId: form.elements.weaponId.value });
    if (!weapon) return;
    for (const [key, fallback] of Object.entries(DEFAULT_ATTACK_CONFIGURATION)) {
        const field = form.elements.namedItem(key);
        if (field.type === 'checkbox') field.checked = weapon[key] ?? fallback;
        else field.value = weapon[key] ?? fallback;
    }
}

function setAttackMode(mode) {
    const fields = document.getElementById('attackForm').elements;
    fields.attackAttribute.value = mode === 'melee' ? 'FOR' : 'DES';
    fields.damageAttribute.value = mode === 'ranged' ? 'none' : 'FOR';
}

function finishAttackEditor() {
    attackEditorState = null;
    if (attackEditorTrigger?.isConnected) attackEditorTrigger.focus();
    attackEditorTrigger = null;
}

function saveAttack(event) {
    event.preventDefault();
    const sheet = findSheet(attackEditorState?.sheetId);
    if (!sheet) return;
    const form = document.getElementById('attackForm');
    if (!form.reportValidity()) return;
    const value = field => form.elements.namedItem(field).value.trim();
    const attack = { name: value('name'), weaponId: value('weaponId'), notes: value('notes') };
    for (const [key, fallback] of Object.entries(DEFAULT_ATTACK_CONFIGURATION)) {
        const field = form.elements.namedItem(key);
        attack[key] = typeof fallback === 'boolean' ? field.checked : typeof fallback === 'number' ? Number(field.value) : value(key);
    }
    if (!isValidAttack(sheet, attack)) {
        document.getElementById('attackFormError').textContent = 'Confira o nome, a arma vinculada e os ajustes do ataque.';
        return;
    }
    const existing = attackEditorState.attackId === null ? null : sheet.attacks?.find(item => item.id === attackEditorState.attackId);
    if (attackEditorState.attackId !== null && !existing) {
        document.getElementById('attackFormError').textContent = 'Este ataque não está mais na ficha. Feche a janela e abra a lista novamente.';
        return;
    }
    const savedId = existing?.id || crypto.randomUUID();
    if (existing) Object.assign(existing, attack, { needsReview: false });
    else (sheet.attacks ||= []).push({ ...attack, id: savedId });
    closeModal('attackModal');
    renderSheets();
    [...document.querySelectorAll(`#sheet-${sheet.id} button[data-attack-id]`)].find(button => button.dataset.attackId === savedId)?.focus();
    scheduleSave(sheet.id);
}
