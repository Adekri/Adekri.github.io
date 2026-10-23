/* ============================================================
   Průvodce úkolem „Cizí jazyk za 2 týdny“ (podvodný web).
   1. Na Facebooku (index.html) student najde sponzorovaný
      příspěvek a otevře odkaz.
   2. Na podvodném článku (web.html, kopie originálu
      z youreduspace.com) sám prověří jeho triky: odpočet akce,
      komentáře, odborník a provozovatel. Stačí 3 ze 4.
   3. Najde web v seznamu rizikových e-shopů ČOI. FLAGem je rok,
      kdy ČOI před webem varovala (2020) – student ho zadá přímo
      do platformy, průvodce ho neprozrazuje ani nekontroluje.
   Stav se drží v sessionStorage, protože jeden z triků
   (odpočet) se odhaluje obnovením stránky.
   Průvodce lze vypnout parametrem ?tour=0.
   ============================================================ */
(function () {
    if (new URLSearchParams(location.search).get('tour') === '0') return;

    const TOTAL_STEPS = 6;
    const STORAGE_KEY = 'lingfluent-tour';
    const WEB_URL = 'web.html';
    const COI_URL = 'https://coi.gov.cz/pro-spotrebitele/rizikove-e-shopy/';
    // Přímý odkaz: prohlížeč odroluje na záznam a zvýrazní ho (text fragment), starší prohlížeč aspoň skočí na kotvu.
    const COI_DIRECT_URL = COI_URL + '#post-21246:~:text=youreduspace.com';
    // FLAG: záznam youreduspace.com/420/lingfluent-med/ je z 05. 07. 2020. Pozor na druhý záznam
    // o stejném výrobku (lingfluent.com/cs/, 17. 09. 2019) – na ten průvodce upozorňuje.
    const TRICKS_NEEDED = 3;

    // Triky, které má student na webu sám prověřit.
    const TRICKS = [
        {
            id: 'timer',
            title: '⏰ Odpočet akce',
            hint: 'Podívejte se na odpočet v pruhu nahoře. Pak obnovte stránku (<kbd>Ctrl</kbd>+<kbd>R</kbd>, <kbd>F5</kbd> nebo tlačítko ⟳ vlevo od adresy v horní liště prohlížeče) a sledujte, co se s ním stane.',
            note: 'Po obnovení začal odpočet znovu od 14:59. Akce nikdy neskončí. Odpočet vás má jen donutit rozhodnout se rychle a nepřemýšlet.'
        },
        {
            id: 'comments',
            title: '💬 Komentáře',
            hint: 'Zkuste u komentáře kliknout na <i>To se mi líbí</i> nebo <i>Odpovědět</i>.',
            note: 'Komentáře jsou jen text napodobující Facebook. Nikdo je nenapsal a nikdo na ně nemůže odpovědět.'
        },
        {
            id: 'expert',
            title: '🎓 Odborník',
            hint: 'Klikněte na fotku Lea Anderse a vyhledejte ji na internetu.',
            note: 'Fotka je z fotobanky a „Leo Anders“ neexistuje. Stejně tak „paní Monika“ v pravém sloupci.'
        },
        {
            id: 'operator',
            title: '🏢 Prodávající',
            hint: 'Otevřete obchodní podmínky (odkaz je v patičce) a zjistěte, kdo vám kartičky prodá.',
            note: 'Prodávající sídlí v Číně. Zboží vrátíte jen neotevřené do 7 dní a na vlastní náklady do Číny, spory řeší soud v Shenzhenu. '
                + 'A „zaručené“ výsledky z článku? Podle podmínek prodávající nezaručuje nic.'
        }
    ];

    const NO_PROGRESS = ' '; // driver.js neumí počítadlo u jednoho kroku vypnout, tak ho nahradíme mezerou
    // Krok „rozhlédni se“: bublina sedí v rohu a stránka se neztmaví (viz tour.css).
    const LOOK = { popoverClass: 'zk-tour zk-corner', nextBtnText: 'Pokračovat' };

    const driver = window.driver.js.driver;
    const page = document.body.dataset.page; // 'feed' | 'web'
    let tour = null;
    let phase = null;
    let found = []; // id nalezených triků

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
            overlayOpacity: 0.5,
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

    // Okno s vysvětlením nalezeného triku; po zavření se trik odškrtne.
    function evidence(id, title, html) {
        drive([step(0, undefined, title, html, {
            popoverClass: 'zk-tour zk-wide',
            nextBtnText: 'Rozumím',
            doneBtnText: 'Rozumím',
            onNextClick: () => { stop(); markFound(id); }
        })]);
    }

    /* ---------- panel „mise“ (nebrání práci se stránkou) ---------- */

    // Panel jde sbalit, aby nezakrýval obsah stránky.
    document.addEventListener('click', (event) => {
        const toggle = event.target.closest('.zk-mission-toggle');
        if (toggle) toggle.closest('.zk-mission').classList.toggle('collapsed');
    });

    // Když se objeví patička (Kontakt, Obchodní podmínky), panel se posune nad ni, aby ji nezakrýval.
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
       Facebook (index.html), kroky 1–2
       ============================================================ */

    function startFeedIntro() {
        phase = 'intro';
        drive([step(1, undefined, 'Facebook',
            'Prohlížíte si příspěvky kamarádů. Mezi nimi se ale schovává jeden, který vám nenapsal nikdo z přátel.'
            + '<div class="zk-note">Je to výuková kopie Facebooku, nic tu nikam neodchází.</div>',
            Object.assign({ onNextClick: startFind }, LOOK))]);
    }

    function startFind() {
        phase = 'find';
        mission.show(2, 'Najděte reklamu',
            'Najděte příspěvek, který není od vašich přátel, a klikněte na odkaz v něm.');
    }

    function startAdFound() {
        phase = 'adfound';
        mission.hide();
        drive([step(2, '#adPost .fb-post-head', 'Tohle je reklama',
            'Poznáte ji podle štítku <b>Sponzorováno</b>. Reklamu si může zaplatit kdokoli, i podvodník. '
            + 'Facebook obsah reklam pečlivě nekontroluje.'
            + '<br><br>Podívejme se, kam reklama vede.',
            {
                side: 'bottom',
                nextBtnText: 'Otevřít odkaz →',
                doneBtnText: 'Otevřít odkaz →',
                onNextClick: () => { location.href = WEB_URL; }
            })]);
    }

    function initFeed() {
        // Kliknutí na reklamu průvodce nejdřív okomentuje, teprve pak web otevře.
        document.addEventListener('click', (event) => {
            if (!event.target.closest('.ad-link')) return;
            if (phase !== 'intro' && phase !== 'find') return;
            event.preventDefault();
            startAdFound();
        }, true);

        setTimeout(startFeedIntro, 400);
    }

    /* ============================================================
       Podvodný článek (web.html), kroky 3–6
       ============================================================ */

    function startLook() {
        setPhase('look');
        mission.hide();
        drive([step(3, undefined, 'Kam vás reklama zavedla?',
            'Vypadá to jako článek ve vědeckém časopise. Projděte si stránku až dolů.'
            + '<div class="zk-note">Je to věrná kopie skutečného podvodného webu <b>youreduspace.com</b>.</div>',
            Object.assign({ onNextClick: startHunt }, LOOK))]);
    }

    function huntHtml() {
        const items = TRICKS.map((t) => `<li class="${found.includes(t.id) ? 'done' : ''}">`
            + `<span><b>${t.title}</b><br><small>${t.hint}</small></span></li>`).join('');
        const enough = found.length >= TRICKS_NEEDED;
        return 'Web vás chce za každou cenu přesvědčit k nákupu. Prověřte jeho triky:'
            + `<ul class="zk-checklist zk-tricks">${items}</ul>`
            + `<div class="zk-note">Prověřeno <b>${found.length} ze ${TRICKS.length}</b>. Stačí ${TRICKS_NEEDED}.</div>`
            + (enough ? '<div class="zk-actions"><button type="button" class="zk-btn" data-next-coi>Pokračovat →</button></div>' : '');
    }

    function startHunt() {
        setPhase('hunt');
        mission.show(4, 'Odhalte triky webu', huntHtml());
    }

    function markFound(id) {
        if (phase !== 'hunt') return;
        const trick = TRICKS.find((t) => t.id === id);
        if (!found.includes(id)) {
            found.push(id);
            save();
        }
        mission.show(4, 'Odhalte triky webu', huntHtml());
        mission.message(`<b>${trick.title}</b><br>${trick.note}`, 'zk-success');
    }

    function startCommentsEvidence() {
        evidence('comments', '💬 Na komentáře nejde reagovat',
            'Kliknutí nic neudělalo. Komentáře nejsou skutečné, je to jen text a obrázky, které napodobují komentáře z Facebooku.'
            + '<ul class="zk-list">'
            + '<li>Nejde přidat komentář, odpovědět ani dát „To se mi líbí“.</li>'
            + '<li>Čas „před 12 minutami“ se nikdy nezmění, ani zítra.</li>'
            + '<li>Skoro všichni výrobek chválí a jeden skeptik („zase zázračné metody…“) je tam jen proto, aby to vypadalo věrohodně.</li>'
            + '</ul>');
    }

    // Napodobenina vyhledávání podle obrázku (ve skutečném prohlížeči: pravé tlačítko → Hledat obrázek).
    function startImageSearch() {
        const result = (title, site) => '<li><img src="img/leo-anders.jpg" alt="">'
            + `<div><b>${title}</b><small>${site}</small></div></li>`;
        evidence('expert', '🔍 Vyhledávání podle obrázku',
            'Stejná fotka se našla na těchto stránkách:'
            + '<ul class="zk-results">'
            + result('Senior s plnovousem pracuje doma na notebooku – fotografie ke stažení', 'fotobanka · licence od 9 €')
            + result('Jak se senioři učí na internetu – ilustrační foto', 'blog o vzdělávání')
            + result('Pojištění pro aktivní důchodce', 'reklama pojišťovny')
            + '</ul>'
            + '<div class="zk-note">Doma to zkusíte takhle: klikněte na obrázek <b>pravým tlačítkem</b> a vyberte <b>Hledat obrázek</b> (Google Lens) '
            + 'nebo <b>Vyhledat obrázek pomocí Bingu</b>. Výsledky tady jsou ukázkové.</div>');
    }

    function startCoiIntro() {
        setPhase('coi');
        mission.hide();
        drive([step(5, undefined, 'Ví o webu něco ČOI?',
            'Triky jste odhalili. Teď si web ověřte u nezávislého zdroje.'
            + '<br><br><b>Česká obchodní inspekce (ČOI)</b> vede seznam rizikových e-shopů, před kterými varuje. '
            + 'Najděte v něm záznam o webu <b>youreduspace.com</b>.',
            { nextBtnText: 'Jdu hledat', doneBtnText: 'Jdu hledat', onNextClick: startCoiMission })]);
    }

    function startCoiMission() {
        setPhase('coi');
        mission.show(6, 'Najděte web v seznamu ČOI',
            `<a class="zk-site-link" href="${COI_URL}" target="_blank" rel="noopener">Rizikové e-shopy ČOI ↗</a>`
            + `<div class="zk-note">Stránka se otevře v nové záložce. Do pole <b>Hledat</b> napište ${copyable('youreduspace')}, `
            + 'nebo použijte <kbd>Ctrl</kbd>+<kbd>F</kbd>.</div>'
            + '<p><b>FLAG je rok, kdy ČOI před webem youreduspace.com varovala.</b> Datum najdete v závorce pod popisem záznamu. '
            + 'Rok zadejte do platformy.</p>'
            + '<div class="zk-note">Pozor: o stejném výrobku jsou v seznamu dva záznamy. Hledáte ten, který začíná <b>youreduspace.com</b>.</div>'
            + '<div class="zk-note" data-hint><button type="button" class="zk-linkbtn" data-show-direct>Nedaří se mi záznam najít</button></div>'
            + '<div class="zk-actions"><button type="button" class="zk-btn" data-finish>Mám rok →</button></div>');
    }

    /* ---------- závěr (FLAG zadává student sám do platformy) ---------- */

    function summaryStep() {
        return step(0, undefined, 'Výborně, podvod odhalen!',
            'Rok, který jste našli v seznamu ČOI, zadejte do platformy jako <b>FLAG</b>.'
            + '<br><br><b>Co si zapamatovat:</b><ul class="zk-list">'
            + '<li>Reklamu na sociální síti si může zaplatit kdokoli, i podvodník.</li>'
            + '<li>Odpočet „akce končí za…“ vás má jen uspěchat. Obnovte stránku a uvidíte, jestli opravdu končí.</li>'
            + '<li>Komentáře, recenze i „odborníky“ jde snadno vymyslet. Fotku si ověříte vyhledáváním podle obrázku.</li>'
            + '<li>Vždy si přečtěte obchodní podmínky a zjistěte, kdo vám zboží prodává. U prodávajícího mimo EU reklamaci prakticky nevymůžete.</li>'
            + '<li>Než nakoupíte na neznámém webu, podívejte se do seznamu rizikových e-shopů na <b>coi.gov.cz</b>.</li>'
            + '<li>Zázračné metody „bez biflování“ neexistují.</li></ul>',
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

    // Návrat k rozdělanému kroku (např. po upozornění u objednávky).
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

    function initWeb() {
        document.addEventListener('click', (event) => {
            if (event.target.closest('[data-next-coi]')) startCoiIntro();
            if (event.target.closest('[data-finish]')) finish();
            const direct = event.target.closest('[data-show-direct]');
            if (direct) {
                direct.closest('[data-hint]').innerHTML = `<a href="${COI_DIRECT_URL}" target="_blank" rel="noopener">Otevřít ČOI přímo u záznamu ↗</a>`
                    + '<br>Stránka odroluje k záznamu a zvýrazní ho.';
            }
        });

        document.getElementById('expertPhoto').addEventListener('click', () => {
            if (phase === 'hunt') startImageSearch();
        });

        document.addEventListener('lingfluent:fb', () => {
            if (phase === 'hunt') startCommentsEvidence();
        });

        // Obchodní podmínky: panel se sbalí, aby je nezakrýval, a trik se odškrtne až po jejich zavření.
        let termsOpen = false;
        document.addEventListener('lingfluent:doc', (event) => {
            if (phase !== 'hunt') return;
            if (event.detail.doc === 'terms') {
                termsOpen = true;
                if (mission.el) mission.el.classList.add('collapsed');
            } else mission.warn('V kontaktu je jen e-mail. Kdo vám kartičky prodá, zjistíte v <b>obchodních podmínkách</b>.');
        });

        document.addEventListener('lingfluent:close', () => {
            if (!termsOpen) return;
            termsOpen = false;
            markFound('operator');
        });

        document.addEventListener('lingfluent:order', (event) => {
            if (phase === 'done') return;
            event.preventDefault();
            drive([step(0, undefined, 'Stop! ✋',
                'Právě byste neznámo komu poslali své jméno, telefon a adresu. Takové kontakty se prodávají dál '
                + 'a pak vám volají „konzultanti“ s dalšími nabídkami.<br><br>Nejdřív web prověřte.',
                { nextBtnText: 'Zpět k úkolu', doneBtnText: 'Zpět k úkolu', onNextClick: resume })]);
        });

        // Po obnovení stránky naváže, kde student skončil. Obnovení během hledání triků odhalí falešný odpočet.
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

    if (page === 'feed') initFeed();
    else initWeb();
})();
