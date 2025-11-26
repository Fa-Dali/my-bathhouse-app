// app/dashboard/timing-all-masters/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
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

      <div className="beautiful-scroll overflow-auto" style={{ height: '86vh' }}>
        <div style={{ minWidth: '1200px' }}>
          <Calendar
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
            style={{ height: '100%', width: '100%' }}
            formats={{
              timeGutterFormat: (date) => format(date, 'HH:mm', { locale: ru }),
              eventTimeRangeFormat: ({ start, end }) =>
                `${format(start, 'HH:mm', { locale: ru })} – ${format(end, 'HH:mm', { locale: ru })}`,
            }}
            components={{
              event: EventComponent,
              resourceHeader: ({ resource }) => (
                <div className="flex flex-col items-center p-2 text-xs">
                  {resource.avatar ? (
                    <img
                      src={`http://localhost:8000${resource.avatar}`}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center font-bold">
                      {resource.first_name?.[0]}
                    </div>
                  )}
                  <div>{resource.first_name}</div>
                  <div>{resource.last_name}</div>
                </div>
              ),
            }}
            eventPropGetter={eventPropGetter}
            resizable
            selectable
          // onEventDrop={...} если нужен DnD
          />
        </div>
      </div>
    </div>
  );
}
