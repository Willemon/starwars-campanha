// Efeitos holográficos: barra de scan + matrix Aurebesh nos títulos, corpo oculto.

(function () {
    const AUREBESH = '⌖⌗⌘⌬⌭⌮⌯⌰⌱⌲⌳⌵⌶⌷⌸⌹⌺⌻⌼⌽⌾⌿⍀⍁⍂⍃⍄⍅⍆⍇⍈⍉⍊⍋⍌⍍⍎⍏⍐⍑⍒⍓⍔⍕⍖⍗⍘⍙⍚⍛⍜⍝⍞⍟⍠⍡⍢⍣⍤⍥⍦⍧⍨⍩⍪⍫⍬⍭⍮⍯⍰⍱⍲⍳⍴⍵⍶⍷⍸⍹⍺';

    function randomSymbol() {
        return AUREBESH[Math.floor(Math.random() * AUREBESH.length)];
    }

    // Matrix: cada letra cicla símbolos aleatórios e pousa da esquerda pra direita.
    function matrixDecode(items, totalMs) {
        items.forEach(item => {
            item.chars = item.original.split('').map(char => ({
                target: char,
                isLetter: /[a-zA-ZÀ-ɏ]/.test(char),
                settled: false,
                cur: /[a-zA-ZÀ-ɏ]/.test(char) ? randomSymbol() : char,
                settleAt: 0,
            }));
            item.el.textContent = item.chars.map(c => c.cur).join('');
        });

        let idx = 0;
        const totalLetters = items.reduce((n, item) => n + item.chars.filter(c => c.isLetter).length, 0);
        items.forEach(item => {
            item.chars.forEach(c => {
                if (!c.isLetter) return;
                c.settleAt = (idx++ / Math.max(1, totalLetters)) * totalMs;
            });
        });

        const start = performance.now();
        function tick() {
            const elapsed = performance.now() - start;
            let allDone = true;
            items.forEach(item => {
                let dirty = false;
                item.chars.forEach(c => {
                    if (!c.isLetter || c.settled) return;
                    if (elapsed >= c.settleAt) {
                        c.cur = c.target; c.settled = true;
                    } else {
                        c.cur = randomSymbol(); allDone = false;
                    }
                    dirty = true;
                });
                if (dirty) item.el.textContent = item.chars.map(c => c.cur).join('');
            });
            if (allDone) {
                items.forEach(item => { item.el.textContent = item.original; });
            } else {
                setTimeout(tick, 50);
            }
        }
        tick();
    }

    function createHoloOverlay(container, durationMs) {
        const overlay = document.createElement('div');
        overlay.className = 'holo-body-overlay';

        for (let i = 0; i < 65; i++) {
            const s = document.createElement('span');
            s.className = 'holo-symbol';
            s.textContent = randomSymbol();
            s.style.left = `${(Math.random() * 96).toFixed(1)}%`;
            s.style.top = `${(Math.random() * 92).toFixed(1)}%`;
            s.style.animationDelay = `${(Math.random() * (durationMs / 1000)).toFixed(2)}s`;
            s.style.animationDuration = `${(0.25 + Math.random() * 0.55).toFixed(2)}s`;
            overlay.appendChild(s);
        }

        const label = document.createElement('div');
        label.className = 'holo-loading-label';
        label.textContent = 'ACESSANDO DATAPAD...';
        overlay.appendChild(label);

        container.appendChild(overlay);
        return overlay;
    }

    function addScanBar(container, durationMs) {
        container.style.position = 'relative';
        const bar = document.createElement('div');
        bar.className = 'modal-scan-line';
        bar.style.animationDuration = `${durationMs / 1000}s`;
        container.appendChild(bar);
        return bar;
    }

    // ── openModal: h2 com matrix; corpo oculto sincronamente até o scan terminar ──
    const MODAL_MS = 1500;
    const LIBRARY_MS = 700;

    const originalOpenModal = window.openModal;
    window.openModal = function (modalId) {
        originalOpenModal(modalId);
        const modal = document.getElementById(modalId);
        const content = modal?.querySelector('.modal-content');
        if (!content) return;

        modal.classList.add('holo-loading');
        content.classList.add('holo-loading');

        const isLibrary = modalId === 'libraryModal';
        const duration = isLibrary ? LIBRARY_MS : MODAL_MS;
        const bar = addScanBar(content, duration);
        const h2 = content.querySelector('h2');

        // Oculta corpo sincronamente (antes da primeira pintada) — sem RAF, sem flash.
        const bodyEls = [...content.children].filter(
            el => el !== h2 && !el.classList.contains('close-modal')
        );
        bodyEls.forEach(el => { el.style.opacity = '0'; });

        const overlay = createHoloOverlay(content, duration);
        if (h2) matrixDecode([{ el: h2, original: h2.textContent }], duration);

        setTimeout(() => {
            overlay.remove();
            bar.remove();
            modal.classList.remove('holo-loading');
            content.classList.remove('holo-loading');
            bodyEls.forEach(el => {
                el.style.transition = 'opacity 0.5s ease-out';
                el.style.opacity = '1';
            });
            setTimeout(() => {
                bodyEls.forEach(el => { el.style.transition = ''; el.style.opacity = ''; });
            }, 500);
        }, duration);
    };

    // ── showLibraryCategory: matrix em nomes + descrição oculta 5s ──────────────
    const LIST_MS = 5000;
    let listScanActive = false;

    const originalShowLibraryCategory = window.showLibraryCategory;
    if (typeof originalShowLibraryCategory === 'function') {
        window.showLibraryCategory = function (categoryKey) {
            originalShowLibraryCategory(categoryKey);
            const modal = document.getElementById('libraryModal');
            if (!modal?.classList.contains('active') || modal.classList.contains('holo-loading')) return;
            if (listScanActive) return;

            const list = document.getElementById('libraryList');
            const details = document.getElementById('libraryDetails');
            if (!list) return;

            const items = [...list.querySelectorAll('.library-item-name')]
                .map(el => ({ el, original: el.textContent }));
            if (!items.length) return;

            listScanActive = true;
            if (details) details.style.visibility = 'hidden';

            matrixDecode(items, LIST_MS);
            const bar = addScanBar(list, LIST_MS);

            setTimeout(() => {
                bar.remove();
                listScanActive = false;
                if (details) details.style.visibility = '';
            }, LIST_MS);
        };
    }

})();
