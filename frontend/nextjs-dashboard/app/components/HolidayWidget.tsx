// app/components/HolidayWidget.tsx
'use client';

import { useEffect, useState } from 'react';

interface Holiday {
	name: string;
	description: string;
	date: {
		iso: string;
	};
	type: string[];
	primary_type: string;
}

interface DayStatus {
	date: string;
	isHoliday: boolean;
	isWeekend: boolean;
	holiday?: Holiday;
}

export default function HolidayWidget({
	selectedDate,
	onDateSelect,
}: {
	selectedDate: Date;
	onDateSelect: (date: Date) => void;
}) {
	// Инициализируем displayMonth как начало месяца выбранной даты
	const [displayMonth, setDisplayMonth] = useState<Date>(() => {
		const d = new Date(selectedDate);
		d.setDate(1); // первое число месяца
		d.setHours(0, 0, 0, 0);
		return d;
	});

	const [holidays, setHolidays] = useState<Holiday[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Теперь безопасно:
	const currentMonth = displayMonth.getMonth();
	const currentYear = displayMonth.getFullYear();

	const displayMonthName = displayMonth.toLocaleDateString('ru', {
		month: 'long',
		year: 'numeric',
	});


	useEffect(() => {
		const year = displayMonth.getFullYear();
		const fetchHolidays = async () => {
			try {
				const res = await fetch(`/api/holidays?year=${year}&country=RU`);
				if (!res.ok) throw new Error('Не удалось загрузить праздники');
				const data = await res.json();
				if (data.success) setHolidays(data.holidays);
			} catch (err: any) {
				console.error('Ошибка в HolidayWidget:', err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};
		fetchHolidays();
	}, [displayMonth]);

	// Сбор статусов по всем дням месяца
	const getMonthDays = () => {
		const days: DayStatus[] = [];
		const firstDay = new Date(currentYear, currentMonth, 1);
		const lastDay = new Date(currentYear, currentMonth + 1, 0);

		// Начинаем с понедельника недели, в которой находится 1-е число
		const startDate = new Date(firstDay);
		const dayOfWeek = startDate.getDay(); // 0 = воскресенье
		const offset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // сдвиг до понедельника
		startDate.setDate(startDate.getDate() - offset);

		const endDate = new Date(lastDay);
		endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // до воскресенья

		let currentDate = new Date(startDate);

		while (currentDate <= endDate) {
			// ✅ Фиксируем дату именно в часовом поясе Москвы
			const dateStr = currentDate.toLocaleDateString('sv-SE', { timeZone: 'Europe/Moscow' }); // → "2025-12-04"

			const isCurrentMonth = currentDate.getMonth() === currentMonth;
			const dayInWeek = currentDate.toLocaleDateString('ru', { weekday: 'long', timeZone: 'Europe/Moscow' });
			const isWeekend = dayInWeek === 'суббота' || dayInWeek === 'воскресенье';

			const holiday = holidays.find((h) => h.date.iso.startsWith(dateStr));
			const isHoliday = !!holiday;

			days.push({
				date: dateStr,
				isHoliday,
				isWeekend,
				holiday: isHoliday ? holiday : undefined,
			});

			// Переход к следующему дню
			const nextDate = new Date(currentDate);
			nextDate.setDate(nextDate.getDate() + 1);
			currentDate = nextDate;
		}

		return days;
	};

	const days = getMonthDays();

	const weeks = [];
	for (let i = 0; i < days.length; i += 7) {
		weeks.push(days.slice(i, i + 7));
	}

	// Статус выбранного дня
	const selectedDateStr = selectedDate.toISOString().split('T')[0];
	const selectedDay = days.find((d) => d.date === selectedDateStr);
	const isHoliday = selectedDay?.isHoliday;
	const isWeekend = selectedDay?.isWeekend;

	const status = isHoliday
		? 'Праздник'
		: isWeekend
			? 'Выходной'
			: 'Рабочий день';

	const statusColor = isHoliday
		? 'bg-red-100 text-red-800'
		: isWeekend
			? 'bg-orange-100 text-orange-800'
			: 'bg-green-100 text-green-800';

	if (loading) {
		return (
			<div className="p-4 border border-gray-200 rounded-xl bg-white animate-pulse">
				<div className="h-5 bg-gray-200 rounded w-48 mb-4"></div>
				<div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
				<div className="h-4 bg-gray-200 rounded w-3/4"></div>
			</div>
		);
	}

	return (
		<div className="bg-white border border-gray-200 rounded-xl shadow-sm p-2 beautiful-scroll overflow-y-auto h-[560px]">

			<button
				type="button"
				onClick={() => {
					const today = new Date();
					setDisplayMonth(new Date(today.getFullYear(), today.getMonth(), 1));
					onDateSelect(today);
				}}
				className="text-xs text-blue-600 hover:text-blue-800 underline mb-3"
			>
				Перейти к сегодня
			</button>

			<h3 className="font-semibold text-gray-800 mb-4">Производственный календарь</h3>

			{/* Статус выбранного дня */}
			<div className={`px-3 py-1 rounded-full inline-block text-sm font-medium mb-4 ${statusColor}`}>
				{status}
			</div>

			<p className="text-gray-600 text-sm mb-4">
				{selectedDate.toLocaleDateString('ru', {
					day: 'numeric',
					month: 'long',
					year: 'numeric',
				})}
			</p>

			{/* Праздник на сегодня */}
			{/* {isHoliday && selectedDay?.holiday && (
				<div className="mb-4 p-2 bg-red-50 border border-red-200 rounded">
					<strong className="text-red-800">{selectedDay.holiday.name}</strong>
					{selectedDay.holiday.description && (
						<div className="text-xs text-gray-600 mt-1">{selectedDay.holiday.description}</div>
					)}
				</div>
			)} */}

			<hr className="my-4 border-gray-100" />

			{/* НАЗВАНИЕ МЕСЯЦА С НАВИГАЦИЕЙ */}
			<div className="flex justify-between items-center mb-2">
				<button
					onClick={() =>
						setDisplayMonth((prev) => {
							const newDate = new Date(prev);
							newDate.setMonth(newDate.getMonth() - 1);
							return newDate;
						})
					}
					className="text-gray-600 hover:text-gray-800"
					aria-label="Предыдущий месяц"
				>
					❮
				</button>

				<h4 className="font-medium text-gray-700 text-center">
					{displayMonth.toLocaleDateString('ru', { month: 'long', year: 'numeric' })}
				</h4>

				<button
					onClick={() =>
						setDisplayMonth((prev) => {
							const newDate = new Date(prev);
							newDate.setMonth(newDate.getMonth() + 1);
							return newDate;
						})
					}
					className="text-gray-600 hover:text-gray-800"
					aria-label="Следующий месяц"
				>
					❯
				</button>
			</div>

			{/* КАЛЕНДАРЬ С ПОДСВЕТКОЙ */}
			<div className="grid grid-cols-7 gap-1 text-xs mb-4">
				{['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
					<div key={day} className="text-center font-medium text-gray-600 py-1">
						{day}
					</div>
				))}
				{weeks.map((week, i) =>
					week.map((day, idx) => {
						const isCurrentMonth = day.date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`);
						const isToday = day.date === new Date().toISOString().split('T')[0];
						const isSelected = day.date === selectedDateStr;

						let bg = 'bg-gray-50';
						if (day.isHoliday) bg = 'bg-red-100';
						else if (day.isWeekend) bg = 'bg-orange-100';

						return (
							<div
								key={idx}
								className={`
									text-center py-1.5 rounded text-sm cursor-pointer
									${!isCurrentMonth ? 'text-gray-300' : ''}
									${isToday ? 'ring-2 ring-blue-400' : ''}
									${isSelected ? 'ring-2 ring-green-400' : ''}
									${bg} hover:shadow-sm transition
								`}
								onClick={() => onDateSelect(new Date(day.date))}
							>
								{new Date(day.date).getDate()}
							</div>
						);
					})
				)}
			</div>

			{/* ГРАФИК РАБОЧИХ ДНЕЙ */}
			<div className="mt-4">
				<h4 className="text-sm font-medium text-gray-700 mb-2">📊 Рабочие дни ({displayMonthName})</h4>
				<div className="space-y-1 text-xs">
					<div className="flex justify-between">
						<span>Рабочих дней:</span>
						<span className="font-medium">
							{days.filter((d) => d.isHoliday || d.isWeekend).length} выходных / праздников
						</span>
					</div>
					<div className="flex justify-between">
						<span>Ожидается:</span>
						<span className="font-medium text-green-600">
							{days.filter((d) => d.date.startsWith(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`) && !d.isWeekend && !d.isHoliday).length} рабочих
						</span>
					</div>
				</div>
			</div>

			{/* Подсказка */}
			{/* <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500">
				Данные: Calendarific API | Россия
			</div> */}
		</div>
	);
}
