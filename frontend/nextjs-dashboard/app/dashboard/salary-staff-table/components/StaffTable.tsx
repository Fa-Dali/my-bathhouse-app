// app/dashboard/salary-staff-table/StaffTable.tsx
'use client';

import { useEffect, useState } from 'react';
import StarRating from './StarRating';
import api from '@/app/utils/axiosConfig';

interface Master {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  karma_good: number;
  karma_bad: number;
  stats: {
    unpaid: number;
    monthly: number;
  };
}

const API_BASE = 'http://localhost:8000';

// ✅ Добавляем простую функцию форматирования
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ru-RU').format(num);
};

export default function StaffTable({ month }: { month: string }) {
  const [masters, setMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadMasters();
  }, [month]);

  const loadMasters = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`http://localhost:8000/api/reports/master-reports/stats/monthly/?month=${month}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setMasters(data);
      } else {
        console.error('Ошибка загрузки мастеров');
      }
    } catch (err) {
      console.error('Ошибка сети:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (masterId: number, amount: number) => {
    if (amount <= 0) {
      alert('Сумма должна быть больше 0');
      return;
    }

    if (!confirm(`Оплатить ${formatNumber(amount)} ₽ мастеру?`)) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await api.post(
        '/api/reports/master-reports/pay/',
        { master_id: masterId, amount, month },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert('Оплачено!');
        loadMasters(); // обновить
      }
    } catch (err) {
      alert('Ошибка оплаты');
    }
  };

  if (loading) return <div className="text-center py-10">Загрузка...</div>;

  return (
    <div className="bg-gray-200 rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto beautiful-scroll h-[500px]">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Сотрудник</th>
              <th className="px-6 py-4 text-center">Карма</th>
              <th className="px-6 py-4 text-center">Оплачено</th>
              <th className="px-6 py-4 text-center">Не оплачено</th>
              <th className="px-6 py-4 text-center">Оплатить</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {masters.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-500">Нет данных</td>
              </tr>
            ) : (
              masters.map((master) => (
                <tr key={master.id} className="hover:bg-gray-50 transition-colors">

                  <td className="px-6 py-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={master.avatar ? `${API_BASE}${master.avatar}` : '/avatar-placeholder.png'}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover border"
                      />
                      <div>
                        <div className="font-medium text-gray-800">
                          {master.first_name} {master.last_name}
                        </div>
                        <div className="text-xs text-gray-500">{master.username}</div>
                      </div>
                    </div>
                  </td>

                  <td className="ml-8 w-1/5 px-10 py-2  text-center">
                    <div className="flex items-center justify-center gap-2">
                      <StarRating value={master.karma_good} type="good" />
                      <span className="w-1/2 text-sm text-gray-500">{master.karma_good}</span>
                      <StarRating value={master.karma_bad} type="bad" />
                      <span className="w-1/2 text-sm text-gray-500">{master.karma_bad}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right font-mono text-green-700 font-semibold">
                    {formatNumber(master.stats.monthly)} ₽
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-red-600 font-semibold">
                    {formatNumber(master.stats.unpaid)} ₽
                  </td>
                  <td className="px-6 py-4">
                    <div className="items-center gap-2 justify-end">
                      <input
                        type="text"
                        placeholder=""
                        className="w-48 rounded-t-lg px-3 py-1 border text-right text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '');
                          e.target.value = raw ? Number(raw).toLocaleString('ru-RU') : '';
                        }}
                      />
                      <button
                        onClick={(e) => {
                          const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                          const raw = input.value.replace(/\D/g, '');
                          handlePay(master.id, parseInt(raw, 10));
                        }}
                        className="w-1/2 px-3 py-1 bg-green-300 hover:text-white text-sm rounded-bl-lg hover:bg-green-700 transition"
                      >
                        Оплатить
                      </button>
                      <button
                        onClick={(e) => {
                          const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                          const raw = input.value.replace(/\D/g, '');
                          handlePay(master.id, parseInt(raw, 10));
                        }}
                        className="px-3 py-1 bg-red-300 hover:text-white text-sm rounded-br-lg hover:bg-red-700 transition"
                      >
                        Вычесть
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
