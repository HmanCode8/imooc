<template>
  <div class="mx-2">
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="lang in languages" @click="handleLanguageChange(lang.value)" :key="lang.value">
        <div :class="`hover:cursor-pointer ${locale === lang.value ? 'text-white' : ''}`"> {{ lang.label }}
        </div>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const languages = [
  { value: 'zh-CN', label: '简' },
  { value: 'zh-TW', label: '繁' },
  { value: 'en', label: 'En' }
]

const handleLanguageChange = (lang) => {
  locale.value = lang
  // 保存到本地存储
  localStorage.setItem('preferred-language', lang)

  // 触发地图内容更新
  setTimeout(() => {
    const event = new CustomEvent('languageChanged', { detail: { locale: lang } })
    window.dispatchEvent(event)
  }, 100)
}
</script>