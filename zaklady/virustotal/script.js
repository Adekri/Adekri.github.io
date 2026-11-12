/* ============================================================
   Výuková simulace VirusTotal.
   Zpráva o odkazu z úkolu je celá napsaná v index.html
   (#view-report); jakákoli jiná adresa skončí na „No matches found“.
   Stránka je řízená hashem v adrese:
     #/                -> úvodní stránka
     #/url/<adresa>    -> výsledek pro danou adresu
   Pro průvodce (tour) jsou na důležitých prvcích atributy
   data-tour="..." a stránka vysílá události:
     vt:tab      (detail: { tab })     přepnutí FILE/URL/SEARCH
     vt:report   (detail: { query })   zobrazení zprávy
     vt:notfound (detail: { query })   jiná adresa než ta z úkolu
     vt:rtab     (detail: { tab })     přepnutí záložky ve zprávě
   ============================================================ */

const LOADING_MS = 1300;

// Adresy, pro které se ukáže zpráva (bez http://, koncového lomítka, ?… a #…).
const KNOWN_URLS = [
    'free-photoshop.example/download/photoshop-v2.exe',
    'free-photoshop.example'
];

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function emit(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail }));
}

// Odstraní „zneškodnění“ adresy (hxxp, [.]) a doplní http://.
function normalize(input) {
    let url = input.trim()
        .replace(/^hxxp/i, 'http')
        .replace(/%5B/gi, '[').replace(/%5D/gi, ']')
        .replace(/\[\.\]|\(\.\)/g, '.')
        .replace(/\[:\]/g, ':');
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(url)) url = 'http://' + url;
    return url;
}

function reportKey(url) {
    return url.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').replace(/[?#].*$/, '').replace(/\/+$/, '').toLowerCase();
}

function showView(name) {
    $$('.view').forEach((v) => { v.hidden = v.id !== 'view-' + name; });
    window.scrollTo(0, 0);
}

function setHomeTab(tab) {
    $$('.home-tab').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
    $$('.home-panel').forEach((p) => p.classList.toggle('active', p.dataset.panel === tab));
    emit('vt:tab', { tab });
}

function setReportTab(tab) {
    $$('[data-rtab]').forEach((b) => b.classList.toggle('active', b.dataset.rtab === tab));
    $$('[data-rpanel]').forEach((p) => p.classList.toggle('active', p.dataset.rpanel === tab));
    emit('vt:rtab', { tab });
}

function showReport(url) {
    // zadaná adresa se do zprávy doplní na místa označená data-fill
    const fill = { url, https: url.replace(/^http:/i, 'https:') };
    $$('[data-fill]').forEach((el) => { el.textContent = fill[el.dataset.fill]; });
    setReportTab('detection');
    showView('report');
    emit('vt:report', { query: url });
}

/* ---------- routing ---------- */

let loadingTimer = null;

function route() {
    clearTimeout(loadingTimer);
    const match = location.hash.match(/^#\/url\/(.+)$/);
    if (!match) {
        document.title = 'VirusTotal - Home';
        $('#topSearchInput').value = '';
        showView('home');
        return;
    }

    let url;
    try {
        url = decodeURIComponent(match[1]);
    } catch (e) {
        url = match[1];
    }
    $('#topSearchInput').value = url;
    document.title = 'VirusTotal - URL';
    showView('loading');

    loadingTimer = setTimeout(() => {
        if (KNOWN_URLS.includes(reportKey(url))) {
            showReport(url);
        } else {
            $('#nfQuery').textContent = url;
            showView('notfound');
            emit('vt:notfound', { query: url });
        }
    }, LOADING_MS);
}

function search(input) {
    if (!input.trim()) return;
    const hash = '#/url/' + encodeURIComponent(normalize(input));
    if (location.hash === hash) route();
    else location.hash = hash;
}

/* ---------- events ---------- */

[['#urlForm', '#urlInput'], ['#searchForm', '#searchInput'], ['#topSearchForm', '#topSearchInput']]
    .forEach(([form, input]) => {
        $(form).addEventListener('submit', (e) => {
            e.preventDefault();
            search($(input).value);
        });
    });

$$('.home-tab').forEach((b) => b.addEventListener('click', () => setHomeTab(b.dataset.tab)));
$$('[data-rtab]').forEach((b) => b.addEventListener('click', () => setReportTab(b.dataset.rtab)));
$('[data-reanalyze]').addEventListener('click', route);

$$('[data-goto-tab]').forEach((b) => b.addEventListener('click', () => {
    location.hash = '#/';
    setHomeTab(b.dataset.gotoTab);
}));

$('#fileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    $('#fileMsg').textContent = file
        ? `V této výukové kopii nelze soubory nahrávat („${file.name}“ nebyl nikam odeslán). Použijte záložku URL.`
        : '';
});

$('#themeBtn').addEventListener('click', () => {
    const root = document.documentElement;
    if (root.dataset.theme === 'dark') delete root.dataset.theme;
    else root.dataset.theme = 'dark';
});

window.addEventListener('hashchange', route);

// Skutečný VirusTotal otevírá záložku FILE; ?tab=url ji umožní přepnout odkazem.
// Stejně tak ?theme=dark zapne tmavý režim.
const params = new URLSearchParams(location.search);
if (params.get('theme') === 'dark') document.documentElement.dataset.theme = 'dark';
setHomeTab(params.get('tab') || 'file');
route();
