/* ============================================================
   Průvodce úkolem – 1. část (stránka FreePhotoshop).
   Student má zkopírovat adresu z tlačítka Stáhnout a pokračovat
   na VirusTotal (zaklady/virustotal), kde průvodce navazuje.
   Průvodce lze vypnout parametrem ?tour=0.
   ============================================================ */
(function () {
    if (new URLSearchParams(location.search).get('tour') === '0') return;

    const TOTAL_STEPS = 13; // kroky na obou stránkách dohromady
    const VIRUSTOTAL_URL = '../virustotal/index.html';
    const STEP_RIGHT_CLICK = 1;
    const STEP_COPY = 2;
    const HELP_DELAY_MS = 15000;

    const driver = window.driver.js.driver;
    const dlBtn = document.getElementById('dlBtn');
    // Krok „rozhlédni se“: bublina sedí v rohu a stránka se neztmaví (viz tour.css).
    const LOOK_CLASS = 'zk-tour zk-corner';
    const MENU_GAP = 14; // mezera mezi bublinou a místem kliknutí
    const EDGE_GAP = 8;  // nejmenší vzdálenost bubliny od okraje okna
    let helpTimer = null;
    let menuPoint = null; // kde student klikl pravým tlačítkem

    const helpHtml = '<div class="zk-note"><button type="button" class="zk-linkbtn" data-copy>Nejde to? Zkopírovat adresu za mě</button></div>';

    const tour = driver({
        allowClose: false,
        allowKeyboardControl: false,
        showProgress: true,
        popoverClass: 'zk-tour',
        overlayOpacity: 0.5,
        stagePadding: 10,
        stageRadius: 10,
        steps: [
            {
                popover: {
                    title: 'Photoshop zdarma? 🤔',
                    description: 'Tahle stránka nabízí drahý program úplně zadarmo! A to se vyplatí! ... nebo ne?'
                        + '<br><br><b>Tvůj úkol:</b> prověřit odkaz dřív, než cokoli stáhneš.',
                    progressText: `1 / ${TOTAL_STEPS}`,
                    showButtons: ['next'],
                    nextBtnText: 'Jdeme na to',
                    popoverClass: LOOK_CLASS
                }
            },
            {
                element: '#dlBtn',
                popover: {
                    title: 'Kam tlačítko vede?',
                    description: 'Tlačítko <b>Stáhnout</b> v sobě skrývá adresu souboru. Klikni na něj <b>pravým</b> tlačítkem myši.'
                        + '<div class="zk-note">Levým ne – tím by se soubor rovnou stáhl!</div>',
                    progressText: `2 / ${TOTAL_STEPS}`,
                    showButtons: [],
                    side: 'right',
                    align: 'center'
                }
            },
            {
                element: '#dlBtn',
                popover: {
                    title: 'Zkopíruj adresu',
                    description: 'V nabídce, která se otevřela, vyber <b>Kopírovat adresu odkazu</b>.'
                        + '<ul class="zk-menu"><li>Otevřít odkaz na nové kartě</li><li>Uložit odkaz jako…</li>'
                        + '<li class="zk-menu-pick">Kopírovat adresu odkazu</li><li>Prozkoumat</li></ul>'
                        + helpHtml,
                    progressText: `3 / ${TOTAL_STEPS}`,
                    showButtons: ['next'],
                    nextBtnText: 'Mám zkopírováno →',
                    side: 'right',
                    align: 'center',
                    popoverClass: 'zk-tour zk-compact',
                    onPopoverRender: () => setTimeout(placeBesideMenu, 0)
                }
            },
            {
                popover: {
                    title: 'Kde odkaz prověřit?',
                    description: 'Podezřelé odkazy umí zdarma prověřit služba <b>VirusTotal</b>. '
                        + '<b>Klikni na její adresu:</b>'
                        // odkaz jen vypadá jako skutečná adresa, vede na výukovou kopii
                        + `<a class="zk-site-link" href="${VIRUSTOTAL_URL}">www.virustotal.com</a>`
                        + '<div class="zk-note">Až budeš příště něco prověřovat doma, '
                        + 'napíšeš ji do prohlížeče.</div>',
                    progressText: `4 / ${TOTAL_STEPS}`,
                    showButtons: []
                }
            }
        ],
        onHighlighted: () => {
            clearTimeout(helpTimer);
            placeBesideMenu();
            // Nápovědu u kroku s pravým tlačítkem nabídneme až po chvíli (např. na tabletu bez myši).
            if (tour.getActiveIndex() === STEP_RIGHT_CLICK) {
                helpTimer = setTimeout(() => {
                    const description = document.querySelector('.driver-popover-description');
                    if (description && tour.getActiveIndex() === STEP_RIGHT_CLICK && !description.querySelector('[data-copy]')) {
                        description.insertAdjacentHTML('beforeend', helpHtml);
                    }
                }, HELP_DELAY_MS);
            }
        }
    });

    function showWarning(text) {
        const description = document.querySelector('.driver-popover-description');
        if (!description) return;
        const old = description.querySelector('.zk-warning');
        if (old) old.remove();
        const warning = document.createElement('div');
        warning.className = 'zk-warning';
        warning.textContent = text;
        description.prepend(warning);
        tour.refresh(); // popover se zvětšil, ať nepřekryje tlačítko
        placeBesideMenu();
    }

    // driver se otevře vždy vlevo od kurzoru (aby se nepřekrýval se zobrazenou nabídkou)
    function placeBesideMenu() {
        const popover = document.querySelector('.driver-popover');
        if (!popover || !menuPoint || tour.getActiveIndex() !== STEP_COPY) return;
        const width = popover.offsetWidth;
        const height = popover.offsetHeight;
        const left = menuPoint.x - MENU_GAP - width;
        if (left < EDGE_GAP) return; // vlevo není místo, necháme umístění na driver.js
        const top = Math.min(Math.max(menuPoint.y - height / 2, EDGE_GAP), window.innerHeight - height - EDGE_GAP);
        Object.assign(popover.style, { left: left + 'px', top: top + 'px', right: 'auto', bottom: 'auto' });
        const arrow = popover.querySelector('.driver-popover-arrow');
        if (arrow) arrow.style.display = 'none';
    }

    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text).catch(() => legacyCopy(text));
        }
        return Promise.resolve(legacyCopy(text));
    }

    function legacyCopy(text) {
        const area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        area.remove();
    }

    // Pravé tlačítko na Stáhnout -> další krok (nabídka prohlížeče zůstane otevřená).
    dlBtn.addEventListener('contextmenu', (event) => {
        if (tour.getActiveIndex() !== STEP_RIGHT_CLICK) return;
        // klávesa pro nabídku souřadnice nedává, pak zůstane výchozí umístění
        menuPoint = event.clientX || event.clientY ? { x: event.clientX, y: event.clientY } : null;
        tour.moveNext();
    });

    window.addEventListener('resize', () => setTimeout(placeBesideMenu, 0));

    // Levé tlačítko během průvodce nic nestáhne, jen upozorní.
    document.addEventListener('click', (event) => {
        if (event.target.closest('[data-copy]')) {
            copyText(dlBtn.getAttribute('href')).then(() => {
                if (tour.getActiveIndex() === STEP_RIGHT_CLICK) tour.moveNext();
                const button = document.querySelector('.driver-popover [data-copy]');
                if (button) button.outerHTML = '<b>✔ Zkopírováno.</b> Pokračuj tlačítkem níže.';
            });
            return;
        }
        if (tour.isActive() && event.target.closest('#dlBtn')) {
            event.preventDefault();
            event.stopImmediatePropagation();
            showWarning('Stop! ✋ Takhle by sis stáhl neznámý program. Zkus to pravým tlačítkem.');
        }
    }, true);

    setTimeout(() => tour.drive(), 400);
})();
