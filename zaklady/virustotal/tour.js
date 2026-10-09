/* ============================================================
   Průvodce úkolem – 2. část (VirusTotal).
   Navazuje na zaklady/photoshop/tour.js. Student vloží adresu
   z tlačítka Stáhnout, projde výsledek a po správné odpovědi
   na závěrečnou otázku se mu zobrazí vlajka.
   Průvodce lze vypnout parametrem ?tour=0.
   ============================================================ */
(function () {
    if (new URLSearchParams(location.search).get('tour') === '0') return;

    const FLAG = 'FLAG(NestahujCoNeznas)';
    const TOTAL_STEPS = 13; // kroky na obou stránkách dohromady
    const PHOTOSHOP_URL = '../photoshop/freephotoshop.html';
    const VENDOR_ROWS_SHOWN = 12; // kolik řádků seznamu antivirů průvodce zvýrazní

    const NO_PROGRESS = ' '; // driver.js neumí počítadlo u jednoho kroku vypnout, tak ho nahradíme mezerou

    // Krok „rozhlédni se“: bublina sedí v rohu a stránka se neztmaví (viz tour.css).
    const LOOK = { popoverClass: 'zk-tour zk-corner', nextBtnText: 'Pokračovat' };
    const HOME_STEP_TAB = 1;
    const HOME_STEP_PASTE = 2;
    const REPORT_STEP_COMMUNITY = 3;

    const driver = window.driver.js.driver;
    let tour = null;
    let phase = null; // 'home' | 'report' | 'wrong' | 'flag'
    let finished = false;

    const isReportHash = () => location.hash.startsWith('#/url/');

    function esc(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function stop() {
        if (!tour) return;
        const old = tour;
        tour = null;
        phase = null;
        old.destroy();
    }

    function start(newPhase, steps, index) {
        stop();
        phase = newPhase;
        tour = driver({
            allowClose: false,
            allowKeyboardControl: false,
            showProgress: true,
            popoverClass: 'zk-tour',
            overlayOpacity: 0.5,
            stagePadding: 8,
            stageRadius: 8,
            nextBtnText: 'Další',
            doneBtnText: 'Další',
            steps
        });
        tour.drive(index || 0);
    }

    // Krok s číslem; kroky bez čísla (chyba, vlajka) si popover skládají samy.
    function step(number, element, title, description, extra) {
        return {
            element,
            popover: Object.assign({
                title,
                description,
                progressText: `${number} / ${TOTAL_STEPS}`,
                showButtons: ['next']
            }, extra)
        };
    }

    /* ---------- úvodní stránka ---------- */

    function startHome() {
        if (finished) return;
        const urlTabActive = document.querySelector('.home-tab.active').dataset.tab === 'url';
        start('home', [
            step(5, undefined, 'Tohle je VirusTotal',
                'Zdarma prověří soubor nebo odkaz u desítek antivirů najednou.',LOOK),
            step(6, '[data-tour="tab-url"]', 'Prověříme odkaz',
                'Nechceme nahrávat soubor, ale prověřit <b>odkaz</b>. Klikni na záložku <b>URL</b>.',
                { showButtons: [], side: 'bottom' }),
            step(7, '#urlForm', 'Vlož zkopírovanou adresu',
                'Klikni do pole, zmáčkni <kbd>Ctrl</kbd> + <kbd>V</kbd> a potvrď klávesou <kbd>Enter</kbd>.'
                + `<div class="zk-note">Nemáš nic zkopírováno? <a href="${PHOTOSHOP_URL}">Vrať se pro adresu.</a></div>`,
                {
                    showButtons: [],
                    side: 'bottom',
                    onPopoverRender: () => setTimeout(() => document.getElementById('urlInput').focus(), 450)
                })
        ], urlTabActive ? HOME_STEP_PASTE : 0);
    }

    /* ---------- špatná adresa ---------- */

    function startWrong(kind, query) {
        const reason = kind === 'clean'
            ? 'Tahle stránka je v pořádku – ale my chceme prověřit odkaz z tlačítka <b>Stáhnout</b>.'
            : 'Tuhle adresu VirusTotal nezná. Nejspíš se nezkopírovala celá.';
        start('wrong', [{
            popover: {
                title: 'Tohle není ta adresa 🙈',
                description: `Zadaná adresa:<br><b class="zk-address">${esc(query)}</b><br><br>${reason}`
                    + '<div class="zk-note">Správná adresa začíná na <b>http://free-photoshop</b></div>'
                    + '<div class="zk-actions">'
                    + '<button type="button" class="zk-btn" data-retry>Zkusit znovu</button>'
                    + `<a class="zk-btn zk-btn-light" href="${PHOTOSHOP_URL}">Zpět pro adresu</a></div>`,
                progressText: NO_PROGRESS,
                showButtons: [],
                onPopoverRender: (popover) => {
                    // návrat na úvod spustí hashchange, který průvodce vrátí ke kroku s vložením adresy
                    popover.description.querySelector('[data-retry]').addEventListener('click', () => {
                        location.hash = '#/';
                    });
                }
            }
        }]);
    }

    /* ---------- výsledek ---------- */

    // Seznam antivirů je delší než obrazovka, proto zvýrazníme jen jeho začátek.
    function vendorSpot() {
        const box = document.querySelector('[data-tour="vendors"]');
        let spot = box.querySelector('.zk-spot');
        if (!spot) {
            spot = document.createElement('div');
            spot.className = 'zk-spot';
            box.style.position = 'relative';
            box.appendChild(spot);
        }
        const rows = box.querySelectorAll('.vendor');
        const last = rows[Math.min(VENDOR_ROWS_SHOWN, rows.length) - 1];
        spot.style.height = (last.offsetTop + last.offsetHeight) + 'px';
        return spot;
    }

    function flagStep() {
        return {
            popover: {
                title: 'Výborně, úkol splněn!',
                description: 'Tady je FLAG:'
                    + `<div class="zk-flag"><code>${esc(FLAG)}</code>`
                    + '<button type="button" class="zk-btn" data-copy-flag>Kopírovat</button></div>'
                    + '<b>Co si zapamatovat:</b><ul class="zk-list">'
                    + '<li>Placený program „zdarma“ bývá past.</li>'
                    + '<li>Odkaz si před stažením prověř na <b>virustotal.com</b>.</li>'
                    + '<li>Programy stahuj jen z oficiálních stránek výrobce.</li></ul>',
                progressText: NO_PROGRESS,
                showButtons: ['next'],
                doneBtnText: 'Zavřít',
                onNextClick: () => {
                    finished = true;
                    stop();
                    showFlagChip();
                },
                onPopoverRender: (popover) => {
                    const button = popover.description.querySelector('[data-copy-flag]');
                    button.addEventListener('click', () => {
                        copyText(FLAG).then(() => { button.textContent = '✔ Zkopírováno'; });
                    });
                }
            }
        };
    }

    function startReport(detail) {
        start('report', [
            step(8, undefined, 'Analýza dokončena!',
                'Takhle vypadá zpráva o prověřeném odkazu.',
                LOOK),
            step(9, '[data-tour="score"]', 'Výsledek kontroly',
                `<b>${detail.detections} z ${detail.total}</b> antivirů označilo odkaz za nebezpečný.`
                + '<br><br>U bezpečné stránky by tu svítila zelená nula.'),
            step(10, vendorSpot, 'Seznam antivirů, které detekovaly hrozbu',
                'Červené <b>Malware</b> nebo <b>Malicious</b> znamená škodlivý soubor.',
                { side: 'top' }),
            step(11, '[data-tour="rtab-community"]', 'Co na to ostatní?',
                'Klikni na záložku <b>COMMUNITY</b> a podívej se, co o odkazu napsali lidé.',
                { showButtons: [], side: 'bottom' }),
            step(12, '#commentsSection', 'Varování od odborníků',
                'Lidé, kteří soubor zkoumali, píšou, že jde o <b>falešný instalátor</b>, který krade hesla.',
                { side: 'top' }),
            step(13, undefined, 'Tak co, stáhneš si ho? 🤔',
                'Teď už víš o odkazu dost. Jak se rozhodneš?'
                + '<div class="zk-actions">'
                + '<button type="button" class="zk-btn" data-answer="no">Ne, raději si najdu oficiální zdroj</button>'
                + '<button type="button" class="zk-btn zk-btn-light" data-answer="yes">Ano, nějakého odkazu se nebojím</button></div>',
                {
                    showButtons: [],
                    onPopoverRender: (popover) => {
                        popover.description.addEventListener('click', (event) => {
                            const answer = event.target.dataset.answer;
                            if (answer === 'no') {
                                phase = 'flag';
                                tour.moveNext();
                            } else if (answer === 'yes') {
                                const old = popover.description.querySelector('.zk-warning');
                                if (old) old.remove();
                                popover.description.insertAdjacentHTML('afterbegin',
                                    '<div class="zk-warning">Raději ne! ✋ Program by ti mohl ukrást hesla. Zkus to znovu.</div>');
                            }
                        });
                    }
                }),
            flagStep()
        ]);
    }

    function showFlagChip() {
        if (document.querySelector('.zk-chip')) return;
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'zk-chip';
        chip.textContent = 'Zobrazit FLAG';
        chip.addEventListener('click', () => start('flag', [flagStep()]));
        document.body.appendChild(chip);
    }

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

    document.addEventListener('vt:tab', (event) => {
        if (phase === 'home' && tour.getActiveIndex() === HOME_STEP_TAB && event.detail.tab === 'url') tour.moveNext();
    });

    document.addEventListener('vt:rtab', (event) => {
        if (phase === 'report' && tour.getActiveIndex() === REPORT_STEP_COMMUNITY && event.detail.tab === 'community') tour.moveNext();
    });

    document.addEventListener('vt:report', (event) => {
        if (finished) return;
        if (event.detail.report.malicious) startReport(event.detail);
        else startWrong('clean', event.detail.query);
    });

    document.addEventListener('vt:notfound', (event) => {
        if (!finished) startWrong('notfound', event.detail.query);
    });

    // Odeslání adresy i tlačítko Zpět mění hash: během načítání průvodce schováme.
    window.addEventListener('hashchange', () => {
        if (isReportHash()) stop();
        else startHome();
    });

    if (!isReportHash()) setTimeout(startHome, 400);
})();
