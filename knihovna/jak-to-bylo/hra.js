/**
 * HRA „Jak to bylo dál?“
 * Okénka z pohádky jsou zamíchaná a třída je skládá do správného pořadí.
 * Okénka jsou SVG scény poskládané z kreseb, data jsou v souboru pribehy.js.
 *
 * Ovládání: okénko se přetáhne do políčka (myší, prstem na tabuli).
 * Klik na okénko ho vloží do prvního volného políčka, nebo vrátí zpět dolů.
 */

const hra = document.getElementById('hra');
const postupEl = document.getElementById('postup');

// Barvy pozadí okének: obloha / stěna a země / podlaha, horizont v procentech
const POZADI = {
    den:   { nebe: '#d6e6e8', zeme: '#c5d6a2', horizont: 56 },
    les:   { nebe: '#cfe0cc', zeme: '#a9c48f', horizont: 56 },
    vecer: { nebe: '#d9d2e6', zeme: '#b4c89a', horizont: 56 },
    pokoj: { nebe: '#eadbc0', zeme: '#c9a97a', horizont: 66 }
};

let pohadka = 0;


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
    const pocet = p.okenka.length;
    Hra.postup(postupEl, pohadka + 1, POHADKY.length);
    Hra.dalsiKlavesou(null);

    // Zamícháme tak, aby okénka nebyla hned správně
    let poradi = p.okenka.map((_, i) => i);
    do { poradi = Hra.zamichej(poradi); } while (poradi.every((v, i) => v === i));

    hra.innerHTML = `
        <h2 class="nazev-pohadky">${p.nazev}</h2>
        <div class="rada">
            ${p.okenka.map((_, i) => `<div class="policko cil" data-i="${i}"><span class="cislo">${i + 1}</span></div>`).join('')}
        </div>
        <div class="ovladani">
            <p class="titulek" id="titulek">Přetáhněte okénka do políček.</p>
            <button class="tlacitko mensi" id="zkontrolovat" disabled>Zkontrolovat</button>
        </div>
        <div class="rada zasobniky">
            ${poradi.map(idx => `
                <div class="policko zasobnik">
                    <button class="panel objev" data-idx="${idx}">${panelSvg(p.okenka[idx])}</button>
                </div>`).join('')}
        </div>
        <div class="rada popisy" hidden>${p.okenka.map(o => `<p>${o.text}</p>`).join('')}</div>`;

    hra.querySelectorAll('.panel').forEach(pripravPanel);
    document.getElementById('zkontrolovat').addEventListener('click', zkontroluj);
    Hra.mluv(`${p.nazev}. Poskládejte okénka tak, jak šla v pohádce za sebou.`);

    aktualizuj(pocet);
}

const cile = () => [...hra.querySelectorAll('.policko.cil')];
const zasobniky = () => [...hra.querySelectorAll('.policko.zasobnik')];

function aktualizuj() {
    const vse = cile().every(c => c.querySelector('.panel'));
    document.getElementById('zkontrolovat').disabled = !vse;
}

/** Vloží okénko do políčka a případné obsazené okénko pošle na místo, odkud přišlo nové. */
function vloz(panel, kam) {
    const odkud = panel.parentElement;
    if (kam === odkud) return;
    const obsazene = kam.querySelector('.panel');
    if (obsazene) {
        if (obsazene.classList.contains('spravne')) return;
        odkud.appendChild(obsazene);
    }
    panel.classList.remove('spatne');
    kam.appendChild(panel);
    Hra.zvuk.listek();
    aktualizuj();
}

/** Klik bez tažení: z dolní řady do prvního volného políčka, z políčka zpět dolů. */
function klikNaPanel(panel) {
    const jeVCili = panel.parentElement.classList.contains('cil');
    const volne = (jeVCili ? zasobniky() : cile()).find(c => !c.querySelector('.panel'));
    if (volne) vloz(panel, volne);
}


/* ================================================================
   3. PŘETAHOVÁNÍ — funguje myší, prstem i na interaktivní tabuli
   ================================================================ */

function pripravPanel(panel) {
    let start = null;   // kde tah začal
    let tazeni = false;

    const policko = (x, y) => document.elementFromPoint(x, y)?.closest('.policko') || null;
    const zvyrazni = cil => cile().forEach(c => c.classList.toggle('nad', c === cil));

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
        if (cil) vloz(panel, cil);
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

    cile().forEach((c, i) => {
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

    Hra.zvuk.spatne();
    titulek.textContent = spravne
        ? `Správně je ${spravne} z ${p.okenka.length}. Zkuste přesunout ty červené.`
        : 'Ještě to tak nebylo. Zkuste to jinak.';
    Hra.mluv(titulek.textContent);

    // Špatná okénka se po chvíli vrátí dolů
    document.getElementById('zkontrolovat').disabled = true;
    setTimeout(() => {
        cile().forEach(c => {
            const panel = c.querySelector('.panel.spatne');
            if (panel) klikNaPanel(panel);
        });
    }, 1100);
}

function vyreseno() {
    const p = POHADKY[pohadka];
    Hra.zvuk.spravne();
    pohadka++;

    hra.querySelector('.zasobniky').hidden = true;
    hra.querySelector('.popisy').hidden = false;

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
