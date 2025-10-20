// frontend/nextjs-dashboard/app/lib/tokenRefresh.ts

import axios from 'axios'; // Import axios library
import { redirect } from 'next/navigation'; // New navigation redirection mechanism

async function refreshToken() {
  const oldToken = localStorage.getItem('authToken');

  try {
    const res = await axios.post('/api/token/refresh', { refresh_token: oldToken });

	// Сохранение токен
    localStorage.setItem('authToken', res.data.access_token);
  } catch (error) {
    console.error("Ошибка обновления токена:", error);
    localStorage.removeItem('authToken');
    redirect('/auth/login'); // Перенаправляем на страницу логина
  }
}

setInterval(refreshToken, 10 * 60 * 1000); // Каждые 10 минут обновляем токен
