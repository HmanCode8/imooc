import { MousePosition, defaults as defaultControls } from 'ol/control.js';
import { createStringXY } from 'ol/coordinate.js';
import Swipe from 'ol-ext/control/Swipe';
import Transform from "ol-ext/interaction/Transform";
import ModifyFeature from "ol-ext/interaction/ModifyFeature";
import Snap from "ol/interaction/Snap";
import { ref, shallowRef } from 'vue';

/**
 * 地图控件管理 Hook
 */
export function useMapControls() {
  const controls = shallowRef({});

  /**
   * 初始化鼠标位置控件
   * @param {import("ol").Map} map 地图实例
   * @param {string} projection 投影
   * @param {string} mapType 地图类型
   */
  const initMousePosition = (map, projection, mapType) => {
    if (controls.value.mousePosition) {
      map.removeControl(controls.value.mousePosition);
    }

    const mousePositionControl = new MousePosition({
      coordinateFormat: createStringXY(4),
      projection: projection,
      className: `custom-mouse-position ${mapType === 'vectorwmts' ? 'text-black' : 'text-white'
        } py-1 px-2 mb-1 text-sm rounded-sm absolute right-1 bottom-0 z-10`,
      undefinedHTML: '&nbsp;',
    });

    map.addControl(mousePositionControl);
    controls.value.mousePosition = mousePositionControl;
    return mousePositionControl;
  };

  /**
   * 初始化卷帘控件
   * @param {import("ol").Map} map 地图实例
   * @param {import("ol/layer").Layer[]} layers 参与卷帘的图层（通常是右侧图层）
   */
  const initSwipe = (map, layers) => {
    if (controls.value.swipe) {
      map.removeControl(controls.value.swipe);
      map.removeInteraction(controls.value.swipe);
    }

    const swipe = new Swipe({
      rightLayers: layers,
      position: 0.5,
    });

    map.addControl(swipe);
    map.addInteraction(swipe);
    controls.value.swipe = swipe;
    return swipe;
  };
  /**
 * Feature编辑（拖拽、旋转、缩放）
 *
 * @param {import("ol").Map} map 地图实例
 * @param {import("ol/feature").Feature[]} features 选中的feature集合（可选）
 * 
 */
  const initTransformModifyFeature = (map, features = null) => {
    removeControl(map, "transform");
    const transform = new Transform({
      features,
      translate: true,
      scale: true,

      rotate: true,

      stretch: true,

      keepAspectRatio: (e) => {
        return e.originalEvent.shiftKey;
      },
    });

    // 开始
    transform.on("select", (e) => {
      console.log("选中:", e.features);
    });

    // 拖拽中
    transform.on("translating", (e) => {
      console.log("移动中", e);
    });

    // 缩放中
    transform.on("scaling", (e) => {
      console.log("缩放:", e.scale);
    });

    // 旋转中
    transform.on("rotating", (e) => {
      console.log("旋转:", e.angle);
    });

    // 结束
    transform.on("translateend", (e) => {
      console.log("编辑完成", e);
    });

    map.addInteraction(transform);

    controls.value.transform = transform;

    return transform;
  };

  const initInteractionModifyFeature = (
    map,
    source,
  ) => {
    removeControl(map, "modifyFeature");
    removeControl(map, "snap");

    // 节点编辑
    const modify = new ModifyFeature({
      source,
    });

    // 吸附
    const snap = new Snap({
      source,

      pixelTolerance: 15,
    });

    modify.on("modifystart", (e) => {
      console.log("开始编辑", e.features);
    });

    modify.on("modifying", (e) => {
      console.log("编辑中", e.features);
    });

    modify.on("modifyend", (e) => {
      console.log("编辑结束", e.features);
    });

    map.addInteraction(modify);

    map.addInteraction(snap);

    controls.value.modifyFeature = modify;

    controls.value.snap = snap;

    return {
      modify,

      snap,
    };
  };
  /**
   * 移除控件
   * @param {import("ol").Map} map 地图实例
   * @param {string} name 控件名称
   */
  const removeControl = (map, name) => {
    const control = controls.value[name];
    if (control) {
      map.removeControl(control);
      if (name === 'swipe') {
        map.removeInteraction(control);
      }
      const newControls = { ...controls.value };
      delete newControls[name];
      controls.value = newControls;
    }
  };

  /**
   * 获取默认控件
   */
  const getDefaultControls = () => {
    return defaultControls();
  };

  return {
    controls,
    initMousePosition,
    initSwipe,
    initTransformModifyFeature,
    initInteractionModifyFeature,
    removeControl,
    getDefaultControls,
  };
}
