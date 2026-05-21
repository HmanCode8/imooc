import ScaleLine from "ol/control/ScaleLine";

import BaseControl from "./BaseControl";

class ScaleControl extends BaseControl {
  init() {
    this.control = new ScaleLine({
      units: "metric",
    });
  }

  enable() {
    if (this.active) return;

    super.enable();

    this.map.addControl(this.control);
  }

  disable() {
    if (!this.active) return;

    super.disable();

    this.map.removeControl(this.control);
  }

  destroy() {
    this.disable();
  }
}

export default ScaleControl;
