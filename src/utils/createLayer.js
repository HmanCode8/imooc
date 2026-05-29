import Feature from "ol/Feature";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Cluster from "ol/source/Cluster";
import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";
import Text from "ol/style/Text";
import Fill from "ol/style/Fill";
import Icon from "ol/style/Icon";
import Stroke from "ol/style/Stroke";
import { Point, LineString, Polygon } from "ol/geom";
import parking from "@/assets/parking.png"; 
import onlinecar from "@/assets/onlinecar.png";
import testcar from "@/assets/testcar.png";
import offlinecar from "@/assets/offlinecar.png";
import AnimatedCluster from 'ol-ext/layer/AnimatedCluster'
function getRandomColor() {
  const colors = [
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ff9900",
    "#00ffff",
    "#ff00ff",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 根据 carData 生成车辆点位
function createFeaturesFromCarData(carData) {
  const features = [];
  carData.forEach((car) => {
    console.log(car.color, "color");
    // 优先使用实际轨迹的起点，如果没有则使用随机点
    const coords =
      car.actualRoute && car.actualRoute.length > 0
        ? car.actualRoute[0]
        : [
            113.1315 + (Math.random() - 0.5) * 0.1,
            23.0268 + (Math.random() - 0.5) * 0.1,
          ];

    const feature = new Feature({
      geometry: new Point(coords),
      rotateHi: Math.random() * Math.PI * 2,
      color: car.color || getRandomColor(),
      type: "car",
      carId: car.id,
      ...car, // 将车辆所有属性挂载到 feature 上
    });
    features.push(feature);
  });
  return features;
}

// 获取车辆图标
function getCarIcon(type, status) {
  if (status === "offline") return offlinecar;
  if (type === "测试") return testcar;
  return onlinecar;
}

// 创建车辆图层 + 聚合
async function createPlantLayer(data) {
  // 1. 使用真实数据源
  const source = new VectorSource({
    features: createFeaturesFromCarData(data),
  });

  // 2. 🔥 核心：开启聚合（距离越小，聚合越严格）
  const clusterSource = new Cluster({
    source: source,
    distance: 50, // 多少像素内的点会被聚合
    minDistance: 10, // 最小距离
  });

  // 3. 聚合样式（数字圆圈）
  const styleCache = {};
  const clusterLayer = new AnimatedCluster({
    source: clusterSource,
    style: (feature) => {
      const size = feature.get("features").length;
      // 单个点 → 显示小车
      if (size === 1) {
        const realFeature = feature.get("features")[0];

        return new Style({
          image: new Icon({
            src: getCarIcon(realFeature.get("type"), realFeature.get("status")),
            scale: 0.2, // ⚠️ 不用 width/height
            anchor: [0.5, 0.5],
            rotateWithView: true,
            rotation: realFeature.get("rotateHi") || 0,
            // color: realFeature.get("color"), // 使用真实图片图标，通常不着色
          }),
        });
      }
      // 多个点 → 显示聚合数字
      if (!styleCache[size]) {
        styleCache[size] = new Style({
          image: new CircleStyle({
            radius: 22,
            fill: new Fill({ color: "rgba(255, 102, 0, 0.7)" }),
            stroke: new Stroke({ color: "#fff", width: 3 }),
          }),
          text: new Text({
            text: String(size),
            fill: new Fill({ color: "#fff" }),
            font: "bold 14px Arial",
          }),
        });
      }
      return styleCache[size];
    },
  });
clusterLayer.setZIndex(1);
  return clusterLayer;
}

// 创建多车辆实时监控图层（含规划轨迹、实际轨迹与平滑移动）
async function createMultiVehicleMonitorLayer(data, options = {}) {
  const source = new VectorSource();
  const vehicles = [];

  data.forEach((carItem) => {
    const plannedCoords = carItem.plannedRoute;
    const actualCoords = carItem.actualRoute;
    const color = getRandomColor();

    // 1. 规划轨迹 (Planned Route) - 绿色实线
    const plannedLine = new LineString(plannedCoords);
    const plannedFeature = new Feature({
      geometry: plannedLine,
      type: "planned-track",
    });
    plannedFeature.setStyle(
      new Style({
        stroke: new Stroke({
          color: "#5dca8e",
          width: 4,
        }),
      }),
    );

    // 2. 实际轨迹 (Actual Route) - 紫色虚线
    const actualLine = new LineString(actualCoords);
    const actualFeature = new Feature({
      geometry: actualLine,
      type: "actual-track",
    });
    actualFeature.setStyle([
      new Style({
        stroke: new Stroke({
          color: "#ad58f6",
          width: 4,
          lineDash: [10, 10], // 虚线效果
        }),
      }),
    ]);

    // 2.1 停车点 (Stop Points)
    if (carItem.stopPoints && carItem.stopPoints.length > 0) {
      carItem.stopPoints.forEach((stop) => {
        const stopFeature = new Feature({
          geometry: new Point(stop.coords),
          type: "stop-point",
          stopType: stop.type,
          duration: stop.duration,
          carId: carItem.id,
        });
        source.addFeature(stopFeature);
      });
    }

    // 2.2 起终点 (Start/End Markers)
    if (actualCoords.length >= 2) {
      const startMarker = new Feature({
        geometry: new Point(actualCoords[0]),
        type: "terminal-point",
        label: "起",
        carId: carItem.id,
      });
      const endMarker = new Feature({
        geometry: new Point(actualCoords[actualCoords.length - 1]),
        type: "terminal-point",
        label: "终",
        carId: carItem.id,
      });
      console.log("Adding terminal markers for", carItem.id);
      source.addFeature(startMarker);
      source.addFeature(endMarker);
    }

    // // 根据开关设置轨迹可见性
    // if (!options.showTracks) {
    //   plannedFeature.getStyle().getStroke().setColor('rgba(0,0,0,0)');
    //   actualFeature.getStyle().forEach(s => s.getStroke().setColor('rgba(0,0,0,0)'));
    // }

    // 3. 车辆要素
    const carFeature = new Feature({
      geometry: new Point(actualCoords[0]),
      type: "car",
      rotateHi: 0,
      color: color,
      plateNo: carItem.plateNo,
      carId: carItem.id, // 绑定车辆 ID
      vehicleType: carItem.type, // 传递车辆类型
      vehicleStatus: carItem.status, // 传递车辆状态
      speed: carItem.terminalInfo?.speed || 0, // 绑定实时速度
    });

    // 为轨迹要素也绑定 ID
    plannedFeature.set("carId", carItem.id);
    actualFeature.set("carId", carItem.id);
    plannedFeature.set("type", "planned-track");
    actualFeature.set("type", "actual-track");

    source.addFeature(plannedFeature);
    source.addFeature(actualFeature);
    source.addFeature(carFeature);

    vehicles.push({
      id: carItem.id,
      carFeature,
      plannedFeature,
      actualFeature,
      color,
      line: actualLine,
      progress: 0, // 初始进度为 0
      speed: 0, // 停止自动移动
      isManual: true, // 默认进入手动控制模式，由播放条驱动
    });
  });

  // 记录激活的车辆 ID，默认为传入的所有车辆
  let activeVehicleIds = data.map((item) => item.id);

  const layer = new VectorLayer({
    source,
    style: (feature) => {
      const type = feature.get("type");
      const carId = feature.get("carId");

      // 如果有选中车辆，则只显示选中的车辆及其轨迹
      if (activeVehicleIds.length > 0) {
        if (!activeVehicleIds.includes(carId)) return new Style({}); // 隐藏未选中的
      } else {
        // 如果没选中任何车辆，默认只显示所有车辆点，不显示轨迹
        if (type !== "car") return new Style({});
      }

      if (type === "car") {
        const speed = feature.get("speed");
        const styles = [
          new Style({
            image: new Icon({
              src: getCarIcon(
                feature.get("vehicleType"),
                feature.get("vehicleStatus"),
              ),
              scale: 0.2,
              anchor: [0.5, 0.5],
              rotateWithView: true,
              rotation: feature.get("rotateHi") || 0,
            }),
            text: new Text({
              text: feature.get("plateNo"),
              offsetY: -30,
              fill: new Fill({ color: "#fff" }),
              stroke: new Stroke({ color: "rgba(0,0,0,0.8)", width: 2 }),
              font: "bold 12px sans-serif",
            }),
          }),
        ];

        // 如果有速度，增加速度气泡样式
        if (speed !== undefined) {
          styles.push(
            new Style({
              text: new Text({
                text: `${speed} 公里/小时`,
                offsetX: 60,
                offsetY: 0,
                font: "12px sans-serif",
                fill: new Fill({ color: "#333" }),
                backgroundFill: new Fill({ color: "rgba(255, 255, 255, 0.9)" }),
                backgroundStroke: new Stroke({ color: "#409eff", width: 1 }),
                padding: [4, 8, 4, 8],
              }),
            }),
          );
        }

        return styles;
      }

      if (type === "stop-point") {
        console.log(
          "Rendering stop point at",
          feature.getGeometry().getCoordinates(),
        );
        return new Style({
          image: new CircleStyle({
            radius: 14, // 增大半径
            fill: new Fill({ color: "#ef4444" }), // 使用更亮一点的红色 (red-500)
            stroke: new Stroke({ color: "#fff", width: 3 }), // 增加白边宽度
          }),
          text: new Text({
            text: "停",
            fill: new Fill({ color: "#fff" }),
            font: "bold 12px sans-serif", // 增大字号
          }),
          zIndex: 200, // 确保在最上层
        });
      }

      if (type === "terminal-point") {
        return new Style({
          image: new CircleStyle({
            radius: 12,
            fill: new Fill({ color: "#3b82f6" }), // blue-500
            stroke: new Stroke({ color: "#fff", width: 2 }),
          }),
          text: new Text({
            text: feature.get("label"),
            fill: new Fill({ color: "#fff" }),
            font: "bold 11px sans-serif",
          }),
          zIndex: 110,
        });
      }

      // 返回轨迹默认样式（已经在 feature.setStyle 中设置了）
      return null;
    },
  });

  // 暴露一个方法用于更新激活的车辆 ID
  layer.setActiveVehicles = (ids) => {
    activeVehicleIds = ids;
    layer.changed(); // 强制重绘
  };

  // 暴露一个方法用于更新进度 (0-1)
  layer.setProgress = (p) => {
    vehicles.forEach((v) => {
      const isActive =
        activeVehicleIds.length === 0 || activeVehicleIds.includes(v.id);
      if (!isActive) return;

      v.progress = p;

      // 使用 OpenLayers 原生的插值，但增加容错处理
      const coord = v.line.getCoordinateAt(v.progress);
      if (!coord) return;

      // 平滑旋转计算
      const lookAhead = 0.001; // 减小 lookAhead 避免大拐弯时的抖动
      const nextCoord = v.line.getCoordinateAt(
        Math.min(v.progress + lookAhead, 1),
      );

      if (nextCoord) {
        const dx = nextCoord[0] - coord[0];
        const dy = nextCoord[1] - coord[1];
        if (Math.abs(dx) > 0 || Math.abs(dy) > 0) {
          const rotation = Math.atan2(dy, dx);
          v.carFeature.set("rotateHi", -rotation + Math.PI / 2);
        }
      }

      v.carFeature.getGeometry().setCoordinates(coord);
    });
  };

  // 移除自动动画循环，因为我们要由播放条完全控制
  // function animate() { ... }
  // animate();

  return layer;
}

// 创建综合数据图层
async function createComprehensiveLayer(data, type) {
  const source = new VectorSource();

  data.forEach((item) => {
    let geometry;
    let style;

    if (item.type === "LineString") {
      geometry = new LineString(item.coords);
      style = new Style({
        stroke: new Stroke({
          color: type === "route" ? "#5dca8e" : "#f6a623",
          width: 6,
        }),
      });
    } else if (item.type === "Polygon") {
      let polygonCoords = item.coords;
      if (polygonCoords && polygonCoords.length > 0) {
        const firstElement = polygonCoords[0];
        if (Array.isArray(firstElement) && firstElement.length > 0 && !Array.isArray(firstElement[0])) {
          polygonCoords = [polygonCoords];
        }
      }
      geometry = new Polygon(polygonCoords);
      style = new Style({
        stroke: new Stroke({
          color: "#409eff",
          width: 2,
        }),
        fill: new Fill({
          color: "rgba(64, 158, 255, 0.2)",
        }),
      });
    } else if (item.type === "Point") {
      geometry = new Point(item.coords);
      style = new Style({
        image: new Icon({
          src: parking, // 使用一个默认图标
          scale: 0.6,
        }),
      });
    }

    if (geometry) {

      const feature = new Feature({
        geometry: geometry,
        properties: item,
        type: "comprehensive",
        subType: type,
      });
      feature.setStyle(style);
      source.addFeature(feature);
    }
  });

  const layer = new VectorLayer({
    source: source,
    zIndex: 5,
  });

  return layer;
}

export {
  createPlantLayer,
  createMultiVehicleMonitorLayer,
  createComprehensiveLayer,
};
