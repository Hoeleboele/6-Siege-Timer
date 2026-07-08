export function renderMenuScreen(_viewModel, controller) {
  const screen = document.createElement("section");
  screen.className = "screen";

  screen.innerHTML = `
    <h2 class="title">Main Menu</h2>
    <p class="subtle">Configure team operator time, run deployment, then track round clocks.</p>
    <div class="card">
      <p>Attackers (Blue) and Defenders (Orange) both start with five operators.</p>
      <p>Attackers always act first each round.</p>
    </div>
    <div class="row">
      <button class="btn btn-neutral" id="start-game">Start Game</button>
    </div>
  `;

  screen.querySelector("#start-game").addEventListener("click", () => {
    controller.goToTimeSelection();
  });

  return screen;
}
