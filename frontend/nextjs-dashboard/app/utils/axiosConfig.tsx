// frontend/nextjs-dashboard/app/utils/axiosConfig.tsx

import axios from 'axios';

// 🔁 Определяем baseURL динамически
const getBaseUrl = () => {
  // Если в браузере
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;

    // На продакшене — используй домен
    if (host === 'bathhouse-app.ru' || host === 'www.bathhouse-app.ru') {
      return 'https://bathhouse-app.ru';
    }

    // На локальной сети — используй IP компьютера
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return 'http://192.168.1.169:8000'; // ← ЗАМЕНИ НА СВОЙ IP!
    }
  }

  // По умолчанию — localhost
  return 'http://localhost:8000';
};

const baseURL = getBaseUrl();

const api = axios.create({
  baseURL,
  withCredentials: false, // ты не используешь сессии Django
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: any) => void; reject: (value: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// === Перехватчик запросов ===
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    const publicUrls = ['/api/login', '/api/register', '/api/get-csrf-token'];

    if (token && !publicUrls.some(path => config.url?.endsWith(path))) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    console.log('🔹 Request to:', config.baseURL + (config.url || ''), 'Auth:', !!token);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// === Перехватчик ответов ===
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        processQueue(error, null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${baseURL}/api/refresh-token`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = response.data.access_token;
        localStorage.setItem('authToken', newAccessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Вставка в файлы должна быть такая
// import api from '@/app/utils/axiosConfig';

// // ...

// src={`${api.defaults.baseURL}${worker.avatar}`}
