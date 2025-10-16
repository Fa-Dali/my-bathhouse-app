// frontend/nextjs-dashboard/app/auth/register/RegisterForm.tsx
'use client';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline"; // Подключение нужных иконок
import { useState } from 'react';
import axios from 'axios';
import { usePathname, useSearchParams, redirect } from 'next/navigation';  // Импорт необходимых хуков
import LoadingPage from '@/app/auth/login/loading';

import { useForm } from 'react-hook-form';

type RegisterFormInputs = {
	username: string;
	first_name: string;
	last_name: string;
	phone_number: string;
	email: string;
	password: string;
	confirm_password: string;
	pin_code: string;
};

const RegisterForm = () => {
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<RegisterFormInputs>();

	const [showPassword, setShowPassword] = useState(false); // Новое состояние для контроля видимости пароля

	const togglePasswordVisibility = () => {
		setShowPassword((prevState) => !prevState); // Переключатель состояния
	};

	const onSubmit = async (data: RegisterFormInputs) => {
		try {
			const res = await fetch('/api/register/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			});

			if (res.ok) {
				alert('Вы успешно зарегистрировались');
			} else {
				const result = await res.json();
				alert(result.detail || 'Ошибка регистрации');
			}
		} catch (err) {
			console.error(err);
			alert('Возникла ошибка при регистрации.');
		}
	};
	// h-48 max-h-full md:max-h-screen
	return (

		<form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-6 bg-amber-50 shadow-2xl rounded-xl">
			<div className="w-md h-[500px] overflow-y-auto beautiful-scroll">
				<h2 className="text-2xl font-semibold mb-6 text-center text-cyan-950">Регистрация</h2>

				<div className="mb-4">
					<label
						htmlFor="username"
						className="block text-gray-700 text-sm font-bold mb-1"
					>
						Логин:
					</label>
					<input
						{...register('username', {
							required: true,
							minLength: { value: 3, message: 'Логин слишком короткий' },
							maxLength: { value: 150, message: 'Логин слишком длинный' },
						})}
						id="username"
						type="text"
						placeholder="Логин"
						className="shadow appearance-none border rounded w-full py-2 px-3 bg-stone-100 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-zinc-600"
					/>
					{errors.username && <span className="text-red-900 mt-1 block">{errors.username.message}</span>}
				</div>

				<div className="mb-4">
					<label
						htmlFor="first_name"
						className="block text-gray-700 text-sm font-bold mb-2"
					>
						Имя:
					</label>
					<input
						{...register('first_name', {
							required: true,
							minLength: { value: 2, message: 'Имя должно содержать минимум 2 символа' },
						})}
						id="first_name"
						type="text"
						placeholder="Имя"
						className="shadow appearance-none border rounded w-full py-2 px-3 bg-stone-100 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-zinc-600"
					/>
					{errors.first_name && <span className="text-red-900 mt-1 block">{errors.first_name.message}</span>}
				</div>

				<div className="mb-4">
					<label
						htmlFor="last_name"
						className="block text-gray-700 text-sm font-bold mb-2"
					>
						Фамилия:
					</label>
					<input
						{...register('last_name', {
							required: true,
							minLength: { value: 2, message: 'Фамилия должна содержать минимум 2 символа' },
						})}
						id="last_name"
						type="text"
						placeholder="Фамилия"
						className="shadow appearance-none border rounded w-full py-2 px-3 bg-stone-100 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-zinc-600"
					/>
					{errors.last_name && <span className="text-red-900 mt-1 block">{errors.last_name.message}</span>}
				</div>

				<div className="mb-4">
					<label
						htmlFor="phone_number"
						className="block text-gray-700 text-sm font-bold mb-2"
					>
						Телефон:
					</label>
					<input
						{...register('phone_number', {
							required: false,
							pattern: {
								value: /^(\+\d{1,2})?\s?(\d{3})\s?[-.\s]?(\d{3})\s?[-.\s]?(\d{4})$/,
								message: 'Телефон введен неверно',
							},
						})}
						id="phone_number"
						type="tel"
						placeholder="+7..."
						className="shadow appearance-none border rounded w-full py-2 px-3 bg-stone-100 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-zinc-600"
					/>
					{errors.phone_number && <span className="text-red-900 mt-1 block">{errors.phone_number.message}</span>}
				</div>

				<div className="mb-4">
					<label
						htmlFor="email"
						className="block text-gray-700 text-sm font-bold mb-2"
					>
						Email:
					</label>
					<input
						{...register('email', {
							required: true,
							pattern: {
								value: /\S+@\S+\.\S+/,
								message: 'E-mail введен неправильно',
							},
						})}
						id="email"
						type="email"
						placeholder="example@example.com"
						className="shadow appearance-none border rounded w-full py-2 px-3 bg-stone-100 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-zinc-600"
					/>
					{errors.email && <span className="text-red-900 mt-1 block">{errors.email.message}</span>}
				</div>

				<div className="mb-4 relative">
					<label
						htmlFor="password"
						className="block text-gray-700 text-sm font-bold mb-2"
					>
						Пароль:
					</label>
					<input
						{...register('password', {
							required: true,
							minLength: { value: 8, message: 'Пароль слишком короткий' },
						})}
						id="password"
						type={showPassword ? 'text' : 'password'}  // Динамическое изменение типа поля
						placeholder="Пароль"
						className="shadow appearance-none border rounded w-full py-2 px-3 bg-stone-100 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-zinc-600"
					/>
					<div className="absolute inset-y-0 right-0 pr-3 flex items-center"> {/* Убираем pointer-events-none */}
						<button
							type="button"
							onClick={togglePasswordVisibility}
							className="pt-7 cursor-pointer outline-none focus:outline-none"
						>
							{showPassword ? (
								<EyeSlashIcon className="h-5 w-5 text-gray-500" aria-hidden="true" /> // Скрыть пароль
							) : (
								<EyeIcon className="h-5 w-5 text-gray-500" aria-hidden="true" /> // Показать пароль
							)}
						</button>
					</div>
					{errors.password && <span className="text-red-900 mt-1 block">{errors.password.message}</span>}
				</div>

				<div className="mb-4 relative">
					<label
						htmlFor="confirm_password"
						className="block text-gray-700 text-sm font-bold mb-2"
					>
						Подтверждение пароля:
					</label>
					<input
						{...register('confirm_password', {
							required: true,
							validate: (value) => value === watch('password') || 'Пароли не совпадают',
						})}
						id="confirm_password"
						type={showPassword ? 'text' : 'password'}  // Аналогичное поведение для второго поля
						placeholder="Подтвердите пароль"
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
					{errors.confirm_password && <span className="text-red-900 mt-1 block">{errors.confirm_password.message}</span>}
				</div>

				<div className="mb-4">
					<label
						htmlFor="pin_code"
						className="block text-gray-700 text-sm font-bold mb-2"
					>
						PIN-код (5 цифр):
					</label>
					<input
						{...register('pin_code', {
							required: true,
							pattern: {
								value: /^\d{5}$/,
								message: 'PIN-код должен быть длиной ровно 5 цифр',
							},
						})}
						id="pin_code"
						type="number"
						placeholder="Ваш PIN-код"
						className="shadow appearance-none border rounded w-full py-2 px-3 bg-stone-100 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-zinc-600"
					/>
					{errors.pin_code && <span className="text-red-900 mt-1 block">{errors.pin_code.message}</span>}
				</div>

				<button
					type="submit"
					className="w-full bg-sky-500 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded"
				>
					Зарегистрироваться
				</button>
				<div className="h-48"></div>
			</div>

		</form>
	);
};

export default RegisterForm;
