// app/dashboard/report-master/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/app/auth/contexts/auth-provider';

const SERVICE_OPTIONS = [
	'Администратор',
	'Парение',
	'Сила Леса',
	'Без Сю-Сю',
	'Карелия',
	'Массаж',
	'Общий',
	'Лимфодренаж',
	'Стоун',
] as const;

type Service = typeof SERVICE_OPTIONS[number];

interface Row {
	id: number;
	service: Service | '';
	adults: number;
	children: number;
	salary: string;
}

interface ReportMasterPageProps {
	refreshStats: () => void;
}

export default function ReportMasterPage({ refreshStats }: ReportMasterPageProps) {
	const { user } = useAuth();

	const [selectedReport, setSelectedReport] = useState<any>(null);


	const [selectedDate, setSelectedDate] = useState<string>(() => {
		return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
	});


	const [rows, setRows] = useState<Row[]>([{ id: Date.now(), service: '', adults: 0.5, children: 0, salary: '' }]);
	const [totalClients, setTotalClients] = useState(0);
	const [totalSalary, setTotalSalary] = useState(0);

	// Обновление итогов
	useEffect(() => {
		const totalCl = rows.reduce((sum, r) => sum + r.adults + r.children, 0);
		const totalSal = rows.reduce((sum, r) => sum + (parseFloat(r.salary) || 0), 0);
		setTotalClients(totalCl);
		setTotalSalary(totalSal);
	}, [rows]);

	const addRow = () => {
		setRows([...rows, { id: Date.now(), service: '', adults: 0.5, children: 0, salary: '' }]);
	};

	const lastServiceRef = useRef<HTMLSelectElement>(null);

	useEffect(() => {
		if (lastServiceRef.current) {
			lastServiceRef.current.focus();
		}
	}, [rows.length]);

	const removeRow = (id: number) => {
		setRows(rows.filter(r => r.id !== id));
	};

	const updateRow = (id: number, field: keyof Row, value: any) => {
		setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
	};



	const formatNumber = (value: string | number) => {
		const num = String(value).replace(/\D/g, '');
		return num ? parseInt(num, 10).toLocaleString('ru-RU') : '';
	};

	const loadReport = async (date: string) => {
		try {
			const token = localStorage.getItem('authToken');
			if (!token) {
				alert('Токен не найден. Пожалуйста, войдите снова.');
				return;
			}

			const res = await fetch(`http://localhost:8000/api/reports/master-reports/date/${date}/`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				}
			});

			if (res.ok) {
				const data = await res.json();

				// Сохраняем полный отчёт (включая id и paid)
				if (data.id) {
					setSelectedReport(data);
				} else {
					setSelectedReport(null);
				}

				if (!data.data || !Array.isArray(data.data)) {
					setRows([{ id: Date.now(), service: '', adults: 0.5, children: 0, salary: '' }]);
					return;
				}

				const mappedRows = data.data.map((r: any) => ({
					id: Date.now() + Math.random(),
					service: r.service,
					adults: r.clients.adults,
					children: r.clients.children,
					salary: String(r.salary),
				}));
				setRows(mappedRows.length > 0 ? mappedRows : [{ id: Date.now(), service: '', adults: 0.5, children: 0, salary: '' }]);
			} else if (res.status === 404) {
				setRows([{ id: Date.now(), service: '', adults: 0.5, children: 0, salary: '' }]);
			} else if (res.status === 401) {
				alert('Ошибка авторизации. Пожалуйста, перезайдите.');
			} else {
				const error = await res.json();
				alert('Ошибка: ' + (error.error || 'Неизвестная ошибка'));
			}
		} catch (err) {
			console.error('Ошибка загрузки отчёта', err);
			alert('Не удалось загрузить отчёт за эту дату');
		}
	};

	useEffect(() => {
		loadReport(selectedDate);
	}, []);

	if (!user) return <div>Загрузка...</div>;

	const saveReport = async () => {
		// Фильтруем пустые строки
		const filledRows = rows.filter(
			r => r.service && (r.adults > 0 || r.children > 0) && (parseFloat(r.salary) > 0)
		);

		if (filledRows.length === 0) {
			alert('Добавьте хотя бы одну заполненную строку');
			return;
		}

		const payload = {
			master_id: user.id,
			master_name: `${user.first_name} ${user.last_name}`.trim() || user.username,
			date: selectedDate,
			rows: filledRows.map(r => ({
				service: r.service,
				clients: { adults: r.adults, children: r.children },
				salary: parseFloat(r.salary) || 0
			})),
			total_clients: totalClients,
			total_salary: totalSalary
		};

		try {
			const res = await fetch('http://localhost:8000/api/reports/master-reports/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${localStorage.getItem('authToken')}`
				},
				body: JSON.stringify(payload)
			});

			if (res.ok) {
				// alert('Отчёт сохранён!');  АДЕРТ ДАННЫЕ ЗАГРУЖЕНЫ
				// ✅ Обновляем статистику
				refreshStats();
			} else {
				const data = await res.json();
				alert('Ошибка: ' + (data.error || 'Неизвестная ошибка'));
			}
		} catch (err) {
			console.error(err);
			alert('Ошибка сети. Проверьте соединение.');
		}
	};


	const deleteReport = async () => {
		if (!selectedReport) return;

		if (!window.confirm('Вы уверены, что хотите удалить этот отчёт?')) {
			return;
		}

		try {
			const token = localStorage.getItem('authToken');
			const res = await fetch(
				`http://localhost:8000/api/reports/master-reports/${selectedReport.id}/`,
				{
					method: 'DELETE',
					headers: {
						'Authorization': `Bearer ${token}`,
					},
				}
			);

			if (res.ok) {
				alert('Отчёт удалён!');
				// Сбрасываем таблицу
				setRows([{ id: Date.now(), service: '', adults: 0.5, children: 0, salary: '' }]);
				setSelectedReport(null); // убрали id
				// Обновляем статистику
				refreshStats();
			} else {
				const error = await res.json();
				alert('Ошибка: ' + (error.error || 'Не удалось удалить'));
			}
		} catch (err) {
			console.error(err);
			alert('Ошибка сети');
		}
	};


	return (
		<div className="container mx-auto p-4">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-center">ОТЧЕТ МАСТЕРА</h1>
				<div className="flex items-center gap-2">
					<label className="text-sm text-gray-600">Дата:</label>
					<input
						type="date"
						value={selectedDate}
						max={new Date().toISOString().split('T')[0]}
						onChange={(e) => {
							const newDate = e.target.value;
							setSelectedDate(newDate);
							// ✅ Добавим загрузку при смене даты
							loadReport(newDate);
						}}
						className="p-1 border rounded text-sm"
					// max={new Date().toISOString().split('T')[0]} // только прошлое и сегодня
					/>
				</div>
			</div>

			<table className="w-full border-collapse border border-gray-400">
				<thead>
					<tr className="bg-gray-100">
						<th className="border border-gray-300 w-10"></th>
						<th className="border border-gray-300">УСЛУГА</th>
						<th className="border border-gray-300">КЛИЕНТЫ</th>
						<th className="border border-gray-300">ЗАРПЛАТА</th>
					</tr>
					<tr className="bg-gray-50 text-sm">
						<td className="border border-gray-300"></td>
						<td className="border border-gray-300"></td>
						<td className="border border-gray-300">
							<div className="grid grid-cols-2 text-center">
								<span>взрослые</span>
								<span>дети</span>
							</div>
						</td>
						<td className="border border-gray-300"></td>
					</tr>
				</thead>
				<tbody>
					{rows.map(row => (
						<tr key={row.id} className="text-center">
							<td className="border border-gray-300">
								<button
									onClick={() => removeRow(row.id)}
									className="text-red-500 hover:text-red-700"
								>
									✖
								</button>
							</td>
							<td className="border border-gray-300">
								<select
									ref={row.id === rows[rows.length - 1]?.id ? lastServiceRef : null}
									value={row.service}
									onChange={e => updateRow(row.id, 'service', e.target.value)}
									className="w-full p-1 border rounded"
								>
									<option value="">Выберите</option>
									{SERVICE_OPTIONS.map(s => (
										<option key={s} value={s}>{s}</option>
									))}
								</select>
							</td>
							<td className="border border-gray-300">
								<div className="grid grid-cols-2 gap-1">
									<input
										type="number"
										step="0.5"
										min="0"
										max="15"
										value={row.adults}
										onChange={e => updateRow(row.id, 'adults', parseFloat(e.target.value))}
										className="p-1 border rounded text-center"
									/>
									<input
										type="number"
										step="0.5"
										min="0"
										max="15"
										value={row.children}
										onChange={e => updateRow(row.id, 'children', parseFloat(e.target.value))}
										className="p-1 border rounded text-center"
									/>
								</div>
							</td>
							<td className="border border-gray-300">
								<input
									type="text"
									placeholder="000 000"
									value={formatNumber(row.salary)}
									onChange={e => {
										const raw = e.target.value.replace(/\D/g, '');
										updateRow(row.id, 'salary', raw);
									}}
									className="w-32 p-1 border rounded text-right font-mono"
									inputMode="numeric"
								/>
							</td>
						</tr>
					))}
				</tbody>
				<tfoot>
					<tr className="font-bold bg-gray-100">
						<td colSpan={2} className="text-right pr-2">ИТОГО:</td>
						<td className="text-center">
							<div className="grid grid-cols-2">
								<span>{rows.reduce((sum, r) => sum + r.adults, 0)}</span>
								<span>{rows.reduce((sum, r) => sum + r.children, 0)}</span>
							</div>
						</td>
						<td className="text-right pr-2">
							{totalSalary.toLocaleString('ru-RU')} ₽
						</td>
					</tr>
				</tfoot>
			</table>

			<div className="mt-4 space-x-2">
				<button
					onClick={addRow}
					className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
				>
					+ Добавить строку
				</button>
				<button
					onClick={saveReport}
					className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
				>
					Сохранить
				</button>
				{/* Кнопка удаления */}
				{selectedReport && !selectedReport.paid && (
					<button
						onClick={deleteReport}
						className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
					>
						Удалить отчёт
					</button>
				)}
			</div>
		</div>
	);
}
