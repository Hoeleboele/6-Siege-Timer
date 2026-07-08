import { TEAM_IDS } from "../core/constants.js";
import { createPauseModal } from "../ui/components/PauseModal.js";
import { formatTime } from "../ui/formatTime.js";

function renderTeamPanel(team, remaining, isActive) {
  const cardStateClass = isActive ? "is-active" : "is-switch-target";
  const switchHint = isActive ? "" : "Tap timer card to switch";
  const activeHiddenAttribute = isActive ? "" : "hidden";
  return `
    <article class="team-card ${team.colorClass} ${cardStateClass}" id="team-card-${team.id}">
      <div class="row-between">
        <h3>${team.label}</h3>
        <span class="pill" id="team-active-${team.id}" ${activeHiddenAttribute}>Active</span>
      </div>
      <p class="timer-big ${team.timerClass}" id="team-timer-${team.id}">${formatTime(remaining)}</p>
      <p class="subtle" id="team-alive-${team.id}">Alive Operators: ${team.aliveOperatorsCount}</p>
      <p class="subtle">Per Operator: ${team.perOperatorSeconds}s</p>
      <p class="subtle switch-hint">${switchHint}</p>
    </article>
  `;
}

export function renderGameScreen(viewModel, controller) {
  const attackers = viewModel.teams[TEAM_IDS.ATTACKERS];
  const defenders = viewModel.teams[TEAM_IDS.DEFENDERS];

  const screen = document.createElement("section");
  screen.className = "screen";

  const roundLabel = viewModel.isOvertime ? "Overtime Round" : `Round ${viewModel.roundNumber}`;
  const activeLabel = viewModel.activeTeamId === TEAM_IDS.ATTACKERS ? attackers.label : defenders.label;

  screen.innerHTML = `
    <h2 class="title" id="round-title">${roundLabel}</h2>
    <p class="subtle" id="active-team-label">Active Team: ${activeLabel}</p>

    <div class="team-grid">
      ${renderTeamPanel(
        attackers,
        viewModel.roundTime.remaining[TEAM_IDS.ATTACKERS],
        viewModel.activeTeamId === TEAM_IDS.ATTACKERS
      )}
      ${renderTeamPanel(
        defenders,
        viewModel.roundTime.remaining[TEAM_IDS.DEFENDERS],
        viewModel.activeTeamId === TEAM_IDS.DEFENDERS
      )}
    </div>

    <div class="row">
      <button class="btn btn-danger" id="end-round">End Round</button>
      <button class="btn btn-def" id="pause-menu">Tactical Pause</button>
    </div>

    <p class="notice">Clock reaches 00:00 and stays there. Round never auto-ends.</p>
  `;

  const attackersCard = screen.querySelector(`#team-card-${TEAM_IDS.ATTACKERS}`);
  const defendersCard = screen.querySelector(`#team-card-${TEAM_IDS.DEFENDERS}`);

  attackersCard.addEventListener("click", () => {
    if (attackersCard.classList.contains("is-switch-target")) {
      controller.passTurn();
    }
  });

  defendersCard.addEventListener("click", () => {
    if (defendersCard.classList.contains("is-switch-target")) {
      controller.passTurn();
    }
  });

  screen.querySelector("#end-round").addEventListener("click", () => controller.endRound());
  screen.querySelector("#pause-menu").addEventListener("click", () => controller.openRoundPause());

  if (viewModel.roundPaused) {
    const modal = createPauseModal({
      onConfirm: (adjustment) => controller.confirmRoundPauseAdjustment(adjustment),
      onCancel: () => controller.cancelRoundPause()
    });
    screen.appendChild(modal);
  }

  return screen;
}
