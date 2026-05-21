/**
 * 车辆模拟数据
 * 包含：简约直角轨迹、局部偏移线、起终点标注
 */

import previewcar from "@/assets/previewcar.webp";
import dayjs from "dayjs";

const BASE_LNG = 113.1315;
const BASE_LAT = 23.0268;

const rawCarData = [
  {
    id: "LSVGP2AU3JW097701",
    plateNo: "粤E·A8881",
    type: "正式",
    status: "online",
    category: "无人物流车",
    region: "南海区",
    enterprise: "测试A",
    photo: previewcar,
    securityInfo: {
      name: "张志强",
      gender: "男",
      phone: "13800138001",
      unit: "测试A",
      licenseNo: "440605199101011234",
    },
    color: "#5dca8e",
    startTime: "11:00",
    endTime: "12:00",
    // 历史轨迹数据 (自动今日倒推日期键)
    history: {
      [dayjs().format("YYYY-MM-DD")]: {
        startTime: "11:00",
        endTime: "12:00",
        actualRoute: [
          [BASE_LNG, BASE_LAT],
          [BASE_LNG + 0.003, BASE_LAT],
          [BASE_LNG + 0.006, BASE_LAT],
          [BASE_LNG + 0.006, BASE_LAT - 0.003],
          [BASE_LNG + 0.006, BASE_LAT - 0.006],
          [BASE_LNG + 0.009, BASE_LAT - 0.006],
          [BASE_LNG + 0.012, BASE_LAT - 0.006],
        ],
        plannedRoute: [
          [BASE_LNG, BASE_LAT],
          [BASE_LNG + 0.003, BASE_LAT],
          [BASE_LNG + 0.006, BASE_LAT],
          [BASE_LNG + 0.009, BASE_LAT],
          [BASE_LNG + 0.009, BASE_LAT - 0.003],
          [BASE_LNG + 0.009, BASE_LAT - 0.006],
          [BASE_LNG + 0.012, BASE_LAT - 0.006],
        ],
        statusSegments: [
          {
            type: "normal",
            label: "正常",
            startPct: 0,
            endPct: 33,
            startLinePct: 0,
            endLinePct: 0.333,
            startTime: "11:00",
            endTime: "11:20",
          },
          {
            type: "stay",
            label: "停留",
            startPct: 33,
            endPct: 45,
            startLinePct: 0.333,
            endLinePct: 0.333,
            startTime: "11:20",
            endTime: "11:27",
            duration: "7分钟",
          },
          {
            type: "deviation",
            label: "偏移",
            startPct: 45,
            endPct: 83,
            startLinePct: 0.333,
            endLinePct: 0.833,
            startTime: "11:27",
            endTime: "11:50",
          },
          {
            type: "normal",
            label: "正常",
            startPct: 83,
            endPct: 100,
            startLinePct: 0.833,
            endLinePct: 1,
            startTime: "11:50",
            endTime: "12:00",
          },
        ],
        stats: {
          totalDuration: "1 小时",
          totalDistance: "3.5 km",
          stayDuration: "7 分钟",
          maxSpeed: "28 km/h",
          avgSpeed: "14 km/h",
          deviationStatus: "偏移",
        },
        stopPoints: [
          {
            coords: [BASE_LNG + 0.006, BASE_LAT],
            type: "停留",
            duration: "7分钟",
          },
        ],
      },
      [dayjs().subtract(1, "day").format("YYYY-MM-DD")]: {
        startTime: "13:00",
        endTime: "14:10",
        plannedRoute: [
          [BASE_LNG - 0.06, BASE_LAT + 0.03],
          [BASE_LNG - 0.06, BASE_LAT + 0.015],
          [BASE_LNG - 0.06, BASE_LAT - 0.015],
          [BASE_LNG - 0.052, BASE_LAT - 0.015],
          [BASE_LNG - 0.045, BASE_LAT - 0.015],
          [BASE_LNG - 0.045, BASE_LAT - 0.005],
          [BASE_LNG - 0.045, BASE_LAT + 0.005],
          [BASE_LNG - 0.037, BASE_LAT + 0.005],
          [BASE_LNG - 0.03, BASE_LAT + 0.005],
          [BASE_LNG - 0.03, BASE_LAT - 0.002],
          [BASE_LNG - 0.03, BASE_LAT - 0.01],
          [BASE_LNG - 0.015, BASE_LAT - 0.01],
          [BASE_LNG - 0.015, BASE_LAT + 0.012],
          [BASE_LNG - 0.005, BASE_LAT + 0.012],
          [BASE_LNG - 0.005, BASE_LAT + 0.004],
          [BASE_LNG - 0.005, BASE_LAT - 0.005],
          [BASE_LNG + 0.01, BASE_LAT - 0.005],
          [BASE_LNG + 0.01, BASE_LAT + 0.006],
          [BASE_LNG + 0.01, BASE_LAT + 0.015],
          [BASE_LNG + 0.02, BASE_LAT + 0.015],
          [BASE_LNG + 0.03, BASE_LAT + 0.015],
          [BASE_LNG + 0.03, BASE_LAT - 0.012],
          [BASE_LNG + 0.02, BASE_LAT - 0.012],
          [BASE_LNG + 0.015, BASE_LAT - 0.012],
          [BASE_LNG + 0.015, BASE_LAT - 0.022],
          [BASE_LNG + 0.03, BASE_LAT - 0.022],
          [BASE_LNG + 0.045, BASE_LAT - 0.022],
        ],
        actualRoute: [
          [BASE_LNG - 0.06, BASE_LAT + 0.03],
          [BASE_LNG - 0.06, BASE_LAT + 0.018],
          [BASE_LNG - 0.06, BASE_LAT + 0.006],
          [BASE_LNG - 0.06, BASE_LAT - 0.006],
          [BASE_LNG - 0.06, BASE_LAT - 0.015],
          [BASE_LNG - 0.052, BASE_LAT - 0.015],
          [BASE_LNG - 0.045, BASE_LAT - 0.015],
          [BASE_LNG - 0.045, BASE_LAT - 0.005],
          [BASE_LNG - 0.045, BASE_LAT + 0.005],
          [BASE_LNG - 0.037, BASE_LAT + 0.005],
          [BASE_LNG - 0.03, BASE_LAT + 0.005],
          [BASE_LNG - 0.03, BASE_LAT - 0.002],
          [BASE_LNG - 0.03, BASE_LAT - 0.01],
          [BASE_LNG - 0.028, BASE_LAT - 0.015],
          [BASE_LNG - 0.025, BASE_LAT - 0.02],
          [BASE_LNG - 0.012, BASE_LAT - 0.02],
          [BASE_LNG - 0.012, BASE_LAT - 0.002],
          [BASE_LNG - 0.02, BASE_LAT + 0.008],
          [BASE_LNG - 0.015, BASE_LAT + 0.012],
          [BASE_LNG - 0.01, BASE_LAT + 0.012],
          [BASE_LNG - 0.005, BASE_LAT + 0.012],
          [BASE_LNG - 0.005, BASE_LAT + 0.004],
          [BASE_LNG - 0.005, BASE_LAT - 0.005],
          [BASE_LNG + 0.003, BASE_LAT - 0.005],
          [BASE_LNG + 0.01, BASE_LAT - 0.005],
          [BASE_LNG + 0.01, BASE_LAT + 0.006],
          [BASE_LNG + 0.01, BASE_LAT + 0.015],
          [BASE_LNG + 0.02, BASE_LAT + 0.015],
          [BASE_LNG + 0.03, BASE_LAT + 0.015],
          [BASE_LNG + 0.035, BASE_LAT + 0.008],
          [BASE_LNG + 0.038, BASE_LAT - 0.002],
          [BASE_LNG + 0.03, BASE_LAT - 0.012],
          [BASE_LNG + 0.02, BASE_LAT - 0.012],
          [BASE_LNG + 0.015, BASE_LAT - 0.012],
          [BASE_LNG + 0.015, BASE_LAT - 0.017],
          [BASE_LNG + 0.015, BASE_LAT - 0.022],
          [BASE_LNG + 0.03, BASE_LAT - 0.022],
          [BASE_LNG + 0.045, BASE_LAT - 0.022],
          [BASE_LNG + 0.052, BASE_LAT - 0.018],
          [BASE_LNG + 0.05, BASE_LAT - 0.015],
        ],
        statusSegments: [
          {
            type: "normal",
            label: "正常",
            startPct: 0,
            endPct: 18,
            startLinePct: 0,
            endLinePct: 0.3125513412737308,
            startTime: "13:00",
            endTime: "13:13",
          },
          {
            type: "stay",
            label: "停留",
            startPct: 18,
            endPct: 26,
            startLinePct: 0.3125513412737308,
            endLinePct: 0.3125513412737308,
            startTime: "13:13",
            endTime: "13:19",
            duration: "6分钟",
          },
          {
            type: "deviation",
            label: "偏移",
            startPct: 26,
            endPct: 45,
            startLinePct: 0.3125513412737308,
            endLinePct: 0.4870842422266954,
            startTime: "13:19",
            endTime: "13:33",
          },
          {
            type: "normal",
            label: "正常",
            startPct: 45,
            endPct: 70,
            startLinePct: 0.4870842422266954,
            endLinePct: 0.6632495436718977,
            startTime: "13:33",
            endTime: "13:51",
          },
          {
            type: "stay",
            label: "停留",
            startPct: 70,
            endPct: 78,
            startLinePct: 0.6632495436718977,
            endLinePct: 0.6632495436718977,
            startTime: "13:51",
            endTime: "14:00",
            duration: "9分钟",
          },
          {
            type: "deviation",
            label: "偏移",
            startPct: 78,
            endPct: 88,
            startLinePct: 0.6632495436718977,
            endLinePct: 0.8389854571143535,
            startTime: "14:00",
            endTime: "14:05",
          },
          {
            type: "normal",
            label: "正常",
            startPct: 88,
            endPct: 90,
            startLinePct: 0.8389854571143535,
            endLinePct: 0.8673992154119488,
            startTime: "14:05",
            endTime: "14:07",
          },
          {
            type: "stay",
            label: "停留",
            startPct: 90,
            endPct: 94,
            startLinePct: 0.8673992154119488,
            endLinePct: 0.8673992154119488,
            startTime: "14:07",
            endTime: "14:10",
            duration: "3分钟",
          },
          {
            type: "normal",
            label: "正常",
            startPct: 94,
            endPct: 100,
            startLinePct: 0.8673992154119488,
            endLinePct: 1,
            startTime: "14:10",
            endTime: "14:10",
          },
        ],
        stats: {
          totalDuration: "1 小时 10 分钟",
          totalDistance: "12.8 km",
          stayDuration: "18 分钟",
          maxSpeed: "42 km/h",
          avgSpeed: "19 km/h",
          deviationStatus: "多次停留/两段偏移",
        },
        stopPoints: [
          {
            coords: [BASE_LNG - 0.03, BASE_LAT - 0.01],
            type: "停留",
            duration: "6分钟",
          },
          {
            coords: [BASE_LNG + 0.01, BASE_LAT + 0.015],
            type: "停留",
            duration: "9分钟",
          },
          {
            coords: [BASE_LNG + 0.015, BASE_LAT - 0.017],
            type: "停留",
            duration: "3分钟",
          },
        ],
      },
      [dayjs().subtract(2, "day").format("YYYY-MM-DD")]: {
        startTime: "09:00",
        endTime: "11:00",
        actualRoute: [
          [BASE_LNG, BASE_LAT],
          [BASE_LNG, BASE_LAT + 0.004],
          [BASE_LNG + 0.005, BASE_LAT + 0.004],
          [BASE_LNG + 0.005, BASE_LAT + 0.007],
          [BASE_LNG + 0.01, BASE_LAT + 0.007],
          [BASE_LNG + 0.01, BASE_LAT + 0.01],
        ],
        plannedRoute: [
          [BASE_LNG, BASE_LAT],
          [BASE_LNG, BASE_LAT + 0.004],
          [BASE_LNG + 0.005, BASE_LAT + 0.004],
          [BASE_LNG + 0.01, BASE_LAT + 0.004],
          [BASE_LNG + 0.01, BASE_LAT + 0.007],
          [BASE_LNG + 0.01, BASE_LAT + 0.01],
        ],
        statusSegments: [
          {
            type: "normal",
            label: "正常",
            startPct: 0,
            endPct: 20,
            startLinePct: 0,
            endLinePct: 0.2,
            startTime: "09:00",
            endTime: "09:24",
          },
          {
            type: "stay",
            label: "停留",
            startPct: 20,
            endPct: 35,
            startLinePct: 0.2,
            endLinePct: 0.2,
            startTime: "09:24",
            endTime: "09:42",
            duration: "18分钟",
          },
          {
            type: "normal",
            label: "正常",
            startPct: 35,
            endPct: 50,
            startLinePct: 0.2,
            endLinePct: 0.45,
            startTime: "09:42",
            endTime: "10:00",
          },
          {
            type: "deviation",
            label: "偏移",
            startPct: 50,
            endPct: 65,
            startLinePct: 0.45,
            endLinePct: 0.6,
            startTime: "10:00",
            endTime: "10:18",
          },
          {
            type: "normal",
            label: "正常",
            startPct: 65,
            endPct: 75,
            startLinePct: 0.6,
            endLinePct: 0.85,
            startTime: "10:18",
            endTime: "10:30",
          },
          {
            type: "stay",
            label: "停留",
            startPct: 75,
            endPct: 90,
            startLinePct: 0.85,
            endLinePct: 0.85,
            startTime: "10:30",
            endTime: "10:48",
            duration: "18分钟",
          },
          {
            type: "normal",
            label: "正常",
            startPct: 90,
            endPct: 100,
            startLinePct: 0.85,
            endLinePct: 1,
            startTime: "10:48",
            endTime: "11:00",
          },
        ],
        stats: {
          totalDuration: "2 小时",
          totalDistance: "4.8 km",
          stayDuration: "36 分钟",
          maxSpeed: "32 km/h",
          avgSpeed: "18 km/h",
          deviationStatus: "多次停留/偏移",
        },
        stopPoints: [
          {
            coords: [BASE_LNG, BASE_LAT + 0.004],
            type: "停留",
            duration: "18分钟",
          },
          {
            coords: [BASE_LNG + 0.01, BASE_LAT + 0.007],
            type: "停留",
            duration: "18分钟",
          },
        ],
      },
    },
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
    enterprise: "测试B",
    photo: previewcar,
    securityInfo: {
      name: "李晓敏",
      gender: "女",
      phone: "13800138002",
      unit: "测试B",
      licenseNo: "440604199402021234",
    },
    startTime: "09:00",
    endTime: "10:00",
    history: {
      [dayjs().format("YYYY-MM-DD")]: {
        startTime: "09:00",
        endTime: "10:00",
        actualRoute: [
          [BASE_LNG - 0.005, BASE_LAT + 0.005],
          [BASE_LNG - 0.005, BASE_LAT + 0.002],
          [BASE_LNG - 0.002, BASE_LAT + 0.002],
        ],
        plannedRoute: [
          [BASE_LNG - 0.005, BASE_LAT + 0.005],
          [BASE_LNG - 0.005, BASE_LAT + 0.002],
          [BASE_LNG - 0.002, BASE_LAT + 0.002],
        ],
        statusSegments: [
          {
            type: "normal",
            label: "正常",
            startPct: 0,
            endPct: 100,
            startLinePct: 0,
            endLinePct: 1,
            startTime: "09:00",
            endTime: "10:00",
          },
        ],
        stats: {
          totalDuration: "1 小时",
          totalDistance: "1.2 km",
          stayDuration: "0 分钟",
          maxSpeed: "10.5 km/h",
          avgSpeed: "8 km/h",
          deviationStatus: "正常",
        },
        stopPoints: [],
      },
    },
    terminalInfo: {
      speed: 10.5,
      status: "手动接管",
      power: 45,
      signalStatus: "中",
    },
  },
  {
    id: "LSVGP2AU3JW097703",
    plateNo: "粤E·X1234",
    type: "正式",
    status: "online",
    category: "无人物流车",
    region: "南海区",
    enterprise: "测试A",
    photo: previewcar,
    securityInfo: {
      name: "王浩然",
      gender: "男",
      phone: "13800138003",
      unit: "测试A",
      licenseNo: "440605199003031234",
    },
    color: "#ad58f6",
    history: {
      [dayjs().format("YYYY-MM-DD")]: {
        startTime: "08:30",
        endTime: "10:30",
        actualRoute: [
          [113.1245, 23.0325],
          [113.1265, 23.0305],
          [113.1285, 23.029],
          [113.131, 23.029],
          [113.1325, 23.0265],
          [113.134, 23.0275],
          [113.1355, 23.0285],
          [113.1385, 23.0295],
        ],
        plannedRoute: [
          [113.1245, 23.0325],
          [113.1265, 23.0305],
          [113.1285, 23.029],
          [113.1325, 23.029],
          [113.1355, 23.0285],
          [113.1385, 23.0295],
        ],
        statusSegments: [
          {
            type: "normal",
            label: "正常",
            startPct: 0,
            endPct: 25,
            startLinePct: 0,
            endLinePct: 0.304,
            startTime: "08:30",
            endTime: "09:00",
          },
          {
            type: "stay",
            label: "停留",
            startPct: 25,
            endPct: 40,
            startLinePct: 0.304,
            endLinePct: 0.304,
            startTime: "09:00",
            endTime: "09:18",
            duration: "18分钟",
          },
          {
            type: "normal",
            label: "正常",
            startPct: 40,
            endPct: 50,
            startLinePct: 0.304,
            endLinePct: 0.447,
            startTime: "09:18",
            endTime: "09:30",
          },
          {
            type: "deviation",
            label: "偏移",
            startPct: 50,
            endPct: 75,
            startLinePct: 0.447,
            endLinePct: 0.819,
            startTime: "09:30",
            endTime: "10:00",
          },
          {
            type: "stay",
            label: "停留",
            startPct: 75,
            endPct: 90,
            startLinePct: 0.819,
            endLinePct: 0.819,
            startTime: "10:00",
            endTime: "10:18",
            duration: "18分钟",
          },
          {
            type: "normal",
            label: "正常",
            startPct: 90,
            endPct: 100,
            startLinePct: 0.819,
            endLinePct: 1,
            startTime: "10:18",
            endTime: "10:30",
          },
        ],
        stats: {
          totalDuration: "2 小时",
          totalDistance: "5.2 km",
          stayDuration: "36 分钟",
          maxSpeed: "25 km/h",
          avgSpeed: "15 km/h",
          deviationStatus: "偏移(跨河段)",
        },
        stopPoints: [
          { coords: [113.1285, 23.029], type: "停留", duration: "18分钟" },
          { coords: [113.1355, 23.0285], type: "停留", duration: "18分钟" },
        ],
      },
    },
    terminalInfo: {
      speed: 18.5,
      status: "自动驾驶",
      power: 92,
      signalStatus: "强",
    },
  },

];

