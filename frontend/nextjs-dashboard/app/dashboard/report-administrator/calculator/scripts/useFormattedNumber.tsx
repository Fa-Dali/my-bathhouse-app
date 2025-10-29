// frontend/app/dashboard/report-administrator/calculator/scripts/useFormattedNumber.tsx

import * as React from 'react';

const useFormattedNumber = (initialValue = '') => {
  const [value, setValue] = React.useState(initialValue); // Форматированное значение
  const [rawValue, setRawValue] = React.useState(initialValue); // Число для вычислений

  // Обработчик изменения
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value.replace(/[^0-9]/g, ''); // Забираем только цифры
    setRawValue(newValue); // Сохраняем чистое значение

    if (newValue === '') {
      setValue('');
    } else {
      setValue(formatNumber(Number(newValue))); // Форматируем значение
    }
  };

  // Функция форматирования
  const formatNumber = (num: number) => {
    return num.toLocaleString('ru-RU');
  };

  return {
    value, // Форматированное значение
    rawValue, // Число для расчетов
    onChange: handleChange, // Обработчик изменения
  };
};

export default useFormattedNumber;
