// app/dashboard/salary-staff-table/components/PaymentHistory.tsx
'use client';

import { useEffect, useState } from 'react';
import api from '@/app/utils/axiosConfig';
import { formatNumber } from '@/app/dashboard/salary-staff-table/components/formatters';


interface Payment {
	id: number;
	amount: number;
	paid_at: string;
	paid_by: string;
	comment: string | null;
	is_advance: boolean;
}

interface Props {
	userId: number;
	isVisible?: boolean; // для модалки
	onClose?: () => void;
}

export default function PaymentHistory({ userId, isVisible = true, onClose }: Props) {
	const [payments, setPayments] = useState<Payment[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!userId || !isVisible) return;

		loadPayments();
	}, [userId, isVisible]);

	const loadPayments = async () => {
		try {
			const res = await api.get('/api/reports/payments/', {
				params: { user_id: userId },
				headers: {
					Authorization: `Bearer ${localStorage.getItem('authToken')}`,
				},
			});
			setPayments(res.data);
		} catch (err: any) {
			console.error('Ошибка загрузки платежей:', err);
			alert('Не удалось загрузить историю платежей');
		} finally {
			setLoading(false);
		}
	};

	if (!isVisible) return null;

	return (
		<div className="my-3 bg-white rounded-lg border p-4 shadow-sm beautiful-scroll overflow-y-auto h-[300px]">
			<h3 className="text-lg font-semibold mb-3 text-gray-800">История платежей</h3>

			{loading ? (
				<p className="text-gray-500">Загрузка...</p>
			) : payments.length === 0 ? (
				<p className="text-gray-500">Платежей пока нет</p>
			) : (
				<div className="space-y-2 max-h-60 overflow-y-auto beautiful-scroll">
					{payments.map((p) => {
						const date = new Date(p.paid_at).toLocaleDateString('ru-RU');
						const sign = '+';
						return (
							<div
								key={p.id}
								className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
							>
								<div>
									<span className="font-medium">{sign} {formatNumber(p.amount)} ₽</span>
									<span className="text-gray-500 ml-2">от {date}</span>
								</div>
								<div className="text-right">
									<div className="text-gray-700">{p.paid_by}</div>
									{p.comment && (
										<div className="text-xs text-gray-500 italic">"{p.comment}"</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}

			{onClose && (
				<button
					onClick={onClose}
					className="mt-3 text-sm text-gray-500 hover:text-gray-700"
				>
					Закрыть
				</button>
			)}
		</div>
	);
}
