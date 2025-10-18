// frontend/nextjs-dasboard/app/ui/dashboard/sidenav.tsx

'use client';

import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import Clock from '@/app/components/Clock'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { usePathname, useSearchParams, redirect } from 'next/navigation';  // Новые хуки

export default function SideNav() {

  const [loading, setLoading] = useState(false);
  const pathname = usePathname();  // Хук для получения текущего пути

  // 🔥 Закомментировали устаревшую версию проверки токена и переадресации
  // useEffect(() => {
  //   const checkTokenAndRedirect = async () => {
  //     const token = localStorage.getItem('token');

  //     // Исключаем страницы "/auth/register" и "/auth/login" из проверки токенов
  //     if (pathname !== '/auth/register' && !token) {
  //       redirect('/auth/login');  // Если токен отсутствует и путь не относится к регистрации, направляем на страницу логина
  //     }
  //   };

  //   checkTokenAndRedirect();
  // }, [pathname]); // Теперь эффект запускается каждый раз при изменении пути



  const handleLoginClick = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        alert('Токен отсутствует. Пожалуйста, войдите в систему.');
        redirect('/login');  // Перемещаемся на страницу входа, если токен отсутствует
        return;
      }


    } catch (error) {
      console.error("frontend/nextjs-dashboard/app/ui/dashboard/sidenav.tsx (49): Ошибка входа:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-600 flex h-auto flex-col px-3 py-4 md:px-2">

      <Link
        className="mb- flex h-20 items-center justify-center rounded-md bg-zinc-100 p-4 md:h-40"
        href="/" // ссылка на часах
      >
        <div className="w-32 text-white md:w-40">
          {/* <AcmeLogo /> */}
          <Clock />
        </div>
      </Link>

      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">

        <div className="hidden h-auto w-full grow rounded-md bg-gray-200 md:block"></div>

        {/* Новый контейнер с классом beautiful-scroll */}
        <div className="hidden md:block beautiful-scroll sticky top-0 overflow-y-auto h-[calc(100vh-14rem)] pb-5 px-1">
          <NavLinks />
        </div>


        {/* Горизонтальная прокрутка только на маленьких экранах */}
        <div className="flex overflow-x-auto snap-x snap-mandatory touch-pan-x whitespace-nowrap pb-5 block md:hidden max-w-full">
          <div className="flex-shrink-0 w-max pr-2 flex">
            <NavLinks />
          </div>
        </div>

        {/* для десктоп экрана */}
        {/* <div className="mt-4 hidden md:block absolute bottom-0 left-0 w-full">
          <form>
            <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
              <PowerIcon className="w-6" />
              <div className="hidden md:block">Вход</div>
            </button>
          </form>
        </div> */}


        {/* для мобильного экрана */}
        <form>
          <button
            className={`flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-sky-100 sm:bg-stone-300 p-3 text-sm font-medium hover:bg-green-700 hover:text-blue-100 md:flex-none md:justify-start md:p-2 md:px-3 ${loading && 'opacity-50 cursor-wait'}`}
            disabled={loading}
            onClick={handleLoginClick}
          >
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Вход</div>
          </button>
        </form>

      </div>
    </div>
  );
}
