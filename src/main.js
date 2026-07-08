import { GameController } from "./core/GameController.js";
import { PHASES, TEAM_IDS } from "./core/constants.js";
import { renderMenuScreen } from "./screens/MenuScreen.js";
import { renderTimeSelectionScreen } from "./screens/TimeSelectionScreen.js";
import { renderDeploymentScreen } from "./screens/DeploymentScreen.js";
import { renderGameScreen } from "./screens/GameScreen.js";
import { renderRoundEndScreen } from "./screens/RoundEndScreen.js";
import { renderGameOverScreen } from "./screens/GameOverScreen.js";
import { ScreenManager } from "./ui/ScreenManager.js";
import { formatTime } from "./ui/formatTime.js";
import { WakeLockManager } from "./core/WakeLockManager.js";

const root = document.getElementById("app");
const screenManager = new ScreenManager(root);
const controller = new GameController();
const wakeLockManager = new WakeLockManager();
let lastViewModel = null;

function shouldKeepScreenAwake(viewModel) {
  return (
    viewModel.phase === PHASES.DEPLOYMENT
    || viewModel.phase === PHASES.ROUND
    || viewModel.phase === PHASES.ROUND_END
  );
}

function canPatchRound(viewModel) {
  if (!lastViewModel) {
    return false;
  }

  return (
    lastViewModel.phase === PHASES.ROUND
    && viewModel.phase === PHASES.ROUND
    && lastViewModel.roundPaused === viewModel.roundPaused
    && lastViewModel.roundNumber === viewModel.roundNumber
    && lastViewModel.isOvertime === viewModel.isOvertime
  );
}

function patchRoundScreen(viewModel) {
  const attackersTimer = root.querySelector("#team-timer-attackers");
  const defendersTimer = root.querySelector("#team-timer-defenders");
  const attackersActive = root.querySelector("#team-active-attackers");
  const defendersActive = root.querySelector("#team-active-defenders");
  const activeTeamLabel = root.querySelector("#active-team-label");
  const attackersCard = root.querySelector("#team-card-attackers");
  const defendersCard = root.querySelector("#team-card-defenders");
  const switchHints = root.querySelectorAll(".switch-hint");

  if (!attackersTimer || !defendersTimer || !attackersActive || !defendersActive || !activeTeamLabel || !attackersCard || !defendersCard || switchHints.length !== 2) {
    return false;
  }

  const attackersId = TEAM_IDS.ATTACKERS;
  const defendersId = TEAM_IDS.DEFENDERS;
  const attackers = viewModel.teams[attackersId];
  const defenders = viewModel.teams[defendersId];

  attackersTimer.textContent = formatTime(viewModel.roundTime.remaining[attackersId]);
  defendersTimer.textContent = formatTime(viewModel.roundTime.remaining[defendersId]);

  const attackersIsActive = viewModel.activeTeamId === attackersId;
  attackersActive.hidden = !attackersIsActive;
  defendersActive.hidden = attackersIsActive;

  attackersCard.classList.toggle("is-active", attackersIsActive);
  attackersCard.classList.toggle("is-switch-target", !attackersIsActive);
  defendersCard.classList.toggle("is-active", !attackersIsActive);
  defendersCard.classList.toggle("is-switch-target", attackersIsActive);

  const attackersHint = attackersCard.querySelector(".switch-hint");
  const defendersHint = defendersCard.querySelector(".switch-hint");
  attackersHint.textContent = attackersIsActive ? "" : "Tap timer card to switch";
  defendersHint.textContent = attackersIsActive ? "Tap timer card to switch" : "";

  const activeLabel = attackersIsActive ? attackers.label : defenders.label;
  activeTeamLabel.textContent = `Active Team: ${activeLabel}`;
  return true;
}

function canPatchDeployment(viewModel) {
  if (!lastViewModel) {
    return false;
  }

  return (
    lastViewModel.phase === PHASES.DEPLOYMENT
    && viewModel.phase === PHASES.DEPLOYMENT
    && lastViewModel.deployment.step === viewModel.deployment.step
    && lastViewModel.deployment.running === viewModel.deployment.running
    && lastViewModel.deployment.completed === viewModel.deployment.completed
  );
}

function patchDeploymentScreen(viewModel) {
  const timer = root.querySelector("#deployment-timer");
  const timeLabel = root.querySelector("#deployment-time-label");

  if (!timer || !timeLabel) {
    return false;
  }

  const formatted = formatTime(viewModel.deployment.remainingSeconds);
  timer.textContent = formatted;
  timeLabel.textContent = `Time Left: ${formatted}`;
  return true;
}

function render(viewModel) {
  wakeLockManager.setEnabled(shouldKeepScreenAwake(viewModel));

  if (canPatchRound(viewModel) && patchRoundScreen(viewModel)) {
    lastViewModel = viewModel;
    return;
  }

  if (canPatchDeployment(viewModel) && patchDeploymentScreen(viewModel)) {
    lastViewModel = viewModel;
    return;
  }

  if (viewModel.phase === PHASES.MENU) {
    screenManager.show(renderMenuScreen(viewModel, controller));
    lastViewModel = viewModel;
    return;
  }

  if (viewModel.phase === PHASES.TIME_SELECTION) {
    screenManager.show(renderTimeSelectionScreen(viewModel, controller));
    lastViewModel = viewModel;
    return;
  }

  if (viewModel.phase === PHASES.DEPLOYMENT) {
    screenManager.show(renderDeploymentScreen(viewModel, controller));
    lastViewModel = viewModel;
    return;
  }

  if (viewModel.phase === PHASES.ROUND) {
    screenManager.show(renderGameScreen(viewModel, controller));
    lastViewModel = viewModel;
    return;
  }

  if (viewModel.phase === PHASES.ROUND_END) {
    screenManager.show(renderRoundEndScreen(viewModel, controller));
    lastViewModel = viewModel;
    return;
  }

  if (viewModel.phase === PHASES.GAME_OVER) {
    screenManager.show(renderGameOverScreen(viewModel, controller));
    lastViewModel = viewModel;
  }
}

controller.subscribe(render);
controller.goToMenu();
