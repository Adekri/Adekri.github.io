

//Skript pro mazání řádku v tabulce
let rowToDelete = null;
const tableBody = document.querySelector("table tbody");

tableBody.addEventListener("click", function(e) {
    const deleteBtn = e.target.closest(".btn-outline-danger"); // chytne tlačítko "Smazat" i nově přidané
    if (!deleteBtn) return;

    rowToDelete = deleteBtn.closest("tr");
});

// tlačítko Ano v modalu
document.getElementById("delete-from-table").addEventListener("click", function () {
    if (rowToDelete) {
        rowToDelete.remove();  // smaže celý řádek
        rowToDelete = null;
    }

    const modalEl = document.getElementById('confirmDelete');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
});