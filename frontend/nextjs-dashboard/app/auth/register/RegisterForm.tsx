// frontend/nextjs-dashboard/app/auth/register/RegisterForm.tsx

'use client';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useState } from 'react';
import axios from 'axios';
import { usePathname, useSearchParams, redirect } from 'next/navigation';
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
	avatar?: File | null; // Поле avatar может быть файлом или null
};

function isFileOrBlob(value: unknown): value is Blob | File {
	return value instanceof Blob || value instanceof File;
}

const RegisterForm = () => {
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<RegisterFormInputs>();

	const [showPassword, setShowPassword] = useState(false);
	const togglePasswordVisibility = () => setShowPassword(prevState => !prevState);

	const [previewImageUrl, setPreviewImageUrl] = useState<string | undefined>(undefined);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files.length > 0) {
			const file = event.target.files[0];
			setSelectedFile(file); // Сохраняем файл в стейт

			const reader = new FileReader();
			reader.onload = e => {
				if (typeof e.target?.result === 'string') {
					setPreviewImageUrl(e.target.result); // Обновляем превью
				}
			};
			reader.readAsDataURL(file); // Читаем файл для превью
		}
	};


	const onSubmit = async (data: RegisterFormInputs) => {
		try {
			const formData = new FormData();

			// Используем только сохранённый файл из стейта:
			if (selectedFile !== null) {
				formData.append('avatar', selectedFile); // Используем сохранённый файл
			}

			// Добавляем остальные поля формы:
			Object.keys(data).forEach(key => {
				const value = data[key as keyof RegisterFormInputs];

				// Исключаем поле "avatar" из общего цикла
				if (key === 'avatar') return;

				if (isFileOrBlob(value)) {
					formData.append(key, value);
				} else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
					formData.append(key, `${value}`);
				} else if (value === null || value === undefined) {
					console.warn(`Игнорируется поле ${key}: значение отсутствует.`);
				} else {
					throw new Error(`Недопустимый тип данных для поля "${key}". Тип: ${typeof value}. Значение: ${JSON.stringify(value)}.`);
				}
			});

			// Отправляем форму...
			const res = await fetch('/api/register/', {
				method: 'POST',
				headers: {
					'Content-Type': 'multipart/form-data', // Некоторые серверы требуют явного указания
				},
				body: formData,
			});

			if (res.ok) {
				alert('Вы успешно зарегистрировались');
			// } else {
			// 	const result = await res.json();
			// 	alert(result.detail || 'Ошибка регистрации');
			// }
			} else {
            let errorMessage = '';
            try {
                const responseText = await res.text(); // Читай тело ответа как текст
                errorMessage = responseText.includes('<') ? 'Ошибка на сервере!' : responseText;
            } catch (err) {
                errorMessage = 'Не удалось расшифровать ответ сервера.';
            }
            alert(errorMessage || 'Ошибка регистрации');
        }
		} catch (err) {
			console.error(err);
			alert('Возникла ошибка при регистрации.');
		}
	};

	// ==================================================================================================

	return (

		<form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-6 bg-amber-50 shadow-2xl rounded-xl">
			<div className="w-md h-[500px] overflow-y-auto beautiful-scroll">
				<h2 className="text-2xl font-semibold mb-6 text-center text-cyan-950">Регистрация</h2>

				{/* Логин: */}
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

				{/* Имя: */}
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

				{/* Фамилия: */}
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

				{/* Телефон: */}
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

				{/* Email: */}
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

				{/* Ввод пароля: */}
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

				{/* Подтверждение пароля: */}
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

				{/* PIN-код (5 цифр) */}
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

				{/* Выбор аватара */}
				<div className="mb-4">
					<label htmlFor="avatar" className="block text-gray-700 text-sm font-bold mb-2">
						Аватар:
					</label>
					<input
						{...register('avatar')}
						id="avatar"
						type="file"
						accept="image/*"
						onChange={handleChange}
						className="hidden"
					/>
					<button
						type="button"
						onClick={() => (document.querySelector('#avatar') as HTMLInputElement)?.click()} // Утверждаем тип
						className="cursor-pointer text-blue-500 underline"
					>
						Выберите фотографию
					</button>
				</div>

				{/* Превью фотографии */}
				{previewImageUrl && (
					<div className="flex justify-center mb-4">
						<img src={previewImageUrl} alt="Selected Avatar Preview" className="rounded-lg object-contain w-32 h-32" />
					</div>
				)}

				{/* Кнопка регистрации */}
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
