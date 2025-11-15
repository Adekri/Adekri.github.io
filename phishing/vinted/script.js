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
          { from: "me", text: "Ano, stále je k dispozici :)" }
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
        div.textContent = m.text;
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