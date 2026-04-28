import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => ({
    themeVisible: false,
    themeName: '',
    themeColor: '',
    menuBarList: [],
  }),
  actions: {
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
