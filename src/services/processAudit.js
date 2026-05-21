import { http } from '../utils/request'

// 咨询相关API
export const processAuditApi = {
  //新增面审核
  addAreaAudit: (data) => {
    return http.post('/processAudit/area/save', data)
  },
  //查询面审核
  getAreaAudit: (data) => {
    return http.get('/processAudit/area/query', data)
  },
  //审核面
  auditAreaAudit: (data) => {
    return http.post('/processAudit/area/audit', data)
  },
  //删除面审核
  deleteAreaAudit: (data) => {
    return http.post('/processAudit/area/delete', data)
  },
  //新增线审核
  addLineAudit: (data) => {
    return http.post('/processAudit/line/save', data)
  },
  //查询线审核
  getLineAudit: (data) => {
    return http.get('/processAudit/line/query', data)
  },
  //审核线
  auditLineAudit: (data) => {
    return http.post('/processAudit/line/audit', data)
  },
  //删除线审核
  deleteLineAudit: (data) => {
    return http.post('/processAudit/line/delete', data)
  },
  //新增点审核
  addPointAudit: (data) => {
    return http.post('/processAudit/point/save', data)
  },
  //查询点审核
  getPointAudit: (data) => {
    return http.get('/processAudit/point/query', data)
  },
  //审核点
  auditPointAudit: (data) => {
    return http.post('/processAudit/point/audit', data)
  },
  //删除点审核
  deletePointAudit: (data) => {
    return http.post('/processAudit/point/delete', data)
  },
}

export default {
  processAuditApi
}
