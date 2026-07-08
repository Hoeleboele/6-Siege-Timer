export const TEAM_IDS = {
  ATTACKERS: "attackers",
  DEFENDERS: "defenders"
};

export const TEAM_META = {
  [TEAM_IDS.ATTACKERS]: {
    id: TEAM_IDS.ATTACKERS,
    label: "Blue Attackers",
    colorClass: "defenders",
    timerClass: "timer-def",
    buttonClass: "btn-def"
  },
  [TEAM_IDS.DEFENDERS]: {
    id: TEAM_IDS.DEFENDERS,
    label: "Orange Defenders",
    colorClass: "attackers",
    timerClass: "timer-atk",
    buttonClass: "btn-atk"
  }
};

export const PHASES = {
  MENU: "menu",
  TIME_SELECTION: "time-selection",
  DEPLOYMENT: "deployment",
  ROUND: "round",
  ROUND_END: "round-end",
  GAME_OVER: "game-over"
};

export const OPERATOR_COUNT = 5;
export const TIME_STEP_SECONDS = 30;
export const TIME_OPTIONS_SECONDS = [30, 60, 90, 120];
export const DEPLOYMENT_BASE_SECONDS = 5 * 60;
export const MAX_ROUNDS = 5;

export const PAUSE_ADJUSTMENTS = {
  ADD_OWN: "add-own",
  ADD_ENEMY: "add-enemy",
  SUB_OWN: "sub-own",
  SUB_ENEMY: "sub-enemy"
};
