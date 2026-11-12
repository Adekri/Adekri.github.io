/**
 * POHÁDKOVÁ KNIHOVNA — společné funkce pro všechny hry
 * Obsahuje: kreslené obrázky, předčítání hlasem, tóny, ruční značky,
 * ovládání klávesnicí / prezentérem, pomocné funkce.
 *
 * Hry jsou dělané na promítání: děti odpovídají nahlas, učitel kliká.
 * Další krok jde i šipkou →, mezerníkem nebo prezentérem.
 */

const Hra = (() => {

    // Kořen složky „knihovna“ — odvodí se z umístění tohoto skriptu
    const KOREN = new URL('../', document.currentScript.src).href;


    /* ================================================================
       1. OBRÁZKY — kreslené emoji OpenMoji uložené ve složce obrazky/
       ================================================================ */

    function kod(emoji) {
        return [...emoji]
            .map(znak => znak.codePointAt(0).toString(16).toUpperCase())
            .filter(k => k !== 'FE0F')
            .join('-');
    }

    /**
     * Cesta ke kresbě pro dané emoji. Místo emoji jde zadat i jméno
     * vlastní kresby ve složce obrazky/ (např. 'kape' → obrazky/kape.svg).
     */
    function cestaObrazku(emoji) {
        const vlastni = /^[a-z0-9-]+$/.test(emoji);
        return `${KOREN}obrazky/${vlastni ? emoji : kod(emoji)}.svg`;
    }

    /** Vrátí <img> s kresleným obrázkem. */
    function obr(emoji, popis = '') {
        const zaloha = /^[a-z0-9-]+$/.test(emoji) ? '' : ` data-emoji="${emoji}"`;
        return `<img class="obr" src="${cestaObrazku(emoji)}" alt="${popis}" draggable="false"${zaloha}>`;
    }

    // Obrázek, který ve složce obrazky/ chybí (např. v nové pohádce), se zkusí
    // načíst přímo z OpenMoji; když ani to nejde, ukáže se obyčejné emoji.
    document.addEventListener('error', e => {
        const img = e.target;
        if (!(img instanceof HTMLImageElement) || !img.classList.contains('obr') || !img.dataset.emoji) return;
        if (!img.dataset.zkusenoCdn) {
            img.dataset.zkusenoCdn = '1';
            img.src = `https://cdn.jsdelivr.net/npm/openmoji@15.1.0/color/svg/${kod(img.dataset.emoji)}.svg`;
        } else {
            const nahrada = document.createElement('span');
            nahrada.className = 'obr-nahrada';
            nahrada.textContent = img.dataset.emoji;
            img.replaceWith(nahrada);
        }
    }, true);


    /* ----------------------------------------------------------------
       Vlastní obrázky (skutečné obrázky z pohádek) ve složce obrazky-postav/
       Hra zkouší přípony .png, .jpg, .jpeg, .webp. Když soubor chybí,
       ukáže se náhrada (např. kreslená ikonka) — nic se nerozbije.
       ---------------------------------------------------------------- */

    const PRIPONY = ['png', 'jpg', 'jpeg', 'webp'];
    const nahradyFot = new Map();
    let pocitadloFot = 0;

    /**
     * Vrátí <img> s vlastním obrázkem.
     * @param nazev   jméno souboru bez přípony (např. 'bob-a-bobek')
     * @param nahrada HTML, které se ukáže, když obrázek chybí ('' = nic)
     */
    function foto(nazev, nahrada = '', popis = '', trida = '') {
        const id = String(++pocitadloFot);
        nahradyFot.set(id, nahrada);
        return `<img class="foto ${trida}" src="${KOREN}obrazky-postav/${nazev}.${PRIPONY[0]}" alt="${popis}"
                    draggable="false" data-foto="${nazev}" data-pripona="0" data-nahrada="${id}">`;
    }

    document.addEventListener('error', e => {
        const img = e.target;
        if (!(img instanceof HTMLImageElement) || !img.dataset.foto) return;
        const dalsi = Number(img.dataset.pripona) + 1;
        if (dalsi < PRIPONY.length) {
            img.dataset.pripona = dalsi;
            img.src = `${KOREN}obrazky-postav/${img.dataset.foto}.${PRIPONY[dalsi]}`;
            return;
        }
        const rodic = img.parentElement;
        img.outerHTML = nahradyFot.get(img.dataset.nahrada) || '';
        // Prázdné tlačítko ve scéně (obrázek bez náhrady) schováme úplně
        if (rodic && rodic.matches('.vec') && !rodic.children.length) rodic.remove();
    }, true);


    /* ================================================================
       2. PŘEDČÍTÁNÍ — ve výchozím stavu vypnuté (čte učitel)
       ================================================================ */

    const synth = window.speechSynthesis || null;
    const tlHlas = document.getElementById('zvuk');
    let ceskyHlas = null;
    let hlasZapnut = false;
    let generace = 0; // každé nové mluvení zruší čekání toho předchozího

    try { hlasZapnut = localStorage.getItem('knihovna-hlas') === 'zap'; } catch (e) { /* bez úložiště */ }

    function najdiHlas() {
        if (!synth) return;
        const ceske = synth.getVoices().filter(h => /^cs/i.test(h.lang));
        ceskyHlas = ceske.find(h => /natural|google/i.test(h.name)) || ceske[0] || null;
        aktualizujTlacitko();
    }

    function rekni(text, g, hotovo) {
        const konec = () => { if (g === generace && hotovo) hotovo(); };
        if (!hlasZapnut || !ceskyHlas) { setTimeout(konec, 0); return; }
        const u = new SpeechSynthesisUtterance(text);
        u.voice = ceskyHlas;
        u.lang = ceskyHlas.lang;
        u.rate = 0.9;
        u.onend = konec;
        u.onerror = konec;
        synth.speak(u);
    }

    function zastav() {
        generace++;
        if (synth) synth.cancel();
    }

    /** Přečte text (pokud je předčítání zapnuté); po dočtení zavolá hotovo(). */
    function mluv(text, hotovo) {
        zastav();
        rekni(text, generace, hotovo);
    }

    function aktualizujTlacitko() {
        if (!tlHlas) return;
        tlHlas.hidden = !ceskyHlas; // bez českého hlasu tlačítko nemá smysl
        tlHlas.classList.toggle('zapnuto', hlasZapnut);
        tlHlas.title = hlasZapnut ? 'Předčítání zapnuté' : 'Předčítání vypnuté';
        tlHlas.setAttribute('aria-pressed', String(hlasZapnut));
    }

    if (tlHlas) {
        tlHlas.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19.5 5.5a9 9 0 0 1 0 13"/></svg>';
        tlHlas.hidden = true;
        tlHlas.addEventListener('click', () => {
            hlasZapnut = !hlasZapnut;
            try { localStorage.setItem('knihovna-hlas', hlasZapnut ? 'zap' : 'vyp'); } catch (e) { /* bez úložiště */ }
            if (!hlasZapnut) zastav();
            aktualizujTlacitko();
        });
    }

    if (synth) {
        najdiHlas();
        synth.onvoiceschanged = najdiHlas;
    }


    /* ================================================================
       3. CELÁ OBRAZOVKA
       ================================================================ */

    const tlCela = document.getElementById('celaobrazovka');
    if (tlCela) {
        tlCela.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
        if (!document.documentElement.requestFullscreen) {
            tlCela.hidden = true;
        } else {
            tlCela.addEventListener('click', () => {
                if (document.fullscreenElement) document.exitFullscreen();
                else document.documentElement.requestFullscreen().catch(() => {});
            });
        }
    }


    /* ================================================================
       4. ZVUKY — měkký bubínek, bez externích souborů
       Úder = hluboký tón, který rychle spadne (jako napnutá kůže bubnu),
       a krátké tlumené šustnutí. Žádné vysoké tóny, nic nezvoní.
       ================================================================ */

    let audioKontext = null;
    let vystup = null;
    let sum = null;

    function zvukovyRetezec() {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        if (!audioKontext) {
            audioKontext = new AC();
            const a = audioKontext;
            // Tlumené výšky, aby úder zněl měkce a dřevěně
            vystup = a.createBiquadFilter();
            vystup.type = 'lowpass';
            vystup.frequency.value = 1400;
            vystup.connect(a.destination);
            // Šum pro „ťuk“ paličky do kůže
            sum = a.createBuffer(1, a.sampleRate * 0.2, a.sampleRate);
            const data = sum.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        }
        if (audioKontext.state === 'suspended') audioKontext.resume();
        return audioKontext;
    }

    /** Jeden úder na bubínek: ladění v Hz, začátek v sekundách, hlasitost. */
    function buben(ladeni = 150, za = 0, hlasitost = 0.5) {
        const a = zvukovyRetezec();
        if (!a) return;
        const t = a.currentTime + za;

        // Tělo úderu: tón začne o něco výš a hned spadne
        const osc = a.createOscillator();
        const zisk = a.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(ladeni * 1.7, t);
        osc.frequency.exponentialRampToValueAtTime(ladeni, t + 0.035);
        osc.frequency.exponentialRampToValueAtTime(ladeni * 0.8, t + 0.4);
        zisk.gain.setValueAtTime(0, t);
        zisk.gain.linearRampToValueAtTime(hlasitost, t + 0.004);
        zisk.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        osc.connect(zisk).connect(vystup);
        osc.start(t);
        osc.stop(t + 0.45);

        // Ťuk paličky: velmi krátké tlumené šustnutí
        const zdroj = a.createBufferSource();
        const pasmo = a.createBiquadFilter();
        const ziskSumu = a.createGain();
        zdroj.buffer = sum;
        pasmo.type = 'bandpass';
        pasmo.frequency.value = ladeni * 5;
        pasmo.Q.value = 0.8;
        ziskSumu.gain.setValueAtTime(hlasitost * 0.35, t);
        ziskSumu.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
        zdroj.connect(pasmo).connect(ziskSumu).connect(vystup);
        zdroj.start(t);
        zdroj.stop(t + 0.06);
    }

    const zvuk = {
        /** Správná odpověď: „duc duc“. */
        spravne() { buben(165, 0); buben(196, 0.16); },
        /** Chyba: jeden tichý hluboký úder, nic vyčítavého. */
        spatne()  { buben(110, 0, 0.3); },
        /** Drobná akce (další věc z kufru): tiché ťuknutí. */
        listek()  { buben(220, 0, 0.18); },
        /** Hotovo: krátký rytmus na bubínek zakončený hlubším úderem. */
        vyhra()   {
            [[165, 0], [165, 0.14], [196, 0.28], [196, 0.42], [220, 0.56], [220, 0.63], [220, 0.70]]
                .forEach(([f, cas]) => buben(f, cas, 0.42));
            buben(130, 0.9, 0.6);
        }
    };


    /* ================================================================
       5. RUČNÍ ZNAČKY — zakroužkování (správně) a přeškrtnutí (špatně)
       ================================================================ */

    // Tvary jsou nakreslené v rámečku 200 × 120 a přepočítají se na skutečnou
    // velikost prvku, aby čára měla všude stejnou tloušťku.
    function pridejZnacku(el, typ, cesty, presah) {
        const sirka = el.offsetWidth * (1 + 2 * presah.x);
        const vyska = el.offsetHeight * (1 + 2 * presah.y);
        const sx = sirka / 200;
        const sy = vyska / 120;
        const d = cesty.map(c => c.replace(/(-?[\d.]+) (-?[\d.]+)/g,
            (_, x, y) => `${(x * sx).toFixed(1)} ${(y * sy).toFixed(1)}`));
        el.insertAdjacentHTML('beforeend', `
            <svg class="znacka ${typ}" viewBox="0 0 ${sirka} ${vyska}" preserveAspectRatio="none" aria-hidden="true"
                style="left:${-presah.x * 100}%;top:${-presah.y * 100}%;width:${(1 + 2 * presah.x) * 100}%;height:${(1 + 2 * presah.y) * 100}%">
                ${d.map(c => `<path pathLength="1" d="${c}"/>`).join('')}
            </svg>`);
    }

    function zakrouzkuj(el, cervene = false) {
        pridejZnacku(el, cervene ? 'krouzek cerveny' : 'krouzek',
            ['M 64 10 C 124 0, 198 18, 194 62 C 190 106, 108 120, 52 108 C 8 98, 2 54, 26 30 C 44 12, 84 4, 118 9'],
            { x: 0.08, y: 0.1 });
    }

    function preskrtni(el) {
        pridejZnacku(el, 'skrt',
            ['M 16 16 C 70 48, 132 80, 186 106', 'M 184 14 C 128 46, 72 80, 18 104'],
            { x: 0, y: 0 });
    }


    /* ================================================================
       6. OVLÁDÁNÍ — šipka →, mezerník, Enter, PageDown (prezentér)
       ================================================================ */

    let naDalsi = null;

    /** Nastaví, co se stane při stisku „další“. null = nic. */
    function dalsiKlavesou(fn) {
        naDalsi = fn;
    }

    document.addEventListener('keydown', e => {
        if (!naDalsi || e.repeat) return;
        if (!['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) return;
        // Mezerník/Enter na tlačítku s fokusem už klikne sám
        if ((e.key === ' ' || e.key === 'Enter') && document.activeElement?.tagName === 'BUTTON') return;
        e.preventDefault();
        naDalsi();
    });


    /* ================================================================
       7. POMOCNÉ FUNKCE
       ================================================================ */

    function postup(el, hotovo, celkem) {
        if (el) el.textContent = celkem ? `${hotovo} / ${celkem}` : '';
    }

    function zamichej(pole) {
        const a = [...pole];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function vyber(pole, pocet) {
        return zamichej(pole).slice(0, pocet);
    }

    /** Spustí CSS animaci znovu, i když už na prvku jednou proběhla. */
    function efekt(el, trida) {
        el.classList.remove(trida);
        void el.offsetWidth;
        el.classList.add(trida);
    }

    // Po doběhnutí úvodní animace třídu odebereme, aby nepřebíjela další efekty
    document.addEventListener('animationend', e => {
        if (e.animationName === 'objeveni') e.target.classList.remove('objev');
    });

    /** Závěrečná obrazovka. */
    function konecHry(hraEl, { ikona = '📚', nadpis = 'Konec', text = '', znovu }) {
        hraEl.innerHTML = `
            <div class="ikona-uvod objev">${obr(ikona)}</div>
            <h2 class="nadpis objev">${nadpis}</h2>
            ${text ? `<p class="podnadpis objev">${text}</p>` : ''}
            <div class="radek objev">
                <button class="tlacitko" id="hratZnovu">Hrát znovu</button>
                <a class="tlacitko svetle" href="${KOREN}index.html">Jiná hra</a>
            </div>`;
        hraEl.querySelector('#hratZnovu').addEventListener('click', znovu);
        dalsiKlavesou(null);
        mluv(`${nadpis} ${text}`);
    }

    return { obr, cestaObrazku, foto, mluv, zastav, zvuk, zakrouzkuj, preskrtni, dalsiKlavesou, postup, zamichej, vyber, efekt, konecHry };
})();
