// src/api/apiClient.js

import axios from 'axios'
export const baseURL = 'http://localhost:8000'
export const api = axios.create({
    baseURL: baseURL,
    timeout: 8000,
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