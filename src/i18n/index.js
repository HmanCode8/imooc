import { createI18n } from 'vue-i18n'
import * as chineseConv from 'chinese-conv'
import { loadI18nFromExcel } from './i18nLoader'

const { tify } = chineseConv

// ✅ 定义异步加载函数
export async function setupI18n() {
  // 1️⃣ 从 Excel 加载多语言内容
  const { zhCN, en } = await loadI18nFromExcel('./i18n-config.xlsx')
  console.log('中文配置:', zhCN)
  console.log('英文配置:', en)

  // 2️⃣ 加载后再转繁体
  const zhTW = convertToTraditional(zhCN)

  // 3️⃣ 创建 i18n 实例
  const i18n = createI18n({
    legacy: false,
    locale: 'zh-CN',
    fallbackLocale: 'en',
    messages: {
      'zh-CN': zhCN,
      'zh-TW': zhTW,
      en,
    },
  })

  return i18n
}

// ✅ 转繁体逻辑
function convertToTraditional(obj) {
  const result = {}
  for (const key in obj) {
    const value = obj[key]
    if (typeof value === 'string') {
      result[key] = tify(value)
    } else if (typeof value === 'object' && value !== null) {
      result[key] = convertToTraditional(value)
    } else {
      result[key] = value
    }
  }
  return result
}
