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

type FormBookingData = {
  id: number;
  title: string;
  start: Date;
  end: Date;
  type: 'available' | 'unavailable';
  steamProgram?: string;
  massage?: string;
  masterIds: number[];
  payments: Array<{ amount: number; method: string }>;
  mode: 'booking' | 'availability';
  isBooking: boolean;
  hall?: string;
};

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
  isBooking: true;
  steamProgram?: string;
  massage?: string;
  masterIds: number[];
  payments: Array<{ amount: number; method: string }>;
  mode: 'booking' | 'availability'; //
  hall?: string;
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
  timeGutterFormat: (date: Date) => format(date, 'HH:mm', { locale: ru }),
  eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) =>
    `${format(start, 'HH:mm', { locale: ru })} – ${format(end, 'HH:mm', { locale: ru })}`,
};

export default function Page() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [selectedBooking, setSelectedBooking] = useState<FormBookingData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const modalRef = useRef<HTMLDialogElement>(null);

  const handleWorkerSelect = (worker: Worker) => setSelectedWorker(worker);

  const openModal = (slotInfo: { start: Date; end: Date } | CalendarEvent) => {
    const isEvent = 'title' in slotInfo;
    const userRole = localStorage.getItem('role');
    const isAdmin = userRole === 'admin';

    if (isEvent) {
      // Редактирование
      let formData: FormBookingData;

      if ('isBooking' in slotInfo && slotInfo.isBooking) {
        const b = slotInfo as BookingEvent;
        formData = {
          id: b.id,
          title: b.title,
          start: b.start,
          end: b.end,
          type: b.type,
          steamProgram: b.steamProgram || '',
          massage: b.massage || '',
          masterIds: b.masterIds,
          payments: b.payments,
          mode: 'booking',
          isBooking: true,
        };
      } else {
        formData = {
          id: slotInfo.id,
          title: slotInfo.title,
          start: slotInfo.start,
          end: slotInfo.end,
          type: slotInfo.type,
          steamProgram: '',
          massage: '',
          masterIds: [],
          payments: [],
          mode: 'availability',
          isBooking: false,
        };
      }

      setSelectedBooking(formData);
      setModalOpen(true);
      setTimeout(() => modalRef.current?.showModal(), 0);
      return;
    }

    const { start, end } = slotInfo;

    if (isAdmin) {
      // Админ создаёт бронь
      const newEvent: FormBookingData = {
        id: -1,
        title: 'Услуга',
        start,
        end,
        type: 'unavailable',
        steamProgram: '',
        massage: '',
        masterIds: selectedWorker ? [selectedWorker.id] : [],
        payments: [{ amount: 0, method: 'cash' }],
        mode: 'booking',
        isBooking: true,
      };
      setSelectedBooking(newEvent);
    } else {
      // Мастер создаёт недоступность
      const newEvent: FormBookingData = {
        id: -1,
        title: 'Недоступен',
        start,
        end,
        type: 'unavailable',
        steamProgram: '',
        massage: '',
        masterIds: [],
        payments: [],
        mode: 'availability',
        isBooking: false,
      };
      setSelectedBooking(newEvent);
    }

    setModalOpen(true);
    setTimeout(() => modalRef.current?.showModal(), 0);
  };

  const handleChange = (field: string, value: any) => {
    setSelectedBooking(prev => {
      if (!prev) return null;

      let updated = { ...prev, [field]: value };

      // Синхронизация mode и isBooking
      if (field === 'mode') {
        updated.isBooking = value === 'booking';
        updated.type = value === 'booking' ? 'unavailable' : 'available';
        updated.title = value === 'booking' ? 'Услуга' : 'Недоступен';
        if (value !== 'booking') updated.hall = '';
      }

      return updated;
    });
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
        // Админ: бронь
        const url = isCreating ? '/api/scheduling/bookings/create/' : `/api/scheduling/bookings/${selectedBooking.id}/`;
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
          hall: selectedBooking.hall || 'muromets',
        };

        const response = await api[method](url, payload);

        const event: BookingEvent = {
          id: response.data.id,
          title: 'Услуга',
          start: selectedBooking.start,
          end: selectedBooking.end,
          type: 'unavailable',
          isBooking: true,
          steamProgram: selectedBooking.steamProgram || '',
          massage: selectedBooking.massage || '',
          masterIds: selectedBooking.masterIds,
          payments: selectedBooking.payments,
          mode: 'booking',
        };

        setEvents(prev => [...prev.filter(e => e.id !== event.id), event]);
      } else {
        // Мастер: недоступность
        const url = isCreating
          ? '/api/scheduling/availabilities/create/'
          : `/api/scheduling/availabilities/${selectedBooking.id}/`;
        const method = isCreating ? 'post' : 'patch';

        const payload = {
          master: selectedWorker?.id,
          start: selectedBooking.start.toISOString(),
          end: selectedBooking.end.toISOString(),
          is_available: false,
          source: 'user',
        };

        const response = await api[method](url, payload);

        const event: CalendarEvent = {
          id: response.data.id,
          title: 'Недоступен',
          start: selectedBooking.start,
          end: selectedBooking.end,
          type: 'unavailable',
        };

        setEvents(prev => [...prev.filter(e => e.id !== event.id), event]);

        if (isCreating) {
          setAvailabilities(prev => [...prev, response.data]);
        } else {
          setAvailabilities(prev => prev.map(a => a.id === response.data.id ? response.data : a));
        }
      }

      alert('Сохранено');
      modalRef.current?.close();
      setModalOpen(false);
    } catch (err: any) {
      alert('Ошибка: ' + (err.response?.data?.error || err.message));
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
    const userRole = localStorage.getItem('role');
    const isAdmin = userRole === 'admin';
    const isBooking = 'isBooking' in event;

    if (isBooking && !isAdmin) {
      alert('Вы не можете редактировать бронь');
      return;
    }
    if (!isBooking && isAdmin) {
      alert('Админ не может редактировать статус недоступности');
      return;
    }

    openModal(event);
  };

  const handleDeleteEvent = async (event: CalendarEvent) => {
    const userRole = localStorage.getItem('role');
    if (userRole === 'admin') {
      alert('Админ не может удалять статус недоступности');
      return;
    }
    if (!window.confirm('Удалить слот недоступности?')) return;

    try {
      await api.delete(`/api/scheduling/availabilities/${event.id}/`);
      setAvailabilities(availabilities.filter(a => a.id !== event.id));
      setEvents(events.filter(e => e.id !== event.id));
    } catch {
      alert('Не удалось удалить');
    }
  };

  const handleDeleteBooking = async (event: BookingEvent) => {
    const userRole = localStorage.getItem('role');
    if (userRole !== 'admin') {
      alert('Только админ может удалять брони');
      return;
    }
    if (!window.confirm('Удалить бронь?')) return;

    try {
      await api.delete(`/api/scheduling/bookings/${event.id}/`);
      setEvents(events.filter(e => e.id !== event.id));
    } catch {
      alert('Не удалось удалить');
    }
  };

  const onEventDrop = async ({ event, start, end }: { event: CalendarEvent; start: Date | string; end: Date | string }) => {
    const updatedStart = new Date(start);
    const updatedEnd = new Date(end);
    const userRole = localStorage.getItem('role');

    if ('isBooking' in event) {
      if (userRole === 'admin') {
        await api.patch(`/api/scheduling/bookings/${event.id}/`, {
          start: updatedStart.toISOString(),
          end: updatedEnd.toISOString(),
        });
        setEvents(events.map(e =>
          e.id === event.id
            ? { ...e, start: updatedStart, end: updatedEnd }
            : e
        ));
      }
    } else {
      if (userRole !== 'admin') {
        // ✅ Преобразуем Date → string для совместимости с Availability
        await api.patch(`/api/scheduling/availabilities/${event.id}/`, {
          start: updatedStart.toISOString(),
          end: updatedEnd.toISOString(),
        });
        setAvailabilities(availabilities.map(a =>
          a.id === event.id
            ? {
              ...a,
              start: updatedStart.toISOString(),
              end: updatedEnd.toISOString(),
            }
            : a
        ));
        setEvents(events.map(e =>
          e.id === event.id
            ? { ...e, start: updatedStart, end: updatedEnd }
            : e
        ));
      }
    }
  };

  const onEventResize = async ({ event, start, end }: { event: CalendarEvent; start: Date | string; end: Date | string }) => {
    const updatedStart = new Date(start);
    const updatedEnd = new Date(end);
    const userRole = localStorage.getItem('role');

    if ('isBooking' in event) {
      if (userRole === 'admin') {
        await api.patch(`/api/scheduling/bookings/${event.id}/`, {
          start: updatedStart.toISOString(),
          end: updatedEnd.toISOString(),
        });
        setEvents(events.map(e =>
          e.id === event.id
            ? { ...e, start: updatedStart, end: updatedEnd }
            : e
        ));
      }
    } else {
      if (userRole !== 'admin') {
        await api.patch(`/api/scheduling/availabilities/${event.id}/`, {
          start: updatedStart.toISOString(),
          end: updatedEnd.toISOString(),
        });
        setAvailabilities(availabilities.map(a =>
          a.id === event.id
            ? {
              ...a,
              start: updatedStart.toISOString(),
              end: updatedEnd.toISOString(),
            }
            : a
        ));
        setEvents(events.map(e =>
          e.id === event.id
            ? { ...e, start: updatedStart, end: updatedEnd }
            : e
        ));
      }
    }
  };

  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    if ('isBooking' in event) {
      const booking = event as BookingEvent;
      console.log('🔍 Booking hall:', booking.hall);
      const masterNames = booking.masterIds
        .map(id => workers.find(w => w.id === id))
        .filter((w): w is Worker => w !== undefined)
        .map(w => `${w.first_name} ${w.last_name ? w.last_name[0] + '.' : ''}`)
        .join(', ');

      return (
        <div title={`Услуга: ${booking.steamProgram}\nКлиент: ${booking.massage}`}>
          <div className="text-xs leading-tight">

            {/* 🔥 НОВАЯ СТРОКА: отображение зала */}
            {booking.hall && (
              <div className="text-xs font-medium text-blue-700 bg-blue-50 px-1 py-0.5 rounded border border-blue-100 mt-1">
                {{
                  muromets: 'Муромец',
                  nikitich: 'Никитич',
                  popovich: 'Попович',
                  massage_l: 'Массаж Л',
                  massage_p: 'Массаж П',
                }[booking.hall]}
              </div>
            )}

            <div><strong>{booking.steamProgram || 'Услуга'}</strong></div>
            <div><span className="font-medium text-gray-700 underline">Клиент:</span><br />{' '}
              {booking.massage || 'Клиент'}</div>
            <div className="text-blue-700">
              <span className="font-medium text-gray-700 underline">Мастер:</span><br />{' '}
              {masterNames || 'Не назначен'}
            </div>
            <div className="text-green-700">
              {booking.payments.reduce((sum, p) => sum + p.amount, 0)} ₽
            </div>
          </div>
        </div>
      );
    }

    if (event.type === 'unavailable') {
      return <div>Недоступен</div>;
    }

    return <div>{event.title}</div>;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/api/me/');
        const user = response.data;
        const role = user.roles.find((r: any) => r.code === 'admin')?.code ||
          user.roles[0]?.code ||
          'user';
        localStorage.setItem('role', role);
        console.log('🔐 Роль сохранена в localStorage:', role);
      } catch (err) {
        console.error('❌ Ошибка получения профиля:', err);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await api.get('/api/users/');
        const filtered = response.data
          .filter((u: any) => u.roles.some((r: any) => r.code === 'paramaster' || r.code === 'masseur'))
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
    const fetchAllData = async () => {
      try {
        const availResponse = await api.get('/api/scheduling/availabilities/');
        const filteredAvail = availResponse.data
          .filter((a: any) => a.master === selectedWorker.id)
          .filter((a: any) => a.source !== 'system');

        const availEvents = filteredAvail.map((a: Availability): CalendarEvent => ({
          id: Number(a.id),
          title: a.is_available ? 'Доступен' : 'Недоступен',
          start: new Date(a.start),
          end: new Date(a.end),
          type: a.is_available ? 'available' : 'unavailable',
          allDay: false,
        }));

        const bookingResponse = await api.get('/api/scheduling/bookings/');
        const filteredBookings = bookingResponse.data.filter((b: any) => b.master_ids.includes(selectedWorker.id));
        const bookingEvents = filteredBookings.map((b: any): BookingEvent => ({
          id: b.id,
          title: 'Услуга',
          start: new Date(b.start),
          end: new Date(b.end),
          type: 'unavailable',
          isBooking: true,
          steamProgram: b.steam_program || '',
          massage: b.massage || '',
          masterIds: b.master_ids,
          payments: b.payments || [],
          mode: 'booking',
          hall: b.hall || undefined,
        }));

        setEvents([...availEvents, ...bookingEvents]);
        setAvailabilities(filteredAvail);
      } catch (err: any) {
        console.error('Ошибка загрузки данных:', err.response?.data || err.message);
        alert('Ошибка загрузки данных. Проверь консоль и сервер.');
      }
    };
    fetchAllData();
  }, [selectedWorker]);

  useEffect(() => {
    console.log('Текущие события:', events);
  }, [events]);

  return (
    <div className="p-0">
      <div className="border border-gray-400 rounded overflow-hidden">
        <div className="flex bg-gray-300 border-b border-gray-300 p-0">
          <div className="flex-shrink-0 border-r border-gray-400 bg-white w-40 p-1">
            <div className="space-y-2 bg-gray-50 h-full w-full">
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
                  className={`w-1/2 border rounded hover:border-slate-700 p-0.5 text-xs ${viewMode === 'day'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 hover:bg-green-600 hover:text-white'
                    }`}
                >
                  День
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`w-1/2 border rounded  hover:border-slate-700 p-0.5 text-xs ${viewMode === 'week'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 hover:bg-green-600 hover:text-white'
                    }`}
                >
                  Неделя
                </button>
              </div>
            </div>
          </div>

          <div onWheel={handleWheel} className="flex-1 overflow-x-auto max-w-full hide-scrollbar" style={{ scrollBehavior: 'auto' }}>
            <table className="min-w-full text-center">
              <thead>
                <tr>
                  {workers.map(worker => (
                    <th key={worker.id} className="px-1 py-1 bg-slate-100 text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32">
                      <div className="flex flex-col items-center space-y-1 cursor-pointer" onClick={() => handleWorkerSelect(worker)}>
                        {worker.avatar ? (
                          <img
                            src={`http://localhost:8000${worker.avatar}`}
                            alt={getFullName(worker)}
                            className={`h-10 w-10 rounded-full object-cover border-2 border-slate-600 ${selectedWorker?.id === worker.id ? 'ring-1 ring-teal-300 rounded' : ''}`}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                            {worker.first_name?.[0] || 'M'}
                          </div>
                        )}
                        <div className="text-[10px] font-medium text-gray-700 leading-tight">
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
            onEventDrop={onEventDrop}
            onEventResize={onEventResize}
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
              // Если это бронь (услуга)
              if ('isBooking' in event && event.isBooking) {
                return {
                  style: {
                    backgroundColor: '#d1fae5', // зелёный
                    color: '#166534',
                    border: '1px solid #ddd',
                    cursor: 'default',
                  },
                };
              }

              // Если это недоступность
              if (event.type === 'unavailable') {
                return {
                  style: {
                    backgroundColor: '#fee2e2', // красный фон
                    color: '#b91c1c',           // тёмно-красный текст
                    border: '1px solid #ddd',
                    fontWeight: '500',
                    cursor: 'default',
                  },
                };
              }

              // Остальные (доступен — серый)
              return {
                style: {
                  backgroundColor: '#e5e7eb',
                  color: '#4b5563',
                  border: '1px solid #ddd',
                  cursor: 'default',
                },
              };
            }}
            step={15}
            timeslots={4}
            popup
            min={new Date(0, 0, 0, 0, 0, 0)}
            max={new Date(0, 0, 0, 23, 59, 59)}
            components={{ event: EventComponent }}
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
                      <button onClick={() => removeMaster(index)} className="btn btn-sm btn-error border rounded px-2 bg-red-300">
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
                      <button onClick={() => removePayment(index)} className="btn btn-sm btn-error border rounded px-2 bg-red-300">
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

            <div className="m-2">
              <label className="block text-gray-500 text-sm font-medium">Аудитория:</label>
              <select
                value={selectedBooking?.hall || ''}
                onChange={e => handleChange('hall', e.target.value)}
                className="select select-bordered w-full text-sm rounded"
                disabled={selectedBooking?.mode !== 'booking'} // только для брони
              >
                <option value="" disabled>Выберите аудиторию</option>
                <option value="muromets">Муромец</option>
                <option value="nikitich">Никитич</option>
                <option value="popovich">Попович</option>
                <option value="massage_l">Массаж Л</option>
                <option value="massage_p">Массаж П</option>
              </select>
            </div>

            <div className="m-2 p-2 border rounded bg-gray-50">
              <label className="block text-sm font-medium text-gray-700 mb-1">Режим:</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mode"
                    value="booking"
                    checked={selectedBooking?.mode === 'booking'}
                    onChange={() => handleChange('mode', 'booking')}
                    className="mr-1"
                  />
                  <span className="text-sm">Создать бронь</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="mode"
                    value="availability"
                    checked={selectedBooking?.mode === 'availability'}
                    onChange={() => handleChange('mode', 'availability')}
                    className="mr-1"
                  />
                  <span className="text-sm">Отметить как недоступно</span>
                </label>
              </div>
            </div>

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

                    // 🔁 Используем mode, а не type
                    const confirmed = window.confirm(
                      selectedBooking.mode === 'availability'
                        ? "Удалить недоступность мастера?"
                        : "Удалить бронь?"
                    );
                    if (!confirmed) return;

                    // 🔁 Используем mode, а не type
                    if (selectedBooking.mode === 'availability') {
                      await handleDeleteEvent({
                        id: selectedBooking.id,
                        title: selectedBooking.title,
                        start: selectedBooking.start,
                        end: selectedBooking.end,
                        type: selectedBooking.type
                      });
                    } else {
                      await handleDeleteBooking({
                        id: selectedBooking.id,
                        title: selectedBooking.title,
                        start: selectedBooking.start,
                        end: selectedBooking.end,
                        type: selectedBooking.type,
                        isBooking: true,
                        steamProgram: selectedBooking.steamProgram || '',
                        massage: selectedBooking.massage || '',
                        masterIds: selectedBooking.masterIds,
                        payments: selectedBooking.payments,
                        mode: 'booking'
                      });
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
