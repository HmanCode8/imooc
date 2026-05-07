import { ref } from "vue";
import Draw from "ol/interaction/Draw";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import { Style, Fill, Stroke, Circle as CircleStyle } from "ol/style";
import { MultiPoint, LineString, Polygon, Point } from "ol/geom";
import Feature from "ol/Feature";
import { mapInstanceManager } from "./useMapInstance";

let drawSource = new VectorSource();
let drawLayer = null;
let drawInteraction = null;
let currentLayerId = null;
let resolveActive = null;
let rejectActive = null;

const segmentColors = [
  "#5dca8e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];

const createLineStyle = (color = "#5dca8e") => {
  return (feature) => {
    const geom = feature.getGeometry();
    if (!geom) return null;
    if (geom.getType() === "LineString") {
      const coords = geom.getCoordinates();
      return [
        new Style({
          stroke: new Stroke({ color, width: 5 }),
        }),
        new Style({
          image: new CircleStyle({
            radius: 5,
            fill: new Fill({ color }),
            stroke: new Stroke({ color: "#fff", width: 2 }),
          }),
          geometry: new MultiPoint(coords),
        }),
      ];
    }
    if (geom.getType() === "Polygon") {
      return new Style({
        fill: new Fill({ color: `${color}25` }),
        stroke: new Stroke({ color, width: 3 }),
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color }),
          stroke: new Stroke({ color: "#fff", width: 2 }),
        }),
      });
    }
    return new Style({
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({ color }),
        stroke: new Stroke({ color: "#fff", width: 2 }),
      }),
    });
  };
};

const defaultLineStyle = createLineStyle();

export function useMapDraw() {
  const drawing = ref(false);
  const lastGeometry = ref(null);

  const ensureLayer = async (layerId, style) => {
    const map = await mapInstanceManager.waitForMapReady();
    if (!map) return null;

    if (!drawLayer || currentLayerId !== layerId) {
      if (drawLayer) {
        map.removeLayer(drawLayer);
      }
      drawSource = new VectorSource();
      drawLayer = new VectorLayer({
        source: drawSource,
        style: style || defaultLineStyle,
        zIndex: 9998,
      });
      drawLayer.set("id", layerId);
      currentLayerId = layerId;
      map.addLayer(drawLayer);
    } else {
      drawLayer.setStyle(style || defaultLineStyle);
    }

    return map;
  };

  const stopDraw = (options = {}) => {
    const { removeLayer = false, silent = false } = options;
    const map = mapInstanceManager.getMapInstance();
    if (map && drawInteraction) {
      map.removeInteraction(drawInteraction);
    }
    drawInteraction = null;
    drawing.value = false;

    if (removeLayer && map && drawLayer) {
      map.removeLayer(drawLayer);
      drawLayer = null;
      currentLayerId = null;
      drawSource = new VectorSource();
    }

    if (!silent && rejectActive) rejectActive(new Error("draw_cancelled"));
    resolveActive = null;
    rejectActive = null;
  };

  const clearDraw = () => {
    drawSource?.clear?.();
    lastGeometry.value = null;
  };

  const startDraw = async (type, options = {}) => {
    const {
      layerId = "map-draw",
      clearBefore = true,
      style,
      fitView = true,
      fitPadding = [50, 450, 50, 50],
    } = options;

    const map = await ensureLayer(layerId, style);
    if (!map) return Promise.reject(new Error("map_not_ready"));

    stopDraw();
    if (clearBefore) clearDraw();

    drawing.value = true;
    drawInteraction = new Draw({
      source: drawSource,
      type,
    });

    map.addInteraction(drawInteraction);

    return new Promise((resolve, reject) => {
      resolveActive = resolve;
      rejectActive = reject;

      drawInteraction.on("drawend", (evt) => {
        const geom = evt.feature?.getGeometry?.();
        const geometryType = geom?.getType?.();
        const coordinates = geom?.getCoordinates?.() || null;
        const extent = geom?.getExtent?.() || null;
        const result = {
          type: geometryType,
          coordinates,
          extent,
        };
        lastGeometry.value = result;
        drawing.value = false;
        stopDraw({ silent: true });

        if (fitView && extent && extent[0] !== Infinity) {
          map.getView().fit(extent, { padding: fitPadding, duration: 300 });
        }

        resolve(result);
      });
    });
  };

  const addFeatures = async (features, layerId = "map-draw", style) => {
    const map = await ensureLayer(layerId, style);
    if (!map) return;
    features.forEach((feature) => {
      drawSource.addFeature(feature);
    });
  };

  const addLineString = async (coordinates, color, layerId = "map-draw") => {
    if (!coordinates || coordinates.length < 2) return;
    const lineString = new LineString(coordinates);
    const feature = new Feature({
      geometry: lineString,
    });
    feature.setStyle(createLineStyle(color));
    await addFeatures([feature], layerId);
  };

  const addPolygon = async (coordinates, color, layerId = "map-draw") => {
    if (!coordinates || coordinates.length < 3) return;
    const polygon = new Polygon([coordinates]);
    const feature = new Feature({
      geometry: polygon,
    });
    feature.setStyle(createLineStyle(color));
    await addFeatures([feature], layerId);
  };

  const addPoint = async (coordinates, color, layerId = "map-draw") => {
    if (!coordinates || coordinates.length !== 2) return;
    const point = new Point(coordinates);
    const feature = new Feature({
      geometry: point,
    });
    feature.setStyle(createLineStyle(color));
    await addFeatures([feature], layerId);
  };

  const getSegmentColor = (index) => {
    return segmentColors[index % segmentColors.length];
  };

  return {
    drawing,
    lastGeometry,
    startDraw,
    stopDraw,
    clearDraw,
    addFeatures,
    addLineString,
    addPolygon,
    addPoint,
    getSegmentColor,
    drawSource,
    drawLayer,
  };
}
