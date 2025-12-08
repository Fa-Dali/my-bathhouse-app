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

// ✅ Хук useMediaQuery — для удаления аналоговых часов на маленьких экранах
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const handleChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', handleChange);

    return () => media.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

export default function SideNav() {

  const [loading, setLoading] = useState(false);
  const pathname = usePathname();  // Хук для получения текущего пути

  // ✅ Показывать часы только на md и больше (≥768px)
  const showClock = useMediaQuery('(min-width: 768px)');


  const handleLoginClick = () => {
    setLoading(true);
    redirect('/auth/login');  // Прямо переадресовываем на страницу входа
    setTimeout(() => setLoading(false), 100); // Небольшая задержка для анимации
  };

  return (
    <div className="bg-slate-600 flex h-auto flex-col px-2 py-4 md:px-2">

      {/* 🔽 Условный рендер: только если showClock = true */}
      {showClock && (
        <div
          className=" flex h-20 items-center justify-center rounded-md bg-stone-300 p-4 md:h-40"
        >
          <div className="w-32 text-white md:w-40">
            <Clock />
          </div>
        </div>
      )}

      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">

        <div className="hidden h-auto w-full grow rounded-md bg-gray-200 md:block"></div>

        {/* Новый контейнер с классом beautiful-scroll */}
        <div className="hidden md:block beautiful-scroll sticky top-0 overflow-y-auto h-[calc(100vh-14rem)] pb-5 px-1">
          <NavLinks />
        </div>


        {/* Горизонтальная прокрутка только на маленьких экранах */}
        <div className="flex overflow-x-auto snap-x snap-mandatory touch-pan-x whitespace-nowrap pb-5 md:hidden max-w-full">
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
