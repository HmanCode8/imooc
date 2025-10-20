<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElNotification } from 'element-plus';
// import { getResourceTree, getUserSecretKey } from '@/services/auth';
import { authApi } from '@/services/auth'

import { buildTree } from '@/utils';
import { mapInstanceManager } from '@/hooks/useMapInstance';
import { useMapServices } from "../hooks/useMapServices.js";
import _ from 'lodash';
// 使用地图实例管理类
// 注意：不要解构方法，保持 this 上下文

const { clientId, arcgisServerUrl } = window.global_config.system
const configMap = window.global_config.map || {}
let currentConfig = configMap[configMap.mapType]

const pipeRef = ref(null);
const treeProp = {
  value: 'layerid',
  label: 'layername',
  children: 'children',
};
const treeData = ref([]);
const loading = ref(false);
const defaultExpandedKeys = ref([]);
const defaultCheckedKeys = ref([]);
const userSecretKey = ref(null);
/**
 * 获取资源树
 */
const handleGetResourceTree = async () => {
  loading.value = true;
  try {
    const res = await authApi.getResourceTree({ syskey: 661 || clientId });
    if (res.ReturnCode === 0) {
      const { Data = [] } = res;
      if (Data.length === 0) {
        ElNotification({
          title: '提示',
          message: '当前用户没有任何数据服务',
          type: 'warning'
        });
        return;
      }
      const processedTreeData = _.map(Data, d => {
        return {
          ...d,
          layerid: d.id,
          layername: d.title,
          children: _.map(d.resourceAndLayers, c => {
            const { useMapproxy, areacode, resourceid, resourcetypeid, resourcealias, resourcename } = c.resourceByTree;
            const configMap = { useMapproxy, areacode, resourceid }
            return {
              ...c,
              ...configMap,
              layerid: resourcetypeid,
              layername: resourcealias || resourcename,
              children: _.map(buildTree(_.map(c.layerinfos, l => ({ ...l, layername: l.layeralias || l.layername })), 'parentlayerid', 'layerid', configMap), b => ({ ...b, ...configMap }))
            }
          })
        }
      });
      treeData.value = processedTreeData;
      // 设置默认展开的节点
      // setDefaultExpandedKeys(processedTreeData);
    } else {
      ElNotification({
        title: '错误',
        message: '获取资源树失败',
        type: 'error'
      });
    }
  } catch (error) {
    console.error('获取资源树异常:', error);
    ElNotification({
      title: '错误',
      message: '获取资源树异常',
      type: 'error'
    });
  } finally {
    loading.value = false;
  }
};


// 处理节点点击
const handleNodeClick = (data, node, nodeComponent) => {
};
const getUserSecretKeyFn = async () => {
  if (userSecretKey.value) {
    return userSecretKey.value
  }

  try {
    const res = await authApi.getUserSecretKey()
    if (res.ReturnCode === 0) {
      userSecretKey.value = res.Data
    } else {
      throw new Error('获取用户秘钥失败')
    }
  } catch (error) {
    console.error('获取用户秘钥异常:', error)
    throw error
  }
}
// 处理复选框变化
const { createArcGISLayer, createXmlWmtsLayer } = useMapServices()

const handleCheckChange = async () => {
  //处理目前到底选中了哪些服务，服务就是最内层的节点，没有children
  let checkedNodes = pipeRef.value.getCheckedNodes()
  let checkedServices = []
  checkedNodes.forEach(node => {
    if (node.children.length === 0) {
      checkedServices.push(node)
    }
  })

  const checkedMap = _.groupBy(checkedServices, 'resourceid')
  const checkedArr = []
  for (const key in checkedMap) {
    checkedArr.push({
      key: key,
      areacode: checkedMap[key][0].areacode,
      layerList: checkedMap[key],
      isProxy: checkedMap[key][0].useMapproxy === 1
    })
  }

  if (_.isEmpty(checkedArr)) {
    mapInstanceManager.clearPipeline()
  } else {
    _.forEach(checkedArr, async lay => {
      const layers = _.map(lay.layerList, d => d.sindex)
      const mapBaseIp = arcgisServerUrl + (lay.isProxy ? '/ResourceService' : '/MapService')
      const url = mapBaseIp + (lay.isProxy ? `/${lay.key}/${userSecretKey.value}/service${lay.key}/wmts` : `/${lay.key}/${userSecretKey.value}/export`)
      currentConfig.layer_config.url = url
      if (lay.isProxy) {
        currentConfig.layer_config.resourceid = lay.key
        currentConfig.layer_config.layers = layers
        currentConfig.layer_config.areacode = lay.areacode
      }
      if (lay.isProxy) {
        try {
          const layerResult = await createXmlWmtsLayer(currentConfig)
          // 修复：layerResult 返回的是 {layers: [], projection} 结构
          if (layerResult && layerResult.layers && Array.isArray(layerResult.layers)) {
            layerResult.layers.forEach((layer, index) => {
              mapInstanceManager.addPipeLayer(layer, {
                id: `pipe${lay.key}_${index}`,
                resourceid: `${lay.key}_${index}`,
                layerList: layers,
                nowSize: checkedServices.length,
              })
            })
          } else {
            console.error('WMTS图层创建失败: 返回结果格式不正确', layerResult)
          }
        } catch (error) {
          console.error('创建WMTS图层异常:', error)
        }

      } else {
        try {
          currentConfig.layer_config.layers = layers
          const layerResult = createArcGISLayer(currentConfig)
          if (layerResult && layerResult.layer) {
            mapInstanceManager.addPipeLayer(layerResult.layer, {
              id: `pipe${lay.key}`,
              resourceid: lay.key,
              layerList: layers,
              nowSize: checkedServices.length,
            })
          } else {
            console.error('ArcGIS图层创建失败: 返回结果格式不正确', layerResult)
          }
        } catch (error) {
          console.error('创建ArcGIS图层异常:', error)
        }
      }
    })
  }
  console.log('alllayers', mapInstanceManager.mapInstance.getAllLayers())
};

