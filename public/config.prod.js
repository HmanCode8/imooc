window.mapList = [
  { name: '矢量', value: 'vector' },
  { name: '影像', value: 'images' }
]
const [vector, images] = window.mapList

// 开发环境配置
window.global_config = {
  // 系统配置
  system: {
    title: '大数据可视化展平台',
    arcgisServerUrl: 'http://222.190.118.45:18080/MapService',
    returnUrl: 'http://localhost:1609',
    logoutUrl:
      'http://222.190.118.45:18080/authservice' +
      '/auth/session/logout?redirect_uri=http://localhost:1609', // 退出登录地址,
    oauthServerUrl: 'http://222.190.118.45:18080/authservice', // 单点登录服务地址
    clientId: '683',
    clientSecret:
      '04fc577c8c2eb1cc21712d1779afec6eb0ae990693d9ad609ce520e49e2f82d1ed782e06c75c09bbd8ce84f7bd09268b4a71d22816376e06c05012bbe718ea6eedb4226d299cb705813b3b2eddff5019a45e31954ada594cad3b4d47d6fa02a8640a9d'
  },

  // API 配置
  api: {
    baseUrl: 'http://localhost:1609',
    timeout: 10000,
    debug: true
  },

  // 地图配置
  map: {
    mapBgColor: '#051439',
    mapType: vector.value, //默认地图类型
    mpaKeys: {
      [vector.value]: 1,
      [images.value]: 2
    },
    [vector.value]: {
      // ArcGIS 服务配置
      type: 'ARCGIS_REST',
      view_config: {
        // 投影坐标系配置
        projection: {
          code: 'EPSG:4545',
          definition:
            '+proj=tmerc +lat_0=0 +lon_0=120 +k=1.0 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        },
        // 地图范围配置
        extent: {
          xmin: 157926.4595908177,
          ymin: 51090.15671254374,
          xmax: 236405.8432162517,
          ymax: 162791.11344779056
        },
        // 地图视图配置
        zoom: 10
      },
      layer_config: {
        type: 'ARCGIS_REST',
        // url: 'http://222.190.118.45:18080/MapService/3482/fabadc46529d4e5888248bfba0b7de37/export',
        layers: [0],
        format: 'png32'
      }
    },
    wmts: {
      type: 'WMTS',
      view_config: {
        // center: [120.15648234, 33.35160457],
        zoom: 8,
        projection: {
          code: 'EPSG:4490',
          definition: '+proj=longlat +ellps=GRS80 +no_defs'
        },
        extent: {
          xmin: 116.10358013377254,
          ymin: 30.710719079012677,
          xmax: 122.09030402444137,
          ymax: 35.21265930204362
        }
      },
      layer_config: {
        url: 'https://jiangsu.tianditu.gov.cn/historyraster/rest/services/historyVector/js_sldt_blue/MapServer/WMTS',
        layer: 'historyVector_js_sldt_blue',
        matrixSet: 'default',
        format: 'image/png',
        style: 'default',
        origin: [-180, 90],
        resolutions: [
          1.406250026231578, 0.703125013115789, 0.3515625065578945, 0.17578125327894775,
          0.08789062663947399, 0.043945313319736994, 0.021972656659868472, 0.010986328329934226,
          0.005493164164967124, 0.0027465820824835504, 0.0013732910412417797, 0.0006866455206208899,
          0.0003433227603104438, 0.0001716613801552224, 0.00008583069007761132,
          0.00004291534503880566, 0.000021457672519402802, 0.000010728836259701401,
          0.000005364418129850712, 0.000002682209064925356, 0.000001341104532462678
        ]
      }
    },
    [images.value]: {
      type: 'XYZ',
      view_config: {
        projection: {
          code: 'EPSG:4545',
          definition:
            '+proj=tmerc +lat_0=0 +lon_0=120 +k=1.0 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs'
        },
        extent: {
          xmin: 212869.56081439403,
          ymin: 108329.50554351603,
          xmax: 214338.06081439403,
          ymax: 109838.50554351603
        },
        zoom: 10
      },
      layer_config: {
        tileSize: [256, 256],
        origin: [-5123200.0, 1.00021e7],
        resolutions: [
          541.8677504021675, 270.93387520108377, 135.46693760054188, 67.73346880027094,
          33.86673440013547, 16.933367200067735, 8.466683600033868, 4.233341800016934,
          2.116670900008467, 1.0583354500042335, 0.5291677250021167, 0.26458386250105836,
          0.13229193125052918, 0.06614596562526459
        ]
      }
    }
  }
}
