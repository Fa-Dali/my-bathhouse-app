// frontend/nextjs-dashboard/app/auth/login/page.tsx

// 'use client';

// import React, { useState } from 'react';
// import axios from 'axios';
// import LoginForm from './LoginForm'; // Импортируем нашу форму
// import SideNav from '@/app/ui/dashboard/sidenav';

// const LoginPage = () => {
//   return (
//     <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
//       <SideNav />
//       <LoginForm />
//     </div>
//   );
// };

// export default LoginPage;

// ===================================

'use client';

import React, { useState } from 'react';
import axios from 'axios';
import LoginForm from './LoginForm'; // Импортируем нашу форму
import SideNav from '@/app/ui/dashboard/sidenav';
import Header from 'app/components/Header'

const LoginPage = () => {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden relative">
      {/* Боковая панель слева на десктопе, снизу на мобайл */}
      <div className="w-full flex-none md:w-64 order-last md:order-first  -mt-5">
        <SideNav />
      </div>

      {/* Контейнер для шапки и основного контента */}
      <div className="flex-grow relative overflow-hidden">
        {/* Шапка, занимающая всю ширину экрана и расположенная сверху */}
        <Header className="sticky top-0 z-50 bg-gray-800 text-white w-full py-4" />

        {/* Основное содержимое, имеющее отступ сверху равный высоте шапки */}
        <main className="p-6 sm:overflow-y-auto md:p-12 pt-[64px]" style={{ paddingTop: '64px' }}>
          {/* {children} */}
          <LoginForm />
        </main>
      </div>
    </div>
  );
};

export default LoginPage;
