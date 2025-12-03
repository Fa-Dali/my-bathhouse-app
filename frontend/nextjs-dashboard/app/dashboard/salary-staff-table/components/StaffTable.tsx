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
    // console.log('Ответ от сервера:', res.data);
  }, [month]);

  const loadMasters = async () => {
    try {
      const res = await api.get('/api/reports/master-reports/stats/monthly/', {
        params: { month }, // ← автоматически станет ?month=2025-04
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      });

      console.log('Загружаем данные за:', month);

      setMasters(res.data);
      // console.log('Ответ от сервера:', res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert('Сессия истекла. Войдите снова.');
        // Можно перенаправить на вход
      } else {
        console.error('Ошибка загрузки мастеров:', err);
        alert('Не удалось загрузить данные');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Обработка оплаты
  const handlePay = async (masterId: number, amount: number) => {
    if (amount <= 0) {
      alert('Сумма должна быть больше 0');
      return;
    }

    if (!confirm(`Оплатить ${formatNumber(amount)} ₽ мастеру? Система автоматически закроет старые долги.`)) return;

    try {
      const token = localStorage.getItem('authToken');
      const res = await api.post(
        '/api/reports/master-reports/pay/', // ← новый эндпоинт
        { master_id: masterId, amount },     // ← не нужен month
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const msg = [
          res.data.message,
          res.data.remaining_amount > 0
            ? `Остаток долга: ${formatNumber(res.data.total_applied - amount)} ₽`
            : ''
        ].filter(Boolean).join('\n\n');

        alert(msg);
        loadMasters(); // обновить таблицу
      } else {
        alert(res.data.error || 'Неизвестная ошибка');
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        alert('Ошибка: ' + err.response.data.error);
      } else {
        alert('Сетевая ошибка. Проверьте подключение.');
      }
    }
  };

  const updateKarma = async (masterId: number, type: 'good' | 'bad') => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await api.post(
        '/api/users/update-karma/',
        { user_id: masterId, type },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ✅ Успешно (200)
      if (res.data.success) {
        setMasters((prev) =>
          prev.map((m) =>
            m.id === masterId
              ? {
                ...m,
                // ✅ Явно указываем, что это число
                [type === 'good' ? 'karma_good' : 'karma_bad']:
                  (type === 'good' ? m.karma_good : m.karma_bad) + 1,
              }
              : m
          )
        );
      }
    }
    // 🚨 Обработка ответа с ошибкой (400, 403 и т.д.) и сетевых проблем
    catch (err: any) {
      // Если сервер вернул JSON с ошибкой
      if (err.response && err.response.data) {
        const errorMessage = err.response.data.error;
        if (errorMessage) {
          alert(errorMessage); // "Карму можно менять только раз в день"
          return;
        }
      }

      // Если это реальная сетевая ошибка
      alert('Ошибка сети. Попробуйте позже.');
    }
  };

  if (loading) return <div className="text-center py-10">Загрузка...</div>;

  return (
    <div className="bg-gray-200 rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto beautiful-scroll h-[500px]">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700">
            <tr>
              <th className="w-2/6 px-6 py-2 text-left font-semibold">Сотрудник</th>
              <th className="w-1/6 px-6 py-2 text-center">Карма</th>
              <th className="w-1/6 px-6 py-2 text-center">Оплачено</th>
              <th className="w-1/6 px-6 py-2 text-center">Не оплачено</th>
              <th className="w-1/6 px-6 py-2 text-center">Оплатить</th>
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

                  <td className="px-6 py-0">
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

                  <td className="ml-8 w-1/5 px-1 py-0  text-center">
                    <div className="flex justify-between p-0 px-3 border border-slate-400 rounded bg-gray-100">

                      <div className="flex flex-col items-center">
                        <StarRating
                          value={master.karma_good}
                          type="good"
                          onKarmaChange={() => updateKarma(master.id, 'good')}
                        />
                        <span className="text-sm text-gray-500">
                          {master.karma_good}
                        </span>
                      </div>

                      <div className="flex flex-col items-center">
                        <StarRating
                          value={master.karma_bad}
                          type="bad"
                          onKarmaChange={() => updateKarma(master.id, 'bad')}
                        />
                        <span className="text-sm text-gray-500">
                          {master.karma_bad}
                        </span>
                      </div>

                    </div>
                  </td>

                  <td className="px-4 py-0 text-right font-mono text-xl text-green-700 font-semibold">
                    {formatNumber(master.stats.monthly)} ₽
                  </td>

                  <td className="px-4 py-0 text-right font-mono text-xl text-red-600 font-semibold">
                    {formatNumber(master.stats.unpaid)} ₽
                  </td>

                  <td className="px-6 py-1">
                    <div className="overflow-hidden rounded-lg border border-gray-400">
                      <input
                        type="text"
                        placeholder=""
                        className="w-48 px-3 py-1 rounded-t-lg text-right text-sm focus:outline-none focus:ring-blue-600"
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
                        className="w-1/2 px-3 py-1 bg-green-300 hover:text-white text-sm hover:bg-green-700 transition"
                      >
                        Оплатить
                      </button>
                      <button
                        onClick={(e) => {
                          const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                          const raw = input.value.replace(/\D/g, '');
                          handlePay(master.id, parseInt(raw, 10));
                        }}
                        className="w-1/2 px-3 py-1 bg-red-300 hover:text-white text-sm hover:bg-red-700 transition"
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
