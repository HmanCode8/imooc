import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    map:null,
    themeVisible: false,
    themeName: '',
    themeColor: '',
    menuBarList: [],
    activeTab: 'menuBar', // 当前激活的顶部菜单/Tab
    selectedVehicleIds: [], // 轨迹分析页面选中的车辆 ID
    // 车辆面板相关
    detailsVisible: false,
    trajectoryVisible: false,
    selectedVehicle: null,
  }),
  actions: {
    // 设置详情面板显示状态
    setDetailsVisible(val) {
      this.detailsVisible = val
      if (val) this.trajectoryVisible = false
    },
    // 设置轨迹面板显示状态
    setTrajectoryVisible(val) {
      this.trajectoryVisible = val
      if (val) this.detailsVisible = false
    },
    // 设置选中的车辆详情数据
    setSelectedVehicle(vehicle) {
      this.selectedVehicle = vehicle
    },
    // 设置地图实例
    setMapInstance(map) {
      this.map = map
    },
    // 设置选中车辆 ID
    setSelectedVehicleIds(ids) {
      this.selectedVehicleIds = ids
    },
    // 设置当前激活的 Tab
    setActiveTab(tab) {
      this.activeTab = tab
    },
    //保存主题颜色
    setThemeColor(color) {
      console.log(color)
      this.themeColor = color
    },
    // 设置主题面板显示状态
    setThemeVisible(val) {
      this.themeVisible = val
    },
    // 设置主题名称
    setThemeName(name) {
      this.themeName = name
    },
    // 激活子菜单
    setMenuBarList(data) {
      this.menuBarList = data
    },
  },
})
