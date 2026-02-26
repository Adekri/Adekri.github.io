const header = document.getElementById('header');

// aktualizace času v horní liště
function updateTime() {
  const now = new Date();
  const el = document.getElementById('time');
  if (!el) return;
  el.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}
updateTime();
setInterval(updateTime, 60000);







//skript pro authenticator app
//const qrModal = document.getElementById('qr-modal');
const qrImage = document.getElementById('qr-image');
const closeQr = document.getElementById('close-qr');
const manualBtn = document.getElementById('manual-code-btn');
//const confirmQrBtn = document.getElementById('confirm-qr');
const qrOverlay = document.getElementById('qr-overlay');
let currentQRData = null;

// Zavření modal
/*
closeQr.addEventListener("click", () => {
  modal.classList.add("hidden");
  document.getElementById("header").style.display = "";
  document.querySelector(".app-content").style.display = "";
  document.querySelector(".fab").style.display = "";
  document.querySelector(".bottom-nav").style.display = "";
});
*/
// Manuální zadání kódu


manualBtn.addEventListener('click', () => {
  const secret = prompt("Zadejte tajný klíč:");
  if (secret) {
    const name = prompt("Zadejte jméno účtu:");
    if (name) {
      addAccountFromManual(name, secret);
      closeScan();
      qrImage.src = '';
      //qrOverlay.style.display = 'flex';
      //confirmQrBtn.classList.add('hidden');
    }
  }
});


// Vložení QR obrázku ze schránky do modal
/*
qrModal.addEventListener('paste', async (e) => {
  if (!e.clipboardData) return;

  const items = e.clipboardData.items;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const blob = item.getAsFile();
      const url = URL.createObjectURL(blob);
      qrImage.src = url;
      
      // Počkej až se obrázek načte
      qrImage.onload = () => {
        decodeQRCode(qrImage);
        qrOverlay.style.display = 'none';
        //confirmQrBtn.classList.remove('hidden');
      };
      break;
    }
  }
});
*/
// Dekódování QR kódu
/*
async function decodeQRCode(img) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0);
  
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height);
  
  if (code) {
    currentQRData = code.data;
    // QR kód dekódován
  } else {
    alert("Nepodařilo se dekódovat QR kód. Zkuste to znovu.");
    currentQRData = null;
    qrOverlay.style.display = 'flex';
    confirmQrBtn.classList.add('hidden');
  }
}
*/

async function decodeQRCode(img) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0);

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height);

  if (code) {
    const data = code.data;
    const parts = data.split('|');

    if (parts.length === 2) {
      const [secret, name] = parts;
      addAccountFromQR(name, secret);
    } else {
      addAccountFromQR('Účet', data);
    }


    closeScan();

    qrImage.src = '';
    //qrOverlay.style.display = 'flex';
  } else {
    alert("Nepodařilo se dekódovat QR kód.");
    qrOverlay.style.display = 'flex';
  }
}



// Potvrzení QR kódu
/*
confirmQrBtn.addEventListener('click', () => {
  if (currentQRData) {
    // Parsuj data z QR kódu (formát: secret|name)
    const parts = currentQRData.split('|');
    if (parts.length === 2) {
      const [secret, name] = parts;
      addAccountFromQR(name, secret);
    } else {
      // Fallback - pokud je to pouze secret
      addAccountFromQR('Účet', currentQRData);
    }
    
    // Zavření modal po potvrzení
    qrModal.classList.add('hidden');
    qrImage.src = '';
    qrOverlay.style.display = 'flex';
    confirmQrBtn.classList.add('hidden');
    currentQRData = null;
  }
});
*/





const addBtn = document.getElementById("add-account-btn");
const scanScreen = document.getElementById("scan-screen");
const accountList = document.getElementById("account-list");


scanScreen.addEventListener('paste', async (e) => {
  if (!e.clipboardData) return;

  const items = e.clipboardData.items;
  let foundImage = false;

  for (const item of items) {
    if (item.type.startsWith('image/')) {
      foundImage = true;
      const blob = item.getAsFile();
      const url = URL.createObjectURL(blob);

      qrImage.src = url;

      qrImage.onload = () => {
        decodeQRCode(qrImage);
      };

      break;
    }
  }

  // Pokud nebyl nalezen žádný obrázek, upozorníme uživatele
  if (!foundImage) {
    alert("Schránka neobsahuje obrázek QR kódu. Zkuste zkopírovat správný QR obrázek nebo zadejte klíč manuálně.");
  }
});

