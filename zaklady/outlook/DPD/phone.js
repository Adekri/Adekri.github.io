/* ============================================================
   Simulovaný telefon s aplikací banky (fiktivní „Vaše banka“).
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
                    <b>Vaše banka</b>
                    <span>Máte novou žádost o potvrzení. Otevřete ji v aplikaci.</span>
                </button>
            </div>`,

        approve: () => `
            <div class="phone-bar">Vaše banka</div>
            <div class="phone-body">
                <h4>Potvrzení platby</h4>
                <div class="phone-amount">${AMOUNT}</div>
                <dl class="phone-details">
                    <dt>Typ</dt><dd>Platba kartou na internetu</dd>
                    <dt>Karta</dt><dd>*${card}</dd>
                </dl>
                <button type="button" class="phone-btn" data-action="confirm">Potvrdit platbu</button>
                <button type="button" class="phone-btn phone-btn-light" data-action="reject">Zamítnout</button>
                <button type="button" class="phone-link" data-action="block">Zablokovat kartu</button>
            </div>`,

        home: () => `
            <div class="phone-bar">Vaše banka</div>
            <div class="phone-body">
                <div class="phone-state">${payment === 'confirmed' ? `Platba ${AMOUNT} byla provedena.` : 'Platba byla zamítnuta.'}</div>
                <div class="phone-label">Zůstatek na účtu</div>
                <div class="phone-amount">${payment === 'confirmed' ? '19 318,50 Kč' : '24 318,50 Kč'}</div>
                <div class="phone-card">
                    <div><b>Platební karta *${card}</b><span>Aktivní</span></div>
                    <button type="button" class="phone-link" data-action="block">Zablokovat kartu</button>
                </div>
            </div>`,

        block: () => `
            <div class="phone-bar">Vaše banka</div>
            <form class="phone-body" data-block-form>
                <h4>Blokace karty *${card}</h4>
                <p>Co se stalo?</p>
                <label><input type="radio" name="reason" value="lost"> Kartu jsem ztratil(a)</label>
                <label><input type="radio" name="reason" value="stolen"> Karta mi byla odcizena</label>
                <label><input type="radio" name="reason" value="misuse"> Údaje o kartě získal někdo cizí</label>
                <p class="phone-error" data-error></p>
                <button type="submit" class="phone-btn phone-btn-danger">Zablokovat kartu</button>
                <button type="button" class="phone-btn phone-btn-light" data-action="back">Zpět</button>
            </form>`,

        blocked: () => `
            <div class="phone-bar">Vaše banka</div>
            <div class="phone-body">
                <div class="phone-state phone-state-done">Karta *${card} je zablokovaná.</div>
                <p>Žádná další platba touto kartou neprojde. Novou kartu vám pošleme poštou.</p>
            </div>`
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
