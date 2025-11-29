// app/dashboard/staff-table/page.tsx

'use client';
import React, { useState } from 'react';
import UserTable from './UserTable'; // Импортируем таблицу пользователей
import DeleteModal from './DeleteModal'; // Импортируем модальное окно удаления
import useUsers from './useUsers';

export default function Page() {
	const { users, refresh } = useUsers(); // ✅ Один источник правды
	const [showConfirm, setShowConfirm] = useState(false);
	const [userToDelete, setUserToDelete] = useState<number | null>(null);


	return (
		<div className="container">
			<h1 className="text-3xl font-semibold mb-2 pl-1">Коллектив</h1>
			<div className="container mx-auto p-0">
				<UserTable
					users={users}
					refresh={refresh}
					setShowConfirm={setShowConfirm} // Передаем метод изменения состояния видимости модального окна
					setUserToDelete={setUserToDelete} // Передаем метод сохранения выбранного пользователя
				/>
				{/* Модальное окно подтверждения */}
				{showConfirm && userToDelete !== null && (
					<DeleteModal
						show={showConfirm}
						handleClose={() => setShowConfirm(false)}
						userId={userToDelete}
						refresh={refresh}
					/>
				)}
			</div>
		</div>
	);
}
