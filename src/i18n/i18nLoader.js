import * as XLSX from 'xlsx'

export async function loadI18nFromExcel(filePath) {
  const res = await fetch(filePath)
  const arrayBuffer = await res.arrayBuffer()
  const workbook = XLSX.read(arrayBuffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json(sheet)

  const zhCN = {}
  const en = {}

  rows.forEach((row) => {
    const path = row['keyPath']
    const zhValue = row['zh-CN']
    const enValue = row['en']

    setNestedValue(zhCN, path, zhValue)
    setNestedValue(en, path, enValue)
  })

  return { zhCN, en }
}

// 工具函数：根据 "a.b.c" 设置嵌套对象值
function setNestedValue(obj, path, value) {
  const keys = path.split('.')
  let current = obj
  keys.forEach((key, i) => {
    if (!current[key]) {
      current[key] = i === keys.length - 1 ? value : {}
    } else if (i === keys.length - 1) {
      current[key] = value
    }
    current = current[key]
  })
}
