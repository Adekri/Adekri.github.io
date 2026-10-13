/* ============================================================
   Výuková kopie Have I Been Pwned.
   Stránka je řízená hashem v adrese:
     #/              -> kontrola e-mailu
     #/breach/<id>   -> detail úniku (tlačítko View Details)
     #/passwords     -> kontrola hesla
   E-maily a úniky jsou smyšlené (viz BREACHES). Hesla se ověřují
   ve skutečné databázi Pwned Passwords: odešle se jen prvních
   5 znaků SHA-1 otisku hesla, heslo samotné stránku neopustí.
   Pro průvodce (tour) stránka vysílá události:
     hibp:page     (detail: { page, breach })              přepnutí stránky (breach jen u detailu úniku)
     hibp:email    (detail: { email, breaches })           výsledek e-mailu
     hibp:password (detail: { password, count, offline })  výsledek hesla
   ============================================================ */

// Smyšlené úniky, seřazené od nejnovějšího. Loga jsou v adresáři logos/.
// Únik s hesly (Pixelhrad) je schválně až čtvrtý, aby ho student musel hledat.
const BREACHES = {
    'pepa.zdepa@example.com': [
        {
            id: 'kinoplex',
            name: 'Kinoplex',
            date: '2026-06-03',
            added: '2026-07-15',
            accounts: '2 106 884',
            description: 'In June 2026, the cinema chain Kinoplex discovered that attackers had accessed its online ticketing system. Data of more than 2 million customers was taken, including names, email addresses, phone numbers and the history of purchased tickets.',
            data: ['Email addresses', 'Names', 'Phone numbers', 'Purchases']
        },
        {
            id: 'pizzaraketa',
            name: 'Pizza Raketa',
            date: '2025-03-08',
            added: '2025-04-19',
            accounts: '386 102',
            description: 'In March 2025, the food delivery service Pizza Raketa left a database backup publicly accessible on an unsecured cloud server. The exposed data included customer names, email addresses, phone numbers and delivery addresses.',
            data: ['Email addresses', 'Names', 'Phone numbers', 'Physical addresses']
        },
        {
            id: 'fotokrabicka',
            name: 'Fotokrabička',
            date: '2024-01-21',
            added: '2024-02-10',
            accounts: '742 958',
            description: 'In January 2024, the photo sharing service Fotokrabička was breached and the data of its users was later sold online. The data included names, email addresses, dates of birth and links to profile photos.',
            data: ['Dates of birth', 'Email addresses', 'Names', 'Profile photos']
        },
        {
            id: 'pixelhrad',
            name: 'Pixelhrad',
            date: '2023-09-14',
            added: '2023-10-02',
            accounts: '1 214 337',
            description: 'In September 2023, the Czech online gaming portal Pixelhrad suffered a data breach after attackers exploited a vulnerable plugin on its community forum. The stolen database was later shared on a hacking forum and included usernames, email addresses, IP addresses and passwords stored as unsalted MD5 hashes, most of which have since been cracked.',
            data: ['Email addresses', 'IP addresses', 'Passwords', 'Usernames']
        },
        {
            id: 'mnauchat',
            name: 'Mňauchat',
            date: '2022-11-30',
            added: '2023-01-12',
            accounts: '95 417',
            description: 'In November 2022, the chat app for cat lovers Mňauchat exposed user records through a misconfigured API. The data included usernames, email addresses and approximate geographic locations.',
            data: ['Email addresses', 'Geographic locations', 'Usernames']
        },
        {
            id: 'sportbazar',
            name: 'SportBazar',
            date: '2021-05-17',
            added: '2021-06-28',
            accounts: '518 640',
            description: 'In May 2021, the second-hand sports equipment marketplace SportBazar suffered a breach of its customer database. The data included names, email addresses, phone numbers and physical addresses used for shipping.',
            data: ['Email addresses', 'Names', 'Phone numbers', 'Physical addresses']
        }
    ]
};

// Hesla z úkolu mají pevné výsledky, aby úkol fungoval i bez internetu.
// Zbytek seznamu se použije jen tehdy, když nejde spojení s Pwned Passwords.
const KNOWN_PASSWORDS = {
    'pepa123': 3518,
    'fotbal': 46207,
    'Sparta2010': 1294
};

let lastBreachId = null; // poslední otevřený detail úniku

const API_URL = 'https://api.pwnedpasswords.com/range/';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ---------- pomocné funkce ---------- */

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

function formatNumber(n) {
    return n.toLocaleString('cs-CZ');
}

function monthYear(iso) {
    const [y, m] = iso.split('-');
    return { month: MONTHS[Number(m) - 1], year: y };
}

/* ---------- stránky ---------- */

const TITLES = {
    home: 'Have I Been Pwned: Check if your email address has been exposed in a data breach',
    passwords: 'Have I Been Pwned: Pwned Passwords'
};

function findBreach(id) {
    for (const list of Object.values(BREACHES)) {
        const breach = list.find((b) => b.id === id);
        if (breach) return breach;
    }
    return null;
}

function renderBreach(breach) {
    const d = (iso, options) => new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', Object.assign({ timeZone: 'UTC' }, options));
    $('#bdLogo').src = `logos/${breach.id}.svg`;
    $('#bdTitle').textContent = breach.name + ' Data Breach';
    $('#bdDescription').textContent = breach.description;
    $('#bdData').innerHTML = breach.data.map((item) => `<li>${esc(item)}</li>`).join('');
    $('#bdAccounts').textContent = breach.accounts;
    $('#bdDate').textContent = d(breach.date, { month: 'long', year: 'numeric' });
    $('#bdAdded').textContent = d(breach.added, { day: 'numeric', month: 'short', year: 'numeric' });
}

