// Interface de talentos, aptidoes e poderes. Regras em js/regras/talentos.js.

function renderForcePowersCard(sheet) {
    const powers = sheet.forcePowers || [];
    return `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Poderes da Força</h3>
                <span class="card-count">${powers.length}</span>
                <button class="btn-add" onclick="openForcePowerPicker(${sheet.id})">+ Poder</button>
            </div>
            <div id="forcePowers-${sheet.id}" class="choice-list">
                ${powers.length ? powers.map((value, index) => {
                    const name = findForcePowerName(value);
                    const aptitude = name && LIBRARY_ITEM_DETAILS[name]?.kind === 'aptitude';
                    return `<div class="choice-row ${name ? '' : 'legacy'}">
                        ${name ? renderChoiceIcon(name, 'poder') : ''}
                        <span class="choice-name">${aptitude ? renderLibraryChoiceName({ nome: name, tipo: 'poder' }) : `<button type="button" title="Ver ou trocar" onclick="openForcePowerPicker(${sheet.id}, ${index})">${escapeHtml(name || value || 'Poder a escolher')}</button>`}
                            ${aptitude ? '<small>Aptidão · escolha antiga preservada</small>' : ''}
                            ${name ? '' : '<small>Da ficha antiga · escolher na Biblioteca</small>'}
                        </span>
                        <button type="button" class="icon-btn btn-remove" title="Remover poder" aria-label="Remover poder ${escapeHtml(name || value)}" onclick="removeDynamicItem(${sheet.id}, 'forcePowers', ${index})">×</button>
                    </div>`;
                }).join('') : '<div class="list-empty">Nenhum poder ainda.</div>'}
            </div>
        </div>
    `;
}

function renderChoiceIcon(nome, tipo) {
    return typeof renderLibraryIcon === 'function' ? renderLibraryIcon(nome, CHOICE_LIBRARY_CATEGORIES[tipo]) : '';
}

// Nome que abre o item na Biblioteca (talentos iniciais e extras, que não têm vaga para trocar)
function renderLibraryChoiceName(entry) {
    const args = escapeHtml(`${JSON.stringify(entry.nome)}, ${JSON.stringify(entry.tipo)}`);
    return `<span class="choice-name"><button type="button" title="Ver na Biblioteca" onclick="openLibraryItem(${args})">${escapeHtml(choiceLabel(entry))}</button></span>`;
}

