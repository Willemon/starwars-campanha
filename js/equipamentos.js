// Inventário manual; as configurações de ataque ficam em js/ataques.js.
let inventoryEditorState = null;
let inventoryEditorTrigger = null;

function renderInventoryCard(sheet) {
    const active = typeof sheet.inventorySection === 'string' && Object.hasOwn(INVENTORY_SECTIONS, sheet.inventorySection) ? sheet.inventorySection : 'personal';
    return `<div class="equipment-sections">
        <nav class="equipment-navigation" aria-label="Seções de equipamentos">${Object.entries(INVENTORY_SECTIONS).map(([key, section]) => `<button type="button" class="equipment-section-btn ${key === active ? 'active' : ''}" aria-pressed="${key === active}" data-equipment-section="${key}" onclick="switchInventorySection(${sheet.id}, '${key}')">${section.label}<span class="card-count">${(sheet.inventory || []).filter(item => getInventorySection(item) === key).length}</span></button>`).join('')}</nav>
        ${Object.entries(INVENTORY_SECTIONS).map(([key, section]) => {
            const items = (sheet.inventory || []).filter(item => getInventorySection(item) === key);
            const { weight, cost } = getInventoryTotals(sheet, key);
            return `<section class="card equipment-panel" data-inventory-card data-inventory-section="${key}" ${key === active ? '' : 'hidden'}>
                <div class="card-header"><h3 class="card-title">${section.title}</h3><span class="card-count">${items.length}</span><button class="btn-add" onclick="openInventoryEditor(${sheet.id}, null, 'equipment', '${key}')">+ ${section.add}</button></div>
                <p class="equipment-section-hint">${section.hint}</p>
                <div class="inventory-summary"><span>Peso nesta seção <strong data-inventory-total="weight">${weight.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} kg</strong></span><span>Valor nesta seção <strong data-inventory-total="cost">${cost.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} créditos</strong></span></div>
                ${key === 'cybernetics' ? renderCybernetics(sheet, items) : renderInventoryRows(sheet, items)}
            </section>`;
        }).join('')}
    </div>`;
}

function switchInventorySection(sheetId, section) {
    const sheet = findSheet(sheetId);
    if (!sheet || typeof section !== 'string' || !Object.hasOwn(INVENTORY_SECTIONS, section)) return;
    sheet.inventorySection = section;
    const root = document.getElementById(`sheet-${sheet.id}`);
    if (!root) return;
    root.querySelectorAll('[data-inventory-section]').forEach(panel => { panel.hidden = panel.dataset.inventorySection !== section; });
    root.querySelectorAll('[data-equipment-section]').forEach(button => {
        const active = button.dataset.equipmentSection === section;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
    });
}

function renderCybernetics(sheet, items) {
    const installed = items.filter(item => item.equipped && inventoryNumber(item.quantity) > 0).length;
    return `<div class="cybernetics-panel">
        <p class="cybernetics-status">Instalados: <strong id="installed-implants-${sheet.id}">${installed}</strong><span>· Cadastrados: ${items.length}</span></p>
        <div class="table-scroll"><table class="cybernetics-table" aria-label="Implantes cibernéticos">
            <thead><tr><th scope="col">Implante</th><th scope="col">Região do corpo</th><th scope="col">Qtd.</th><th scope="col">Instalação</th><th scope="col">Ações</th></tr></thead>
            <tbody>${items.length ? items.map(item => `<tr>
                <td><button type="button" class="inventory-name" data-item-id="${escapeHtml(item.id)}" onclick="openInventoryEditor(${sheet.id}, this.dataset.itemId)">${escapeHtml(item.name)}</button></td>
                <td>${escapeHtml(CYBERNETIC_REGIONS[typeof item.cyberneticRegion === 'string' && Object.hasOwn(CYBERNETIC_REGIONS, item.cyberneticRegion) ? item.cyberneticRegion : 'torso'])}</td>
                <td><input class="cybernetics-quantity" type="number" min="0" step="1" aria-label="Quantidade de ${escapeHtml(item.name)}" value="${inventoryNumber(item.quantity)}" data-item-id="${escapeHtml(item.id)}" onchange="setInventoryQuantity(${sheet.id}, this.dataset.itemId, this)"></td>
                <td><label class="inventory-equipped"><input type="checkbox" ${item.equipped ? 'checked' : ''} aria-label="${escapeHtml(item.name)} instalado" data-item-id="${escapeHtml(item.id)}" onchange="setInventoryEquipped(${sheet.id}, this.dataset.itemId, this.checked)"> Instalado</label></td>
                <td><div class="inventory-row-actions"><button type="button" class="btn btn-small" aria-label="Guardar ${escapeHtml(item.name)} no Stash" data-item-id="${escapeHtml(item.id)}" onclick="moveInventoryItem(${sheet.id}, this.dataset.itemId, 'stash')">Guardar no Stash</button><button type="button" class="icon-btn btn-remove" aria-label="Remover ${escapeHtml(item.name)}" data-item-id="${escapeHtml(item.id)}" onclick="removeInventoryItem(${sheet.id}, this.dataset.itemId)">×</button></div></td>
            </tr>`).join('') : '<tr><td colspan="5">Nenhum implante cadastrado.</td></tr>'}</tbody>
        </table></div>
    </div>`;
}

