    document.getElementById("login-form").addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("address").value.trim();
      const header = document.getElementById("header");
      const form = document.getElementById("login-form");
      const loginOptions = document.querySelector(".login-options");
      const stornoLink = document.getElementById("storno-link");
      const ants = document.getElementById("ants");

      if (email !== "123456@vut.cz" && email !== "123456@vutbr.cz") {
        showInfoModal("Zadejte platnou e-mailovou adresu (123456@vut.cz).");
        return;
      }

      header.textContent = "Přesměrujeme vás na přihlašovací stránku vaší organizace.";
      form.style.display = "none";
      loginOptions.style.display = "none";
      stornoLink.style.display = "block";
      ants.style.display = "block";

      setTimeout(function () {

        window.location.href = "../vut-login/index.html";

      }, 2000);

    });