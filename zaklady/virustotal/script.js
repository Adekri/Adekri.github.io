/* ============================================================
   Výuková simulace VirusTotal.
   Stránka je řízená hashem v adrese:
     #/                -> úvodní stránka
     #/url/<adresa>    -> výsledek pro danou adresu
   Pro průvodce (tour) jsou na důležitých prvcích atributy
   data-tour="..." a stránka vysílá události:
     vt:tab     (detail: { tab })            přepnutí FILE/URL/SEARCH
     vt:report  (detail: { query, report })  zobrazení výsledku
     vt:notfound(detail: { query })          adresa není v databázi
     vt:rtab    (detail: { tab })            přepnutí záložky ve výsledku
   ============================================================ */

const LOADING_MS = 1300;

// Dodavatelé, kteří adresu z úkolu označí jako škodlivou.
const FLAGGING = {
    'ADMINUSLabs': 'Malicious', 'AILabs (MONITORAPP)': 'Malicious', 'AlienVault': 'Malicious',
    'alphaMountain.ai': 'Malicious', 'Antiy-AVL': 'Malicious', 'BitDefender': 'Malware', 'Certego': 'Malicious',
    'Chong Lua Dao': 'Malicious', 'CMC Threat Intelligence': 'Malware', 'CRDF': 'Malicious',
    'Criminal IP': 'Malicious', 'Cyble': 'Malicious', 'CyRadar': 'Malicious', 'Dr.Web': 'Malicious',
    'EmergingThreats': 'Malware', 'Emsisoft': 'Malware', 'ESTsecurity': 'Malicious',
    'Forcepoint ThreatSeeker': 'Malicious', 'Fortinet': 'Malware', 'G-Data': 'Malware',
    'Google Safebrowsing': 'Malicious', 'Gridinsoft': 'Malware', 'Heimdal Security': 'Malicious',
    'Juniper Networks': 'Malicious', 'Kaspersky': 'Malware', 'Lionic': 'Malware', 'MalwarePatrol': 'Malicious',
    'Quick Heal': 'Malware', 'Quttera': 'Malicious', 'Rising': 'Malware', 'Sangfor': 'Malware',
    'Seclookup': 'Malicious', 'SOCRadar': 'Malware', 'Sophos': 'Malware', 'Sucuri SiteCheck': 'Malicious',
    'Trustwave': 'Malicious', 'URLhaus': 'Malware', 'Viettel Threat Intelligence': 'Malicious',
    'VIPRE': 'Malware', 'VX Vault': 'Malware', 'Webroot': 'Malicious', 'Xcitium Verdict Cloud': 'Malware',
    'ESET': 'Suspicious'
};

const CLEAN_VENDORS = [
    'Abusix', 'Acronis', 'ArcSight Threat Intelligence', 'Artists Against 419', 'benkow.cc', 'Bkav', 'Blueliv',
    'CINS Army', 'CSIS Security Group', 'Cyan', 'desenmascara.me', 'DNS8', 'GreenSnow', 'IPsum', 'Malwared',
    'malwares.com URL checker', 'OpenPhish', 'Phishing Database', 'Phishtank', 'PREBYTES', 'Sansec eComscan',
    'Scantitan', 'SCUMWARE.org', 'securolytics', 'Snort IP sample list', 'Spam404', 'StopForumSpam',
    'ThreatHive', 'Threatsourcing', 'Underworld', 'URLQuery', 'ViriBack', 'Yandex Safebrowsing', 'ZeroCERT'
];

const UNRATED_VENDORS = [
    '0xSI_f33d', 'AlphaSOC', 'AutoShun', 'Bfore.Ai PreCrime', 'Cluster25', 'Ermes', 'GCP Abuse Intelligence',
    'Hunt.io Intelligence', 'Lumu', 'MalwareURL', 'Mimecast', 'Netcraft', 'PhishFort', 'PhishLabs',
    'PrecisionSec', 'SafeToOpen', 'zvelo'
];

const MALICIOUS_COMMENTS = [
    {
        user: 'thor_scanner',
        ago: '7 months ago',
        text: 'Fake Adobe Photoshop installer. The dropped payload is an info-stealer (browser passwords, cookies, crypto wallets). Do not run.'
    },
    {
        user: 'malware_hunter_cz',
        ago: '7 months ago',
        text: 'Distributed via a "free Photoshop" landing page. Same IP hosts other fake cracked software downloads. #stealer #fakeinstaller'
    }
];

