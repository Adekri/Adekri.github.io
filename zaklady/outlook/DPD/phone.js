/* ============================================================
   Simulovaný telefon s aplikací banky (podle Smart Banky od Monety).
   Stránka DPD slibuje připsání peněz, aplikace ale žádá potvrzení
   platby. Student může platbu potvrdit, zamítnout nebo kartu zablokovat.
   Průvodci předává události:
     dpd:phone    oznámení dorazilo do telefonu
     dpd:payment  platba potvrzena / zamítnuta (detail.payment)
     dpd:block    žádost o blokaci, lze zrušit (detail.reason)
     dpd:blocked  karta zablokována (detail.paid)
   ============================================================ */
(function () {
    const AMOUNT = '5 000,00 Kč';
    const LOGO = 'assets/moneta-logo-bila.png';

    function icon(path) {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
    }

    const ICONS = {
        pin: icon('<path d="M9 13V6a1.5 1.5 0 0 1 3 0v5l5 1.2a2 2 0 0 1 1.5 2.3L17.6 20H10l-4-5a1.5 1.5 0 0 1 2.2-2z"/>'),
        history: icon('<path d="M4 12a8 8 0 1 0 2.5-5.8L4 8.5"/><path d="M4 4v4.500h4.500"/><path d="M12 8v4l3 2"/>'),
        lock: icon('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
        more: icon('<circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/>'),
        home: icon('<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>'),
        card: icon('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10.500h18"/>'),
        chart: icon('<path d="M4 4v16h16"/><path d="M7 15l4-4 3 3 5-6"/>'),
        gift: icon('<rect x="4" y="9" width="16" height="11"/><path d="M3 9h18M12 9v11M12 9S8 4 6.500 6 9 9 12 9zm0 0s4-5 5.500-3S15 9 12 9z"/>')
    };

    // Spodní lišta aplikace; kromě blokace karty je všechno jen kulisa.
    const TABS = `
        <div class="phone-tabs">
            <span>${ICONS.home}Domů</span>
            <span class="active">${ICONS.card}Karty</span>
            <span>${ICONS.chart}Investice</span>
            <span>${ICONS.gift}Odměny</span>
            <span><img src="${LOGO}" alt="">Více</span>
        </div>`;

    function plasticCard(status) {
        return `
            <div class="phone-plastic${status === 'Aktivní' ? '' : ' off'}">
                <div class="phone-plastic-brand"><img src="${LOGO}" alt="">MONETA<small>MONEY<br>BANK</small></div>
                <div class="phone-plastic-tag">Standard<small>${status}</small></div>
                <div class="phone-plastic-number">**** **** **** ${card}</div>
                <div class="phone-plastic-visa">VISA</div>
            </div>`;
    }

    const phone = document.getElementById('phone');
    const screen = phone.querySelector('.phone-screen');
    const pageStatus = document.getElementById('codeStatus');

    let card = '0000';
    let payment = 'pending'; // pending | confirmed | rejected
    let backTo = 'approve';

    const SCREENS = {
        lock: () => `
            <div class="phone-lock">
                <div class="phone-time">${new Date().toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}</div>
                <button type="button" class="phone-push" data-action="open">
                    <b><img src="assets/moneta-logo.png" alt="">Smart Banka</b>
                    <span>Máte novou žádost o potvrzení. Otevřete ji v aplikaci.</span>
                </button>
            </div>`,

        approve: () => `
            <div class="phone-title"><img src="${LOGO}" alt="">Smart Banka</div>
            <div class="phone-body">
                <h4>Potvrzení platby</h4>
                <div class="phone-amount">${AMOUNT}</div>
                <dl class="phone-details">
                    <dt>Typ</dt><dd>Platba kartou na internetu</dd>
                    <dt>Karta</dt><dd>Standard *${card}</dd>
                </dl>
                <button type="button" class="phone-btn" data-action="confirm">Potvrdit platbu</button>
                <button type="button" class="phone-btn phone-btn-light" data-action="reject">Zamítnout</button>
                <button type="button" class="phone-link" data-action="block">Zablokovat kartu</button>
            </div>`,

        home: () => `
            <div class="phone-title">Karta <b>Standard</b></div>
            <div class="phone-cards">
                ${plasticCard('Aktivní')}
                <div class="phone-state">${payment === 'confirmed' ? `Platba ${AMOUNT} byla provedena.` : 'Platba byla zamítnuta.'}</div>
                <div class="phone-actions">
                    <span><i class="primary">${ICONS.pin}</i>Ukázat PIN</span>
                    <span><i>${ICONS.history}</i>Historie</span>
                    <button type="button" data-action="block"><i>${ICONS.lock}</i>Zablokovat</button>
                    <span><i>${ICONS.more}</i>Další</span>
                </div>
                <h5>Historie plateb</h5>
                <div class="phone-row">
                    <i>${ICONS.card}</i>
                    <div>${payment === 'confirmed' ? 'Platba kartou' : 'Zamítnutá platba'}<small>Dnes</small></div>
                    <b>${payment === 'confirmed' ? '−' : ''}${AMOUNT}</b>
                </div>
                <div class="phone-row">
                    <i>${ICONS.card}</i>
                    <div>Kočičí psycholog<small>Včera</small></div>
                    <b>−1 200,00 Kč</b>
                </div>
                <div class="phone-row">
                    <i>${ICONS.card}</i>
                    <div>Krabice (prázdná)<small>Minulý týden</small></div>
                    <b>−49,00 Kč</b>
                </div>
            </div>
            ${TABS}`,

        block: () => `
            <div class="phone-title">Zablokovat kartu</div>
            <form class="phone-body" data-block-form>
                <h4>Karta Standard *${card}</h4>
                <p>Co se stalo?</p>
                <label><input type="radio" name="reason" value="lost"> Kartu jsem ztratil(a)</label>
                <label><input type="radio" name="reason" value="stolen"> Karta mi byla odcizena</label>
                <label><input type="radio" name="reason" value="misuse"> Údaje o kartě získal někdo cizí</label>
                <p class="phone-error" data-error></p>
                <button type="submit" class="phone-btn phone-btn-danger">Zablokovat kartu</button>
                <button type="button" class="phone-btn phone-btn-light" data-action="back">Zpět</button>
            </form>`,

        blocked: () => `
            <div class="phone-title">Karta <b>Standard</b></div>
            <div class="phone-cards">
                ${plasticCard('Zablokovaná')}
                <div class="phone-state phone-state-done">Karta *${card} je zablokovaná.</div>
                <p>Žádná další platba touto kartou neprojde. Novou kartu vám pošleme poštou.</p>
            </div>
            ${TABS}`
    };

    function show(name) {
        screen.innerHTML = SCREENS[name]();
    }

    function emit(name, detail) {
        return document.dispatchEvent(new CustomEvent(name, { detail, cancelable: true }));
    }

    // Stránka útočníka reaguje podle toho, co se stalo v aplikaci.
    function setPayment(result) {
        payment = result;
        pageStatus.textContent = result === 'confirmed'
            ? 'Děkujeme. Částka bude připsána do 3 pracovních dnů.'
            : 'Připsání se nezdařilo. Zkuste to prosím znovu.';
    }

    const ACTIONS = {
        open: () => show('approve'),
        confirm: () => {
            setPayment('confirmed');
            show('home');
            emit('dpd:payment', { payment });
        },
        reject: () => {
            setPayment('rejected');
            show('home');
            emit('dpd:payment', { payment });
        },
        block: () => {
            backTo = payment === 'pending' ? 'approve' : 'home';
            show('block');
        },
        back: () => show(backTo)
    };

    phone.addEventListener('click', (event) => {
        const button = event.target.closest('[data-action]');
        if (button) ACTIONS[button.dataset.action]();
    });

    phone.addEventListener('submit', (event) => {
        event.preventDefault();
        const reason = event.target.querySelector('input:checked');
        if (!reason) {
            event.target.querySelector('[data-error]').textContent = 'Vyberte, co se stalo.';
            return;
        }
        if (!emit('dpd:block', { reason: reason.value })) return;
        const paid = payment === 'confirmed';
        if (!paid) setPayment('rejected'); // čekající platba padá s blokací karty
        show('blocked');
        emit('dpd:blocked', { paid });
    });

    window.dpdPhone = {
        open(last4) {
            card = last4;
            show('lock');
            phone.hidden = false;
            emit('dpd:phone');
        }
    };
})();
