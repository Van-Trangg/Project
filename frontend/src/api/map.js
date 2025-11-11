import { api } from './apiClient'

export const listPlaces = () => api.get('/map/map/list')  

export const getPois = (mapId) => {
  return api.get(`/map/map/${mapId}/pois`)
}

export const getNearestMap = (lat, lng) =>
  api.get('/map/map/nearest', { params: { lat, lng } })

export const checkin = (payload) => api.post('map/map/checkin', payload)

export const confirmVehicle = (checkinId, vehicle) =>
  api.post(`map/map/checkin/${checkinId}/vehicle`, { vehicle_type: vehicle })

export const checked = (poi_id) => {
  return api.get(`map/map/poi/${poi_id}/checked`)
}