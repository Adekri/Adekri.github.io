/**
 * HRA „Co bylo v příběhu?“
 * Po přečtení povídky třída společně odpovídá na otázky, učitel kliká.
 * Otázky a text povídky jsou v souboru pribeh.js.
 *
 * Ovládání: klik na odpověď; další otázka tlačítkem, šipkou → nebo prezentérem.
 */

const hra = document.getElementById('hra');
const postupEl = document.getElementById('postup');

let pribeh = null;
let krok = 0;
let zamceno = false;


/* ================================================================
   1. ÚVOD — výběr příběhu a text pro předčítání
   ================================================================ */

function vyberPribehu() {
    if (PRIBEHY.length === 1) return uvodPribehu(PRIBEHY[0]);

    Hra.postup(postupEl, 0, 0);
    Hra.dalsiKlavesou(null);
    hra.innerHTML = `
        <h2 class="nadpis objev">Který příběh jsme četli?</h2>
        <div class="radek">
            ${PRIBEHY.map((p, i) => `
                <button class="karta objev" data-i="${i}">
                    <span class="emoji">${Hra.obr(p.ikona)}</span>
                    <span class="popisek">${p.nazev}</span>
                </button>`).join('')}
        </div>`;
    hra.querySelectorAll('.karta').forEach(k =>
        k.addEventListener('click', () => uvodPribehu(PRIBEHY[k.dataset.i]))
    );
}

function uvodPribehu(p) {
    pribeh = p;
    Hra.postup(postupEl, 0, 0);
    const odstavce = p.text.split(/\n\s*\n/).map(o => `<p>${o.trim()}</p>`).join('');

    hra.innerHTML = `
        <div class="ikona-uvod objev">${Hra.obr(p.ikona)}</div>
        <h2 class="nadpis objev">${p.nazev}</h2>
        <p class="podnadpis objev">Poslouchejte pozorně. Potom budeme hádat, co v příběhu bylo.</p>
        <div class="radek objev">
            <button class="tlacitko" id="start">Začít hádat</button>
            <button class="tlacitko svetle mensi" id="ukazText">Text k předčítání</button>
        </div>
        <div class="text-pribehu" id="textPribehu" hidden>${odstavce}</div>`;

    document.getElementById('ukazText').addEventListener('click', () => {
        const t = document.getElementById('textPribehu');
        t.hidden = !t.hidden;
    });
    const start = () => { krok = 0; dalsiOtazka(); };
    document.getElementById('start').addEventListener('click', start);
    Hra.dalsiKlavesou(start);
}


/* ================================================================
   2. OTÁZKY
   ================================================================ */

function dalsiOtazka() {
    zamceno = false;
    Hra.dalsiKlavesou(null);
    if (krok >= pribeh.otazky.length) return konec();

    Hra.postup(postupEl, krok + 1, pribeh.otazky.length);
    const o = pribeh.otazky[krok];
    if (o.typ === 'byl') otazkaByl(o);
    else if (o.typ === 'vyber') otazkaVyber(o);
    else if (o.typ === 'poradi') otazkaPoradi(o);
}

/** Otázka je vyřešená → ukáže se tlačítko na další (nebo klávesa →). */
function vyreseno(text) {
    zamceno = true;
    krok++;
    const titulek = document.getElementById('titulek');
    titulek.textContent = text;
    Hra.mluv(text);

    const posledni = krok >= pribeh.otazky.length;
    titulek.insertAdjacentHTML('afterend',
        `<button class="tlacitko mensi objev" id="dalsi">${posledni ? 'Konec' : 'Další otázka →'}</button>`);
    document.getElementById('dalsi').addEventListener('click', dalsiOtazka);
    Hra.dalsiKlavesou(dalsiOtazka);
}

const OTAZKA = text => `<p class="otazka objev">${text}</p>`;
const TITULEK = '<p class="titulek" id="titulek"></p>';


/* ----- Bylo to v příběhu? ANO / NE ----- */

function otazkaByl(o) {
    hra.innerHTML = `
        <div class="velky-obrazek objev">${Hra.obr(o.obrazek)}</div>
        ${OTAZKA(o.otazka)}
        <div class="radek ano-ne objev">
            <button class="tlacitko svetle" data-odpoved="ano">Ano</button>
            <button class="tlacitko svetle" data-odpoved="ne">Ne</button>
        </div>
        ${TITULEK}`;
    Hra.mluv(o.otazka);

    hra.querySelectorAll('.ano-ne .tlacitko').forEach(tl => {
        tl.addEventListener('click', () => {
            if (zamceno) return;
            const spravne = hra.querySelector(`[data-odpoved="${o.odpoved ? 'ano' : 'ne'}"]`);
            Hra.zakrouzkuj(spravne);

            if (tl === spravne) {
                Hra.zvuk.spravne();
                vyreseno('Správně!');
            } else {
                Hra.preskrtni(tl);
                Hra.zvuk.spatne();
                vyreseno(o.vysvetleni || (o.odpoved ? 'Ale ano, v příběhu to bylo.' : 'Ne, to v příběhu nebylo.'));
            }
        });
    });
}