function renderChoiceCard(sheet, tipo) {
    const labels = CHOICE_TYPE_LABELS[tipo];
    const slots = getSheetSlots(sheet);
    const slotKeys = new Set(slots.map(slot => slot.key));
    const entries = sheet.escolhas || [];
    const entryBySlot = new Map(entries.map(entry => [entry.vaga, entry]));
    const cardTypes = tipo === 'aptidao' ? ['aptidao', 'tecnica', 'segredo'] : ['talento'];
    const rows = [];
    let pending = 0;

    getAutomaticChoices(sheet).filter(entry => entry.tipo === tipo).forEach(entry => {
        rows.push(`
            <div class="choice-row">
                ${renderChoiceIcon(entry.nome, entry.tipo)}
                ${renderLibraryChoiceName(entry)}
                <span class="choice-source auto">${escapeHtml(entry.fonte)}</span>
                <button type="button" class="icon-btn btn-remove" title="Remover talento" aria-label="Remover talento ${escapeHtml(choiceLabel(entry))}" data-choice-key="${escapeHtml(automaticChoiceKey(entry))}" onclick="removeAutomaticChoice(${sheet.id}, this.dataset.choiceKey)">×</button>
            </div>
        `);
    });

    slots.forEach(slot => {
        const entry = entryBySlot.get(slot.key);
        // Vaga de talento bônus preenchida com uma aptidão (classe Sith) aparece no card de Aptidões
        const rowType = entry ? entry.tipo : slot.tipo;
        if (!cardTypes.includes(rowType)) return;
        const slotArg = escapeHtml(JSON.stringify(slot.key));

        if (entry) {
            rows.push(`
                <div class="choice-row">
                    ${renderChoiceIcon(entry.nome, entry.tipo)}
                    <span class="choice-name"><button type="button" title="Ver ou trocar" onclick="openChoicePicker(${sheet.id}, ${slotArg})">${escapeHtml(choiceLabel(entry))}</button></span>
                    <span class="choice-source">${escapeHtml(slot.fonte)}</span>
                    <button type="button" class="icon-btn btn-remove" title="Remover escolha" aria-label="Remover ${escapeHtml(choiceLabel(entry))}" onclick="removeChoice(${sheet.id}, ${slotArg})">×</button>
                </div>
            `);
            return;
        }

        pending++;
        rows.push(`
            <div class="choice-row pending">
                <span class="choice-name">
                    ${CHOICE_TYPE_LABELS[slot.tipo].singular} a escolher
                    <small>${escapeHtml(slot.fonte)}</small>
                </span>
                <button class="btn btn-small btn-primary" onclick="openChoicePicker(${sheet.id}, ${slotArg})">Escolher</button>
            </div>
        `);
    });

    entries.filter(entry => cardTypes.includes(entry.tipo) && !slotKeys.has(entry.vaga)).forEach(entry => {
        const isExtra = entry.vaga.startsWith('extra:');
        const slotArg = escapeHtml(JSON.stringify(entry.vaga));
        rows.push(`
            <div class="choice-row ${isExtra ? '' : 'orphan'}">
                ${renderChoiceIcon(entry.nome, entry.tipo)}
                ${renderLibraryChoiceName(entry)}
                ${isExtra
                    ? `<span class="choice-source extra">Extra · ${escapeHtml(entry.motivo || 'sem motivo')}</span>`
                    : '<span class="choice-source warn" title="O nível ou a classe que dava esta vaga mudou">Sem vaga</span>'}
                <button type="button" class="icon-btn btn-remove" title="Remover escolha" aria-label="Remover ${escapeHtml(choiceLabel(entry))}" onclick="removeChoice(${sheet.id}, ${slotArg})">×</button>
            </div>
        `);
    });

    (sheet.outrosTalentos || []).forEach((legacy, index) => {
        if (legacy.lista !== labels.field) return;
        rows.push(`
            <div class="choice-row legacy">
                <span class="choice-name">${escapeHtml(legacy.texto)}<small>Da ficha antiga · não encontrado na Biblioteca</small></span>
                <button class="btn btn-small" onclick="openExtraPicker(${sheet.id}, '${tipo}', ${index})">Escolher na lista</button>
                <button type="button" class="icon-btn btn-remove" title="Remover escolha" aria-label="Remover ${escapeHtml(legacy.texto)}" onclick="removeLegacyChoice(${sheet.id}, ${index})">×</button>
            </div>
        `);
    });

    return `
        <div class="card" data-choice-type="${tipo}">
            <div class="card-header">
                <h3 class="card-title">${labels.plural}</h3>
                <span class="card-count">${rows.length - pending}</span>
                ${pending ? `<span class="choice-pending-count" title="Vagas de nível sem escolha">${pending} a escolher</span>` : ''}
                <button class="btn-add" onclick="openExtraPicker(${sheet.id}, '${tipo}')">+ Extra</button>
                ${tipo === 'talento' && getAutomaticChoices(sheet, true).some(entry => (sheet.excludedAutomaticChoices || []).includes(automaticChoiceKey(entry))) ? `<button type="button" class="btn btn-small" onclick="restoreAutomaticChoices(${sheet.id})">Restaurar talentos iniciais</button>` : ''}
            </div>
            <div class="choice-list">
                ${rows.length ? rows.join('') : `<div class="list-empty">Nenhum${tipo === 'aptidao' ? 'a aptidão' : ' talento'} ainda.</div>`}
            </div>
        </div>
    `;
}

function removeChoice(sheetId, slotKey) {
    const sheet = findSheet(sheetId);
    if (!sheet) return;
    const entry = (sheet.escolhas || []).find(e => e.vaga === slotKey);
    if (!entry) return;
    const apply = () => {
        sheet.escolhas = sheet.escolhas.filter(e => e.vaga !== slotKey);
        syncChoiceNameLists(sheet);
        renderSheets();
        document.querySelector(`#sheet-${sheet.id} [data-choice-type="${entry.tipo === 'talento' ? 'talento' : 'aptidao'}"] .btn-add`)?.focus();
        scheduleSave(sheet.id);
    };
    if (typeof showConfirmModal === 'function') {
        showConfirmModal(`Remover a escolha de <strong>${escapeHtml(choiceLabel(entry))}</strong> da ficha?`, apply, 'Remover');
    } else {
        apply();
    }
}

