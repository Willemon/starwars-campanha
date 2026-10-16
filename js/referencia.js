// Janelas de consulta: Classes e Biblioteca

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    modal.onclick = e => { if (e.target === modal) closeModal(modalId); };
    document.body.classList.add('modal-open');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    if (!document.querySelector('.modal.active')) document.body.classList.remove('modal-open');
    if (modalId === 'skillUsesModal') finishSkillUsesModal();
    if (modalId === 'inventoryModal') finishInventoryEditor();
    if (modalId === 'attackModal') finishAttackEditor();
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.modal.active').forEach(modal => closeModal(modal.id));
});

// Ignora acentos e maiúsculas na busca

// ===== Classes =====

function openClassReference() {
    const selector = document.getElementById('classSelector');
    const entries = Object.entries(CLASS_DATA);
    const heroic = entries.filter(([, data]) => HEROIC_CLASSES.includes(data.nome));
    const prestige = entries.filter(([, data]) => !HEROIC_CLASSES.includes(data.nome));

    const renderGroup = (title, group) => `
        <div class="class-group-title">${title}</div>
        ${group.map(([key, data]) => `
            <button class="class-btn" data-class-key="${key}" onclick="showClassDetails('${key}')">
                ${renderClassIcon(data.nome)}
                <span>${data.nome}</span>
            </button>
        `).join('')}
    `;

    selector.innerHTML = renderGroup('Classes Heroicas', heroic) + renderGroup('Classes de Prestígio', prestige);
    showClassDetails(heroic[0][0]);
    openModal('classModal');
}

function showClassDetails(className) {
    const details = document.getElementById('classDetails');
    const entry = findClassEntry(className);

    if (!entry) {
        details.innerHTML = `<div class="library-empty">Dados da classe "${escapeHtml(className)}" não disponíveis.</div>`;
        return;
    }

    const [key, classData] = entry;
    const facts = [
        ['Pontos de Vida', classData.hp],
        ['Pontos de Força', classData.forcePoints],
        ['Bônus de Defesa', classData.defenses],
        ['Perícias', classData.skills],
    ].filter(([, value]) => value);
    const talents = classData.initialTalents || [];
    const referenceSections = classData.sections || [];
    const table = classData.table || [];
    const prerequisites = (typeof CLASS_PROGRESSION !== 'undefined' && CLASS_PROGRESSION[classData.nome]?.preRequisitos) || [];

    details.innerHTML = `
        <div class="class-hero">
            ${renderClassIcon(classData.nome, 'class-icon-large')}
            <div>
                <span class="class-kind">${HEROIC_CLASSES.includes(classData.nome) ? 'Classe Heroica' : 'Classe de Prestígio'}</span>
                <h3>${classData.nome}</h3>
                ${classData.desc ? `<p class="class-description">${escapeHtml(classData.desc)}</p>` : ''}
            </div>
        </div>
        <div class="class-facts">
            ${facts.map(([title, value]) => `<div class="class-fact"><h4>${title}</h4><p>${escapeHtml(value)}</p></div>`).join('')}
        </div>
        ${prerequisites.length ? `
            <h4 class="section-label">Pré-requisitos para entrar</h4>
            <div class="chip-list">${prerequisites.map(req => `<span class="chip">${escapeHtml(describeRequirement(req))}</span>`).join('')}</div>
        ` : ''}
        ${talents.length ? `
            <h4 class="section-label">Talentos Iniciais</h4>
            <div class="chip-list">${talents.map(t => `<span class="chip class-initial-talent">${renderInitialTalentIcon(t)}<span>${escapeHtml(t)}</span></span>`).join('')}</div>
        ` : classData.feats ? `
            <h4 class="section-label">Talentos Iniciais</h4>
            <p>${escapeHtml(classData.feats)}</p>
        ` : ''}
        ${referenceSections.map(section => `
            <section class="class-reference-section">
                <h4 class="section-label">${escapeHtml(section.title)}</h4>
                ${section.text ? `<p>${escapeHtml(section.text)}</p>` : ''}
            </section>
        `).join('')}
        ${table.length ? `
            <h4 class="section-label">Progressão de Classe</h4>
            <div class="table-scroll">
                <table class="class-table">
                    <thead><tr>${table[0].map(cell => `<th>${cell}</th>`).join('')}</tr></thead>
                    <tbody>${table.slice(1).map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
                </table>
            </div>
        ` : ''}
    `;

    document.querySelectorAll('#classSelector .class-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.classKey === key);
    });
}

function closeClassReference() {
    closeModal('classModal');
}

// ===== Biblioteca =====

function openLibrary() {
    openModal('libraryModal');
    showLibraryCategory('forcePowers');
}

