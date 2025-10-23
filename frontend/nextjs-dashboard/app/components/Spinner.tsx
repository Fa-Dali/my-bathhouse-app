// frontend/nextjs-dashboard/app/auth/login/loading.tsx

import React from 'react';
import Image from 'next/image';

const logoPath = "/static-images/logos/logo.png";

const LoadingPage = () => { // Добавляем получение пропсов (убрать)
  return (

	<div className="loading-page w-full h-full">
	  <Image
		src={logoPath}
		width={200}
		height={100}
		alt="Logo"
		className="loading-image"
	  />
	  <p className="loading-text text-emerald-900">Загрузка...</p>
	</div>
  );
};

export default LoadingPage;
