// src/api/apiClient.js

import axios from 'axios'

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8000',
    timeout: 5000,
})
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)