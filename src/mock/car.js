

/**
 * 无人车监管服务平台 - 车辆模拟数据
 * 包含：基本信息、安全员信息、终端对接信息、规划轨迹与实际轨迹
 */
/**
 * 生成随机非直线轨迹的辅助函数 (模拟数据生成用)
 */
function createRandomRouteMock(count = 6) {
  const minLng = 112.95;
  const maxLng = 113.3;
  const minLat = 22.85;
  const maxLat = 23.15;

  const route = [];
  let currentLng = minLng + Math.random() * (maxLng - minLng);
  let currentLat = minLat + Math.random() * (maxLat - minLat);
  route.push([currentLng, currentLat]);

  for (let i = 1; i < count; i++) {
    currentLng += (Math.random() - 0.5) * 0.05;
    currentLat += (Math.random() - 0.5) * 0.05;
    currentLng = Math.max(minLng, Math.min(maxLng, currentLng));
    currentLat = Math.max(minLat, Math.min(maxLat, currentLat));
    route.push([currentLng, currentLat]);
  }
  return route;
}

/**
 * 无人车监管服务平台 - 车辆模拟数据
 * 包含：基本信息、安全员信息、终端对接信息、规划轨迹与实际轨迹
 */
const carData = [
  {
    id: 'car_01',
    plateNo: '粤X·88881',
    status: 'online',
    category: '无人物流车',
    type: '测试',
    enterprise: '顺丰科技',
    region: '南海区',
    color: '#0091FF', // 蓝色
    securityInfo: {
      name: '张三',
      gender: '男',
      phone: '13800138001',
      unit: '南海物流中心',
      licenseNo: '44060019900101XXXX',
      licenseExpiry: '2030-01-01'
    },
    terminalInfo: {
      speed: 15.5,
      status: '自动驾驶',
      gear: 'D',
      power: 85,
      batteryTemp: 32,
      lights: '开启',
      horn: '关闭',
      signalStatus: '强'
    },
    plannedRoute: createRandomRouteMock(8),
    actualRoute:createRandomRouteMock(4)
  },
  {
    id: 'car_02',
    plateNo: '粤X·88882',
    status: 'online',
    category: '无人售货车',
    type: '正式',
    enterprise: '美团自动驾驶',
    region: '禅城区',
    color: '#00C48C', // 绿色
    securityInfo: {
      name: '李四',
      gender: '女',
      phone: '13800138002',
      unit: '美团佛山分部',
      licenseNo: '44060019920202XXXX',
      licenseExpiry: '2032-02-02'
    },
    terminalInfo: {
      speed: 12.0,
      status: '自动驾驶',
      gear: 'D',
      power: 60,
      batteryTemp: 35,
      lights: '关闭',
      horn: '关闭',
      signalStatus: '中'
    },
    plannedRoute: createRandomRouteMock(8),
    actualRoute: []
  },
  {
    id: 'car_03',
    plateNo: '粤X·88883',
    status: 'offline',
    category: '无人环卫车',
    type: '测试',
    enterprise: '盈峰环境',
    region: '顺德区',
    color: '#FF7D00', // 橙色
    securityInfo: {
      name: '王五',
      gender: '男',
      phone: '13800138003',
      unit: '顺德环卫局',
      licenseNo: '44060019880303XXXX',
      licenseExpiry: '2028-03-03'
    },
    terminalInfo: {
      speed: 0,
      status: '离线',
      gear: 'P',
      power: 20,
      batteryTemp: 25,
      lights: '关闭',
      horn: '关闭',
      signalStatus: '无'
    },
    plannedRoute: createRandomRouteMock(8),
    actualRoute: []
  },
  {
    id: 'car_04',
    plateNo: '粤X·88884',
    status: 'online',
    category: '无人安防车',
    type: '正式',
    enterprise: '大华科技',
    region: '南海区',
    color: '#FF4D4F', // 红色
    securityInfo: {
      name: '赵六',
      gender: '男',
      phone: '13800138004',
      unit: '南海公安分局',
      licenseNo: '44060019950404XXXX',
      licenseExpiry: '2035-04-04'
    },
    terminalInfo: {
      speed: 25.0,
      status: '手动控制',
      gear: 'D',
      power: 90,
      batteryTemp: 30,
      lights: '开启',
      horn: '开启',
      signalStatus: '强'
    },
    plannedRoute: createRandomRouteMock(8),
    actualRoute: []
  },
  {
    id: 'car_05',
    plateNo: '粤X·88885',
    status: 'online',
    category: '无人物流车',
    type: '测试',
    enterprise: '京东物流',
    region: '三水区',
    color: '#722ED1', // 紫色
    securityInfo: {
      name: '孙七',
      gender: '男',
      phone: '13800138005',
      unit: '三水转运站',
      licenseNo: '44060019930505XXXX',
      licenseExpiry: '2033-05-05'
    },
    terminalInfo: {
      speed: 18.2,
      status: '自动驾驶',
      gear: 'D',
      power: 75,
      batteryTemp: 33,
      lights: '开启',
      horn: '关闭',
      signalStatus: '中'
    },
    plannedRoute: createRandomRouteMock(8),
    actualRoute: []
  },
  {
    id: 'car_06',
    plateNo: '粤X·88886',
    status: 'online',
    category: '无人售货车',
    type: '测试',
    enterprise: '盒马鲜生',
    region: '高明区',
    color: '#13C2C2', // 青色
    securityInfo: {
      name: '周八',
      gender: '女',
      phone: '13800138006',
      unit: '高明配送中心',
      licenseNo: '44060019910606XXXX',
      licenseExpiry: '2031-06-06'
    },
    terminalInfo: {
      speed: 10.5,
      status: '自动驾驶',
      gear: 'D',
      power: 45,
      batteryTemp: 36,
      lights: '关闭',
      horn: '关闭',
      signalStatus: '弱'
    },
    plannedRoute: createRandomRouteMock(8),
    actualRoute: []
  },
  {
    id: 'car_07',
    plateNo: '粤X·88887',
    status: 'online',
    category: '无人环卫车',
    type: '正式',
    enterprise: '碧桂园服务',
    region: '顺德区',
    color: '#00B42A', // 深绿
    securityInfo: {
      name: '吴九',
      gender: '男',
      phone: '13800138007',
      unit: '碧桂园总部',
      licenseNo: '44060019890707XXXX',
      licenseExpiry: '2029-07-07'
    },
    terminalInfo: {
      speed: 5.5,
      status: '自动驾驶',
      gear: 'D',
      power: 95,
      batteryTemp: 28,
      lights: '开启',
      horn: '关闭',
      signalStatus: '强'
    },
    plannedRoute: createRandomRouteMock(8),
    actualRoute: []
  },
  {
    id: 'car_08',
    plateNo: '粤X·88888',
    status: 'online',
    category: '无人安防车',
    type: '测试',
    enterprise: '海康威视',
    region: '禅城区',
    color: '#F7BA1E', // 黄色
    securityInfo: {
      name: '郑十',
      gender: '男',
      phone: '13800138008',
      unit: '禅城监控室',
      licenseNo: '44060019940808XXXX',
      licenseExpiry: '2034-08-08'
    },
    terminalInfo: {
      speed: 20.0,
      status: '自动驾驶',
      gear: 'D',
      power: 65,
      batteryTemp: 34,
      lights: '开启',
      horn: '关闭',
      signalStatus: '中'
    },
    plannedRoute: createRandomRouteMock(8),
    actualRoute: []
  },
  {
    id: 'car_09',
    plateNo: '粤X·88889',
    status: 'offline',
    category: '无人物流车',
    type: '正式',
    enterprise: '中国邮政',
    region: '南海区',
    color: '#8C8C8C', // 灰色
    securityInfo: {
      name: '钱十一',
      gender: '男',
      phone: '13800138009',
      unit: '南海邮政局',
      licenseNo: '44060019870909XXXX',
      licenseExpiry: '2027-09-09'
    },
    terminalInfo: {
      speed: 0,
      status: '离线',
      gear: 'P',
      power: 10,
      batteryTemp: 22,
      lights: '关闭',
      horn: '关闭',
      signalStatus: '无'
    },
    plannedRoute: createRandomRouteMock(8),
    actualRoute: []
  },
  {
    id: 'car_10',
    plateNo: '粤X·99999',
    status: 'online',
    category: '无人安防车',
    type: '正式',
    enterprise: '华为自动驾驶',
    region: '禅城区',
    color: '#165DFF', // 深蓝
    securityInfo: {
      name: '陈十二',
      gender: '男',
      phone: '13800138010',
      unit: '禅城智慧园',
      licenseNo: '44060019961010XXXX',
      licenseExpiry: '2036-10-10'
    },
    terminalInfo: {
      speed: 30.5,
      status: '自动驾驶',
      gear: 'D',
      power: 100,
      batteryTemp: 29,
      lights: '开启',
      horn: '关闭',
      signalStatus: '强'
    },
    plannedRoute: createRandomRouteMock(8),
    actualRoute: []
  }
];

// 生成实际轨迹 (基于规划轨迹做轻微随机偏移，模拟行驶偏差)
carData.forEach(car => {
  if (car.plannedRoute && car.plannedRoute.length > 0) {
    car.actualRoute = car.plannedRoute.map(coord => {
      return [
        coord[0] + (Math.random() - 0.5) * 0.002,
        coord[1] + (Math.random() - 0.5) * 0.002
      ];
    });
  }
});

export { carData };

