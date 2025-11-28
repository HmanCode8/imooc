<template>
  <div class="z-20 text-[14px] bg-[url('@/assets/header-bg.png')] bg-cover bg-center shadow-xl h-16 w-full relative">
    <!-- 顶部装饰条 -->

    <div class="flex items-center justify-between px-2 h-12">
      <!-- 左侧：Logo和标题 -->
      <div class="flex items-center">
        <div class="flex items-center ">
          <!-- Logo图标 -->
          <div class="logo">

            <img src="@/assets/logo.png" alt="logo" class="w-10 h-10">
          </div>
          <!-- 标题区域 -->
          <div class="text-white ml-2">
            <div class="font-bold text-lg">
              {{ $t('header.title') }}
            </div>
            <p class="text-sm text-[#e6e6e6]">
              {{ $t('header.subtitle') }}
            </p>
          </div>
        </div>
      </div>

      <!-- 中间：导航菜单 -->
      <div class="flex items-center absolute left-1/2 transform -translate-x-1/2">
        <div v-for="m in routerMenus" :key="m.path"
          :class="`max-2 px-2 hover:cursor-pointer min-w-12 relative ${activeMenu === m.path ? 'border-b-1 border-white pb-1' : ''}`"
          @click="menuChange(m.path)">
          {{ $t(m.label) }}
          <div v-if="m.children && m.children.length > 0 && activeMenuChildren === m.path"
            class="absolute top-6 bg-[#1580DE] h-60 ">
            <div v-for="c in m.children" :key="c.path" class="p-2 hover:cursor-pointer"
              @click.stop="menuChange(c.path, true)">
              {{ $t(c.label) }}
            </div>
          </div>
        </div>

      </div>

      <!-- 右侧：语言切换和用户信息 -->
      <div class="flex items-center">
        <LanguageSwitcher />
        <div class="flex items-center gap-3 ">
          <el-icon class="text-lg">
            <User />
          </el-icon>
          <span class="font-semibold">{{ $t('user.admin') }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LanguageSwitcher from './LanguageSwitcher.vue'
import { useI18n } from 'vue-i18n';
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  activeMenu.value = router.currentRoute.value.path
})
const menuChange = (path, isChildren) => {
  isChildren ? activeMenuChildren.value = path : activeMenu.value = path
  router.push(path)
}
const { t } = useI18n()

const activeMenu = ref('/home')
const activeMenuChildren = ref('')
const routerMenus = ref([
  { path: '/home', label: 'header.home', icon: 'HomeFilled' },
  {
    path: '/statistical-analysis', label: 'header.analysis', icon: 'PieChart', children: [
      { path: '/statistical-analysis/analysis2', label: '统计value', icon: 'PieChart' },
      { path: '/statistical-analysis/analysis2', label: '统计value2', icon: 'PieChart' },
    ]
  },
  { path: '/custom-query', label: 'header.query', icon: 'Search' }
])
console.log('SystemHeader.vue', t('header.query'))

</script>

<!-- 响应式设计通过Tailwind CSS类实现 -->