function removeLegacyChoice(sheetId, index) {
    const sheet = findSheet(sheetId);
    if (!sheet?.outrosTalentos?.[index]) return;
    const legacy = sheet.outrosTalentos[index];
    showConfirmModal(`Remover <strong>${escapeHtml(legacy.texto)}</strong> da ficha?`, () => {
        if (sheet.outrosTalentos[index] !== legacy) return;
        sheet.outrosTalentos.splice(index, 1);
        syncChoiceNameLists(sheet);
        renderSheets();
        document.querySelector(`#sheet-${sheet.id} [data-choice-type="${legacy.lista === 'talents' ? 'talento' : 'aptidao'}"] .btn-add`)?.focus();
        scheduleSave(sheet.id);
    }, 'Remover');
}

function removeAutomaticChoice(sheetId, key) {
    const sheet = findSheet(sheetId);
    const entry = sheet && getAutomaticChoices(sheet).find(item => automaticChoiceKey(item) === key);
    if (!entry) return;
    showConfirmModal(`Remover <strong>${escapeHtml(choiceLabel(entry))}</strong> da ficha? Ele é um talento inicial de ${escapeHtml(entry.fonte.split(' · ')[0])}.`, () => {
        (sheet.excludedAutomaticChoices ||= []).push(key);
        syncChoiceNameLists(sheet);
        renderSheets();
        document.querySelector(`#sheet-${sheet.id} [data-choice-type="talento"] .btn-add`)?.focus();
        scheduleSave(sheet.id);
    }, 'Remover');
}

function restoreAutomaticChoices(sheetId) {
    const sheet = findSheet(sheetId);
    if (!sheet) return;
    const currentKeys = getAutomaticChoices(sheet, true).map(automaticChoiceKey);
    sheet.excludedAutomaticChoices = (sheet.excludedAutomaticChoices || []).filter(key => !currentKeys.includes(key));
    syncChoiceNameLists(sheet);
    renderSheets();
    scheduleSave(sheet.id);
}

// ===== Janela de escolha =====

// { sheetId, slotKey (null = extra), tipo, legacyIndex, candidates, selected }
let choiceState = null;

function buildCandidates(sheet, slot, tipo) {
    const kind = slot?.tipo || tipo;
    if (kind === 'poder') return (LIBRARY_DATA.forcePowers?.items || []).filter(nome => LIBRARY_ITEM_DETAILS[nome]?.kind !== 'aptitude').map(nome => ({ tipo: 'poder', nome }));
    if (kind === 'tecnica' || kind === 'segredo') {
        const category = kind === 'tecnica' ? LIBRARY_DATA.forceTechniques : LIBRARY_DATA.forceSecrets;
        return (category?.items || []).map(nome => ({ tipo: kind, nome }));
    }
    if (tipo === 'aptidao' || slot?.tipo === 'aptidao') {
        const allowed = slot ? getSlotTrees(sheet, slot) : null;
        const trees = getAptitudeTrees()
            .filter(tree => tree.items.length && (!allowed || allowed.includes(tree.name)))
            // Árvores da própria classe primeiro, depois as da Força e as de Tradição
            .sort((a, b) => (allowed ? allowed.indexOf(a.name) - allowed.indexOf(b.name) : 0));
        const seen = new Set();
        return trees.flatMap(tree => tree.items.filter(nome => !seen.has(nome) && seen.add(nome)).map(nome => ({
            tipo: 'aptidao', nome, grupo: shortTreeName(tree.name), ...(isTraditionTree(tree.name) ? { tradicao: true } : {}),
        })));
    }
    const talents = slot?.lista
        ? slot.lista.map(item => ({ tipo: 'talento', nome: item.nome, ...(item.detalhe ? { detalheFixo: item.detalhe } : {}) }))
        : (LIBRARY_DATA.talents?.items || []).map(nome => ({ tipo: 'talento', nome }));
    const aptitudes = (slot?.aptidoesPermitidas || []).map(nome => ({ tipo: 'aptidao', nome, grupo: 'Aptidões permitidas' }));
    return [...talents, ...aptitudes];
}