const ENTERPRISE_OPTIONS = ["测试A", "测试B"];
const REGION_OPTIONS = ["禅城区", "南海区", "顺德区", "高明区", "三水区"];
const VEHICLE_TYPE_OPTIONS = ["正式", "测试"];
const VEHICLE_CATEGORY_OPTIONS = [
  "无人物流车",
  "无人货运车",
  "无人清扫车",
  "无人安防车",
];

const pickByIndex = (arr, index) => arr[index % arr.length];

const pickTrajectory = (car) => {
  const history = car?.history || {};
  const dates = Object.keys(history).sort((a, b) => (dayjs(a).isAfter(dayjs(b)) ? -1 : 1));
  if (dates.length === 0) return {};
  return history[dates[0]] || {};
};

const isOffline = (car) => {
  if (car?.status === "offline") return true;
  if (car?.status === "离线") return true;
  if (car?.terminalInfo?.status === "离线") return true;
  return false;
};

const buildTerminalInfo = (car, index) => {
  const offline = isOffline(car);
  const base = car?.terminalInfo || {};
  const lightStatus = base.lightStatus ?? (offline ? "关" : index % 2 === 0 ? "开" : "关");
  const hornStatus = base.hornStatus ?? (offline ? "关" : index % 3 === 0 ? "开" : "关");
  const signalRealtime =
    base.signalRealtime ??
    (offline
      ? "无"
      : index % 4 === 0
        ? "左转"
        : index % 4 === 1
          ? "右转"
          : index % 4 === 2
            ? "双闪"
            : "正常");
  return {
    speed: base.speed ?? (offline ? 0 : 18 + ((index * 7) % 25)),
    status: base.status ?? (offline ? "离线" : "自动驾驶"),
    power: base.power ?? (offline ? 12 : 40 + ((index * 9) % 60)),
    batteryTemp: base.batteryTemp ?? (offline ? 0 : 28 + ((index * 3) % 12)),
    signalStatus: base.signalStatus ?? (offline ? "无" : "良好"),
    gear: base.gear ?? (offline ? "-" : "D"),
    lightStatus,
    hornStatus,
    signalRealtime,
  };
};

export const carData = rawCarData.map((car, index) => {
  const traj = pickTrajectory(car);
  const status = car.status === "离线" ? "offline" : car.status;
  const enterprise = pickByIndex(ENTERPRISE_OPTIONS, index);
  const region = pickByIndex(REGION_OPTIONS, index);
  const type = pickByIndex(VEHICLE_TYPE_OPTIONS, index);
  const category = pickByIndex(VEHICLE_CATEGORY_OPTIONS, index);
  const terminalInfo = buildTerminalInfo({ ...car, status }, index);
  const actualRoute =
    car.actualRoute || traj.actualRoute || traj.plannedRoute || [];
  const plannedRoute =
    car.plannedRoute || traj.plannedRoute || traj.actualRoute || [];

  return {
    ...car,
    status,
    enterprise,
    region,
    securityInfo: car.securityInfo
      ? {
          ...car.securityInfo,
          unit: enterprise,
          licenseValidUntil: car.securityInfo.licenseValidUntil ?? "2030-12-31",
        }
      : car.securityInfo,
    type,
    category,
    terminalInfo,
    actualRoute,
    plannedRoute,
    statusText: status === "offline" ? "离线" : "正常",
  };
});