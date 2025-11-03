import { api } from './apiClient'

export const getProfile = () => api.get('/profile')

// Attempt to update profile on backend (if supported). Returns a promise.
export const updateProfile = (data) => api.put('/profile', data)