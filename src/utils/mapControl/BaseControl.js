class BaseControl {
  constructor(map) {
    this.map = map;

    this.active = false;
  }

  init() {}

  enable() {
    this.active = true;
  }

  disable() {
    this.active = false;
  }

  destroy() {
    this.disable();
  }

  isActive() {
    return this.active;
  }
}

export default BaseControl;
