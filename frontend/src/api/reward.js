import { api } from './apiClient'



export const listBadges = () => api.get('/api/badges') 
export const listBadgesForUser = () => api.get('/api/badges/me') 


export const listRewards = () => api.get('/reward')