   // jednotlivé chatové konverzace
   // při přidání další třeba přidat zde i v index.html ve výpisu chatů - jinak nepůjde otevřít
   const chats = {
      1: {
        name: "Zelená mikina JAKO",
        obrazek: "images/mikina.jpeg",
        info: {
          location: "Praha, Česká republika",
          time: "před 3 hodinami",
          text: "Ahoj, jsem Eva!",
          reviews: "Žádné recenze"
        },
        messages: [
          { from: "them", text: "Máte ještě mikinu?" },
          { from: "me", text: "Ano, stále je k dispozici :)" },
          { from: "them", text: "Skvělé! Zaplatila jsem a Vinted mi zobrazil tento QR kód. Naskenujte ho a vyzvedněte si peníze." },
          { from: "them", text: "images/qrkod.png" },
        ]
      },
      2: {
        name: "Černé sportovní kalhoty",
        obrazek: "images/kalhoty.jpg",
        info: {
          location: "Brno, Česká republika",
          time: "před 1 hodinou",
          text: "Ahoj, jsem Karel!",
          reviews: "Žádné recenze"
        },
        messages: [
          { from: "them", text: "Ahoj, měl bych zájem sportovní kalhoty, které tady nabízíš. Bohužel se mi nějak nezobrazují přiložené fotografie." },
          { from: "them", text: "Mohl bys mi prosím fotky poslat na e-mail mrjohnfraud@gmail.com?" },

        ]
      },
      3: {
        name: "Modré džíny Levi's",
        obrazek: "images/dziny.jpeg",
        info: {
            location: "Polsko",
            time: "před 2 dny",
            text: "Ahoj, jsem Vinted team!",
            reviews: "Žádné recenze"
        },
        messages: [
            { from: "them", text: "Drahý Prodávající, tvůj předmět se úspěšně prodal." },
            { from: "them", text: "Tvoje platba je momentálně pozastavená. Aby se ti prostředky uvolnily, musíš si v platebním systému aktivovat účet." },
            { from: "them", text: "Proces aktivace můžeš začít na následujícím odkazu: https://vintd-order%2einfo/25332. Po dokončení aktivace ti půjdou přijímat platby a budeš moct na Vinted dál prodávat bez omezení." },
            { from: "them", text: "Děkujeme za spolupráci a pochopení." }
        ]
      },
      4: {
        name: "Stará zrcadlovka",
        obrazek: "images/fotoaparat.jpg",
        info: {
          location: "Jihlava, Česká republika",
          time: "před 1 dnem",
          text: "Ahoj, jsem Lucie!",
          reviews: "4,9/5 (120 recenzí)"
        },
        messages: [
          { from: "them", text: "Ahoj, měla bych zájem o fotoaparát, který nabízíš. Bylo by možné osobní předání v Jihlavě? Jestli ne, měla bych zájem i o zaslání poštou. Předem díky za zprávu." },       
        ]
      },
      5: {
        name: "Batoh",
        obrazek: "images/batoh.jpg",
        info: {
          location: "Ostrava, Česká republika",
          time: "před 5 hodinami",
          text: "Ahoj, jsem Tým Vinted!",
          reviews: "Žádné recenze"
        },
        messages: [
          { from: "them", text: "Tvůj předmět se právě prodal!" },
          { from: "them", text: "Abys prodej potvrdil, pošli do tohoto chatu svoji e-mailovou adresu. Na tuto adresu ti poté přijde potvrzení s odkazem na přijetí platby." },
          { from: "them", text: "Po potvrzení prodeje ti přijde štítek pro odeslání balíku." },
          { from: "them", text: "Tvůj Vinted tým" },
         
        ]
      },
    };

    const chatList = document.getElementById("chatList");
    const chatHeader = document.getElementById("chatHeader");
    const chatMessages = document.getElementById("chatMessages");
    const chatName = document.getElementById("chatName");
    const chatInput = document.getElementById("chatInput");
    const sendBtn = document.getElementById("sendBtn");
    let activeChat = null;

    //otevírání chatu při kliknutí
    chatList.addEventListener("click", e => {
      const item = e.target.closest(".chat-item");
      if(!item) return;
      const id = item.dataset.chat;
      activeChat = id;
      loadChat(id);
    });

    function loadChat(id){
      const chat = chats[id];
      chatName.textContent = chat.name;
      chatHeader.querySelector("img").src = chat.obrazek;
      chatMessages.innerHTML = "";

      // zobrazení úvofní vizitky uživatele - pro účely úkolu důležité počty hodnocení ale i jméno
      const info = document.createElement("div");
      info.style.padding = "14px";
      info.style.border = "1px solid #eee";
      info.style.marginBottom = "12px";
      info.style.maxWidth = "fit-content";
      info.innerHTML = `<strong>${chat.info.text}</strong><br>
      <span style='color:#777;font-size:13px'>${chat.info.reviews}</span><br>
      <span style='color:#777;font-size:13px'><span class="material-icons" style="font-size:16px;vertical-align:middle">location_on</span> ${chat.info.location}</span><br>
      <span style='color:#777;font-size:13px'><span class="material-icons" style="font-size:16px;vertical-align:middle">visibility</span> ${chat.info.time}</span>`;
      chatMessages.appendChild(info);
      // načtení obsahu zprávy včetně řešení zobrazení obrázků
      chat.messages.forEach(m => {
        const div = document.createElement("div");
        div.className = "msg " + m.from;

        if(m.text.endsWith(".png") || m.text.endsWith(".jpg") || m.text.endsWith(".jpeg")){
          const img = document.createElement("img");
          img.src = m.text;
          img.style.maxWidth = "100px";
          div.appendChild(img);
        } else {
          div.textContent = m.text;
        }
        chatMessages.appendChild(div);
      });
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    sendBtn.addEventListener("click", sendMessage);
    activeChat = 1; 
    loadChat(1);

    chatInput.addEventListener("keydown", e => { if(e.key === "Enter") sendMessage(); });


    // texty které se zobrazí po odeslání zprávy v chatech
    const popupMessages = {
      1: "Takto kupování na Vinted nefunguje. \nQR kód pravděpodobně povede na podvodné stránky, kde se útočník pokusí získat tvé platební údaje.\n\nV tomto případě vede QR kód na stránky, kde byl vytvořen. Můžete se tedy podívat, jak jednoduché to je.",
      2: "Touto technikou se útočníci snaží přesměrovat komunikaci mimo Vinted platformu, kde uživatelé nejsou Vintedem chráněni.",
      3: "Útočníci občas vytváří účty, které napodobují oficiální Vinted účet. \n\nVinted ale nikdy uživatele takto nekontaktuje. Odkaz ve zprávě navíc neodkazuje na oficiální Vinted doménu ale zřejmě útočníkovu.",
      4: "Výborně! Tento prodávající skuečně dosud vypadá důvěryhodně. \n\nFLAG(DuverujAleProveruj)",
      5: "Útočníci občas vytváří účty, které napodobují oficiální Vinted účet. \n\nVinted ale nikdy uživatele takto nekontaktuje. Oficiální Vinted na tebe navíc údaje už má.\n\nTouto technikou se útočníci snaží přesměrovat komunikaci mimo Vinted platformu, kde uživatelé nejsou Vintedem chráněni. "  
    };

    // obsluha odesílání zpráv
    function sendMessage(){
      if(!activeChat) return;

      const text = chatInput.value.trim();
      if(!text) return;

      chats[activeChat].messages.push({ from: "me", text });
      chatInput.value = "";
      loadChat(activeChat);

      alert(popupMessages[activeChat] || "Zpráva byla odeslána.");
    }



  // obsluha reklamy
  function showOverlay(el) {
    const container = el.closest('.ad-container');
    container.querySelector('.ad-overlay').style.display = 'block';
  }

  function hideOverlay(el) {
    const overlay = el.closest('.ad-overlay');
    overlay.style.display = 'none';
  }