function refreshCyberneticStatus(sheet) {
    const count = document.getElementById(`installed-implants-${sheet.id}`);
    if (count) count.textContent = (sheet.inventory || []).filter(item => getInventorySection(item) === 'cybernetics' && item.equipped && inventoryNumber(item.quantity) > 0).length;
}

function moveInventoryItem(sheetId, itemId, section) {
    const sheet = findSheet(sheetId);
    const item = sheet?.inventory?.find(entry => entry.id === itemId);
    if (!item || typeof section !== 'string' || !Object.hasOwn(INVENTORY_SECTIONS, section) || getInventorySection(item) === section) return;
    setInventoryItemSection(item, section);
    sheet.inventorySection = section;
    renderSheets();
    [...document.querySelectorAll(`#sheet-${sheet.id} button[data-item-id]`)].find(button => button.dataset.itemId === itemId)?.focus();
    scheduleSave(sheet.id);
}

function renderInventoryRows(sheet, items) {
    return `<div class="inventory-list">${items.length ? items.map(item => `<div class="inventory-row">
            <div class="inventory-item-name">${item.category === 'weapon' ? renderWeaponIcon(item.name, item.weaponType) : ''}<div>
                <button type="button" class="inventory-name" data-item-id="${escapeHtml(item.id)}" onclick="openInventoryEditor(${sheet.id}, this.dataset.itemId)">${escapeHtml(item.name)}</button>
                <small>${escapeHtml(item.category === 'weapon' && Object.hasOwn(WEAPON_TYPES, item.weaponType) ? WEAPON_TYPES[item.weaponType].label : item.category === 'equipment' && ['vehicles', 'artifacts'].includes(getInventorySection(item)) ? INVENTORY_SECTIONS[getInventorySection(item)].add : INVENTORY_CATEGORIES[item.category] || 'Equipamento')}${item.needsReview ? ' · conferir configuração' : ''}</small>
            </div></div>
            <label class="inventory-quantity">Qtd.<input type="number" min="0" step="1" aria-label="Quantidade de ${escapeHtml(item.name)}" value="${inventoryNumber(item.quantity)}" data-item-id="${escapeHtml(item.id)}" onchange="setInventoryQuantity(${sheet.id}, this.dataset.itemId, this)"></label>
            <span class="inventory-unit-weight">${Math.max(0, inventoryNumber(item.weight)).toLocaleString('pt-BR')} kg/un.</span>
            ${getInventorySection(item) === 'stash' ? '<span class="inventory-storage-label">Guardado</span>' : `<label class="inventory-equipped"><input type="checkbox" ${item.equipped ? 'checked' : ''} data-item-id="${escapeHtml(item.id)}" onchange="setInventoryEquipped(${sheet.id}, this.dataset.itemId, this.checked)"> ${item.category === 'weapon' || item.category === 'armor' ? 'Equipada' : 'Em uso'}</label>`}
            <div class="inventory-row-actions ${getInventorySection(item) === 'stash' && item.stashOrigin === 'cybernetics' ? 'has-move' : ''}">
                ${getInventorySection(item) === 'stash' && item.stashOrigin === 'cybernetics' ? `<button type="button" class="btn btn-small" aria-label="Mover ${escapeHtml(item.name)} para Implantes" data-item-id="${escapeHtml(item.id)}" onclick="moveInventoryItem(${sheet.id}, this.dataset.itemId, 'cybernetics')">Mover para Implantes</button>` : ''}
                <button type="button" class="icon-btn btn-remove" title="Remover item" aria-label="Remover ${escapeHtml(item.name)}" data-item-id="${escapeHtml(item.id)}" onclick="removeInventoryItem(${sheet.id}, this.dataset.itemId)">×</button>
            </div>
        </div>`).join('') : '<div class="list-empty">Nenhum item nesta seção.</div>'}</div>`;
}

