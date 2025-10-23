// app/dashboard/staff-table/staff_page/page.tsx
// 'use client';

// import React, { useEffect, useState, useRef } from 'react';
// import axios from 'axios';

// interface User {
// 	id: number;
// 	username: string;
// 	first_name: string;
// 	last_name: string;
// 	phone_number: string;
// 	email: string;
// 	password: string;
// 	confirm_password: string;
// 	pin_code: string;
// 	avatar?: string | null; // Предполагается, что Avatar возвращается как строка URL
// }

// export default function Page() {
// 	const [users, setUsers] = useState<User[]>([]);
// 	const fileInputRef = useRef<HTMLInputElement | null>(null); // Реф для hidden input

// 	useEffect(() => {
// 		const fetchUsers = async () => {
// 			try {
// 				const response = await axios.get('http://localhost:8000/api/users/');

// 				setUsers(response.data);
// 			} catch (error) {
// 				console.error('Ошибка при получении данных:', error);
// 			}
// 		};

// 		fetchUsers();
// 	}, []);

// 	// Метод для удаления пользователя
// 	const deleteUser = async (userId: number) => {
// 		try {
// 			await axios.delete(`http://localhost:8000/api/delete-user/${userId}/`);
// 			// Обновляем список пользователей после успешного удаления
// 			const updatedUsers = users.filter(user => user.id !== userId);
// 			setUsers(updatedUsers);
// 		} catch (error) {
// 			console.error('Ошибка удаления пользователя:', error);
// 		}
// 	};

// 	// Обработчик изменения аватара
// 	const changeAvatar = async (userId: number, newAvatar: Blob) => {
// 		const formData = new FormData();
// 		formData.append('avatar', newAvatar, `${Date.now()}.jpg`);

// 		try {
// 			await axios.put(
// 				`http://localhost:8000/api/update-avatar/${userId}/`,
// 				formData,
// 				{
// 					headers: {
// 						'Content-Type': 'multipart/form-data',
// 					},
// 				}
// 			);

// 			// Обновляем данные пользователя после успешного изменения аватара
// 			const updatedUsers = users.map(user =>
// 				user.id === userId ? { ...user, avatar: `/media/avatars/${user.id}_${Date.now()}.jpg` } : user
// 			);
// 			setUsers(updatedUsers);
// 		} catch (error) {
// 			console.error('Ошибка изменения аватара:', error);
// 		}
// 	};

// 	// Функция для изменения размера изображения до 250x250 пикселей
// 	const resizeAndUpload = async (file: File, userId: number) => {
// 		return new Promise(async resolve => {
// 			const img = new Image();
// 			img.src = URL.createObjectURL(file);

// 			img.onload = () => {
// 				const canvas = document.createElement('canvas');
// 				const ctx = canvas.getContext('2d');
// 				canvas.width = 250;
// 				canvas.height = 250;
// 				ctx!.drawImage(img, 0, 0, 250, 250);

// 				canvas.toBlob(blob => {
// 					blob && changeAvatar(userId, blob);
// 					resolve(blob);
// 				}, 'image/jpeg', 0.8);
// 			};
// 		});
// 	};

// 	// Состояние для открытия/закрытия модального окна
// 	const [showConfirm, setShowConfirm] = useState(false);
// 	const [userToDelete, setUserToDelete] = useState<number | null>(null);

// 	return (
// 		<div className="container mx-auto p-0">
// 			<h1 className="text-3xl font-semibold mb-4 pl-4">Коллектив</h1>
// 			<div className="container mx-auto p-4 beautiful-scroll overflow-y-auto h-[600px]">


