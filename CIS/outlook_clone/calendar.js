/**
 * Outlook Clone – kalendář
 *
 * Zobrazuje vždy jen aktuální měsíc (šipky a „Dnes“ nic nedělají).
 * Události z calendar.json se do něj umístí podle řádku mřížky a dne v týdnu:
 *   "week": 3, "weekday": 1  →  pondělí ve 3. řádku mřížky aktuálního měsíce
 * Řádky 2–4 leží vždy celé uvnitř měsíce, weekday 1–5 = pondělí–pátek.
 *
 * Pro copilot.js je k dispozici window.OutlookCalendar:
 *   ready          – Promise s obsahem calendar.json (splní se po načtení)
 *   getEvent(id)   – událost podle id
 *   openEvent(id)  – otevře detail události
 */

(function () {
    'use strict';

    const $ = (id) => document.getElementById(id);

    const MONTHS = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen',
        'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
    const MONTHS_SHORT = ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'];
    const WEEKDAYS = ['Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota', 'Neděle'];
    const WEEKDAY_INITIALS = ['P', 'Ú', 'S', 'Č', 'P', 'S', 'N'];
    const DAYS_SHORT = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];

    const today = new Date(new Date().setHours(0, 0, 0, 0));
    const month = today.getMonth();
    const days = monthDays();

    let events = [];
    let selectedDate = today;
    let peekEventId = null;

    /* ================================================================
       Pomocné funkce
       ================================================================ */

    function addDays(d, n) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
    }

    /** Dny mřížky aktuálního měsíce – celé týdny od pondělí */
    function monthDays() {
        const first = new Date(today.getFullYear(), month, 1);
        const start = addDays(first, -((first.getDay() + 6) % 7));
        const result = [];
        for (let d = start; d.getMonth() === month || d < first || result.length % 7; d = addDays(d, 1)) result.push(d);
        return result;
    }

    function pad2(n) {
        return n < 10 ? '0' + n : '' + n;
    }

    /** "09:00" → "9:00" */
    function time(hhmm) {
        return hhmm.replace(/^0/, '');
    }

    /** "Čt 01.10.2026 13:00–14:30" nebo "Čt 01.10.2026 (celý den)" */
    function formatWhen(event) {
        const d = event.day;
        const date = DAYS_SHORT[d.getDay()] + ' ' + pad2(d.getDate()) + '.' + pad2(d.getMonth() + 1) + '.' + d.getFullYear();
        return date + (event.allDay ? ' (celý den)' : ' ' + time(event.start) + '–' + time(event.end));
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    /** Neodmítnuté události v daný den, celodenní první, pak podle začátku */
    function eventsOnDay(day) {
        return events
            .filter((e) => e.status !== 'declined' && e.day.getTime() === day.getTime())
            .sort((a, b) => (b.allDay - a.allDay) || a.start.localeCompare(b.start));
    }

    /* ================================================================
       Měsíční zobrazení a malý kalendář
       ================================================================ */

    function renderEventChip(event) {
        const label = event.allDay ? '' : `<span class="event-chip-time">${time(event.start)}</span> `;
        return `<button type="button" class="event-chip ${event.status}${event.id === peekEventId ? ' active' : ''}"
            data-event-id="${event.id}" title="${escapeHtml(event.title)}">${label}<span class="event-chip-title">${escapeHtml(event.title)}</span></button>`;
    }

    function dayClasses(base, day) {
        const classes = [base];
        if (day.getMonth() !== month) classes.push('other-month');
        if (day.getTime() === today.getTime()) classes.push('today');
        if (day.getTime() === selectedDate.getTime()) classes.push('selected');
        return classes.join(' ');
    }

    function render() {
        const header = WEEKDAYS.map((name) => `<div class="month-weekday">${name}</div>`).join('');
        const cells = days.map((day, i) => {
            const label = (day.getDate() === 1 || i === 0) ? day.getDate() + ' ' + MONTHS_SHORT[day.getMonth()] : day.getDate();
            return `
                <div class="${dayClasses('day-cell', day)}" data-date="${day.getTime()}">
                    <div class="day-header">
                        <span class="day-number">${label}</span>
                        <button type="button" class="day-add" aria-label="Nová událost" title="Nová událost"><svg><use href="#i-plus" /></svg></button>
                    </div>
                    <div class="day-events">${eventsOnDay(day).map(renderEventChip).join('')}</div>
                </div>`;
        }).join('');
        $('monthGrid').style.gridTemplateRows = `auto repeat(${days.length / 7}, minmax(0, 1fr))`;
        $('monthGrid').innerHTML = header + cells;

        const miniHead = WEEKDAY_INITIALS.map((d) => `<span class="mini-weekday">${d}</span>`).join('');
        const miniDays = days.map((day) =>
            `<button type="button" class="${dayClasses('mini-day', day)}" data-date="${day.getTime()}"><span>${day.getDate()}</span></button>`).join('');
        $('miniCalendarGrid').innerHTML = miniHead + miniDays;
    }

    /* ================================================================
       Detail události
       ================================================================ */

    function showPeek(eventId, anchor) {
        const event = events.find((e) => e.id === eventId);
        if (!event) return;
        peekEventId = eventId;

        $('peekTitle').textContent = event.title;
        $('peekTime').textContent = formatWhen(event);
        $('peekLocation').innerHTML = event.location.split(';').map((s) => escapeHtml(s.trim())).filter(Boolean).join(';<br>');
        $('peekLocation').hidden = !event.location;

        const avatar = $('peekAvatar');
        avatar.className = 'avatar small ' + (event.organizer.avatarColor || 'blue');
        avatar.textContent = event.organizer.initials || '';
        $('peekOrganizer').textContent = event.organizer.name;

        const description = $('peekDescription');
        description.textContent = event.description;
        description.hidden = true;
        $('peekExpandBtn').hidden = !event.description;

        $('peekJoin').hidden = !event.online;
        $('peekRsvpLabel').textContent = event.status === 'accepted' ? 'Přijato' : 'Potvrdit účast';

        // Otázky pro Copilota k této události (klíče v "copilot" u události)
        const questions = Object.keys(event.copilot);
        $('peekPrompts').innerHTML = questions.map((q) => `<button type="button">${escapeHtml(q)}</button>`).join('');
        $('peekCopilot').hidden = !questions.length;

        const peek = $('eventPeek');
        peek.dataset.status = event.status;
        peek.hidden = false;
        positionPeek(anchor);

        document.querySelectorAll('.event-chip.active').forEach((c) => c.classList.remove('active'));
        if (anchor) anchor.classList.add('active');
    }

    /** Detail se otevře nad událostí (nebo pod ní, když nahoře není místo) */
    function positionPeek(anchor) {
        const peek = $('eventPeek');
        const a = anchor ? anchor.getBoundingClientRect() : { left: window.innerWidth / 2, top: 200, bottom: 200 };
        const w = peek.offsetWidth;
        const h = peek.offsetHeight;
        const left = Math.min(Math.max(8, a.left), window.innerWidth - w - 8);
        let top = a.top - h - 8;
        if (top < 8) top = Math.min(a.bottom + 8, window.innerHeight - h - 8);
        peek.style.left = left + 'px';
        peek.style.top = Math.max(8, top) + 'px';
    }

    function hidePeek() {
        $('eventPeek').hidden = true;
        $('rsvpMenu').classList.remove('open');
        peekEventId = null;
        document.querySelectorAll('.event-chip.active').forEach((c) => c.classList.remove('active'));
    }

    /* ================================================================
       Ovládání
       ================================================================ */

    function setup() {
        const peek = $('eventPeek');
        const rsvpMenu = $('rsvpMenu');

        $('monthGrid').addEventListener('click', (e) => {
            const chip = e.target.closest('.event-chip');
            const cell = e.target.closest('.day-cell');
            if (chip) {
                showPeek(Number(chip.dataset.eventId), chip);
            } else if (cell) {
                selectedDate = new Date(Number(cell.dataset.date));
                render();
            }
        });

        $('miniCalendarGrid').addEventListener('click', (e) => {
            const day = e.target.closest('.mini-day');
            if (!day) return;
            selectedDate = new Date(Number(day.dataset.date));
            render();
        });

        $('peekExpandBtn').addEventListener('click', () => {
            const description = $('peekDescription');
            description.hidden = !description.hidden;
            positionPeek(document.querySelector('.event-chip.active'));
        });

        $('peekRsvpBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            const r = e.currentTarget.getBoundingClientRect();
            rsvpMenu.style.top = (r.bottom + 2) + 'px';
            rsvpMenu.style.left = r.left + 'px';
            rsvpMenu.classList.toggle('open');
        });

        rsvpMenu.addEventListener('click', (e) => {
            const item = e.target.closest('[data-status]');
            const event = events.find((ev) => ev.id === peekEventId);
            if (!item || !event) return;
            event.status = item.dataset.status;
            hidePeek();
            render();
        });

        $('peekPrompts').addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            const event = events.find((ev) => ev.id === peekEventId);
            if (!btn || !event) return;
            const question = btn.textContent;
            hidePeek();
            window.OutlookCopilot.ask(question, event.copilot[question], [event.id]);
        });

        // Klik mimo detail nebo Esc ho zavře
        document.addEventListener('mousedown', (e) => {
            if (peek.hidden) return;
            if (peek.contains(e.target) || rsvpMenu.contains(e.target) || e.target.closest('.event-chip')) return;
            hidePeek();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !peek.hidden) hidePeek();
        });
        window.addEventListener('resize', hidePeek);
    }

    /* ================================================================
       Start a veřejné rozhraní
       ================================================================ */

    $('calendarTitle').textContent = $('miniCalendarTitle').textContent = MONTHS[month] + ' ' + today.getFullYear();
    setup();
    render();

    const ready = fetch('calendar.json')
        .then((resp) => resp.json())
        .then((data) => {
            events = data.events.map((raw) => ({
                organizer: {},
                location: '',
                description: '',
                status: 'accepted',
                copilot: {},
                ...raw,
                day: days[(raw.week - 1) * 7 + raw.weekday - 1],
            }));
            render();
            return data;
        });

    window.OutlookCalendar = {
        ready,
        getEvent: (id) => events.find((e) => e.id === id),
        openEvent(id) {
            showPeek(id, document.querySelector(`.event-chip[data-event-id="${id}"]`));
        },
    };
})();
