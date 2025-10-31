import { api } from './apiClient'
export const getProfile = () => api.get('/profile')