// 				<table className="min-w-full divide-y divide-gray-200">
// 					<thead>
// 						<tr>
// 							<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
// 								Username
// 							</th>
// 							<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
// 								Avatar
// 							</th>
// 							<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
// 								First Name
// 							</th>
// 							<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
// 								Last Name
// 							</th>
// 							<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
// 								Phone Number
// 							</th>
// 							<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
// 								Email
// 							</th>
// 							<th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
// 								Pin Code
// 							</th>
// 						</tr>
// 					</thead>
// 					<tbody className="bg-white divide-y divide-gray-200">
// 						{users.map(user => (
// 							<tr key={user.id}>
// 								<td className="px-6 py-4 whitespace-no-wrap">{user.username}</td>
// 								<td className="px-6 py-4 whitespace-no-wrap">
// 									<div onClick={() => fileInputRef.current && fileInputRef.current.click()} className="cursor-pointer">
// 										{user.avatar ? (
// 											<img
// 												src={user.avatar}
// 												alt={`${user.first_name} ${user.last_name}'s avatar`}
// 												className="h-10 w-10 rounded-full object-cover"
// 											/>
// 										) : (
// 											<div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer">
// 												+
// 											</div>
// 										)}
// 									</div>
// 									<input
// 										ref={fileInputRef}
// 										id="upload-file"
// 										type="file"
// 										accept="image/*"
// 										onChange={(e) => e.target.files && resizeAndUpload(e.target.files[0], user.id)}
// 										style={{ display: 'none' }} // Скрываем поле
// 									/>
// 								</td>
// 								<td className="px-6 py-4 whitespace-no-wrap">
// 									{user.first_name}<br />{user.last_name}
// 								</td>
// 								<td className="px-6 py-4 whitespace-no-wrap">{user.phone_number}</td>
// 								<td className="px-6 py-4 whitespace-no-wrap">{user.email}</td>
// 								<td className="px-6 py-4 whitespace-no-wrap">{user.pin_code}</td>
// 								<td className="px-4 py-4">
// 									<button
// 										onClick={() => {
// 											// Открываем модальное окно и сохраняем ID пользователя
// 											setShowConfirm(true);
// 											setUserToDelete(user.id);
// 										}}
// 										className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
// 									>
// 										Удалить
// 									</button>
// 								</td>
// 							</tr>
// 						))}
// 					</tbody>


// 				</table>
// 				{/* Модальное окно подтверждения */}
// 				{showConfirm && userToDelete !== null && (
// 					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// 						<div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
// 							<h3 className="text-lg font-medium mb-4">Подтвердите удаление</h3>
// 							<p>Вы уверены, что хотите удалить пользователя?</p>

// 							<div className="mt-6 flex justify-end gap-3">
// 								<button
// 									onClick={() => setShowConfirm(false)}
// 									className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
// 								>
// 									Отмена
// 								</button>
// 								<button
// 									onClick={async () => {
// 										if (userToDelete) {
// 											await deleteUser(userToDelete);
// 											setShowConfirm(false);
// 										}
// 									}}
// 									className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
// 								>
// 									Удалить
// 								</button>
// 							</div>
// 						</div>
// 					</div>
// 				)}

// 			</div>
// 		</div>
// 	);
// }
// ===============================================

// app/dashboard/staff-table/page.tsx

'use client';
import React, { useState } from 'react';
import UserTable from './UserTable'; // Импортируем таблицу пользователей
import DeleteModal from './DeleteModal'; // Импортируем модальное окно удаления

export default function Page() {
	const [showConfirm, setShowConfirm] = useState(false);
	const [userToDelete, setUserToDelete] = useState<number | null>(null);

	return (
		<div className="container mx-auto p-0">
			<h1 className="text-3xl font-semibold mb-4 pl-4">Коллектив</h1>
			<div className="container mx-auto p-4 beautiful-scroll overflow-y-auto h-[600px]">
				<UserTable
					setShowConfirm={setShowConfirm} // Передаем метод изменения состояния видимости модального окна
					setUserToDelete={setUserToDelete} // Передаем метод сохранения выбранного пользователя
				/>
				{/* Модальное окно подтверждения */}
				{showConfirm && userToDelete !== null && (
					<DeleteModal
						show={showConfirm}
						handleClose={() => setShowConfirm(false)}
						userId={userToDelete}
					/>
				)}
			</div>
		</div>
	);
}
