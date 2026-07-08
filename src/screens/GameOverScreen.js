import { TEAM_IDS } from "../core/constants.js";
import { formatTime } from "../ui/formatTime.js";

export function renderGameOverScreen(viewModel, controller) {
  const attackers = viewModel.teams[TEAM_IDS.ATTACKERS];
  const defenders = viewModel.teams[TEAM_IDS.DEFENDERS];

  const rows = viewModel.roundRecords
    .map((record) => {
      const attackersUsed = record.used[TEAM_IDS.ATTACKERS] ?? 0;
      const defendersUsed = record.used[TEAM_IDS.DEFENDERS] ?? 0;
      const attackersTotal = record.start?.[TEAM_IDS.ATTACKERS] ?? 0;
      const defendersTotal = record.start?.[TEAM_IDS.DEFENDERS] ?? 0;

      return `
        <tr>
          <td>${record.label}</td>
          <td>${formatTime(attackersUsed)} / ${formatTime(attackersTotal)}</td>
          <td>${formatTime(defendersUsed)} / ${formatTime(defendersTotal)}</td>
        </tr>
      `;
    })
    .join("");

  const screen = document.createElement("section");
  screen.className = "screen";
  screen.innerHTML = `
    <h2 class="title">Game Over</h2>
    <p class="subtle">Time used per round (Used / Total).</p>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>Round</th>
            <th>${attackers.label}</th>
            <th>${defenders.label}</th>
          </tr>
        </thead>
        <tbody>
          ${rows || "<tr><td colspan='3'>No rounds were recorded.</td></tr>"}
        </tbody>
      </table>
    </div>

    <div class="row">
      <button class="btn btn-neutral" id="back-menu">Main Menu</button>
      <button class="btn btn-atk" id="new-game">New Game</button>
    </div>
  `;

  screen.querySelector("#back-menu").addEventListener("click", () => controller.goToMenu());
  screen.querySelector("#new-game").addEventListener("click", () => controller.goToTimeSelection());

  return screen;
}
