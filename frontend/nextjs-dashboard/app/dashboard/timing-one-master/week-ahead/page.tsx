// Ссылка страницы: http://localhost:3000/dashboard/timing-one-master

'use client';

import React, { useEffect, useState } from 'react';
import api from '@/app/utils/axiosConfig';

// 1. Основной Calendar
import { Calendar as RBCalendar } from 'react-big-calendar';

// 2. Drag & Drop
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

// 3. Локализация — ОТДЕЛЬНО (важно!)
import { dateFnsLocalizer } from 'react-big-calendar';

// 4. Стили
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

// 5. Работа с датами
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';

// Интерфейсы
interface Worker {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  roles: Array<{ code: string; name: string }>;
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
  allDay?: boolean;
}

// ✅ Создаём Calendar с DnD и указываем тип события
const Calendar = withDragAndDrop<CalendarEvent>(RBCalendar);

// ✅ Создаём localizer (ПРАВИЛЬНО!)
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: {
    ru,
  },
});

// Форматы для русского языка
const formats = {
  dayFormat: (date: Date) => {
    const day = format(date, 'd', { locale: ru });
    const weekdayIndex = getDay(date);
    const shortDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return `${day} ${shortDays[weekdayIndex]}`;
  },
  weekdayFormat: (date: Date) => {
    const weekdayIndex = getDay(date);
    const shortDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return shortDays[weekdayIndex];
  },
  monthHeaderFormat: (date: Date) => format(date, 'LLLL', { locale: ru }),
  dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${format(start, 'd')} – ${format(end, 'd LLLL', { locale: ru })}`,
  dayHeaderFormat: (date: Date) => format(date, 'EEEE, d LLLL', { locale: ru }),
  timeGutterFormat: (date: Date) => format(date, 'H:mm', { locale: ru }),
};

export default function Page() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Выбор мастера
  const handleWorkerSelect = (worker: Worker) => setSelectedWorker(worker);

  // Горизонтальная прокрутка шапки
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.scrollLeft += e.deltaY > 0 ? 100 : -100;
  };

  // Клик по свободной ячейке → создать слот
  const handleSelectSlot = async ({ start, end }: { start: Date; end: Date }) => {
    if (!selectedWorker) return;

    try {
      const response = await api.post('/api/scheduling/availabilities/create/', {
        master: selectedWorker.id,
        start: start.toISOString(),
        end: end.toISOString(),
        is_available: true,
      });

      const newAvailability = response.data;
      setAvailabilities([...availabilities, newAvailability]);
      setEvents([
        ...events,
        {
          id: Number(newAvailability.id),
          title: 'Доступен',
          start: new Date(newAvailability.start),
          end: new Date(newAvailability.end),
          type: 'available',
          allDay: false,
        },
      ]);
    } catch (err) {
      console.error('Ошибка создания доступности:', err);
    }
  };

  // Формат имени мастера
  const getFullName = (worker: Worker) =>
    [worker.first_name, worker.last_name].filter(Boolean).join(' ') || worker.username;

  // Клик по событию
  const handleSelectEvent = (event: CalendarEvent) => {
    if (!selectedWorker) return;

    const confirmed = window.confirm(
      `Удалить слот "${event.title}"?\n${format(event.start, 'H:mm')} — ${format(event.end, 'H:mm')}`
    );
    if (confirmed) handleDeleteEvent(event);
  };

  // Удаление слота
  const handleDeleteEvent = async (event: CalendarEvent) => {
    try {
      await api.delete(`/api/scheduling/availabilities/${event.id}/`);
      setAvailabilities(availabilities.filter(a => a.id !== event.id));
      setEvents(events.filter(e => e.id !== event.id));
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Не удалось удалить слот');
    }
  };

  // Перетаскивание события
  const handleEventDrop = async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
    console.log('Перетаскивание:', { id: event.id, start, end });

    try {
      await api.patch(`/api/scheduling/availabilities/${event.id}/`, {
        start: start.toISOString(),
        end: end.toISOString(),
      });

      const updatedEvent = { ...event, start, end };
      setEvents(events.map(e => (e.id === event.id ? updatedEvent : e)));
      setAvailabilities(
        availabilities.map(a =>
          a.id === event.id ? { ...a, start: start.toISOString(), end: end.toISOString() } : a
        )
      );
    } catch (err) {
      console.error('Ошибка перетаскивания:', err);
      alert('Не удалось переместить слот');
    }
  };

  // Изменение длительности
  const handleEventResize = async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
    try {
      await api.patch(`/api/scheduling/availabilities/${event.id}/`, {
        start: start.toISOString(),
        end: end.toISOString(),
      });

      const updatedEvent = { ...event, start, end };
      setEvents(events.map(e => (e.id === event.id ? updatedEvent : e)));
      setAvailabilities(
        availabilities.map(a =>
          a.id === event.id ? { ...a, start: start.toISOString(), end: end.toISOString() } : a
        )
      );
    } catch (err) {
      console.error('Ошибка изменения длительности:', err);
      alert('Не удалось изменить длительность');
    }
  };

  // Загрузка мастеров
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
            roles: u.roles,
          }));
        setWorkers(filtered);
        if (filtered.length > 0) setSelectedWorker(filtered[0]);
      } catch (err) {
        console.error('Ошибка загрузки мастеров:', err);
      }
    };
    fetchWorkers();
  }, []);

  // Загрузка доступности
  useEffect(() => {
    if (!selectedWorker) return;

    const fetchAvailabilities = async () => {
      try {
        const response = await api.get('/api/scheduling/availabilities/');
        const filtered = response.data.filter((a: any) => a.master === selectedWorker.id);
        setAvailabilities(filtered);

        const calendarEvents = filtered.map((a: Availability): CalendarEvent => ({
          id: Number(a.id),
          title: a.is_available ? 'Доступен' : 'Недоступен',
          start: new Date(a.start),
          end: new Date(a.end),
          type: a.is_available ? 'available' : 'unavailable',
          allDay: false,
        }));
        setEvents(calendarEvents);
      } catch (err) {
        console.error('Ошибка загрузки доступности:', err);
      }
    };

    fetchAvailabilities();
  }, [selectedWorker]);

  // Лог для отладки
  useEffect(() => {
    console.log('Текущие события:', events);
  }, [events]);

  return (
    <div className="p-0">
      {/* Основной контейнер */}
      <div className="border border-gray-400 rounded overflow-hidden">
        {/* Шапка: дата + режим */}
        <div className="flex bg-gray-300 border-b border-gray-300 p-1">
          <div className="flex-shrink-0 border-r border-gray-400 bg-white w-40 p-1">
            <div className="space-y-2 bg-gray-300 h-full w-full">
              <input
                type="date"
                className="text-center border border-gray-300 rounded text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={selectedDate}
                onChange={e => {
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

          {/* Прокручиваемая шапка мастеров */}
          <div
            onWheel={handleWheel}
            className="flex-1 overflow-x-auto max-w-full hide-scrollbar"
            style={{ scrollBehavior: 'auto' }}
          >
            <table className="min-w-full text-center">
              <thead>
                <tr>
                  {workers.map(worker => (
                    <th
                      key={worker.id}
                      className="px-1 py-1 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32"
                    >
                      <div
                        className="flex flex-col items-center space-y-1 cursor-pointer"
                        onClick={() => handleWorkerSelect(worker)}
                      >
                        {worker.avatar ? (
                          <img
                            src={`http://localhost:8000${worker.avatar}`}
                            alt={getFullName(worker)}
                            className="h-10 w-10 rounded-full object-cover border-2 border-slate-600"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                            {worker.first_name?.[0] || 'M'}
                          </div>
                        )}
                        <div className="text-xs font-medium text-gray-700 leading-tight">
                          <div>{worker.first_name}</div>
                          <div>{worker.last_name}</div>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
        </div>

        {/* Календарь */}
        <div className="h-96 bg-white">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={viewMode}
            date={new Date(selectedDate)}
            onView={newView => {
              if (newView === 'day' || newView === 'week') setViewMode(newView);
            }}
            onNavigate={newDate => {
              setSelectedDate(new Date(newDate).toISOString().split('T')[0]);
            }}
            style={{ height: '100%', width: '100%' }}
            views={['day', 'week']}
            selectable="ignoreEvents"
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onEventDrop={handleEventDrop as any}
            onEventResize={handleEventResize as any}
            resizable
            // draggable
            formats={formats}
            messages={{
              next: 'Вперёд',
              previous: 'Назад',
              today: 'Сегодня',
              week: 'Неделя',
              day: 'День',
            }}
            eventPropGetter={event => ({
              style: {
                backgroundColor: event.type === 'available' ? '#d1fae5' : '#fee2e2',
                border: '1px solid #ccc',
                color: '#166534',
                cursor: 'move',
              },
            })}
            step={15}
            timeslots={4}
            popup
            min={new Date(0, 0, 0, 8, 0, 0)}
            max={new Date(0, 0, 0, 22, 0, 0)}
          />
        </div>
      </div>
    </div>
  );
}
