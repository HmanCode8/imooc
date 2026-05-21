import Print from "ol-ext/control/Print";

class PrintManager {
  constructor(map) {
    this.map = map;

    this.printControl = null;

    this.isPrinting = false;

    this.currentTask = null;

    this.init();
  }

  /*
   * 初始化
   */
  init() {
    this.printControl = new Print({
      className: "hidden",
      imageType: "image/png",
      quality: 1,
    });

    this.map.addControl(this.printControl);
  }

  /*
   * 截图
   *
   * return:
   * {
   *   canvas,
   *   image
   * }
   */
  capture(options = {}) {
    // 防重复点击
    if (this.currentTask) {
      return this.currentTask;
    }

    this.currentTask = new Promise((resolve) => {
      const onPrint = (e) => {
        this.printControl.un("print", onPrint);

        this.currentTask = null;

        resolve({
          canvas: e.canvas,

          image: e.image,
        });
      };

      this.printControl.on("print", onPrint);

      console.log("开始截图...");

      this.printControl.print({
        format: options.format || "a4",

        orient: options.orientation || "landscape",

        margin: options.margin || 10,

        quality: options.quality || 1,

        immediate: false,
      });
    });

    return this.currentTask;
  }

  destroy() {
    if (this.printControl) {
      this.map.removeControl(this.printControl);

      this.printControl = null;
    }

    this.currentTask = null;
  }
}

export default PrintManager;
