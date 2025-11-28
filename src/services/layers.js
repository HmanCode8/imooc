import { http } from '../utils/request'

// 咨询相关API
export const statitcsApi = {
  geValves: () => http.get('/api/valves/all'),
}

export default {
  statitcsApi,
}