function openForcePowerPicker(sheetId, powerIndex = null) {
    const sheet = findSheet(sheetId);
    if (!sheet || (powerIndex !== null && !Number.isInteger(powerIndex))) return;
    if (powerIndex !== null && (powerIndex < 0 || powerIndex >= (sheet.forcePowers || []).length)) return;
    const current = powerIndex === null ? null : sheet.forcePowers[powerIndex];
    const name = findForcePowerName(current);
    const candidates = buildCandidates(sheet, null, 'poder');
    choiceState = { sheetId: sheet.id, slotKey: null, tipo: 'poder', powerIndex, candidates, selected: name ? candidates.findIndex(candidate => candidate.nome === name) : null };
    document.getElementById('choiceModalTitle').textContent = `${powerIndex === null ? 'Escolher' : 'Ver ou trocar'} Poder da Força`;
    document.getElementById('choiceModalSubtitle').textContent = sheet.name || 'Personagem';
    openChoiceWindow(current && !name ? current : '');
    document.querySelector('#choiceList .library-item-btn.active')?.scrollIntoView({ block: 'nearest' });
}

function openChoicePicker(sheetId, slotKey) {
    const sheet = findSheet(sheetId);
    const slot = sheet && getSheetSlots(sheet).find(s => s.key === slotKey);
    if (!slot) return;
    const current = (sheet.escolhas || []).find(e => e.vaga === slotKey);
    choiceState = { sheetId: sheet.id, slotKey, tipo: slot.tipo, legacyIndex: null, candidates: buildCandidates(sheet, slot, slot.tipo), selected: null };
    if (current) {
        choiceState.selected = choiceState.candidates.findIndex(c => c.nome === current.nome && c.tipo === current.tipo);
        if (current.detalhe) choiceState.detalhe = current.detalhe;
    }
    document.getElementById('choiceModalTitle').textContent = `${current ? 'Trocar' : 'Escolher'} ${CHOICE_TYPE_LABELS[slot.tipo].singular}`;
    document.getElementById('choiceModalSubtitle').textContent = `${sheet.name || 'Personagem'} · ${slot.fonte}`;
    openChoiceWindow();
}

function openExtraPicker(sheetId, tipo, legacyIndex = null) {
    const sheet = findSheet(sheetId);
    if (!sheet) return;
    const legacy = legacyIndex === null ? null : sheet.outrosTalentos?.[legacyIndex];
    choiceState = { sheetId: sheet.id, slotKey: null, tipo, legacyIndex, candidates: buildCandidates(sheet, null, tipo), selected: null };
    document.getElementById('choiceModalTitle').textContent = `${CHOICE_TYPE_LABELS[tipo].singular} extra`;
    document.getElementById('choiceModalSubtitle').textContent = legacy
        ? `${sheet.name || 'Personagem'} · no lugar de "${legacy.texto}" (da ficha antiga)`
        : `${sheet.name || 'Personagem'} · fora das vagas de nível (raça, Mestre, item...)`;
    openChoiceWindow(legacy ? choiceShortName(legacy.texto) : '');
}

function openChoiceWindow(search = '') {
    document.getElementById('choiceSearch').value = search;
    document.getElementById('choiceOnlyAvailable').checked = !search;
    renderChoiceList();
    if (choiceState.selected !== null && choiceState.selected >= 0) {
        showChoiceDetails(choiceState.selected);
    } else {
        document.getElementById('choiceDetails').innerHTML = choiceState.candidates.length
            ? '<div class="library-empty">Selecione um item da lista para ver os pré-requisitos e escolher.</div>'
            : '<div class="library-empty">A lista desta vaga ainda não está cadastrada na Biblioteca. Ela chega na próxima etapa.</div>';
    }
    openModal('choiceModal');
}

