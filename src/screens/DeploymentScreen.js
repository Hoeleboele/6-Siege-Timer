import { TEAM_IDS } from "../core/constants.js";
import { formatTime } from "../ui/formatTime.js";

function getStepTitle(viewModel) {
  if (viewModel.deployment.completed) {
    return "Deployment Complete";
  }
  return viewModel.deployment.step === TEAM_IDS.DEFENDERS
    ? "Defender Deployment"
    : "Attacker Deployment";
}

function getStepTeamLabel(viewModel) {
  if (viewModel.deployment.completed) {
    return "Ready";
  }

  const team = viewModel.teams[viewModel.deployment.step];
  return team.label;
}

export function renderDeploymentScreen(viewModel, controller) {
  const deployment = viewModel.deployment;
  const currentTeam = viewModel.teams[deployment.step];
  const screen = document.createElement("section");
  screen.className = "screen";

  screen.innerHTML = `
    <h2 class="title" id="deployment-title">${getStepTitle(viewModel)}</h2>
    <p class="subtle">Defenders deploy first with scaled time. Attackers deploy second with fixed 05:00.</p>

    ${deployment.completed
      ? ""
      : `
    <article class="team-card ${currentTeam.colorClass}" id="deployment-card">
      <div class="row-between">
        <span class="pill" id="deployment-current">Current: ${getStepTeamLabel(viewModel)}</span>
        <span class="pill" id="deployment-time-label">Time Left: ${formatTime(deployment.remainingSeconds)}</span>
      </div>
      <p class="timer-big ${currentTeam.timerClass}" id="deployment-timer">${formatTime(deployment.remainingSeconds)}</p>
    </article>`}

    <div class="row" id="controls"></div>
  `;

  const controls = screen.querySelector("#controls");

  if (deployment.completed) {
    const startRoundButton = document.createElement("button");
    startRoundButton.className = "btn btn-atk";
    startRoundButton.textContent = "Start Round 1";
    startRoundButton.addEventListener("click", () => controller.startMatchFromDeployment());
    controls.appendChild(startRoundButton);

    const menuButton = document.createElement("button");
    menuButton.className = "btn btn-neutral";
    menuButton.textContent = "Main Menu";
    menuButton.addEventListener("click", () => controller.goToMenu());
    controls.appendChild(menuButton);

    return screen;
  }

  const timerButton = document.createElement("button");
  timerButton.className = `btn ${deployment.step === TEAM_IDS.DEFENDERS ? "btn-def" : "btn-atk"}`;

  const hasProgress = deployment.remainingSeconds < deployment.initialSeconds;
  if (deployment.running) {
    timerButton.textContent = "Pause";
    timerButton.addEventListener("click", () => controller.pauseDeploymentTimer());
  } else if (hasProgress) {
    timerButton.textContent = "Resume";
    timerButton.addEventListener("click", () => controller.resumeDeploymentTimer());
  } else {
    timerButton.textContent = "Start Timer";
    timerButton.addEventListener("click", () => controller.startDeploymentTimer());
  }
  controls.appendChild(timerButton);

  const nextStepButton = document.createElement("button");
  nextStepButton.className = "btn btn-neutral";
  nextStepButton.textContent = deployment.step === TEAM_IDS.DEFENDERS
    ? "Next: Attacker Deployment"
    : "Complete Deployment";
  nextStepButton.addEventListener("click", () => controller.completeDeploymentStep());
  controls.appendChild(nextStepButton);

  const menuButton = document.createElement("button");
  menuButton.className = "btn btn-danger";
  menuButton.textContent = "Abort To Menu";
  menuButton.addEventListener("click", () => controller.goToMenu());
  controls.appendChild(menuButton);

  return screen;
}
