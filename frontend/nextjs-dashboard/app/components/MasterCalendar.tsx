// frontend/nextjs-dashboard/app/components/MasterCalendar.tsx
'use client'
import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import AvailabilityModal from './AvailabilityModal';
import Toast from './Toast';

const localizer = momentLocalizer(moment);

export default function MasterCalendar() {
	const [events, setEvents] = useState<any[]>([]);
	const [showModal, setShowModal] = useState(false);
	const [selectedSlot, setSelectedSlot] = useState<any>(null);
	const [error, setError] = useState('');
	const masterId = 1; // ← позже: из auth

	useEffect(() => {
		fetchEvents();
	}, []);

	const fetchEvents = async () => {
		const [bookingsRes, availRes] = await Promise.all([
			fetch(`/api/scheduling/bookings/?master=${masterId}`),
			fetch(`/api/scheduling/availabilities/?master=${masterId}`)
		]);
		const bookings = await bookingsRes.json();
		const availabilities = await availRes.json();

		const events = [
			...bookings.map((b: any) => ({
				title: b.client_name || 'Аренда',
				start: new Date(b.start),
				end: new Date(b.end),
			})),
			...availabilities.map((a: any) => ({
				title: 'Доступен',
				start: new Date(a.start),
				end: new Date(a.end),
				style: { backgroundColor: 'green', opacity: 0.5 },
			}))
		];
		setEvents(events);
	};

	const handleSelectSlot = (slotInfo: any) => {
		setSelectedSlot(slotInfo);
		setShowModal(true);
	};

	const handleError = (msg: string) => {
		setError(msg);
		setTimeout(() => setError(''), 5000);
	};

	return (
		<div className="p-4">
			{error && <Toast message={error} type="error" />}
			<h2 className="text-xl font-bold mb-4">Мой календарь</h2>
			<Calendar
				localizer={localizer}
				events={events}
				startAccessor="start"
				endAccessor="end"
				selectable
				onSelectSlot={handleSelectSlot}
				step={15}
				defaultView="week"
				views={['day', 'week']}
				className="h-[80vh] mt-4"
			/>
			{showModal && selectedSlot && (
				<AvailabilityModal
					slot={selectedSlot}
					onClose={() => setShowModal(false)}
					onSaved={fetchEvents}
					onError={handleError}
				/>
			)}
		</div>
	);
}