function renderChoiceList() {
    if (!choiceState) return;
    const sheet = findSheet(choiceState.sheetId);
    const onlyAvailable = document.getElementById('choiceOnlyAvailable').checked;
    const list = document.getElementById('choiceList');
    let lastGroup = null;
    const html = [];

    choiceState.candidates.forEach((candidate, index) => {
        const { status } = evaluateChoice(sheet, candidate, candidate.detalheFixo, choiceState.slotKey);
        // Com complemento, só fica bloqueado de verdade depois de escolher o complemento
        const effective = status === 'blocked' && getDetailOptions(candidate.nome) && !candidate.detalheFixo
            && evaluateChoice(sheet, candidate, '__qualquer__', choiceState.slotKey).status !== 'blocked' ? 'ok' : status;
        if (onlyAvailable && effective === 'blocked' && index !== choiceState.selected) return;
        if (candidate.grupo && candidate.grupo !== lastGroup) {
            html.push(`<div class="class-group-title">${escapeHtml(candidate.grupo)}</div>`);
            lastGroup = candidate.grupo;
        }
        const label = candidate.detalheFixo ? `${candidate.nome} — ${candidate.detalheFixo}` : candidate.nome;
        const icon = { ok: '✓', warn: '!', blocked: '✕' }[effective];
        html.push(`
            <button class="library-item-btn ${effective} ${index === choiceState.selected ? 'active' : ''}" data-index="${index}" data-search="${escapeHtml(normalizeSearch(label + ' ' + (candidate.grupo || '')))}" onclick="showChoiceDetails(${index})">
                <span class="choice-status ${effective}">${icon}</span>
                ${renderChoiceIcon(candidate.nome, candidate.tipo)}
                <span class="library-item-name">${escapeHtml(label)}</span>
            </button>
        `);
    });

    list.innerHTML = html.join('') || '<div class="library-empty">Nada disponível. Desmarque "Só o que posso escolher" para ver o que falta.</div>';
    filterChoiceList(document.getElementById('choiceSearch').value);
}

function filterChoiceList(query) {
    const normalized = normalizeSearch(query.trim());
    document.querySelectorAll('#choiceList .library-item-btn').forEach(btn => {
        btn.hidden = !btn.dataset.search.includes(normalized);
    });
}

function renderDetailInput(candidate, current, sheet) {
    const options = getDetailOptions(candidate.nome);
    if (!options || candidate.detalheFixo) return '';
    if (TALENT_DETAIL_OPTIONS[candidate.nome] === 'texto') {
        return `
            <div class="field">
                <label for="choiceDetail">Qual arma?</label>
                <input id="choiceDetail" type="text" value="${escapeHtml(current || '')}" oninput="updateChoiceDetail(this.value)">
            </div>
        `;
    }
    const owned = getOwnedChoices(sheet, choiceState.slotKey).filter(e => e.nome === candidate.nome).map(e => e.detalhe);
    const question = { pericia: 'Qual perícia?', poder: 'Qual poder?' }[TALENT_DETAIL_OPTIONS[candidate.nome]] || 'Qual?';
    return `
        <div class="field">
            <label for="choiceDetail">${question}</label>
            <select id="choiceDetail" onchange="updateChoiceDetail(this.value)">
                <option value="">Escolha...</option>
                ${options.map(option => `<option value="${escapeHtml(option)}" ${option === current ? 'selected' : ''}>${escapeHtml(option)}${owned.includes(option) ? ' (já tem)' : ''}</option>`).join('')}
            </select>
        </div>
    `;
}

function updateChoiceDetail(value) {
    choiceState.detalhe = value;
    showChoiceDetails(choiceState.selected, true);
}

