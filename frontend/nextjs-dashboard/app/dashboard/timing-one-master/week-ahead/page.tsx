// Ссылка страницы http://localhost:3000/dashboard/timing-one-master

'use client';

import React, { useEffect, useState } from 'react';
import api from '@/app/utils/axiosConfig';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Настройка локализации через date-fns
const locales = {
  'ru': ru,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }), // неделя начинается с понедельника
  getDay: (date: Date) => getDay(date),
  locales,
});

// Дополнительные форматы для русского языка
const formats = {
  // Для ячеек календаря: "10 Пн"
  dayFormat: (date: Date) => {
    const day = format(date, 'd', { locale: ru });
    const weekdayIndex = getDay(date);
    const shortDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const shortDay = shortDays[weekdayIndex];
    return `${day} ${shortDay}`;
  },

  weekdayFormat: (date: Date) => {
    const weekdayIndex = getDay(date);
    const shortDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return shortDays[weekdayIndex];
  },


  // Показывает только месяц: "Ноябрь"
  monthHeaderFormat: (date: Date) => format(date, 'LLLL', { locale: ru }),

  // Для диапазона недели: "5 – 11 ноября"
  dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${format(start, 'd')} – ${format(end, 'd LLLL', { locale: ru })}`,

  // Для заголовка дня: "Понедельник, 11 ноября"
  dayHeaderFormat: (date: Date) => format(date, 'EEEE, d LLLL', { locale: ru }),

  // Название дня в шапке: "Пн"
  // weekdayFormat: (date: Date) => format(date, 'EEE', { locale: ru }),

  // Формат времени в слотах: "9:00"
  timeGutterFormat: (date: Date) => format(date, 'H:mm', { locale: ru }),
};

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
  const [events, setEvents] = useState<any[]>([]);

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
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const container = e.currentTarget;
    container.scrollLeft += e.deltaY > 0 ? 100 : -100;
  };

  // Форматируем имя
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
      },
    ]);
  }, []);

  return (
    <div className="p-0">
      {/* <h1 className="text-lg font-semibold mb-1">Тайминг на неделю вперёд</h1> */}

      {/* ОСНОВНОЙ КОНТЕЙНЕР */}
      <div className="border border-gray-400 rounded overflow-hidden">

        {/* 🔹 ФИКСИРОВАННАЯ ОБЛАСТЬ: Дата + Режим */}
        <div className="flex bg-gray-300 border-b border-gray-300 p-1">
          <div className="flex-shrink-0 border-r border-gray-400 bg-white w-40 p-1">
            <div className="space-y-2 bg-gray-300 h-full w-full">
              <input
                type="date"
                className="text-center border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 mb-0"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setViewMode('day');
                }}
              />
              <div className="flex w-full">
                <button
                  onClick={() => setViewMode('day')}
                  className={`w-1/2 border hover:border-slate-700 p-1 text-xs ${viewMode === 'day'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 hover:bg-green-600 hover:text-white'
                    }`}
                >
                  День
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`w-1/2 border hover:border-slate-700 p-1 text-xs ${viewMode === 'week'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 hover:bg-green-600 hover:text-white'
                    }`}
                >
                  Неделя
                </button>
              </div>
            </div>
          </div>

          {/* 🔹 ПРОКРУЧИВАЕМАЯ ШАПКА (мастера) */}
          <div
            onWheel={handleWheel}
            className="flex-1 overflow-x-auto max-w-full hide-scrollbar"
            style={{ scrollBehavior: 'auto' }}
          >
            <table className="min-w-full text-center border-b border-gray-300">
              <thead>
                {/* 1-я строка: аватары и имена */}
                <tr>
                  {workers.map((worker) => (
                    <th
                      key={worker.id}
                      className="px-1 py-1 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32 whitespace-nowrap"
                    >
                      <div className="border border-slate-800 bg-slate-600 hover:bg-sky-800 rounded-sm">
                        <div className="flex flex-col items-center space-y-1">
                          {worker.avatar ? (
                            <img
                              src={`http://localhost:8000${worker.avatar}`}
                              alt={getFullName(worker)}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex flex-col items-center justify-center leading-tight">
                              <span>{worker.first_name?.[0] || ''}</span>
                              <span>{worker.username?.[0] || ''}</span>
                            </div>
                          )}
                          {/* Имя и Фамилия — друг под другом */}
                          <div className="flex flex-col text-xs text-white text-[8px] font-medium leading-tight">
                            <span>{worker.first_name}</span>
                            <span>{worker.last_name}</span>
                          </div>
                        </div>
                      </div>

                    </th>
                  ))}
                  {workers.length === 0 && (
                    <th className="px-4 py-2 text-gray-400 text-sm">Нет мастеров</th>
                  )}
                </tr>

                

              </thead>
            </table>
          </div>
        </div>

        {/* 🔹 ОБЛАСТЬ ДЛЯ КАЛЕНДАРЯ */}
        <div className="h-96 bg-white">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={viewMode}
            date={new Date(selectedDate)}
            onView={(newView) => {
              if (newView === 'day' || newView === 'week') {
                setViewMode(newView);
              }
              // Если пришёл 'month' — игнорируем (или обрабатываем отдельно)
            }}
            onNavigate={(newDate) => {
              const formatted = new Date(newDate).toISOString().split('T')[0];
              setSelectedDate(formatted);
            }}
            style={{ height: '100%', width: '70%' }}
            views={['day', 'week']}
            showAllEvents={false}
            formats={formats}  // ← передаём кастомные форматы
            messages={{
              next: 'Вперёд',
              previous: 'Назад',
              today: 'Сегодня',
              week: 'Неделя',
              day: 'День',
            }}
          />
        </div>
      </div>
    </div>
  );
}
