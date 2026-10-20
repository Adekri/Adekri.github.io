/**
 * POHÁDKOVÁ KNIHOVNA — společné funkce pro všechny hry
 * Obsahuje: předčítání hlasem, zvuky, konfety, hvězdičky, pochvaly, pomocné funkce
 *
 * Předčítání používá český hlas prohlížeče. Pokud ho zařízení nemá,
 * hra funguje dál a otázky přečte paní učitelka (texty jsou na obrazovce).
 */

const Hra = (() => {

    /* ================================================================
       1. HLAS — předčítání textů česky
       ================================================================ */

    const synth = window.speechSynthesis || null;
    const tlZvuk = document.getElementById('zvuk');
    let ceskyHlas = null;
    let zvukZapnut = true;
    let generace = 0; // každé nové mluvení zruší čekání toho předchozího

    try { zvukZapnut = localStorage.getItem('knihovna-zvuk') !== 'vyp'; } catch (e) { /* bez úložiště */ }

    function najdiHlas() {
        if (!synth) return;
        const ceske = synth.getVoices().filter(h => /^cs/i.test(h.lang));
        // Přirozeněji znějící hlasy (Google, Microsoft Natural) mají přednost
        ceskyHlas = ceske.find(h => /natural|google/i.test(h.name)) || ceske[0] || null;
        aktualizujTlacitko();
    }

    function muzeMluvit() {
        return zvukZapnut && synth && ceskyHlas;
    }

    function rekni(text, g, hotovo) {
        const konec = () => { if (g === generace && hotovo) hotovo(); };
        if (!muzeMluvit()) {
            // Bez hlasu počkáme přibližně tak dlouho, jak dlouho by se text četl
            setTimeout(konec, Math.max(700, text.length * 55));
            return;
        }
        const u = new SpeechSynthesisUtterance(text);
        u.voice = ceskyHlas;
        u.lang = ceskyHlas.lang;
        u.rate = 0.92;
        u.pitch = 1.05;
        u.onend = konec;
        u.onerror = konec;
        synth.speak(u);
    }

    function zastav() {
        generace++;
        if (synth) synth.cancel();
    }

    /** Přečte text; po dočtení zavolá hotovo(). */
    function mluv(text, hotovo) {
        zastav();
        rekni(text, generace, hotovo);
    }

    /** Přečte několik textů po sobě; každý krok může mít zacatek() (např. zvýraznění karty). */
    function mluvPostupne(kroky, hotovo) {
        zastav();
        const g = generace;
        let i = 0;
        const dalsi = () => {
            if (g !== generace) return;
            if (i >= kroky.length) { if (hotovo) hotovo(); return; }
            const krok = kroky[i++];
            if (krok.zacatek) krok.zacatek();
            rekni(krok.text, g, dalsi);
        };
        dalsi();
    }

    function aktualizujTlacitko() {
        if (!tlZvuk) return;
        tlZvuk.textContent = zvukZapnut ? '🔊' : '🔇';
        tlZvuk.title = !zvukZapnut
            ? 'Zvuk je vypnutý'
            : (synth && ceskyHlas ? 'Vypnout zvuk' : 'Český hlas v tomto zařízení není – otázky přečte paní učitelka');
    }

    if (synth) {
        najdiHlas();
        synth.onvoiceschanged = najdiHlas;
    }
    aktualizujTlacitko();

    if (tlZvuk) {
        tlZvuk.addEventListener('click', () => {
            zvukZapnut = !zvukZapnut;
            try { localStorage.setItem('knihovna-zvuk', zvukZapnut ? 'zap' : 'vyp'); } catch (e) { /* bez úložiště */ }
            if (!zvukZapnut) zastav();
            aktualizujTlacitko();
        });
    }


    /* ================================================================
       2. CELÁ OBRAZOVKA — hodí se na interaktivní tabuli
       ================================================================ */

    const tlCela = document.getElementById('celaobrazovka');
    if (tlCela) {
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
       3. ZVUKY — krátké tóny bez externích souborů
       ================================================================ */

    let audioKontext = null;

    function audio() {
        if (!audioKontext) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (!AC) return null;
            audioKontext = new AC();
        }
        if (audioKontext.state === 'suspended') audioKontext.resume();
        return audioKontext;
    }

    function ton(frekvence, za, delka, typ = 'sine', hlasitost = 0.18) {
        if (!zvukZapnut) return;
        const a = audio();
        if (!a) return;
        const osc = a.createOscillator();
        const zisk = a.createGain();
        const t = a.currentTime + za;
        osc.type = typ;
        osc.frequency.value = frekvence;
        zisk.gain.setValueAtTime(0, t);
        zisk.gain.linearRampToValueAtTime(hlasitost, t + 0.02);
        zisk.gain.exponentialRampToValueAtTime(0.001, t + delka);
        osc.connect(zisk).connect(a.destination);
        osc.start(t);
        osc.stop(t + delka + 0.05);
    }

    const zvuk = {
        spravne() { [523, 659, 784].forEach((f, i) => ton(f, i * 0.09, 0.3)); },
        spatne()  { ton(330, 0, 0.18, 'triangle', 0.12); ton(262, 0.15, 0.3, 'triangle', 0.12); },
        klik()    { ton(880, 0, 0.08, 'sine', 0.08); },
        vyhra()   { [523, 659, 784, 1047, 784, 1047].forEach((f, i) => ton(f, i * 0.12, 0.35)); }
    };


    /* ================================================================
       4. RADOST — konfety, bublina, pochvaly, hvězdičky
       ================================================================ */

    const POCHVALY = ['Výborně!', 'Super!', 'Paráda!', 'Jsi šikula!', 'Bravo!', 'Skvělé!', 'Správně!'];

    function pochvala() {
        return POCHVALY[Math.floor(Math.random() * POCHVALY.length)];
    }

    function konfety(kusu = 40) {
        const tvary = ['⭐', '✨', '🎉', '💛', '🌟', '🎈'];
        for (let i = 0; i < kusu; i++) {
            const k = document.createElement('span');
            k.className = 'konfeta';
            k.textContent = tvary[i % tvary.length];
            k.style.left = Math.random() * 100 + 'vw';
            k.style.animationDelay = Math.random() * 0.8 + 's';
            k.style.setProperty('--dx', (Math.random() * 30 - 15) + 'vw');
            k.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
            document.body.appendChild(k);
            setTimeout(() => k.remove(), 4000);
        }
    }

    function bublina(text) {
        document.querySelectorAll('.bublina').forEach(b => b.remove());
        const b = document.createElement('div');
        b.className = 'bublina';
        b.textContent = text;
        document.body.appendChild(b);
        setTimeout(() => b.remove(), 1900);
    }

    /** Vykreslí hvězdičky: kolik je hotovo z kolika. */
    function hvezdy(el, hotovo, celkem) {
        if (!el) return;
        el.innerHTML = Array.from({ length: celkem }, (_, i) =>
            `<span class="${i < hotovo ? (i === hotovo - 1 ? 'nova' : '') : 'prazdna'}">⭐</span>`
        ).join('');
    }

    /** Závěrečná obrazovka s pohárem. */
    function konecHry(hraEl, { ikona = '🏆', nadpis = 'Hotovo!', text = '', znovu }) {
        zvuk.vyhra();
        konfety(60);
        hraEl.innerHTML = `
            <div class="ikona-uvod objev">${ikona}</div>
            <h2 class="nadpis objev">${nadpis}</h2>
            ${text ? `<p class="podnadpis objev">${text}</p>` : ''}
            <div class="radek objev">
                <button class="tlacitko" id="hratZnovu">🔄 Hrát znovu</button>
                <a class="tlacitko svetle" href="../index.html">🏠 Jiná hra</a>
            </div>`;
        hraEl.querySelector('#hratZnovu').addEventListener('click', znovu);
        mluv(`${nadpis} ${text}`);
    }


    /* ================================================================
       5. POMOCNÉ FUNKCE
       ================================================================ */

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

    // Po doběhnutí úvodní animace třídu odebereme, aby nepřebíjela další efekty (zvýraznění apod.)
    document.addEventListener('animationend', e => {
        if (e.animationName === 'objeveni') e.target.classList.remove('objev');
    });

    return { mluv, mluvPostupne, zastav, zvuk, pochvala, konfety, bublina, hvezdy, konecHry, zamichej, vyber, efekt };
})();