// 设置默认展开的节点
const setDefaultExpandedKeys = (data) => {
  const expandedKeys = [];

  // 递归收集需要展开的节点ID
  const collectExpandedKeys = (nodes, level = 0) => {
    nodes.forEach(node => {
      // 展开前两级节点
      if (level < 2) {
        expandedKeys.push(node.layerid);
      }
      if (node.children && node.children.length > 0) {
        collectExpandedKeys(node.children, level + 1);
      }
    });
  };

  collectExpandedKeys(data);
  defaultExpandedKeys.value = expandedKeys;
};

// 显示图层
const showLayer = (layerNode) => {

  if (mapInstanceManager.isMapReady()) {
    // 这里可以调用地图API显示图层
  } else {
    console.warn('地图实例未准备就绪，无法显示图层');
  }
};

// 隐藏图层
const hideLayer = (layerNode) => {

  if (mapInstanceManager.isMapReady()) {
  } else {
    console.warn('地图实例未准备就绪，无法隐藏图层');
  }
};

// 获取所有选中的节点
const getCheckedNodes = () => {

  if (pipeRef.value) {
    return pipeRef.value.getCheckedNodes();
  }
  return [];
};

// 获取半选中的节点
const getHalfCheckedNodes = () => {
  if (pipeRef.value) {
    return pipeRef.value.getHalfCheckedNodes();
  }
  return [];
};

// 设置选中的节点
const setCheckedNodes = (nodes, checked = true) => {
  if (pipeRef.value) {
    pipeRef.value.setCheckedNodes(nodes, checked);
  }
};


defineExpose({
  getCheckedNodes,
  getHalfCheckedNodes,
  setCheckedNodes,
  showLayer,
  hideLayer,
  testTreeData: () => {
    return {
      treeData: treeData.value,
      treeProp,
      defaultExpandedKeys: defaultExpandedKeys.value,
      defaultCheckedKeys: defaultCheckedKeys.value
    };
  }
});

onMounted(() => {
  // 获取资源树数据
  handleGetResourceTree();
  getUserSecretKeyFn();
});
</script>

<template>
  <div class="pipe-tree-container">
    <!-- 标题栏 -->
    <!-- <div class="tree-header">
      <div class="header-title">
        <div class="title-bar"></div>
        管线
      </div>
    </div> -->

    <!-- 树形结构 -->
    <div class="tree-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-text">正在加载资源树...</div>
      </div>

      <!-- 空数据状态 -->
      <div v-else-if="!treeData.length" class="empty-container">
        <div class="empty-text">暂无数据</div>
      </div>

      <!-- Element Plus 树组件 -->
      <el-tree v-else ref="pipeRef" :data="treeData" :props="treeProp" show-checkbox node-key="layerid"
        :default-expanded-keys="defaultExpandedKeys" :default-checked-keys="defaultCheckedKeys"
        @node-click="handleNodeClick" @check="handleCheckChange" class="custom-tree" />
    </div>
  </div>
</template>

<style scoped>
.pipe-tree-container {
  width: 300px;
  background: rgba(11, 29, 65, 0.8);
  overflow: hidden;
  font-family: 'Microsoft YaHei', sans-serif;
}

.tree-header {
  background: linear-gradient(135deg, #1a3a5c 0%, #2d5a87 100%);
  padding: 12px 16px;
  border-bottom: 1px solid #3a5a7a;
}

.header-title {
  display: flex;
  align-items: center;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
}

.title-bar {
  width: 4px;
  height: 20px;
  background: #75fbfd;
  margin-right: 12px;
  border-radius: 2px;
}

.tree-content {
  padding: 8px 0;
  max-height: 400px;
  overflow-y: auto;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.loading-text {
  color: #75fbfd;
  font-size: 14px;
  text-align: center;
}

.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
}

.empty-text {
  color: #999;
  font-size: 14px;
  text-align: center;
}


/* 滚动条样式 */
.tree-content::-webkit-scrollbar {
  width: 6px;
}

.tree-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.tree-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.tree-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* Element Plus 树组件自定义样式 */
:deep(.custom-tree) {
  background: transparent;
  color: #ffffff;
}

:deep(.custom-tree .el-tree-node__content) {
  background: transparent;
  color: #ffffff;
  border-radius: 4px;
  margin: 2px 0;
  transition: background-color 0.2s ease;
}

:deep(.custom-tree .el-tree-node__content:hover) {
  background: rgba(255, 255, 255, 0.1);
}

:deep(.custom-tree .el-tree-node__expand-icon) {
  color: #ffffff;
}

:deep(.custom-tree .el-tree-node__expand-icon.expanded) {
  color: #75fbfd;
}

:deep(.custom-tree .el-checkbox__input .el-checkbox__inner) {
  background: transparent;
  border-color: #75fbfd;
  border-radius: 3px;
}

:deep(.custom-tree .el-checkbox__input.is-checked .el-checkbox__inner) {
  background: #75fbfd;
  border-color: #75fbfd;
}

:deep(.custom-tree .el-checkbox__input.is-checked .el-checkbox__inner::after) {
  border-color: #000;
}

:deep(.custom-tree .el-tree-node__label) {
  color: #ffffff;
  font-size: 14px;
}

:deep(.custom-tree .el-tree-node__children) {
  padding-left: 20px;
}
</style>