addBtn.addEventListener("click", () => {
  scanScreen.classList.remove("hidden");
  header.textContent = "Scan QR Code";
  addBtn.style.display = "none";
  scanScreen.focus();  
});

function closeScan() {
  scanScreen.classList.add("hidden");
  header.textContent = "Authenticator";
  addBtn.style.display = "";
}

/*
addBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
  document.getElementById("header").style.display = "none";
  document.querySelector(".app-content").style.display = "none";
  document.querySelector(".fab").style.display = "none";
  document.querySelector(".bottom-nav").style.display = "none";
});

closeBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  qrImage.src = '';
  qrOverlay.style.display = 'flex';
  //confirmQrBtn.classList.add('hidden');
});
*/
/*
function addAccount(name) {
  const secret = generateBase32Secret();

  const account = {
    name,
    secret
  };

  renderAccount(account);
}
  */

function addAccountFromQR(name, secret) {
  const account = {
    name,
    secret
  };

  renderAccount(account);
  
  // Uložit do localStorage pro komunikaci s webovkou
  localStorage.setItem('mfa_generated_code', JSON.stringify({
    name,
    secret,
    timestamp: Date.now()
  }));
}

function addAccountFromManual(name, secret) {
  const account = {
    name,
    secret
  };

  renderAccount(account);
  
  // Uložit do localStorage pro komunikaci s webovkou
  localStorage.setItem('mfa_generated_code', JSON.stringify({
    name,
    secret,
    timestamp: Date.now()
  }));
}

/*
function generateFakeCode() {
  return Math.floor(100000 + Math.random() * 900000);
}
  */

function renderAccount(account) {
  const div = document.createElement("div");
  div.className = "account-item";

  div.innerHTML = `
    <div class="account-icon">${account.name.charAt(0)}</div>
    <div class="account-info">
      <div class="account-name">${account.name}</div>
      <div style="display:flex; align-items:center; gap:10px;">
        <div class="account-code">------</div>
        <div class="account-timer">30</div>
        </div>
    </div>
  `;

  accountList.appendChild(div);

  const codeEl = div.querySelector(".account-code");
  const timerEl = div.querySelector(".account-timer");

  function update() {
    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / 30);
    const secondsRemaining = 30 - (epoch % 30);

    timerEl.textContent = secondsRemaining;

    generateTOTP(account.secret, counter).then(code => {
      codeEl.textContent = code;
    });
  }

  update();
  setInterval(update, 1000);
}

function base32ToBytes(base32) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  let bytes = [];

  base32 = base32.replace(/=+$/, "");

  for (let i = 0; i < base32.length; i++) {
    const val = alphabet.indexOf(base32[i].toUpperCase());
    bits += val.toString(2).padStart(5, "0");
  }

  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }

  return new Uint8Array(bytes);
}

async function generateTOTP(secret, counter) {
  const keyData = base32ToBytes(secret);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );

  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(4, counter);

  const hmac = await crypto.subtle.sign("HMAC", cryptoKey, buffer);
  const hmacArray = new Uint8Array(hmac);

  const offset = hmacArray[hmacArray.length - 1] & 0xf;

  const code =
    ((hmacArray[offset] & 0x7f) << 24) |
    (hmacArray[offset + 1] << 16) |
    (hmacArray[offset + 2] << 8) |
    hmacArray[offset + 3];

  return (code % 1000000).toString().padStart(6, "0");
}

/*
function generateBase32Secret(length = 16) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < length; i++) {
    secret += chars[Math.floor(Math.random() * chars.length)];
  }
  return secret;
}
  */

const backBtn = document.getElementById("nav-back");
backBtn.addEventListener("click", () => {
  closeScan();
});

const homeBtn = document.getElementById("nav-home");
homeBtn.addEventListener("click", () => {
  closeScan();
});