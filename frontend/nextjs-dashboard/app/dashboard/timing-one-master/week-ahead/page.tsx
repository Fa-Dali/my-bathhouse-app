// Ссылка страницы http://localhost:3000/dashboard/timing-one-master

'use client';

import React, { useEffect, useState } from 'react';
import api from '@/app/utils/axiosConfig';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/dist/locale/ru';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('ru');

const localizer = momentLocalizer(moment);

interface Worker {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
}

export default function Page() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [events, setEvents] = useState<any[]>([]); // ← будут события из БД

  // Получаем мастеров
  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await api.get('/api/users/');
        const filtered = response.data
          .filter((u: any) =>
            u.roles.some((r: any) => r.code === 'paramaster' || r.code === 'masseur')
          )
          .map((u: any) => ({
            id: u.id,
            username: u.username,
            first_name: u.first_name,
            last_name: u.last_name,
            avatar: u.avatar,
          }));
        setWorkers(filtered);
      } catch (err) {
        console.error('Ошибка загрузки мастеров:', err);
      }
    };
    fetchWorkers();
  }, []);

  // Горизонтальная прокрутка
  // const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
  //   e.preventDefault();
  //   e.currentTarget.scrollLeft += e.deltaY > 0 ? 60 : -60;
  // };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY === 0) return;

    e.preventDefault();
    const container = e.currentTarget;

    // Увеличь значение (например, 100 вместо 60)
    container.scrollLeft += e.deltaY * 2; // ← множитель: быстрее при большом delta
  };

  const getFullName = (worker: Worker) =>
    [worker.first_name, worker.last_name].filter(Boolean).join(' ') || worker.username;

  // Пример событий (позже — из API)
  useEffect(() => {
    setEvents([
      {
        id: 1,
        title: 'Сеанс с клиентом',
        start: new Date(),
        end: new Date(Date.now() + 60 * 60 * 1000),
        resourceId: 1,
      },
    ]);
  }, []);

  return (
    <div className="p-2">
      <h1 className="text-lg font-semibold mb-1">Тайминг на неделю вперёд</h1>

      {/* ОСНОВНОЙ КОНТЕЙНЕР */}
      <div className="border border-gray-300 rounded overflow-hidden">

        {/* 🔹 ФИКСИРОВАННАЯ ОБЛАСТЬ: Дата + Режим */}
        <div className="flex bg-gray-50 border-b border-gray-300">
          <div className="flex-shrink-0 border-r border-gray-300 bg-white w-32 p-1">
            <div className="space-y-2">
              <input
                type="date"
                className="w-full border border-gray-300 rounded px-0 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setViewMode('week')}
                  className={`border p-1 text-xs ${viewMode === 'week'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 hover:bg-green-600 hover:text-white'
                    }`}
                >
                  Неделя
                </button>
                <button
                  onClick={() => setViewMode('day')}
                  className={`border p-1 text-xs ${viewMode === 'day'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 hover:bg-green-600 hover:text-white'
                    }`}
                >
                  День
                </button>
              </div>
            </div>
          </div>

          {/* 🔹 ПРОКРУЧИВАЕМАЯ ШАПКА (мастера + подшапка) */}
          <div
            onWheel={handleWheel}
            className="flex-1 overflow-x-auto max-w-full hide-scrollbar"
            // style={{ scrollBehavior: 'smooth' }}
            style={{ scrollBehavior: 'auto' }}
          >
            <table className="min-w-full text-center border-b border-gray-300">
              <thead>
                {/* 1-я строка: аватары и имена */}
                <tr>
                  {workers.map((worker) => (
                    <th
                      key={worker.id}
                      className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32 whitespace-nowrap"
                    >
                      <div className="flex flex-col items-center space-y-1">
                        {worker.avatar ? (
                          <img
                            src={`http://localhost:8000${worker.avatar}`}
                            alt={getFullName(worker)}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex flex-col items-center justify-center text-[10px] leading-tight">
                            <span>{worker.first_name?.[0] || ''}</span>
                            <span>{worker.username?.[0] || ''}</span>
                          </div>
                        )}
                        {/* Имя и Фамилия — друг под другом */}
                        <div className="flex flex-col text-xs font-medium leading-tight">
                          <span>{worker.first_name}</span>
                          <span>{worker.last_name}</span>
                        </div>
                      </div>
                    </th>
                  ))}
                  {workers.length === 0 && (
                    <th className="px-4 py-2 text-gray-400 text-sm">Нет мастеров</th>
                  )}
                </tr>

                {/* 2-я строка: ПОДШАПКА (пример: время начала/окончания смены) */}
                <tr>
                  {workers.map((worker) => (
                    <th
                      key={worker.id}
                      className="px-4 py-1 bg-gray-100 text-xs text-gray-600 min-w-32 whitespace-nowrap"
                    >
                      <div className="flex flex-col">
                        {/* <span>09:00</span> */}
                        {/* <span>→</span>
                        <span>18:00</span> */}
                      </div>
                    </th>
                  ))}
                  {workers.length === 0 && (
                    <th className="px-4 py-1 bg-gray-100 text-gray-400">—</th>
                  )}
                </tr>
              </thead>
            </table>
          </div>
        </div>

        {/* 🔹 ОБЛАСТЬ ДЛЯ КАЛЕНДАРЯ (под шапкой) */}
        <div className="h-96 bg-white">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={viewMode}                    // ← синхронизация с состоянием
            date={new Date(selectedDate)}      // ← текущая дата
            onView={(newView) => {
              setViewMode(newView as 'week' | 'day');
            }}
            onNavigate={(newDate) => {
              // При клике на "Назад", "Вперёд", "Сегодня"
              setSelectedDate(moment(newDate).format('YYYY-MM-DD'));
            }}
            style={{ height: '100%', width: '100%' }}
            views={['day', 'week']}
            showAllEvents={false}
            components={{
              event: ({ event }) => <div className="text-xs">{event.title}</div>,
            }}
            messages={{
              next: 'Вперёд',
              previous: 'Назад',
              today: 'Сегодня',
              week: 'Неделя',
              day: 'День',
              // Дополнительные переводы
              date: 'Дата',
              time: 'Время',
              event: 'Событие',
            }}
          />
        </div>
      </div>
    </div>
  );
}