function showChoiceDetails(index, keepDetail = false) {
    const sheet = findSheet(choiceState.sheetId);
    const candidate = choiceState.candidates[index];
    if (!sheet || !candidate) return;
    if (!keepDetail && choiceState.selected !== index) choiceState.detalhe = '';
    choiceState.selected = index;
    document.querySelectorAll('#choiceList .library-item-btn').forEach(btn => {
        btn.classList.toggle('active', Number(btn.dataset.index) === index);
    });

    const detalhe = candidate.detalheFixo || choiceState.detalhe || '';
    const needsDetail = getDetailOptions(candidate.nome) && !detalhe;
    const { status, results } = evaluateChoice(sheet, candidate, detalhe || undefined, choiceState.slotKey);
    const detail = LIBRARY_ITEM_DETAILS[candidate.nome];
    const isExtra = !choiceState.slotKey && candidate.tipo !== 'poder';
    const canChoose = status !== 'blocked' && !needsDetail;

    document.getElementById('choiceDetails').innerHTML = `
        <div class="library-kicker">${CHOICE_TYPE_LABELS[candidate.tipo].singular}${candidate.grupo ? ' · ' + escapeHtml(candidate.grupo) : ''}</div>
        <div class="library-item-head">
            ${typeof getLibraryImageUrl === 'function' && getLibraryImageUrl(candidate.nome, CHOICE_LIBRARY_CATEGORIES[candidate.tipo]) ? renderLibraryIcon(candidate.nome, CHOICE_LIBRARY_CATEGORIES[candidate.tipo], 'large') : ''}
            <h3 class="library-tree-title">${escapeHtml(candidate.nome)}${candidate.detalheFixo ? ' — ' + escapeHtml(candidate.detalheFixo) : ''}</h3>
        </div>
        <h4 class="section-label">Pré-requisitos</h4>
        ${results.length
            ? `<ul class="prereq-list">${results.map(r => `<li class="${r.status}">${escapeHtml(r.texto)}</li>`).join('')}</ul>`
            : '<ul class="prereq-list"><li class="ok">Nenhum</li></ul>'}
        <div class="choice-form">
            ${renderDetailInput(candidate, choiceState.detalhe, sheet)}
            ${isExtra ? `
                <div class="field">
                    <label for="choiceReason">Motivo do extra</label>
                    <input id="choiceReason" type="text" placeholder="Ex.: Talento bônus da raça, presente do Mestre" value="${escapeHtml(choiceState.motivo || '')}" oninput="choiceState.motivo = this.value">
                </div>
            ` : ''}
            <button class="btn btn-primary" ${canChoose ? '' : 'disabled'} onclick="confirmChoice()">Escolher</button>
        </div>
        ${status === 'blocked' ? '<p class="choice-blocked-msg">Não dá para escolher: falta cumprir o que está marcado com ✕.</p>' : ''}
        ${needsDetail && status !== 'blocked' ? '<p class="choice-blocked-msg">Escolha o complemento acima.</p>' : ''}
        <h4 class="section-label">Descrição</h4>
        <div class="library-meta">
            ${detail?.descriptor ? `<span class="chip"><strong>Descritor:</strong> ${escapeHtml(detail.descriptor)}</span>` : ''}
            ${detail?.source ? `<span class="chip"><strong>Fonte:</strong> ${escapeHtml(detail.source)}</span>` : ''}
        </div>
        ${candidate.tipo === 'poder' && detail?.descriptor?.includes('Forma de Sabre') ? `<p class="library-source-note">${escapeHtml(LIGHTSABER_FORM_RULES)}</p>` : ''}
        <div class="library-text">${detail ? escapeHtml(detail.text).replace(/\n/g, '<br>') : '<em>Texto ainda não traduzido na Biblioteca.</em>'}</div>
        ${renderLibraryChecks(detail)}
        ${detail?.special ? `<div class="library-special"><strong>Especial:</strong> ${escapeHtml(detail.special)}</div>` : ''}
        ${renderLibrarySource(detail)}
    `;
}

