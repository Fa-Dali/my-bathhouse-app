// // frontend/app/dashboard/report-administrator/calculator/scripts/useFormattedNumber.tsx
// import * as React from 'react';

// // const rentAmount = ''; // Просто пустая строка вместо хука

// const useFormattedNumber = (initialValue = '') => {
//   const [value, setValue] = React.useState(initialValue); // Форматированное значение
//   const [rawValue, setRawValue] = React.useState(initialValue); // Число для вычислений

//   // Обработчик изменения
//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

//     const formatNumber = (num: string | number) => {
//       if (typeof num === 'object') {
//         console.error('Объект обнаружен!', num); // Сообщение об ошибке
//         return '';
//       }
//       return num ? String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
//     };

//     const newValue = event.target.value.replace(/[^0-9]/g, ''); // Забираем только цифры
//     setRawValue(newValue); // Сохраняем чистое значение
//     if (newValue === '') {
//       setValue(''); // Если значение пустое, устанавливаем пустую строку
//     } else {
//       setValue(parseInt(newValue).toLocaleString('ru-RU')); // Иначе форматируем число
//     }
//   };

//   // console.log('Current row:', row); // Выводим данные строки

//   return {
//     value, // Форматированное значение
//     rawValue, // Число для расчетов
//     onChange: handleChange, // Обработчик изменения
//   };
// };

// export default useFormattedNumber;
// ============================================================================================

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