const MALICIOUS_CATEGORIES = {
    'alphaMountain.ai': 'Malicious (alphaMountain.ai)',
    'Sophos': 'spyware and malware',
    'Webroot': 'Malware Sites',
    'Forcepoint ThreatSeeker': 'malicious web sites'
};


const MALICIOUS_COMMUNITY = {
    graphs: [{ user: 'net.watcher', name: 'free-photoshop.example', date: '2025-06-08 06:35:57' }],
    votes: [{ user: 'safesurf_2024', ago: '1 year ago', value: -1 }]
};

// Databáze známých adres.
const REPORTS = {
    'free-photoshop.example/download/photoshop-v2.exe': {
        malicious: true,
        date: '2026-02-17T10:24:14Z',
        firstSeen: '2025-05-18T21:57:42Z',
        ip: '203.0.113.111',
        communityScore: -1,
        comments: MALICIOUS_COMMENTS,
        graphs: MALICIOUS_COMMUNITY.graphs,
        votes: MALICIOUS_COMMUNITY.votes,
        categories: MALICIOUS_CATEGORIES
    },
    'free-photoshop.example': {
        malicious: true,
        date: '2026-02-17T10:24:14Z',
        firstSeen: '2025-05-18T21:57:42Z',
        ip: '203.0.113.111',
        communityScore: -1,
        comments: MALICIOUS_COMMENTS,
        graphs: MALICIOUS_COMMUNITY.graphs,
        votes: MALICIOUS_COMMUNITY.votes,
        categories: MALICIOUS_CATEGORIES
    },
    'www.adobe.com': {
        malicious: false,
        date: '2026-10-07T08:12:41Z',
        firstSeen: '2011-03-02T09:14:08Z',
        ip: '23.214.92.202',
        status: '200',
        contentType: 'text/html',
        communityScore: 0,
        comments: [],
        graphs: [],
        votes: [],
        categories: { 'Forcepoint ThreatSeeker': 'information technology', 'Sophos': 'information technology' }
    }
};
REPORTS['adobe.com'] = REPORTS['www.adobe.com'];
REPORTS['www.adobe.com/products/photoshop.html'] = REPORTS['www.adobe.com'];
REPORTS['www.adobe.com/cz/products/photoshop.html'] = REPORTS['www.adobe.com'];

/* ---------- helpers ---------- */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function emit(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail }));
}

function esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function icon(id) {
    return `<svg><use href="#${id}" /></svg>`;
}

// Odstraní "zneškodnění" adresy (hxxp, [.]) a sjednotí zápis.
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

function timeAgo(dateStr) {
    const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
    if (days < 1) return 'a moment ago';
    if (days < 30) return days === 1 ? '1 day ago' : `${days} days ago`;
    const months = Math.floor(days / 30.44);
    if (months < 12) return months === 1 ? '1 month ago' : `${months} months ago`;
    const years = Math.floor(months / 12);
    return years === 1 ? '1 year ago' : `${years} years ago`;
}

function formatDate(dateStr) {
    return new Date(dateStr).toISOString().replace('T', ' ').replace(/\.\d+Z$/, ' UTC');
}

function buildVendors(report) {
    const byName = (a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
    const flagged = Object.entries(FLAGGING).map(([name, verdict]) => ({ name, verdict }));
    const clean = CLEAN_VENDORS.map((name) => ({ name, verdict: 'Clean' }));
    const unrated = UNRATED_VENDORS.map((name) => ({ name, verdict: 'Unrated' }));

    if (!report.malicious) {
        flagged.forEach((v) => { v.verdict = 'Clean'; });
        return [...flagged, ...clean].sort(byName).concat(unrated.sort(byName));
    }
    const bad = flagged.filter((v) => v.verdict !== 'Suspicious').sort(byName);
    const suspicious = flagged.filter((v) => v.verdict === 'Suspicious').sort(byName);
    return [...bad, ...suspicious, ...clean.sort(byName), ...unrated.sort(byName)];
}

function verdictHtml(verdict) {
    const kind = { Clean: 'clean', Unrated: 'unrated', Suspicious: 'suspicious' }[verdict] || 'bad';
    const ico = { clean: 'i-ok', unrated: 'i-unrated', suspicious: 'i-info', bad: 'i-bad' }[kind];
    return `<span class="verdict ${kind}">${icon(ico)} ${verdict}</span>`;
}

/* ---------- views ---------- */

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
    $$('.report-tabs button').forEach((b) => b.classList.toggle('active', b.dataset.rtab === tab));
    $$('.rpanel').forEach((p) => p.classList.toggle('active', p.dataset.rpanel === tab));
    emit('vt:rtab', { tab });
}

