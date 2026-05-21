window.mapList = [
  { name: "矢量", value: "vectorwmts" },
  { name: "影像", value: "imageswmts" },
];
const [vector, images] = window.mapList;
const baseUrl = "http://222.190.118.45:18080";
// 开发环境配置
window.global_config = {
  // 系统配置
  system: {
    apiMode: "service",
    theme: "blue-theme",
    title: "佛山市无人车监管服务平台",
    arcgisServerUrl: baseUrl,
    returnUrl: "http://localhost:1609",
    logoutUrl:
      baseUrl +
      "/authservice" +
      "/auth/session/logout?redirect_uri=http://localhost:1609", // 退出登录地址,
    oauthServerUrl: baseUrl + "/authservice", // 单点登录服务地址
    clientId: "683",
    clientSecret:
      "04fc577c8c2eb1cc21712d1779afec6eb0ae990693d9ad609ce520e49e2f82d1ed782e06c75c09bbd8ce84f7bd09268b4a71d22816376e06c05012bbe718ea6eedb4226d299cb705813b3b2eddff5019a45e31954ada594cad3b4d47d6fa02a8640a9d",
  },

  // API 配置
  api: {
    baseUrl: "http://localhost:1609",
    timeout: 10000,
    debug: true,
  },

  // 地图配置
  map: {
    mapBgColor: "#051439",
    mapType: vector.value, //默认地图类型
    mpaKeys: {
      [vector.value]: 1,
      [images.value]: 2,
    },

    [vector.value]: {
      type: "WMTS",
      view_config: {
        // center: [120.15648234, 33.35160457],
        zoom: 12,
        projection: {
          code: "EPSG:4326",
          definition: "+proj=longlat +datum=WGS84 +no_defs +type=crs",
        },
        extent: {
          xmin: 112.7278,
          ymin: 22.6270,
          xmax: 113.5461,
          ymax: 23.4661
        },
      },
      layer_config: {
        url: "https://t{0-7}.tianditu.gov.cn/vec_c/wmts?tk=6634328493219d95572f0c985b2a3eac",
        layer: "vec",
        matrixSet: "c",
        format: "image/png",
        style: "default",
        origin: [-180, 90],
        resolutions: [
          1.406250026231578, 0.703125013115789, 0.3515625065578945,
          0.17578125327894775, 0.08789062663947399, 0.043945313319736994,
          0.021972656659868472, 0.010986328329934226, 0.005493164164967124,
          0.0027465820824835504, 0.0013732910412417797, 0.0006866455206208899,
          0.0003433227603104438, 0.0001716613801552224, 0.00008583069007761132,
          0.00004291534503880566, 0.000021457672519402802,
          0.000010728836259701401, 0.000005364418129850712,
          0.000002682209064925356, 0.000001341104532462678,
        ],
      },
    },
    [images.value]: {
      type: "WMTS",
      view_config: {
        // center: [120.15648234, 33.35160457],
        zoom: 12,
        projection: {
          code: "EPSG:4326",
          definition: "+proj=longlat +datum=WGS84 +no_defs +type=crs",
        },
        extent: {
         xmin: 112.7278,
          ymin: 22.6270,
          xmax: 113.5461,
          ymax: 23.4661
        },
      },
      layer_config: {
        url: "http://t0.tianditu.gov.cn/img_c/wmts?tk=6634328493219d95572f0c985b2a3eac",
        layer: "img",
        matrixSet: "c",
        format: "image/png",
        style: "default",
        origin: [-180, 90],
        resolutions: [
          1.406250026231578, 0.703125013115789, 0.3515625065578945,
          0.17578125327894775, 0.08789062663947399, 0.043945313319736994,
          0.021972656659868472, 0.010986328329934226, 0.005493164164967124,
          0.0027465820824835504, 0.0013732910412417797, 0.0006866455206208899,
          0.0003433227603104438, 0.0001716613801552224, 0.00008583069007761132,
          0.00004291534503880566, 0.000021457672519402802,
          0.000010728836259701401, 0.000005364418129850712,
          0.000002682209064925356, 0.000001341104532462678,
        ],
      },
    },
    cvawmts: {
      type: "WMTS",
      view_config: {
        // center: [120.15648234, 33.35160457],
        zoom: 12,
        projection: {
          code: "EPSG:4236",
          definition: "+proj=longlat +ellps=GRS80 +no_defs",
        },
        extent: {
          xmin: 116.10358013377254,
          ymin: 30.710719079012677,
          xmax: 122.09030402444137,
          ymax: 35.21265930204362,
        },
      },
      layer_config: {
        url: "https://t{0-7}.tianditu.gov.cn/cva_c/wmts?tk=6634328493219d95572f0c985b2a3eac",
        layer: "cva",
        matrixSet: "c",
        format: "image/png",
        style: "default",
        origin: [-180, 90],
        resolutions: [
          1.406250026231578, 0.703125013115789, 0.3515625065578945,
          0.17578125327894775, 0.08789062663947399, 0.043945313319736994,
          0.021972656659868472, 0.010986328329934226, 0.005493164164967124,
          0.0027465820824835504, 0.0013732910412417797, 0.0006866455206208899,
          0.0003433227603104438, 0.0001716613801552224, 0.00008583069007761132,
          0.00004291534503880566, 0.000021457672519402802,
          0.000010728836259701401, 0.000005364418129850712,
          0.000002682209064925356, 0.000001341104532462678,
        ],
      },
    },
  },
};
