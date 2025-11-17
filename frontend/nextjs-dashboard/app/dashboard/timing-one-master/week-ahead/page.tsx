// Ссылка страницы http://localhost:3000/dashboard/timing-one-master

'use client';

import React, { useEffect, useState } from 'react';
import api from '@/app/utils/axiosConfig';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Интерфейс для мастера
interface Worker {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar: string | null;
  roles: Array<{ code: string; name: string }>; // Дополнительное поле для ролей ***
}

// Интерфейс для доступности ***
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
}

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

  // Формат времени в слотах: "9:00"
  timeGutterFormat: (date: Date) => format(date, 'H:mm', { locale: ru }),
};



export default function Page() {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null); // ***
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);  // ***
  const [events, setEvents] = useState<CalendarEvent[]>([]);


  // Обработка выбора мастера
  const handleWorkerSelect = (worker: Worker) => {
    setSelectedWorker(worker);
  };

  // Горизонтальная прокрутка
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const container = e.currentTarget;
    container.scrollLeft += e.deltaY > 0 ? 100 : -100;
  };

  // Обработка клика на ячейку календаря
  const handleSelectSlot = async ({ start, end }: { start: Date; end: Date }) => {
    if (!selectedWorker) return;

    try {
      const response = await api.post('/api/scheduling/availabilities/create/', {
        master: selectedWorker.id,
        start: start.toISOString(),
        end: end.toISOString(),
        is_available: true
      });

      // Обновляем список доступности
      const newAvailability = response.data;
      setAvailabilities([...availabilities, newAvailability]);
      setEvents([...events, {
        id: newAvailability.id,
        title: 'Доступен',
        start: new Date(newAvailability.start),
        end: new Date(newAvailability.end),
        type: 'available'
      }]);
    } catch (err) {
      console.error('Ошибка создания доступности:', err);
    }
  };

  // Форматируем имя
  const getFullName = (worker: Worker) =>
    [worker.first_name, worker.last_name].filter(Boolean).join(' ') || worker.username;

  // Обработка выбора события
  const handleSelectEvent = (event: any) => {
    if (!selectedWorker) return;

    const confirmed = window.confirm(
      `Удалить слот "${event.title}"?\n${format(event.start, 'H:mm')} — ${format(event.end, 'H:mm')}`
    );

    if (confirmed) {
      handleDeleteEvent(event);
    }
  };

  // Удаление события
  const handleDeleteEvent = async (event: any) => {
    try {
      await api.delete(`/api/scheduling/availabilities/${event.id}/`);

      // Удаляем из состояния
      setAvailabilities(availabilities.filter(a => a.id !== event.id));
      setEvents(events.filter(e => e.id !== event.id));
    } catch (err) {
      console.error('Ошибка удаления:', err);
      alert('Не удалось удалить слот');
    }
  };

  // Перетаскивание события
  const handleEventDrop = async ({ event, start, end }: { event: any; start: Date; end: Date }) => {
    try {
      await api.patch(`/api/scheduling/availabilities/${event.id}/`, {
        start: start.toISOString(),
        end: end.toISOString(),
      });

      // Обновляем локально
      const updatedEvent = { ...event, start, end };
      setEvents(events.map(e => (e.id === event.id ? updatedEvent : e)));
      setAvailabilities(
        availabilities.map(a => (a.id === event.id ? { ...a, start: start.toISOString(), end: end.toISOString() } : a))
      );
    } catch (err) {
      console.error('Ошибка перетаскивания:', err);
      alert('Не удалось переместить слот');
    }
  };

  // Изменение длительности события
  const handleEventResize = async ({ event, start, end }: { event: any; start: Date; end: Date }) => {
    try {
      await api.patch(`/api/scheduling/availabilities/${event.id}/`, {
        start: start.toISOString(),
        end: end.toISOString(),
      });

      const updatedEvent = { ...event, start, end };
      setEvents(events.map(e => (e.id === event.id ? updatedEvent : e)));
      setAvailabilities(
        availabilities.map(a => (a.id === event.id ? { ...a, start: start.toISOString(), end: end.toISOString() } : a))
      );
    } catch (err) {
      console.error('Ошибка изменения длительности:', err);
      alert('Не удалось изменить длительность');
    }
  };


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
            roles: u.roles,
          }));
        setWorkers(filtered);
        if (filtered.length > 0) {
          setSelectedWorker(filtered[0]);
        }
      } catch (err) {
        console.error('Ошибка загрузки мастеров:', err);
      }
    };
    fetchWorkers();
  }, []);

  // Получаем доступность выбранного мастера
  useEffect(() => {
    if (!selectedWorker) return;

    const fetchAvailabilities = async () => {
      try {
        const response = await api.get('/api/scheduling/availabilities/');
        const filtered = response.data.filter((a: any) => a.master === selectedWorker.id);
        setAvailabilities(filtered);

        // Преобразуем в формат событий для календаря
        const calendarEvents = filtered.map((a: Availability): CalendarEvent => ({
          id: a.id,
          title: a.is_available ? 'Доступен' : 'Недоступен',
          start: new Date(a.start),
          end: new Date(a.end),
          type: a.is_available ? 'available' : 'unavailable'
        }));
        setEvents(calendarEvents);
      } catch (err) {
        console.error('Ошибка загрузки доступности:', err);
      }
    };

    fetchAvailabilities();
  }, [selectedWorker]);


  return (
    <div className="p-0">
      {/* ОСНОВНОЙ КОНТЕЙНЕР */}
      <div className="border border-gray-400 rounded overflow-hidden">
        {/* Фиксированная панель: дата + режим */}
        <div className="flex bg-gray-300 border-b border-gray-300 p-1">
          <div className="flex-shrink-0 border-r border-gray-400 bg-white w-40 p-1">
            <div className="space-y-2 bg-gray-300 h-full w-full">
              <input
                type="date"
                className="text-center border border-gray-300 rounded text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
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

          {/* Прокручиваемая шапка: мастера */}
          <div
            onWheel={handleWheel}
            className="flex-1 overflow-x-auto max-w-full hide-scrollbar"
            style={{ scrollBehavior: 'auto' }}
          >
            <table className="min-w-full text-center">
              <thead>
                <tr>
                  {workers.map((worker) => (
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
            onView={(newView) => {
              if (newView === 'day' || newView === 'week') {
                setViewMode(newView);
              }
            }}
            onNavigate={(newDate) => {
              setSelectedDate(new Date(newDate).toISOString().split('T')[0]);
            }}
            style={{ height: '100%', width: '100%' }}
            views={['day', 'week']}
            selectable={true}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            // @ts-ignore
            onEventDrop={handleEventDrop}     // ✅ Работает
            onEventResize={handleEventResize} // ✅ Работает
            resizable                         // ✅
            draggable                         // ✅
            formats={formats}
            messages={{
              next: 'Вперёд',
              previous: 'Назад',
              today: 'Сегодня',
              week: 'Неделя',
              day: 'День',
            }}
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.type === 'available' ? '#d1fae5' : '#fee2e2',
                border: '1px solid #ccc',
                color: '#166534',
              },
            })}
          />
        </div>
      </div>
    </div>
  );
}
