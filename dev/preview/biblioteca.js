// Estudo visual isolado: consulta os dados reais sem carregar fichas ou Firebase.
const powers = LIBRARY_DATA.forcePowers.items;
let selectedPower = powers.find(name => name.endsWith('(Rend)')) || powers[0];

function previewIcon(name) {
    const url = getLibraryImageUrl(name, 'forcePowers');
    return url ? `<img src="${escapeHtml(url)}" alt="">` : '<span class="empty-icon" aria-hidden="true">✦</span>';
}

function renderPreviewList() {
    const query = normalizeSearch(document.getElementById('search').value);
    const visible = powers.filter(name => normalizeSearch(name).includes(query));
    document.getElementById('count').textContent = `${visible.length} / ${powers.length}`;
    document.getElementById('powerList').innerHTML = visible.length ? visible.map(name => `<button type="button" class="power" aria-pressed="${name === selectedPower}" data-name="${escapeHtml(name)}">${previewIcon(name)}<span>${escapeHtml(name.replace(/\s*\([^()]*\)$/, ''))}<small>${escapeHtml(name.match(/\(([^()]*)\)$/)?.[1] || '')}</small></span></button>`).join('') : '<p class="source-note">Nenhum poder encontrado.</p>';
}

function renderPreviewEntry() {
    const detail = LIBRARY_ITEM_DETAILS[selectedPower];
    const title = selectedPower.replace(/\s*\([^()]*\)$/, '');
    const english = selectedPower.match(/\(([^()]*)\)$/)?.[1] || '';
    const paragraphs = (detail?.text || 'Conteúdo ainda não preenchido.').split(/\n\n/);
    const hasFacts = paragraphs[0].startsWith('Tempo:');
    const facts = hasFacts ? paragraphs.shift().split('\n') : [];
    document.getElementById('entry').innerHTML = `
        <div class="breadcrumb"><a href="dev/preview/">Ficha</a><span aria-hidden="true">/</span><span>Biblioteca</span><span aria-hidden="true">/</span><span>Poderes da Força</span></div>
        <div class="hero">${previewIcon(selectedPower)}<div><p class="eyebrow">${detail?.kind === 'aptitude' ? 'Aptidão' : 'Poder da Força'}</p><h1>${escapeHtml(title)}</h1><p class="english">${escapeHtml(english)}</p></div></div>
        ${detail?.descriptor ? `<div class="descriptor">${escapeHtml(detail.descriptor.replace(/[\[\]]/g, ''))}</div>` : ''}
        ${facts.length ? `<dl class="facts">${facts.map(line => { const colon = line.indexOf(':'); return `<div><dt>${escapeHtml(line.slice(0, colon))}</dt><dd>${escapeHtml(line.slice(colon + 1).trim())}</dd></div>`; }).join('')}</dl>` : '<hr style="border:0;border-top:1px solid var(--line);margin:28px 0">'}
        ${detail?.descriptor?.includes('Forma de Sabre') ? `<p class="source-note">${escapeHtml(LIGHTSABER_FORM_RULES)}</p>` : ''}
        <div class="rules-copy">${paragraphs.map(paragraph => `<p>${escapeHtml(paragraph)}</p>`).join('')}</div>
        ${renderLibraryChecks(detail)}
        ${detail?.special ? `<section class="special"><h2>Especial</h2><p>${escapeHtml(detail.special)}</p></section>` : ''}
        ${detail?.sourceNote ? `<p class="source-note">${escapeHtml(detail.sourceNote)}</p>` : ''}
        <footer><div class="source"><p>${escapeHtml(detail?.source || '')}</p>${detail?.sourceUrl ? `<a href="${escapeHtml(detail.sourceUrl)}" target="_blank" rel="noopener noreferrer">Consultar fonte ↗</a>` : ''}${detail?.sourceLicense ? ` · Tradução sob <a href="https://www.fandom.com/licensing" target="_blank" rel="noopener noreferrer">${escapeHtml(detail.sourceLicense)}</a>` : ''}</div><div><button type="button" class="copy" id="copyPower">Copiar texto ↗</button><span id="copyStatus" role="status"></span></div></footer>`;
    document.getElementById('copyPower').onclick = async () => {
        try {
            await navigator.clipboard.writeText(getLibraryCopyText('Poderes da Força', selectedPower, null, detail));
            document.getElementById('copyStatus').textContent = 'Texto copiado';
        } catch {
            document.getElementById('copyStatus').textContent = 'Não foi possível copiar';
        }
    };
}

document.getElementById('search').addEventListener('input', renderPreviewList);
document.getElementById('powerList').addEventListener('click', event => {
    const button = event.target.closest('button[data-name]');
    if (!button) return;
    selectedPower = button.dataset.name;
    renderPreviewEntry();
    renderPreviewList();
});
renderPreviewList();
renderPreviewEntry();
