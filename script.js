document.addEventListener("DOMContentLoaded", () => {
    // Data pro hry
    const games = {
        hra1: {
            name: "Hra 1: Cesta doprava",
            slides: {
                start: {
                    image: "https://via.placeholder.com/600x400?text=Začátek",
                    text: "Vítejte v Hře 1! Kam chcete jít dál?",
                    buttons: [
                        { text: "Doprava", nextSlide: "right" },
                        { text: "Doleva", nextSlide: "left" }
                    ]
                },
                right: {
                    image: "https://via.placeholder.com/600x400?text=Doprava",
                    text: "Vybrali jste si cestu doprava. Co chcete udělat?",
                    buttons: [
                        { text: "Jít dál", nextSlide: "forward" },
                        { text: "Vrátit se", nextSlide: "start" }
                    ]
                },
                left: {
                    image: "https://via.placeholder.com/600x400?text=Doleva",
                    text: "Vybrali jste si cestu doleva. Kam dál?",
                    buttons: [
                        { text: "Prozkoumat", nextSlide: "explore" },
                        { text: "Vrátit se", nextSlide: "start" }
                    ]
                },
                forward: {
                    image: "https://via.placeholder.com/600x400?text=Další+scéna",
                    text: "Jdete dál a narazíte na překážku. Co uděláte?",
                    buttons: [
                        { text: "Překonat", nextSlide: "end" },
                        { text: "Vrátit se", nextSlide: "right" }
                    ]
                },
                explore: {
                    image: "https://via.placeholder.com/600x400?text=Prozkoumání",
                    text: "Objevili jste skrytý poklad! Gratulujeme!",
                    buttons: [
                        { text: "Začít znovu", nextSlide: "start" }
                    ]
                },
                end: {
                    image: "https://via.placeholder.com/600x400?text=Konec",
                    text: "Gratulujeme, dokončili jste hru!",
                    buttons: [
                        { text: "Zpět na nabídku", nextSlide: "menu" }
                    ]
                }
            }
        },
        hra2: {
            name: "Hra 2: Dobrodružství",
            slides: {
                start: {
                    image: "https://via.placeholder.com/600x400?text=Začátek+Hra+2",
                    text: "Vítejte v Dobrodružství! Kam se vydáte?",
                    buttons: [
                        { text: "Do lesa", nextSlide: "forest" },
                        { text: "K řece", nextSlide: "river" }
                    ]
                },
                forest: {
                    image: "https://via.placeholder.com/600x400?text=Les",
                    text: "Narazili jste na medvěda! Co uděláte?",
                    buttons: [
                        { text: "Utéct", nextSlide: "start" },
                        { text: "Skrýt se", nextSlide: "hide" }
                    ]
                },
                river: {
                    image: "https://via.placeholder.com/600x400?text=Řeka",
                    text: "Objevili jste rybářský tábor!",
                    buttons: [
                        { text: "Zpět na začátek", nextSlide: "start" }
                    ]
                },
                hide: {
                    image: "https://via.placeholder.com/600x400?text=Skrytí",
                    text: "Podařilo se vám uniknout. Gratulujeme!",
                    buttons: [
                        { text: "Zpět na nabídku", nextSlide: "menu" }
                    ]
                }
            }
        }
    };

    // Vykreslení nabídky her
    function showGameMenu() {
        const container = document.getElementById("main-content");
        container.innerHTML = "<h1>Vyberte si hru</h1>";
        const gameList = document.createElement("div");
        gameList.className = "game-list";

        Object.keys(games).forEach(gameKey => {
            const button = document.createElement("button");
            button.textContent = games[gameKey].name;
            button.onclick = () => startGame(gameKey);
            gameList.appendChild(button);
        });

        container.appendChild(gameList);
    }

    // Vykreslení konkrétní hry
    function startGame(gameKey) {
        const game = games[gameKey];
        if (!game) {
            console.error("Hra nenalezena:", gameKey);
            return;
        }
        renderSlide(game.slides, "start");
    }

    // Vykreslení konkrétního slajdu
    function renderSlide(slides, slideKey) {
        const slide = slides[slideKey];
        const container = document.getElementById("main-content");

        if (!slide) {
            console.error("Neplatný slajd:", slideKey);
            return;
        }

        container.innerHTML = "";

        // Obrázek
        const img = document.createElement("img");
        img.src = slide.image;
        container.appendChild(img);

        // Text
        const text = document.createElement("p");
        text.textContent = slide.text;
        container.appendChild(text);

        // Tlačítka
        slide.buttons.forEach(button => {
            const btn = document.createElement("button");
            btn.textContent = button.text;
            if (button.nextSlide === "menu") {
                btn.onclick = showGameMenu;
            } else {
                btn.onclick = () => renderSlide(slides, button.nextSlide);
            }
            container.appendChild(btn);
        });
    }

    // Zobrazit úvodní nabídku
    showGameMenu();
});
