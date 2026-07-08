import { GameState } from "./GameState.js";
import { PAUSE_ADJUSTMENTS, PHASES, TEAM_IDS, TIME_STEP_SECONDS } from "./constants.js";
import { Timer } from "./Timer.js";

function enemyTeamId(teamId) {
  return teamId === TEAM_IDS.ATTACKERS ? TEAM_IDS.DEFENDERS : TEAM_IDS.ATTACKERS;
}

export class GameController {
  constructor() {
    this.state = new GameState();
    this.listeners = new Set();

    this.deploymentTimer = new Timer({
      onTick: (remaining) => {
        this.state.deployment.remainingSeconds = remaining;
        this.emit();
      },
      onZero: () => {
        this.state.deployment.running = false;
        this.emit();
      }
    });

    this.roundTimer = new Timer({
      onTick: (remaining) => {
        this.state.setRoundRemaining(this.state.activeTeamId, remaining);
        this.emit();
      },
      onZero: () => {
        this.emit();
      }
    });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.state.getViewModel());
    return () => this.listeners.delete(listener);
  }

  emit() {
    const viewModel = this.state.getViewModel();
    this.listeners.forEach((listener) => listener(viewModel));
  }

  goToMenu() {
    this.stopAllTimers();
    this.state.fullyResetGame();
    this.state.setPhase(PHASES.MENU);
    this.emit();
  }

  goToTimeSelection() {
    this.stopAllTimers();
    this.state.fullyResetGame();
    this.state.setPhase(PHASES.TIME_SELECTION);
    this.emit();
  }

  setPerOperatorTime(teamId, seconds) {
    this.state.setPerOperatorTime(teamId, Number(seconds));
    this.emit();
  }

  startDeploymentPhase() {
    this.stopAllTimers();
    this.state.setPhase(PHASES.DEPLOYMENT);
    this.state.deployment.step = TEAM_IDS.DEFENDERS;
    this.state.deployment.initialSeconds = this.state.getDefenderDeploymentSeconds();
    this.state.deployment.remainingSeconds = this.state.deployment.initialSeconds;
    this.state.deployment.running = false;
    this.state.deployment.completed = false;
    this.emit();
  }

  startDeploymentTimer() {
    if (this.state.phase !== PHASES.DEPLOYMENT || this.state.deployment.completed) {
      return;
    }

    this.deploymentTimer.setRemaining(this.state.deployment.remainingSeconds);
    this.state.deployment.running = true;
    this.deploymentTimer.start();
    this.emit();
  }

  pauseDeploymentTimer() {
    if (this.state.phase !== PHASES.DEPLOYMENT) {
      return;
    }

    this.deploymentTimer.pause();
    this.state.deployment.running = false;
    this.emit();
  }

  resumeDeploymentTimer() {
    this.startDeploymentTimer();
  }

  completeDeploymentStep() {
    if (this.state.phase !== PHASES.DEPLOYMENT) {
      return;
    }

    if (this.state.deployment.step === TEAM_IDS.DEFENDERS) {
      this.deploymentTimer.pause();
      this.state.deployment.step = TEAM_IDS.ATTACKERS;
      this.state.deployment.initialSeconds = this.state.getAttackerDeploymentSeconds();
      this.state.deployment.remainingSeconds = this.state.deployment.initialSeconds;
      this.state.deployment.running = false;
      this.emit();
      return;
    }

    this.deploymentTimer.pause();
    this.state.deployment.completed = true;
    this.state.deployment.running = false;
    this.emit();
  }

  startMatchFromDeployment() {
    if (!this.state.deployment.completed) {
      return;
    }

    this.startRound();
  }

  startRound() {
    this.stopAllTimers();
    this.state.setPhase(PHASES.ROUND);
    this.state.initRoundTimes();
    const activeRemaining = this.state.roundTime.remaining[this.state.activeTeamId];
    this.roundTimer.setDuration(activeRemaining);
    if (activeRemaining > 0) {
      this.roundTimer.start();
    }
    this.emit();
  }

  startRoundTimer() {
    if (this.state.phase !== PHASES.ROUND || this.state.roundPaused) {
      return;
    }

    this.roundTimer.setRemaining(this.state.roundTime.remaining[this.state.activeTeamId]);
    this.roundTimer.start();
    this.emit();
  }

  pauseRoundTimer() {
    if (this.state.phase !== PHASES.ROUND) {
      return;
    }

    this.roundTimer.pause();
    this.emit();
  }

  passTurn() {
    if (this.state.phase !== PHASES.ROUND || this.state.roundPaused) {
      return;
    }

    this.roundTimer.pause();
    const nextTeamId = enemyTeamId(this.state.activeTeamId);
    this.state.setActiveTeam(nextTeamId);
    this.roundTimer.setDuration(this.state.roundTime.remaining[nextTeamId]);

    if (this.state.roundTime.remaining[nextTeamId] > 0) {
      this.roundTimer.start();
    }

    this.emit();
  }

  openRoundPause() {
    if (this.state.phase !== PHASES.ROUND) {
      return;
    }

    this.roundTimer.pause();
    this.state.roundPaused = true;
    this.emit();
  }

  cancelRoundPause() {
    if (this.state.phase !== PHASES.ROUND) {
      return;
    }

    this.state.roundPaused = false;
    this.startRoundTimer();
  }

  confirmRoundPauseAdjustment(adjustmentType) {
    if (this.state.phase !== PHASES.ROUND || !this.state.roundPaused) {
      return;
    }

    const active = this.state.activeTeamId;
    const enemy = enemyTeamId(active);

    if (adjustmentType === PAUSE_ADJUSTMENTS.ADD_OWN) {
      this.state.adjustRoundRemaining(active, TIME_STEP_SECONDS);
    }
    if (adjustmentType === PAUSE_ADJUSTMENTS.ADD_ENEMY) {
      this.state.adjustRoundRemaining(enemy, TIME_STEP_SECONDS);
    }
    if (adjustmentType === PAUSE_ADJUSTMENTS.SUB_OWN) {
      this.state.adjustRoundRemaining(active, -TIME_STEP_SECONDS);
    }
    if (adjustmentType === PAUSE_ADJUSTMENTS.SUB_ENEMY) {
      this.state.adjustRoundRemaining(enemy, -TIME_STEP_SECONDS);
    }

    this.state.roundPaused = false;
    this.roundTimer.setDuration(this.state.roundTime.remaining[this.state.activeTeamId]);
    this.roundTimer.start();
    this.emit();
  }

  endRound() {
    if (this.state.phase !== PHASES.ROUND) {
      return;
    }

    this.roundTimer.pause();
    this.state.recordRoundTime();
    this.state.setPhase(PHASES.ROUND_END);
    this.emit();
  }

  applyRoundEndOperators(statuses) {
    if (this.state.phase !== PHASES.ROUND_END) {
      return;
    }

    this.state.applyOperatorStatus(TEAM_IDS.ATTACKERS, statuses[TEAM_IDS.ATTACKERS]);
    this.state.applyOperatorStatus(TEAM_IDS.DEFENDERS, statuses[TEAM_IDS.DEFENDERS]);
    this.emit();
  }

  toggleRoundEndOperator(teamId, operatorId) {
    if (this.state.phase !== PHASES.ROUND_END) {
      return;
    }

    const team = this.state.teams[teamId];
    if (!team) {
      return;
    }

    const operator = team.operators.find((item) => item.id === operatorId);
    if (!operator) {
      return;
    }

    team.setOperatorAlive(operatorId, !operator.alive);
    this.emit();
  }

  startNextStandardRound() {
    if (this.state.phase !== PHASES.ROUND_END || !this.state.canPlayStandardRound()) {
      return;
    }

    this.state.advanceRound();
    this.startRound();
  }

  startOvertimeRound() {
    if (this.state.phase !== PHASES.ROUND_END || !this.state.canGoToOvertime()) {
      return;
    }

    this.state.startOvertime();
    this.startRound();
  }

  endGame() {
    this.stopAllTimers();
    this.state.setPhase(PHASES.GAME_OVER);
    this.emit();
  }

  stopAllTimers() {
    this.deploymentTimer.pause();
    this.roundTimer.pause();
    this.state.deployment.running = false;
  }
}
