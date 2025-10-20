// frontend/nextjs-dashboard/app/auth/login/LoginForm.tsx

'use client';

import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import axios from '@/app/utils/axiosConfig'; // Импортируем настроенный Axios
import { usePathname, useSearchParams, redirect } from 'next/navigation';  // Новый API навигации
import LoadingPage from '@/app/auth/login/loading';
import { useAuth } from '@/app/auth/contexts/auth-provider'; // Контекст аутентификации
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'; // 🔥 добавили иконки

//======================================================
// Настройка заголовка Authorization при монтировании компонента
// useEffect(() => {
//   const setAuthorizationHeader = () => {
//     const token = localStorage.getItem('authToken');
//     if (token) {
//       axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//     }
//   };
//   setAuthorizationHeader();
// }, []);
//======================================================

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

  // Проверяем существование токена при монтировании компонента
  useEffect(() => {
	const setAuthorizationHeader = () => {
	  const token = localStorage.getItem('authToken');
	  if (token) {
		axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; console.log(token)
	  }
	};
	setAuthorizationHeader();
  }, []);





  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prevState) => !prevState);

  const { loginSuccess } = useAuth(); // Доступ к методу loginSuccess

  // Данные пользователя
  const [credentials, setCredentials] = useState<CredentialsType>({ username: '', password: '' });

  // Индикатор загрузки
  const [loading, setLoading] = useState(false);

  // Сообщение об ошибке
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Хуки навигации
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Обработчик смены значений полей
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
	const { name, value } = event.target;
	setCredentials((prevState) => ({ ...prevState, [name]: value }));
  };

  // Обработчик отправки формы
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
	event.preventDefault(); // Предотвращаем стандартную отправку формы
	setLoading(true); // Активируем режим ожидания

	try {
	  const response = await axios.post('/api/login', credentials);

	  // if (response.status !== 200) {
	  //   throw new Error(`Сервер ответил с кодом статуса ${response.status}`);
	  // }

	  // // проверяем тело ответа
	  // if (!response.data.access_token) {
	  //   throw new Error('Не найден access token в ответе');
	  // }

	  // // Сохранение токен *****
	  // localStorage.setItem('authToken', response.data.access_token);
	  // loginSuccess();

	  // // Сохранение пути при переходе на страницу входа
	  // sessionStorage.setItem('redirectUrl', '/dashboard/timetable-user');

	  // const redirectUrl = sessionStorage.getItem('redirectUrl') || '/dashboard'; //
	  // console.log(redirectUrl)

	  // sessionStorage.clear();
	  // redirect(redirectUrl); ***************************************************

	  if (response.status === 200) {
		localStorage.setItem('authToken', response.data.access_token);
		// Установим заголовок Authorization при получении токена
		axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
		loginSuccess();
		// Перенаправление на dashboard
		sessionStorage.setItem('redirectUrl', '/dashboard/timetable-user');
		sessionStorage.clear();
	  }

	} catch (error: any & ApiError) {
	  console.error("Ошибка авторизации:", error);

	  // Устанавливаем сообщение об ошибке
	  let message = '';
	  if (error.response) {
		switch (error.response.status) {
		  case 401:
			message = "Ошибка авторизации. Проверьте логин и пароль.";
			break;
		  case 403:
			message = "Доступ запрещён. Ваш аккаунт может быть заблокирован.";
			break;
		  case 500:
			message = "Сервис временно недоступен. Повторите попытку позже.";
			break;
		  default:
			message = "Что-то пошло не так. Повторите попытку позже.";
		}
	  } else {
		message = "Нет соединения с сервером. Проверьте подключение и повторите попытку.";
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
		<form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-amber-50 shadow-lg rounded-xl">
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
			  onClick={() => redirect('/auth/register')} // Используем глобальную функцию redirect()
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
