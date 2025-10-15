// frontend/nextjs-dashboard/app/dashboard/login.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { usePathname, useSearchParams, redirect } from 'next/navigation';  // Импорт необходимых хуков
import LoadingPage from './loading';

type ApiError = {
  response?: {
    data: {
      detail: string;
    };
  };
};

const LoginForm = () => {
  // Управление вводом пользователя
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  // Индикатор загрузки
  const [loading, setLoading] = useState(false);
  // Хранение сообщения об ошибке
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCredentials((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Отмена стандартной отправки формы
    setLoading(true); // Включаем индикатор загрузки

    // type AuthResponse = {
    //   access_token: string;
    // };

    try {
      // Запрашиваем авторизацию
      const response = await axios.post('/api/login/', credentials);
      // Сохраняем токен
      localStorage.setItem('authToken', response.data.access_token);
      // Переходим на dashboard
      redirect('/dashboard');
    } catch (error: any & ApiError) {

      console.error('frontend/nextjs-dashboard/app/dashboard/login.tsx (49): Ошибка:', error);

      // Начало логирования
      console.log('frontend/nextjs-dashboard/app/dashboard/login.tsx (50): Получил ответ:', error.response);
      console.log('frontend/nextjs-dashboard/app/dashboard/login.tsx (52): Сообщение об ошибке:', error.response.data.detail);

      if (error.response && error.response.data.detail === 'object') {
        // Показываем детальное сообщение от сервера
        setErrorMessage(error.response.data.detail || 'Ошибка входа.');
      } else if (typeof error.response === 'string') {
        setErrorMessage(error.response);
      } else {
        // Устанавливаем сообщение об ошибке
        // setErrorMessage('Ошибка входа');
        setErrorMessage("Ошибка входа. Проверьте правильность введённых данных.");
      }
    } finally {
      setLoading(false); // Выключаем индикатор загрузки
    }
  };

  return (
    <>
      {loading && (<LoadingPage />)}
      {!loading && (
        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Имя пользователя:</label><br/>
          <input id="username" type="text" name="username" value={credentials.username} onChange={handleChange}/><br/><br/>

          <label htmlFor="password">Пароль:</label><br/>
          <input id="password" type="password" name="password" value={credentials.password} onChange={handleChange}/><br/><br/>

          <button type="submit">{loading ? 'Подождите...' : 'Войти'}</button>
          {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        </form>
      )}
    </>
  );
};

export default LoginForm;
