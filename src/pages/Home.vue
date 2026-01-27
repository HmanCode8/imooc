<script setup>
import { ref, defineProps, watch, onMounted } from 'vue';
import { mapApi } from '@/services/map.js'
import { createPointLayer } from '../utils/OLMap/createLayer'
import _ from 'lodash'
const searchText = ref('');
const places = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(30)
const tk = window.global_config.map.tiandituTK

onMounted(() => {

})
const getPlace = async () => {
  try {
    const res = await mapApi.getNearbyPlace({
      postStr: JSON.stringify({
        keyWord: searchText.value,
        queryRadius: 5000,
        pointLonlat: window.global_config.map.center.join(','),
        queryType: 3,
        start: page.value,
        count: pageSize.value,
        show: 2
      }),
      tk: tk
    })
    total.value = res?.count || 0
    places.value = res?.pois || []
    console.log(window.olMap, 'mapManager.getMap()')
  } catch (error) {
    console.log(error)
  }

}
watch(searchText, (val) => {
  if (_.isEmpty(val)) {
    places.value = []
    total.value = 0
    return
  }
  getPlace()
})
watch(page, getPlace)


const handleClick = (item) => {
  console.log(item, '0000')
  const point = [Number(item.lonlat.split(',')[0]), Number(item.lonlat.split(',')[1])]
  const pointLayer = createPointLayer({
    geometry: point,
    label: item.name,
  })
}
</script>

<template>
  <div class="absolute top-10 left-10 z-20 text-black w-1/6 rounded-md  shadow-2xl ">
    <div class="header">
      <el-input placeholder="请输入搜索内容" v-model="searchText" clearable></el-input>
    </div>
    <div v-if="places.length > 0" class="  bg-white h-96 mt-2 overflow-y-scroll shadow-2xl p-2">
      <div v-for="item in places" :key="item" class="p-2 hover: cursor-pointer hover:bg-gray-100"
        @click="handleClick(item)">
        <div class="font-bold">{{ item.name }}</div>
        <div class="text-sm text-gray-500">{{ item.address }}</div>
      </div>

    </div>
    <div v-if="places.length > 0" class="bg-white flex items-center justify-center w-full">
      <el-pagination background layout="prev, pager, next" :pager-count="5" :total="total" size="small"
        :page-size="pageSize" v-model:current-page="page" />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>