/* ============================================================
   Průvodce podvodnou stránkou „DPD – vyzvednutí částky“.
   Nebezpečná cesta z úkolu o bezpečném placení: stránka po
   prodávajícím chce údaje o kartě, aby mu prý připsala peníze.
   Průvodce na to upozorní. Kartu zadávat NEMUSÍ; když ji zadá,
   ukáže se jen varování – FLAG tu NENÍ (ten je až na Bleskurýru).
   Průvodce lze vypnout parametrem ?tour=0.
   ============================================================ */
(function () {
    if (new URLSearchParams(location.search).get('tour') === '0') return;
    if (!window.driver || !window.driver.js) return;
    if (!document.getElementById('btn_submit')) return;

    const driver = window.driver.js.driver;

    // cvičná (neplatná) karta pro ty, kdo chtějí vidět následek – ne svoji skutečnou
    const CARD = '4000 1234 5678 9010';

    const LOOK = { popoverClass: 'zk-tour zk-corner', nextBtnText: 'Pokračovat', showButtons: ['next'] };

    function esc(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function copyable(text) {
        return `<span class="zk-copy" data-copy-text="${esc(text)}" title="Kliknutím zkopírujete"><b>${esc(text)}</b></span>`;
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

    document.addEventListener('click', (event) => {
        const el = event.target.closest('[data-copy-text]');
        if (!el) return;
        copyText(el.dataset.copyText).then(() => {
            el.classList.add('copied');
            setTimeout(() => el.classList.remove('copied'), 1400);
        });
    });

    let tour = null;
    let warningShown = false;

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
        tour = build([
            { popover: Object.assign({
                title: 'Kam vede odkaz z e-mailu',
                description: 'Z e-mailu jste se dostali na stránku „DPD“. Slibuje, že vám připíše <b>5000 Kč</b> za prodané kolo.'
            }, LOOK) },
            { element: '.column2', popover: {
                title: 'Pozor, co po vás chce',
                description: 'Abyste prý peníze dostali, máte zadat <b>číslo karty, platnost a CVC</b>. Jenže ty slouží k <b>placení</b>, ne k přijímání – k přijetí peněz je nikdo nepotřebuje. <b>Nic sem nezadávejte.</b>',
                side: 'left', nextBtnText: 'Rozumím', doneBtnText: 'Rozumím', showButtons: ['next'],
                onNextClick: () => {
                    if (tour) { tour.destroy(); tour = null; }
                    if (!warningShown) safeHint();
                }
            } }
        ]);
        tour.drive();
        watchOverlay();
    }

    // Když student projde upozornění, aniž by kartu zadal, ukážeme závěr s odkazem na bezpečnou cestu.
    function safeHint() {
        build([
            { popover: Object.assign({
                title: 'Jak si nechat zaplatit bezpečně',
                description: 'Kartu k přijetí peněz nikdy nezadávejte. Zavřete tuhle záložku a použijte <b>dobírku přes Bleskurýr</b> – tam se zadává jen <b>číslo účtu</b>.'
            }, { popoverClass: 'zk-tour zk-corner', nextBtnText: 'Zavřít', doneBtnText: 'Zavřít', showButtons: ['next'] }) }
        ]).drive();
    }

    // Pokud student kartu přece jen zadá, ukáže se varování (stránka sama) a pak tenhle závěr. Žádný FLAG.
    function watchOverlay() {
        const warn = document.getElementById('divOne');
        if (!warn) return;
        const shown = () => getComputedStyle(warn).visibility === 'visible';
        const obs = new MutationObserver(() => {
            if (!shown()) return;
            obs.disconnect();
            warningShown = true;
            if (tour) { tour.destroy(); tour = null; }
            const close = document.getElementById('Close');
            if (close) close.addEventListener('click', stolenHint, { once: true });
        });
        obs.observe(warn, { attributes: true, attributeFilter: ['style'] });
    }

    function stolenHint() {
        build([
            { popover: Object.assign({
                title: 'A je to venku',
                description: 'Jakmile jste kartu zadali, útočník má její údaje a žádné peníze vám nepřijdou. K <b>přijetí</b> peněz se karta nikdy nezadává.'
                    + '<br><br>Zavřete tuhle záložku a nechte si zaplatit bezpečně přes <b>Bleskurýr</b> (jen číslo účtu).'
            }, { popoverClass: 'zk-tour zk-corner', nextBtnText: 'Zavřít', doneBtnText: 'Zavřít', showButtons: ['next'] }) }
        ]).drive();
    }

    setTimeout(start, 300);
})();
