/* ============================================================
   Průvodce podvodnou stránkou „DPD – vyzvednutí částky“.
   Závěr úkolu o bazarovém podvodu: stránka slibuje připsání peněz,
   ve skutečnosti chce údaje o kartě a potvrzení v aplikaci banky,
   kterým by oběť schválila platbu. Student si to vyzkouší na cvičné
   kartě a v simulovaném telefonu (phone.js) sám zareaguje. FLAG se
   ukáže až po zablokování karty: zamítnutí platby nestačí, protože
   útočník má údaje o kartě dál. Blokace je možná i po potvrzení.
   Průvodce lze vypnout parametrem ?tour=0.
   ============================================================ */
(function () {
    if (new URLSearchParams(location.search).get('tour') === '0') return;
    if (!window.driver || !window.driver.js) return;
    if (!document.getElementById('btn_submit')) return;

    const driver = window.driver.js.driver;

    // cvičná (neplatná) karta, aby nikdo nezkoušel svoji skutečnou
    const CARD = '4000 1234 5678 9010';
    const FLAG = 'FLAG(NaKartuNelzePoslatPenize)';

    const LOOK = { popoverClass: 'zk-tour zk-corner zk-left', nextBtnText: 'Pokračovat', doneBtnText: 'Pokračovat', showButtons: ['next'] };

    function esc(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function copyText(text) {
        const legacy = () => {
            const area = document.createElement('textarea');
            area.value = text;
            area.style.position = 'fixed';
            area.style.opacity = '0';
            document.body.appendChild(area);
            area.select();
            try { document.execCommand('copy'); } catch (e) { /* nic */ }
            area.remove();
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).catch(legacy);
        }
        return Promise.resolve(legacy());
    }

    let tour = null;
    let panel = null;
    let paid = false;

    function build(steps) {
        return driver({
            allowClose: false,
            allowKeyboardControl: false,
            overlayOpacity: 0.2,
            stagePadding: 6,
            stageRadius: 8,
            showProgress: false,
            popoverClass: 'zk-tour',
            nextBtnText: 'Další',
            doneBtnText: 'Rozumím',
            steps
        });
    }

    function start() {
        document.body.classList.add('zk-guided'); // viz assets/style.css
        tour = build([
            { popover: Object.assign({
                title: 'Kam vede odkaz z e-mailu',
                description: 'Z e-mailu jste se dostali na stránku „DPD“. Slibuje, že vám připíše <b>5000 Kč</b> za prodané kolo.'
            }, LOOK) },
            { element: '.column2', popover: {
                title: 'Pozor, co po vás chce',
                description: 'Abyste prý peníze dostali, máte zadat <b>číslo karty, platnost a CVC</b>. Ty ale slouží k <b>placení</b>, ne k přijímání.',
                popoverClass: 'zk-tour zk-left', nextBtnText: 'Pokračovat', doneBtnText: 'Pokračovat', showButtons: ['next'],
                onNextClick: () => {
                    if (tour) { tour.destroy(); tour = null; }
                    showCardStep();
                }
            } }
        ]);
        tour.drive();
    }

    /* ---------- panel (nebrání práci se stránkou) ---------- */

    function showPanel(html) {
        if (!panel) {
            panel = document.createElement('aside');
            panel.className = 'zk-mission zk-tour';
            // vpravo je telefon
            Object.assign(panel.style, { left: '24px', right: 'auto' });
            document.body.appendChild(panel);
        }
        panel.innerHTML = '<div class="zk-mission-head"><b>Co by následovalo</b>'
            + '<button type="button" class="zk-mission-toggle" aria-label="Skrýt úkol" title="Skrýt / zobrazit">–</button></div>'
            + `<div class="zk-mission-body">${html}</div>`;
        panel.classList.remove('collapsed');
    }

    function showMessage(html) {
        panel.querySelector('[data-message]').innerHTML = `<div class="zk-warning">${html}</div>`;
    }

    document.addEventListener('click', (event) => {
        const toggle = event.target.closest('.zk-mission-toggle');
        if (toggle) toggle.closest('.zk-mission').classList.toggle('collapsed');
    });

    /* ---------- krok 1: cvičná karta ---------- */

    function showCardStep() {
        showPanel('Vyplňte <b>cvičnou kartu</b> a klikněte na <b>Vyzvednout částku</b>. Svoji skutečnou kartu nepoužívejte.'
            + '<div class="zk-actions"><button type="button" class="zk-btn" data-fill-card>Vyplnit cvičnou kartu</button></div>'
            + '<div data-message></div>');
    }

    document.addEventListener('click', (event) => {
        if (!event.target.closest('[data-fill-card]')) return;
        document.getElementById('CardNumber').value = CARD;
        document.getElementById('Month').value = '12';
        document.getElementById('Year').value = '30';
        document.getElementById('CVCode').value = '123';
    });

    // Během průvodce projde jen cvičná karta, ať nikdo nezadává skutečné údaje.
    document.getElementById('btn_submit').addEventListener('click', (event) => {
        if (document.getElementById('CardNumber').value === CARD) return;
        event.stopImmediatePropagation();
        if (panel) showMessage('Použijte cvičnou kartu.');
    }, true);

    /* ---------- krok 2: reakce v aplikaci banky ---------- */

    document.addEventListener('dpd:phone', () => {
        showPanel('Stránka tvrdí, že potvrzujete <b>připsání</b> 5000 Kč. Do telefonu vpravo přišlo oznámení od banky.'
            + '<br><br>Otevřete ho, přečtěte si, co banka opravdu žádá, a <b>zareagujte tak, jak byste měli ve skutečnosti</b>.'
            + '<div data-message></div>');
    });

    document.addEventListener('dpd:payment', (event) => {
        if (event.detail.payment === 'confirmed') {
            showPanel('<div class="zk-warning">Potvrdili jste platbu, peníze by vám odešly.</div>'
                + 'Útočník navíc pořád zná číslo karty, platnost a CVC. Zabraňte dalším platbám přímo v aplikaci.'
                + '<div data-message></div>');
        } else {
            showPanel('Platba neproběhla, to je správně. Útočník ale pořád zná <b>číslo karty, platnost a CVC</b> a může to zkusit znovu.'
                + '<br><br>Stačí to takhle, nebo je potřeba udělat ještě něco? Zareagujte v aplikaci.'
                + '<div data-message></div>');
        }
    });

    document.addEventListener('dpd:block', (event) => {
        if (event.detail.reason === 'misuse') return;
        event.preventDefault();
        showMessage('Kartu máte u sebe. Co se stalo s jejími údaji?');
    });

    document.addEventListener('dpd:blocked', (event) => {
        if (panel) panel.hidden = true;
        paid = event.detail.paid;
        summary();
    });

    /* ---------- závěr ---------- */

    function summary() {
        let t;
        t = build([
            { popover: {
                popoverClass: 'zk-tour zk-wide',
                title: 'Karta je zablokovaná',
                description: 'Stránka slibovala, že vám 5000 Kč <b>přijde</b>, banka ale žádala potvrzení <b>platby</b>. '
                    + (paid
                        ? 'Platbu jste potvrdili, takže peníze odešly. Blokace zastavila další platby, o vrácení částky je potřeba hned žádat banku. '
                        : 'Platbu jste nepotvrdili a kartu jste zablokovali, takže útočník získané údaje nevyužije. ')
                    + 'Tady je FLAG:'
                    + '<div class="zk-flag"><code>' + esc(FLAG) + '</code>'
                    + '<button type="button" class="zk-btn" data-copy-flag>Kopírovat</button></div>'
                    + '<b>Co si zapamatovat:</b><ul class="zk-list">'
                    + '<li>K <b>přijetí</b> peněz stačí číslo účtu.</li>'
                    + '<li>Číslo karty, platnost a CVC slouží k <b>placení</b>, ne k přijímání.</li>'
                    + '<li>Než v aplikaci banky něco potvrdíte, přečtěte si, <b>co přesně potvrzujete</b>.</li>'
                    + '<li>Zadali jste údaje o kartě na podezřelé stránce? Zamítnutí nestačí, <b>kartu zablokujte</b>.</li>'
                    + '</ul>',
                nextBtnText: 'Zavřít', doneBtnText: 'Zavřít', showButtons: ['next'],
                onNextClick: () => { if (t) t.destroy(); showFlagChip(); },
                onPopoverRender: (popover) => {
                    const btn = popover.description.querySelector('[data-copy-flag]');
                    if (btn) btn.addEventListener('click', () => {
                        copyText(FLAG).then(() => { btn.textContent = '✔ Zkopírováno'; });
                    });
                }
            } }
        ]);
        t.drive();
    }

    // Po zavření okna s vlajkou zůstane vpravo dole tlačítko, kterým ji lze znovu zobrazit.
    function showFlagChip() {
        if (document.querySelector('.zk-chip')) return;
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'zk-chip';
        chip.textContent = 'Zobrazit FLAG';
        chip.addEventListener('click', summary);
        document.body.appendChild(chip);
    }

    setTimeout(start, 300);
})();
