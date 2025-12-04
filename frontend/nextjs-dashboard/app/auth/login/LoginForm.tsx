/// frontend/nextjs-dashboard/app/auth/login/LoginForm.tsx

'use client';

import React, { useState, useEffect } from 'react';
import api from '@/app/utils/axiosConfig'; // Импортируем настроенный Axios
import { usePathname, useSearchParams, useRouter } from 'next/navigation';  // Новый API навигации
import LoadingPage from '@/app/auth/login/loading';
import { useAuth } from '@/app/auth/contexts/auth-provider'; // Контекст аутентификации
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'; // 🔥 добавили иконки

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
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prevState) => !prevState);
  const { loginSuccess } = useAuth(); // Доступ к методу loginSuccess

  // Данные пользователя
  const [credentials, setCredentials] = useState<CredentialsType>({
    username: '',
    password: ''
  });

  // Индикатор загрузки
  const [loading, setLoading] = useState(false);

  // Сообщение об ошибке
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Хуки навигации
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();


  // Обработчик обновления токена
  const handleRefreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('Refresh token:', refreshToken); // Логирование
    if (refreshToken) {
      try {
        const response = await api.post('/api/refresh-token', { refresh_token: refreshToken });
        console.log('refreshToken 2: ', refreshToken)
        if (response.status === 200) {
          localStorage.setItem('authToken', response.data.access_token);
          setErrorMessage(null);
        } else {
          throw new Error('Ошибка обновления токена.');
        }
      } catch (error) {
        console.error('Ошибка обновления токена:', error);
        setErrorMessage('Ошибка обновления токена. Повторите попытку позже.');
      }
    }
  };

  // Обработчик смены значений полей
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCredentials((prevState) => ({ ...prevState, [name]: value }));
  };

  // Обработчик отправки формы
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/api/login', {
        username: credentials.username,
        password: credentials.password,
      });

      if (response.status === 200) {
        // ✅ Сохраняем ОБА токена
        const accessToken = response.data.access_token;
        const refreshToken = response.data.refresh_token;
        
        localStorage.setItem('authToken', response.data.access_token);
        localStorage.setItem('refreshToken', refreshToken);

        // ✅ Установка токена в axios defaults (один раз)
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;

        try {
          const userResponse = await api.get('/api/me/');

          console.log('✅ Успешно загружен /api/me/:', userResponse.data);

          loginSuccess(userResponse.data); // ✅ Передаём user
        } catch (err) {
          console.error('Не удалось загрузить профиль:', err);
          loginSuccess({
            id: 0,
            username: credentials.username,
            roles: [],
          });
        }

        sessionStorage.clear();
        router.push('/dashboard'); // ✅ Исправлено: не redirect
      }
    } catch (error: any) {
      // Убрано: console.error('Ошибка авторизации:', error.response.data);
      // Ошибка может быть до response
      console.error("Полная ошибка:", error); // * ВРЕМЕННО
      console.error("Ошибка авторизации:", error);

      let message = '';
      if (error.response) {
        console.error('Данные ошибки:', error.response.data);
        switch (error.response.status) {
          case 401:
            message = "Ошибка авторизации. Проверьте логин и пароль.";
            break;
          case 403:
            message = "Доступ запрещён.";
            break;
          case 500:
            message = "Сервис недоступен.";
            break;
          default:
            message = "Ошибка.";
        }
      } else {
        message = "Нет связи с сервером.";
        console.error('Ошибка:', error.message || error);
      }
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingPage />}
      {!loading && (
        <form onSubmit={handleSubmit} key="login-form" className="max-w-md mx-auto p-6 bg-amber-50 shadow-lg rounded-xl">
          <h2 className="text-2xl font-semibold mb-6 text-center text-cyan-950">Авторизация</h2>

          {/* Поле имени пользователя */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
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

          {/* Поле пароля */}
          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Пароль:
            </label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-stone-100 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-zinc-600"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="pt-7 cursor-pointer outline-none focus:outline-none"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
                )}
              </button>
            </div>
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
              onClick={() => router.push('/auth/register')} // Используем глобальную функцию redirect()
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
