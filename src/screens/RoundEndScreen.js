import { MAX_ROUNDS, TEAM_IDS } from "../core/constants.js";

function renderOperatorChecklist(team) {
  const operators = team.operators
    .map((operator) => {
      const stateClass = operator.alive ? "alive" : "dead";
      return `
        <button type="button" class="operator-toggle ${team.colorClass} ${stateClass}" data-team-id="${team.id}" data-operator-id="${operator.id}">${operator.label}</button>
      `;
    })
    .join("");

  return `
    <article class="team-card ${team.colorClass}">
      <h3>${team.label}</h3>
      <p class="subtle">Tap an operator to toggle alive/dead for the next round.</p>
      <div class="operator-list">${operators}</div>
    </article>
  `;
}

export function renderRoundEndScreen(viewModel, controller) {
  const attackers = viewModel.teams[TEAM_IDS.ATTACKERS];
  const defenders = viewModel.teams[TEAM_IDS.DEFENDERS];

  const canNextStandard = !viewModel.isOvertime && viewModel.roundNumber < MAX_ROUNDS;
  const canOvertime = !viewModel.isOvertime;

  const screen = document.createElement("section");
  screen.className = "screen";

  screen.innerHTML = `
    <h2 class="title">Round End</h2>
    <p class="subtle">Set operator survival status before the next round by tapping operators.</p>

    <section class="screen card">
      <div class="team-grid">
        ${renderOperatorChecklist(attackers)}
        ${renderOperatorChecklist(defenders)}
      </div>
    </section>

    <div class="row" id="next-actions"></div>
  `;

  screen.querySelectorAll(".operator-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      controller.toggleRoundEndOperator(button.dataset.teamId, Number(button.dataset.operatorId));
    });
  });

  const actions = screen.querySelector("#next-actions");

  if (canNextStandard) {
    const nextButton = document.createElement("button");
    nextButton.className = "btn btn-atk";
    nextButton.textContent = `Start Round ${viewModel.roundNumber + 1}`;
    nextButton.addEventListener("click", () => controller.startNextStandardRound());
    actions.appendChild(nextButton);
  }

  if (canOvertime) {
    const overtimeButton = document.createElement("button");
    overtimeButton.className = "btn btn-def";
    overtimeButton.textContent = "Go To Overtime (Final Round)";
    overtimeButton.addEventListener("click", () => controller.startOvertimeRound());
    actions.appendChild(overtimeButton);
  }

  const endButton = document.createElement("button");
  endButton.className = "btn btn-danger";
  endButton.textContent = "End Game";
  endButton.addEventListener("click", () => controller.endGame());
  actions.appendChild(endButton);

  if (!canNextStandard && !viewModel.isOvertime) {
    const message = document.createElement("p");
    message.className = "notice";
    message.textContent = "Round 5 reached. You can enter overtime or end the game.";
    screen.appendChild(message);
  }

  if (viewModel.isOvertime) {
    const message = document.createElement("p");
    message.className = "notice";
    message.textContent = "Overtime is the final round. End the game when ready.";
    screen.appendChild(message);
  }

  return screen;
}
