// Компонент модального окна удаления

// app/dashboard/staff-table/DeleteModal.tsx
'use client';
import React, { useCallback } from 'react';
import { deleteUser } from './utils'; // Импортируем функцию удаления пользователя

type Props = {
  show: boolean;
  handleClose: () => void;
  userId: number | null;
  refresh: () => void;
};

export default function DeleteModal({ show, handleClose, userId, refresh }: Props) {
  const handleDelete = useCallback(async () => {
    if (!userId) return;
    try {
      await deleteUser(userId);
      refresh(); // ✅ Обновляем данные
    } catch (error) {
      console.error('Ошибка при удалении:', error);
      alert('Не удалось удалить пользователя');
    } finally {
      handleClose();
    }
  }, [userId, refresh, handleClose]);


  return (
    <>
      {show && userId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4">Подтвердите удаление</h3>
            <p>Вы уверены, что хотите удалить пользователя?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={handleClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
                Отмена
              </button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
