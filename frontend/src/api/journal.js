import { api } from './apiClient'
export const listJournals = () => api.get('/journal')