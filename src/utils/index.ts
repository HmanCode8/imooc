import _ from 'lodash'
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
  const map: any = {} // 存储所有节点的映射
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
export { getQueryString, buildTree }
