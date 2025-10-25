// useFormattedNumber.ts
import * as React from 'react';

const useFormattedNumber = (initialValue = '') => {
  const [value, setValue] = React.useState(initialValue); // Форматированное значение
  const [rawValue, setRawValue] = React.useState(initialValue); // Число для вычислений

  // Обработчик изменения
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value.replace(/[^0-9]/g, ''); // Забираем только цифры
    setRawValue(newValue); // Сохраняем чистое значение
    if (newValue === '') {
      setValue(''); // Если значение пустое, устанавливаем пустую строку
    } else {
      setValue(parseInt(newValue).toLocaleString('ru-RU')); // Иначе форматируем число
    }
  };

  return {
    value, // Форматированное значение
    rawValue, // Число для расчетов
    onChange: handleChange, // Обработчик изменения
  };
};

export default useFormattedNumber;