/* ----- Výběr z obrázků ----- */

function otazkaVyber(o) {
    const moznosti = Hra.zamichej(o.moznosti);
    hra.innerHTML = `
        ${OTAZKA(o.otazka)}
        <div class="radek">
            ${moznosti.map((m, i) => `
                <button class="karta objev" style="animation-delay:${0.1 + i * 0.1}s" data-i="${i}">
                    <span class="emoji">${Hra.obr(m.obrazek, m.popisek)}</span>
                    <span class="popisek">${m.popisek}</span>
                </button>`).join('')}
        </div>
        ${TITULEK}`;
    Hra.mluv(o.otazka);

    const karty = [...hra.querySelectorAll('.karta')];
    karty.forEach((k, i) => {
        k.addEventListener('click', () => {
            if (zamceno || k.disabled) return;
            k.disabled = true;

            if (moznosti[i].spravne) {
                Hra.zakrouzkuj(k);
                Hra.zvuk.spravne();
                karty.filter(x => x !== k).forEach(x => { x.disabled = true; x.classList.add('zhasnuta'); });
                vyreseno('Správně!');
            } else {
                Hra.preskrtni(k);
                k.classList.add('zhasnuta');
                Hra.zvuk.spatne();
                document.getElementById('titulek').textContent = 'To ne. Zkusíte to znovu?';
            }
        });
    });
}


/* ----- Seřazení obrázků ----- */

function otazkaPoradi(o) {
    // Zamícháme tak, aby obrázky nebyly hned ve správném pořadí
    let poradi = o.obrazky.map((_, i) => i);
    do { poradi = Hra.zamichej(poradi); } while (poradi.length > 1 && poradi.every((v, i) => v === i));

    hra.innerHTML = `
        ${OTAZKA(o.otazka)}
        <div class="sloty objev">
            ${o.obrazky.map((_, i) => `<div class="slot" data-slot="${i}"><span class="cislo">${i + 1}</span></div>`).join('')}
        </div>
        <div class="radek poradi-karty">
            ${poradi.map((idx, i) => `
                <button class="karta objev" style="animation-delay:${0.15 + i * 0.1}s" data-idx="${idx}">
                    <span class="emoji">${Hra.obr(o.obrazky[idx].obrazek, o.obrazky[idx].popisek)}</span>
                    <span class="popisek">${o.obrazky[idx].popisek}</span>
                </button>`).join('')}
        </div>
        ${TITULEK}`;
    Hra.mluv(`${o.otazka} Co bylo první?`);

    const titulek = document.getElementById('titulek');
    titulek.textContent = 'Co bylo první?';
    let dalsi = 0;

    hra.querySelectorAll('.karta').forEach(k => {
        k.addEventListener('click', () => {
            if (zamceno) return;
            const idx = Number(k.dataset.idx);

            if (idx !== dalsi) {
                Hra.efekt(k, 'trhni');
                Hra.zvuk.spatne();
                titulek.textContent = dalsi === 0 ? 'Tohle nebylo první. Co se stalo nejdřív?' : 'Tohle bylo až později. Co bylo dál?';
                return;
            }

            const slot = hra.querySelector(`[data-slot="${idx}"]`);
            slot.classList.add('plny');
            slot.insertAdjacentHTML('beforeend', `
                <span class="emoji objev">${Hra.obr(o.obrazky[idx].obrazek, o.obrazky[idx].popisek)}</span>
                <span class="popisek">${o.obrazky[idx].popisek}</span>`);
            k.classList.add('pouzita');
            dalsi++;

            if (dalsi === o.obrazky.length) {
                Hra.zvuk.spravne();
                vyreseno('Správně, přesně tak to bylo!');
            } else {
                Hra.zvuk.listek();
                titulek.textContent = 'A co bylo potom?';
            }
        });
    });
}


/* ================================================================
   3. KONEC
   ================================================================ */

function konec() {
    Hra.postup(postupEl, 0, 0);
    Hra.konecHry(hra, {
        nadpis: 'Konec příběhu',
        text: 'Poslouchali jste moc pozorně.',
        znovu: vyberPribehu
    });
}

vyberPribehu();
