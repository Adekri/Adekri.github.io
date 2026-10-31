/* ============================================================
   Průvodce na Facebooku, první část úkolu „Podvodný e-shop“.
   Student najde sponzorovaný příspěvek a otevře odkaz (kroky 1–2).
   Kroky 3–6 pokračují na e-shopu v ../titaskin.com/tour.js.
   ?tour=0 průvodce vypne.
   ============================================================ */
(function () {
    const params = new URLSearchParams(location.search);
    if (params.get('tour') === '0') return;

    const TOTAL_STEPS = 6;
    const STORAGE_KEY = 'titaskin-tour'; // stav průvodce na e-shopu; nový průchod začíná od začátku
    const SHOP_URL = '../titaskin.com/index.html?ukol=podvod';

    const driver = window.driver.js.driver;
    let tour = null;
    let phase = null;

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

    /* ---------- panel „mise“ (nebrání práci se stránkou) ---------- */

    // Panel jde sbalit, aby nezakrýval obsah stránky.
    document.addEventListener('click', (event) => {
        const toggle = event.target.closest('.zk-mission-toggle');
        if (toggle) toggle.closest('.zk-mission').classList.toggle('collapsed');
    });

    const mission = {
        el: null,
        show(number, title, html) {
            stop();
            if (!this.el) {
                this.el = document.createElement('aside');
                this.el.className = 'zk-mission zk-tour';
                document.body.appendChild(this.el);
            }
            this.el.innerHTML = `<div class="zk-mission-head"><b>${title}</b><span>${number} / ${TOTAL_STEPS}</span>`
                + '<button type="button" class="zk-mission-toggle" aria-label="Skrýt úkol" title="Skrýt / zobrazit">–</button></div>'
                + `<div class="zk-mission-body">${html}</div>`;
            this.el.hidden = false;
            this.el.classList.remove('collapsed');
        },
        hide() {
            if (!this.el) return;
            this.el.hidden = true;
        }
    };

    /* ---------- kroky ---------- */

    function startIntro() {
        phase = 'intro';
        drive([{
            popover: {
                title: 'Podvodný e-shop',
                description: 'V tomto úkolu si ukážeme, jak se šíří podvodné e-shopy a jak je odhalit.',
                progressText: `1 / ${TOTAL_STEPS}`,
                showButtons: ['next'],
                // bublina v rohu, stránka se neztmaví (viz tour.css)
                popoverClass: 'zk-tour zk-corner',
                nextBtnText: 'Pokračovat',
                onNextClick: startFind
            }
        }]);
    }

    function startFind() {
        phase = 'find';
        mission.show(2, 'Najděte reklamu',
            'Najděte mezi příspěvky reklamu a rozklikněte ji.');
    }

    function startAdFound() {
        phase = 'adfound';
        mission.hide();
        drive([{
            element: '#adPost .fb-post-head',
            popover: {
                title: 'Výborně',
                description: 'Poznáte ji podle štítku <b>Sponzorováno</b>. Zaplatit si ji může kdokoli, i podvodník.',
                progressText: `2 / ${TOTAL_STEPS}`,
                showButtons: ['next'],
                side: 'bottom',
                nextBtnText: 'Otevřít odkaz →',
                doneBtnText: 'Otevřít odkaz →',
                onNextClick: () => {
                    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) { /* nic */ }
                    location.href = SHOP_URL;
                }
            }
        }]);
    }

    // Kliknutí na reklamu průvodce nejdřív okomentuje, teprve pak e-shop otevře.
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.ad-link')) return;
        if (phase !== 'intro' && phase !== 'find') return;
        event.preventDefault();
        startAdFound();
    }, true);

    setTimeout(startIntro, 400);
})();
