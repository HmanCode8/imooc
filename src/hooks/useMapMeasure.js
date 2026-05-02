import { ref } from "vue";
import Draw from "ol/interaction/Draw";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { unByKey } from "ol/Observable";
import Overlay from "ol/Overlay";
import { getArea, getLength } from "ol/sphere";
import { LineString, Polygon } from "ol/geom";
import { Style, Fill, Stroke, Circle as CircleStyle } from "ol/style";
import { mapInstanceManager } from "./useMapInstance";

// 创建斜纹填充图案
const createHatchFill = () => {
  const canvas = document.createElement("canvas");
  const size = 10;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.strokeStyle = "rgba(255, 204, 51, 0.4)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, size);
  ctx.lineTo(size, 0);
  ctx.stroke();

  return ctx.createPattern(canvas, "repeat");
};

const hatchFill = createHatchFill();

// 将状态放在 Hook 外部，确保单例行为，防止重复添加图层和 Overlays
let measureSource = new VectorSource();
let measureLayer = new VectorLayer({
  source: measureSource,
  style: new Style({
    fill: new Fill({
      color: hatchFill,
    }),
    stroke: new Stroke({
      color: "#ffcc33",
      width: 3,
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: "#ffcc33",
      }),
    }),
  }),
  zIndex: 9999,
});

let draw = null;
let sketch = null;
let helpTooltipElement = null;
let helpTooltip = null;
let measureTooltipElement = null;
let measureTooltip = null;
let pointerMoveListener = null;

export function useMapMeasure() {
  const activeType = ref(null);

  const pointerMoveHandler = function (evt) {
    if (evt.dragging) return;

    let helpMsg = "点击开始绘制";
    if (sketch) {
      const geom = sketch.getGeometry();
      if (geom instanceof Polygon) {
        helpMsg = "继续点击绘制多边形";
      } else if (geom instanceof LineString) {
        helpMsg = "继续点击绘制线段";
      }
    }

    if (!helpTooltipElement) return;
    helpTooltipElement.innerHTML = helpMsg;
    helpTooltip.setPosition(evt.coordinate);
    helpTooltipElement.classList.remove("hidden");
  };

  const createHelpTooltip = (map) => {
    if (helpTooltip) map.removeOverlay(helpTooltip);
    helpTooltipElement = document.createElement("div");
    helpTooltipElement.className =
      "ol-tooltip hidden bg-black/70 text-white px-2 py-1 rounded text-xs pointer-events-none";
    helpTooltip = new Overlay({
      element: helpTooltipElement,
      offset: [15, 0],
      positioning: "center-left",
    });
    map.addOverlay(helpTooltip);
  };

  const createMeasureTooltip = (map) => {
    measureTooltipElement = document.createElement("div");
    measureTooltipElement.className =
      "ol-tooltip ol-tooltip-measure bg-white border border-amber-500 px-2 py-1 rounded text-xs font-bold text-amber-600 shadow-md";
    measureTooltip = new Overlay({
      element: measureTooltipElement,
      offset: [0, -15],
      positioning: "bottom-center",
      stopEvent: false,
    });
    map.addOverlay(measureTooltip);
  };

  const formatLength = (line, projection) => {
    const length = getLength(line, { projection });
    return length > 1000
      ? (length / 1000).toFixed(2) + " km"
      : length.toFixed(2) + " m";
  };

  const formatArea = (polygon, projection) => {
    const area = getArea(polygon, { projection });
    return area > 1000000
      ? (area / 1000000).toFixed(2) + " km²"
      : area.toFixed(2) + " m²";
  };

  const startMeasure = async (type) => {
    console.log("Starting measure:", type);
    const map = await mapInstanceManager.waitForMapReady();
    if (!map) return;

    // 1. 清理环境
    stopMeasure();

    // 2. 准备图层
    const layers = map.getLayers().getArray();
    if (!layers.includes(measureLayer)) {
      map.addLayer(measureLayer);
    }

    // 3. 准备提示框
    createHelpTooltip(map);
    createMeasureTooltip(map);

    // 4. 监听鼠标移动
    pointerMoveListener = map.on("pointermove", pointerMoveHandler);

    // 5. 创建绘制交互
    draw = new Draw({
      source: measureSource,
      type: type,
      style: new Style({
        fill: new Fill({ color: hatchFill }),
        stroke: new Stroke({
          color: "rgba(255, 204, 51, 0.8)",
          lineDash: [10, 10],
          width: 3,
        }),
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({ color: "rgba(255, 204, 51, 0.7)" }),
          fill: new Fill({ color: "rgba(255, 255, 255, 0.2)" }),
        }),
      }),
    });

    map.addInteraction(draw);

    let listener;
    draw.on("drawstart", (evt) => {
      console.log("Draw start");
      sketch = evt.feature;
      let tooltipCoord = evt.coordinate;

      listener = sketch.getGeometry().on("change", (evt) => {
        const geom = evt.target;
        const projection = map.getView().getProjection();
        let output;
        if (geom instanceof Polygon) {
          output = formatArea(geom, projection);
          tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof LineString) {
          output = formatLength(geom, projection);
          tooltipCoord = geom.getLastCoordinate();
        }
        if (measureTooltipElement) {
          measureTooltipElement.innerHTML = output;
          measureTooltip.setPosition(tooltipCoord);
        }
      });
    });

    draw.on("drawend", () => {
      console.log("Draw end");
      measureTooltipElement.className =
        "ol-tooltip ol-tooltip-static bg-amber-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg";
      measureTooltip.setOffset([0, -7]);
      sketch = null;
      measureTooltipElement = null;
      createMeasureTooltip(map);
      unByKey(listener);
    });
  };

  const stopMeasure = () => {
    const map = mapInstanceManager.getMapInstance();
    if (!map) return;

    if (draw) {
      map.removeInteraction(draw);
      draw = null;
    }

    if (pointerMoveListener) {
      unByKey(pointerMoveListener);
      pointerMoveListener = null;
    }

    if (helpTooltip) {
      map.removeOverlay(helpTooltip);
      helpTooltip = null;
    }

    sketch = null;
  };

  const clearMeasure = () => {
    stopMeasure();
    measureSource.clear();
    const map = mapInstanceManager.getMapInstance();
    if (map) {
      const overlays = map.getOverlays().getArray().slice();
      overlays.forEach((overlay) => {
        const el = overlay.getElement();
        if (
          el &&
          (el.classList.contains("ol-tooltip-static") ||
            el.classList.contains("ol-tooltip-measure"))
        ) {
          map.removeOverlay(overlay);
        }
      });
    }
  };

  return {
    startMeasure,
    stopMeasure,
    clearMeasure,
  };
}
