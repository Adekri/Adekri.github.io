
const chats = document.querySelectorAll('.chat-wrapper');
const list = document.getElementById('list');
const header = document.getElementById('header');
const phone = document.querySelector('.phone');
const inputBar = document.querySelector('.input-bar');
const input = inputBar.querySelector('input');
const sendBtn = inputBar.querySelector('button');


//když tady tohle nebylo tak se muselo pokaždé vytvářet znovu dolní lišta pod chatem -- takhle je tam nonstop
function setChatPosition(chat) {
  const topOffset = header.offsetTop + header.offsetHeight;
   chat.style.top = topOffset + 'px';
   chat.style.height = `calc(100% - ${topOffset}px)`;
}

function showChat(id){
  // skrytí seznamu
  list.style.display = 'none';
  chats.forEach(c=>c.style.display='none');

  // zobrazení konverzace místo skrytého seznamu
  const conv = document.querySelector(`.conversation[data-chat="${id}"]`);
  if (conv) {
    const nameEl = conv.querySelector('.conv-name');
    if (nameEl) header.textContent = nameEl.textContent;
  }

  const chat = document.getElementById('chat-'+id);
  if(!chat) return;
  chat.style.display = 'flex';
  setChatPosition(chat);

  // aktivní chat
  phone.dataset.active = id;

  //zobrazení inputu
  inputBar.style.display = 'flex';
  input.value = '';
  input.focus();

  // scroll
  const msgs = chat.querySelector('.messages-container');
  msgs.scrollTop = msgs.scrollHeight;
}

//skrytí chatu a zobrazení seznamu
function showList(){
  chats.forEach(c=>c.style.display='none');
  list.style.display='flex';
  header.textContent = 'Zprávy';
  phone.dataset.active = '';
  inputBar.style.display = 'none';
}

// klik na konverzaci
document.querySelectorAll('.conversation').forEach(el=>{
  el.addEventListener('click',()=>showChat(el.dataset.chat));
});
//tlačítko zpět + přidána stejná reakce i na kliknutí "domů"
document.getElementById('nav-back').addEventListener('click',()=>showList());
document.getElementById('nav-home').addEventListener('click',()=>showList());

// odesílání zpráv 
sendBtn.addEventListener('click', ()=>{
  const chatId = phone.dataset.active;
  if(!chatId) return;
  const chat = document.getElementById('chat-'+chatId);
  const text = input.value.trim();
  if(!text) return;
  const msg = document.createElement('div');
  msg.className = 'message from-me';
  msg.textContent = text;
  chat.querySelector('.messages-container').appendChild(msg);
  input.value = '';
  const msgs = chat.querySelector('.messages-container');
  msgs.scrollTop = msgs.scrollHeight;
  if (chatId === 'aneta') {
    if (text.includes('920183')) {
      alert('Pozor! Odesláním tohoto kódu umožníte Anetě přístup k vašemu Google účtu. FLAG(DvoufazoveOvereniNeniVse).');
    } else {
      alert('Výborně! Neposlali jste Anetě kód a tím jste odolali pokusu o obejití dvoufázového ověření. FLAG(DvoufazoveOvereniNeniVse).');
    }
  }

});

// enter -> odeslat
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendBtn.click();
  }
});

//aktualizace času 
function updateTime(){
  const now = new Date();
  const el = document.getElementById('time');
  if(!el) return;
  el.textContent =
    now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
}
updateTime(); setInterval(updateTime,60000);


