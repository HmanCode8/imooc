import { defineStore } from "pinia";

export const useGlobalStore = defineStore("global", {
  state: () => ({
    map: null,
    themeVisible: false,
    themeName: "",
    themeColor: "",
    menuBarList: [],
    carList: [],
    activeTab: "menuBar", // 当前激活的顶部菜单/Tab
    selectedVehicleIds: [], // 轨迹分析页面选中的车辆 ID
    // 车辆面板相关
    detailsVisible: false,
    trajectoryVisible: false,
    selectedVehicle: null,
    selectedTrajectory: null, // 当前选中的日期对应的轨迹数据
    selectedDate: "2026-05-01", // 默认选中日期
    // 综合数据相关
    activeComprehensiveType: null, // 当前选中的综合数据类型 (route, area, parking, transition)
    comprehensiveDetailVisible: false, // 综合数据详情面板是否显示
    selectedComprehensiveItem: null, // 当前选中的综合数据要素
    lineAuditDetailVisible: false,
    selectedLineAuditItem: null,
    selectedLineAuditSegmentId: "",
    areaAuditDetailVisible: false,
    selectedAreaAuditItem: null,
    selectedAreaAuditSegmentId: "",
    parkingAuditDetailVisible: false,
    selectedParkingAuditItem: null,
    selectedParkingAuditSegmentId: "",
  }),
  actions: {
    setLineAuditDetailVisible(val) {
      this.lineAuditDetailVisible = val;
      if (val) {
        this.detailsVisible = false;
        this.trajectoryVisible = false;
        this.comprehensiveDetailVisible = false;
        this.areaAuditDetailVisible = false;
      }
    },
    setSelectedLineAuditItem(item) {
      this.selectedLineAuditItem = item;
    },
    setSelectedLineAuditSegmentId(id) {
      this.selectedLineAuditSegmentId = id || "";
    },
    setAreaAuditDetailVisible(val) {
      this.areaAuditDetailVisible = val;
      if (val) {
        this.detailsVisible = false;
        this.trajectoryVisible = false;
        this.comprehensiveDetailVisible = false;
        this.lineAuditDetailVisible = false;
      }
    },
    setSelectedAreaAuditItem(item) {
      this.selectedAreaAuditItem = item;
    },
    setSelectedAreaAuditSegmentId(id) {
      this.selectedAreaAuditSegmentId = id || "";
    },
    setParkingAuditDetailVisible(val) {
      this.parkingAuditDetailVisible = val;
      if (val) {
        this.detailsVisible = false;
        this.trajectoryVisible = false;
        this.comprehensiveDetailVisible = false;
        this.lineAuditDetailVisible = false;
        this.areaAuditDetailVisible = false;
      }
    },
    setSelectedParkingAuditItem(item) {
      this.selectedParkingAuditItem = item;
    },
    setSelectedParkingAuditSegmentId(id) {
      this.selectedParkingAuditSegmentId = id || "";
    },
    // 设置综合数据详情面板显示状态
    setComprehensiveDetailVisible(val) {
      this.comprehensiveDetailVisible = val;
      if (val) {
        this.detailsVisible = false;
        this.trajectoryVisible = false;
        this.lineAuditDetailVisible = false;
        this.areaAuditDetailVisible = false;
      }
    },
    // 设置选中的综合数据要素
    setSelectedComprehensiveItem(item) {
      this.selectedComprehensiveItem = item;
    },
    // 设置当前选中的综合数据类型
    setActiveComprehensiveType(type) {
      this.activeComprehensiveType = type;
    },
    // 设置选中日期
    setSelectedDate(date) {
      this.selectedDate = date;
      this.updateTrajectoryByDate();
    },
    // 根据日期更新当前轨迹数据
    updateTrajectoryByDate() {
      if (this.selectedVehicle && this.selectedVehicle.history) {
        this.selectedTrajectory =
          this.selectedVehicle.history[this.selectedDate] || null;
      }
    },
    // 设置详情面板显示状态
    setDetailsVisible(val) {
      this.detailsVisible = val;
      if (val) {
        this.trajectoryVisible = false;
        this.comprehensiveDetailVisible = false;
        this.lineAuditDetailVisible = false;
        this.areaAuditDetailVisible = false;
      }
    },
    // 设置轨迹面板显示状态
    setTrajectoryVisible(val) {
      this.trajectoryVisible = val;
      if (val) {
        this.detailsVisible = false;
        this.comprehensiveDetailVisible = false;
        this.lineAuditDetailVisible = false;
        this.areaAuditDetailVisible = false;
        this.updateTrajectoryByDate(); // 确保打开轨迹面板时数据是最新的
      }
    },
    // 设置选中的车辆详情数据
    setSelectedVehicle(vehicle) {
      this.selectedVehicle = vehicle;
      this.updateTrajectoryByDate();
    },
    // 设置地图实例
    setMapInstance(map) {
      this.map = map;
    },
    // 设置选中车辆 ID
    setSelectedVehicleIds(ids) {
      this.selectedVehicleIds = ids;
    },
    // 设置当前激活的 Tab
    setActiveTab(tab) {
      this.activeTab = tab;
    },
    //保存主题颜色
    setThemeColor(color) {
      console.log(color);
      this.themeColor = color;
    },
    // 设置主题面板显示状态
    setThemeVisible(val) {
      this.themeVisible = val;
    },
    // 设置主题名称
    setThemeName(name) {
      this.themeName = name;
    },
    // 激活子菜单
    setMenuBarList(data) {
      this.menuBarList = data;
    },
    // 设置车辆列表
    setCarList(data) {
      this.carList = data;
    },
  },
});
