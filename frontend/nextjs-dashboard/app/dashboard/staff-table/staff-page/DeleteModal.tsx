// Компонент модального окна удаления

// app/dashboard/staff-table/DeleteModal.tsx
'use client';
import React, { useCallback } from 'react';
import { deleteUser } from './utils'; // Импортируем функцию удаления пользователя

type Props = {
  show: boolean;
  handleClose: () => void;
  userId: number | null;
};

export default function DeleteModal({ show, handleClose, userId }: Props) {
  const closeModal = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const handleDelete = useCallback(async () => {
    if (!userId) return;
    await deleteUser(userId); // Удаление пользователя
    handleClose(); // Закрытие модала после удаления
  }, [userId, handleClose]);

  return (
    <>
      {show && userId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-medium mb-4">Подтвердите удаление</h3>
            <p>Вы уверены, что хотите удалить пользователя?</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
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
