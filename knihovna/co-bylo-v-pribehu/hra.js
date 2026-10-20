/**
 * HRA „Co bylo v příběhu?“
 * Děti poslouchají povídku a pak odpovídají na otázky ťukáním na obrázky.
 * Otázky a text povídky jsou v souboru pribeh.js.
 */

const hra = document.getElementById('hra');
const hvezdyEl = document.getElementById('hvezdy');

let pribeh = null;
let krok = 0;
let zamceno = false;


/* ================================================================
   1. ÚVOD — výběr příběhu a text pro předčítání
   ================================================================ */

function vyberPribehu() {
    if (PRIBEHY.length === 1) return uvodPribehu(PRIBEHY[0]);

    hvezdyEl.innerHTML = '';
    hra.innerHTML = `
        <div class="ikona-uvod">👂</div>
        <h2 class="nadpis">Který příběh jsme četli?</h2>
        <div class="radek">
            ${PRIBEHY.map((p, i) => `
                <button class="karta objev" data-i="${i}">
                    <span class="emoji">${p.ikona}</span>
                    <span class="popisek">${p.nazev}</span>
                </button>`).join('')}
        </div>`;
    hra.querySelectorAll('.karta').forEach(k =>
        k.addEventListener('click', () => uvodPribehu(PRIBEHY[k.dataset.i]))
    );
}

function uvodPribehu(p) {
    pribeh = p;
    hvezdyEl.innerHTML = '';
    const odstavce = p.text.split(/\n\s*\n/).map(o => `<p>${o.trim()}</p>`).join('');

    hra.innerHTML = `
        <div class="ikona-uvod">${p.ikona}</div>
        <h2 class="nadpis">${p.nazev}</h2>
        <p class="podnadpis">Poslouchej pozorně příběh. Potom budeme hádat, co v něm bylo.</p>
        <div class="radek">
            <button class="tlacitko" id="start">▶ Hádat</button>
            <button class="tlacitko svetle mensi" id="ukazText">📖 Text k předčítání</button>
        </div>
        <div class="text-pribehu" id="textPribehu" hidden>${odstavce}</div>`;

    document.getElementById('ukazText').addEventListener('click', () => {
        const t = document.getElementById('textPribehu');
        t.hidden = !t.hidden;
    });
    document.getElementById('start').addEventListener('click', () => {
        krok = 0;
        Hra.hvezdy(hvezdyEl, 0, pribeh.otazky.length);
        dalsiOtazka();
    });
}


/* ================================================================
   2. OTÁZKY
   ================================================================ */

function dalsiOtazka() {
    zamceno = false;
    if (krok >= pribeh.otazky.length) return konec();

    const o = pribeh.otazky[krok];
    if (o.typ === 'byl') otazkaByl(o);
    else if (o.typ === 'vyber') otazkaVyber(o);
    else if (o.typ === 'poradi') otazkaPoradi(o);
}

/** Správně zodpovězeno → hvězdička, pochvala a další otázka. */
function hotovo(text) {
    zamceno = true;
    krok++;
    Hra.hvezdy(hvezdyEl, krok, pribeh.otazky.length);
    Hra.zvuk.spravne();
    const pochvala = text || Hra.pochvala();
    Hra.bublina(pochvala);
    Hra.mluv(pochvala, () => setTimeout(dalsiOtazka, 700));
}

function htmlOtazky(text) {
    return `<p class="otazka objev"><span>${text}</span>
            <button class="kulaty" id="znovu" aria-label="Přečíst otázku znovu">🔊</button></p>`;
}


/* ----- Bylo to v příběhu? ANO / NE ----- */

function otazkaByl(o) {
    hra.innerHTML = `
        <div class="velky-obrazek objev">${o.obrazek}</div>
        ${htmlOtazky(o.otazka)}
        <div class="radek ano-ne">
            <button class="tlacitko zelene objev" data-odpoved="ano">👍 Ano</button>
            <button class="tlacitko cervene objev" data-odpoved="ne">👎 Ne</button>
        </div>`;

    const precti = () => Hra.mluv(o.otazka);
    document.getElementById('znovu').addEventListener('click', precti);
    precti();

    hra.querySelectorAll('.ano-ne .tlacitko').forEach(tl => {
        tl.addEventListener('click', () => {
            if (zamceno) return;
            const odpovedelAno = tl.dataset.odpoved === 'ano';
            if (odpovedelAno === o.odpoved) return hotovo();

            // Špatně: ukážeme správnou odpověď, vysvětlíme a pokračujeme dál
            zamceno = true;
            Hra.zvuk.spatne();
            Hra.efekt(tl, 'spatne');
            const spravne = hra.querySelector(`[data-odpoved="${o.odpoved ? 'ano' : 'ne'}"]`);
            Hra.efekt(spravne, 'ukaz');
            const vysvetleni = o.vysvetleni || (o.odpoved ? 'Ale ano, v příběhu to bylo!' : 'Ne, to v příběhu nebylo.');
            Hra.bublina(vysvetleni);
            Hra.mluv(vysvetleni, () => setTimeout(() => {
                krok++;
                Hra.hvezdy(hvezdyEl, krok, pribeh.otazky.length);
                dalsiOtazka();
            }, 900));
        });
    });
}


