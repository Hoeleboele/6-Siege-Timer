import {
  DEPLOYMENT_BASE_SECONDS,
  MAX_ROUNDS,
  PHASES,
  TEAM_IDS,
  TEAM_META,
  TIME_OPTIONS_SECONDS,
  TIME_STEP_SECONDS
} from "./constants.js";
import { Team } from "../models/Team.js";

export class GameState {
  constructor() {
    this.teams = {
      [TEAM_IDS.ATTACKERS]: new Team(TEAM_META[TEAM_IDS.ATTACKERS]),
      [TEAM_IDS.DEFENDERS]: new Team(TEAM_META[TEAM_IDS.DEFENDERS])
    };

    this.resetRun();
  }

  resetRun() {
    this.phase = PHASES.MENU;
    this.roundNumber = 1;
    this.isOvertime = false;
    this.activeTeamId = TEAM_IDS.ATTACKERS;
    this.roundTime = {
      start: {
        [TEAM_IDS.ATTACKERS]: 0,
        [TEAM_IDS.DEFENDERS]: 0
      },
      remaining: {
        [TEAM_IDS.ATTACKERS]: 0,
        [TEAM_IDS.DEFENDERS]: 0
      }
    };

    this.deployment = {
      step: TEAM_IDS.DEFENDERS,
      remainingSeconds: 0,
      running: false,
      completed: false
    };

    this.roundRecords = [];
    this.roundPaused = false;
  }

  fullyResetGame() {
    this.teams[TEAM_IDS.ATTACKERS].resetOperators();
    this.teams[TEAM_IDS.DEFENDERS].resetOperators();
    this.teams[TEAM_IDS.ATTACKERS].setPerOperatorSeconds(TIME_OPTIONS_SECONDS[2]);
    this.teams[TEAM_IDS.DEFENDERS].setPerOperatorSeconds(TIME_OPTIONS_SECONDS[2]);
    this.resetRun();
  }

  setPhase(phase) {
    this.phase = phase;
  }

  setPerOperatorTime(teamId, seconds) {
    this.teams[teamId].setPerOperatorSeconds(seconds);
  }

  getDefenderDeploymentSeconds() {
    const defendersPerOperator = this.teams[TEAM_IDS.DEFENDERS].perOperatorSeconds;
    return (defendersPerOperator / TIME_STEP_SECONDS) * DEPLOYMENT_BASE_SECONDS;
  }

  getAttackerDeploymentSeconds() {
    return DEPLOYMENT_BASE_SECONDS;
  }

  initRoundTimes() {
    this.roundTime.start[TEAM_IDS.ATTACKERS] = this.teams[TEAM_IDS.ATTACKERS].getRoundTotalSeconds();
    this.roundTime.start[TEAM_IDS.DEFENDERS] = this.teams[TEAM_IDS.DEFENDERS].getRoundTotalSeconds();
    this.roundTime.remaining[TEAM_IDS.ATTACKERS] = this.roundTime.start[TEAM_IDS.ATTACKERS];
    this.roundTime.remaining[TEAM_IDS.DEFENDERS] = this.roundTime.start[TEAM_IDS.DEFENDERS];
    this.activeTeamId = TEAM_IDS.ATTACKERS;
    this.roundPaused = false;
  }

  setActiveTeam(teamId) {
    this.activeTeamId = teamId;
  }

  setRoundRemaining(teamId, seconds) {
    this.roundTime.remaining[teamId] = Math.max(0, seconds);
  }

  adjustRoundRemaining(teamId, deltaSeconds) {
    const next = this.roundTime.remaining[teamId] + deltaSeconds;
    this.roundTime.remaining[teamId] = Math.max(0, next);
  }

  recordRoundTime() {
    const label = this.isOvertime ? "Overtime" : `Round ${this.roundNumber}`;
    const attackersStart = this.roundTime.start[TEAM_IDS.ATTACKERS];
    const defendersStart = this.roundTime.start[TEAM_IDS.DEFENDERS];
    const attackersUsed = Math.max(0, attackersStart - this.roundTime.remaining[TEAM_IDS.ATTACKERS]);
    const defendersUsed = Math.max(0, defendersStart - this.roundTime.remaining[TEAM_IDS.DEFENDERS]);

    this.roundRecords.push({
      label,
      start: {
        [TEAM_IDS.ATTACKERS]: attackersStart,
        [TEAM_IDS.DEFENDERS]: defendersStart
      },
      used: {
        [TEAM_IDS.ATTACKERS]: attackersUsed,
        [TEAM_IDS.DEFENDERS]: defendersUsed
      }
    });
  }

  advanceRound() {
    this.roundNumber += 1;
  }

  canPlayStandardRound() {
    return !this.isOvertime && this.roundNumber < MAX_ROUNDS;
  }

  canGoToOvertime() {
    return !this.isOvertime;
  }

  startOvertime() {
    this.isOvertime = true;
  }

  applyOperatorStatus(teamId, statusesById) {
    const team = this.teams[teamId];
    team.operators.forEach((operator) => {
      if (!(operator.id in statusesById)) {
        return;
      }
      team.setOperatorAlive(operator.id, statusesById[operator.id]);
    });
  }

  getViewModel() {
    return {
      phase: this.phase,
      roundNumber: this.roundNumber,
      isOvertime: this.isOvertime,
      activeTeamId: this.activeTeamId,
      deployment: { ...this.deployment },
      roundPaused: this.roundPaused,
      roundTime: {
        start: { ...this.roundTime.start },
        remaining: { ...this.roundTime.remaining }
      },
      roundRecords: this.roundRecords.map((record) => ({
        label: record.label,
        start: { ...record.start },
        used: { ...record.used }
      })),
      teams: {
        [TEAM_IDS.ATTACKERS]: this.teams[TEAM_IDS.ATTACKERS].getSerializable(),
        [TEAM_IDS.DEFENDERS]: this.teams[TEAM_IDS.DEFENDERS].getSerializable()
      }
    };
  }
}
