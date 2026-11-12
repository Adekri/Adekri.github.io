/**
 * HRA „Jak to bylo dál?“
 * Okénka z pohádky jsou zamíchaná a třída je skládá do správného pořadí.
 * Okénka jsou SVG scény poskládané z kreseb, data jsou v souboru pribehy.js.
 *
 * Ovládání: okénka jsou od začátku v komiksu, jen zamíchaná. Okénko se přetáhne
 * na jiné a ta dvě se prohodí (myší, prstem na tabuli). Totéž jde klikáním:
 * klik okénko vybere, klik na jiné je prohodí.
 */

const hra = document.getElementById('hra');
const postupEl = document.getElementById('postup');

// Barvy pozadí okének: obloha / stěna a země / podlaha, horizont v procentech
const POZADI = {
    den:   { nebe: '#d6e6e8', zeme: '#c5d6a2', horizont: 56 },
    les:   { nebe: '#cfe0cc', zeme: '#a9c48f', horizont: 56 },
    vecer: { nebe: '#d9d2e6', zeme: '#b4c89a', horizont: 56 },
    noc:   { nebe: '#3E4A6E', zeme: '#55704A', horizont: 62 },
    pokoj: { nebe: '#eadbc0', zeme: '#c9a97a', horizont: 66 }
};

let pohadka = 0;

// Okénka jdou dokola po směru hodinových ručiček (1 ↗ 2 ↓ 3 ↙ 4),
// aby šipky mezi nimi byly krátké a nekřížily se
const MISTA = ['1 / 1', '1 / 2', '2 / 2', '2 / 1'];

