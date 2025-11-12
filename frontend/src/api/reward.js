import { api } from './apiClient'

export const listRewards = () => api.get('/reward')

// User-specific listing: returns { eco_points, rewards: [{id,badge,threshold,unlocked}] }
export const listRewardsForUser = () => api.get('/reward/me')