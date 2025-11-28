// app/components/WeatherWidget.tsx
'use client';

import { useEffect, useState } from 'react';

interface ForecastItem {
	dt: number;
	main: {
		temp: number;
		feels_like: number;
		humidity: number;
		pressure: number; // Давление в гПа
	};
	weather: {
		main: string;
		description: string;
		icon: string;
	}[];
	wind: {
		speed: number; // м/с
	};
	dt_txt: string;
	rain?: { '3h': number };
	snow?: { '3h': number };
}

interface WeatherData {
	list: ForecastItem[];
}

interface DailyForecast {
	date: string;
	temp: { min: number; max: number };
	icon: string;
	description: string;
}

export default function WeatherWidget({ selectedDate }: { selectedDate: Date }) {
	const [forecast, setForecast] = useState<ForecastItem[]>([]);
	const [dailyForecast, setDailyForecast] = useState<DailyForecast[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchForecast = async () => {
			try {
				const API_KEY = '7a2dc922407828d26c47934a8d6c0394';
				const CITY = 'Ярославль';
				const url = `https://api.openweathermap.org/data/2.5/forecast?q=${CITY}&appid=${API_KEY}&lang=ru&units=metric`;

				const response = await fetch(url);

				if (!response.ok) {
					throw new Error('Не удалось загрузить прогноз');
				}

				const data: WeatherData = await response.json();

				// === 1. Фильтр: прогноз на выбранный день ===
				const targetDateStr = selectedDate.toISOString().split('T')[0];
				const dailyData = data.list.filter((item) => item.dt_txt.startsWith(targetDateStr));

				if (dailyData.length === 0) {
					const now = new Date();
					const next24 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
					const fallback = data.list.filter((item) => {
						const itemDate = new Date(item.dt_txt);
						return itemDate >= now && itemDate <= next24;
					});
					setForecast(fallback);
				} else {
					setForecast(dailyData);
				}

				// === 2. Собираем прогноз на 5 дней ===
				const dailyMap = new Map<string, { temps: number[]; icon: string; description: string }>();

				data.list.forEach((item) => {
					const date = item.dt_txt.split(' ')[0]; // '2025-04-05'
					if (!dailyMap.has(date)) {
						dailyMap.set(date, {
							temps: [],
							icon: item.weather[0].icon,
							description: item.weather[0].description,
						});
					}
					dailyMap.get(date)!.temps.push(item.main.temp);
				});

				const next5Days: DailyForecast[] = Array.from(dailyMap.entries())
					.slice(0, 5)
					.map(([date, info]) => ({
						date,
						temp: {
							min: Math.min(...info.temps),
							max: Math.max(...info.temps),
						},
						icon: info.icon,
						description: info.description,
					}));

				setDailyForecast(next5Days);
			} catch (err: any) {
				console.error('Ошибка в WeatherWidget:', err);
				setError(err.message || 'Неизвестная ошибка');
			} finally {
				setLoading(false);
			}
		};

		fetchForecast();
	}, [selectedDate]);

	// === График температуры (без изменений) ===
	const hours = forecast.map((item) => new Date(item.dt_txt).getHours());
	const temps = forecast.map((item) => item.main.temp);
	const maxTemp = Math.max(...temps);
	const minTemp = Math.min(...temps);
	const range = maxTemp - minTemp || 1;

	const chartHeight = 60;
	const chartWidth = hours.length > 1 ? 300 : 100;
	const points = forecast
		.map((item, i) => {
			const x = (i / (forecast.length - 1 || 1)) * chartWidth;
			const y = chartHeight - ((item.main.temp - minTemp) / range) * chartHeight;
			return `${x},${y}`;
		})
		.join(' ');

	const targetDateString = selectedDate.toLocaleDateString('ru', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});

	if (loading) {
		return (
			<div className="p-4 border border-blue-200 rounded-lg bg-blue-50 animate-pulse">
				<div className="h-5 bg-blue-200 rounded w-48 mb-4"></div>
				<div className="flex gap-2">
					{[...Array(8)].map((_, i) => (
						<div key={i} className="flex flex-col items-center min-w-16">
							<div className="h-4 bg-blue-200 rounded w-6 mb-1"></div>
							<div className="h-8 bg-blue-200 rounded w-8 mb-1"></div>
							<div className="h-4 bg-blue-200 rounded w-8"></div>
						</div>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg">
				❌ {error}
			</div>
		);
	}

	if (!forecast.length) {
		return (
			<div className="p-4 text-gray-500 bg-gray-50 border border-gray-200 rounded-lg">
				Нет данных на выбранный день.
			</div>
		);
	}

	return (
		<div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
			<h3 className="font-semibold text-gray-800 mb-3">
				Погода {targetDateString}
			</h3>

			{/* === ГРАФИК ТЕМПЕРАТУРЫ С ОСЬЮ Y === */}
			<div className="flex mb-3">
				{/* === ВЕРТИКАЛЬНАЯ ШКАЛА (Y-ось) === */}
				<div className="flex flex-col justify-between h-15 text-xs text-gray-600 pr-1" style={{ height: `${chartHeight}px` }}>
					<span>{Math.ceil(maxTemp)}°</span>
					<span>{Math.round((maxTemp + minTemp) / 2)}°</span>
					<span>{Math.floor(minTemp)}°</span>
				</div>

				{/* === ГРАФИК === */}
				<div className="flex-1 overflow-hidden">
					<svg width={chartWidth} height={chartHeight} className="overflow-visible">
						{/* Горизонтальные линии фона (опционально) */}
						<line x1="0" y1="0" x2={chartWidth} y2="0" stroke="#e5e7eb" strokeWidth="1" />
						<line x1="0" y1={chartHeight / 2} x2={chartWidth} y2={chartHeight / 2} stroke="#e5e7eb" strokeWidth="1" />
						<line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#e5e7eb" strokeWidth="1" />

						{/* Линия графика */}
						<polyline
							fill="none"
							stroke="#3B82F6"
							strokeWidth="2"
							points={points}
							strokeLinecap="round"
							strokeLinejoin="round"
						/>

						{/* Точки */}
						{forecast.map((item, i) => {
							const x = (i / (forecast.length - 1 || 1)) * chartWidth;
							const y = chartHeight - ((item.main.temp - minTemp) / range) * chartHeight;
							return <circle key={i} cx={x} cy={y} r="2" fill="#3B82F6" />;
						})}
					</svg>

					{/* ОСЬ X — часы */}
					<div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
						{hours.map((h) => (
							<span key={h}>{h}:00</span>
						))}
					</div>
				</div>
			</div>

			{/* === ПОЧАСОВАЯ ШКАЛА С ВЕТРОМ, ДАВЛЕНИЕМ, ОСАДКАМИ === */}
			<div className="flex gap-2 overflow-x-auto pb-2">
				{forecast.map((item, i) => {
					const hour = new Date(item.dt_txt).getHours();
					const hasRain = item.rain ? (item.rain['3h'] || 0) > 0 : false;
					const hasSnow = item.snow ? (item.snow['3h'] || 0) > 0 : false;

					return (
						<div
							key={i}
							className="flex flex-col items-center min-w-20 p-2 border border-gray-100 rounded-lg bg-gray-50 text-xs"
						>
							<div className="text-gray-600">{hour}:00</div>

							<img
								src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
								alt={item.weather[0].description}
								className="w-8 h-8"
								title={item.weather[0].description}
							/>

							<div className="font-medium text-blue-700">{Math.round(item.main.temp)}°</div>

							<div className="text-gray-500" title="Ветер">
								🌬️ {item.wind.speed.toFixed(1)} м/с
							</div>

							<div className="text-gray-500" title="Давление">
								📉 {item.main.pressure} гПа
							</div>

							{hasRain && (
								<div className="text-blue-500" title={`Дождь: ${item.rain!['3h']} мм`}>
									🌧 {item.rain!['3h'].toFixed(1)}мм
								</div>
							)}
							{hasSnow && (
								<div className="text-blue-500" title={`Снег: ${item.snow!['3h']} мм`}>
									❄️ {item.snow!['3h'].toFixed(1)}мм
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* === ПРОГНОЗ НА 5 ДНЕЙ === */}
			{dailyForecast.length > 0 && (
				<div className="mt-4 pt-3 border-t border-gray-100">
					<h4 className="text-sm font-medium text-gray-700 mb-2">Прогноз на 5 дней</h4>
					<div className="flex gap-3 overflow-x-auto">
						{dailyForecast.map((day, i) => {
							const date = new Date(day.date);
							const weekday = date.toLocaleDateString('ru', { weekday: 'short' });
							const dayOfMonth = date.getDate();

							return (
								<div
									key={i}
									className={`flex flex-col items-center min-w-20 p-2 rounded-lg ${i === 0
										? 'bg-blue-100 border border-blue-200'
										: 'bg-gray-50 border border-gray-100'
										}`}
								>
									<div className="text-xs text-gray-600">
										{weekday} {dayOfMonth}
									</div>
									<img
										src={`https://openweathermap.org/img/wn/${day.icon}.png`}
										alt={day.description}
										className="w-8 h-8"
									/>
									<div className="text-sm font-semibold">
										{Math.round(day.temp.max)}°
									</div>
									<div className="text-xs text-gray-500">
										{Math.round(day.temp.min)}°
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</div>
	);
}
