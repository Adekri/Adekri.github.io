window.showInfoModal = function(text) {
    const textEl = document.getElementById("infoModalText");
    textEl.textContent = text;

    const modalEl = document.getElementById("infoModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
};