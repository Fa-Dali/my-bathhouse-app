// frontend/nextjs-dashboard/app/auth/login/page.tsx

// ОРИГИНАЛ ШАБЛОНА

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

// frontend/nextjs-dashboard/app/auth/login/page.tsx

// 'use client';

// import React, { useState } from 'react';
// import axios from 'axios';
// import LoginForm from './LoginForm'; // Импортируем нашу форму
// import SideNav from '@/app/ui/dashboard/sidenav';
// import Header from 'app/components/Header'
// import { redirect } from 'next/navigation';

// const LoginPage = () => {
//   return (
//     <div className="flex h-screen flex-col md:flex-row md:overflow-hidden relative">

//       {/* Боковая панель слева на десктопе, снизу на мобайл */}
//       <div className="w-full flex-none md:w-64 order-last md:order-first  -mt-5">
//         <SideNav />
//       </div>

//       {/* Контейнер для шапки и основного контента */}
//       <div className="flex-grow relative overflow-hidden">

//         {/* Шапка, занимающая всю ширину экрана и расположенная сверху */}
//         <Header className="sticky top-0 z-50 bg-gray-800 text-white w-full py-4" />

//         {/* Основное содержимое, имеющее отступ сверху равный высоте шапки */}
//         <main className="p-6 sm:overflow-y-auto md:p-12 pt-[64px]" style={{ paddingTop: '64px' }}>
//           {/* {children} */}
//           <LoginForm />
//         </main>

//       </div>
//     </div>
//   );
// };

// export default LoginPage;

// ===================================

// frontend/nextjs-dashboard/app/auth/login/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoginForm from './LoginForm'; // Импортируем нашу форму
import SideNav from '@/app/ui/dashboard/sidenav';
import Header from 'app/components/Header'
import { redirect } from 'next/navigation';

// Удалите 'use client'

const LoginPage = () => {
  // Пользовательские состояния и методы будут обработаны только на клиентской стороне
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Отложим рендеринг пока мы не на клиентской стороне
  }

  // Теперь мы уверены, что находимся на клиентской стороне
  const token = localStorage.getItem('authToken');
  if (!token) {
    redirect('/auth/login');
  }

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
