/* ============================================================
   Podvodný článek „Global Science Review“ (web.html).
   - datum v hlavičce je vždy dnešní (jako na originálu)
   - odpočet akce, který po vypršení i po každém načtení
     stránky začne znovu od 14:59
   - komentáře napodobují plugin Facebooku, ale nic na nich
     nefunguje
   - objednávka, kontakt a obchodní podmínky v okně
   Průvodce (tour.js) poslouchá události lingfluent:doc,
   lingfluent:close, lingfluent:order a lingfluent:fb.
   ============================================================ */
(function () {
    const COUNTDOWN_SECONDS = 14 * 60 + 59;
    // Výchozí profilový obrázek Facebooku (originál používal fotky ukradené skutečným lidem).
    const SILHOUETTE = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">'
        + '<rect width="50" height="50" fill="#c9ccd1"/><circle cx="25" cy="19" r="9" fill="#fff"/>'
        + '<path d="M8 50c1-11 8-17 17-17s16 6 17 17z" fill="#fff"/></svg>');

    // obrysový palec jako ve starém pluginu Facebooku
    const THUMB = '<svg width="13" height="12" viewBox="0 0 16 15" style="vertical-align:-1px"><path d="M1 6.5h3v8H1zM4 7l3-6c1.5 0 2 1 1.7 2.4L8.2 6H14c1 0 1.6.9 1.4 1.8l-1.3 5.6c-.2.8-.9 1.1-1.6 1.1H4"'
        + ' fill="none" stroke="#3b5998" stroke-width="1.3" stroke-linejoin="round"/></svg>';

    // [jméno, text, počet „líbí se mi“, kdy, odpověď na předchozí]; přeloženo z italského originálu
    const COMMENTS = [
        ['lady_punk', 'Zkoušel to někdo?', 153, 'před 12 minutami'],
        ['marketa', 'Kartičky Ling Fluent používám 3 týdny a opravdu jsem se naučila německy tolik jako za rok kurzu. Říkají mi to všichni, i moje sestřenice, co pracuje v Mnichově! Výsledky jsou fakt působivé. Jsem míň ve stresu, neuvěřitelné! Děkuju za tenhle článek!', 78, 'před 13 minutami'],
        ['eva', 'Tohle je první metoda na učení jazyků, která u mě fungovala a díky které jsem se zbavila psychického bloku při učení. Už si nepřipadám hloupá a věřím si.', 59, 'před 25 minutami'],
        ['crawford', 'Zkoušel to někdo? Vypadá to slibně', 0, 'před 46 minutami', true],
        ['kocicka_petra23', 'Roky jsem se snažila naučit anglicky a nic mi nepřineslo výsledky, jaké jsem chtěla. Utratila jsem spoustu peněz za lekce, kurzy a knihy – víte, jak to chodí. Ukázali jste mi, jak se naučit cizí jazyk za mnohem míň peněz než v jazykovce. Čeká mě velká změna – za dva měsíce jedu za klukem do Skotska a chci se v pohodě domluvit s místními. Objednala jsem kartičky a doufám ve skvělé výsledky. Držte mi palce!', 243, 'před 1 hodinou'],
        ['bella', 'Narazila jsem na tuhle stránku a přečetla si článek. Doporučil mi to i kamarád, hned objednávám 2 sady, na němčinu a španělštinu, protože je to skvělá příležitost. Netušila jsem, že se kartičky dají koupit online.', 105, 'před 1 hodinou'],
        ['p_a_v_l_i_n_a', 'Neuvěřitelné! Chtěla bych mluvit aspoň 3 cizími jazyky! Nemůžu se dočkat, až kartičky přijdou!', 273, 'před 2 hodinami'],
        ['david', 'Když říkáte, že to funguje, koupím kartičky dceři k narozeninám. Za týden jí bude 16, snad se nebude zlobit, že je to něco do školy.', 123, 'před 2 hodinami'],
        ['sarlota', 'Je to týden, co se učím s kartičkami, a opravdu jsem začala mluvit francouzsky. Naučila jsem se přes 1000 slov, a za jakou cenu! Za kurz v jazykovce bych dala celou výplatu, takhle aspoň nemám prázdný účet :)', 64, 'před 2 hodinami'],
        ['monika_b', 'Koupila jsem kartičky tátovi, který často jezdí pracovně do Holandska. Je moc spokojený, protože po 2 týdnech začal rozumět spoustě slov. Užitečný vynález za nízkou cenu.', 37, 'před 2 hodinami'],
        ['michal83', 'zase zázračné metody... na cizí jazyk potřebujete roky a hotovo', 214, 'před 2 hodinami'],
        ['ronaldo', 'Co blbneš, je jasný, že se za 2 dny nenaučíš mluvit jako rodilý mluvčí, ale určitě se naučíš rychleji než v kurzu, podle mě tyhle triky fungujou skvěle.', 122, 'před 2 hodinami'],
        ['z_vesnice', 'S manželkou jsme se rozhodli, že kartičky zkusíme spolu. Je nám skoro 60 a chceme vidět, jestli to funguje i u lidí, co se nikdy jazyky neučili. Jsme z vesnice, jazykovky tu nemáme. Učit se doma je pro nás ideální.', 124, 'před 2 hodinami'],
        ['bara_77', 'O tomhle Leovi a jeho metodě jsem četla v novinách a teď vidím, že se to dá objednat i u nás. Paráda!', 159, 'před 2 hodinami'],
        ['crazy_zrzka', 'Učím se s kartičkami španělsky, jsem ve druhém měsíci a výsledky jsou fakt neuvěřitelné. Naučila jsem se asi tisíc slov a už trochu mluvím. Právě jsem objednala druhou úroveň, přemýšlím, že zkusím i francouzštinu.', 136, 'před 3 hodinami'],
        ['pepik', 'Ok, objednal jsem. Napíšu sem, jak to funguje.', 122, 'před 9 hodinami']
    ];

    const DOCS = {
        contact: {
            title: 'Kontakt',
            html: '<p>Máte dotaz k objednávce? Napište nám na <b>info@youreduspace.com</b>.</p>'
        },
        // Strojově přeložené podmínky; prodávající sídlí v Číně a „záruka“ z článku tu ve skutečnosti není.
        terms: {
            title: 'Obchodní podmínky',
            html: '<h3>1. Prodávající</h3><p>Prodejce zboží je společnost SHENZHEN XINGYUE TRADING CO., LTD., Room 1708, Block B, '
                + 'Huaqiang North Road, Futian District, Shenzhen, Guangdong, Čína. E-mail: lingfluent.service@gmail.com</p>'
                + '<h3>2. Objednávka</h3><p>Odesláním formuláře zákazník souhlasí, že ho bude kontaktovat náš konzultant pro potvrzení objednávky '
                + 'a nabídnutí dalšího produktu. Cena může být při potvrzení upravena dle zvolené úrovně kurzu.</p>'
                + '<h3>3. Doručení</h3><p>Zboží je odesíláno ze skladu v Číně. Obvyklá doba doručení je 15–45 pracovních dnů. '
                + 'Prodejce není odpovědný za zdržení na celnici.</p>'
                + '<h3>4. Vrácení zboží</h3><p>Vrátit lze pouze zboží v původním neotevřeném balení do 7 dnů od doručení, na adresu prodávajícího v Číně. '
                + 'Náklady na vrácení hradí kupující. Otevřené zboží nelze vrátit.</p>'
                + '<h3>5. Reklamace</h3><p>Záruční doba je 30 dní. Reklamaci je nutné zaslat písemně v anglickém jazyce na adresu prodávajícího.</p>'
                + '<h3>6. Výsledky</h3><p>Prodejce nezaručuje žádný výsledek učení. Výsledky se mohou lišit u každého člověka. '
                + 'Informace v článcích a recenzích mají pouze ilustrativní charakter.</p>'
                + '<h3>7. Rozhodné právo</h3><p>Případné spory řeší soud v Shenzhenu podle práva Čínské lidové republiky.</p>'
        }
    };

    const $ = (id) => document.getElementById(id);

    function esc(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function pad2(n) {
        return n < 10 ? '0' + n : '' + n;
    }

    /* ---------- dnešní datum a odpočet akce ---------- */

    const today = new Date();
    $('menuDate').textContent = `${pad2(today.getDate())}.${pad2(today.getMonth() + 1)}.${today.getFullYear()}`;

    let remaining = COUNTDOWN_SECONDS;
    function tick() {
        const text = `${pad2(Math.floor(remaining / 60))}:${pad2(remaining % 60)}`;
        document.querySelectorAll('.countdown').forEach((el) => { el.textContent = text; });
        remaining = remaining > 0 ? remaining - 1 : COUNTDOWN_SECONDS;
    }
    tick();
    setInterval(tick, 1000);

    /* ---------- komentáře ---------- */

    $('commentList').innerHTML = COMMENTS.map(([name, text, likes, when, reply]) => `<div class="fbc-c${reply ? ' reply' : ''}">`
        + `<img src="${SILHOUETTE}" alt="">`
        + `<div><b>${esc(name)}</b><p>${esc(text)}</p>`
        + '<span class="fbc-meta"><a href="#" data-fb-action>Odpovědět</a> · '
        + (likes ? `<span class="thumb">${THUMB} ${likes}</span> · ` : '')
        + `<a href="#" data-fb-action>To se mi líbí</a> · ${when}</span></div></div>`).join('');

    // Na komentářích nic nefunguje – stránka jen dá vědět průvodci.
    document.addEventListener('click', (event) => {
        const action = event.target.closest('[data-fb-action]');
        if (!action) return;
        event.preventDefault();
        document.dispatchEvent(new CustomEvent('lingfluent:fb'));
    });

    /* ---------- okna ---------- */

    function open(modal) {
        $(modal).hidden = false;
    }

    function closeAll() {
        document.querySelectorAll('.modal-backdrop').forEach((m) => { m.hidden = true; });
        document.dispatchEvent(new CustomEvent('lingfluent:close'));
    }

    document.querySelectorAll('[data-order]').forEach((a) => a.addEventListener('click', (event) => {
        event.preventDefault();
        open('orderModal');
    }));

    document.querySelectorAll('[data-doc]').forEach((a) => a.addEventListener('click', (event) => {
        event.preventDefault();
        const doc = DOCS[a.dataset.doc];
        $('docTitle').textContent = doc.title;
        $('docText').innerHTML = doc.html;
        closeAll();
        open('docModal');
        document.dispatchEvent(new CustomEvent('lingfluent:doc', { detail: { doc: a.dataset.doc } }));
    }));

    document.querySelectorAll('.modal-backdrop').forEach((m) => m.addEventListener('click', (event) => {
        if (event.target === m || event.target.closest('[data-close]')) closeAll();
    }));

    // ostatní odkazy (menu, logo) nikam nevedou
    document.querySelectorAll('a[href="#"]:not([data-order]):not([data-doc]):not([data-fb-action])').forEach((a) => {
        a.addEventListener('click', (event) => event.preventDefault());
    });

    /* ---------- objednávka (průvodce ji může zastavit přes preventDefault) ---------- */

    $('orderForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const proceed = document.dispatchEvent(new CustomEvent('lingfluent:order', { cancelable: true }));
        if (!proceed) {
            closeAll();
            return;
        }
        $('orderForm').hidden = true;
        $('orderDone').hidden = false;
    });
})();
