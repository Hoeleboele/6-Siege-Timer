export class Operator {
  constructor(id) {
    this.id = id;
    this.label = `Operator ${id}`;
    this.alive = true;
  }

  kill() {
    this.alive = false;
  }

  revive() {
    this.alive = true;
  }
}
