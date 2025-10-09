// Архив иконок https://heroicons.com/

'use client';

import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  AcademicCapIcon,
  BookOpenIcon,
  ViewColumnsIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

// Карта ссылок для отображения в боковой навигации.
// В зависимости от размера приложения это будет храниться в базе данных.
const links = [
  { name: '1 Дашборд',
    href: '/dashboard',
    icon: HomeIcon,
  },

  {
    name: '2 Тайминг: Бани',
    href: '/dashboard/timetable-guest',
    icon: ClockIcon,
  },

  { name: '3 Тайминг: мастеров',
    href: '/dashboard/timetable-user',
    icon: ClockIcon
  },

  { name: '4 Мастер Тайм',
    href: '/dashboard/timing-one-master',
    icon: ClockIcon
  },

  { name: '5 Архив',
    href: '/dashboard/archive-programs',
    icon: BookOpenIcon
  },

    { name: '6 Отчет Мастера',
    href: '/dashboard/report-master',
    icon: ViewColumnsIcon
  },

  { name: '7 Отчет Администратора',
    href: '/dashboard/report-administrator',
    icon: ViewColumnsIcon
  },

  { name: '8 Должности',
    href: '/dashboard/staff-table',
    icon: UserGroupIcon
  },

  { name: '9 Зарплатные ведомости',
    href: '/dashboard/salary-staff-table',
    icon: UserGroupIcon
  },

];

export default function NavLinks() {

  const pathname = usePathname();

  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[35px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-sky-100 text-blue-600': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
