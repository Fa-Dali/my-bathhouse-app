// Ссылка страницы http://localhost:3000/dashboard/report-master

// app/dashboard/report-master/page.tsx
'use client';

import ReportMaster from '@/app/dashboard/report-master/report-day/page';
import MoneyOfMaster from '@/app/dashboard/report-master/money-of-master/page';
import { useAuth } from '@/app/auth/contexts/auth-provider';
import { useState, useEffect } from 'react';
import PaymentHistory from '@/app/dashboard/salary-staff-table/components/PaymentHistory';
import api from '@/app/utils/axiosConfig';

export default function Page() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ unpaid: 0, monthly: 0, yearly: 0 });

  // изменяет состояние stats при изменении user
  useEffect(() => {
    const refreshStats = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(
          `${api.defaults.baseURL}/api/reports/master-reports/stats/?user_id=${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
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
  }, [user]); // ← user — зависимость

  // ✅ Теперь можно проверять права
  const hasMasterAccess = user?.roles.some((r: any) =>
    ['master', 'paramaster', 'masseur'].includes(r.code)
  );
  const isAdmin = user?.roles.some((r: any) => r.code === 'admin');

  // ✅ Условный рендер — после хуков
  if (!hasMasterAccess && !isAdmin) {
    return <div>Доступ запрещён</div>;
  }

  // ✅ Проверка на null — после хуков
  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="flex flex-col lg:flex lg:flex-row gap-4 p-2 bg-gray-500 min-h-screen beautiful-scroll overflow-y-auto h-[300px]">
      <div className=" w-full lg:w-[60%]">
        <ReportMaster refreshStats={() => {}} />
        <PaymentHistory userId={user.id} />
      </div>
      <div>
        <MoneyOfMaster stats={stats} />
      </div>
    </div>
  );
}
