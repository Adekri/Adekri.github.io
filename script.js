// Data pro jednotlivé slajdy
const slides = {
    start: {
        image: "https://via.placeholder.com/600x400?text=Začátek",
        text: "Vítejte v naší interaktivní prezentaci! Kam chcete jít dál?",
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
        text: "Gratulujeme, dokončili jste prezentaci!",
        buttons: [
            { text: "Začít znovu", nextSlide: "start" }
        ]
    }
};

// Funkce pro vykreslení slajdu
function renderSlide(slideKey) {
    const slide = slides[slideKey];
    const slideContainer = document.getElementById("slide");
    
    // Vymazat předchozí obsah
    slideContainer.innerHTML = "";

    // Přidat obrázek
    const img = document.createElement("img");
    img.src = slide.image;
    slideContainer.appendChild(img);

    // Přidat text
    const text = document.createElement("p");
    text.textContent = slide.text;
    slideContainer.appendChild(text);

    // Přidat tlačítka
    slide.buttons.forEach(button => {
        const btn = document.createElement("button");
        btn.textContent = button.text;
        btn.onclick = () => renderSlide(button.nextSlide);
        slideContainer.appendChild(btn);
    });
}

// Načíst úvodní slajd
renderSlide("start");
