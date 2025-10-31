import { api } from './apiClient'
export const listPlaces = () => api.get('/map')