// Ссылка страницы http://localhost:3000/dashboard.

'use client';

import { useState } from 'react';
import HolidayWidget from '@/app/components/HolidayWidget';
import WeatherWidget from '@/app/components/WeatherWidget';

export default function Page() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="p-4">
      {/* СЕТКА: 2/3 | 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">


        {/* === ЛЕВАЯ КОЛОНКА (2/3) === */}

        <div className="lg:col-span-2 space-y-2 beautiful-scroll overflow-y-auto h-[580px]">
          {/* === ВЫБОР ДАТЫ === */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Дата:</label>
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="input input-bordered h-10"
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-600 whitespace-nowrap ">
              ДАШБОРД
            </h1>
          </div>



          {/* === СТИКИ ТУЛБАР === */}
          <div className="sticky top-0 z-30 bg-white border-t border-b border-indigo-700 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedDate(new Date())}
                className="btn btn-sm bg-slate-500 text-white hover:bg-slate-600 rounded px-2"
              >
                Сегодня
              </button>
              <button
                type="button"
                onClick={() =>
                  setSelectedDate((d) => {
                    const newDate = new Date(d);
                    newDate.setDate(newDate.getDate() - 1);
                    return newDate;
                  })
                }
                className="btn btn-sm border rounded px-2"
              >
                Назад
              </button>
              <button
                type="button"
                onClick={() =>
                  setSelectedDate((d) => {
                    const newDate = new Date(d);
                    newDate.setDate(newDate.getDate() + 1);
                    return newDate;
                  })
                }
                className="btn btn-sm border rounded px-2"
              >
                Вперёд
              </button>
            </div>
            <div className="text-lg font-semibold text-gray-800">
              {new Intl.DateTimeFormat('ru', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
              })
                .format(selectedDate)
                .replace('.', '')}
            </div>
          </div>

          {/* === ВИДЖЕТ ПОГОДЫ === */}
          <WeatherWidget selectedDate={selectedDate} />

          {/* Основной контент дашборда */}
          {/* <div className="mt-6">
            <p className="text-lg font-medium text-gray-800">ДОСТУПНА: ВСЕМ</p>
            <p className="text-gray-600">Страница: Дашборд</p>
          </div> */}
        </div>



        {/* === ПРАВАЯ КОЛОНКА (1/3) — КАЛЕНДАРЬ === */}
        <div className="space-y-1">
          < HolidayWidget
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate} // ← передаём функцию
          />
        </div>


      </div>
    </div>
  );
}