// Abre a Biblioteca direto num item (usado pelos talentos e aptidões da ficha)

function openLibraryItem(itemName, tipo) {
    const preferred = CHOICE_LIBRARY_CATEGORIES[tipo];
    const keys = [preferred, ...Object.keys(LIBRARY_DATA).filter(key => key !== preferred)].filter(key => LIBRARY_DATA[key]);
    openModal('libraryModal');

    for (const key of keys) {
        const category = LIBRARY_DATA[key];
        const name = resolveLibraryItemName(itemName, key);
        if (category.trees) {
            const treeIndex = category.trees.findIndex(tree => tree.items.includes(name));
            if (treeIndex < 0) continue;
            showLibraryCategory(key);
            showLibraryTree(key, treeIndex);
            showLibraryItem(key, treeIndex, category.trees[treeIndex].items.indexOf(name));
            scrollLibraryListToActive();
            return;
        }
        const itemIndex = category.items.indexOf(name);
        if (itemIndex < 0) continue;
        showLibraryCategory(key);
        showLibraryItem(key, null, itemIndex);
        scrollLibraryListToActive();
        return;
    }

    // Não achou pelo nome exato: abre a categoria já buscando pelo nome
    showLibraryCategory(preferred && LIBRARY_DATA[preferred] ? preferred : 'forcePowers');
    const search = document.getElementById('librarySearch');
    search.value = itemName;
    filterLibraryList(itemName);
}

function scrollLibraryListToActive() {
    document.querySelector('#libraryList .library-item-btn.active')?.scrollIntoView({ block: 'center' });
}

function closeLibrary() {
    closeModal('libraryModal');
}

// "Árvore de Aptidões: Ala (Wingman)" -> "Ala (Wingman)"

function showLibraryCategory(categoryKey) {
    const tabs = document.getElementById('libraryTabs');
    const list = document.getElementById('libraryList');
    const details = document.getElementById('libraryDetails');
    const search = document.getElementById('librarySearch');
    const category = LIBRARY_DATA[categoryKey];

    tabs.innerHTML = Object.entries(LIBRARY_DATA).map(([key, cat]) =>
        `<button class="library-tab ${key === categoryKey ? 'active' : ''}" onclick="showLibraryCategory('${key}')">${escapeHtml(cat.label)}</button>`
    ).join('');

    search.value = '';
    search.placeholder = category.trees ? 'Buscar árvore ou item...' : 'Buscar...';
    list.innerHTML = '';

    if (category.trees) {
        category.trees.forEach((tree, index) => {
            const btn = document.createElement('button');
            btn.className = 'library-item-btn';
            btn.dataset.index = index;
            btn.dataset.search = normalizeSearch(tree.name + ' ' + tree.items.join(' '));
            btn.innerHTML = `<span>${escapeHtml(shortTreeName(tree.name))}</span><span class="library-count">${tree.items.length}</span>`;
            btn.onclick = () => showLibraryTree(categoryKey, index);
            list.appendChild(btn);
        });
        showLibraryTree(categoryKey, 0);
        return;
    }

    category.items.forEach((item, index) => {
        const btn = document.createElement('button');
        btn.className = 'library-item-btn';
        btn.dataset.index = index;
        btn.dataset.search = normalizeSearch(item);
        btn.innerHTML = `${renderLibraryIcon(item, categoryKey)}<span class="library-item-name">${escapeHtml(item)}</span>${LIBRARY_ITEM_DETAILS[item]?.kind === 'aptitude' ? '<span class="library-pending">aptidão</span>' : LIBRARY_ITEM_DETAILS[item] ? '' : '<span class="library-pending">sem texto</span>'}`;
        btn.onclick = () => showLibraryItem(categoryKey, null, index);
        list.appendChild(btn);
    });
    details.innerHTML = '<div class="library-empty">Selecione um item da lista para ver os detalhes.</div>';
}

function filterLibraryList(query) {
    const normalized = normalizeSearch(query.trim());
    document.querySelectorAll('#libraryList .library-item-btn').forEach(btn => {
        btn.hidden = !btn.dataset.search.includes(normalized);
    });
}

function highlightLibraryListItem(index) {
    document.querySelectorAll('#libraryList .library-item-btn').forEach(btn => {
        btn.classList.toggle('active', Number(btn.dataset.index) === index);
    });
}

