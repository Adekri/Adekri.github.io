/**
 * HRA „Čí je to kufr?“
 * Z kufru pohádkové postavy se postupně vytahují typické věci.
 * Třída hádá nahlas, čí kufr to je; učitel pak odhalí visačku se jménem.
 *
 * Ovládání: tlačítka, nebo šipka → / mezerník / prezentér
 * (další věc → odhalit majitele → další kufr).
 */

const POCET_KUFRU = 8;

const hra = document.getElementById('hra');
const postupEl = document.getElementById('postup');

let kufry = [];
let poradi = 0;     // kolikátý kufr
let ukazano = 0;    // kolik věcí je venku
let odhaleno = false;


function uvod() {
    Hra.postup(postupEl, 0, 0);
    hra.innerHTML = `
        <div class="ikona-uvod objev">${Hra.obr('🧳', 'kufr')}</div>
        <h2 class="nadpis objev">Čí je to kufr?</h2>
        <p class="podnadpis objev">Pohádkové postavy si sbalily na cestu. Podle věcí v kufru poznáte, komu patří.</p>
        <button class="tlacitko objev" id="start">Otevřít první kufr</button>`;
    document.getElementById('start').addEventListener('click', start);
    Hra.dalsiKlavesou(start);
}

function start() {
    kufry = Hra.vyber(KUFRY, POCET_KUFRU);
    poradi = 0;
    zobrazKufr();
}

function zobrazKufr() {
    if (poradi >= kufry.length) return konec();

    const k = kufry[poradi];
    ukazano = 1;
    odhaleno = false;
    Hra.postup(postupEl, poradi + 1, kufry.length);

    hra.innerHTML = `
        <div class="scena-kufru">
            <div class="kufr objev">
                <div class="viko"><span class="drzadlo"></span></div>
                <div class="stitek" id="stitek">?</div>
                <div class="telo">
                    <div class="vnitrek" style="--pocet:${k.veci.length}">
                        ${k.veci.map(() => '<div class="slot prazdny"><span class="emoji">?</span></div>').join('')}
                    </div>
                </div>
            </div>
            <div class="majitel objev" id="majitel"><span class="otaznik">?</span></div>
        </div>
        <p class="titulek" id="titulek">Kdo s tímhle kufrem cestuje?</p>
        <div class="radek">
            <button class="tlacitko svetle" id="dalsiVec">Vytáhnout další věc</button>
            <button class="tlacitko" id="odhalit">Čí je to kufr?</button>
        </div>`;

    vykresliVec(0);
    aktualizujTlacitka();

    document.getElementById('dalsiVec').addEventListener('click', dalsiVec);
    document.getElementById('odhalit').addEventListener('click', odhal);
    Hra.dalsiKlavesou(dalsiKrok);
}

/** Klávesa „další“: nejdřív věci, pak odhalení, pak další kufr. */
function dalsiKrok() {
    if (odhaleno) { poradi++; zobrazKufr(); }
    else if (ukazano < kufry[poradi].veci.length) dalsiVec();
    else odhal();
}

function vykresliVec(i) {
    const [emoji, popisek] = kufry[poradi].veci[i];
    const slot = hra.querySelectorAll('.slot')[i];
    slot.classList.remove('prazdny');
    slot.innerHTML = `
        <span class="emoji objev">${Hra.obr(emoji, popisek)}</span>
        <span class="popisek objev">${popisek}</span>`;
    Hra.mluv(popisek);
}

function dalsiVec() {
    if (odhaleno || ukazano >= kufry[poradi].veci.length) return;
    vykresliVec(ukazano++);
    Hra.zvuk.listek();
    aktualizujTlacitka();
}

function aktualizujTlacitka() {
    document.getElementById('dalsiVec').disabled = ukazano >= kufry[poradi].veci.length;
}

function odhal() {
    if (odhaleno) return;
    odhaleno = true;
    const k = kufry[poradi];

    // Dotáhneme zbylé věci, ať je vidět celý kufr
    while (ukazano < k.veci.length) vykresliVec(ukazano++);

    const stitek = document.getElementById('stitek');
    Hra.efekt(stitek, 'otoc');
    setTimeout(() => { stitek.textContent = k.majitel; }, 300);

    const majitel = document.getElementById('majitel');
    majitel.classList.add('odhaleny');
    majitel.innerHTML = k.obr
        ? `<span class="postavy objev">${[].concat(k.obr).map(e => `<span class="emoji">${Hra.obr(e, k.majitel)}</span>`).join('')}</span>`
        : `<span class="nadpis objev">${k.majitel}</span>`;
    Hra.zakrouzkuj(majitel);
    Hra.zvuk.spravne();

    document.getElementById('titulek').textContent = k.veta;
    Hra.mluv(`Je to ${k.majitel}. ${k.veta}`);

    const radek = hra.querySelector('.radek');
    const posledni = poradi + 1 >= kufry.length;
    radek.innerHTML = `<button class="tlacitko objev" id="dalsiKufr">${posledni ? 'Konec' : 'Další kufr →'}</button>`;
    document.getElementById('dalsiKufr').addEventListener('click', () => { poradi++; zobrazKufr(); });
}

function konec() {
    Hra.postup(postupEl, 0, 0);
    Hra.konecHry(hra, {
        ikona: '🧳',
        nadpis: 'Všechny kufry jsou vybalené',
        text: 'Které pohádky si najdete v knihovně?',
        znovu: start
    });
}

uvod();
