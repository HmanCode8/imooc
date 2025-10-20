<template>
  <div class="cesium-map-container">
    <div id="cesiumContainer" class="w-full h-full"></div>
  </div>
</template>

<script setup>
import * as Cesium from 'cesium'
import { ref, onMounted, onUnmounted } from 'vue'

const viewer = ref(null)

const initCesiumViewer = () => {
  try {
    // 设置 Cesium 静态资源路径
    window.CESIUM_BASE_URL = '/cesium/'

    // 创建 Cesium 查看器 - 使用最简单的配置
    viewer.value = new Cesium.Viewer('cesiumContainer', {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false
    })

    // 设置相机位置
    const camera = viewer.value.camera
    camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(116.391, 39.907, 1000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-10),
        roll: 0.0
      }
    })

    // 确保地球可见
    viewer.value.scene.globe.enableLighting = false
    viewer.value.scene.globe.showGroundAtmosphere = true

    // 设置背景色为黑色
    viewer.value.scene.backgroundColor = Cesium.Color.GREEN

    // 添加一个测试点
    viewer.value.entities.add({
      position: Cesium.Cartesian3.fromDegrees(116.391, 39.907, 100),
      point: {
        pixelSize: 20,
        color: Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2
      },
      label: {
        text: '北京天安门12',
        font: '14pt sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        pixelOffset: new Cesium.Cartesian2(0, -40)
      }
    })

    // 强制调整尺寸
    setTimeout(() => {
      if (viewer.value) {
        viewer.value.resize()
        console.log('Cesium 查看器尺寸已调整')
      }
    }, 200)

    console.log('Cesium 查看器初始化完成')

  } catch (error) {
    console.error('Cesium 查看器初始化失败:', error)
  }
}

onMounted(() => {
  setTimeout(() => {
    initCesiumViewer()
  }, 300)
})

onUnmounted(() => {
  if (viewer.value) {
    viewer.value.destroy()
    viewer.value = null
  }
})

defineExpose({
  viewer: () => viewer.value
})
</script>

<style scoped>
.cesium-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

:deep(.cesium-viewer) {
  width: 100% !important;
  height: 100% !important;
}

:deep(.cesium-viewer canvas) {
  width: 100% !important;
  height: 100% !important;
}

:deep(.cesium-viewer-bottom) {
  display: none !important;
}

:deep(.cesium-viewer-toolbar) {
  display: none !important;
}

:deep(.cesium-viewer-cesiumInspectorContainer) {
  display: none !important;
}

:deep(.cesium-viewer-geocoderContainer) {
  display: none !important;
}

:deep(.cesium-viewer-homeButtonContainer) {
  display: none !important;
}

:deep(.cesium-viewer-sceneModePickerContainer) {
  display: none !important;
}

:deep(.cesium-viewer-baseLayerPickerContainer) {
  display: none !important;
}

:deep(.cesium-viewer-navigationHelpButtonContainer) {
  display: none !important;
}

:deep(.cesium-viewer-animationContainer) {
  display: none !important;
}

:deep(.cesium-viewer-timelineContainer) {
  display: none !important;
}

:deep(.cesium-viewer-fullscreenContainer) {
  display: none !important;
}
</style>
