// frontend/nextjs-dashboard/app/auth/register/page.tsx
'use client';

import React from 'react';
import RegisterForm from './RegisterForm'; // Импортируем нашу форму
import SideNav from '@/app/ui/dashboard/sidenav';
import Header from '@/app/components/Header';

const RegisterPage = () => {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden relative">
      {/* Боковая панель слева на десктопе, снизу на мобайл */}
      <div className="w-full flex-none md:w-64 order-last md:order-first -mt-5">
        <SideNav />
      </div>

      {/* Контейнер для шапки и основного контента */}
      <div className="flex-grow relative overflow-hidden">
        {/* Шапка, занимающая всю ширину экрана и расположенная сверху */}
        <Header className="sticky top-0 z-50 bg-gray-800 text-white w-full py-4" />

        {/* Основное содержимое, имеющее отступ сверху равный высоте шапки */}
        <main className="p-6 sm:overflow-y-auto md:p-12 pt-[64px]" style={{ paddingTop: '64px' }}>
          <RegisterForm />
        </main>


      </div>
    </div>
  );
};

export default RegisterPage;
