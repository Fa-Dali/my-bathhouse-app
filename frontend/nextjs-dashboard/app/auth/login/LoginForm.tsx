// frontend/nextjs-dashboard/app/auth/login/LoginForm.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { usePathname, useSearchParams, redirect } from 'next/navigation';  // Импорт необходимых хуков
import LoadingPage from '@/app/auth/login/loading';

type CredentialsType = {
  username: string;
  password: string;
};

type ApiError = {
  response?: {
    data: {
      detail: string;
    };
  };
};

const LoginForm = () => {
  // Управление вводом пользователя
  // Хранит введённые пользователем имя пользователя и пароль. Изначально оба поля пусты.
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  // Индикатор загрузки
  const [loading, setLoading] = useState(false);

  // Сообщение об ошибке: если возникла проблема при авторизации.
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Обработка изменения полей ввода
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCredentials(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Отправка формы При нажатии кнопки "Вход":
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Отмена стандартной отправки формы
    setLoading(true); // Включаем индикатор загрузки

    try {
      const response = await axios.post('/api/login/', credentials);
      console.log(response); // Полный ответ сервера

      // Сохраняем токен
      localStorage.setItem('authToken', response.data.access_token);
      
      // 🔥 Используем глобальный хук для навигации
      redirect('/dashboard');

    } catch (error: any & ApiError) {
      let errorMessage = '';

      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else {
        errorMessage = "Ошибка входа. Проверьте правильность введённых данных.";
      }

      setErrorMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && (<LoadingPage />)}
      {!loading && (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-amber-50 shadow-lg rounded-xl">
          {/* Заголовок */}
          <h2 className="text-2xl font-semibold mb-6 text-center text-cyan-950">Авторизация</h2>

          {/* Имя пользователя */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Имя пользователя:
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-stone-100 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-zinc-600"
            />
          </div>

          {/* Пароль */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Пароль:
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-stone-100 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-zinc-600"
            />

          </div>

          {/* Кнопки */}
          <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={loading}
              className={`bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Подождите...' : 'Войти'}
            </button>

            <button
              type="button"
              onClick={() => redirect('/auth/register')}
              disabled={loading}
              className={`bg-slate-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Подождите...' : 'Регистрация'}
            </button>
          </div>

          {/* Сообщение об ошибке */}
          {errorMessage && (
            <p className="mt-4 text-red-900 text-center">{errorMessage}</p>
          )}
        </form>
      )}
    </>
  );
};

export default LoginForm;
