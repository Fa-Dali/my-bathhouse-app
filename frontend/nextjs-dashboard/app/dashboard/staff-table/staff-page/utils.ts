// app/dashboard/staff-table/utils.ts

// Вспомогательные функции

import api from '@/app/utils/axiosConfig';

// Типы данных
interface User {
  id: number;
  avatar?: string | null;
}

// Загрузка и изменение аватара
export const changeAvatar = async (userId: number, newAvatar: Blob) => {
  const formData = new FormData();
  const fileExt = newAvatar.type.split('/').pop() || 'jpg';
  const fileName = `${Date.now()}.${fileExt}`;
  formData.append('avatar', newAvatar, fileName);

  try {
    await api.put(`/api/update-avatar/${userId}/`, formData);
    // Пока оставим угадывание пути — позже заменим на ответ с сервера
    return `/media/avatars/${userId}_${Date.now()}.${fileExt}`;
  } catch (error) {
    console.error('Ошибка изменения аватара:', error);
  }
};

// Изменение размеров изображения перед загрузкой
export const resizeAndUpload = async (file: File, userId: number) => {
  return new Promise(async (resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      canvas.width = 250;
      canvas.height = 250;
      ctx.drawImage(img, 0, 0, 250, 250);

      canvas.toBlob((blob) => {
        blob && changeAvatar(userId, blob).then(resolve);
      }, 'image/jpeg', 0.8);
    };
  });
};

// Логика удаления пользователя
export const deleteUser = async (userId: number) => {
  try {
    await api.delete(`/api/delete-user/${userId}/`);
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
  }
};
