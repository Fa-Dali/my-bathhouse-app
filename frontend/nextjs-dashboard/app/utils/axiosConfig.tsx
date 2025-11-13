// frontend/nextjs-dashboard/app/utils/axiosConfig.tsx

import axios from 'axios';
// import { NextRouter, useRouter } from 'next/navigation';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: false,
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

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    const publicUrls = ['/api/login', '/api/register', '/api/get-csrf-token'];

    if (token && !publicUrls.some(path => config.url?.endsWith(path))) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Перехватчик ответов: ловим 401 и обновляем токен
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Если уже обновляем — ставим в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).catch((err) => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        processQueue(error, null);
        localStorage.removeItem('authToken');
        window.location.href = '/auth/login'; // или router.push
        return Promise.reject(error);
      }

      try {
        // Запрашиваем новый access_token
        const response = await axios.post('http://localhost:8000/api/refresh-token', {
          refresh_token: refreshToken,
        });

        const newAccessToken = response.data.access_token;
        localStorage.setItem('authToken', newAccessToken);

        // Обновляем заголовок и повторяем запрос
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Очистка
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