function renderReport(url, report) {
    const vendors = buildVendors(report);
    const detections = vendors.filter((v) => ['Malicious', 'Malware', 'Phishing'].includes(v.verdict)).length;
    const total = vendors.length;

    // skóre
    const gauge = $('#gaugeValue');
    const circumference = 2 * Math.PI * 45;
    const fraction = report.malicious ? detections / total : 1;
    gauge.style.strokeDasharray = circumference;
    gauge.style.strokeDashoffset = circumference;
    gauge.parentNode.parentNode.classList.toggle('clean', !report.malicious);
    requestAnimationFrame(() => requestAnimationFrame(() => {
        gauge.style.strokeDashoffset = circumference * (1 - fraction);
    }));
    $('#scoreNum').textContent = detections;
    $('#scoreTotal').textContent = '/ ' + total;

    const cs = $('#communityScore');
    cs.textContent = report.communityScore;
    cs.classList.toggle('neg', report.communityScore < 0);

    // hlavička
    const host = reportKey(url).split('/')[0];
    $('#reportDate').textContent = formatDate(report.date);
    $('#reportUrl').textContent = url;
    $('#reportHost').textContent = host + ' ' + report.ip;
    $('#metaStatus').textContent = report.status || '-';
    $('#metaType').textContent = report.contentType || '-';
    $('#metaAgo').textContent = timeAgo(report.date);
    const communityItems = report.graphs.length + report.votes.length + report.comments.length;
    $('#communityCount').textContent = communityItems;
    $('#communityCount').hidden = communityItems === 0;

    // detection
    $('#vendorList').innerHTML = vendors.map((v) =>
        `<div class="vendor"><span>${esc(v.name)}</span>${verdictHtml(v.verdict)}</div>`).join('');

    const info = icon('i-info');
    const unknownSource = '<span class="src-unknown">?</span> UNKNOWN OR UNSPECIFIED';
    const historyBox = `
        <div class="box"><h3 class="strong">History ${info}</h3><div class="box-body"><dl class="kv">
            <dt>First Submission</dt><dd>${formatDate(report.firstSeen)} - ${unknownSource}</dd>
            <dt>Last Submission</dt><dd>${formatDate(report.date)} - ${unknownSource}</dd>
            <dt>Last Analysis</dt><dd>${formatDate(report.date)}</dd>
        </dl></div></div>`;
    const pills = (items) => items.map((t) => `<span>${esc(t)}</span>`).join('');

    // summary
    const reachable = Boolean(report.status);
    const stats = [
        ['i-file', 'Network Requests', reachable ? '48' : '2'],
        ['i-code', 'HTTPS Requests', reachable ? '100%' : '50%'],
        ['i-window', 'Domains', reachable ? '9' : '1'],
        ['i-pin', 'IP Addresses', reachable ? '6' : '0'],
        ['i-pin', 'IPv6 Addresses', '0%'],
        ['i-globe', 'Countries', reachable ? '2' : '0'],
        ['i-resize', 'Response Size', reachable ? '1.2 MB' : '0 B'],
        ['i-cookie', 'Cookies', reachable ? '7' : '0']
    ].map(([ico, label, value]) =>
        `<div class="stat">${icon(ico)}<b>${label}</b>${info}<span class="pill">${value}</span></div>`).join('');

    $('#panelSummary').innerHTML = `
        <div class="box"><h3 class="strong">Page Stats</h3><div class="box-body stats">${stats}</div></div>
        <div class="box"><h3 class="strong">URL Overview</h3><div class="box-body"><dl class="kv kv-wide">
            <dt>Vendors Analysis:</dt>
            <dd class="summary-verdict ${report.malicious ? 'bad' : 'clean'}">
                ${icon(report.malicious ? 'i-bad' : 'i-ok')}
                ${report.malicious
            ? `${detections}/${total} security vendors flagged this URL as malicious`
            : 'No security vendors flagged this URL as malicious'}
            </dd>
            <dt>Final URL:</dt><dd>${esc(url)}</dd>
            <dt>Domain:</dt><dd>${esc(host)}</dd>
            <dt>Serving IP:</dt><dd>${reachable ? esc(report.ip) : '-'}</dd>
            <dt>Current Status Code:</dt><dd>${reachable ? esc(report.status) : 'Error ()'}</dd>
            <dt>Category:</dt><dd class="tags">${pills(Object.values(report.categories))}</dd>
        </dl></div></div>
        ${historyBox}`;

    // details
    const categories = Object.entries(report.categories)
        .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
    const httpsUrl = url.replace(/^http:/i, 'https:');
    const score = `<span class="${report.malicious ? 'det-bad' : 'det-ok'}">${detections}</span> / ${total}`;
    $('#panelDetails').innerHTML = `
        <div class="details-layout">
            <nav class="toc">
                <b>Table of Contents</b>
                <span>Categories</span><span>History</span><span>Network Requests / HTTPs Transactions</span>
            </nav>
            <div>
                <div class="box"><h3 class="strong">Categories ${info}</h3>
                    <div class="box-body"><dl class="kv">${categories}</dl></div></div>
                ${historyBox}
                <div class="box"><h3 class="strong">Network Requests / HTTPs Transactions (2/2) ${info}</h3>
                    <div class="box-body"><table class="net">
                        <tr><th>URL</th><th>Headers</th><th>GTI Score</th><th>Status</th>
                            <th>Detections ${info}</th><th>Relation Date ${info}</th></tr>
                        <tr><td><div class="net-url">${esc(url)}</div></td>
                            <td>-</td><td>-</td><td>${esc(report.status || '-')}</td>
                            <td>${score}</td><td>${formatDate(report.date)}</td></tr>
                        <tr><td><div class="net-url">${esc(httpsUrl)}</div>
                                <div class="net-note">${info} This IoC is not available in our public corpus at this time</div></td>
                            <td>-</td><td>-</td><td>-</td><td>-</td><td>-</td></tr>
                    </table></div></div>
            </div>
        </div>`;

    // community
    const avatar = '<span class="avatar"></span>';
    const graphs = report.graphs.map((g) => `
        <div class="graph-row">
            <span class="user-pill">${avatar}${esc(g.user)}</span>
            <span class="graph-name">${esc(g.name)}</span>
            <span class="graph-date">${esc(g.date)}</span>
        </div>`).join('');
    const votes = report.votes.map((v) => `
        <div class="vote">${avatar}
            <div><b>${esc(v.user)}</b><span>${esc(v.ago)}</span></div>
            <strong class="${v.value < 0 ? 'det-bad' : 'det-ok'}">${v.value > 0 ? '+' : ''}${v.value}</strong>
        </div>`).join('');
    const comments = report.comments.map((c) => `
        <div class="comment">${avatar}
            <div><div class="comment-head"><b>${esc(c.user)}</b><span>${esc(c.ago)}</span></div>
            <p>${esc(c.text)}</p></div>
        </div>`).join('');
    const section = (id, title, count, body) => `
        <section class="csection" id="${id}">
            <h3>${title} &nbsp;(${count}) ${info}</h3>${body}
        </section>`;
    $('#panelCommunity').innerHTML =
        (report.graphs.length ? section('graphsSection', 'Contained in Graphs', report.graphs.length, graphs) : '')
        + (report.votes.length ? section('votesSection', 'Voting details', report.votes.length, `<div class="votes">${votes}</div>`) : '')
        + section('commentsSection', 'Comments', report.comments.length,
            comments || '<p class="empty">We currently don\'t have any comments that fit your search</p>');

    setReportTab('detection');
    showView('report');
    emit('vt:report', { query: url, report, detections, total });
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
        const report = REPORTS[reportKey(url)];
        if (report) {
            renderReport(url, report);
        } else {
            $('#nfQuery').textContent = url;
            showView('notfound');
            emit('vt:notfound', { query: url });
        }
    }, LOADING_MS);
}

function search(input) {
    if (!input.trim()) return;
    const url = normalize(input);
    const hash = '#/url/' + encodeURIComponent(url);
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
$$('.report-tabs button').forEach((b) => b.addEventListener('click', () => setReportTab(b.dataset.rtab)));

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

$('#reanalyzeBtn').addEventListener('click', route);

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
