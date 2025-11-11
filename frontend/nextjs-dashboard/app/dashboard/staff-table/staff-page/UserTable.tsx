// app/dashboard/staff-table/UserTable.tsx

// Компонент таблицы пользователей

// app/dashboard/staff-table/UserTable.tsx

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
  const { users } = useUsers(); // Используем хук для получения списка пользователей
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Реф для выбора файла


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
        {users.map((user) => (
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
            {/* Показываем кнопку "Удалить", только если username != "Fa-Dali" */}
            {user.username !== 'Fa-Dali' && (
              <td className="px-6 py-4 whitespace-no-wrap">
                <button
                  onClick={() => {
                    setShowConfirm(true); // Показываем модал
                    setUserToDelete(user.id); // Сохраняем ID пользователя
                  }}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Удалить
                </button>
                {/* <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Удалить
                </button> */}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