/* ----- Výběr z obrázků ----- */

function otazkaVyber(o) {
    const moznosti = Hra.zamichej(o.moznosti);
    hra.innerHTML = `
        ${htmlOtazky(o.otazka)}
        <div class="radek">
            ${moznosti.map((m, i) => `
                <button class="karta objev" style="animation-delay:${0.1 + i * 0.08}s" data-i="${i}">
                    <span class="emoji">${m.obrazek}</span>
                    <span class="popisek">${m.popisek}</span>
                </button>`).join('')}
        </div>`;

    const karty = [...hra.querySelectorAll('.karta')];
    const odzvyrazni = () => karty.forEach(k => k.classList.remove('zvyraznena'));
    const precti = () => Hra.mluvPostupne([
        { text: o.otazka },
        ...karty.map((k, i) => ({
            text: moznosti[i].popisek,
            zacatek: () => { odzvyrazni(); k.classList.add('zvyraznena'); }
        }))
    ], odzvyrazni);

    document.getElementById('znovu').addEventListener('click', precti);
    precti();

    karty.forEach((k, i) => {
        k.addEventListener('click', () => {
            if (zamceno || k.disabled) return;
            odzvyrazni();
            if (moznosti[i].spravne) {
                k.classList.add('spravne');
                return hotovo();
            }
            k.disabled = true;
            Hra.efekt(k, 'spatne');
            Hra.zvuk.spatne();
            Hra.mluv('To ne. Zkus to znovu.');
        });
    });
}


/* ----- Seřazení obrázků ----- */

function otazkaPoradi(o) {
    // Zamícháme tak, aby obrázky nebyly hned ve správném pořadí
    let poradi = o.obrazky.map((_, i) => i);
    do { poradi = Hra.zamichej(poradi); } while (poradi.every((v, i) => v === i) && poradi.length > 1);

    hra.innerHTML = `
        ${htmlOtazky(o.otazka)}
        <div class="sloty">
            ${o.obrazky.map((_, i) => `<div class="slot" data-slot="${i}"><span class="cislo">${i + 1}</span></div>`).join('')}
        </div>
        <div class="radek">
            ${poradi.map((idx, i) => `
                <button class="karta objev" style="animation-delay:${0.1 + i * 0.08}s" data-idx="${idx}">
                    <span class="emoji">${o.obrazky[idx].obrazek}</span>
                    <span class="popisek">${o.obrazky[idx].popisek}</span>
                </button>`).join('')}
        </div>`;

    const precti = () => Hra.mluv(`${o.otazka} Co bylo první?`);
    document.getElementById('znovu').addEventListener('click', precti);
    precti();

    let dalsi = 0;
    hra.querySelectorAll('.karta').forEach(k => {
        k.addEventListener('click', () => {
            if (zamceno) return;
            const idx = Number(k.dataset.idx);
            if (idx !== dalsi) {
                k.animate([{ transform: 'translateX(-12px)' }, { transform: 'translateX(12px)' }, { transform: 'none' }], { duration: 350 });
                Hra.zvuk.spatne();
                Hra.mluv(dalsi === 0 ? 'Tohle nebylo první. Co se stalo nejdřív?' : 'Tohle bylo až později. Co bylo dál?');
                return;
            }

            const slot = hra.querySelector(`[data-slot="${idx}"]`);
            slot.classList.add('plny');
            slot.insertAdjacentHTML('beforeend', `
                <span class="emoji objev">${o.obrazky[idx].obrazek}</span>
                <span class="popisek">${o.obrazky[idx].popisek}</span>`);
            k.classList.add('pouzita');
            dalsi++;

            if (dalsi === o.obrazky.length) {
                hotovo();
            } else {
                Hra.zvuk.klik();
                Hra.mluv(`${o.obrazky[idx].popisek}. A co bylo potom?`);
            }
        });
    });
}


/* ================================================================
   3. KONEC
   ================================================================ */

function konec() {
    Hra.konecHry(hra, {
        nadpis: 'Hotovo!',
        text: 'Poslouchali jste moc pozorně.',
        znovu: vyberPribehu
    });
}

vyberPribehu();