//otevření jednoduché webové strákny z odkazu v SMS
document.body.addEventListener('click', e => {
  const link = e.target.closest('.sms-link');
  if (!link) return;
  e.preventDefault();

  //stranka se vybere podle atribudu data-page v odkazu
  //takto se to pak použije v html
  //<a href="#" class="sms-link" data-page="Login">Přihlásit se</a>
  const page = link.dataset.page;
  const headerTitle = document.getElementById('header');
  const web = document.getElementById('web-browser');
  const content = web.querySelector('.messages-container > div');

  headerTitle.textContent = page; // název nahoře je defaultně totok

  // tady se definuji ty stranky ktere se pak vlozi do "chatu" webova stranky
  switch (page) {
    case 'gov':
      headerTitle.textContent = 'www.obcan.cz-gov.net'; //takhle se dá změnit text v záhlaví
      content.innerHTML = `
<div style="display:flex;flex-direction:column;align-items:center;padding:5%;background:#2262a2;">

  <!-- Logo a slogan -->
  <img style="width:50%;margin-bottom:10px;" src="images/portal_obcana_logo.png" alt="portal">
  <p style="color:white;margin:0 0 15px 0;font-size:14px;">Komunikujte s úřady online.</p>  

  <!-- Upozornění -->
  <div style="display:flex;align-items:center;gap:8px;background:white;padding:10px 12px;font-size:12px;margin-bottom:15px;width:90%;">
    <span class="material-icons" style="color:#d32f2f;font-size:18px;">error</span>
    <p style="margin:0;line-height:1.4;">
      Přihlášení pomocí datové schránky je nyní omezeno z důvodu plánované odstávky systému datových schránek. Děkujeme za pochopení.
    </p>
  </div>          

  <!-- Výběr přihlášení -->
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;background:white;padding:12px;width:90%;margin-bottom:40%;">
    <p style="font-weight:bold;margin:0 0 8px 0;">Vyberte způsob přihlášení:</p>      

    <a href="#" class="sms-link" data-page="moneta-login" 
       style="gap:20px;display:flex;align-items:center;text-decoration:none;
              border:none;background:#f5f5f5;padding:15px;
              margin:4px 0;width:90%;color:inherit;">
      <img style="width:25px;" src="images/lev.png" alt="lev">
      Bankovní identita
    </a>

    <p style="display:flex;align-items:center;gap:20px;border:none;background:#f9f9f9;padding:15px;
              margin:8px 0;width:90%;color:#999;">
      <span class="material-icons" style="color:#999;font-size:25px;">mail</span>  

      Datová schránka
    </p>

    <!--<button type="button" disabled
      style="display:flex;align-items:center;gap:6px;border:none;padding:8px 12px;margin:8px 0;width:100%;">
      <span class="material-icons" style="color:#999;font-size:18px;">mail</span>  
      Datová schránka
    </button>-->
  
    </div>

</div>


      `;
      break;
    case 'Moneta':
      content.innerHTML = `
        <h2>MONETA Money Bank</h2>
        <p>Vaše karta byla úspěšně přidána do Google Pay.</p>
        <p>Nyní můžete platit mobilem u všech bezkontaktních terminálů.</p>
      `;
      break;
    case 'moneta-login':
      headerTitle.textContent = 'www.moenta-login.online.net'; 
      content.innerHTML = `
        <div style="padding:0 5%;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%; background: linear-gradient(135deg, #1b1464, #ff0033);margin-bottom:55%;">
          <div style="width:90%;max-width:320px;background:white;padding:20px;border-radius:16px;">
            <h2 style="text-align:center;margin-top:0;">Přihlášení</h2>
            <form id="login-form" style="display:flex;flex-direction:column;gap:12px;">
              <div>
                <label style="font-size:13px;color:#555;">ID</label>
                <input type="text" id="username"
                      style="width:90%;padding:10px;border:1px solid #ccc;border-radius:8px;margin-top:4px;">
              </div>
              <div>
                <label style="font-size:13px;color:#555;">Heslo</label>
                <input type="password" id="password"
                      style="width:90%;padding:10px;border:1px solid #ccc;border-radius:8px;margin-top:4px;">
              </div>
              <button type="submit"
                style="padding:10px;background: #1b1464;color: white;border:none;border-radius:8px;font-weight:bold;cursor:pointer;">
                Přihlásit
              </button>
            </form>
            <p id="login-status" style="text-align:center;font-size:13px;color:#888;margin-top:10px;"></p>
          </div>
        </div>
      `;

      const form = document.getElementById('login-form');
      const status = document.getElementById('login-status');

      form.addEventListener('submit', e => {
        e.preventDefault();
        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value.trim();
        
        if (!user || !pass) {
          status.textContent = 'Vyplňte prosím obě pole.';
          status.style.color = '#c00';
          return;
        }


        if (user === '1092740' && pass === 'VelmiBezpecneHeslo123!') {
          status.textContent = 'Pozor! Tímto jste útočníkovi poskytli přihlašovací údaje k Vašemu bankovnictví! FLAG(VladniWebyMajiJednotnouDomenu)';
          status.style.color = 'red';
          document.querySelectorAll('.hidden-until-flag').forEach(el => {el.classList.remove('hidden-until-flag');});
        } else {
          status.textContent = 'Výborně! Nezadali jste Vaše skutečné přihlašovací údaje a odolali jste útoku. FLAG(VladniWebyMajiJednotnouDomenu)';
          status.style.color = 'green';
          document.querySelectorAll('.hidden-until-flag').forEach(el => {el.classList.remove('hidden-until-flag');});
        }
    });
      break;

    default: //pokud se v html pouzije nazev který tady není, haha
      content.innerHTML = `
        <h2>Error 404</h2>
        <p>Stránka nenalezena</p>
      `;
  }

  // schovat seznam a ostatní chaty
  list.style.display = 'none';
  chats.forEach(c => c.style.display = 'none');

  //schování inputu
  inputBar.style.display = 'none';

  //zobrazení browseru
  web.style.display = 'flex';
  setChatPosition(web); //využití funkce pro chaty - možná přejmenovat na něco neutralniho?

  phone.dataset.active = 'web';
});

