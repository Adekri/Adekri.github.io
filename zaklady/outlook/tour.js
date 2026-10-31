/* ============================================================
   Průvodce úkolem „Bazarový prodej – podvod přes falešného dopravce“.
   Běží ve schránce (index.html): panel v rohu vede studenta po
   podvodné cestě (Stanislav -> e-mail od „DPD“ -> odkaz na podvodnou
   stránku). Ostatní zprávy jsou legitimní a slouží jen pro srovnání.
   Na stránce DPD pokračuje vlastní průvodce (DPD/tour.js), tam je FLAG.
   Průvodce lze vypnout parametrem ?tour=0.
   ============================================================ */
(function () {
    if (new URLSearchParams(location.search).get('tour') === '0') return;
    if (!document.getElementById('messageList')) return;

    function waitFor(selector, cb, tries) {
        tries = tries || 0;
        if (document.querySelector(selector)) { cb(); return; }
        if (tries > 24) return; // ~3,6 s
        setTimeout(() => waitFor(selector, cb, tries + 1), 150);
    }

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
        // popisek k otevřené zprávě; cls: 'zk-warning' | 'zk-note'
        note(html, cls) {
            if (!this.el) return;
            const body = this.el.querySelector('.zk-mission-body');
            const old = body.querySelector('[data-note]');
            if (old) old.remove();
            this.el.classList.remove('collapsed');
            body.insertAdjacentHTML('beforeend', `<div class="${cls}" data-note style="margin-top:10px">${html}</div>`);
        }
    };

    const STANISLAV_ID = '2';
    const opened = new Set();

    // Popisky k jednotlivým zprávám. Stanislav + „DPD“ = jeden podvod, `other` = zpráva mimo podvodnou cestu.
    const NOTES = {
        '2': { cls: 'zk-warning', html: 'Stanislav tvrdí, že peníze pošle „přes dopravce“ a vy si je vyzvednete přes odkaz v e-mailu. Spěchá, jinak prý peníze propadnou. <b>Nátlak na čas</b> by měl vzbudit pozornost.<br><br>Otevřete zprávu od <b>DPD kurýr</b>.' },
        '1': { cls: 'zk-warning', html: 'To je slíbený e-mail. Všimněte si adresy odesílatele <b>dpd-vyplata-zasilka.info</b> a další lhůty, po které peníze prý propadnou.<br><br>Klikněte v e-mailu na odkaz <b>DPD</b>. Otevře se v nové záložce.' },
        '3': { cls: 'zk-note', other: true, html: 'Běžná odpověď: zájemce navrhuje dobírku a chce se domluvit. Neposílá žádný odkaz.' },
        '7': { cls: 'zk-note', other: true, html: 'Běžná odpověď: zájemkyně se chce domluvit na osobním odběru a zaplatit hotově.' },
        '4': { cls: 'zk-note', other: true, html: 'Běžná zpráva, s prodejem kola nesouvisí.' },
        '5': { cls: 'zk-note', other: true, html: 'Reklama, s prodejem nesouvisí.' },
        '6': { cls: 'zk-note', other: true, html: 'Běžné oznámení služby.' }
    };

    function noteHtml(note) {
        if (!note.other) return note.html;
        const next = opened.has(STANISLAV_ID) ? 'DPD kurýr' : 'Stanislava Dlouhého';
        return `${note.html}<br><br>Pokračujte zprávou od <b>${next}</b>.`;
    }

    document.addEventListener('click', (event) => {
        const item = event.target.closest('.message-item');
        if (!item) return;
        const id = item.dataset.emailId;
        const note = NOTES[id];
        opened.add(id);
        if (note) mission.note(noteHtml(note), note.cls);
    });

    waitFor('#messageList .message-item', () => {
        mission.show('Prodáváte kolo',
            'Na inzerát na prodej kola přišlo několik odpovědí. Většina je v pořádku, mezi nimi je ale i <b>pokus o podvod</b>. Podíváme se, jak funguje.');
        mission.note('Otevřete zprávu od <b>Stanislava Dlouhého</b>.', 'zk-note');

        // Panel umístíme vlevo přes seznam složek – tam nepřekáží čtení zprávy ani seznamu e-mailů.
        Object.assign(mission.el.style, {
            left: '52px', right: 'auto', width: '235px', boxSizing: 'border-box',
            maxHeight: 'calc(100vh - 110px)', overflowY: 'auto'
        });
    });
})();
