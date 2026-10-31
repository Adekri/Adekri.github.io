/**
 * HRA „Popletená pohádka“
 * V obrázku z pohádky se schovaly věci, které tam nepatří.
 * Třída je hledá a učitel na ně klikne. Scény jsou v souboru sceny.js.
 */

const hra = document.getElementById('hra');
const postupEl = document.getElementById('postup');

const CISLOVKY = { 1: 'jednu věc', 2: 'dvě věci', 3: 'tři věci', 4: 'čtyři věci' };

let scena = 0;

function velkePismeno(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Obrázek věci ve scéně: vlastní obrázek (pokud existuje), jinak kreslená ikonka.
 * Krtčí hromádka se kreslí v CSS (v sadě obrázků není).
 */
function obrazekVeci(v) {
    const kresba = v.e === 'hromadka' ? '<span class="hromadka"></span>' : (v.e ? Hra.obr(v.e, v.n) : '');
    return v.foto ? Hra.foto(v.foto, kresba, v.n) : kresba;
}

/** Věc stojí spodním okrajem na [x, y]; čím je níž, tím víc vpředu. */
function polohaVeci(v) {
    return `left:${v.x}%;top:${v.y}%;--s:${v.s};z-index:${v.z ?? Math.round(v.y)}`;
}

function uvod() {
    Hra.postup(postupEl, 0, 0);
    hra.innerHTML = `
        <div class="ikona-uvod objev">${Hra.obr('🔍', 'lupa')}</div>
        <h2 class="nadpis objev">Popletená pohádka</h2>
        <p class="podnadpis objev">Někdo nám popletl obrázky z pohádek. Najdete věci, které do nich nepatří?</p>
        <button class="tlacitko objev" id="start">Začít</button>`;
    const start = () => { scena = 0; zobrazScenu(); };
    document.getElementById('start').addEventListener('click', start);
    Hra.dalsiKlavesou(start);
}

function zobrazScenu() {
    if (scena >= SCENY.length) return konec();

    const s = SCENY[scena];
    const cizich = s.veci.filter(v => v.cizi).length;
    const ukol = `Najděte ${CISLOVKY[cizich] || cizich + ' věcí'}, které do pohádky nepatří.`;
    let nalezeno = 0;

    Hra.postup(postupEl, scena + 1, SCENY.length);
    Hra.dalsiKlavesou(null);

    hra.innerHTML = `
        <div class="zahlavi">
            <div>
                <h2 class="nazev-pohadky">${s.nazev}</h2>
                <p class="ukol" id="ukol">${ukol}</p>
            </div>
            <div class="nalezene">${'<span class="misto">?</span>'.repeat(cizich)}</div>
        </div>
        <div class="scena objev" style="--nebe:${s.nebe};--nebe2:${s.nebe2};--zeme:${s.zeme};--zeme2:${s.zeme2};--horizont:${s.horizont}">
            ${(s.kulisy || []).map(v => `
                <span class="vec kulisa" aria-hidden="true" style="${polohaVeci(v)}">${obrazekVeci(v)}</span>`).join('')}
            ${s.veci.map((v, i) => `
                <button class="vec" data-i="${i}" aria-label="${v.n}" style="${polohaVeci(v)}">${obrazekVeci(v)}</button>`).join('')}
        </div>
        <p class="titulek" id="titulek"></p>`;

    Hra.mluv(`${s.nazev}. ${ukol}`);

    const titulek = document.getElementById('titulek');
    const mista = hra.querySelectorAll('.nalezene .misto');

    hra.querySelectorAll('button.vec').forEach(tl => {
        tl.addEventListener('click', () => {
            const v = s.veci[tl.dataset.i];

            if (!v.cizi) {
                Hra.efekt(tl, 'kyv');
                Hra.zvuk.spatne();
                titulek.textContent = `${velkePismeno(v.n)} do pohádky patří.`;
                Hra.mluv(titulek.textContent);
                return;
            }

            // Nalezená věc se zakroužkuje a objeví se i v přihrádce nahoře
            tl.disabled = true;
            Hra.zakrouzkuj(tl, true);
            nalezeno_(v.e, v.n, v.zprava || `${velkePismeno(v.n)} do pohádky nepatří!`);
        });
    });

    function nalezeno_(emoji, nazev, zprava) {
        const misto = mista[nalezeno++];
        misto.innerHTML = Hra.obr(emoji, nazev);
        misto.classList.add('plne');
        Hra.zvuk.spravne();
        titulek.textContent = zprava;
        Hra.mluv(zprava);
        if (nalezeno === cizich) hotovaScena();
    }
}

function hotovaScena() {
    scena++;
    hra.querySelectorAll('button.vec').forEach(tl => { tl.disabled = true; });

    const posledni = scena >= SCENY.length;
    // Tlačítko jde vedle přihrádek, aby záhlaví nezměnilo výšku a scéna neposkočila
    hra.querySelector('.zahlavi').insertAdjacentHTML('beforeend',
        `<button class="tlacitko mensi objev" id="dalsi">${posledni ? 'Konec' : 'Další pohádka →'}</button>`);
    document.getElementById('dalsi').addEventListener('click', zobrazScenu);
    Hra.dalsiKlavesou(zobrazScenu);
}

function konec() {
    Hra.postup(postupEl, 0, 0);
    Hra.konecHry(hra, {
        nadpis: 'Pohádky jsou zase v pořádku',
        text: 'Všechno, co do nich nepatřilo, jste našli.',
        znovu: () => { scena = 0; zobrazScenu(); }
    });
}

uvod();
