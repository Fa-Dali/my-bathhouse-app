// app/dashboard/timing-all-masters/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import api from '@/app/utils/axiosConfig';

import { format, parseISO, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { ru } from 'date-fns/locale';

// Интерфейсы (скопированы из timing-one-master)
interface Worker {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  roles: Array<{ code: string; name: string }>;
}

interface Booking {
  id: number;
  master_ids: number[];
  start: string;
  end: string;
  steam_program: string;
  massage: string;
  payments: Array<{ amount: number; method: string }>;
  hall: string;
}

interface Availability {
  id: number;
  master: number;
  start: string;
  end: string;
  is_available: boolean;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  type: 'available' | 'unavailable';
  isBooking?: boolean;
  hall?: string;
  steamProgram?: string;
  massage?: string;
  masterIds?: number[];
}

export default function Page() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Получаем мастеров
        const workersRes = await api.get('/api/users/');
        const masters = workersRes.data.filter((u: any) =>
          u.roles.some((r: any) => r.code === 'paramaster' || r.code === 'masseur')
        );
        setWorkers(masters);

        // Получаем брони и недоступности
        const [bookingsRes, availRes] = await Promise.all([
          api.get('/api/scheduling/bookings/'),
          api.get('/api/scheduling/availabilities/'),
        ]);

        const start = startOfDay(new Date(selectedDate));
        const end = endOfDay(new Date(selectedDate));

        const dayEvents: CalendarEvent[] = [];

        // Брони
        bookingsRes.data.forEach((b: Booking) => {
          const bStart = new Date(b.start);
          const bEnd = new Date(b.end);
          if (!isWithinInterval(bStart, { start, end })) return;

          b.master_ids.forEach((masterId) => {
            dayEvents.push({
              id: b.id,
              title: 'Услуга',
              start: bStart,
              end: bEnd,
              type: 'unavailable',
              isBooking: true,
              hall: b.hall,
              steamProgram: b.steam_program,
              massage: b.massage,
              masterIds: b.master_ids,
            });
          });
        });

        // Недоступности
        availRes.data
          .filter((a: Availability) => a.is_available === false)
          .forEach((a: Availability) => {
            const aStart = new Date(a.start);
            const aEnd = new Date(a.end);
            if (!isWithinInterval(aStart, { start, end })) return;

            dayEvents.push({
              id: a.id,
              title: 'Недоступен',
              start: aStart,
              end: aEnd,
              type: 'unavailable',
              isBooking: false,
            });
          });

        setEvents(dayEvents);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const getWorkerName = (w: Worker) =>
    [w.first_name, w.last_name].filter(Boolean).join(' ') || w.username;

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="p-4 h-[80%]">
      <h1 className="text-2xl font-bold mb-4">ТАЙМИНГ ВСЕХ МАСТЕРОВ НА ДЕНЬ</h1>

      {/* Выбор даты */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Выберите дату:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="input input-bordered"
        />
      </div>

      {/* Вертикальный и горизонтальный скролл */}
      <div className="border border-gray-400 rounded overflow-hidden">
        {/* Заголовки — мастера */}
        <div className="bg-gray-200 overflow-x-auto hide-scrollbar" style={{ width: '100%' }}>
          <div style={{ minWidth: '1200px' }} className="flex">
            {workers.map((worker) => (
              <div
                key={worker.id}
                className="min-w-60 border-r border-gray-300 p-2 text-center text-xs font-medium bg-white"
              >
                <div className="flex flex-col items-center space-y-1">
                  {worker.avatar ? (
                    <img
                      src={`http://localhost:8000${worker.avatar}`}
                      alt={getWorkerName(worker)}
                      className="h-10 w-10 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                      {worker.first_name?.[0] || 'M'}
                    </div>
                  )}
                  <div>
                    <div>{worker.first_name}</div>
                    <div>{worker.last_name}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Календарь — время */}
        <div className="bg-white overflow-auto" style={{ height: '70vh', width: '100%' }}>
          <div style={{ minWidth: '1200px', display: 'flex' }}>
            {workers.map((worker) => (
              <div
                key={worker.id}
                className="min-w-60 border-r border-gray-300 relative"
                style={{ height: '100%' }}
              >
                {/* Сетка времени — 24 часа */}
                <div className="relative h-full">
                  {/* Часы слева */}
                  <div className="absolute left-0 top-0 w-12 h-full bg-gray-50 border-r border-gray-300 text-xs text-gray-600">
                    {Array.from({ length: 24 }, (_, h) => (
                      <div
                        key={h}
                        className="h-16 border-b border-gray-200 flex items-center justify-center"
                      >
                        {h.toString().padStart(2, '0')}:00
                      </div>
                    ))}
                  </div>

                  {/* Слоты времени — основная область */}
                  <div className="ml-12 h-full">
                    {Array.from({ length: 24 }, (_, h) => (
                      <div
                        key={h}
                        className="h-16 border-b border-gray-200 relative hover:bg-gray-50"
                      />
                    ))}

                    {/* События */}
                    {events
                      .filter((e) =>
                        'masterIds' in e
                          ? e.masterIds?.includes(worker.id)
                          : false
                      )
                      .map((event) => {
                        const top = ((event.start.getHours() * 60 + event.start.getMinutes()) / 60) * 16; // 16px на час
                        const height = ((event.end.getTime() - event.start.getTime()) / (1000 * 60)) * (16 / 60); // px per minute

                        return (
                          <div
                            key={event.id}
                            className={`absolute left-1 right-1 text-xs rounded border px-1 ${
                              event.isBooking
                                ? 'bg-green-100 border-green-300 text-green-800'
                                : 'bg-red-100 border-red-300 text-red-800'
                            }`}
                            style={{ top: `${top}px`, height: `${height}px` }}
                            title={event.isBooking ? event.massage || '' : 'Недоступен'}
                          >
                            <strong>{event.isBooking ? event.steamProgram : 'Недоступен'}</strong>
                            {event.isBooking && event.hall && (
                              <div className="text-blue-700 text-[10px]">
                                {{
                                  muromets: 'Муромец',
                                  nikitich: 'Никитич',
                                  popovich: 'Попович',
                                  massage_l: 'Массаж Л',
                                  massage_p: 'Массаж П',
                                }[event.hall]}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
