<script setup lang="ts">
import { ref } from 'vue'
import { TAB_CONFIG } from './tabs/index.js'

const activeTab = ref('pipeOverview')

const emits = defineEmits(['changeTab'])
const changeTab = (tab) => {
  activeTab.value = tab.value
  emits('changeTab', tab.value)
}

const tabs = ref(TAB_CONFIG)

</script>

<template>
  <div class="flex justify-center items-center">
    <div
      class="flex items-center gap-2 bg-blue-900/20 backdrop-blur-sm rounded-2xl p-2 border border-blue-500/20 shadow-lg">
      <div v-for="tab in tabs" :key="tab.value" @click="changeTab(tab)" :class="[
        'tab-item px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 text-sm font-medium whitespace-nowrap',
        'fhd:px-3 fhd:py-1.5 fhd:text-xs',
        '4k:px-5 4k:py-3 4k:text-base',
        'ultra:px-6 ultra:py-4 ultra:text-lg',
        activeTab === tab.value
          ? 'bg-blue-500 text-white shadow-lg'
          : 'text-blue-200 hover:text-white hover:bg-blue-500/30'
      ]">
        {{ tab.label }}
      </div>
    </div>
  </div>
</template>

<style scoped></style>