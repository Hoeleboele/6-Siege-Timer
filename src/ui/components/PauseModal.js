export function createPauseModal({ onConfirm, onCancel }) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";

  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
    <h3 class="title">Tactical Pause</h3>
    <p class="subtle">Choose one adjustment and confirm.</p>

    <form id="pause-form" class="screen">
      <label class="option"><input type="radio" name="adjustment" value="add-own" checked> Add 30s to own timer</label>
      <label class="option"><input type="radio" name="adjustment" value="add-enemy"> Add 30s to enemy timer</label>
      <label class="option"><input type="radio" name="adjustment" value="sub-own"> Subtract 30s from own timer</label>
      <label class="option"><input type="radio" name="adjustment" value="sub-enemy"> Subtract 30s from enemy timer</label>

      <div class="row">
        <button type="submit" class="btn btn-neutral">Confirm Selection</button>
        <button type="button" class="btn btn-danger" id="cancel-pause">Cancel</button>
      </div>
    </form>
  `;

  const form = modal.querySelector("#pause-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const selected = formData.get("adjustment");
    onConfirm(selected);
  });

  const cancelButton = modal.querySelector("#cancel-pause");
  cancelButton.addEventListener("click", () => onCancel());

  backdrop.appendChild(modal);
  return backdrop;
}
