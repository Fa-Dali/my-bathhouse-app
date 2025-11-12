// frontend/nextjs-dashboard/app/utils/axiosConfig.ts

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// Перехватчик запросов — работает только в браузере
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