function setInventoryEquipped(sheetId, itemId, equipped) {
    const sheet = findSheet(sheetId);
    const item = sheet?.inventory?.find(entry => entry.id === itemId);
    if (!item) return;
    item.equipped = !!equipped;
    refreshAttacks(sheet.id, sheet);
    refreshCyberneticStatus(sheet);
    scheduleSave(sheet.id);
}

function setInventoryQuantity(sheetId, itemId, input) {
    const sheet = findSheet(sheetId);
    const item = sheet?.inventory?.find(entry => entry.id === itemId);
    if (!item) return;
    const quantity = Number(input.value);
    if (input.value.trim() === '' || !Number.isSafeInteger(quantity) || quantity < 0) {
        input.value = item.quantity;
        return;
    }
    item.quantity = quantity;
    refreshAttacks(sheet.id, sheet);
    refreshCyberneticStatus(sheet);
    const section = getInventorySection(item);
    for (const [key, total] of Object.entries(getInventoryTotals(sheet, section))) {
        const element = document.querySelector(`#sheet-${sheet.id} [data-inventory-section="${section}"] [data-inventory-total="${key}"]`);
        if (element) element.textContent = `${total.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${key === 'weight' ? 'kg' : 'créditos'}`;
    }
    scheduleSave(sheet.id);
}

function removeInventoryItem(sheetId, itemId) {
    const sheet = findSheet(sheetId);
    const item = sheet?.inventory?.find(entry => entry.id === itemId);
    if (!item) return;
    const linked = (sheet.attacks || []).filter(attack => attack.weaponId === itemId).length;
    showConfirmModal(`Remover <strong>${escapeHtml(item.name)}</strong> do inventário?${linked ? ' Os ataques vinculados serão mantidos para você poder escolher outra arma.' : ''}`, () => {
        sheet.inventory = sheet.inventory.filter(entry => entry.id !== itemId);
        if (inventoryEditorState?.sheetId === sheet.id && inventoryEditorState.itemId === itemId) closeModal('inventoryModal');
        renderSheets();
        document.querySelector(`#sheet-${sheet.id} [data-inventory-section="${getInventorySection(item)}"] .btn-add`)?.focus();
        scheduleSave(sheet.id);
    }, 'Remover');
}

