/* ============================================================
   Průvodce úkoly na e-shopu titaskin.com.
   Úkol se vybírá parametrem ?ukol=podvod (výchozí) / ?ukol=platba,
   ?tour=0 průvodce vypne.

   Úkol „Podvodný e-shop“:
   1. Na Facebooku (../facebook/, vlastní průvodce, kroky 1–2)
      student najde sponzorovaný příspěvek a otevře odkaz.
   2. Na e-shopu (index.html) najde dva varovné signály: odpočet,
      který se po obnovení spustí znovu, a nejasného provozovatele
      (reklamační řád). Signály nejsou důkaz podvodu, jen důvod
      zpozornět.
   3. Najde titaskin.com v seznamu rizikových e-shopů ČOI. FLAGem
      je datum, kdy ČOI před webem varovala (16. 07. 2021) –
      student ho zadá přímo do platformy, průvodce ho neprozrazuje
      ani nekontroluje.
   Stav se drží v sessionStorage, protože jeden ze signálů
   (odpočet) se odhaluje obnovením stránky.


   ============================================================ */
(function () {
    const params = new URLSearchParams(location.search);
    if (params.get('tour') === '0') return;
    const task = params.get('ukol') || 'podvod';
    if (task !== 'podvod') return; // průvodce placením zatím není

    const TOTAL_STEPS = 6;
    const STORAGE_KEY = 'titaskin-tour';
    const COI_URL = 'https://coi.gov.cz/pro-spotrebitele/rizikove-e-shopy/';
    // Přímý odkaz: prohlížeč odroluje na záznam a zvýrazní ho (text fragment), starší prohlížeč aspoň skočí na kotvu.
    const COI_DIRECT_URL = COI_URL + '#post-24462:~:text=titaskin.com';

    // Varovné signály, které má student na e-shopu sám najít. Žádný z nich sám o sobě podvod nedokazuje.
    const TRICKS = [
        {
            id: 'timer',
            title: 'Odpočet, který nikdy nekončí',
            hint: 'Obnovte stránku (<kbd>Ctrl</kbd>+<kbd>R</kbd> nebo ⟳) a sledujte odpočet nahoře.',
            note: 'Odpočet začal znovu od 30:00. Časově omezené nabídky vás obvykle nutí jednat unáhleně'
        },
        {
            id: 'refund',
            title: 'Kdo obchod provozuje?',
            hint: 'Otevřete v patičce <b>Reklamační řád</b>. Kam se posílá reklamace?',
            note: 'Obchod „z Brna“ reklamuje v Hongkongu a nemá IČO.',
            // vysvětlení v bublině u otevřeného dokumentu
            explainTitle: 'Brno, nebo Hongkong?',
            explain: '<ul class="zk-list">'
                + '<li>Reklama slibovala „TITASKIN Brno“, reklamace jde do Hongkongu.</li>'
                + '<li>Chybí IČO, tedy kdo obchod provozuje.</li>'
                + '<li>Záruka „24 dní“ je výmysl, zákon dává 24 měsíců.</li>'
                + '</ul>'
        }
    ];

    const NO_PROGRESS = ' '; // driver.js neumí počítadlo u jednoho kroku vypnout, tak ho nahradíme mezerou
    // Krok „rozhlédni se“: bublina sedí v rohu a stránka se neztmaví (viz tour.css).
    const LOOK = { popoverClass: 'zk-tour zk-corner', nextBtnText: 'Pokračovat' };

    const driver = window.driver.js.driver;
    let tour = null;
    let phase = null;
    let found = []; // id nalezených signálů

    /* ---------- pomocné funkce ---------- */

    function esc(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function save() {
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ phase, found })); } catch (e) { /* bez úložiště jen nepůjde navázat po obnovení stránky */ }
    }

    function load() {
        try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; }
    }

    function setPhase(name) {
        phase = name;
        save();
    }

    function stop() {
        if (!tour) return;
        const old = tour;
        const x = window.scrollX;
        const y = window.scrollY;
        tour = null;
        old.destroy();
        window.scrollTo(x, y);
    }

    function drive(steps) {
        stop();
        tour = driver({
            allowClose: false,
            allowKeyboardControl: false,
            showProgress: true,
            popoverClass: 'zk-tour',
            overlayOpacity: 0.2,
            stagePadding: 8,
            stageRadius: 10,
            nextBtnText: 'Další',
            doneBtnText: 'Další',
            steps
        });
        tour.drive();
    }

    function step(number, element, title, description, extra) {
        return {
            element,
            popover: Object.assign({
                title,
                description,
                progressText: number ? `${number} / ${TOTAL_STEPS}` : NO_PROGRESS,
                showButtons: ['next']
            }, extra)
        };
    }

    /* ---------- panel „mise“ (nebrání práci se stránkou) ---------- */

    // Panel jde sbalit, aby nezakrýval obsah stránky.
    document.addEventListener('click', (event) => {
        const toggle = event.target.closest('.zk-mission-toggle');
        if (toggle) toggle.closest('.zk-mission').classList.toggle('collapsed');
    });

    // Když se objeví patička (Kontakt, Reklamační řád…), panel se posune nad ni, aby ji nezakrýval.
    function keepAboveFooter(el) {
        const footer = document.querySelector('footer');
        if (!footer || el.hidden) return;
        const gap = window.innerWidth <= 600 ? 8 : 24; // stejné odsazení jako v tour.css
        const covered = window.innerHeight - footer.getBoundingClientRect().top;
        el.style.bottom = Math.max(gap, covered + gap) + 'px';
    }

    const mission = {
        el: null,
        show(number, title, html) {
            stop();
            if (!this.el) {
                this.el = document.createElement('aside');
                this.el.className = 'zk-mission zk-tour';
                document.body.appendChild(this.el);
                const el = this.el;
                ['scroll', 'resize'].forEach((type) => window.addEventListener(type, () => keepAboveFooter(el), { passive: true }));
            }
            this.el.innerHTML = `<div class="zk-mission-head"><b>${title}</b><span>${number} / ${TOTAL_STEPS}</span>`
                + '<button type="button" class="zk-mission-toggle" aria-label="Skrýt úkol" title="Skrýt / zobrazit">–</button></div>'
                + `<div class="zk-mission-body">${html}</div>`;
            this.el.hidden = false;
            this.el.classList.remove('collapsed');
            keepAboveFooter(this.el);
        },
        hide() {
            if (!this.el) return;
            this.el.hidden = true;
        },
        // kind: 'zk-warning' (oranžové upozornění) nebo 'zk-success' (zelené „našel jsi“)
        message(html, kind = 'zk-warning') {
            if (!this.el) return;
            this.el.querySelectorAll('.zk-warning, .zk-success').forEach((old) => old.remove());
            this.el.classList.remove('collapsed');
            this.el.querySelector('.zk-mission-body').insertAdjacentHTML('afterbegin', `<div class="${kind}">${html}</div>`);
        },
        warn(html) {
            this.message(html);
        }
    };

    /* ============================================================
       E-shop (index.html), kroky 3–6
       ============================================================ */

    function startLook() {
        setPhase('look');
        mission.hide();
        drive([step(3, undefined, 'Kam vás reklama zavedla?',
            'Vypadá to, že vás reklama zavedla na výhodný e-shop... nebo ne?',
            Object.assign({ onNextClick: startHunt }, LOOK))]);
    }

    function huntHtml() {
        const items = TRICKS.map((t) => `<li class="${found.includes(t.id) ? 'done' : ''}">`
            + `<span><b>${t.title}</b><br><small>${t.hint}</small></span></li>`).join('');
        const enough = found.length === TRICKS.length;
        return 'Najděte dva varovné signály:'
            + `<ul class="zk-checklist zk-tricks">${items}</ul>`
            + `<div class="zk-note">Nalezeno <b>${found.length} ze ${TRICKS.length}</b>.</div>`
            + (enough ? '<div class="zk-actions"><button type="button" class="zk-btn" data-next-coi>Pokračovat →</button></div>' : '');
    }

    function startHunt() {
        setPhase('hunt');
        mission.show(4, 'Co vás může upozornit?', huntHtml());
    }

    function markFound(id) {
        if (phase !== 'hunt') return;
        const trick = TRICKS.find((t) => t.id === id);
        if (!found.includes(id)) {
            found.push(id);
            save();
        }
        mission.show(4, 'Co vás může upozornit?', huntHtml());
        mission.message(`<b>${trick.title}</b><br>${trick.note}`, 'zk-success');
    }

    // Dokument z patičky se zobrazí místo produktů. Bublina u něj vysvětlí, v čem je problém;
    // panel se mezitím schová, aby nic nezakrýval, a po „Rozumím“ se vrátí s odškrtnutým signálem.
    function explainDoc(id) {
        const trick = TRICKS.find((t) => t.id === id);
        const anchor = document.querySelector('.products > div');
        mission.hide();
        drive([step(0, anchor || undefined, trick.explainTitle, trick.explain, {
            popoverClass: 'zk-tour zk-wide',
            nextBtnText: 'Rozumím',
            doneBtnText: 'Rozumím',
            onNextClick: () => { stop(); markFound(id); }
        })]);
    }

    function startCoiIntro() {
        setPhase('coi');
        mission.hide();
        drive([step(5, undefined, 'Ví o obchodu něco ČOI?',
            'Signály ještě nejsou důkaz. Ověřte si obchod v seznamu rizikových e-shopů <b>České obchodní inspekce</b>.',
            { nextBtnText: 'Jdu hledat', doneBtnText: 'Jdu hledat', onNextClick: startCoiMission })]);
    }

    function startCoiMission() {
        setPhase('coi');
        mission.show(6, 'Najděte obchod v seznamu ČOI',
            '<ol class="zk-list">'
            + '<li>Otevřete seznam (otevře se v nové záložce):'
            + `<a class="zk-site-link" href="${COI_URL}" target="_blank" rel="noopener">Rizikové e-shopy ČOI ↗</a></li>`
            + `<li>Sjeďte k nadpisu <i>Přehled dosud známých rizikových e-shopů</i> a do pole <b>Hledat</b> napište ${copyable('titaskin')}.</li>`
            + '<li>Pod popisem záznamu je v závorce datum.</li>'
            + '</ol>'
            + '<p><b>FLAG je toto datum.</b> Zadejte ho do platformy přesně tak, jak je uvedené, jen bez závorek.</p>'
            + '<div class="zk-note" data-hint><button type="button" class="zk-linkbtn" data-show-direct>Nedaří se mi záznam najít</button></div>'
            + '<div class="zk-actions"><button type="button" class="zk-btn" data-finish>Mám datum →</button></div>');
    }

    /* ---------- závěr (FLAG zadává student sám do platformy) ---------- */

    function summaryStep() {
        return step(0, undefined, 'Výborně, podvod odhalen!',
            'Datum z ČOI zadejte do platformy jako <b>FLAG</b>.'
            + '<br><br><b>Co si zapamatovat:</b><ul class="zk-list">'
            + '<li>Reklamu si může zaplatit kdokoli.</li>'
            + '<li>Nekonečný odpočet vás má jen uspěchat.</li>'
            + '<li>Zjistěte, kdo obchod provozuje a kam se reklamuje.</li>'
            + '<li>Neznámý obchod si ověřte na <b>coi.gov.cz</b>.</li></ul>',
            {
                popoverClass: 'zk-tour zk-wide',
                doneBtnText: 'Zavřít',
                nextBtnText: 'Zavřít',
                onNextClick: () => { stop(); showSummaryChip(); }
            });
    }

    function finish() {
        setPhase('done');
        mission.hide();
        drive([summaryStep()]);
    }

    function showSummaryChip() {
        if (document.querySelector('.zk-chip')) return;
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'zk-chip';
        chip.textContent = 'Zobrazit shrnutí';
        chip.addEventListener('click', () => drive([summaryStep()]));
        document.body.appendChild(chip);
    }

    // Návrat k rozdělanému kroku (např. po upozornění u platby).
    function resume() {
        if (phase === 'hunt') startHunt();
        else if (phase === 'coi') startCoiMission();
        else startLook();
    }

    // Text, který má student někam napsat: kliknutím se zkopíruje (nenápadná ikonka vedle).
    function copyable(text) {
        return `<span class="zk-copy" data-copy-text="${esc(text)}" title="Kliknutím zkopírujete"><b>${esc(text)}</b></span>`;
    }

    document.addEventListener('click', (event) => {
        const el = event.target.closest('[data-copy-text]');
        if (!el) return;
        copyText(el.dataset.copyText).then(() => {
            el.classList.add('copied');
            setTimeout(() => el.classList.remove('copied'), 1400);
        });
    });

    function copyText(text) {
        const legacy = () => {
            const area = document.createElement('textarea');
            area.value = text;
            area.style.position = 'fixed';
            area.style.opacity = '0';
            document.body.appendChild(area);
            area.select();
            document.execCommand('copy');
            area.remove();
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).catch(legacy);
        }
        return Promise.resolve(legacy());
    }

    /* ---------- napojení na události stránky ---------- */

    function initShop() {
        document.addEventListener('click', (event) => {
            if (event.target.closest('[data-next-coi]')) startCoiIntro();
            if (event.target.closest('[data-finish]')) finish();
            const direct = event.target.closest('[data-show-direct]');
            if (direct) {
                direct.closest('[data-hint]').innerHTML = `<a href="${COI_DIRECT_URL}" target="_blank" rel="noopener">Otevřít ČOI přímo u záznamu ↗</a>`;
            }
        });

        // Dokumenty z patičky, které jsou zároveň varovným signálem (ostatní dokumenty jen otevřou svůj text).
        const DOC_TRICKS = { refund: 'refund' };
        document.addEventListener('titaskin:doc', (event) => {
            if (phase !== 'hunt') return;
            const id = DOC_TRICKS[event.detail.doc];
            if (id) setTimeout(() => explainDoc(id), 100); // počká, až se dokument vykreslí
        });

        document.addEventListener('titaskin:pay', (event) => {
            if (phase === 'done') return;
            event.preventDefault();
            drive([step(0, undefined, 'Stop! ✋',
                'Nejdřív obchod prověřte.',
                { nextBtnText: 'Zpět k úkolu', doneBtnText: 'Zpět k úkolu', onNextClick: resume })]);
        });

        // Po obnovení stránky naváže, kde student skončil. Obnovení během prověřování odhalí falešný odpočet.
        setTimeout(() => {
            const saved = load();
            found = (saved.found || []).filter((id) => TRICKS.some((t) => t.id === id));
            const navigation = performance.getEntriesByType('navigation')[0];
            const reloaded = navigation && navigation.type === 'reload';
            if (saved.phase === 'done') {
                phase = 'done';
                showSummaryChip();
            } else if (saved.phase === 'coi') startCoiMission();
            else if (saved.phase === 'hunt') {
                startHunt();
                if (reloaded) markFound('timer');
            } else startLook();
        }, 400);
    }

    initShop();
})();
