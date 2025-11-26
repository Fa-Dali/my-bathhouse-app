// frontend/nextjs-dashboard/app/components/MasterCalendar.tsx
// app/components/MasterDayCalendar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as RBCalendar } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import { dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ru } from 'date-fns/locale';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

import api from '@/app/utils/axiosConfig';

// Интерфейсы
interface Worker {
	id: number;
	first_name: string;
	last_name: string;
	avatar: string | null;
}

interface Availability {
	id: number;
	master: number;
	start: string;
	end: string;
	is_available: boolean;
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
}

// Создаём календарь с DnD
const Calendar = withDragAndDrop<CalendarEvent>(RBCalendar);

// Локализация
const localizer = dateFnsLocalizer({
	format,
	parse,
	startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
	getDay,
	locales: { ru },
});

export default function MasterDayCalendar({
  master,
  selectedDate,
  isAdmin,
  workers, // 👈 Добавь
}: {
  master: Worker;
  selectedDate: string;
  isAdmin: boolean;
  workers: Worker[]; // 👈
}) {
	const [events, setEvents] = useState<CalendarEvent[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [bookingsRes, availRes] = await Promise.all([
					api.get('/api/scheduling/bookings/'),
					api.get('/api/scheduling/availabilities/'),
				]);

				const startOfDay = new Date(selectedDate + 'T00:00:00');
				const endOfDay = new Date(selectedDate + 'T23:59:59');

				const filteredEvents: CalendarEvent[] = [];

				// Фильтруем брони
				bookingsRes.data.forEach((b: Booking) => {
					const bStart = new Date(b.start);
					const bEnd = new Date(b.end);
					if (!b.master_ids.includes(master.id)) return;
					if (bStart > endOfDay || bEnd < startOfDay) return;

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
					});
				});

				// Фильтруем недоступности
				availRes.data
					.filter((a: Availability) => a.master === master.id && !a.is_available)
					.forEach((a: Availability) => {
						const aStart = new Date(a.start);
						const aEnd = new Date(a.end);
						if (aStart > endOfDay || aEnd < startOfDay) return;

						filteredEvents.push({
							id: a.id,
							title: 'Недоступен',
							start: aStart,
							end: aEnd,
							type: 'unavailable',
							isBooking: false,
						});
					});

				setEvents(filteredEvents);
			} catch (err) {
				console.error('Ошибка загрузки данных для мастера:', master.id, err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [master.id, selectedDate]);

	const EventComponent = ({ event }: { event: CalendarEvent }) => {
		// Теперь masterNames — через master из props
		const masterNames = event.masterIds
			?.map(id => {
				// Ищем среди мастеров (можно передать как пропс, или использовать closure)
				return workers.find(w => w.id === id);
			})
			.filter((w): w is Worker => w !== undefined)
			.map(w => `${w.first_name} ${w.last_name ? w.last_name[0] + '.' : ''}`)
			.join(', ') || '—';

		if (event.isBooking) {
			return (
				<div title={`Клиент: ${event.massage}`}>
					{event.steamProgram && <div><strong>{event.steamProgram}</strong></div>}
					{event.massage && <div>Клиент: {event.massage}</div>}
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

	if (loading) return <div className="h-64 bg-gray-50 flex items-center justify-center">Загрузка...</div>;

	return (
		<div className="border-b border-gray-300">
			<div className="p-2 bg-gray-100 text-sm font-medium">
				{master.first_name} {master.last_name}
			</div>
			<div style={{ height: 400 }}>
				<Calendar
					localizer={localizer}
					events={events}
					startAccessor="start"
					endAccessor="end"
					view="day"
					date={new Date(selectedDate)}
					views={['day']}
					style={{ height: '100%', width: '100%' }}
					formats={{
						timeGutterFormat: (date) => format(date, 'HH:mm', { locale: ru }),
						eventTimeRangeFormat: ({ start, end }) =>
							`${format(start, 'HH:mm', { locale: ru })} – ${format(end, 'HH:mm', { locale: ru })}`,
					}}
					components={{ event: EventComponent }}
					eventPropGetter={(event) => {
						if (event.isBooking) {
							return { style: { backgroundColor: '#d1fae5', color: '#166534', border: '1px solid #b2f3d0' } };
						}
						return { style: { backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' } };
					}}
					resizable
				// Убираем редактирование, если не нужна модалка
				/>
			</div>
		</div>
	);
}
