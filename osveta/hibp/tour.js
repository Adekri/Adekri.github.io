/* ============================================================
   Průvodce úkolem s ukázkovým účtem „Pepy“ (Have I Been Pwned).
   1. Student vyhledá Pepův e-mail a sám najde únik, ve kterém
      uniklo i heslo.
   2. Na stránce Passwords prověří hesla z Pepova sešitu.
   3. Vymyslí Pepovi nové heslo podle zásad z CIS/Strong_password
      (povinně aspoň 15 znaků a heslo neuniklo) a dostane FLAG.
   Kroky, kde má student volně procházet stránku, nepoužívají
   driver.js (ztmavil by stránku), ale panel „mise“ v rohu.
   Průvodce lze vypnout parametrem ?tour=0.
   ============================================================ */
(function () {
    if (new URLSearchParams(location.search).get('tour') === '0') return;

    const FLAG = 'FLAG(KazdyUcetJineHeslo)';
    const TOTAL_STEPS = 9;
    const PEPA_EMAIL = 'pepa.zdepa@example.com';
    const PEPA_PASSWORDS = ['pepa123', 'fotbal', 'Sparta2010'];
    // kde Pepa které heslo používá (poznámka na papírku)
    const PEPA_USES = { pepa123: 'hry', fotbal: 'e-mail', Sparta2010: 'škola' };

    // Ruční písmo pro Pepův papírek s hesly (stejně jako písmo stránky z Google Fonts).
    const handFont = document.createElement('link');
    handFont.rel = 'stylesheet';
    handFont.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap';
    document.head.appendChild(handFont);
    const EXAMPLE_PASSPHRASE = 'žirafa-kolo-polévka';
    const MIN_LENGTH = 15;
    // o kolik px pod horním okrajem okna má být pole pro heslo; panel s pravidly nového hesla je vyšší, proto výš
    const FORM_TOP_GAP = { pwcheck: 110, challenge: 30 };
    const STORAGE_KEY = 'hibp-tour';

    const NO_PROGRESS = ' '; // driver.js neumí počítadlo u jednoho kroku vypnout, tak ho nahradíme mezerou
    // Krok „rozhlédni se“: bublina sedí v rohu a stránka se neztmaví (viz tour.css).
    const LOOK = { popoverClass: 'zk-tour zk-corner', nextBtnText: 'Pokračovat' };

    const driver = window.driver.js.driver;
    let tour = null;
    let phase = null;
    let checked = {}; // heslo z Pepova sešitu -> kolikrát uniklo

    /* ---------- pomocné funkce ---------- */

    function esc(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function save() {
        try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ phase, checked })); } catch (e) { /* bez úložiště jen nepůjde navázat po obnovení stránky */ }
    }

    function load() {
        try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; }
    }

    function setPhase(name) {
        phase = name;
        save();
    }

    // driver.js po skončení vrací fokus na prvek, který ho měl předtím (třeba pole pro e-mail),
    // a prohlížeč by k němu stránku odroloval. Polohu stránky proto vrátíme zpět.
    function stop() {
        if (!tour) return;
        const old = tour;
        const x = window.scrollX;
        const y = window.scrollY;
        tour = null;
        old.destroy();
        window.scrollTo(x, y);
    }

    // Počká, až se stránka dorolluje (výsledky se k sobě posouvají plynule), nejdéle maxMs.
    function afterScroll(callback, maxMs = 1500) {
        let done = false;
        let timer = null;
        const finish = () => {
            if (done) return;
            done = true;
            window.removeEventListener('scroll', onScroll);
            callback();
        };
        const onScroll = () => {
            clearTimeout(timer);
            timer = setTimeout(finish, 150);
        };
        window.addEventListener('scroll', onScroll);
        timer = setTimeout(finish, 300); // když se nerolluje vůbec
        setTimeout(finish, maxMs);
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
            stageRadius: 14,
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

    function goTo(page) {
        const hash = page === 'passwords' ? '#/passwords' : '#/';
        if (location.hash !== hash && !(page === 'home' && location.hash === '')) location.hash = hash;
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
            if (this.el) this.el.hidden = true;
        },
        warn(html) {
            if (!this.el) return;
            const old = this.el.querySelector('.zk-warning');
            if (old) old.remove();
            this.el.classList.remove('collapsed');
            this.el.querySelector('.zk-mission-body').insertAdjacentHTML('afterbegin', `<div class="zk-warning">${html}</div>`);
        },
        find(sel) {
            return this.el ? this.el.querySelector(sel) : null;
        }
    };

    /* ---------- 1.–3. e-mail ---------- */

    function startIntro() {
        setPhase('intro');
        goTo('home');
        drive([step(1, undefined, '',
            'Na stránce <b>Have I Been Pwned</b> zjistíte, jestli se něčí e-mail nebo heslo objevilo v úniku dat.'
            + '<div class="zk-note">Ve skutečnosti ji najdete na adrese <b>haveibeenpwned.com</b>. Tady pracujete s její kopií.</div>',
            Object.assign({ onNextClick: startEmail }, LOOK))]);
    }

    function startEmail() {
        setPhase('email');
        mission.hide();
        goTo('home');
        drive([step(2, '#accountForm', 'Zkontrolujte Pepův e-mail',
            `Napište do pole ${copyable(PEPA_EMAIL)} a klikněte na <b>Check</b>.`,
            {
                showButtons: [],
                side: 'bottom',
                onPopoverRender: () => setTimeout(() => document.getElementById('accountInput').focus(), 450)
            })]);
    }

    function startWrongEmail(email) {
        setPhase('wrong-email');
        drive([step(0, undefined, 'Tenhle e-mail neznáme 🙈',
            `Zadaný e-mail:<br><b class="zk-address">${esc(email)}</b><br><br>`
            + `Pepův e-mail je ${copyable(PEPA_EMAIL)}. Zkontrolujte, že je napsaný přesně, i s tečkou a zavináčem.`,
            { nextBtnText: 'Zkusit znovu', doneBtnText: 'Zkusit znovu', onNextClick: startEmail })]);
    }

    function startSummary(count) {
        setPhase('summary');
        drive([step(3, '#breachSummary', 'Výsledek kontroly',
            `Pepův e-mail se objevil v <b>${count}</b> únicích dat.`
            + '<br><br>Pod tímto rámečkem je časová osa – každá karta je jeden únik.',
            { side: 'bottom', onNextClick: startHunt })]);
    }

    /* ---------- 4.–6. hledání úniku s heslem ---------- */

    function startHunt() {
        setPhase('hunt');
        mission.show(4, 'Najděte únik s hesly',
            'Projděte časovou osu a u každého úniku si přečtěte seznam <b>Compromised data</b> (co uniklo).'
            + '<br><br>Najděte únik, ve kterém uniklo i heslo – anglicky <b>Passwords</b> – a otevřete ho tlačítkem <b>View Details</b>.');
    }

    function startFound(breach) {
        setPhase('found');
        mission.hide();
        drive([step(5, '[data-tour="breach-data"]', 'Výborně!',
            `Z portálu <b>${esc(breach.name)}</b> uniklo i Pepovo heslo. Pepa ho přitom používá i jinde.`
            + '<br><br>Útočníci uniklá hesla zkoušejí i na dalších stránkách. Když má někdo všude stejné heslo, dostanou se do všech jeho účtů.',
            { side: 'bottom', onNextClick: startNav })]);
    }

    function startNav() {
        setPhase('nav');
        drive([step(6, '[data-tour="nav-passwords"]', 'Jak jsou tedy na tom Pepova hesla?',
            'Na stránce <b>Passwords</b> se dá zjistit, jestli se nějaké heslo objevilo v úniku. Klikněte na ni v menu.',
            { showButtons: [], side: 'bottom' })]);
    }

    /* ---------- 7.–9. hesla ---------- */

    function startPwLook() {
        setPhase('pwlook');
        goTo('passwords');
        drive([step(7, undefined, 'Kontrola hesel',
            '<div class="zk-warning">⚠️ Sem ani nikam jinam nepište svoje skutečné heslo! Heslo patří jen do přihlášení na stránce, ke které patří.</div>'
            + 'Vyzkoušíme hesla, která má Pepa napsaná na papírku.',
            Object.assign({ onNextClick: startPwCheck }, LOOK))]);
    }

    // Žlutý lepicí papírek: zkontrolované heslo se přeškrtne a připíše se k němu, kolikrát uniklo.
    function notebookHtml() {
        return '<div class="zk-postit"><div class="zk-postit-title">HESLA!</div><ul>' + PEPA_PASSWORDS.map((pw) => {
            const done = Object.prototype.hasOwnProperty.call(checked, pw);
            const result = done ? `<span class="zk-postit-stamp">uniklo ${checked[pw].toLocaleString('cs-CZ')}×</span>` : '';
            return `<li class="${done ? 'leaked' : ''}">${copyable(pw, 'plain')}<span class="zk-postit-use">– ${PEPA_USES[pw]}</span>${result}</li>`;
        }).join('') + '</ul></div>';
    }

    // Posune stránku tak, aby pole pro heslo bylo nahoře: pod ním je vidět rámeček s výsledkem
    // a panel úkolu v pravém dolním rohu nepřekrývá tlačítko Check.
    function showPasswordArea() {
        const form = document.getElementById('checkForm');
        const top = form.getBoundingClientRect().top + window.scrollY - (FORM_TOP_GAP[phase] || 110);
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }

    function startPwCheck() {
        setPhase('pwcheck');
        goTo('passwords');
        mission.show(8, 'Pepův papírek s hesly',
            'Zkontrolujte všechna tři hesla: napište heslo do pole a klikněte na <b>Check</b>.'
            + '<div class="zk-note">Pozor na velká a malá písmena.</div>'
            + `<div data-notebook>${notebookHtml()}</div>`);
        setTimeout(showPasswordArea, 50);
    }

    // Zásady stejné jako v úkolu CIS/Strong_password: povinná je jen délka a to, že heslo neuniklo.
    // Velká písmena, čísla a speciální znaky jsou volitelné, délka je důležitější.
    const OPTIONAL_RULES = [
        ['upper', 'velké písmeno', /\p{Lu}/u],
        ['lower', 'malé písmeno', /\p{Ll}/u],
        ['number', 'číslo', /[0-9]/],
        ['special', 'speciální znak (např. !@#$%^&*)', /[^\p{L}0-9\s]/u]
    ];

    function startChallenge() {
        setPhase('challenge');
        goTo('passwords');
        mission.show(9, 'Vymyslete nové heslo',
            'Žádné z hesel na papírku už není bezpečné. Vymyslete nové, které splní obě povinná pravidla.'
            + '<div class="zk-rules-head">Povinné</div>'
            + '<ul class="zk-checklist" data-rules>'
            + `<li data-rule="length"><span>minimálně ${MIN_LENGTH} znaků</span></li>`
            + '<li data-rule="pwned"><span>heslo neuniklo (ověří tlačítko <b>Check</b>)</span></li>'
            + '</ul>'
            + '<div class="zk-rules-head">Volitelné</div>'
            + '<ul class="zk-checklist optional" data-rules>'
            + OPTIONAL_RULES.map(([id, label]) => `<li data-rule="${id}"><span>${label}</span></li>`).join('')
            + '</ul>'
            + `<div class="zk-note">Tip: dlouhé heslo se dobře pamatuje, když spojíte několik slov, třeba <i>${EXAMPLE_PASSPHRASE}</i> (tohle ale nepoužívejte 😉). Tlačítkem s okem uvidíte, co píšete.</div>`);
        updateRules(document.getElementById('checkInput').value, null);
        setTimeout(showPasswordArea, 50);
    }

    // pwnedOk: true / false po kontrole, null = zatím neověřeno
    function updateRules(password, pwnedOk) {
        if (!mission.find('[data-rules]')) return;
        const mark = (id, ok) => { mission.find(`[data-rule="${id}"]`).className = ok === true ? 'done' : ok === false ? 'fail' : ''; };
        mark('length', [...password].length >= MIN_LENGTH ? true : null);
        mark('pwned', pwnedOk);
        OPTIONAL_RULES.forEach(([id, , re]) => mark(id, re.test(password) ? true : null));
    }

    /* ---------- vlajka ---------- */

    function flagStep() {
        return step(0, undefined, 'Úkol splněn',
            'Tady je FLAG:'
            + `<div class="zk-flag"><code>${esc(FLAG)}</code>`
            + '<button type="button" class="zk-btn" data-copy-flag>Kopírovat</button></div>'
            + '<b>Co si zapamatovat:</b><ul class="zk-list">'
            + '<li>Heslo, které uniklo, už nikdy nepoužívejte.</li>'
            + '<li>Každý účet má mít jiné heslo – pomůže správce hesel.</li>'
            + '<li>Dlouhé heslo z několika slov se dobře pamatuje a těžko hádá.</li>'
            + '<li>Hesla nepište na papírky – kdokoli je může najít.</li>'
            + '<li>Svůj e-mail si doma ověřte na <b>haveibeenpwned.com</b>.</li></ul>',
            {
                popoverClass: 'zk-tour zk-wide',
                doneBtnText: 'Zavřít',
                nextBtnText: 'Zavřít',
                onNextClick: () => { stop(); showFlagChip(); },
                onPopoverRender: (popover) => {
                    const button = popover.description.querySelector('[data-copy-flag]');
                    button.addEventListener('click', () => {
                        copyText(FLAG).then(() => { button.textContent = '✔ Zkopírováno'; });
                    });
                }
            });
    }

    function finish() {
        setPhase('done');
        mission.hide();
        drive([flagStep()]);
    }

    function showFlagChip() {
        if (document.querySelector('.zk-chip')) return;
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'zk-chip';
        chip.textContent = 'Zobrazit FLAG';
        chip.addEventListener('click', () => drive([flagStep()]));
        document.body.appendChild(chip);
    }

    // Text, který má student někam napsat: kliknutím se zkopíruje (nenápadná ikonka vedle).
    // kind: 'plain' = bez zvýraznění (ruční písmo na papírku), jinak tučně
    function copyable(text, kind) {
        const inner = kind === 'plain' ? `<span>${esc(text)}</span>` : `<b>${esc(text)}</b>`;
        return `<span class="zk-copy" data-copy-text="${esc(text)}" title="Kliknutím zkopírujete">${inner}</span>`;
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

    document.addEventListener('hibp:email', (event) => {
        if (phase !== 'email') return;
        const { email, breaches } = event.detail;
        // bublinu u pole schováme hned, jinak by během rolování k výsledkům odskakovala
        stop();
        if (email === PEPA_EMAIL && breaches.length) afterScroll(() => startSummary(breaches.length));
        else afterScroll(() => startWrongEmail(email));
    });

    // Návrat z detailu úniku zpět na časovou osu (stejně jako šipka Zpět v prohlížeči).
    document.addEventListener('click', (event) => {
        if (!event.target.closest('[data-back]')) return;
        if (history.length > 1) history.back();
        else location.hash = '#/';
    });

    document.addEventListener('hibp:page', (event) => {
        const { page, breach } = event.detail;
        if (phase === 'hunt' && page === 'breach') {
            if (breach.data.includes('Passwords')) setTimeout(() => startFound(breach), 400);
            else mission.warn(`V úniku <b>${esc(breach.name)}</b> hesla neunikla – podívejte se na <b>Compromised Data</b>. `
                + 'Vraťte se šipkou <b>Zpět</b> v prohlížeči a otevřete další únik.'
                + '<div class="zk-actions"><button type="button" class="zk-btn" data-back>← Zpět na seznam úniků</button></div>');
        } else if (phase === 'hunt' && page === 'home') {
            const old = mission.find('.zk-warning');
            if (old) old.remove();
        } else if (phase === 'nav' && page === 'passwords') startPwLook();
        else if (phase === 'hunt' && page === 'passwords') {
            goTo('home');
            mission.warn('Na hesla dojde za chvíli. Nejdřív najděte únik, ve kterém uniklo Pepovo heslo.');
        } else if ((phase === 'pwcheck' || phase === 'challenge') && page === 'home') {
            mission.warn('Úkol pokračuje na stránce <b>Passwords</b> v menu nahoře.');
        }
    });

    document.addEventListener('hibp:password', (event) => {
        const { password, count, offline } = event.detail;
        if (phase === 'pwcheck') {
            if (!PEPA_PASSWORDS.includes(password)) {
                mission.warn(`Heslo <code>${esc(password)}</code> na Pepově papírku není. Zkontrolujte velká a malá písmena.`);
                return;
            }
            checked[password] = count;
            save();
            mission.find('[data-notebook]').innerHTML = notebookHtml();
            showPasswordArea();
            const old = mission.find('.zk-warning');
            if (old) old.remove();
            if (PEPA_PASSWORDS.every((pw) => Object.prototype.hasOwnProperty.call(checked, pw))) {
                setTimeout(startChallenge, 1500);
            }
        } else if (phase === 'challenge') {
            const longEnough = [...password].length >= MIN_LENGTH;
            const normalized = password.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
            const example = EXAMPLE_PASSPHRASE.normalize('NFD').replace(/[̀-ͯ]/g, '');
            updateRules(password, count === 0);
            showPasswordArea();
            const old = mission.find('.zk-warning');
            if (old) old.remove();
            if (normalized.replace(/[\s_.,+]+/g, '-') === example) {
                mission.warn('Tohle bylo jen ukázkové heslo. Vymyslete vlastní slova!');
            } else if (count > 0) {
                mission.warn(`Tohle heslo už uniklo ${count.toLocaleString('cs-CZ')}×. Zkuste jiné, méně obvyklé.`);
            } else if (!longEnough) {
                mission.warn(`V databázi není, ale je moc krátké – potřebuje aspoň ${MIN_LENGTH} znaků.`);
            } else {
                if (offline) mission.warn('Bez internetu šlo heslo ověřit jen částečně, ale pravidla splňuje.');
                setTimeout(finish, offline ? 2500 : 900);
            }
        }
    });

    // Délka a volitelná pravidla se odškrtávají už při psaní.
    document.getElementById('checkInput').addEventListener('input', (event) => {
        if (phase === 'challenge') updateRules(event.target.value, null);
    });

    /* ---------- start (po obnovení stránky naváže, kde student skončil) ---------- */

    setTimeout(() => {
        const saved = load();
        checked = saved.checked || {};
        if (saved.phase === 'done') {
            phase = 'done';
            showFlagChip();
        } else if (saved.phase === 'pwlook') startPwLook();
        else if (saved.phase === 'pwcheck') startPwCheck();
        else if (saved.phase === 'challenge') startChallenge();
        else if (saved.phase === 'nav' || saved.phase === 'found' || saved.phase === 'hunt' || saved.phase === 'summary') startEmail();
        else startIntro();
    }, 400);
})();
