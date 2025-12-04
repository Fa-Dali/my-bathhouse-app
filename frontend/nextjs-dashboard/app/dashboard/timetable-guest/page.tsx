// Ссылка страницы http://localhost:3000/dashboard/timetable-guest

// app/dashboard/timetable-guest/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Calendar as RBCalendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, startOfWeek, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import api from '@/app/utils/axiosConfig';

// Интерфейсы
interface Booking {
  id: number;
  master_ids: number[];
  start: string;
  end: string;
  steam_program: string;
  massage: string;
  hall: 'muromets' | 'nikitich' | 'popovich' | 'massage_l' | 'massage_p';
  payments: Array<{ amount: number; method: string }>;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  steamProgram: string;
  clientName: string;
  resourceId: string; // ← ID аудитории (ключ)
}

// Локализация
const localizer = dateFnsLocalizer({
  format: (date: Date, formatStr: string, context?: any) => {
    return format(date, formatStr, { locale: ru });
  },
  parse: (dateStr: string, formatStr: string, context?: any): Date => {
    // Здесь formatStr игнорируется, т.к. мы доверяем ISO/UTC строкам от API
    return new Date(dateStr);
  },
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay: (date: Date) => getDay(date),
  locales: { ru },
});

// Ресурсы (аудитории)
const rooms = [
  { id: 'muromets', name: 'Муромец' },
  { id: 'nikitich', name: 'Никитич' },
  { id: 'popovich', name: 'Попович' },
  { id: 'massage_l', name: 'Массажная Л' },
  { id: 'massage_p', name: 'Массажная П' },
];

export default function Page() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingsRes = await api.get('/api/scheduling/bookings/');
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setDate(endOfDay.getDate() + 1);
        endOfDay.setHours(23, 59, 59, 999);

        const mappedEvents: CalendarEvent[] = bookingsRes.data
          .map((b: Booking) => {
            const start = new Date(b.start);
            const end = new Date(b.end);
            if (start >= endOfDay || end <= startOfDay) return null;

            const validHalls: (typeof rooms)[number]['id'][] = [
              'muromets',
              'nikitich',
              'popovich',
              'massage_l',
              'massage_p',
            ];

            if (!validHalls.includes(b.hall)) return null;

            return {
              id: b.id,
              title: b.steam_program || 'Бронь',
              start,
              end,
              steamProgram: b.steam_program,
              clientName: b.massage,
              resourceId: b.hall,
            };
          })
          .filter((e: CalendarEvent | null): e is CalendarEvent => e !== null);

        setEvents(mappedEvents);
      } catch (err) {
        console.error('Ошибка загрузки броней:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  const eventPropGetter = (event: CalendarEvent) => ({
    style: {
      backgroundColor: '#d1fae5',
      color: '#166534',
      border: '1px solid #b2f3d0',
    },
  });

  const EventComponent = ({ event }: { event: CalendarEvent }) => (
    <div>
      <strong>{event.steamProgram}</strong>
      <div>{event.clientName}</div>
    </div>
  );

  if (loading) return <div className="p-4">Загрузка...</div>;

  return (
    <div className="p-4">
      {/* ЗАГОЛОВОК И ТАЙМИНГ ВСЕХ МАСТЕРОВ НА ДЕНЬ */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Дата:</label>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="input input-bordered h-10"
          />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 whitespace-nowrap">
          ТАЙМИНГ АУДИТОРИЙ
        </h1>
      </div>

      {/* === СТИКИ ТУЛБАР === */}
      <div className="sticky top-0 z-30 bg-white border-t border-b border-gray-300 px-4 py-2 flex items-center justify-between mb-2">
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

      <div className="border border-gray-300 rounded overflow-hidden">
  {/* Горизонтальная прокрутка */}
  <div className="overflow-x-auto">
    {/* Минимальная ширина — чтобы не сжимались колонки */}
    <div style={{ minWidth: '800px', width: '100%' }}>
      <RBCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view="day"
        date={selectedDate}
        onNavigate={(newDate) => setSelectedDate(newDate)}
        views={['day']}
        resources={rooms}
        resourceIdAccessor="id"
        resourceTitleAccessor="name"
        step={30}
        timeslots={2}
        min={new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0)}
        max={new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59)}
        formats={{
          timeGutterFormat: (date) => format(date, 'HH:mm', { locale: ru }),
          eventTimeRangeFormat: ({ start, end }) =>
            `${format(start, 'HH:mm', { locale: ru })} – ${format(end, 'HH:mm', { locale: ru })}`,
        }}
        components={{
          event: EventComponent,
          resourceHeader: ({ resource }) => (
            <div className="p-2 font-medium text-center">{resource.name}</div>
          ),
          toolbar: () => null,
        }}
        eventPropGetter={eventPropGetter}
        style={{ height: '77vh', width: '100%' }}
      />
    </div>
  </div>
</div>

    </div>
  );
}
