// frontend/src/components/SendReportModal.tsx

import React from 'react';

// ОТПРАВКА ОТЧЕТА ПО ВЫБРАННОЙ ДАТЕ или СЕГОДНЯ НА ЕМАЙЛ АДМИНИСТРАЦИИ

// пропсы для компонента
interface SendReportModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSend: (date: string) => void;
}

const SendReportModal: React.FC<SendReportModalProps> = ({ isOpen, onClose, onSend }) => {
	const [emailMode, setEmailMode] = React.useState<'today' | 'date'>('today');
	const [customDate, setCustomDate] = React.useState<string>('');

	// формируем дату для отправки (сегодня или дата)
	const handleSubmit = () => {
		let dateToSend = '';
		if (emailMode === 'today') {
			const today = new Date();
			dateToSend = today.toISOString().split('T')[0]; // YYYY-MM-DD
		} else {
			if (!customDate) {
				alert('Выберите дату');
				return;
			}
			dateToSend = customDate;
		}

		onSend(dateToSend);
	};

	if (!isOpen) return null;

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0,0,0,0.5)',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				zIndex: 1000,
			}}
			onClick={onClose} // Закрытие по клику на фон
		>
			<div
				style={{
					background: 'white',
					padding: '24px',
					borderRadius: '8px',
					width: '400px',
					maxWidth: '90vw',
				}}
				onClick={(e) => e.stopPropagation()} // Не закрывать при клике внутри
			>
				<h3 style={{ margin: 0, marginBottom: '16px' }}>Отправить отчёт</h3>

				{/* Выбор типа */}
				<div style={{ marginBottom: '16px' }}>
					<div>
						<label>
							<input
								type="radio"
								checked={emailMode === 'today'}
								onChange={() => setEmailMode('today')}
							/>
							<span style={{ marginLeft: '6px' }}>Отправить сегодняшний отчёт</span>
						</label>
					</div>
					<div style={{ marginTop: '8px' }}>
						<label>
							<input
								type="radio"
								checked={emailMode === 'date'}
								onChange={() => setEmailMode('date')}
							/>
							<span style={{ marginLeft: '6px' }}>Отправить за дату:</span>
						</label>
						<input
							type="date"
							value={customDate}
							onChange={(e) => setCustomDate(e.target.value)}
							disabled={emailMode !== 'date'}
							style={{
								marginLeft: '8px',
								padding: '4px',
								border: '1px solid #ccc',
								borderRadius: '4px',
								opacity: emailMode === 'date' ? 1 : 0.5,
							}}
						/>
					</div>
				</div>

				{/* Кнопки */}
				<div style={{ textAlign: 'right' }}>
					<button
						onClick={onClose}
						style={{
							padding: '6px 12px',
							marginRight: '10px',
							backgroundColor: '#ccc',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
						}}
					>
						Отмена
					</button>
					<button
						onClick={handleSubmit}
						style={{
							padding: '6px 12px',
							backgroundColor: '#007bff',
							color: 'white',
							border: 'none',
							borderRadius: '4px',
							cursor: 'pointer',
						}}
					>
						Отправить
					</button>
				</div>
			</div>
		</div>
	);
};

export default SendReportModal;
