
// Skript pro mazání řádku v tabulce
// Funkce je jednoduchá: klikneme na tlačítko Smazat -> uložíme řádek -> v modalu potvrdíme smazání.
let selectedRowForDelete = null;
const tableBody = document.querySelector("table tbody");

if (tableBody) {
  tableBody.addEventListener("click", function (event) {
    const deleteButton = event.target.closest(".btn-outline-danger");
    if (!deleteButton) return;

    selectedRowForDelete = deleteButton.closest("tr");
  });
}

const deleteConfirmButton = document.getElementById("delete-from-table");
if (deleteConfirmButton) {
  deleteConfirmButton.addEventListener("click", function () {
    if (selectedRowForDelete) {
      selectedRowForDelete.remove();
      selectedRowForDelete = null;
    }

    const modalElement = document.getElementById('confirm-delete');
    if (modalElement) {
      const modalInstance = bootstrap.Modal.getInstance(modalElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  });
}