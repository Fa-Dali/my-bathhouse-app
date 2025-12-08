// app/dashboard/timing-all-masters/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Calendar as RBCalendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import api from '@/app/utils/axiosConfig';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
// import Smooth from 'react-smooth';

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


  const CustomToolbar = (toolbar: any) => {
    const date = toolbar.date;
    const locale = 'ru';

    const navigate = (action: string) => {
      toolbar.onNavigate(action);
    };

    const formatMonthYear = (date: Date, locale: string) => {
      return new Intl.DateTimeFormat(locale, {
        month: 'long',
        year: 'numeric',
      }).format(date);
    };

    const formatDay = (date: Date, locale: string) => {
      return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        weekday: 'long',
      }).format(date);
    };

    return (
      <div className="rbc-toolbar">
        <span className="rbc-btn-group">
          <button type="button" onClick={() => navigate('TODAY')}>
            Сегодня
          </button>
          <button type="button" onClick={() => navigate('PREV')}>
            Назад
          </button>
          <button type="button" onClick={() => navigate('NEXT')}>
            Вперёд
          </button>
        </span>

        <span className="rbc-toolbar-label">
          {/* Например: "четверг, 27 ноября 2025" */}
          <span className="text-lg font-semibold">
            {formatDay(date, locale).replace(/(\d+) (\w+)/, '$1 $2')} {/* фикс для склонения */}
          </span>
        </span>
      </div>
    );
  };


  if (loading) return <p className="p-4">Загрузка...</p>;



  return (
    <div className="p-2">

      {/* ЗАГОЛОВОК И ТАЙМИНГ ВСЕХ МАСТЕРОВ НА ДЕНЬ */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium"></label>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="input input-bordered h-10"
          />
          <h1 className="text-sm lg:text-xl font-bold text-gray-800 whitespace-nowrap">
            ТАЙМИНГ МАСТЕРОВ : ДЕНЬ
          </h1>
        </div>
      </div>

      {/* === СТИКИ ТУЛБАР: КНОПКИ И ДАТА === */}
      <div
        className="sticky top-0 z-30 bg-white border-t border-b border-gray-300 px-1 py-1 flex items-center justify-between"
        style={{ width: '100%' }}
      >
        {/* Кнопки слева */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSelectedDate(new Date())}
            className="btn btn-sm bg-slate-500 text-white hover:bg-cyan-700 rounded px-2"
          >
            Сегодня
          </button>
          <button
            type="button"
            onClick={() =>
              setSelectedDate((prev) => {
                const newDate = new Date(prev);
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
              setSelectedDate((prev) => {
                const newDate = new Date(prev);
                newDate.setDate(newDate.getDate() + 1);
                return newDate;
              })
            }
            className="btn btn-sm border rounded px-2"
          >
            Вперёд
          </button>
        </div>

        {/* Дата — справа, растягивается */}
        <div className="ml-4 text-lg font-semibold text-gray-800">
          {new Intl.DateTimeFormat('ru', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
          })
            .format(selectedDate)
            .replace('.', '')}
        </div>
      </div>




      {/* ОСНОВНОЙ КАЛЕНДАРЬ */}

        <div className="border border-gray-300 rounded overflow-hidden mt-0">
          {/* Главное окно прокрутки */}
          <div className="overflow-x-auto beautiful-scroll">

            {/* Шапка мастеров */}
            <div className="bg-gray-50 border-b border-gray-300" style={{ minWidth: 'fit-content' }}>

              <table className="w-full " style={{ tableLayout: 'fixed', width: 'fit-content' }}>

                {/* Шапка мастеров */}
                <colgroup>
                  <col style={{ width: '50px' }} />
                  {workers.map((worker) => (
                    <col key={`col-${worker.id}`} style={{ width: '110px' }} />
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
                        <div className="flex flex-col items-center space-y-1 px-1 py-1">
                          {worker.avatar ? (
                            <img
                              // src={`http://localhost:8000${worker.avatar}`}
                              src={`http://192.168.1.169:8000${worker.avatar}`}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center font-bold text-white">
                              {worker.first_name?.[0]}
                            </div>
                          )}
                          <div className="text-indigo-800 text-[8px] leading-none">{worker.first_name}</div>
                          <div className="text-indigo-800 text-[8px] leading-none">{worker.last_name}</div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
              </table>
            </div>

            {/* Тело календаря */}
            <div className="h-[63vh] lg:h-[70vh]" style={{ minWidth: `${50 + workers.length * 110}px` }}>

              <Calendar
                className="custom-resource-calendar"
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                view="day"
                date={selectedDate}
                onNavigate={(newDate) => setSelectedDate(newDate)}
                views={['day']}
                resources={workers}
                resourceIdAccessor="id"
                resourceTitleAccessor={(r) => `${r.first_name} ${r.last_name}`}
                step={30}
                timeslots={2}
                formats={{
                  timeGutterFormat: (date) => format(date, 'HH:mm', { locale: ru }),
                  eventTimeRangeFormat: ({ start, end }) =>
                    `${format(start, 'HH:mm', { locale: ru })} – ${format(end, 'HH:mm', { locale: ru })}`,
                }}
                components={{
                  event: EventComponent,
                  resourceHeader: () => null,
                  toolbar: () => null,
                }}
                eventPropGetter={eventPropGetter}
                resizable
                selectable
                style={{ height: '100%' }}
              />

            </div>

          </div>
        </div>

    </div>
  );
}