function showPage(page, breach) {
    $('#page-home').hidden = page !== 'home';
    $('#page-breach').hidden = page !== 'breach';
    $('#page-passwords').hidden = page !== 'passwords';
    const navPage = page === 'breach' ? 'home' : page;
    $$('.nav-links a[data-page]').forEach((a) => a.classList.toggle('active', a.dataset.page === navPage));
    document.title = page === 'breach' ? `Have I Been Pwned: ${breach.name} Data Breach` : TITLES[page];
    // po návratu z detailu úniku ukážeme kartu, ze které student odešel
    const card = page === 'home' && lastBreachId && document.querySelector(`[data-breach="${lastBreachId}"]`);
    if (card && !$('#results').hidden) card.scrollIntoView({ block: 'center' });
    else window.scrollTo(0, 0);
    emit('hibp:page', { page, breach });
}

function route() {
    const match = location.hash.match(/^#\/breach\/([\w-]+)$/);
    const breach = match && findBreach(match[1]);
    if (breach) {
        lastBreachId = breach.id;
        renderBreach(breach);
        showPage('breach', breach);
    } else {
        showPage(location.hash === '#/passwords' ? 'passwords' : 'home');
    }
}

/* ---------- e-mail ---------- */

function breachCard(breach, index) {
    const when = monthYear(breach.date);
    const items = breach.data.map((d) => `<li>${esc(d)}</li>`).join('');
    return `
        <article class="tl-item ${index % 2 ? 'right' : 'left'}" data-breach="${breach.id}">
            <div class="tl-date"><span>${when.month}</span><span>${when.year}</span></div>
            <div class="tl-card">
                <div class="tl-head">
                    <img class="tl-logo" src="logos/${breach.id}.svg" alt="">
                    <h3>${esc(breach.name)}</h3>
                </div>
                <p>${esc(breach.description)}</p>
                <h4>Compromised data:</h4>
                <ul class="tl-data">${items}</ul>
                <a class="btn-outline" href="#/breach/${breach.id}">View Details</a>
            </div>
        </article>`;
}

function checkEmail(raw) {
    const email = raw.trim().toLowerCase();
    if (!email) return;
    const breaches = BREACHES[email] || [];
    lastBreachId = null;

    $('#results').hidden = !breaches.length;
    $('#noPwnage').hidden = breaches.length > 0;
    if (breaches.length) {
        $('#breachCount').textContent = breaches.length;
        $('#timeline').innerHTML = breaches.map(breachCard).join('');
        $('#results').scrollIntoView({ behavior: 'smooth' });
    } else {
        $('#noPwnageEmail').textContent = email;
        $('#noPwnage').scrollIntoView({ behavior: 'smooth' });
    }
    emit('hibp:email', { email, breaches });
}

/* ---------- hesla ---------- */

async function sha1(text) {
    const buffer = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(text));
    return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// Vrací { count, offline }. Na server jde jen prvních 5 znaků otisku (k-anonymita).
async function pwnedCount(password) {
    if (Object.prototype.hasOwnProperty.call(KNOWN_PASSWORDS, password)) {
        return { count: KNOWN_PASSWORDS[password], offline: false };
    }
    try {
        const hash = await sha1(password);
        const response = await fetch(API_URL + hash.slice(0, 5));
        if (!response.ok) throw new Error(response.status);
        const suffix = hash.slice(5);
        const line = (await response.text()).split('\n').find((l) => l.startsWith(suffix + ':'));
        return { count: line ? Number(line.split(':')[1]) : 0, offline: false };
    } catch (error) {
        return { count: 0, offline: true };
    }
}

async function checkPassword(password) {
    if (!password) return;
    const button = $('#passwordForm button[type="submit"]');
    button.disabled = true;
    const { count, offline } = await pwnedCount(password);
    button.disabled = false;

    const box = $('#pwResult');
    box.hidden = false;
    if (count > 0) {
        box.innerHTML = `
            <div class="result-card">
                <svg class="result-icon"><use href="#i-shield" /></svg>
                <h2>Oh no - pwned!</h2>
                <p>This password has been seen <b>${formatNumber(count)}</b> times before in data breaches!</p>
                <p>This password has previously appeared in a data breach and should never be used. If you've ever used it anywhere before, change it immediately!</p>
            </div>`;
    } else {
        box.innerHTML = `
            <div class="result-card good">
                <svg class="result-icon"><use href="#i-shield-ok" /></svg>
                <h2>Good news — no pwnage found!</h2>
                <p>This password wasn't found in any of the Pwned Passwords loaded into Have I Been Pwned. That doesn't necessarily mean it's a good password, merely that it's not indexed on this site.</p>
                ${offline ? '<p>Bez připojení k internetu šlo heslo porovnat jen s malým seznamem nejčastějších hesel.</p>' : ''}
            </div>`;
    }
    emit('hibp:password', { password, count, offline });
}

/* ---------- události ---------- */

$('#emailForm').addEventListener('submit', (e) => {
    e.preventDefault();
    checkEmail($('#emailInput').value);
});

$('#passwordForm').addEventListener('submit', (e) => {
    e.preventDefault();
    checkPassword($('#passwordInput').value);
});

$('#revealBtn').addEventListener('click', (e) => {
    const input = $('#passwordInput');
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    e.currentTarget.setAttribute('aria-pressed', String(show));
});

window.addEventListener('hashchange', route);
route();
