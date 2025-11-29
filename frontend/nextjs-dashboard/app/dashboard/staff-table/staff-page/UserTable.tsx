// frontend/nextjs-dashboard/app/dashboard/staff-table/staff-page/UserTable.tsx

// Компонент таблицы пользователей

'use client';
import React, { useRef } from 'react';
import useUsers from './useUsers';
import { changeAvatar, resizeAndUpload } from './utils'; // Вспомогательные функции вынесены отдельно
import api from '@/app/utils/axiosConfig';

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  pin_code: string;
  avatar?: string | null;
  roles: { code: string; name: string }[];
  can_edit: boolean;
}

// Аннотируем типы props
type TableProps = {
  users: User[];
  refresh: () => void;
  setShowConfirm: (value: boolean) => void; // Точно определяем тип функции
  setUserToDelete: (id: number | null) => void; // Точно определяем тип функции
};

export default function UserTable({
  users,
  refresh,
  setShowConfirm,
  setUserToDelete,
}: TableProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null); // Реф для выбора файла

  const handleRoleChange = async (userId: number, roleCode: string, checked: boolean) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const currentRoles = user.roles.map(r => r.code);
    const newRoles = checked
      ? [...currentRoles, roleCode]
      : currentRoles.filter(r => r !== roleCode);

    try {
      await api.post(`/api/users/${userId}/roles/`, { roles: newRoles });
      refresh();
    } catch (err) {
      console.error('Ошибка при сохранении роли:', err);
      alert('Ошибка при сохранении роли');
    }
  };


  return (
    <>
      <table className="min-w-full divide-y divide-gray-200 text-center">
        <thead>
          <tr>
            <th className="w-xs px-2 py-1 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Логин
            </th>
            <th className="px-2 py-1 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Фото
            </th>
            <th className="px-2 py-1 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Имя
            </th>
            <th className="px-2 py-1 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Контакты
            </th>
            <th className="px-2 py-1 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Пин-код
            </th>
            <th className="px-2 py-1 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              АДМИН
            </th>
            <th className="px-2 py-1 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              ПАРМАСТЕР
            </th>
            <th className="px-2 py-1 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              МАССАЖИСТ
            </th>

            <th className="px-2 py-1 bg-gray-50 text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              {users.some(u => u.can_edit) ? 'УДАЛИТЬ' : ''}
            </th>


          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200 text-xs text-center">
          {users.map((user) => {
            const roleCodes = user.roles.map(r => r.code);
            return (
              <tr key={user.id} className={user.username === 'Fa-Dali' ? 'bg-yellow-50 border-l-4 border-l-red-500' : ''}>

                {/* Логин */}
                <td className="px-2 py-1 whitespace-pre-line break-words max-w-[80px]">{user.username}</td>

                {/* Фото */}
                <td className="px-2 py-1 overflow-hidden max-w-[50px]">
                  <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer">
                  {user.avatar ? (
                    <img src={`http://localhost:8000${user.avatar}`} alt={`${user.first_name} ${user.last_name}`} className="h-10 w-10 rounded-full object-cover" />
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

                {/* Имя и фамилия */}
                <td className="px-2 py-1 whitespace-no-wrap">
                  {user.first_name}
                  <br />
                  {user.last_name}
                </td>

                {/* Контакты */}
                <td className="px-2 py-1 whitespace-pre-line break-words max-w-[100px]">
                  {user.phone_number}
                  <br />
                  {user.email}
                </td>

                {/* Пин-код */}
                <td className="px-2 py-1 whitespace-no-wrap">{user.pin_code}</td>


                {/* Чекбоксы ролей — только если можно редактировать */}
                {/* АДМИН */}
                <td>
                  {user.can_edit ? (
                    <input
                      type="checkbox"
                      checked={roleCodes.includes('admin')}
                      disabled={user.username === 'Fa-Dali'}
                      title={user.username === 'Fa-Dali' ? 'Нельзя снять роль администратора с Fa-Dali' : ''}
                      onChange={e => {
                        if (user.username === 'Fa-Dali' && !e.target.checked) {
                          alert('Нельзя снять роль администратора с Fa-Dali');
                          return;
                        }
                        handleRoleChange(user.id, 'admin', e.target.checked);
                      }}
                    />
                  ) : (
                    roleCodes.includes('admin') ? '✓' : ''
                  )}
                </td>

                {/* ПАРАМЕСТЕР */}
                <td>
                  {user.can_edit ? (
                    <input
                      type="checkbox"
                      checked={roleCodes.includes('paramaster')}
                      onChange={e => handleRoleChange(user.id, 'paramaster', e.target.checked)}
                    />
                  ) : (
                    roleCodes.includes('paramaster') ? '✓' : ''
                  )}
                </td>

                {/* МАССАЖИСТ */}
                <td>
                  {user.can_edit ? (
                    <input
                      type="checkbox"
                      checked={roleCodes.includes('masseur')}
                      onChange={e => handleRoleChange(user.id, 'masseur', e.target.checked)}
                    />
                  ) : (
                    roleCodes.includes('masseur') ? '✓' : ''
                  )}
                </td>


                <td>
                  {user.can_edit ? user.username !== 'Fa-Dali' && (
                    <button
                      onClick={() => {
                        setShowConfirm(true); // Показываем модал
                        setUserToDelete(user.id); // Сохраняем ID пользователя
                      }}
                      className="rounded-lg px-4 py-2 bg-red-500 text-white hover:bg-red-600"
                    >
                      Удалить
                    </button>
                  ) : (
                    roleCodes.includes('masseur') ? '' : ''
                  )}
                </td>


              </tr>
            );
          })}
        </tbody>
      </table>

    </>

  );
}
