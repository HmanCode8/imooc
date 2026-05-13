import _ from 'lodash'
import * as XLSX from 'xlsx';

function getQueryString(key) {
  const href = window.location.href
  const reg = new RegExp(key + '=([^&^#]+)')
  const march = reg.exec(href)
  if (march != null) {
    const value = march[1]
    return value
  }
  return ''
}

// 构建树结构
function buildTree(data, parentId = 'pid', chilId = 'id', otherOptions) {
  const map = {}
  const result = []

  data.forEach((item) => {
    map[item[chilId]] = { ...item, children: [] }
  })

  data.forEach((item) => {
    if (item[parentId] === null || item[parentId] === 0) {
      result.push(map[item[chilId]])
    } else {
      if (map[item[parentId]]) {
        _.isEmpty(otherOptions)
          ? map[item[parentId]].children.push(map[item[chilId]])
          : map[item[parentId]].children.push({ ...map[item[chilId]], ...otherOptions })
      }
    }
  })

  return result
}

/**
 * 导出 Excel
 */
function exportToExcel(data, fileName = "export", headerMap = {}) {
  if (!data || !data.length) {
    console.warn("导出数据为空");
    return;
  }

  const flatData = data.map(item => flattenObject(item));

  const mappedData = flatData.map(item => {
    const newItem = {};
    Object.keys(item).forEach(key => {
      const newKey = headerMap[key] || key;
      newItem[newKey] = item[key];
    });
    return newItem;
  });

  const worksheet = XLSX.utils.json_to_sheet(mappedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

/**
 * 扁平化对象
 */
function flattenObject(obj, parentKey = "", result = {}) {
  for (const key in obj) {
    const value = obj[key];
    const newKey = parentKey ? `${parentKey}.${key}` : key;

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      flattenObject(value, newKey, result);
    } else {
      result[newKey] = typeof value === "object" ? JSON.stringify(value) : value;
    }
  }
  return result;
}

/**
 * 【前端版】读取 public/download/line_audit_rows_v1.xlsx
 */
async function readLocalExcelToJson(options = {}) {
  const {
    headerMap = {},
    sheetName,
    keepEmptyRows = false,
    dateNF = 'yyyy-mm-dd',
    unflatten = false
  } = options;

  try {
    // 浏览器只能用 fetch 读取 public 下的文件
    const res = await fetch('/download/line_audit_rows_v1.xlsx')
    const arrayBuffer = await res.arrayBuffer()

    const workbook = XLSX.read(arrayBuffer, {
      type: 'array',
      cellDates: true,
      dateNF
    })

    let targetSheet = sheetName || workbook.SheetNames[0]
    const ws = workbook.Sheets[targetSheet]
    const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false })

    if (!jsonData.length) return []

    const headerRow = jsonData[0]
    let dataRows = jsonData.slice(1)

    if (!keepEmptyRows) {
      dataRows = dataRows.filter(row => row.some(c => c != null && c !== ''))
    }

    const result = dataRows.map(row => {
      const item = {}
      headerRow.forEach((key, i) => {
        if (!key) return
        const finalKey = headerMap[key] || key
        item[finalKey] = row[i] ?? null
      })
      return unflatten ? unflattenObject(item) : item
    })

    return result
  } catch (err) {
    console.error('Excel读取失败：', err)
    throw err
  }
}

/**
 * 反向扁平化
 */
function unflattenObject(obj) {
  const result = {}
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue
    const val = obj[key]
    const keys = key.split('.')
    let curr = result
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]
      if (!curr[k] || typeof curr[k] !== 'object') curr[k] = {}
      curr = curr[k]
    }
    curr[keys.at(-1)] = val
  }
  return result
}

export { getQueryString, buildTree, exportToExcel, readLocalExcelToJson }