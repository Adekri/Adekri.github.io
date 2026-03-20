//driver pro vytváření tour        
const driver = window.driver.js.driver;
let driverObj = null;
let allowBiometricKey = false;

/*reset biometriky při překliknutí*/
function startBiometricAuth() {
    allowBiometricKey = false;

    // reset tlačítka
    verifyBtn.disabled = true;
    verifyBtn.classList.add("loading");
    verifyBtn.querySelector(".btn-text").textContent = "Ověřujeme";
    verifyBtn.querySelector(".spinner").style.display = "inline-block";

    // zobraz modal
    winModal.style.display = "flex";
    setTimeout(() => {

        driverObj = driver({
            showProgress: true,
            nextBtnText: "Další",
            prevBtnText: "Zpět",
            doneBtnText: "Hotovo",
            allowClose: false,
            onHighlighted: (element, step, { state }) => {
                if (step.element === "#stornoBtn") {
                    allowBiometricKey = true;
                }
            },
            steps: [
                {
                    element: "#biometric-modal",
                    popover: {
                        title: "Postup",
                        description: "Stejně jako při nastavování biometriky stiskněte místo sejmutí otisku prstu klávesu 'O'.",
                        side:"right",
                    }
                },
                {
                    element: "#stornoBtn",
                    popover: {
                        title: "Postup",
                        description: "Nebo okno s ověřením biometriky zavřete a vyzkoušejte si přihlášení pomocí TOTP kódů.",
                   side:"right",
                    }
                }
            ]
        });

        driverObj.drive();

    }, 500);

    //showInfoModal("Podobně jako v předchozím úkolu místo sejmutí otisku prstu stiskněte klávesu 'O'.");

    // připoj listener znovu
    document.removeEventListener('keydown', handleKeyPress);
    document.addEventListener('keydown', handleKeyPress);
}




// obsluha modalu pro otisk prstu
const stornoBtn = document.getElementById("stornoBtn");
const loginBtn = document.getElementById("verifyBtn");

stornoBtn.onclick = function () {

    if (driverObj) {
        driverObj.destroy();
        driverObj = null;
    }

    // aktivace tlačítka
    loginBtn.disabled = false;
    loginBtn.classList.remove("loading");

    // upravení textu a skrytí spinneru
    loginBtn.querySelector(".btn-text").textContent = "Pokračovat";
    loginBtn.querySelector(".spinner").style.display = "none";

    // zavření modalu
    closeWinModal();
};


// pokud se modal zavře tak se znovu spustí tímto (i po navrácení z TOTP ověření)
loginBtn.addEventListener("click", startBiometricAuth);


// obsluha výběru přihlačivací metody -- řeší i aby se vracelo na defaultní hodnoty
const multifactorForm = document.getElementById("multifactor-form");
const totpForm = document.getElementById("totp-form");
const mfaSelect = document.getElementById("mfaMethod");
const mfaSelectTOTP = document.getElementById("mfaMethodTOTP");

mfaSelect.addEventListener("change", function () {
    if (this.value === "2") {
        multifactorForm.style.display = "none";
        totpForm.style.display = "block";
        setTimeout(() => {

            driverObj = driver({
                showProgress: true,
                nextBtnText: "Další",
                prevBtnText: "Zpět",
                doneBtnText: "Hotovo",
                allowClose: false,
                steps: [
                    {
                        element: "#totp-form",
                        popover: {
                            title: "Postup",
                            description: "Podobně jako při nastavení přihlašování pomocí TOTP, zadejte kód, který se pravidelně obnovuje ve vašem telefonu.",
                            side: "right",
                        }
                    }
                ]
            });

            driverObj.drive();

        }, 500);
        //showInfoModal("Zadejte kód z autentizační aplikace.");
        mfaSelectTOTP.value = "2";
    } else {
        totpForm.style.display = "none";
        multifactorForm.style.display = "block";
    }
});

mfaSelectTOTP.addEventListener("change", function () {
    if (this.value === "1") { // biometrika
        totpForm.style.display = "none";
        multifactorForm.style.display = "block";
        mfaSelect.value = "1";
    } else {
        multifactorForm.style.display = "none";
        totpForm.style.display = "block";
    }
});


/* Zavření modalu */
function closeWinModal() {
    document.getElementById("winModal").style.display = "none";
}



/* Zobrazení hesla */
const passwordInput = document.getElementById("password");
const toggleBtn = document.getElementById("togglePassword");

function showPassword() {
    passwordInput.type = "text";
}

function hidePassword() {
    passwordInput.type = "password";
}


toggleBtn.addEventListener("mousedown", showPassword);
toggleBtn.addEventListener("mouseup", hidePassword);
toggleBtn.addEventListener("mouseleave", hidePassword);
toggleBtn.addEventListener("touchstart", showPassword);
toggleBtn.addEventListener("touchend", hidePassword);


/* Odeslání formuláře se jménem*/
document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const subheader = document.getElementById("subheader");
    const loginForm = document.getElementById("login-form");
    const passwordForm = document.getElementById("password-form");

    const name = username.includes('@') ? username.split('@')[0] : username;

    if (username !== "123456@vut.cz" && username !== "123456@vutbr.cz" && username !== "123456") {
        showInfoModal("Zadejte platný účet (123456).");
        return;
    }


    subheader.textContent = "Heslo";
    loginForm.style.display = "none";
    passwordForm.style.display = "block";
    document.getElementById("username-display").textContent = name;


});

const winModal = document.getElementById("winModal");

/* Odeslání formuláře s heslem*/
document.getElementById("password-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const passwordForm = document.getElementById("password-form");
    const multifactorForm = document.getElementById("multifactor-form");
    const subheader = document.getElementById("subheader");
    const verifyBtn = document.getElementById("verifyBtn");

    passwordForm.style.display = "none";
    multifactorForm.style.display = "block";
    subheader.textContent = "Multifaktorová autentizace\n\n(MFA)";


    /* Simulace načítání a následné zobrazení modalu */
    setTimeout(startBiometricAuth, 1000);

});


// listener na stisknutí klávesy O a nálsedné pokračování na microsoft stay signed in
const verifyBtn = document.getElementById("verifyBtn");

function handleKeyPress(ev) {
    if ((ev.key === 'o' || ev.key === 'O')) {

        if (!allowBiometricKey) return;

        if (driverObj) {
            driverObj.destroy();
            driverObj = null;
        }

        closeWinModal();
        document.removeEventListener('keydown', handleKeyPress);

        setTimeout(() => {
            verifyBtn.disabled = false;
            verifyBtn.classList.remove('loading');
            verifyBtn.querySelector('.btn-text').textContent = 'Pokračovat';
            verifyBtn.querySelector('.spinner').style.display = 'none';
            window.location.href = "../microsoft-login/stay-signed-in.html";
        }, 1000);
    }
}

// to samé pro totp - kontroluje TOTP kód a v případě úspěchu přechází na microsoft okno
const totpFormEl = document.getElementById("totp-form");
const totpCode = document.getElementById("totp-code");

totpFormEl.addEventListener("submit", function (e) {
    e.preventDefault();

    if (driverObj) {
        driverObj.destroy();
        driverObj = null;
    }
    const input = totpCode.value.trim();
    const actual = localStorage.getItem("actualTOTP");
    const last = localStorage.getItem("lastTOTP");

    if (input === actual || input === last) {
        setTimeout(() => {
            window.location.href = "../microsoft-login/stay-signed-in.html";
            mfaSelect.value = "1";
        }, 1000);
    } else {
        showInfoModal("Neplatný kód. Zkuste znovu.");
    }
});





