// Ссылка страницы http://localhost:3000/dashboard/salary-staff-table

// app/dashboard/salary-staff-table/page.tsx
'use client';

import { useAuth } from '@/app/auth/contexts/auth-provider';
import { useState, useEffect } from 'react';
import StaffTable from '@/app/dashboard/salary-staff-table/components/StaffTable';

export default function SalaryStaffPage() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const isAdmin = user?.roles.some((r: any) => r.code === 'admin');

  useEffect(() => {
    if (!isAdmin && user) {
      alert('Доступ запрещён');
    }
  }, [isAdmin, user]);

  if (!user) return <div>Загрузка...</div>;
  if (!isAdmin) return <div>Доступ запрещён</div>;

  return (
    <div className="container mx-auto p-6 bg-gray-600">

      <div className="flex inherit mb-6">
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <h1 className="text-3xl font-bold text-center mb-2 ml-10 text-gray-300">
          Зарплатные ведомости
        </h1>
      </div>

      <StaffTable month={selectedMonth} />
    </div>
  );
}
