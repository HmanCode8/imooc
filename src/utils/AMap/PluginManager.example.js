/**
 * PluginManager 使用示例
 *
 * 这个文件展示了如何在组件中使用 PluginManager 来管理高德地图插件
 */

// ========== 示例 1: 在 Vue 组件中使用 ==========
/*
import { onMounted, ref } from 'vue'
import AMapManager from '@/utils/AMap/AmapManager'

export default {
  setup() {
    const amapManager = ref(null)
    const pluginManager = ref(null)

    onMounted(async () => {
      // 初始化地图
      amapManager.value = new AMapManager()
      const map = await amapManager.value.initMap('mapContainer', {
        zoom: 15,
        center: [116.397428, 39.90923]
      })

      // 获取插件管理器
      pluginManager.value = amapManager.value.getPluginManager()

      // 使用地点搜索插件
      const placeSearch = await pluginManager.value.usePlaceSearch({
        city: '北京',
        pageSize: 10,
        autoFitView: true
      })

      // 搜索地点
      placeSearch.search('天安门', (status, result) => {
        if (status === 'complete' && result.info === 'OK') {
          console.log('搜索结果:', result.poiList.pois)
        }
      })

      // 使用驾车路线规划
      const driving = await pluginManager.value.useDriving({
        map: map,
        panel: 'route-panel',
        showTraffic: true
      })

      // 规划路线
      driving.search([
        { keyword: '天安门', city: '北京' },
        { keyword: '故宫', city: '北京' }
      ], (status, result) => {
        if (status === 'complete') {
          console.log('路线规划结果:', result)
        }
      })
    })
  }
}
*/

// ========== 示例 2: 使用定位插件 ==========
/*
async function getCurrentLocation() {
  const pluginManager = amapManager.getPluginManager()
  
  const geolocation = await pluginManager.useGeolocation({
    enableHighAccuracy: true,
    timeout: 10000,
    showButton: true,
    buttonDom: 'location-button',
    panToLocation: true
  })

  geolocation.getCurrentPosition((status, result) => {
    if (status === 'complete') {
      console.log('定位成功:', result.position)
    } else {
      console.log('定位失败:', result.message)
    }
  })
}
*/

// ========== 示例 3: 使用公交路线规划 ==========
/*
async function planBusRoute() {
  const pluginManager = amapManager.getPluginManager()
  
  const transfer = await pluginManager.useTransfer({
    map: map,
    panel: 'bus-route-panel',
    city: '北京'
  })

  transfer.search([
    { keyword: '天安门', city: '北京' },
    { keyword: '颐和园', city: '北京' }
  ], (status, result) => {
    if (status === 'complete') {
      console.log('公交路线:', result)
    }
  })
}
*/

// ========== 示例 4: 使用输入提示 ==========
/*
async function setupAutoComplete() {
  const pluginManager = amapManager.getPluginManager()
  
  const autoComplete = await pluginManager.useAutoComplete({
    city: '北京',
    citylimit: true
  })

  // 监听输入框变化
  inputElement.addEventListener('input', (e) => {
    autoComplete.search(e.target.value, (status, result) => {
      if (status === 'complete') {
        console.log('提示结果:', result.tips)
      }
    })
  })
}
*/

// ========== 示例 5: 使用鼠标工具绘制 ==========
/*
async function enableDrawing() {
  const pluginManager = amapManager.getPluginManager()
  
  const mouseTool = await pluginManager.useMouseTool({
    map: map
  })

  // 绘制标记点
  mouseTool.marker({
    icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
    position: [116.397428, 39.90923]
  })

  // 绘制折线
  mouseTool.polyline({
    path: [
      [116.368904, 39.913423],
      [116.382122, 39.901176],
      [116.387271, 39.922501]
    ],
    strokeColor: '#3366FF',
    strokeWeight: 6
  })

  // 绘制多边形
  mouseTool.polygon({
    path: [
      [116.368904, 39.913423],
      [116.382122, 39.901176],
      [116.387271, 39.922501],
      [116.368904, 39.913423]
    ],
    fillColor: '#1791fc',
    fillOpacity: 0.25
  })
}
*/

// ========== 示例 6: 使用测距工具 ==========
/*
async function enableRanging() {
  const pluginManager = amapManager.getPluginManager()
  
  const rangingTool = await pluginManager.useRangingTool({
    map: map
  })

  // 开始测距
  rangingTool.turnOn()

  // 监听测距完成事件
  rangingTool.on('end', (e) => {
    console.log('测距结果:', e.distance)
    rangingTool.turnOff()
  })
}
*/

// ========== 示例 7: 获取已存在的插件实例 ==========
/*
// 如果插件已经创建，可以直接获取
const driving = pluginManager.get('Driving')
if (driving) {
  // 使用已存在的实例
  driving.search([...])
}
*/

// ========== 示例 8: 移除插件 ==========
/*
// 移除单个插件
pluginManager.remove('Driving')

// 清除所有插件
pluginManager.clear()
*/

// ========== 示例 9: 使用通用方法 ==========
/*
// 使用通用 use 方法创建任意插件
const customPlugin = await pluginManager.use('PlaceSearch', {
  city: '北京',
  pageSize: 20
})

// 强制创建新实例（不复用已存在的）
const newPlugin = await pluginManager.use('Driving', {}, true)
*/
