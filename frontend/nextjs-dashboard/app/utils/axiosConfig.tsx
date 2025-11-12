// src/lib/axiosConfig.ts или app/lib/axiosConfig.ts

import axios from 'axios';

// Создаём экземпляр axios
const api = axios.create({
  baseURL: 'http://localhost:8000', // Бэкенд
  withCredentials: false, // JWT передаётся через заголовок Authorization
});

// Перехватчик запросов: добавляем токен, если он есть и URL не /login, /register
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');

    // Список путей, куда НЕ нужно добавлять Authorization
    const publicUrls = ['/api/login', '/api/register', '/api/get-csrf-token'];

    // Если токен есть и URL не в списке публичных — добавляем заголовок
    if (token && !publicUrls.some(path => config.url?.endsWith(path))) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  (error) => {
    // Обработка ошибок запроса (редко используется)
    return Promise.reject(error);
  }
);

export default api;
