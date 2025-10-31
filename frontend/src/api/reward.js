import { api } from './apiClient'
export const listRewards = () => api.get('/reward')