function showLibraryTree(categoryKey, treeIndex) {
    const category = LIBRARY_DATA[categoryKey];
    const tree = category.trees[treeIndex];
    const details = document.getElementById('libraryDetails');

    highlightLibraryListItem(treeIndex);

    details.innerHTML = `
        <div class="library-kicker">${escapeHtml(category.label)}</div>
        <h3 class="library-tree-title">${escapeHtml(shortTreeName(tree.name))}</h3>
        <div class="library-tree-items">
            ${tree.items.map((item, itemIndex) => `
                <button class="library-item-btn" onclick="showLibraryItem('${categoryKey}', ${treeIndex}, ${itemIndex})">
                    ${renderLibraryIcon(item, categoryKey)}
                    <span class="library-item-name">${escapeHtml(item)}</span>
                    ${LIBRARY_ITEM_DETAILS[item] ? '' : '<span class="library-pending">sem texto</span>'}
                </button>
            `).join('')}
        </div>
    `;
    details.scrollTop = 0;
}

// treeIndex é null nas categorias sem árvores
function getLibraryItem(categoryKey, treeIndex, itemIndex) {
    const category = LIBRARY_DATA[categoryKey];
    const tree = treeIndex === null ? null : category.trees[treeIndex];
    const itemName = tree ? tree.items[itemIndex] : category.items[itemIndex];
    return { category, tree, itemName, detail: LIBRARY_ITEM_DETAILS[itemName] };
}

const LIGHTSABER_FORM_RULES = 'Para usar um poder de Forma de Sabre, é necessário empunhar um sabre de luz ativado. A aptidão da forma não é um requisito de uso: ela concede o benefício adicional descrito. Repreender não afeta estes poderes, exceto Aproximar (Draw Closer) e Pushing Slash.';

function getLibraryCopyText(categoryLabel, itemName, treeName, detail) {
    const parts = [itemName, `Categoria: ${detail?.kind === 'aptitude' ? 'Aptidões' : categoryLabel}`];
    if (treeName) parts.push(`Árvore: ${treeName}`);
    if (detail?.descriptor) parts.push(`Descritor: ${detail.descriptor}`);
    if (detail?.source) parts.push(`Fonte: ${detail.source}`);
    if (detail?.sourceUrl) parts.push(`Wiki consultada: ${detail.sourceUrl}`);
    if (detail?.sourceLicense) parts.push(`Tradução da wiki sob ${detail.sourceLicense}: https://www.fandom.com/licensing`);
    parts.push('');
    if (categoryLabel === LIBRARY_DATA.forcePowers.label && detail?.descriptor?.includes('Forma de Sabre')) parts.push(LIGHTSABER_FORM_RULES, '');
    parts.push(detail?.text || 'Conteúdo ainda não preenchido.');
    if (detail?.checks?.length) {
        parts.push('');
        parts.push('Tabela de CD:');
        detail.checks.forEach(row => parts.push(`CD ${row.cd}: ${row.effect}`));
    }
    if (detail?.special) {
        parts.push('');
        parts.push(`Especial: ${detail.special}`);
    }
    if (detail?.sourceNote) parts.push('', `Nota da fonte: ${detail.sourceNote}`);
    return parts.join('\n');
}

function copyLibraryItem(categoryKey, treeIndex, itemIndex) {
    const { category, tree, itemName, detail } = getLibraryItem(categoryKey, treeIndex, itemIndex);
    const text = getLibraryCopyText(category.label, itemName, tree?.name, detail);
    const status = document.getElementById('libraryCopyStatus');
    navigator.clipboard.writeText(text).then(() => {
        if (status) {
            status.textContent = 'Copiado para a área de transferência.';
            setTimeout(() => status.textContent = '', 2500);
        }
    }).catch(() => {
        if (status) status.textContent = 'Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.';
    });
}

function renderLibraryChecks(detail) {
    return detail?.checks?.length ? `
        <table class="class-table">
            <thead><tr><th scope="col">CD</th><th scope="col">Efeito</th></tr></thead>
            <tbody>${detail.checks.map(row => `<tr><td>${escapeHtml(row.cd)}</td><td>${escapeHtml(row.effect)}</td></tr>`).join('')}</tbody>
        </table>
    ` : '';
}

function renderLibrarySource(detail) {
    return `${detail?.sourceNote ? `<p class="library-source-note">${escapeHtml(detail.sourceNote)}</p>` : ''}
        ${detail?.sourceUrl ? `<p class="library-source-link"><a href="${escapeHtml(detail.sourceUrl)}" target="_blank" rel="noopener noreferrer">Abrir fonte na wiki</a>${detail.sourceLicense ? ` · Tradução sob <a href="https://www.fandom.com/licensing" target="_blank" rel="noopener noreferrer">${escapeHtml(detail.sourceLicense)}</a>` : ''}</p>` : ''}`;
}

