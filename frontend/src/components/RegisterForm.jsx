// components/RegisterForm.jsx
"use client";

import { useState } from 'react';
import { useAuth } from '../contexts/auth'; // Используем контекст аутентификации
import styles from './RegisterForm.module.css';
import CustomCheckbox from './forForms/CustomCheckbox';

const RegisterForm = () => {
    const { setIsAuthenticated } = useAuth(); // Получаем метод для смены статуса аутентификации
    const [testMode, setTestMode] = useState(false); // Переключатель тестового режима

    const initialValues = {
        first_name: "",
        last_name: "",
        phone_number: "",
        email: "",
        password: "",
        confirm_password: "",
        pin_code: "",
        avatar: null,
    };

    const [values, setValues] = useState(initialValues);

    // Временная форма с аватаром заглушкой
    // const fakeAvatar = new File([], 'empty.jpg', { type: 'image/jpeg' });
    // formData.append('avatar', fakeAvatar);
    // Временная форма с аватаром заглушкой

    const handleChange = (e) => {
        const target = e.target;
        const value = target.type === 'file' ? target.files[0] : target.value;
        const field = target.name;
        setValues((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    // components/RegisterForm.jsx

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        // Заполняем форму данными
        for (let key of Object.keys(values)) {
            formData.append(key, values[key]); // Добавляем все введённые пользователем данные
        }

        // Печатаем данные, отправляемые на сервер
        console.log("Sending Data:");
        for (let pair of formData.entries()) {
            console.log(`${pair[0]}: ${pair[1]}`);
        }

        try {
            const response = await fetch("http://localhost:8000/api/register/", {
                method: "POST",
                body: formData, // Данные отправляются как FormData
            });

            // Для отладки (потом можно удалить)
            console.log("Server Response:", response);

            // Если запрос прошёл неудачно, получаем подробный ответ
            if (!response.ok) {
                const errorText = await response.text(); // Читаем текст ошибки
                console.error("Сервер вернул ошибку ../RegisterForm.jsx:", errorText); // Печатаем ошибку
                throw new Error(`Запрос не удался со статусом ../RegisterForm.jsx: ${response.status}: ${errorText}`);
            }

            alert("Вы успешно зарегистрированы!");
        } catch (err) {
            console.error("Ошибка регистрации:", err);
            alert("При регистрации произошла неожиданная ошибка. Что-то пошло не так");
        }
    };

    // Функция для удаления записи пользователя
    const deleteUserRecord = async (email) => {
        try {
            const delRes = await fetch("/api/banya/delete-user/", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const delResult = await delRes.json();

            if (delRes.ok) {
                alert(`Пользователь удален: ${delResult.message}`);
            } else {
                alert(`Ошибка при удалении пользователя: ${delResult.error}`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Добавляем чекбокс для включения тестового режима */}

            {/* components/RegisterForm.jsx */}
            <input className={`${styles.conteiner} ${styles.inputField}`}
                type="text"
                name="username"
                placeholder="Придумайте логин"
                required
                value={values.username || ''}
                onChange={handleChange}
            />

            <input className={`${styles.conteiner} ${styles.inputField}`}
                type="text"
                name="first_name"
                placeholder="Имя"
                required
                value={values.firstName}
                onChange={handleChange}
            />
            <input className={`${styles.conteiner} ${styles.inputField}`}
                type="text"
                name="last_name"
                placeholder="Фамилия"
                required
                value={values.lastName}
                onChange={handleChange}
            />
            <input className={`${styles.conteiner} ${styles.inputField}`}
                type="tel"
                name="phone_number"
                placeholder="+7(000) 000-00-00"
                required
                value={values.phoneNumber}
                onChange={handleChange}
            />
            <input className={`${styles.conteiner} ${styles.inputField}`}
                type="email"
                name="email"
                placeholder="Email"
                required
                value={values.email}
                onChange={handleChange}
            />
            <input className={`${styles.conteiner} ${styles.inputField}`}
                type="password"
                name="password"
                placeholder="Пароль"
                required
                value={values.password}
                onChange={handleChange}
            />
            <input className={`${styles.conteiner} ${styles.inputField}`}
                type="password"
                name="password"
                placeholder="Пароль (контроль)"
                required
                value={values.confirmPassword}
                onChange={handleChange}
            />
            <input className={`${styles.conteiner} ${styles.inputField}`}
                type="number"
                name="pin_code"
                placeholder="PIN код (5 цифр)"
                required
                value={values.pinCode}
                onChange={handleChange}
            />

            {/* КНОПКА ВЫБОРА ФОТО */}
            <label className={styles.fileInputContainer}>
                <input
                    type="file"
                    name="avatar"
                    accept="image/*"
                    onChange={handleChange}
                    className={styles.hiddenFileInput}
                />
                <span className={styles.fileInputButton}>Выбрать фото</span>
            </label>

            {/* КНОПКА РЕГИСТРАЦИИ */}
            <button type="submit" className={styles.submitBtn}>Регистрация</button>

            {/* ЧЕКБОКС */}
            <div>
                <CustomCheckbox
                    label="Тестовый режим:"
                    checked={testMode}
                    onChange={() => setTestMode(!testMode)}
                />
            </div>

        </form>
    );
};

export default RegisterForm;
