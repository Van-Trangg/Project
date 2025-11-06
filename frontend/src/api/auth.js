import { api } from './apiClient'
export const login = (data) => api.post('/auth/login', data)
export const register = (data) => api.post('/auth/register', data)
export const forgotPassword = (data) => api.post('/auth/forgot', data)
export const verifyReset = (data) => api.post('/auth/verify-reset', data)
export const setNewPassword = (data) => api.post('/auth/reset', data)