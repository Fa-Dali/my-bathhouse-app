// Ссылка страницы http://localhost:3000/dashboard/report-master

'use client';

import ReportMaster from '@/app/dashboard/report-master/report-day/page';
import MoneyOfMaster from '@/app/dashboard/report-master/money-of-master/page';
import { useAuth } from '@/app/auth/contexts/auth-provider';
import { useState, useEffect } from 'react';

export default function Page() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ unpaid: 0, monthly: 0, yearly: 0 });

  // ✅ Все хуки вверху
  useEffect(() => {
    const refreshStats = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(
          `http://localhost:8000/api/reports/master-reports/stats/?user_id=${user.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Ошибка обновления статистики', err);
      }
    };

    refreshStats();
  }, [user]);

  // ✅ Проверка прав — после хуков, но до return
  const hasMasterAccess = user?.roles.some(
    (r: any) => ['master', 'paramaster', 'masseur'].includes(r.code)
  );
  const isAdmin = user?.roles.some((r: any) => r.code === 'admin');

  if (!hasMasterAccess && !isAdmin) {
    return <div>Доступ запрещён</div>;
  }

  // ✅ Функцию refreshStats вынесем отдельно
  const refreshStats = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(
        `http://localhost:8000/api/reports/master-reports/stats/?user_id=${user.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Ошибка обновления статистики', err);
    }
  };

  // ✅ Отладка — после проверки доступа
  console.log('user:', user);
  console.log('user.roles:', user?.roles);
  console.log('hasMasterAccess:', hasMasterAccess);
  console.log('isAdmin:', isAdmin);

  return (
    <div className="flex p-4 gap-6">
      <div className="w-[60%]">
        <ReportMaster refreshStats={refreshStats} />
      </div>

      <MoneyOfMaster stats={stats} />
    </div>
  );
}
