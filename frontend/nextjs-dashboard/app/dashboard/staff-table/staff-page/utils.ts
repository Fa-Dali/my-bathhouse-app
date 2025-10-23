// app/dashboard/staff-table/utils.ts

// Вспомогательные функции

import axios from 'axios';

// Типы данных
interface User {
  id: number;
  avatar?: string | null;
}

// Загрузка и изменение аватара
export const changeAvatar = async (userId: number, newAvatar: Blob) => {
  const formData = new FormData();
  formData.append('avatar', newAvatar, `${Date.now()}.jpg`);

  try {
    await axios.put(
      `http://localhost:8000/api/update-avatar/${userId}/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    // После обновления отправляем новый путь к аватару
    return `/media/avatars/${userId}_${Date.now()}.jpg`;
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
    await axios.delete(`http://localhost:8000/api/delete-user/${userId}/`);
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
  }
};
