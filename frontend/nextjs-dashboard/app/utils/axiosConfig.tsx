// frontend/nextjs-dashboard/app/utils/axiosConfig.ts

import axios from 'axios';

let axiosInstance = axios.create();

// Функция для настройки заголовка Authorization
const setAuthorizationHeader = () => {
  const token = localStorage.getItem('authToken');
  console.log('token из axiosConfig: ', token);
  
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

export default axiosInstance;
