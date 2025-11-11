// frontend/nextjs-dashboard/app/dashboard/staff-table/staff-page/UserTable.tsx

// Компонент таблицы пользователей

'use client';
import React, { useRef } from 'react';
import useUsers from './useUsers';
import { changeAvatar, resizeAndUpload } from './utils'; // Вспомогательные функции вынесены отдельно

// Аннотируем типы props
type TableProps = {
  setShowConfirm: (value: boolean) => void; // Точно определяем тип функции
  setUserToDelete: (id: number | null) => void; // Точно определяем тип функции
};

export default function UserTable({ setShowConfirm, setUserToDelete }: TableProps) {
  const { users, refresh } = useUsers(); // Используем хук для получения списка пользователей
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Реф для выбора файла

  const handleRoleChange = async (userId: number, roleCode: string, checked: boolean) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const currentRoles = user.roles.map(r => r.code);
    const newRoles = checked
      ? [...currentRoles, roleCode]
      : currentRoles.filter(r => r !== roleCode);

    try {
      const token = localStorage.getItem('access_token');
      await fetch(`http://localhost:8000/api/users/${userId}/roles/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ roles: newRoles })
      });
      refresh(); // Обновить список
    } catch (err) {
      alert('Ошибка при сохранении роли');
    }
  };


  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
            Логин
          </th>
          <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
            Фото
          </th>
          <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
            Имя
          </th>
          <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
            Фамилия
          </th>
          <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
            Телефон
          </th>
          <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
            Email
          </th>
          <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
            Пин-код
          </th>
        </tr>
      </thead>

      <tbody className="bg-white divide-y divide-gray-200">
        {users.map((user) => {
          const roleCodes = user.roles.map(r => r.code);
          return (
            <tr key={user.id}>

              <td className="px-6 py-4 whitespace-pre-line break-words max-w-[80px]">{user.username}</td>

              <td className="px-6 py-4 overflow-hidden max-w-[50px]">
                <div onClick={() => fileInputRef.current && fileInputRef.current.click()} className="cursor-pointer">
                  {user.avatar ? (
                    <img src={user.avatar} alt={`${user.first_name} ${user.last_name}`} className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer">+</div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && resizeAndUpload(e.target.files[0], user.id)}
                  style={{ display: 'none' }} // Скрытый элемент
                />
              </td>

              <td className="px-6 py-4 whitespace-no-wrap">
                {user.first_name}
                <br />
                {user.last_name}
              </td>

              <td className="px-6 py-4 whitespace-no-wrap">{user.phone_number}</td>
              <td className="px-6 py-4 whitespace-pre-line break-words max-w-[100px]">{user.email}</td>
              <td className="px-6 py-4 whitespace-no-wrap">{user.pin_code}</td>

              {/* Чекбоксы ролей */}
              <td><input type="checkbox" checked={roleCodes.includes('admin')} onChange={e => handleRoleChange(user.id, 'admin', e.target.checked)} /></td>
              <td><input type="checkbox" checked={roleCodes.includes('paramaster')} onChange={e => handleRoleChange(user.id, 'paramaster', e.target.checked)} /></td>
              <td><input type="checkbox" checked={roleCodes.includes('masseur')} onChange={e => handleRoleChange(user.id, 'masseur', e.target.checked)} /></td>



              {/* Показываем кнопку "Удалить", только если username != "Fa-Dali" */}
              <td className="px-6 py-4 whitespace-no-wrap">
                {user.username !== 'Fa-Dali' && (
                  <button
                    onClick={() => {
                      setShowConfirm(true); // Показываем модал
                      setUserToDelete(user.id); // Сохраняем ID пользователя
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Удалить
                  </button>
                )}

              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
