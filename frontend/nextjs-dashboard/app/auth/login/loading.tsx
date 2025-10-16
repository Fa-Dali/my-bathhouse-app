// frontend/nextjs-dashboard/app/auth/login/loading.tsx

import React from 'react';
import Image from 'next/image';

const logoPath = "/static-images/logos/logo.png";

// Явно определяем интерфейс props
// interface LoadingPageProps {
//   onContinue: () => void; // Функция обратного вызова без аргументов
// }

const LoadingPage = () => { // Добавляем получение пропсов (убрать)
	return (
// 		<div className="loading-page">
// 			{/* <img src="/images/logo.png" alt="Logo" className="loading-image"/> */}
// 			<Image src={logoPath} width={200} height={100} alt="Logo" className="loading-image" />
// 			<br />
// 			<span>Загрузка...</span>

//  {/* =============== КНОПКА ДЛЯ ОТЛАДКИ ==================== */}
// 			<button
// 				onClick={onContinue}
// 				className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
// 			>
// 				Продолжить
// 			</button>
//  {/* =============== КНОПКА ДЛЯ ОТЛАДКИ ================ end */}

// 		</div>

<div className="loading-page">
      <Image
        src={logoPath}
        width={200}
        height={100}
        alt="Logo"
        className="loading-image"
      />
      <p className="loading-text text-emerald-900">Загрузка...</p>
      <div className="button-container">
        {/* <button
          onClick={onContinue}
          className="loading-button"
        >
          Продолжить
        </button> */}
      </div>
    </div>
	);
};

export default LoadingPage;

// =============================================
{/* =============== КНОПКА ДЛЯ ОТЛАДКИ ==================== */}
