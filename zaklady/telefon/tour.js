/* ============================================================
   Průvodce dvěma navazujícími úkoly v simulátoru telefonu:
   1. Smishing – podvodná SMS „GOV / Portál občana“, která přes
      falešnou bankovní identitu láká přihlašovací údaje.
      FLAG(VladniWebyMajiJednotnouDomenu).
   2. Dvoufaktor – útočník (Aneta) se snaží vylákat jednorázový
      ověřovací kód. FLAG(DvoufazoveOvereniNeniVse).
   Panel s instrukcí je vedle telefonu a posouvá se podle toho,
   co student udělá. FLAG se ukáže v okně průvodce.
   Průvodce lze vypnout parametrem ?tour=0.
   ============================================================ */
(function () {
    if (new URLSearchParams(location.search).get('tour') === '0') return;
    if (!window.driver || !window.driver.js) return;

    const driver = window.driver.js.driver;

    // Dva samostatné úkoly na jedné stránce. Který se má spustit, určuje ?ukol=:
    //   (nic) / 1 = smishing (podvodná SMS),  2 = dvoufaktor (Aneta a ověřovací kód).
    // Odkaz na druhý úkol (…/index.html?ukol=2) patří do zadání druhého úkolu.
    const ukol = new URLSearchParams(location.search).get('ukol') === '2' ? 2 : 1;

    // přihlašovací údaje k (cvičné) MONETA Bank – musí sedět s kontrolou ve script.js
    const BANK_ID = '1092740';
    const BANK_PASS = 'VelmiBezpecneHeslo123!';

    /* ---------- kopírování kliknutím ---------- */

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

    /* ---------- panel s instrukcí (vedle telefonu) ---------- */

    document.addEventListener('click', (event) => {
        const toggle = event.target.closest('.zk-mission-toggle');
        if (toggle) toggle.closest('.zk-mission').classList.toggle('collapsed');
    });

    const panel = {
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
        hide() { if (this.el) this.el.hidden = true; }
    };

    /* ---------- okno průvodce (úvod, FLAG) ---------- */

    let activePopup = null;

    function popup(opts) {
        activePopup = driver({
            allowClose: false, allowKeyboardControl: false,
            overlayOpacity: 0.2, stagePadding: 6, stageRadius: 8, showProgress: false,
            popoverClass: 'zk-tour',
            steps: [{ popover: opts }]
        });
        activePopup.drive();
    }

    function flagPopup(title, flag, lessonHtml, buttonText, onDone) {
        popup({
            popoverClass: 'zk-tour zk-wide',
            title,
            description: 'Tady je FLAG:'
                + '<div class="zk-flag"><code>' + esc(flag) + '</code>'
                + '<button type="button" class="zk-btn" data-copy-flag>Kopírovat</button></div>'
                + lessonHtml,
            nextBtnText: buttonText, doneBtnText: buttonText, showButtons: ['next'],
            onNextClick: () => { driveStop(); if (onDone) onDone(); },
            onPopoverRender: (pop) => {
                const btn = pop.description.querySelector('[data-copy-flag]');
                if (btn) btn.addEventListener('click', () => {
                    copyText(flag).then(() => { btn.textContent = '✔ Zkopírováno'; });
                });
            }
        });
    }

    function driveStop() {
        try { if (activePopup) activePopup.destroy(); } catch (e) { /* nic */ }
        activePopup = null;
        // pro jistotu odklidíme případné zbytky overlaye/bubliny
        document.querySelectorAll('.driver-overlay, .driver-popover').forEach((n) => n.remove());
    }

    /* ---------- kroky ---------- */

    let step = 0;
    function go(n) {
        if (n <= step && n !== 0) return;
        step = n;
        if (n === 0) {
            panel.show('Smishing – podvod přes SMS',
                'Útočníci nezneužívají jen e-maily, ale i SMS (tzv. <b>smishing</b>). V telefonu máte několik zpráv.'
                + '<div class="zk-note">Otevřete <b>nejstarší zprávu (14. 4.)</b> od odesílatele, který se vydává za státní správu (<b>GOV</b>).</div>');
        } else if (n === 1) {
            panel.show('Zpráva od „GOV“',
                'Útočník vytváří tlak – tvrdí, že máte problém s daňovým výkazem – a nutí vás kliknout na odkaz, který vypadá jako Portál občana.'
                + '<div class="zk-note">Tip: text zprávy můžete zkopírovat a vyhledat na internetu – známé podvody tak často odhalíte.</div>'
                + 'Teď <b>odkaz otevřete</b>.');
        } else if (n === 2) {
            panel.show('Falešný Portál občana',
                'Všimněte si upozornění, že přihlášení přes <b>datovou schránku</b> je prý nedostupné. Přes ni by se útočník k vašim bankovním údajům nedostal – proto vás tlačí do <b>Bankovní identity</b>.'
                + '<div class="zk-note">Zvolte <b>Bankovní identita</b>.</div>');
        } else if (n === 3) {
            panel.show('Výběr banky',
                'Vyberte svou banku – <b>Moneta</b>.');
        } else if (n === 4) {
            panel.show('Přihlášení do bankovnictví',
                'Podívejte se na adresu nahoře: <b>www.moenta-login.online.net</b>. Skutečná doména monety je ale <b>moneta.cz</b> – tohle je překlep a cizí doména, tedy podvod.'
                + '<div class="zk-note">Chcete-li vidět následek, přihlaste se těmito cvičnými údaji (<b>ne svými skutečnými!</b>) a klikněte na <b>Přihlásit</b>:<br>'
                + 'ID: ' + copyable(BANK_ID) + '<br>'
                + 'Heslo: ' + copyable(BANK_PASS) + '</div>');
        } else if (n === 5) {
            panel.show('Dvoufaktorové ověření',
                'Útočník už zná vaše heslo. Stačí mu to? K přihlášení je potřeba ještě <b>jednorázový kód</b> z telefonu – to je dvoufaktorové ověření.'
                + '<div class="zk-note">Přišly dvě zprávy: ověřovací kód z <b>Googlu</b> (i když jste se nikam nehlásili) a zpráva z neznámého čísla – od <b>Anety</b>.<br><b>Otevřete zprávu od Anety.</b></div>');
        } else if (n === 6) {
            panel.show('Zpráva od Anety',
                'Aneta tvrdí, že omylem zadala vaše číslo, a prosí o kód, který vám přišel. Může mluvit pravdu? <b>Ne</b> – ověřovací kód chodí jen tomu, kdo se zrovna přihlašuje vaším jménem.'
                + '<div class="zk-note">Odpovězte Anetě – rozmyslete si, co jí napíšete.</div>');
        }
    }

    /* ---------- reakce na akce v telefonu ---------- */

    document.addEventListener('click', (event) => {
        const conv = event.target.closest('.conversation');
        if (conv) {
            if (conv.dataset.chat === 'gov' && step === 0) go(1);
            else if (conv.dataset.chat === 'aneta' && step === 5) go(6);
            return;
        }
        const link = event.target.closest('.sms-link');
        if (link) {
            if (link.dataset.page === 'gov' && step === 1) setTimeout(() => go(2), 80);
            else if (link.dataset.page === 'moneta-login' && step === 3) setTimeout(() => go(4), 80);
            return;
        }
        if (event.target.closest('#bankovniIdentitaBtn') && step === 2) setTimeout(() => go(3), 80);
    });

    document.addEventListener('telefon:login', (event) => {
        event.preventDefault();
        panel.hide();
        flagPopup('Úkol splněn', 'FLAG(VladniWebyMajiJednotnouDomenu)',
            '<b>Co si zapamatovat:</b><ul class="zk-list">'
            + '<li>Státní weby mají <b>jednotnou doménu gov.cz</b> – Portál občana je na <b>obcan.gov.cz</b>, ne na „obcan.cz-gov.net“.</li>'
            + '<li>Tlak a strašení („problém s daňovým výkazem“) mají zabránit tomu, abyste přemýšleli.</li>'
            + '<li>Vždy zkontrolujte adresu v prohlížeči, než zadáte přihlašovací údaje.</li>'
            + '</ul>',
            'Zavřít');
    });

    document.addEventListener('telefon:aneta', (event) => {
        event.preventDefault();
        panel.hide();
        const sentCode = event.detail && event.detail.sentCode;
        const lead = sentCode
            ? '<div class="zk-warning">Odeslali jste Anetě ověřovací kód – tím by útočník dokončil přihlášení k vašemu účtu. Příště kód neposílejte.</div>'
            : '<div class="zk-success">Kód jste Anetě neposlali, a tím jste pokus o obejití dvoufaktoru odrazili.</div>';
        flagPopup('Úkol splněn', 'FLAG(DvoufazoveOvereniNeniVse)',
            lead
            + '<b>Co si zapamatovat:</b><ul class="zk-list">'
            + '<li>Jednorázový ověřovací kód <b>nikdy nikomu neposílejte</b>.</li>'
            + '<li>Dvoufaktor chrání, jen dokud kód zůstane u vás. Jakmile ho pošlete, útočník se s vaším heslem přihlásí.</li>'
            + '<li>Banka ani Google po vás kód přes SMS nebo telefon nikdy nechtějí.</li>'
            + '</ul>',
            'Zavřít');
    });

    /* ---------- start ---------- */

    setTimeout(() => {
        // úvodní okno podle toho, který úkol se spouští; pak panel s prvním krokem
        if (ukol === 2) {
            popup({
                popoverClass: 'zk-tour zk-corner',
                title: 'Dvoufaktorové ověření (2FA)',
                description: 'V tomto úkolu si ukážeme, jak se útočník snaží obejít <b>dvoufaktorové ověření</b> – tedy vylákat jednorázový kód, který vám přišel do telefonu.',
                nextBtnText: 'Začít', doneBtnText: 'Začít', showButtons: ['next'],
                onNextClick: () => { driveStop(); go(5); }
            });
        } else {
            popup({
                popoverClass: 'zk-tour zk-corner',
                title: 'Smishing (podvod přes SMS)',
                description: 'V tomto úkolu si ukážeme, jak útočníci zneužívají <b>SMS zprávy</b>, aby z vás vylákali přihlašovací údaje.',
                nextBtnText: 'Začít', doneBtnText: 'Začít', showButtons: ['next'],
                onNextClick: () => { driveStop(); go(0); }
            });
        }
    }, 400);
})();