function confirmChoice() {
    const sheet = findSheet(choiceState?.sheetId);
    const candidate = choiceState?.candidates[choiceState.selected];
    if (!sheet || !candidate) return;
    const detalhe = (candidate.detalheFixo || choiceState.detalhe || '').trim();
    if (getDetailOptions(candidate.nome) && !detalhe) return;
    if (evaluateChoice(sheet, candidate, detalhe || undefined, choiceState.slotKey).status === 'blocked') return;

    if (candidate.tipo === 'poder') {
        if (!(LIBRARY_DATA.forcePowers?.items || []).includes(candidate.nome) || LIBRARY_ITEM_DETAILS[candidate.nome]?.kind === 'aptitude') return;
        if (!Array.isArray(sheet.forcePowers)) sheet.forcePowers = [];
        const index = choiceState.powerIndex;
        if (index === null) sheet.forcePowers.push(candidate.nome);
        else {
            if (!Number.isInteger(index) || index < 0 || index >= sheet.forcePowers.length) return;
            const oldName = sheet.forcePowers[index];
            const oldKey = `force_${encodeURIComponent(oldName)}`;
            const oldNote = sheet.noteDetails?.[oldKey];
            moveNote(sheet, 'force', oldName, candidate.nome);
            if (oldNote && sheet.forcePowers.some((name, i) => i !== index && name === oldName)) sheet.noteDetails[oldKey] = oldNote;
            sheet.forcePowers[index] = candidate.nome;
        }
        choiceState = null;
        closeModal('choiceModal');
        renderSheets();
        scheduleSave(sheet.id);
        return;
    }

    const entry = {
        vaga: choiceState.slotKey || `extra:${Date.now().toString(36)}`,
        tipo: candidate.tipo,
        nome: candidate.nome,
        ...(detalhe ? { detalhe } : {}),
        ...(choiceState.slotKey ? {} : { motivo: (choiceState.motivo || '').trim() || 'Extra' }),
    };
    sheet.escolhas = (sheet.escolhas || []).filter(e => e.vaga !== entry.vaga);
    sheet.escolhas.push(entry);

    if (choiceState.legacyIndex !== null && sheet.outrosTalentos?.[choiceState.legacyIndex]) {
        const legacy = sheet.outrosTalentos[choiceState.legacyIndex];
        moveNote(sheet, legacy.lista === 'aptitudes' ? 'aptitude' : 'talent', legacy.texto, choiceLabel(entry), CHOICE_TYPE_LABELS[entry.tipo].notePrefix);
        sheet.outrosTalentos.splice(choiceState.legacyIndex, 1);
    }

    syncChoiceNameLists(sheet);
    choiceState = null;
    closeModal('choiceModal');
    renderSheets();
    scheduleSave(sheet.id);
}

// ===== Entrada em classe de prestígio =====

// Pré-requisitos de entrada, contando só as outras classes da ficha (nível e BBA antes de entrar)

function renderRequirementList(results) {
    return `<ul class="prereq-list">${results.map(r => `<li class="${r.status}">${escapeHtml(r.texto)}</li>`).join('')}</ul>`;
}

// Troca a classe de uma linha; classe de prestígio passa pelos pré-requisitos
function requestClassChange(sheetId, index, className) {
    const sheet = findSheet(sheetId);
    if (!sheet?.classes?.[index]) return;
    const apply = () => {
        sheet.classes[index].name = className;
        renderSheets();
        scheduleSave(sheet.id);
    };
    const check = checkClassEntry(sheet, index, className);
    if (check.status === 'ok') {
        apply();
        return;
    }
    // Volta o seletor para a classe anterior até a entrada ser confirmada
    renderSheets();
    const list = renderRequirementList(check.results);
    if (check.status === 'blocked') {
        showConfirmModal(`Ainda não dá para entrar em <strong>${escapeHtml(className)}</strong>. Falta cumprir o que está marcado com ✕:${list}`, () => {}, 'Entendi');
    } else {
        showConfirmModal(`<strong>${escapeHtml(className)}</strong> tem pré-requisitos que só o Mestre pode confirmar:${list}`, apply, 'Entrar mesmo assim');
    }
}

// Alerta na linha da classe quando a ficha já está numa classe de prestígio sem cumprir a entrada
function renderClassEntryWarning(sheetId, index) {
    const sheet = findSheet(sheetId);
    const classObj = sheet?.classes?.[index];
    if (!classObj || getClassProgression(classObj.name)?.tipo !== 'prestigio') return '';
    const check = checkClassEntry(sheet, index, classObj.name);
    const missing = check.results.filter(r => r.status !== 'ok');
    if (!missing.length) return '';
    const title = `Pré-requisitos de entrada:\n${missing.map(r => (r.status === 'blocked' ? '✕ ' : '! ') + r.texto).join('\n')}`;
    return `<span class="class-warn ${check.status}" title="${escapeHtml(title)}">${check.status === 'blocked' ? '✕' : '!'}</span>`;
}