function renderForcePowerCard(itemName, detail, itemIndex) {
    const paragraphs = (detail?.text || 'Conteúdo ainda não preenchido.').split(/\n\n/);
    const facts = paragraphs[0].startsWith('Tempo:') ? paragraphs.shift().split('\n') : [];
    const descriptors = (detail?.descriptor || '').replace(/[\[\]]/g, '').split(',').map(value => value.trim()).filter(Boolean);
    return `<article class="force-power-card">
        <header class="library-item-head">
            ${getLibraryImageUrl(itemName, 'forcePowers') ? renderLibraryIcon(itemName, 'forcePowers', 'large') : ''}
            <div><div class="library-kicker">${detail?.kind === 'aptitude' ? 'Aptidão' : 'Poder da Força'}</div>
            <h3 class="library-tree-title">${escapeHtml(itemName.replace(/\s*\([^()]*\)$/, ''))}</h3>
            <p class="power-english">${escapeHtml(itemName.match(/\(([^()]*)\)$/)?.[1] || '')}</p></div>
        </header>
        <div class="library-meta">${descriptors.map(value => `<span class="chip power-descriptor ${value === 'Lado Sombrio' ? 'dark-side' : value === 'Lado Claro' ? 'light-side' : value === 'Forma de Sabre' ? 'saber-form' : ''}">${escapeHtml(value)}</span>`).join('')}</div>
        ${facts.length ? `<dl class="power-facts">${facts.map(line => {
            const colon = line.indexOf(':');
            return colon < 0 ? `<div><dt>Observação</dt><dd>${escapeHtml(line)}</dd></div>` : `<div><dt>${escapeHtml(line.slice(0, colon))}</dt><dd>${escapeHtml(line.slice(colon + 1).trim())}</dd></div>`;
        }).join('')}</dl>` : ''}
        ${descriptors.includes('Forma de Sabre') ? `<p class="library-source-note">${escapeHtml(LIGHTSABER_FORM_RULES)}</p>` : ''}
        <div class="library-text">${paragraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div>
        ${renderLibraryChecks(detail)}
        ${detail?.special ? `<section class="library-special"><h4>Especial</h4><p>${escapeHtml(detail.special)}</p></section>` : ''}
        <footer class="power-footer">
            <div class="power-source">${detail?.source ? `<p>${escapeHtml(detail.source)}</p>` : ''}${renderLibrarySource(detail)}</div>
            <div class="library-actions"><button class="btn" onclick="copyLibraryItem('forcePowers', null, ${itemIndex})">Copiar texto</button><span id="libraryCopyStatus" role="status"></span></div>
        </footer>
    </article>`;
}

function showLibraryItem(categoryKey, treeIndex, itemIndex) {
    const details = document.getElementById('libraryDetails');
    const { category, tree, itemName, detail } = getLibraryItem(categoryKey, treeIndex, itemIndex);

    if (!tree) highlightLibraryListItem(itemIndex);

    if (categoryKey === 'forcePowers') {
        details.innerHTML = renderForcePowerCard(itemName, detail, itemIndex);
        details.scrollTop = 0;
        return;
    }

    const meta = [
        ['Categoria', detail?.kind === 'aptitude' ? 'Aptidões' : category.label],
        tree && ['Árvore', shortTreeName(tree.name)],
        detail?.descriptor && ['Descritor', detail.descriptor],
        detail?.source && ['Fonte', detail.source],
    ].filter(Boolean);

    details.innerHTML = `
        ${tree ? `<button class="library-back" onclick="showLibraryTree('${categoryKey}', ${treeIndex})">← ${escapeHtml(shortTreeName(tree.name))}</button>` : ''}
        <div class="library-item-head">
            ${getLibraryImageUrl(itemName, categoryKey) ? renderLibraryIcon(itemName, categoryKey, 'large') : ''}
            <h3 class="library-tree-title">${escapeHtml(itemName)}</h3>
        </div>
        <div class="library-meta">
            ${meta.map(([label, value]) => `<span class="chip"><strong>${label}:</strong> ${escapeHtml(value)}</span>`).join('')}
        </div>
        ${categoryKey === 'forcePowers' && detail?.descriptor?.includes('Forma de Sabre') ? `<p class="library-source-note">${escapeHtml(LIGHTSABER_FORM_RULES)}</p>` : ''}
        <div class="library-text">${detail ? escapeHtml(detail.text).replace(/\n/g, '<br>') : '<em>Conteúdo ainda não preenchido.</em>'}</div>
        ${renderLibraryChecks(detail)}
        ${detail?.special ? `<div class="library-special"><strong>Especial:</strong> ${escapeHtml(detail.special)}</div>` : ''}
        ${renderLibrarySource(detail)}
        <div class="library-actions">
            <button class="btn" onclick="copyLibraryItem('${categoryKey}', ${treeIndex}, ${itemIndex})">Copiar texto</button>
            <span id="libraryCopyStatus"></span>
        </div>
    `;
    details.scrollTop = 0;
}
