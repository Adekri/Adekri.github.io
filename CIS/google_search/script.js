/* Tlačítko „Zobrazit více / méně" u Přehledu od AI */
function toggleAi(button) {
    const body = document.getElementById("ai-body");
    const collapsed = body.classList.toggle("is-collapsed");
    button.classList.toggle("is-open", !collapsed);
    button.querySelector("span").textContent = collapsed ? "Zobrazit více" : "Zobrazit méně";
}
