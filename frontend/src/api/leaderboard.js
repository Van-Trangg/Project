import { api } from './apiClient'
export const getLeaderboard = () => api.get('/leaderboard')

export const getMyRank = () => api.get('/leaderboard/my')