// Ručně kreslené šipky v mezerách mezi okénky: doprava, dolů, doleva
const sipka = (trida, d, hrot) => `<svg class="sipka ${trida}" viewBox="0 0 100 100" aria-hidden="true">
    <path d="${d}" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round"/>
    <path d="${hrot}" fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
const SIPKY =
    sipka('doprava', 'M12,54 C34,44 58,58 80,48', 'M62,30 L84,47 L64,68') +
    sipka('dolu', 'M48,10 C58,34 42,58 52,82', 'M32,64 L52,86 L70,64') +
    sipka('doleva', 'M88,48 C66,58 42,44 20,54', 'M38,32 L16,52 L36,70');


/* ================================================================
   1. VYKRESLENÍ OKÉNKA JAKO SVG
   ================================================================ */

function panelSvg(okenko) {
    const p = POZADI[okenko.pozadi];
    const hor = p.horizont * 3;
    // Co je níž, je vpředu; „z“ určí pořadí ručně (peřina přes vlka v posteli)
    const veci = [...okenko.veci].sort((a, b) => (a.z ?? a.y) - (b.z ?? b.y)).map(v => {
        if (v.svg) return v.svg;
        const w = v.s * 4;
        const left = v.x * 4 - w / 2;
        const top = v.y * 3 - w;
        const otoc = v.r ? ` transform="rotate(${v.r} ${left + w / 2} ${top + w / 2})"` : '';
        return `<image href="${Hra.cestaObrazku(v.e)}" x="${left}" y="${top}" width="${w}" height="${w}"${otoc}/>`;
    }).join('');

    return `<svg viewBox="0 0 400 300" role="img" aria-label="${okenko.text}">
        <rect width="400" height="${hor}" fill="${p.nebe}"/>
        <rect y="${hor}" width="400" height="${300 - hor}" fill="${p.zeme}"/>
        <path d="M0,${hor} L400,${hor}" stroke="rgba(46,38,32,.3)" stroke-width="2"/>
        ${okenko.navic || ''}
        ${veci}
    </svg>`;
}


/* ================================================================
   2. PRŮBĚH HRY
   ================================================================ */

function uvod() {
    Hra.postup(postupEl, 0, 0);
    hra.innerHTML = `
        <div class="ikona-uvod objev">${Hra.obr('🧩', '')}</div>
        <h2 class="nadpis objev">Jak to bylo dál?</h2>
        <p class="podnadpis objev">Okénka z pohádek se nám pomíchala. Poskládáte je tak, jak šla v pohádce za sebou?</p>
        <button class="tlacitko objev" id="start">Začít</button>`;
    const start = () => { pohadka = 0; zobrazPohadku(); };
    document.getElementById('start').addEventListener('click', start);
    Hra.dalsiKlavesou(start);
}

function zobrazPohadku() {
    if (pohadka >= POHADKY.length) return konec();

    const p = POHADKY[pohadka];
    Hra.postup(postupEl, pohadka + 1, POHADKY.length);
    Hra.dalsiKlavesou(null);

    // Zamícháme tak, aby žádné okénko nebylo hned na svém místě
    let poradi = p.okenka.map((_, i) => i);
    do { poradi = Hra.zamichej(poradi); } while (poradi.some((v, i) => v === i));

    hra.innerHTML = `
        <div class="zahlavi-hry">
            <h2 class="nazev-pohadky">${p.nazev}</h2>
            <p class="titulek" id="titulek">Prohoďte okénka, aby šla za sebou.</p>
            <button class="tlacitko mensi" id="zkontrolovat">Zkontrolovat</button>
        </div>
        <div class="komiks">
            ${poradi.map((idx, i) => `
                <div class="policko" data-i="${i}" style="grid-area:${MISTA[i]}">
                    <button class="panel objev" data-idx="${idx}">${panelSvg(p.okenka[idx])}</button>
                    <span class="roh">${i + 1}</span>
                </div>`).join('')}
            ${SIPKY}
        </div>`;

    hra.querySelectorAll('.panel').forEach(pripravPanel);
    document.getElementById('zkontrolovat').addEventListener('click', zkontroluj);
    Hra.mluv(`${p.nazev}. Prohoďte okénka tak, aby šla za sebou jako v pohádce.`);
}

const policka = () => [...hra.querySelectorAll('.policko')];
let vybrany = null; // okénko vybrané kliknutím, čeká na druhé kliknutí

/** Prohodí dvě okénka. Správně umístěná (zelená) okénka se už nehýbou. */
function prohod(panel, kam) {
    const odkud = panel.parentElement;
    const druhy = kam.querySelector('.panel');
    if (kam === odkud || !druhy || druhy.classList.contains('spravne')) return;
    odkud.prepend(druhy);
    kam.prepend(panel);
    // Prohazování je potichu — zvuk zazní až při správném složení
    [panel, druhy].forEach(p => p.classList.remove('spatne'));
}

/** Klik bez tažení: první klik okénko vybere, druhý ho prohodí s jiným. */
function klikNaPanel(panel) {
    if (panel.classList.contains('spravne')) return;
    if (!vybrany) {
        vybrany = panel;
        panel.classList.add('vybrany');
        return;
    }
    vybrany.classList.remove('vybrany');
    if (vybrany !== panel) prohod(vybrany, panel.parentElement);
    vybrany = null;
}


/* ================================================================
   3. PŘETAHOVÁNÍ — funguje myší, prstem i na interaktivní tabuli
   ================================================================ */

function pripravPanel(panel) {
    let start = null;   // kde tah začal
    let tazeni = false;

    const policko = (x, y) => document.elementFromPoint(x, y)?.closest('.policko') || null;
    const zvyrazni = cil => policka().forEach(c => c.classList.toggle('nad', c === cil));

    panel.addEventListener('pointerdown', e => {
        if (panel.classList.contains('spravne')) return;
        const r = panel.getBoundingClientRect();
        start = { x: e.clientX, y: e.clientY, dx: e.clientX - r.left, dy: e.clientY - r.top, w: r.width, h: r.height };
        panel.setPointerCapture(e.pointerId);
    });

    panel.addEventListener('pointermove', e => {
        if (!start) return;
        if (!tazeni && Math.hypot(e.clientX - start.x, e.clientY - start.y) < 6) return;
        if (!tazeni) {
            tazeni = true;
            panel.classList.add('tazeny');
            Object.assign(panel.style, { position: 'fixed', inset: 'auto', width: start.w + 'px', height: start.h + 'px', pointerEvents: 'none' });
        }
        panel.style.left = (e.clientX - start.dx) + 'px';
        panel.style.top = (e.clientY - start.dy) + 'px';
        zvyrazni(policko(e.clientX, e.clientY));
    });

    const konecTazeni = e => {
        if (!start) return;
        const byloTazeni = tazeni;
        start = null;
        tazeni = false;
        if (!byloTazeni) return klikNaPanel(panel);

        const cil = policko(e.clientX, e.clientY);
        panel.classList.remove('tazeny');
        panel.removeAttribute('style');
        zvyrazni(null);
        if (cil) prohod(panel, cil);
    };
    panel.addEventListener('pointerup', konecTazeni);
    panel.addEventListener('pointercancel', () => {
        start = null;
        tazeni = false;
        panel.classList.remove('tazeny');
        panel.removeAttribute('style');
        zvyrazni(null);
    });

    // Enter / mezerník na klávesnici (u myši řeší klik pointerup)
    panel.addEventListener('click', e => {
        if (e.detail === 0 && !panel.classList.contains('spravne')) klikNaPanel(panel);
    });
}


/* ================================================================
   4. KONTROLA
   ================================================================ */

function zkontroluj() {
    const p = POHADKY[pohadka];
    const titulek = document.getElementById('titulek');
    let spravne = 0;

    if (vybrany) { vybrany.classList.remove('vybrany'); vybrany = null; }
    policka().forEach((c, i) => {
        const panel = c.querySelector('.panel');
        if (Number(panel.dataset.idx) === i) {
            panel.classList.add('spravne');
            spravne++;
        } else {
            panel.classList.add('spatne');
            Hra.efekt(panel, 'trhni');
        }
    });

    if (spravne === p.okenka.length) return vyreseno();

    // Špatná okénka zůstanou červená, dokud je někdo neprohodí (bez zvuku)
    titulek.textContent = spravne
        ? `Správně je ${spravne} z ${p.okenka.length}. Prohoďte ta červená.`
        : 'Ještě to tak nebylo. Zkuste okénka prohodit.';
    Hra.mluv(titulek.textContent);
}

function vyreseno() {
    const p = POHADKY[pohadka];
    Hra.zvuk.vyhra();
    pohadka++;

    // Pod každé okénko se dopíše věta, kterou můžete dětem přečíst
    policka().forEach((c, i) => c.insertAdjacentHTML('beforeend', `<span class="popis objev">${p.okenka[i].text}</span>`));

    const posledni = pohadka >= POHADKY.length;
    document.getElementById('titulek').textContent = 'Přesně tak to bylo!';
    const tlacitko = document.getElementById('zkontrolovat');
    const nove = tlacitko.cloneNode(false);
    nove.disabled = false;
    nove.textContent = posledni ? 'Konec' : 'Další pohádka →';
    tlacitko.replaceWith(nove);
    nove.addEventListener('click', zobrazPohadku);
    Hra.dalsiKlavesou(zobrazPohadku);

    Hra.mluv(p.okenka.map(o => o.text).join(' '));
}

function konec() {
    Hra.postup(postupEl, 0, 0);
    Hra.konecHry(hra, {
        nadpis: 'Všechny pohádky jsou poskládané',
        text: 'Znáte je opravdu dobře.',
        znovu: () => { pohadka = 0; zobrazPohadku(); }
    });
}

uvod();
