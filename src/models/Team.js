import { OPERATOR_COUNT, TIME_OPTIONS_SECONDS } from "../core/constants.js";
import { Operator } from "./Operator.js";

export class Team {
  constructor({ id, label, colorClass, timerClass, buttonClass }) {
    this.id = id;
    this.label = label;
    this.colorClass = colorClass;
    this.timerClass = timerClass;
    this.buttonClass = buttonClass;
    this.perOperatorSeconds = TIME_OPTIONS_SECONDS[2];
    this.operators = this.createOperators();
  }

  createOperators() {
    return Array.from({ length: OPERATOR_COUNT }, (_, index) => new Operator(index + 1));
  }

  resetOperators() {
    this.operators = this.createOperators();
  }

  setPerOperatorSeconds(seconds) {
    if (!TIME_OPTIONS_SECONDS.includes(seconds)) {
      return;
    }

    this.perOperatorSeconds = seconds;
  }

  getAliveOperatorsCount() {
    return this.operators.filter((operator) => operator.alive).length;
  }

  getRoundTotalSeconds() {
    return this.getAliveOperatorsCount() * this.perOperatorSeconds;
  }

  setOperatorAlive(operatorId, alive) {
    const operator = this.operators.find((item) => item.id === operatorId);
    if (!operator) {
      return;
    }

    if (alive) {
      operator.revive();
      return;
    }

    operator.kill();
  }

  getSerializable() {
    return {
      id: this.id,
      label: this.label,
      colorClass: this.colorClass,
      timerClass: this.timerClass,
      buttonClass: this.buttonClass,
      perOperatorSeconds: this.perOperatorSeconds,
      aliveOperatorsCount: this.getAliveOperatorsCount(),
      operators: this.operators.map((operator) => ({
        id: operator.id,
        label: operator.label,
        alive: operator.alive
      }))
    };
  }
}
