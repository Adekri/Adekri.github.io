/**
 * Outlook Clone – seznam zpráv a podokno pro čtení
 *
 * Načte emails.json → vykreslí seznam zpráv → po kliknutí zobrazí zprávu.
 * Uživatel může zprávu nahlásit jako spam / phishing (tři tečky → Nahlásit)
 * a kliknutím na „Outlook“ v hlavičce si nechat výsledek vyhodnotit.
 */

(function () {
    'use strict';

    const $ = (id) => document.getElementById(id);

    const AVATAR_COLORS = [
        'cranberry', 'red', 'peach', 'marigold', 'brass', 'teal', 'steel',
        'blue', 'grape', 'lilac', 'pink', 'beige', 'anchor',
    ];

    const CZ_DAYS = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];

    const FLAG_LABELS = { spam: 'spam', phishing: 'phishing', normal: 'normální' };

    /** Id právě otevřené zprávy (null = žádná) */
    let selectedEmailId = null;

    /** emailId → objekt zprávy */
    const emailMap = {};

    /** emailId → id skupiny ("tento-tyden", …) */
    const emailGroupMap = {};

    /** emailId → 'spam' | 'phishing' (jak zprávu označil uživatel) */
    const userFlags = {};

    /* ================================================================
       Pomocné funkce
       ================================================================ */

    function pad2(n) {
        return n < 10 ? '0' + n : '' + n;
    }

    /** "Po 02.03.2026 9:23" */
    function formatDateFull(d) {
        return CZ_DAYS[d.getDay()] + ' '
            + pad2(d.getDate()) + '.' + pad2(d.getMonth() + 1) + '.' + d.getFullYear()
            + ' ' + d.getHours() + ':' + pad2(d.getMinutes());
    }

    /** Krátké datum v seznamu: "Po 9:23" pro tento týden, jinak "Čt 26.02" */
    function formatDateShort(email) {
        const d = new Date(email.date);
        if (emailGroupMap[email.id] === 'tento-tyden') {
            return CZ_DAYS[d.getDay()] + ' ' + d.getHours() + ':' + pad2(d.getMinutes());
        }
        return CZ_DAYS[d.getDay()] + ' ' + pad2(d.getDate()) + '.' + pad2(d.getMonth() + 1);
    }

    /** Text bez HTML značek (náhled zprávy v seznamu) */
    function htmlToText(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent.replace(/\s+/g, ' ').trim();
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function avatarColor(name) {
        return AVATAR_COLORS.includes(name) ? name : 'blue';
    }

    /* ================================================================
       Seznam zpráv
       ================================================================ */

    function renderEmailItem(email) {
        const shortDate = formatDateShort(email);
        const preview = htmlToText(email.bodyHtml);
        const label = `${email.sender.name} ${email.subject} ${shortDate} ${preview}`;

        return `
            <div id="email-${email.id}" class="message-item${email.isRead ? '' : ' unread'}"
                data-email-id="${email.id}" role="option" aria-selected="false" tabindex="-1"
                aria-label="${escapeHtml(label)}">
                <span class="avatar ${avatarColor(email.sender.avatarColor)}" role="img"
                    aria-label="${escapeHtml(email.sender.name)}">${escapeHtml(email.sender.initials)}</span>
                <div class="message-item-text">
                    <div class="sender"><span title="${escapeHtml(email.sender.email)}">${escapeHtml(email.sender.name)}</span></div>
                    <div>
                        <span class="subject">${escapeHtml(email.subject)}</span>
                        <span class="date" title="${escapeHtml(formatDateFull(new Date(email.date)))}">${escapeHtml(shortDate)}</span>
                    </div>
                    <div><span class="preview">${escapeHtml(preview)}</span></div>
                </div>
            </div>`;
    }

    function renderGroup(group) {
        return `
            <div class="message-group" data-group="${escapeHtml(group.id)}">
                <div class="message-group-header" role="button">
                    <i class="icon icon-16 icon-chevron-down" aria-hidden="true"></i>
                    <span class="title">${escapeHtml(group.label)}</span>
                    <button type="button" class="more-btn" tabindex="-1" aria-label="Další možnosti">
                        <i class="icon icon-20 icon-more" aria-hidden="true"></i>
                    </button>
                </div>
                ${group.emails.map(renderEmailItem).join('')}
            </div>`;
    }

    /** Skryje záhlaví skupin, ve kterých už není žádná viditelná zpráva */
    function hideEmptyGroups() {
        document.querySelectorAll('.message-group').forEach((group) => {
            const hasVisible = [...group.querySelectorAll('.message-item')].some((item) => !item.hidden);
            group.querySelector('.message-group-header').hidden = !hasVisible;
        });
    }

    /** Počet nepřečtených zpráv u obou složek "Doručená pošta" */
    function updateUnreadBadges() {
        const unread = Object.values(emailMap).filter((email) => !email.isRead).length;

        document.querySelectorAll('.folder[title="Doručená pošta"]').forEach((folder) => {
            const existing = folder.querySelector('.unread-badge');
            if (existing) existing.remove();

            if (unread > 0) {
                const badge = document.createElement('span');
                badge.className = 'unread-badge';
                badge.textContent = unread;
                folder.appendChild(badge);
            }
        });
    }

    function markAsRead(emailId) {
        const email = emailMap[emailId];
        if (!email || email.isRead) return;

        email.isRead = true;
        $('email-' + emailId).classList.remove('unread');
        updateUnreadBadges();
    }

    function selectEmail(emailId) {
        if (emailId === selectedEmailId) return;

        const prev = selectedEmailId !== null ? $('email-' + selectedEmailId) : null;
        if (prev) {
            prev.classList.remove('selected');
            prev.setAttribute('aria-selected', 'false');
            prev.tabIndex = -1;
        }

        selectedEmailId = emailId;
        const next = $('email-' + emailId);
        next.classList.add('selected');
        next.setAttribute('aria-selected', 'true');
        next.tabIndex = 0;

        markAsRead(emailId);
        showEmail(emailMap[emailId]);
    }

    /* ================================================================
       Podokno pro čtení
       ================================================================ */

    function showEmail(email) {
        $('readingPaneEmpty').hidden = true;
        $('readingPaneContent').hidden = false;

        $('messageSubject').textContent = email.subject;

        const avatar = $('senderAvatar');
        avatar.className = 'avatar large ' + avatarColor(email.sender.avatarColor);
        avatar.textContent = email.sender.initials;
        avatar.setAttribute('aria-label', email.sender.name);

        $('senderName').textContent = email.sender.name;
        $('senderEmail').textContent = email.sender.email ? '<' + email.sender.email + '>' : '';

        renderRecipients(email.recipients);

        $('messageDate').textContent = formatDateFull(new Date(email.date));
        $('messageBody').innerHTML = email.bodyHtml;
    }

    function hideEmail() {
        $('readingPaneEmpty').hidden = false;
        $('readingPaneContent').hidden = true;
    }

    /** Řádek "Komu:" – první příjemce + odkaz "+N další", který seznam rozbalí */
    function renderRecipients(recipients) {
        const list = (recipients || '').split(';').map((s) => s.trim()).filter(Boolean);
        const content = $('recipientsList');

        $('recipients').hidden = list.length === 0;

        if (list.length <= 1) {
            content.innerHTML = list.length ? `<span class="name">${escapeHtml(list[0])}</span>` : '';
            return;
        }

        content.innerHTML = `<span class="name">${escapeHtml(list[0])};</span>`
            + `<span class="more-link" role="button" tabindex="0">&nbsp;&nbsp;+${list.length - 1} další</span>`;

        content.querySelector('.more-link').addEventListener('click', () => {
            content.innerHTML = `<span class="name">${escapeHtml(list[0])};</span>`
                + list.slice(1).map((name, i) => {
                    const sep = i < list.length - 2 ? ';' : '';
                    return `<div class="name extra">${escapeHtml(name)}${sep}</div>`;
                }).join('');
        });
    }

    /* ================================================================
       Nabídka tří teček a podnabídka "Nahlásit"
       ================================================================ */

    function closeMenus() {
        $('moreActionsMenu').classList.remove('open');
        $('reportSubmenu').classList.remove('open');
    }

    function setupMoreActionsMenu() {
        const btn = $('moreActionsBtn');
        const menu = $('moreActionsMenu');
        const reportItem = $('reportMenuItem');
        const submenu = $('reportSubmenu');
        let submenuTimer = null;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();

            if (menu.classList.contains('open')) {
                closeMenus();
                return;
            }
            if (!selectedEmailId) return;

            // Nabídka zarovnaná pravým okrajem k tlačítku
            const rect = btn.getBoundingClientRect();
            menu.style.top = (rect.bottom + 2) + 'px';
            menu.style.right = (window.innerWidth - rect.right) + 'px';
            menu.style.maxHeight = (window.innerHeight - rect.bottom - 10) + 'px';
            menu.classList.add('open');
        });

        // Podnabídka se otevírá vlevo od položky "Nahlásit"
        reportItem.addEventListener('mouseenter', () => {
            clearTimeout(submenuTimer);
            const menuRect = menu.getBoundingClientRect();
            const itemRect = reportItem.getBoundingClientRect();
            submenu.style.top = (itemRect.top - 4) + 'px';
            submenu.style.right = (window.innerWidth - menuRect.left + 2) + 'px';
            submenu.classList.add('open');
        });
        reportItem.addEventListener('mouseleave', () => {
            submenuTimer = setTimeout(() => submenu.classList.remove('open'), 200);
        });
        submenu.addEventListener('mouseenter', () => clearTimeout(submenuTimer));
        submenu.addEventListener('mouseleave', () => submenu.classList.remove('open'));

        $('reportSpamBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenus();
            $('reportSpamModal').classList.add('open');
        });
        $('reportPhishingBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            closeMenus();
            $('reportPhishingModal').classList.add('open');
        });

        // Klik mimo nabídku ji zavře, klik uvnitř ne
        document.addEventListener('click', closeMenus);
        menu.addEventListener('click', (e) => e.stopPropagation());
        submenu.addEventListener('click', (e) => e.stopPropagation());
    }

    /* ================================================================
       Nahlášení spamu / phishingu
       ================================================================ */

    /** Označí otevřenou zprávu, skryje ji ze seznamu a vyprázdní podokno pro čtení */
    function flagSelectedEmail(type) {
        if (!selectedEmailId) return;

        userFlags[selectedEmailId] = type;
        $('email-' + selectedEmailId).hidden = true;
        hideEmail();
        hideEmptyGroups();
        selectedEmailId = null;
    }

    function setupReportModals() {
        [['spam', 'reportSpamModal', 'confirmSpamBtn', 'cancelSpamBtn'],
         ['phishing', 'reportPhishingModal', 'confirmPhishingBtn', 'cancelPhishingBtn']]
            .forEach(([type, modalId, confirmId, cancelId]) => {
                const modal = $(modalId);
                $(confirmId).addEventListener('click', () => {
                    flagSelectedEmail(type);
                    modal.classList.remove('open');
                });
                $(cancelId).addEventListener('click', () => modal.classList.remove('open'));
            });
    }

    /* ================================================================
       Vyhodnocení (klik na "Outlook" v hlavičce)
       ================================================================ */

    function setupEvaluation() {
        $('outlookEvalBtn').addEventListener('click', (e) => {
            e.preventDefault();

            const phishingErrors = [];
            const spamErrors = [];

            Object.keys(emailMap).forEach((id) => {
                const email = emailMap[id];
                const expected = email.type || 'normal';
                const got = userFlags[id] || null;

                if (expected === 'normal' && got === null) return;
                if (expected === got) return;

                // Chyba "phishing" = phishing nepoznán nebo něco neprávem označeno jako phishing
                const mistake = { email, expected, got };
                if (expected === 'phishing' || got === 'phishing') {
                    phishingErrors.push(mistake);
                } else {
                    spamErrors.push(mistake);
                }
            });

            showEvaluation(phishingErrors, spamErrors);
        });

        $('evalModalBtn').addEventListener('click', () => {
            $('evalModal').classList.remove('open');
            window.location.reload();
        });
    }

    function renderMistakes(list) {
        return '<ul class="eval-mistakes">' + list.map((m) => {
            const got = m.got ? FLAG_LABELS[m.got] : 'neoznačen';
            return `<li><strong>${escapeHtml(m.email.subject)}</strong> — správně: `
                + `${FLAG_LABELS[m.expected]}, vaše označení: ${got}</li>`;
        }).join('') + '</ul>';
    }

    function showEvaluation(phishingErrors, spamErrors) {
        const title = $('evalModalTitle');
        const text = $('evalModalText');

        const flagHtml = '<div class="eval-flag">'
            + '<div class="eval-flag-label">Vaše vlajka:</div>'
            + '<span class="eval-flag-value">FLAG(SocialniInzenyrstvi)</span>'
            + '</div>';

        if (phishingErrors.length === 0 && spamErrors.length === 0) {
            title.textContent = 'Gratulujeme!';
            title.style.color = '#0e700e';
            text.innerHTML = 'Správně jste identifikovali všechny nebezpečné e-maily. Výborná práce!' + flagHtml;
        } else if (phishingErrors.length === 0) {
            // Všechny phishingy správně → vlajka i přes chyby u spamu / normálních zpráv
            title.textContent = 'Skoro perfektní!';
            title.style.color = '#0e700e';
            text.innerHTML = '<p>Všechny phishingové e-maily jste označili správně — zde je vlajka pro tento úkol. '
                + 'Některé spam / normální e-maily však byly označeny chybně:</p>'
                + renderMistakes(spamErrors) + flagHtml;
        } else {
            // Jakákoli chyba u phishingu → bez vlajky, vypíšou se všechny chyby
            title.textContent = 'Zkuste to znovu';
            title.style.color = '#c4314b';
            text.innerHTML = '<p>Některé e-maily nebyly označeny správně:</p>'
                + renderMistakes(phishingErrors.concat(spamErrors));
        }

        $('evalModal').classList.add('open');
    }

    /* ================================================================
       Start
       ================================================================ */

    async function init() {
        try {
            const resp = await fetch('emails.json');
            if (!resp.ok) throw new Error('Nepodařilo se načíst emails.json: ' + resp.status);
            const data = await resp.json();

            data.groups.forEach((group) => {
                group.emails.forEach((email) => {
                    emailMap[email.id] = email;
                    emailGroupMap[email.id] = group.id;
                });
            });

            const list = $('messageList');
            list.innerHTML = data.groups.map(renderGroup).join('');
            list.addEventListener('click', (e) => {
                const item = e.target.closest('.message-item');
                if (item) selectEmail(Number(item.dataset.emailId));
            });

            updateUnreadBadges();
            setupMoreActionsMenu();
            setupReportModals();
            setupEvaluation();
        } catch (err) {
            console.error('Outlook clone – chyba při inicializaci:', err);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
