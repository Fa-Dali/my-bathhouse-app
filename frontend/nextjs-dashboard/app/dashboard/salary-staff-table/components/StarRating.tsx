// app/dashboard/salary-staff-table/StarRating.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function StarRating({ value, type }: { value: number; type: 'good' | 'bad' }) {
  const [rating, setRating] = useState(value);

  const handleClick = () => {
    // Здесь можно отправить запрос на увеличение кармы
    // Пока — просто для отображения
    setRating(rating + 1);
    alert(`${type === 'good' ? 'Добрая' : 'Плохая'} карма увеличена!`);
  };

  return (
    <button
      onClick={handleClick}
      className="focus:outline-none"
      disabled={false} // можно добавить логику "только 1 раз в день"
    >
      <img
        src={type === 'good' ? '/stars/star-orange.png' : '/stars/star-black.png'}
        alt="star"
        className={`${
    type === 'bad' ? 'w-[40px] h-[40px]' : 'w-[40px] h-[40px]'
  } hover:scale-110 transition-transform`}
      />
    </button>
  );
}
