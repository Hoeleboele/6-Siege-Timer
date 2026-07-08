export class ScreenManager {
  constructor(rootElement) {
    this.rootElement = rootElement;
  }

  show(screenElement) {
    this.rootElement.replaceChildren(screenElement);
  }
}
