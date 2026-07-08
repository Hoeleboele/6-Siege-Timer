import { TEAM_IDS, TIME_OPTIONS_SECONDS } from "../core/constants.js";

function buildOptions(selected) {
  return TIME_OPTIONS_SECONDS.map((seconds) => {
    const selectedAttribute = seconds === selected ? "selected" : "";
    return `<option value="${seconds}" ${selectedAttribute}>${seconds}s</option>`;
  }).join("");
}

export function renderTimeSelectionScreen(viewModel, controller) {
  const attackers = viewModel.teams[TEAM_IDS.ATTACKERS];
  const defenders = viewModel.teams[TEAM_IDS.DEFENDERS];

  const screen = document.createElement("section");
  screen.className = "screen";
  screen.innerHTML = `
    <h2 class="title">Operator Time Selection</h2>
    <p class="subtle">Choose one time value per team. This value is used for all operators on that team.</p>

    <div class="team-grid">
      <article class="team-card ${attackers.colorClass}">
        <h3>${attackers.label}</h3>
        <label for="attackers-time">Time Per Operator</label>
        <select id="attackers-time">
          ${buildOptions(attackers.perOperatorSeconds)}
        </select>
      </article>

      <article class="team-card ${defenders.colorClass}">
        <h3>${defenders.label}</h3>
        <label for="defenders-time">Time Per Operator</label>
        <select id="defenders-time">
          ${buildOptions(defenders.perOperatorSeconds)}
        </select>
      </article>
    </div>

    <div class="row">
      <button class="btn btn-neutral" id="back-menu">Back</button>
      <button class="btn btn-atk" id="to-deployment">Continue To Deployment</button>
    </div>
  `;

  screen.querySelector("#attackers-time").addEventListener("change", (event) => {
    controller.setPerOperatorTime(TEAM_IDS.ATTACKERS, Number(event.target.value));
  });

  screen.querySelector("#defenders-time").addEventListener("change", (event) => {
    controller.setPerOperatorTime(TEAM_IDS.DEFENDERS, Number(event.target.value));
  });

  screen.querySelector("#back-menu").addEventListener("click", () => {
    controller.goToMenu();
  });

  screen.querySelector("#to-deployment").addEventListener("click", () => {
    controller.startDeploymentPhase();
  });

  return screen;
}
