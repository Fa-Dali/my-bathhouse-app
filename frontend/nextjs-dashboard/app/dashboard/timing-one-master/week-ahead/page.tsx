// Ссылка страницы: http://localhost:3000/dashboard/timing-one-master
'use client';

import React, { useRef, useEffect, useState } from 'react';
import api from '@/app/utils/axiosConfig';

// 1. Основной Calendar
import { Calendar as RBCalendar } from 'react-big-calendar';
// 2. Drag & Drop
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
// 3. Локализация
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

interface BookingEvent extends CalendarEvent {
  steamProgram?: string;
  massage?: string;
  masterIds: number[];
  payments: Array<{ amount: number; method: string }>;
}

// Создаём Calendar с DnD
const Calendar = withDragAndDrop<CalendarEvent>(RBCalendar);

// Локализация
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { ru },
});

// Форматы
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

  const [selectedBooking, setSelectedBooking] = useState<BookingEvent | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  const handleWorkerSelect = (worker: Worker) => setSelectedWorker(worker);

  const openModal = (slotInfo: { start: Date; end: Date } | CalendarEvent) => {
    const isEvent = 'title' in slotInfo;
    const userRole = localStorage.getItem('role');
    const isAdmin = userRole === 'admin';

    if (isAdmin) {
      const booking: BookingEvent = {
        id: isEvent ? slotInfo.id : -1,
        title: isEvent ? slotInfo.title : 'Бронь',
        start: slotInfo.start,
        end: slotInfo.end,
        type: 'unavailable',
        steamProgram: '',
        massage: '',
        masterIds: selectedWorker ? [selectedWorker.id] : [],
        payments: [{ amount: 0, method: 'cash' }],
      };
      setSelectedBooking(booking);
    } else {
      const availability: CalendarEvent = {
        id: isEvent ? slotInfo.id : -1,
        title: 'Недоступен',
        start: slotInfo.start,
        end: slotInfo.end,
        type: 'available',
      };
      setSelectedBooking({
        ...availability,
        steamProgram: '',
        massage: '',
        masterIds: selectedWorker ? [selectedWorker.id] : [],
        payments: [{ amount: 0, method: 'cash' }],
      } as BookingEvent);
    }

    setModalOpen(true);
    setTimeout(() => modalRef.current?.showModal(), 0);
  };

  const handleChange = (field: string, value: any) => {
    setSelectedBooking(prev => prev ? { ...prev, [field]: value } : null);
  };

  const addMaster = () => {
    setSelectedBooking(prev => prev ? { ...prev, masterIds: [...prev.masterIds, workers[0]?.id || 0] } : null);
  };

  const removeMaster = (index: number) => {
    setSelectedBooking(prev => prev ? {
      ...prev,
      masterIds: prev.masterIds.filter((_, i) => i !== index)
    } : null);
  };

  const addPayment = () => {
    setSelectedBooking(prev => prev ? {
      ...prev,
      payments: [...prev.payments, { amount: 0, method: 'cash' }]
    } : null);
  };

  const removePayment = (index: number) => {
    setSelectedBooking(prev => prev ? {
      ...prev,
      payments: prev.payments.filter((_, i) => i !== index)
    } : null);
  };

  const saveBooking = async () => {
  if (!selectedBooking) return;

  const userRole = localStorage.getItem('role');
  const isAdmin = userRole === 'admin';
  const isCreating = selectedBooking.id === -1;

  try {
    if (isAdmin) {
      const url = isCreating
        ? '/api/scheduling/bookings/create/'
        : `/api/scheduling/bookings/${selectedBooking.id}/`;
      const method = isCreating ? 'post' : 'patch';

      const payload = {
        master_ids: selectedBooking.masterIds,
        start: selectedBooking.start.toISOString(),
        end: selectedBooking.end.toISOString(),
        booking_type: 'client',
        steam_program: selectedBooking.steamProgram ?? '',
        massage: selectedBooking.massage ?? '',
        total_cost: 0,
        payments: selectedBooking.payments,
      };

      const response = await api[method](url, payload);

      const newEvent = {
        id: Number(response.data.id),
        title: 'Услуга',
        start: selectedBooking.start,
        end: selectedBooking.end,
        type: 'unavailable',
      } as CalendarEvent;

      setEvents(prev => [
        ...prev.filter(e => !(e.start.getTime() === newEvent.start.getTime() && e.end.getTime() === newEvent.end.getTime() && e.type === 'unavailable')),
        newEvent
      ]);

    } else {
      const url = isCreating
        ? '/api/scheduling/availabilities/create/'
        : `/api/scheduling/availabilities/${selectedBooking.id}/`;
      const method = isCreating ? 'post' : 'patch';

      const payload = {
        master: selectedWorker?.id,
        start: selectedBooking.start.toISOString(),
        end: selectedBooking.end.toISOString(),
        is_available: false,
      };

      const response = await api[method](url, payload);

      const newEvent = {
        id: Number(response.data.id),
        title: 'Недоступен',
        start: selectedBooking.start,
        end: selectedBooking.end,
        type: 'available',
      } as CalendarEvent;

      setEvents(prev => [
        ...prev.filter(e => !(e.start.getTime() === newEvent.start.getTime() && e.end.getTime() === newEvent.end.getTime() && e.type === 'available')),
        newEvent
      ]);

      if (isCreating) {
        setAvailabilities(prev => [...prev, response.data]);
      } else {
        setAvailabilities(prev => prev.map(a => a.id === response.data.id ? response.data : a));
      }
    }

    // ✅ УСПЕШНО СОХРАНЕНО!
    alert('Информация успешно сохранена!'); // ← Простое уведомление

    // ✅ Гарантированно закрываем модалку
    modalRef.current?.close();
    setModalOpen(false);

  } catch (err: any) {
    console.error('Ошибка сохранения:', err);
    alert('Не удалось сохранить: ' + (err.response?.data?.error || err.message));
  }
};

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.scrollLeft += e.deltaY > 0 ? 100 : -100;
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    const userRole = localStorage.getItem('role');
    const isAdmin = userRole === 'admin';

    const isBlocked = availabilities.some(a => {
      const aStart = new Date(a.start);
      const aEnd = new Date(a.end);
      return a.is_available === false && start < aEnd && end > aStart;
    });

    if (isBlocked && !isAdmin) {
      alert("Это время недоступно — вы уже отметили его как занятое");
      return;
    }

    openModal({ start, end });
  };

  const getFullName = (worker: Worker) =>
    [worker.first_name, worker.last_name].filter(Boolean).join(' ') || worker.username;

  const handleSelectEvent = (event: CalendarEvent) => {
    openModal(event);
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
    try {
      await api.delete(`/api/scheduling/availabilities/${event.id}/`);
      setAvailabilities(availabilities.filter(a => a.id !== event.id));
      setEvents(events.filter(e => e.id !== event.id));
    } catch (err) {
      alert('Не удалось удалить слот');
    }
  };

  const handleDeleteBooking = async (event: CalendarEvent) => {
    const confirmed = window.confirm("Удалить бронь?");
    if (!confirmed) return;

    try {
      await api.delete(`/api/scheduling/bookings/${event.id}/`);
      setEvents(events.filter(e => e.id !== event.id));
    } catch (err) {
      alert('Не удалось удалить бронь');
    }
  };

  const handleEventDrop = async ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
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

  useEffect(() => {
    console.log('Текущие события:', events);
  }, [events]);

  return (
    <div className="p-0">
      <div className="border border-gray-400 rounded overflow-hidden">
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
            formats={formats}
            messages={{
              next: 'Вперёд',
              previous: 'Назад',
              today: 'Сегодня',
              week: 'Неделя',
              day: 'День',
            }}
            eventPropGetter={event => {
              let style = {};
              if (event.type === 'available') {
                style = { backgroundColor: '#e5e7eb', color: '#4b5563' };
              } else if (event.type === 'unavailable') {
                style = { backgroundColor: '#d1fae5', color: '#166534' };
              }
              return {
                style: {
                  ...style,
                  border: '1px solid #ddd',
                  cursor: 'default',
                },
              };
            }}
            step={15}
            timeslots={4}
            popup
            min={new Date(0, 0, 0, 8, 0, 0)}
            max={new Date(0, 0, 0, 22, 0, 0)}
          />
        </div>

        <dialog ref={modalRef} className="modal w-[500px] min-w-xs">
          <div className="modal-box max-w-3xl">
            <h3 className="text-sky-950 text-center text-lg border border-slate-400 bg-slate-300">Редактирование тайминга</h3>

            {selectedBooking && (
              <div className="py-4 space-y-4">
                <div className="m-2">
                  <label className="block text-gray-500 text-sm font-medium">Программа услуг:</label>
                  <textarea
                    value={selectedBooking.steamProgram || ''}
                    onChange={e => handleChange('steamProgram', e.target.value)}
                    className="input input-bordered w-full text-sm rounded"
                  />
                </div>

                <div className="m-2">
                  <label className="block text-gray-500 text-sm font-medium">Клиент:</label>
                  <textarea
                    value={selectedBooking.massage || ''}
                    onChange={e => handleChange('massage', e.target.value)}
                    className="input input-bordered w-full text-sm rounded"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 text-sm font-medium ml-2">Мастеры:</label>
                  {selectedBooking.masterIds.map((masterId, index) => (
                    <div key={index} className="flex gap-2 mt-1 m-2 mr-5">
                      <select
                        value={masterId}
                        onChange={e => {
                          const newIds = [...selectedBooking.masterIds];
                          newIds[index] = Number(e.target.value);
                          handleChange('masterIds', newIds);
                        }}
                        className="select select-bordered text-sm flex-1"
                      >
                        {workers.map(w => (
                          <option key={w.id} value={w.id}>
                            {w.first_name} {w.last_name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeMaster(index)}
                        className="btn btn-sm btn-error border rounded px-2 bg-red-300"
                      >
                        -
                      </button>
                    </div>
                  ))}
                  <button onClick={addMaster} className="btn btn-sm btn-success ml-5 border rounded px-2 bg-green-300">
                    +
                  </button>
                </div>

                <div>
                  <label className="block text-gray-500 text-sm font-medium ml-2">Оплата</label>
                  {selectedBooking.payments.map((p, index) => (
                    <div key={index} className="flex gap-2 mt-1 m-2 mr-5">
                      <input
                        type="number"
                        placeholder="Сумма"
                        value={p.amount}
                        onChange={e => {
                          const newPayments = [...selectedBooking.payments];
                          newPayments[index].amount = Number(e.target.value);
                          handleChange('payments', newPayments);
                        }}
                        className="input input-bordered w-32 text-sm ml-2 border rounded border-gray-200"
                      />
                      <select
                        value={p.method}
                        onChange={e => {
                          const newPayments = [...selectedBooking.payments];
                          newPayments[index].method = e.target.value;
                          handleChange('payments', newPayments);
                        }}
                        className="select select-bordered text-sm flex-1"
                      >
                        <option value="terminal">Терминал</option>
                        <option value="cash">Наличные</option>
                        <option value="website">Сайт</option>
                        <option value="reception">Ресепшн</option>
                        <option value="certificate">Сертификат</option>
                      </select>
                      <button
                        onClick={() => removePayment(index)}
                        className="btn btn-sm btn-error border rounded px-2 bg-red-300"
                      >
                        -
                      </button>
                    </div>
                  ))}
                  <button onClick={addPayment} className="btn btn-sm btn-success ml-5 border rounded px-2 bg-green-300">
                    +
                  </button>
                </div>
              </div>
            )}

            <div className="modal-action">
              <button
                type="button"
                className="ml-2 btn btn-sm text-gray-500 border rounded px-2 bg-red-300 hover:bg-red-400"
                onClick={() => modalRef.current?.close()}
              >
                Отмена
              </button>
              <button
                type="button"
                className="ml-2 mb-2 btn btn-sm btn-primary text-gray-500 border rounded px-2 bg-green-300 hover:bg-green-400"
                onClick={saveBooking}
              >
                Сохранить
              </button>
              {selectedBooking && (
                <button
                  type="button"
                  className="ml-2 btn btn-sm btn-error bg-red-500 text-white"
                  onClick={async () => {
                    if (!selectedBooking) return;
                    const confirmed = window.confirm(
                      selectedBooking.type === 'available'
                        ? "Удалить недоступность?"
                        : "Удалить бронь?"
                    );
                    if (!confirmed) return;
                    if (selectedBooking.type === 'available') {
                      await handleDeleteEvent(selectedBooking);
                    } else {
                      await handleDeleteBooking(selectedBooking);
                    }
                    modalRef.current?.close();
                  }}
                >
                  Удалить
                </button>
              )}
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
}
