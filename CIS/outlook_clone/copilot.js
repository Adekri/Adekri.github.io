/**
 * Outlook Clone – Copilot (panel vpravo v kalendáři)
 *
 * Copilot neobsahuje žádnou AI a nejde mu psát: uživatel volí jen z návrhů.
 * Návrhy i odpovědi jsou napsané předem v calendar.json:
 *   "copilot": [{ "prompt": "…", "answer": "<p>…</p>", "events": [id, …] }]
 *     – obecné návrhy (karty v panelu a další návrhy pod odpovědí)
 *   "copilot": { "otázka": "<p>odpověď</p>" } u události
 *     – otázky v detailu události (vykresluje calendar.js)
 * "events" jsou nepovinné odkazy na události zobrazené pod odpovědí.
 */

(function () {
    'use strict';

    const $ = (id) => document.getElementById(id);
    const cal = window.OutlookCalendar;

    /** Jak dlouho Copilot „přemýšlí“ před odpovědí (ms) */
    const THINKING_DELAY = 900;
    /** Kolik karet s návrhy je vidět před kliknutím na „Zobrazit více“ */
    const VISIBLE_CARDS = 2;

    const pane = $('copilotPane');
    const view = $('calendarView');
    const messages = $('copilotMessages');
    let prompts = [];
    let busy = false;

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    /** Odkaz na událost (po kliknutí otevře její detail v kalendáři) */
    function ref(id) {
        const event = cal.getEvent(id);
        return event ? `<button type="button" class="copilot-ref" data-event-id="${id}">`
            + `<svg><use href="#i-calendar-small" /></svg><span>${escapeHtml(event.title)}</span></button>` : '';
    }

    /** Karty s návrhy v prázdném panelu */
    function cards() {
        return prompts.map((item, i) => `<button type="button" class="copilot-card${i >= VISIBLE_CARDS ? ' extra' : ''}" data-index="${i}">`
            + `<svg class="copilot-card-icon"><use href="#i-chat-bubble" /></svg>${escapeHtml(item.prompt)}</button>`).join('');
    }

    /** Další návrhy pod odpovědí (kromě právě položeného) */
    function followUps(current) {
        return prompts.map((item, i) => item.prompt === current ? ''
            : `<button type="button" class="copilot-followup" data-index="${i}">${escapeHtml(item.prompt)}</button>`).join('');
    }

    /* ================================================================
       Panel a konverzace
       ================================================================ */

    function open() {
        pane.hidden = false;
        view.classList.add('copilot-open');
    }

    function close() {
        pane.hidden = true;
        view.classList.remove('copilot-open');
    }

    function newChat() {
        messages.innerHTML = '';
        pane.classList.add('is-empty');
        busy = false;
    }

    function scrollToBottom() {
        messages.scrollTop = messages.scrollHeight;
    }

    function addMessage(className, html) {
        const el = document.createElement('div');
        el.className = className;
        el.innerHTML = html;
        messages.appendChild(el);
        scrollToBottom();
        return el;
    }

    /** Zobrazí dotaz a po chvíli „přemýšlení“ předem napsanou odpověď */
    async function ask(prompt, answer, eventIds = []) {
        if (busy) return;
        busy = true;
        open();

        if (pane.classList.contains('is-empty')) {
            pane.classList.remove('is-empty');
            addMessage('copilot-date', '<span>Dnes</span>');
        }
        // Návrhy pod předchozí odpovědí už nejsou potřeba
        messages.querySelectorAll('.copilot-followups').forEach((el) => el.remove());
        addMessage('copilot-msg user', escapeHtml(prompt));

        const bot = addMessage('copilot-msg bot',
            '<div class="copilot-bot-name"><img src="assets/icons/copilot.png" alt="">Copilot</div>'
            + '<div class="copilot-typing"><span></span><span></span><span></span></div>');

        await new Promise((r) => setTimeout(r, THINKING_DELAY));

        bot.querySelector('.copilot-typing').remove();
        const content = document.createElement('div');
        content.className = 'copilot-bot-content';
        content.innerHTML = answer + (eventIds.length ? `<p>${eventIds.map(ref).join(' ')}</p>` : '');
        bot.appendChild(content);

        // Odpověď se objevuje postupně po odstavcích
        [...content.children].forEach((child, i) => {
            child.classList.add('reveal');
            child.style.animationDelay = (i * 120) + 'ms';
        });

        bot.insertAdjacentHTML('beforeend', `
            <div class="copilot-bot-actions">
                <button type="button" class="icon-btn" data-action="copy" aria-label="Kopírovat"><svg><use href="#i-copy" /></svg></button>
                <button type="button" class="icon-btn" data-action="like" aria-label="Líbí se mi" aria-pressed="false"><svg><use href="#i-like" /></svg></button>
                <button type="button" class="icon-btn" data-action="dislike" aria-label="Nelíbí se mi" aria-pressed="false"><svg><use href="#i-dislike" /></svg></button>
            </div>`);
        addMessage('copilot-followups', followUps(prompt));
        busy = false;
    }

    /** Položí obecný návrh podle jeho pořadí v calendar.json */
    function askPrompt(index) {
        const item = prompts[index];
        if (item) ask(item.prompt, item.answer, item.events);
    }

    /* ================================================================
       Ovládání
       ================================================================ */

    $('copilotOpenBtn').addEventListener('click', open);
    $('copilotCloseBtn').addEventListener('click', close);
    $('copilotNewChatBtn').addEventListener('click', newChat);

    $('copilotSuggestions').addEventListener('click', (e) => {
        const card = e.target.closest('[data-index]');
        if (card) askPrompt(Number(card.dataset.index));
    });

    $('copilotShowMore').addEventListener('click', (e) => {
        const expanded = pane.classList.toggle('show-all-suggestions');
        e.currentTarget.querySelector('span').textContent = expanded ? 'Zobrazit méně' : 'Zobrazit více';
    });

    messages.addEventListener('click', (e) => {
        const reference = e.target.closest('.copilot-ref');
        const followUp = e.target.closest('[data-index]');
        const action = e.target.closest('[data-action]');
        if (reference) {
            cal.openEvent(Number(reference.dataset.eventId));
        } else if (followUp) {
            askPrompt(Number(followUp.dataset.index));
        } else if (action && action.dataset.action === 'copy') {
            const text = action.closest('.copilot-msg').querySelector('.copilot-bot-content').innerText;
            if (navigator.clipboard) navigator.clipboard.writeText(text);
        } else if (action) {
            const pressed = action.getAttribute('aria-pressed') !== 'true';
            action.parentElement.querySelectorAll('[aria-pressed]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
            action.setAttribute('aria-pressed', String(pressed));
        }
    });

    cal.ready.then((data) => {
        prompts = data.copilot || [];
        $('copilotSuggestions').innerHTML = cards();
        $('copilotShowMore').hidden = prompts.length <= VISIBLE_CARDS;
    });

    window.OutlookCopilot = { open, close, ask };
})();
