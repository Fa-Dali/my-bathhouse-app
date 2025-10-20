// frontend/nextjs-dashboard/app/utils/middlewares/protectRoute.tsx

// 'use client';

// import { usePathname, redirect } from 'next/navigation'; // Новые хуки для Next.js 15.x
// import { useEffect } from 'react'; // Standard React hook
// import { useAuth } from '@/app/auth/contexts/auth-provider';

// export default function ProtectRoute({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname(); // Получаем текущий путь
//   const { authenticated } = useAuth();

//   useEffect(() => {
//     if (!authenticated) {
//       sessionStorage.setItem('redirectUrl', pathname); // Запоминаем текущий путь
//       redirect('/auth/login'); // Перенаправляем на страницу логина
//     }
//   }, [pathname, authenticated]);

//   return authenticated ? children : null;
// }

// frontend/nextjs-dashboard/app/utils/middlewares/ProtectRoute.tsx

// 'use client';

import { useAuth } from '@/app/auth/contexts/auth-provider';
import { ReactNode } from 'react';

const ProtectRoute = ({ children }: { children: ReactNode }) => {
  const { authenticated } = useAuth();

  if (!authenticated) {
    return <div>Вы не авторизованы</div>;
  }

  return children;
};

export default ProtectRoute;
