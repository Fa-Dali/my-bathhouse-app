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
  const calendarRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = calendarRef.current;
    if (!container) return;

    // Ждём, пока календарь отрендерится
    const observer = new MutationObserver(() => {
      const headerCells = container.querySelectorAll('.rbc-row:first-child .rbc-header');
      if (headerCells.length === 0) return;

      const handleWheel = (e: WheelEvent) => {
        // Проверяем, что колесико — над шапкой
        const isOverHeader = [...headerCells].some(cell => cell.contains(e.target as Node));
        if (!isOverHeader) return;

        e.preventDefault();
        const timeContent = container.querySelector('.rbc-time-content') as HTMLElement | null;
        if (timeContent) {
          timeContent.scrollLeft += e.deltaY;
        }
      };

      // Убираем старый обработчик, если был
      const wrapper = container.closest('.rbc-calendar');
      if ((wrapper as any)._wheelAttached) return;
      (wrapper as any)._wheelAttached = true;

      container.addEventListener('wheel', handleWheel, { passive: false });

      observer.disconnect(); // Убираем observer

      // Очистка
      return () => {
        container.removeEventListener('wheel', handleWheel);
        if (wrapper) (wrapper as any)._wheelAttached = false;
      };
    });

    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);
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

      <div ref={calendarRef} className="beautiful-scroll overflow-auto" style={{ height: '86vh' }}>
        <div>
          <Calendar
            className="custom-resource-calendar"
            // Подключает локализацию (язык, форматы дат) через date-fns
            // Без этого — даты будут на английском, а нам нужен русский
            localizer={localizer}

            // Список событий, которые отображаются в календаре
            // Каждое событие — бронь или недоступность с start/end и resourceId
            events={events}

            // Говорит календарю: "начало события" хранится в поле `event.start`
            startAccessor="start"

            // Говорит календарю: "конец события" хранится в поле `event.end`
            endAccessor="end"

            // Режим отображения: "день" — одна строка времени, разбитая по часам
            view="day"

            // Какая дата сейчас отображается (управляет через input type="date")
            date={selectedDate}

            // Доступные режимы просмотра (здесь только 'day', других нет)
            views={['day']}

            // Список "ресурсов" — в нашем случае это мастера
            // Каждый мастер = своя колонка в календаре
            resources={workers}

            // Говорит: ID ресурса (мастера) хранится в `resource.id`
            // Используется, чтобы связать событие с конкретным мастером через `resourceId`
            resourceIdAccessor="id"

            // Как отображать имя ресурса (мастера) в шапке
            // По умолчанию — просто текст, а мы делаем "Имя Фамилия"
            resourceTitleAccessor={(r) => `${r.first_name} ${r.last_name}`}

            // Стили: календарь должен занять 100% ширины и высоты родителя
            // Чтобы не обрезался и растягивался правильно
            style={{ height: '100%', width: '100%' }}

            step={30}

            // Настройки форматов отображения времени и дат
            formats={{
              // Формат времени в левой колонке (например: "08:00", "09:00")
              timeGutterFormat: (date) => format(date, 'HH:mm', { locale: ru }),

              // Формат времени внутри события (например: "09:00 – 10:00")
              eventTimeRangeFormat: ({ start, end }) =>
                `${format(start, 'HH:mm', { locale: ru })} – ${format(end, 'HH:mm', { locale: ru })}`,
            }}

            // Кастомизация отображения компонентов календаря
            components={{
              event: EventComponent,
              resourceHeader: ({ resource }) => (
                <div
                  className="flex flex-col items-center p-0 text-xs cursor-ew-resize relative"
                  style={{
                    userSelect: 'none',
                    width: '100px',
                    minWidth: '100px',
                    maxWidth: '100px',
                    boxSizing: 'border-box',
                  }}
                  title="Прокручивайте колесиком для перемещения по времени"
                >
                  {resource.avatar ? (
                    <img
                      src={`http://localhost:8000${resource.avatar}`}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-400 flex items-center justify-center font-bold">
                      {resource.first_name?.[0]}
                    </div>
                  )}
                  <div>{resource.first_name}</div>
                  <div>{resource.last_name}</div>
                  <div className="absolute inset-0 pointer-events-none border border-dashed border-blue-300 rounded opacity-0 hover:opacity-30 transition-opacity" />
                </div>
              ),
            }}



            // Функция, которая возвращает стили для события
            // Например: зелёный для брони, красный для недоступности
            eventPropGetter={eventPropGetter}

            // Разрешает тянуть за края события, чтобы изменить его длительность
            // (если включить DnD — будет работать)
            resizable

            // Разрешает выделять время мышкой (например, чтобы создать новое событие)
            // Работает с onSelectSlot
            selectable

            // onEventDrop={...} — заглушка
            // Нужна для drag-and-drop, но сейчас закомментирована
            // Если раскомментировать — можно будет перетаскивать события
            messages={{
              next: 'Вперёд',
              previous: 'Назад',
              today: 'Сегодня',
            }}
          />
        </div>


      </div>
    </div>
  );
}
