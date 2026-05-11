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

// 构建树结构的函数
function buildTree(data, parentId = 'pid', chilId = 'id', otherOptions) {
  const map = {} // 存储所有节点的映射
  const result = [] // 用于存储最终的树结构

  // 创建一个映射，每个 id 对应一个对象
  data.forEach((item) => {
    map[item[chilId]] = { ...item, children: [] }
  })

  // 遍历数据并构建树结构
  data.forEach((item) => {
    if (item[parentId] === null || item[parentId] === 0) {
      // 根节点没有父节点，直接添加到结果数组
      result.push(map[item[chilId]])
    } else {
      // 非根节点，找到其父节点并添加到父节点的 children 中
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
 * 通用 JSON 转 Excel 导出函数
 * @param {Array} data 数组格式的 JSON 数据
 * @param {String} fileName 导出文件名（不用加 .xlsx）
 * @param {Object} headerMap 字段中文名映射（可选）
 * 
 * 示例：
 * exportToExcel(list, "区域数据", { companyName: "企业名称", status: "状态" })
 */
 function exportToExcel(data, fileName = "export", headerMap = {}) {
  if (!data || !data.length) {
    console.warn("导出数据为空");
    return;
  }

  // 1. 扁平化数据（自动处理深层对象）
  const flatData = data.map(item => flattenObject(item));

  // 2. 替换表头中文名
  const mappedData = flatData.map(item => {
    const newItem = {};
    Object.keys(item).forEach(key => {
      const newKey = headerMap[key] || key;
      newItem[newKey] = item[key];
    });
    return newItem;
  });

  // 3. 创建工作表
  const worksheet = XLSX.utils.json_to_sheet(mappedData);

  // 4. 创建工作簿
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // 5. 导出文件
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

/**
 * 扁平化嵌套对象（通用）
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
export { getQueryString, buildTree, exportToExcel }
