import { api } from './apiClient'
export const getLeaderboard = () => api.get('/leaderboard')