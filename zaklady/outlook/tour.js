/* ============================================================
   Průvodce úkolem „Bazarový prodej – jak si nechat bezpečně zaplatit“.
   Běží na dvou stránkách:
   1. schránka (index.html) – volné prohlížení odpovědí. Panel v rohu
      zadá úkol a po otevření každé zprávy se po chvilce ukáže popisek.
      Odkazy DPD i Bleskurýr se otevírají v nové záložce.
   2. Bleskurýr (bleskuryr/bleskuryr.html) – bezpečný formulář, kde se
      zadá jen číslo účtu a student dostane FLAG.
   Podvodnou stránku DPD vede vlastní průvodce (DPD/tour.js) – tam FLAG
   není, jen upozornění.
   Průvodce lze vypnout parametrem ?tour=0.
   ============================================================ */
(function () {
    if (new URLSearchParams(location.search).get('tour') === '0') return;
    if (!window.driver || !window.driver.js) return;

    const driver = window.driver.js.driver;
    const onInbox = !!document.getElementById('messageList');
    const onForm = !!document.getElementById('zasilkaForm');
    if (!onInbox && !onForm) return;

    // údaje prodávajícího (jméno odpovídá příjemci ve schránce; účet musí sedět s kontrolou v bleskuryr.html)
    const NAME = 'Jan Novák';
    const PHONE = '777 123 456';
    const ACCOUNT = '265066011/5500';
    const FLAG = 'FLAG(NaKartuNelzePoslatPenize)';

    const LOOK = { popoverClass: 'zk-tour zk-corner', nextBtnText: 'Pokračovat', showButtons: ['next'] };

    /* ---------- kopírování textu kliknutím ---------- */

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
            doneBtnText: 'Hotovo',
            steps
        });
    }

    function waitFor(selector, cb, tries) {
        tries = tries || 0;
        if (document.querySelector(selector)) { cb(); return; }
        if (tries > 24) return; // ~3,6 s
        setTimeout(() => waitFor(selector, cb, tries + 1), 150);
    }

    /* ============================================================
       Schránka (index.html) – panel v rohu + popisky po otevření
       ============================================================ */

    // Panel jde sbalit, aby nezakrýval obsah.
    document.addEventListener('click', (event) => {
        const toggle = event.target.closest('.zk-mission-toggle');
        if (toggle) toggle.closest('.zk-mission').classList.toggle('collapsed');
    });

    const mission = {
        el: null,
        show(title, html) {
            if (!this.el) {
                this.el = document.createElement('aside');
                this.el.className = 'zk-mission zk-tour';
                document.body.appendChild(this.el);
            }
            this.el.innerHTML = `<div class="zk-mission-head"><b>${title}</b>`
                + '<button type="button" class="zk-mission-toggle" aria-label="Skrýt úkol" title="Skrýt / zobrazit">–</button></div>'
                + `<div class="zk-mission-body">${html}</div>`;
            this.el.hidden = false;
            this.el.classList.remove('collapsed');
        },
        // popisek k otevřené zprávě; cls: 'zk-warning' | 'zk-success' | 'zk-note'
        note(html, cls) {
            if (!this.el) return;
            const body = this.el.querySelector('.zk-mission-body');
            const old = body.querySelector('[data-note]');
            if (old) old.remove();
            this.el.classList.remove('collapsed');
            body.insertAdjacentHTML('beforeend', `<div class="${cls}" data-note style="margin-top:10px">${html}</div>`);
        }
    };

    // popisky k jednotlivým zprávám
    const NOTES = {
        '3': { cls: 'zk-warning', html: 'Spěchá – tvrdí, že přijdou peníze, ať rychle vyplníte formulář, jinak propadnou. <b>Nátlak na rychlost</b> je typický pro podvod.' },
        '1': { cls: 'zk-warning', html: '5000 Kč si máte vyzvednout přes odkaz. Otevřete odkaz <b>DPD</b> (nová záložka) a podívejte se, jaké údaje po vás chce.' },
        '2': { cls: 'zk-success', html: 'Poctivá nabídka – dobírka přes Bleskurýr. V jeho <b>formuláři</b> se zadává jen číslo účtu, na které lze peníze zaslat, nikoliv odečíst.' },
        '4': { cls: 'zk-note', html: 'Běžná zpráva, s prodejem kola nesouvisí.' },
        '5': { cls: 'zk-note', html: 'Reklama, s prodejem nesouvisí.' },
        '6': { cls: 'zk-note', html: 'Běžné oznámení služby.' }
    };

    function initInbox() {
        let noteTimer = null;
        document.addEventListener('click', (event) => {
            const item = event.target.closest('.message-item');
            if (!item) return;
            const note = NOTES[item.dataset.emailId];
            clearTimeout(noteTimer);
            // popisek až po chvilce, ať si student text zprávy nejdřív přečte
            noteTimer = setTimeout(() => { if (note) mission.note(note.html, note.cls); }, 1000);
        });

        waitFor('#messageList', () => {
            mission.show('Prodáváte kolo',
                'Na inzerát na prodej kola odpověděli dva zájemci – <b>jeden z nich je podvodník</b>. '
                + 'Otevřete si zprávy a rozhodněte, jak si nechat bezpečně zaplatit.');

            // Panel umístíme vlevo přes seznam složek – tam nepřekáží čtení zprávy ani seznamu e-mailů.
            Object.assign(mission.el.style, {
                left: '52px', right: 'auto', width: '235px', boxSizing: 'border-box',
                maxHeight: 'calc(100vh - 110px)', overflowY: 'auto'
            });
        });
    }

    /* ============================================================
       Bleskurýr (bleskuryr/bleskuryr.html) – tady je FLAG
       ============================================================ */

    let tour = null;

    function startForm() {
        tour = build([
            { popover: Object.assign({
                title: 'Formulář dopravce',
                description: 'Tímto formulářem odešlete balík na dobírku: zboží pošlete a peníze vám přijdou po doručení.'
            }, LOOK) },
            { element: '#zasilkaForm', popover: {
                title: 'Vyplňte a odešlete',
                description: 'Vyplňte údaje o odesílateli a klikněte na <b>Odeslat zásilku</b>. K přijetí peněz na dobírku stačí <b>číslo účtu</b>, kartu nikdo nepotřebuje.'
                    + '<div class="zk-note">Vaše údaje (klikněte pro zkopírování):<br>'
                    + 'Jméno: ' + copyable(NAME) + '<br>'
                    + 'Telefon: ' + copyable(PHONE) + '<br>'
                    + 'Číslo účtu: ' + copyable(ACCOUNT) + '</div>',
                side: 'top', align: 'center', showButtons: []
            } }
        ]);
        tour.drive();
        watchModal();
    }

    function watchModal() {
        const modal = document.getElementById('modal');
        if (!modal) return;
        const shown = () => modal.style.display && modal.style.display !== 'none';
        const obs = new MutationObserver(() => {
            if (!shown()) return;
            obs.disconnect();
            if (tour) { tour.destroy(); tour = null; }
            const close = document.getElementById('closeModal');
            if (close) close.addEventListener('click', summary, { once: true });
        });
        obs.observe(modal, { attributes: true, attributeFilter: ['style'] });
    }

    function summary() {
        build([
            { popover: {
                popoverClass: 'zk-tour zk-wide',
                title: 'Výborně, hotovo!',
                description: 'Tady je FLAG:'
                    + '<div class="zk-flag"><code>' + esc(FLAG) + '</code>'
                    + '<button type="button" class="zk-btn" data-copy-flag>Kopírovat</button></div>'
                    + '<b>Co si zapamatovat:</b><ul class="zk-list">'
                    + '<li>K <b>přijetí</b> peněz stačí číslo účtu.</li>'
                    + '<li>Číslo karty, platnost a CVC slouží k <b>placení</b>, ne k přijímání. Kdo je po vás chce „kvůli připsání peněz“, je podvodník.</li>'
                    + '</ul>',
                nextBtnText: 'Zavřít', doneBtnText: 'Zavřít', showButtons: ['next'],
                onPopoverRender: function (popover) {
                    const btn = popover.description.querySelector('[data-copy-flag]');
                    if (btn) btn.addEventListener('click', function () {
                        copyText(FLAG).then(function () { btn.textContent = '✔ Zkopírováno'; });
                    });
                }
            } }
        ]).drive();
    }

    /* ---------- start ---------- */

    if (onInbox) initInbox();
    else if (onForm) setTimeout(startForm, 300);
})();
