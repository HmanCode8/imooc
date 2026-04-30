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
  }),
  actions: {
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