function openInventoryEditor(sheetId, itemId = null, category = 'equipment', section = 'personal', region = 'torso') {
    const sheet = findSheet(sheetId);
    if (!sheet) return;
    const existing = itemId === null ? null : sheet.inventory?.find(item => item.id === itemId);
    if (itemId !== null && !existing) return;
    if (typeof section !== 'string' || !Object.hasOwn(INVENTORY_SECTIONS, section) || typeof region !== 'string' || !Object.hasOwn(CYBERNETIC_REGIONS, region)) return;
    const item = existing || { ...createInventoryItem(category, section), cyberneticRegion: region };
    if (!existing && category === 'weapon') item.equipped = true;
    inventoryEditorTrigger = document.activeElement;
    inventoryEditorState = { sheetId: sheet.id, itemId };
    document.getElementById('inventoryModalTitle').textContent = `${existing ? 'Editar' : 'Criar'} ${INVENTORY_SECTIONS[getInventorySection(item)].add.toLocaleLowerCase('pt-BR')}`;
    document.getElementById('inventoryModalBody').innerHTML = `
        <form id="inventoryForm" onsubmit="saveInventoryItem(event)">
            <div class="inventory-form-grid">
                <label class="field inventory-wide">Nome<input name="name" maxlength="160" required value="${escapeHtml(item.name)}" placeholder="Ex.: Sabre de luz, blaster, kit médico" oninput="refreshInventoryWeaponIcon()"></label>
                <label class="field">Seção<select name="section" onchange="changeInventorySection()">${Object.entries(INVENTORY_SECTIONS).map(([key, entry]) => `<option value="${key}" ${getInventorySection(item) === key ? 'selected' : ''}>${entry.label}</option>`).join('')}</select></label>
                <label class="field">Categoria<select name="category" onchange="document.getElementById('inventoryWeaponFields').hidden = this.value !== 'weapon'">${Object.entries(INVENTORY_CATEGORIES).map(([key, label]) => `<option value="${key}" ${item.category === key ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
                <label class="field" id="inventoryCyberneticRegion" ${getInventorySection(item) === 'cybernetics' ? '' : 'hidden'}>Região do corpo<select name="cyberneticRegion">${Object.entries(CYBERNETIC_REGIONS).map(([key, label]) => `<option value="${key}" ${(item.cyberneticRegion || 'torso') === key ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
                <label class="field">Quantidade<input name="quantity" type="number" min="0" step="1" required value="${inventoryNumber(item.quantity)}"></label>
                <label class="field">Peso por unidade (kg)<input name="weight" type="number" min="0" step="any" required value="${inventoryNumber(item.weight)}"></label>
                <label class="field">Valor por unidade (créditos)<input name="cost" type="number" min="0" step="any" required value="${inventoryNumber(item.cost)}"></label>
            </div>
            <fieldset id="inventoryWeaponFields" ${item.category === 'weapon' ? '' : 'hidden'}>
                <legend>Dados da arma</legend>
                <div class="inventory-form-grid">
                    <label class="field">Tipo da arma<select name="weaponType" aria-label="Tipo da arma" aria-describedby="inventoryWeaponTypeHint" onchange="refreshInventoryWeaponIcon()"><option value="">Automático pelo nome</option>${Object.entries(WEAPON_TYPES).map(([key, type]) => `<option value="${key}" ${item.weaponType === key ? 'selected' : ''}>${type.label}</option>`).join('')}</select><small id="inventoryWeaponTypeHint" class="field-hint">O tipo define a imagem da arma.</small></label>
                    <div id="inventoryWeaponIconPreview" class="inventory-weapon-preview" aria-label="Prévia da imagem da arma">${renderWeaponIcon(item.name, item.weaponType)}<span>Imagem da arma</span></div>
                    <label class="field">Uso padrão<select name="mode">${[['melee', 'Corpo a corpo'], ['ranged', 'À distância'], ['thrown', 'Arremesso']].map(([key, label]) => `<option value="${key}" ${item.mode === key ? 'selected' : ''}>${label}</option>`).join('')}</select></label>
                    <label class="field">Dano base (sem bônus)<input name="damage" maxlength="80" value="${escapeHtml(item.damage || '')}" placeholder="Ex.: 2d8"></label>
                    <label class="field">Crítico<input name="critical" maxlength="60" value="${escapeHtml(item.critical || '')}" placeholder="20 / ×2"></label>
                    <label class="field">Tipo de dano<input name="damageType" maxlength="80" value="${escapeHtml(item.damageType || '')}" placeholder="Ex.: Energia, cortante"></label>
                    <label class="field">Alcance<input name="range" maxlength="100" value="${escapeHtml(item.range || '')}" placeholder="Quadrados ou faixas de alcance"></label>
                    <label class="field">Munição<input name="ammo" maxlength="80" value="${escapeHtml(item.ammo || '')}" placeholder="Ex.: 20 / 50 cargas"></label>
                    <label class="field">Mãos<select name="hands"><option value="1" ${item.hands !== 2 ? 'selected' : ''}>Uma mão</option><option value="2" ${item.hands === 2 ? 'selected' : ''}>Duas mãos</option></select></label>
                    <div class="inventory-form-checks">
                        <label><input name="light" type="checkbox" ${item.light ? 'checked' : ''}> Arma leve</label>
                    </div>
                </div>
                <p class="field-hint">Crie ataques na seção Ataques e vincule-os a esta arma. Cada ataque terá sua própria configuração.</p>
            </fieldset>
            <label class="inventory-editor-equipped" id="inventoryEquippedField" ${getInventorySection(item) === 'stash' ? 'hidden' : ''}><input name="equipped" type="checkbox" ${item.equipped ? 'checked' : ''}> <span id="inventoryEquippedLabel">${getInventorySection(item) === 'cybernetics' ? 'Instalado' : 'Equipada / em uso'}</span></label>
            <label class="field">Notas<textarea name="notes" rows="3" maxlength="8000" placeholder="Propriedades, modos de disparo, efeitos e observações">${escapeHtml(item.notes || '')}</textarea></label>
            ${item.legacyText ? `<p class="field-hint">Texto original: ${escapeHtml(item.legacyText)}</p>` : ''}
            <p id="inventoryFormError" class="inventory-form-error" role="alert"></p>
            <div class="inventory-form-actions">${existing ? `<button type="button" class="btn btn-danger" data-item-id="${escapeHtml(item.id)}" onclick="removeInventoryItem(${sheet.id}, this.dataset.itemId)">Remover item</button>` : ''}<button type="button" class="btn" onclick="closeModal('inventoryModal')">Cancelar</button><button type="submit" class="btn btn-primary">Salvar item</button></div>
        </form>`;
    openEquipmentEditorModal('inventoryModal', 'inventoryForm');
}

function openEquipmentEditorModal(modalId, formId) {
    openModal(modalId);
    const modal = document.getElementById(modalId);
    modal.scrollTop = 0;
    document.getElementById(formId).elements.name.focus();
    modal.onkeydown = event => {
        if (event.key !== 'Tab') return;
        const controls = [...modal.querySelectorAll('button, input, select, textarea')].filter(control => !control.closest('[hidden]'));
        const first = controls[0], last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
}

function refreshInventoryWeaponIcon() {
    const form = document.getElementById('inventoryForm');
    const preview = document.getElementById('inventoryWeaponIconPreview');
    if (form && preview) preview.innerHTML = `${renderWeaponIcon(form.elements.name.value, form.elements.weaponType.value)}<span>Imagem da arma</span>`;
}

function changeInventorySection() {
    const section = document.getElementById('inventoryForm').elements.section.value;
    document.getElementById('inventoryCyberneticRegion').hidden = section !== 'cybernetics';
    document.getElementById('inventoryEquippedField').hidden = section === 'stash';
    document.getElementById('inventoryEquippedLabel').textContent = section === 'cybernetics' ? 'Instalado' : 'Equipada / em uso';
}

function finishInventoryEditor() {
    inventoryEditorState = null;
    if (inventoryEditorTrigger?.isConnected) inventoryEditorTrigger.focus();
    inventoryEditorTrigger = null;
}

function saveInventoryItem(event) {
    event.preventDefault();
    const sheet = findSheet(inventoryEditorState?.sheetId);
    if (!sheet) return;
    const form = document.getElementById('inventoryForm');
    if (!form.reportValidity()) return;
    const fields = form.elements;
    const value = field => fields.namedItem(field).value.trim();
    const itemId = inventoryEditorState.itemId;
    const existing = itemId === null ? null : sheet.inventory?.find(entry => entry.id === itemId);
    if (itemId !== null && !existing) {
        document.getElementById('inventoryFormError').textContent = 'Este item não está mais no inventário. Feche a janela e abra a lista novamente.';
        return;
    }
    const item = {
        ...(existing || createInventoryItem()),
        name: value('name'), category: value('category'), quantity: Number(value('quantity')),
        section: existing ? getInventorySection(existing) : value('section'), cyberneticRegion: value('cyberneticRegion'),
        weight: Number(value('weight')), cost: Number(value('cost')), notes: value('notes'),
        weaponType: value('weaponType'), mode: value('mode'), damage: value('damage'), damageType: value('damageType'), critical: value('critical'),
        range: value('range'), ammo: value('ammo'), hands: Number(value('hands')),
        equipped: fields.equipped.checked, light: fields.light.checked,
    };
    if (!existing || existing.mode !== item.mode) {
        item.attackAttribute = item.mode === 'melee' ? 'FOR' : 'DES';
        item.damageAttribute = item.mode === 'ranged' ? 'none' : 'FOR';
    }
    setInventoryItemSection(item, value('section'));
    if (!isValidInventoryItem(item)) {
        document.getElementById('inventoryFormError').textContent = 'Confira o nome, a quantidade, os valores e os ajustes do item.';
        return;
    }
    const savedId = item.id;
    if (existing) Object.assign(existing, item, { needsReview: false });
    else (sheet.inventory ||= []).push({ ...item, id: savedId });
    sheet.inventorySection = item.section;
    closeModal('inventoryModal');
    renderSheets();
    [...document.querySelectorAll(`#sheet-${sheet.id} button[data-item-id]`)].find(button => button.dataset.itemId === savedId)?.focus();
    scheduleSave(sheet.id);
}
