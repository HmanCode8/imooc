import { http } from '../utils/request'

export const carApi = {
  getCar: (data) => http.get('/aiCar/list', data),
  createCar: (data) => http.post('/aiCar', data),
  updateCar: (id, data) => http.put(`/aiCar/${id}`, data),
  deleteCar: (id) => http.delete(`/aiCar/${id}`),
}

export default {
  carApi
}
