/**
 * 车辆模拟数据
 * 包含：简约直角轨迹、局部偏移线、起终点标注
 */

const BASE_LNG = 113.1315;
const BASE_LAT = 23.0268;

export const carData = [
  {
    id: "LSVGP2AU3JW097701",
    plateNo: "粤E·A8881",
    type: "正式",
    status: "online",
    category: "无人物流车",
    region: "南海区",
    enterprise: "顺丰科技",
    color: "#5dca8e",
    startTime: "11:00",
    endTime: "12:00",
    // 简约直角轨迹 - 增加点位使轨迹更平滑，且偏移段更短
    actualRoute: [
      [BASE_LNG, BASE_LAT], // 0: 起点
      [BASE_LNG + 0.003, BASE_LAT], // 1: 正常行驶
      [BASE_LNG + 0.006, BASE_LAT], // 2: 正常行驶
      [BASE_LNG + 0.006, BASE_LAT - 0.003], // 3: 偏移发生点（实际拐弯）
      [BASE_LNG + 0.006, BASE_LAT - 0.006], // 4: 偏移结束点
      [BASE_LNG + 0.009, BASE_LAT - 0.006], // 5: 回到正常
      [BASE_LNG + 0.012, BASE_LAT - 0.006], // 6: 终点
    ],
    // 规划路线：绝大部分与实际一致，仅在中间一小段发生偏移
    get plannedRoute() {
      const route = JSON.parse(JSON.stringify(this.actualRoute));
      // 模拟规划路线在 2-5 之间是直线，而实际路线绕了一下
      route[3] = [BASE_LNG + 0.009, BASE_LAT];
      route[4] = [BASE_LNG + 0.009, BASE_LAT - 0.003];
      return route;
    },
    statusSegments: [
      {
        type: "normal",
        label: "正常",
        startPct: 0,
        endPtc: 33,
        startTime: "11:00",
        endTime: "11:20",
      },
      {
        type: "stay",
        label: "停留",
        startPct: 33,
        endPtc: 45,
        startTime: "11:20",
        endTime: "11:27",
        duration: "7分钟",
      },
      {
        type: "deviation",
        label: "偏移",
        startPct: 45,
        endPtc: 83,
        startTime: "11:27",
        endTime: "11:50",
      },
      {
        type: "normal",
        label: "正常",
        startPct: 83,
        endPtc: 100,
        startTime: "11:50",
        endTime: "12:00",
      },
    ],
    stopPoints: [
      { coords: [BASE_LNG + 0.006, BASE_LAT], type: "停留", duration: "7分钟" },
    ],
    terminalInfo: {
      speed: 15.9,
      status: "自动驾驶",
      power: 85,
      signalStatus: "强",
    },
  },
  {
    id: "LSVGP2AU3JW097702",
    plateNo: "粤E·T6662",
    type: "测试",
    status: "online",
    category: "无人清扫车",
    region: "禅城区",
    enterprise: "测试A",
    startTime: "09:00",
    endTime: "10:00",
    statusSegments: [
      {
        type: "normal",
        label: "正常",
        startPct: 0,
        endPtc: 100,
        startTime: "09:00",
        endTime: "10:00",
      },
    ],
    actualRoute: [
      [BASE_LNG - 0.005, BASE_LAT + 0.005],
      [BASE_LNG - 0.005, BASE_LAT + 0.002],
      [BASE_LNG - 0.002, BASE_LAT + 0.002],
    ],
    get plannedRoute() {
      return this.actualRoute;
    },
    terminalInfo: {
      speed: 10.5,
      status: "手动接管",
      power: 45,
      signalStatus: "中",
    },
  },
];
