// app/dashboard/timing-all-masters/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Calendar as RBCalendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import api from '@/app/utils/axiosConfig';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'

// Интерфейсы
interface Worker {
  id: number;
  first_name: string;
  last_name: string;
  avatar: string | null;
}

interface Booking {
  id: number;
  master_ids: number[];
  start: string;
  end: string;
  steam_program: string;
  massage: string;
  hall: string;
  payments: Array<{ amount: number; method: string }>;
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
  isBooking: boolean;
  hall?: string;
  steamProgram?: string;
  massage?: string;
  masterIds?: number[];
  resourceId?: number; // ← ID мастера
}

// Создаём календарь с DnD
const Calendar = withDragAndDrop<CalendarEvent, Worker>(RBCalendar);

// Локализация
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { ru },
});

export default function Page() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);


  // =======================================================================================
  // const calendarRef = React.useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const container = calendarRef.current;
  //   if (!container) return;

  //   // Ждём, пока календарь отрендерится
  //   const observer = new MutationObserver(() => {
  //     const headerCells = container.querySelectorAll('.rbc-row:first-child .rbc-header');
  //     if (headerCells.length === 0) return;

  //     const handleWheel = (e: WheelEvent) => {
  //       // Проверяем, что колесико — над шапкой
  //       const isOverHeader = [...headerCells].some(cell => cell.contains(e.target as Node));
  //       if (!isOverHeader) return;

  //       e.preventDefault();
  //       const timeContent = container.querySelector('.rbc-time-content') as HTMLElement | null;
  //       if (timeContent) {
  //         timeContent.scrollLeft += e.deltaY;
  //       }
  //     };

  //     // Убираем старый обработчик, если был
  //     const wrapper = container.closest('.rbc-calendar');
  //     if ((wrapper as any)._wheelAttached) return;
  //     (wrapper as any)._wheelAttached = true;

  //     container.addEventListener('wheel', handleWheel, { passive: false });

  //     observer.disconnect(); // Убираем observer

  //     // Очистка
  //     return () => {
  //       container.removeEventListener('wheel', handleWheel);
  //       if (wrapper) (wrapper as any)._wheelAttached = false;
  //     };
  //   });

  //   observer.observe(container, { childList: true, subtree: true });

  //   return () => observer.disconnect();
  // }, []);
  // =======================================================================================


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, bookingsRes, availRes] = await Promise.all([
          api.get('/api/users/'),
          api.get('/api/scheduling/bookings/'),
          api.get('/api/scheduling/availabilities/'),
        ]);

        // Фильтруем мастеров
        const masters = usersRes.data
          .filter((u: any) => u.roles.some((r: any) => r.code === 'paramaster' || r.code === 'masseur'))
          .map((u: any) => ({
            id: u.id,
            first_name: u.first_name,
            last_name: u.last_name,
            avatar: u.avatar,
          }));
        setWorkers(masters);

        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const filteredEvents: CalendarEvent[] = [];

        // Брони
        bookingsRes.data.forEach((b: Booking) => {
          const bStart = new Date(b.start);
          const bEnd = new Date(b.end);
          if (bStart > endOfDay || bEnd < startOfDay) return;

          b.master_ids.forEach((masterId) => {
            if (!masters.find((m: Worker) => m.id === masterId)) return;
            filteredEvents.push({
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
              resourceId: masterId,
            });
          });
        });

        // Недоступности
        availRes.data
          .filter((a: Availability) => !a.is_available)
          .forEach((a: Availability) => {
            const aStart = new Date(a.start);
            const aEnd = new Date(a.end);
            if (aStart > endOfDay || aEnd < startOfDay) return;
            if (!masters.find((m: Worker) => m.id === a.master)) return;

            filteredEvents.push({
              id: a.id,
              title: 'Недоступен',
              start: aStart,
              end: aEnd,
              type: 'unavailable',
              isBooking: false,
              resourceId: a.master,
            });
          });

        setEvents(filteredEvents);
      } catch (err) {
        console.error('Ошибка загрузки:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const eventPropGetter = (event: CalendarEvent) => {
    if (event.isBooking) {
      return {
        style: {
          backgroundColor: '#d1fae5',
          color: '#166534',
          border: '1px solid #b2f3d0',
        },
      };
    }
    return {
      style: {
        backgroundColor: '#fee2e2',
        color: '#b91c1c',
        border: '1px solid #fecaca',
      },
    };
  };

  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    if (event.isBooking) {
      const masterNames = event.masterIds
        ?.map(id => workers.find(w => w.id === id))
        .filter((w): w is Worker => w !== undefined) // ✅ Явная типизация
        .map(w => `${w.first_name} ${w.last_name ? w.last_name[0] + '.' : ''}`)
        .join(', ') || '—';

      return (
        <div title={`Клиент: ${event.massage}`}>
          <strong>{event.steamProgram}</strong>
          <div>Клиент: {event.massage}</div>
          <div>Мастер: {masterNames}</div>
          {event.hall && (
            <div className="text-xs text-blue-700">
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
    }
    return <div>Недоступен</div>;
  };

  if (loading) return <p className="p-4">Загрузка...</p>;



  return (
    <div className="p-4">

      {/* ЗАГОЛОВОК И ТАЙМИНГ ВСЕХ МАСТЕРОВ НА ДЕНЬ */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        {/* Левая часть: метка + дата */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Дата:</label>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="input input-bordered h-10"
          />
        </div>

        {/* Заголовок — остаётся как есть, но теперь в строке */}
        <h1 className="text-2xl font-bold text-gray-800 whitespace-nowrap">
          ТАЙМИНГ ВСЕХ МАСТЕРОВ НА ДЕНЬ
        </h1>
      </div>

      {/* Основной контейнер: шапка + тело */}
      <div className="border border-gray-300 rounded overflow-hidden">

        {/* Шапка мастеров — фиксирована */}
        <div className="bg-gray-50 border-b border-gray-300">
          <div className="overflow-x-auto hide-scrollbar">

            {/* Настройка ширины колонок шапки и тела календаря + CSS */}
            <div style={{ display: 'table', tableLayout: 'fixed', width: 'fit-content' }} className="w-full">
              <table className="w-full" style={{ tableLayout: 'fixed', width: 'fit-content' }}>
                <colgroup>
                  <col style={{ width: '50px' }} />
                  {workers.map(() => (
                    <col style={{ width: '110px' }} />
                  ))}
                </colgroup>
                <thead>
                  <tr>
                    <th className="w-12 bg-slate-100 border-r border-gray-300 p-0"></th>
                    {workers.map((worker) => (
                      <th
                        key={worker.id}
                        className="w-[110px] bg-slate-100 text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200 p-0"
                        style={{ width: '110px', minWidth: '110px', maxWidth: '110px' }}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          {worker.avatar ? (
                            <img
                              src={`http://localhost:8000${worker.avatar}`}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center font-bold text-white">
                              {worker.first_name?.[0]}
                            </div>
                          )}
                          <div>{worker.first_name}</div>
                          <div>{worker.last_name}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

              </table>
            </div>





          </div>
        </div>

        {/* Тело календаря — прокручивается */}
        <div className="beautiful-scroll h-[70vh] overflow-y-auto overflow-x-auto">
          <div style={{ minWidth: 'fit-content' }}>
            <Calendar
              className="custom-resource-calendar"
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              view="day"
              date={selectedDate}
              views={['day']}
              resources={workers}
              resourceIdAccessor="id"
              resourceTitleAccessor={(r) => `${r.first_name} ${r.last_name}`}
              step={30}
              formats={{
                timeGutterFormat: (date) => format(date, 'HH:mm', { locale: ru }),
                eventTimeRangeFormat: ({ start, end }) =>
                  `${format(start, 'HH:mm', { locale: ru })} – ${format(end, 'HH:mm', { locale: ru })}`,
              }}
              components={{
                event: EventComponent,
                resourceHeader: () => null, // ❌ Важно: шапка выключена
              }}
              eventPropGetter={eventPropGetter}
              resizable
              selectable
              messages={{ next: 'Вперёд', previous: 'Назад', today: 'Сегодня' }}
              style={{ height: '100%', width: '100%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
