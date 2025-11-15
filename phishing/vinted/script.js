    const chats = {
      1: {
        name: "Zelená mikina JAKO",
        obrazek: "mikina.jpeg",
        info: {
          location: "Praha, Česká republika",
          time: "před 3 hodinami",
          text: "Ahoj, jsem Eva!",
          reviews: "Žádné recenze"
        },
        messages: [
          { from: "them", text: "Máte ještě mikinu?" },
          { from: "me", text: "Ano, stále je k dispozici :)" },
          { from: "them", text: "Skvělé! Zaplatila jsem a Vinted mi zobrazil tento QR kód. Naskenuj ho a vyzvedni si peníze." },
          { from: "them", text: "qrkod.png" },
        ]
      },
      2: {
        name: "Černé sportovní kalhoty",
        obrazek: "kalhoty.jpg",
        info: {
          location: "Brno, Česká republika",
          time: "před 1 hodinou",
          text: "Ahoj, jsem Karel!",
          reviews: "Žádné recenze"
        },
        messages: [
          { from: "them", text: "Kolik je poslední cena?" },
          { from: "me", text: "Nabízím za 450 Kč." },

        ]
      },
      3: {
        name: "Modré džíny Levi's",
        obrazek: "dziny.jpeg",
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
      }
    };

    const chatList = document.getElementById("chatList");
    const chatHeader = document.getElementById("chatHeader");
    const chatMessages = document.getElementById("chatMessages");
    const chatName = document.getElementById("chatName");
    const chatInput = document.getElementById("chatInput");
    const sendBtn = document.getElementById("sendBtn");
    let activeChat = null;

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

      // info card
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

    function sendMessage(){
      if(!activeChat) return;
      const text = chatInput.value.trim();
      if(!text) return;
      chats[activeChat].messages.push({ from:"me", text });
      chatInput.value = "";
      loadChat(activeChat);
    }