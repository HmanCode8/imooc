class MapControlManager {
  constructor(map) {
    this.map = map;

    this.controls = new Map();
  }

  /*
   * 注册控件
   */
  register(name, ControlClass) {
    if (this.controls.has(name)) {
      return this.controls.get(name);
    }

    const control = new ControlClass(this.map);

    if (control.init) {
      control.init();
    }

    this.controls.set(name, control);

    return control;
  }

  /*
   * 获取
   */
  get(name) {
    return this.controls.get(name);
  }

  /*
   * 启用
   */
  enable(name, ...args) {
    const control = this.get(name);

    if (control) {
      control.enable(...args);
    }
  }

  /*
   * 禁用
   */
  disable(name) {
    const control = this.get(name);

    if (control) {
      control.disable();
    }
  }

  /*
   * 销毁一个
   */
  unregister(name) {
    const control = this.get(name);

    if (control) {
      control.destroy();

      this.controls.delete(name);
    }
  }

  /*
   * 销毁全部
   */
  destroy() {
    this.controls.forEach((control) => {
      control.destroy();
    });

    this.controls.clear();
  }
}

export default MapControlManager;
