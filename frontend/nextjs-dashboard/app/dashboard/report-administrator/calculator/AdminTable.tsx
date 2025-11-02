// frontend/nextjs-dashboard/app/dashboard/report-administrator/calculator/AdminTable.tsx

'use client';

import React, { useEffect } from 'react';
import CustomCheckbox from './CustomCheckbox';
import '../../../../app/ui/global.css';
import './style/TimeInput.module.css';
import './style/Select.module.css';
import './style/Cell.module.css';
import useFormattedNumber from './scripts/useFormattedNumber'; // Использование хука
import useCurrentDate from '../hooks/useCurrentDate';
import { NumberInput } from './scripts/InputField';

import jsPDF from 'jspdf';                            // Библиотека для формирования PDF
import autoTable from 'jspdf-autotable';              // Пакет для автоматического заполнения таблиц в jspdf
import html2canvas from 'html2canvas';                // Библиотека для создания скриншота HTML

import {
  PlusIcon,
  EllipsisVerticalIcon,
  ArchiveBoxXMarkIcon,
  MinusIcon,
  TrashIcon,
  EnvelopeOpenIcon,
  EnvelopeIcon,
  ArrowTopRightOnSquareIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

// Вспомогательная функция для загрузки шрифта через worker
async function loadFontViaWorker(fontPath: string): Promise<ArrayBuffer> {
  const fontLoaderWorker = `
    self.onmessage = async ({ data }) => {
      const { path } = data;
      const fs = require('fs');
      // @ts-ignore
      const fontBuffer = fs.readFileSync(path);
      self.postMessage(new Uint8Array(fontBuffer).buffer);
    };
  `;

  const workerBlob = new Blob(['self.onmessage = ', fontLoaderWorker, ';'], { type: 'application/javascript' });
  const workerURL = URL.createObjectURL(workerBlob);
  const worker = new Worker(workerURL);

  return new Promise((resolve, reject) => {
    worker.onmessage = e => {
      resolve(e.data);
      URL.revokeObjectURL(workerURL);
    };
    worker.onerror = error => {
      reject(error.message);
      URL.revokeObjectURL(workerURL);
    };
    worker.postMessage({ path: fontPath });
  });
}

// Абсолютный путь к файлу шрифта
const fontPath = process.cwd() + '/app/dashboard/report-administrator/calculator/fonts/Roboto/static/Roboto-Regular.ttf';

// Шаблон пустой строки
const emptyRowTemplate = {
  startTime: '',
  endTime: '',
  audience: '',
  rent: '',
  sales: '',
  spa: '',
  paymentAmount: '',  // Новое поле для "ОПЛАТА"
  paymentMethod: '',  // Новое поле для "Способ оплаты"
  masterName: '',     // Новое поле для "Зарплаты (Имя)"
  masterSalary: '',   // Новое поле для "Зарплаты (суммы)"
};

// Интерфейс пропсов компонента
export interface PageProps { }

// Очистка текста перед записью в PDF
const sanitizeText = (text: string): string =>
  text.normalize("NFC")
    .trim()
    .replace(/(\n|\r)+/, '');

// Основной компонент
export default function Page({ }: PageProps) {

  const currentDate = useCurrentDate(); // Получаем текущую дату
  console.log("Текущая дата: ", currentDate); // Логируем дату для проверки

  // Чистящая функция перемещается сюда, чтобы стать доступной всему компоненту
  const cleanNumber = (value: string | number) => {
    if (typeof value === 'string') {
      return Number(value.replace(/[^-\d.,]+/g, '').replace(',', '.')) || 0;
    }
    return typeof value === 'number' && !isNaN(value) ? value : 0;
  };

  // Массив строк таблицы
  const [rows, setRows] = React.useState([emptyRowTemplate]);

  // Приводим устаревшие данные к современному формату
  React.useEffect(() => {
    if (rows.some(row => !('paymentAmount' in row))) {
      setRows(
        rows.map(row => ({
          ...row,
          paymentAmount: '', // Присваиваем старое значение или оставляем пустым
          paymentMethod: '',
          masterName: '',
          masterSalary: ''
        }))
      );
    }
  }, [rows]);

  // функция для получения данных из базы данных
  const fetchReports = async () => {
    const response = await fetch('/api/reports/');
    const data = await response.json();
    setRows(data);
  };

  // Использование useEffect для загрузки данных:
  useEffect(() => {
    fetchReports();
  }, []);

  // Проверка выбранных строк
  const [selectedRows, setSelectedRows] = React.useState<number[]>([]);

  // Метод для расчета суммы каждой строки
  const calculateRowTotal = (row: typeof emptyRowTemplate) => {
    return cleanNumber(row.rent) + cleanNumber(row.sales) + cleanNumber(row.spa);
  };

  // Метод для пересчета итоговой суммы
  const calculateTotals = () => {
    let totalRent = 0;
    let totalSales = 0;
    let totalSpa = 0;

    for (let row of rows) {
      totalRent += cleanNumber(row.rent);
      totalSales += cleanNumber(row.sales);
      totalSpa += cleanNumber(row.spa);
    }

    return {
      totalRent,
      totalSales,
      totalSpa,
      grandTotal: totalRent + totalSales + totalSpa,
    };
  };

  // №3 - Функция для добавления новой строки
  const handleAddRow = () => {
    const newRow = {
      startTime: '',
      endTime: '',
      audience: '',
      rent: '',
      sales: '',
      spa: '',
      paymentAmount: '', // Новое поле для "ОПЛАТА"
      paymentMethod: '', // Новое поле для "Способ оплаты"
      masterName: '',    // Новое поле для "Зарплаты (Имя)"
      masterSalary: '',  // Новое поле для "Зарплаты (суммы)"
    };

    setRows([...rows, newRow]);
  };

  // Функция для удаления выбранной строки
  const handleDeleteRow = () => {
    const filteredRows = rows.filter((_, index: number) => !selectedRows.includes(index));
    setRows(filteredRows);
    setSelectedRows([]); // Сбрасываем выбор
  };

  // Функция для обновления отдельного поля строки
  const updateRow = (index: number, field: string, value: string) => {
    const updatedRows = [...rows];
    updatedRows[index][field as keyof typeof emptyRowTemplate] = value;
    setRows(updatedRows);
  };

  // Функционал чекбокса
  const toggleSelection = (index: number) => {
    setSelectedRows(prevSelectedRows => {
      if (prevSelectedRows.includes(index)) {
        return prevSelectedRows.filter(i => i !== index); // Убираем индекс из списка
      } else {
        return [...prevSelectedRows, index]; // Добавляем индекс
      }
    });
  };

  // Форматирование чисел с разделителями тысяч
  const formatNumber = (num: string | number) => {
    return num ? String(num).replace(/\B(?=(?:[\d]{3})+$)/g, ' ') : '';
  };

  // Вычислим итоговую сумму
  const totals = calculateTotals();

  // Обновление таблицы, используя данные из `rows`
  const data = rows.map((row, index) => ({
    startTime: sanitizeText(row.startTime),
    endTime: sanitizeText(row.endTime),
    audience: sanitizeText(row.audience),
    rent: formatNumber(cleanNumber(row.rent)),
    sales: formatNumber(cleanNumber(row.sales)),
    spa: formatNumber(cleanNumber(row.spa)),
    total: formatNumber(calculateRowTotal(row)),
    paymentAmount: formatNumber(cleanNumber(row.paymentAmount)), // Новое поле
    paymentMethod: sanitizeText(row.paymentMethod),              // Новое поле
    masterName: sanitizeText(row.masterName),                   // Новое поле
    masterSalary: formatNumber(cleanNumber(row.masterSalary)),   // Новое поле
  }));

  // ==========================================
  // Экспорт таблицы в PDF
  const exportToPdf = async () => {
    console.log('Начало экспорта PDF...');

    const doc = new jsPDF(); // Создаем экземпляр PDF-документа

    // Загружаем шрифт через HTTP-запрос
    const fontResponse = await fetch('/app/dashboard/report-administrator/calculator/fonts/static/Roboto-Regular.ttf');
    const fontBuffer = await fontResponse.arrayBuffer();

    // Преобразуем ArrayBuffer в строку base64
    const fontBufferBase64 = Buffer.from(fontBuffer).toString('base64');

    // Регистрируем шрифт
    doc.addFileToVFS('Roboto-Regular.ttf', fontBufferBase64);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto'); // Применяем шрифт ко всему документу

    // Генерируем PDF
    const columns = [
      { title: 'Время начала', dataKey: 'startTime' },
      { title: 'Время окончания', dataKey: 'endTime' },
      { title: 'Аудитория', dataKey: 'audience' },
      { title: 'Аренда', dataKey: 'rent' },
      { title: 'Продажи', dataKey: 'sales' },
      { title: 'SPA', dataKey: 'spa' },
      { title: 'Сумма', dataKey: 'total' },
      { title: 'ОПЛАТА', dataKey: 'paymentAmount' },
      { title: 'Способ оплаты', dataKey: 'paymentMethod' },
      { title: 'Зарплата (Имя)', dataKey: 'masterName' },
      { title: 'Зарплата (сумма)', dataKey: 'masterSalary' },
    ];

    const data = rows.map((row, index) => ({
      startTime: sanitizeText(row.startTime),
      endTime: sanitizeText(row.endTime),
      audience: sanitizeText(row.audience),
      rent: formatNumber(cleanNumber(row.rent)),
      sales: formatNumber(cleanNumber(row.sales)),
      spa: formatNumber(cleanNumber(row.spa)),
      total: formatNumber(calculateRowTotal(row)),
      paymentAmount: formatNumber(cleanNumber(row.paymentAmount || '')),
      paymentMethod: sanitizeText(row.paymentMethod || ''),
      masterName: sanitizeText(row.masterName || ''),
      masterSalary: formatNumber(cleanNumber(row.masterSalary || '')),
    }));

    // Настройки для автоматической таблицы
    autoTable(doc, {
      head: columns,
      body: data,
      theme: 'grid', // Выберите нужный стиль ('striped', 'plain')
      styles: {
        fontSize: 10,
        valign: 'middle',
        halign: 'left',
        cellPadding: 0, // Без внутреннего отступа
        lineColor: '#ccc',
        textColor: '#333',
      },
      columnStyles: {
        startTime: { cellWidth: 50 },
        endTime: { cellWidth: 50 },
        audience: { cellWidth: 100 },
        rent: { cellWidth: 80 },
        sales: { cellWidth: 80 },
        spa: { cellWidth: 80 },
        total: { cellWidth: 80 },
        paymentAmount: { cellWidth: 80 },
        paymentMethod: { cellWidth: 80 },
        masterName: { cellWidth: 80 },
        masterSalary: { cellWidth: 80 },
      },
      tableWidth: 'auto',
    });

    console.log('PDF сгенерирован, начинаем сохранение...');

    // Сохраняем PDF с именем, сформированным из даты и времени
    const date = new Date();
    const fileName = `report-${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}-${date.getHours()}-${date.getMinutes()}.pdf`;
    doc.save(fileName);

    console.log('PDF успешно сохранён!');
  };

  //---------------------------------------------

  // Экспорт таблицы в PDF
  // const exportToPdf = async () => {
  //   console.log('Начало экспорта PDF...');

  //   const doc = new jsPDF(); // Создаем экземпляр PDF-документа

  //   // Найти элемент с таблицей
  //   const element = document.querySelector('#admin-report-table');

  //   if (!(element instanceof HTMLElement)) {
  //     console.error('Элемент с id "admin-report-table" не найден.');
  //     return;
  //   }

  //   // Рисуем изображение таблицы
  //   const options = {
  //     scale: window.devicePixelRatio || 1, // Масштабируем рисунок согласно устройству
  //     background: "#fff", // Белый фон
  //   };

  //   const canvas = await html2canvas(element, options);
  //   const imgData = canvas.toDataURL('image/png');

  //   // Добавляем изображение в PDF
  //   const imgProps = doc.getImageProperties(imgData);
  //   const pdfWidth = doc.internal.pageSize.getWidth();
  //   const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  //   doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

  //   // Сохраняем PDF
  //   const fileName = `report-${new Date().toISOString()}.pdf`;
  //   doc.save(fileName);

  //   console.log('PDF успешно сохранён!');
  // };

  // ===========================================
  // Функция для проверки доступности сервера
  const checkServerAvailability = async () => {
    try {
      const response = await fetch('/check-server/');
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  // Функция для генерации PDF на клиенте
  const generateClientSidePDF = async () => {
    const element = document.querySelector('#admin-report-table');

    if (!element) {
      console.error('Элемент с id "admin-report-table" не найден.');
      return;
    }

    const canvas = await html2canvas(element as HTMLElement);
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('report.pdf');
  };

  // Функция для генерации PDF с проверкой доступности сервера
  const generatePDF = async () => {
    try {
      const serverAvailable = await checkServerAvailability();

      if (serverAvailable) {
        const response = await fetch('/generate-pdf/');
        if (response.ok) {
          const blob = await response.blob();
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'report.pdf';
          link.click();
        } else {
          console.error('Ошибка при генерации PDF на сервере.');
        }
      } else {
        await generateClientSidePDF();
      }
    } catch (error) {
      console.error('Ошибка при отправке запроса:', error);
    }
  };

  // Функция для отправки данных на сервер
  const sendReportToBackend = async () => {
    const formData = new FormData();
    formData.append('admin_name', 'Фамилия И.О. администратора'); // Замените на реальное значение
    formData.append('created_at', new Date().toISOString()); // Текущая дата и время
    formData.append('start_time', rows[0].startTime);
    formData.append('end_time', rows[0].endTime);
    formData.append('audience', rows[0].audience);
    formData.append('rent', rows[0].rent);
    formData.append('sales', rows[0].sales);
    formData.append('spa', rows[0].spa);
    formData.append('payment', rows[0].paymentAmount);

    const res = await fetch('/api/reports/', {
      method: 'POST',
      body: formData
    });

    if (res.ok) alert('Отчёт отправлен успешно!');
  };



  return (
    <div id="admin-report-table" className="container mx-auto font-sans">

      <div className="head">
        <h3></h3>
        <h1 className="text-2xl text-center"><b>"Ежедневный отчет бани"</b> : {currentDate} г.</h1>

        <table className="w-full border border-gray-800">
          <thead>
            <tr className="bg-white text-black border-2">
              <td className="w-1/12 border border-gray-300">
                <input
                  type="date"
                  className="w-full h-8 border-none focus:ring-transparent focus:outline-none text-start"
                // value='{currentDate}' // Устанавливаем текущую дату
                />
              </td>
              <td className="w-1/12 border text-center bg-white border-gray-300">
                Админ:
              </td>
              <td className="border border-gray-300">
                <div>
                  <input
                    type="text"
                    list="fio-list"
                    placeholder="Фамилия Имя Отчество"
                    className="w-full border-transparent"
                  />
                  <datalist id="fio-list">
                    <option value="Кирсанова О."></option>
                    <option value="Менделеева О."></option>
                    <option value="Фадеев С.В."></option>
                  </datalist>
                </div>
              </td>
            </tr>
          </thead>
          <tbody></tbody>
        </table>

      </div>

      {/* Таблица отчета */}
      <div className="div-container flex justify-between gap-1">

        <div className="beautiful-scroll overflow-y-auto h-[1120px]">
          <table className="w-full min-w-full border bg-white border-gray-300">
            <thead>
              <tr className="bg-white text-black border-2">
                <th className="border px-0 py-0">
                  {/* <PlusIcon /> */}
                  <TrashIcon className='text-gray-400' />
                </th>
                <th colSpan={2} className="w-1/12 border px-0 text-center">
                  Время
                </th>
                <th className="w-2/12 border px-0">Баня</th>
                <th className="w-1/12 border px-0">Аренда</th>
                <th className="w-1/12 border px-0">Продажа</th>
                <th className="w-1/12 border px-0">СПА</th>
                <th className="w-1/12 border px-0">СУММА</th>
                <th className="w-1/12 border px-0 bg-white">ОПЛАТА</th>
                <th className="w-1/12 border px-0 bg-white">Способ оплаты</th>
                <th colSpan={2} className="w-1/3 border px-0">Зарплата</th>
              </tr>
            </thead>


            <tbody className="text-center border-2 border-b-blue-600">
              {rows.map((row, index) => (
                <tr key={`row-${index}`} className='border-2 border-b-gray-200'>

                  {/* Чекбокс */}
                  <td className="border px-0 relative">
                    <CustomCheckbox
                      isChecked={selectedRows.includes(index)} // проверьте поддержку isChecked
                      onChange={() => toggleSelection(index)}
                    />
                  </td>

                  {/* Время начала */}
                  <td className="border px-0">
                    <input
                      type="time"
                      className="w-full h-24 border border-transparent"
                      value={row.startTime}
                      onChange={(event) => updateRow(index, 'startTime', event.target.value)}
                    />
                  </td>

                  {/* Время окончания */}
                  <td className="border px-0">
                    <input
                      type="time"
                      className="w-full h-24 border border-transparent"
                      value={row.endTime}
                      onChange={(event) => updateRow(index, 'endTime', event.target.value)}
                    />
                  </td>

                  {/* Баня */}
                  <td className="border px-0 relative">
                    <div>
                      <input
                        type="text"
                        list="audience-list"
                        placeholder="Аудитория"
                        className="w-full border-transparent h-24 text-center"
                        value={row.audience}
                        onChange={(event) => updateRow(index, 'audience', event.target.value)}
                      />
                      <datalist id="audience-list">
                        <option value="Муромец"></option>
                        <option value="Никитич"></option>
                        <option value="Попович"></option>
                        <option value="Массаж"></option>
                      </datalist>
                    </div>
                  </td>

                  {/* Аренда */}
                  <td className="border px-0">
                    <NumberInput
                      type="text"
                      step="10"
                      placeholder=""
                      className="h-24 text-right w-full border-none focus:ring-transparent focus:outline-none"
                      value={row.rent}
                      onChange={(event) => updateRow(index, 'rent', event.target.value)}
                    />
                  </td>

                  {/* Продажи */}
                  <td className="border px-0">
                    <NumberInput
                      type="text"
                      step="10"
                      placeholder=""
                      className="h-24 text-right w-full border-none focus:ring-transparent focus:outline-none"
                      value={row.sales}
                      onChange={(event) => updateRow(index, 'sales', event.target.value)}
                    />
                  </td>

                  {/* СПА */}
                  <td className="border px-0">
                    <NumberInput
                      type="text"
                      step="10"
                      placeholder=""
                      className="h-24 text-right w-full border-none focus:ring-transparent focus:outline-none"
                      value={row.spa}
                      onChange={(event) => updateRow(index, 'spa', event.target.value)}
                    />
                  </td>

                  {/* Сумма */}
                  <td className="border px-0">
                    <strong>{calculateRowTotal(row).toLocaleString('ru-RU')}</strong>
                  </td>

                  {/* Оплата */}
                  <td className="px-0">
                    <div className="border-1 border-gray-200">
                      <input
                        type="number"
                        step="10"
                        placeholder=""
                        className="w-full border-transparent h-6 border border-b-gray-200"
                      />
                    </div>
                    <div className="border-1 border-gray-200">
                      <input
                        type="number"
                        step="10"
                        placeholder=""
                        className="w-full border-transparent h-6 border border-b-gray-200"
                      />
                    </div>
                    <div className="border-1 border-gray-200">
                      <input
                        type="number"
                        step="10"
                        placeholder=""
                        className="w-full border-transparent h-6 border border-b-gray-200"
                      />
                    </div>
                    <div className="border-1 border-gray-200">
                      <input
                        type="number"
                        step="10"
                        placeholder=""
                        className="w-full border-transparent h-6 border"
                      />
                    </div>
                  </td>

                  {/* Способы оплаты */}
                  <td className="border px-0">
                    <div className="border-1 border-gray-200">
                      <input
                        type="text"
                        list="payment-type-list"
                        placeholder=""
                        className="w-full border-transparent h-6 border border-b-gray-200"
                        value={row.paymentMethod}
                        onChange={(event) => updateRow(index, 'paymentMethod', event.target.value)}
                      />
                      <datalist id="payment-type-list">
                        <option value="Тер"></option>
                        <option value="НАЛ"></option>
                        <option value="Сайт"></option>
                        <option value="Ресеп"></option>
                      </datalist>
                    </div>
                    <div className="border-1 border-gray-200">
                      <input
                        type="text"
                        list="payment-type-list"
                        placeholder=""
                        className="w-full border-transparent h-6 border border-b-gray-200"
                      />
                    </div>
                    <div className="border-1 border-gray-200">
                      <input
                        type="text"
                        list="payment-type-list"
                        placeholder=""
                        className="w-full border-transparent h-6 border border-b-gray-200"
                      />
                    </div>
                    <div className="border-1 border-gray-200">
                      <input
                        type="text"
                        list="payment-type-list"
                        placeholder=""
                        className="w-full border-transparent h-6"
                      />
                    </div>
                  </td>
                  <td className="border px-0 relative">
                    <div className="border-1 border-gray-200">
                      <input
                        type="text"
                        list="master-name"
                        placeholder=""
                        className="w-full border-transparent h-6 border border-b-gray-200"
                      />
                    </div>
                    <div className="border-1 border-gray-200">
                      <input
                        type="text"
                        list="master-name"
                        placeholder=""
                        className="w-full border-transparent h-6 border border-b-gray-200"
                      />
                    </div>
                    <div className="border-1 border-gray-200">
                      <input
                        type="text"
                        list="master-name"
                        placeholder=""
                        className="w-full border-transparent h-6 border border-b-gray-200"
                      />
                    </div>
                    <div className="border-1 border-gray-200">
                      <input
                        type="text"
                        list="master-name"
                        placeholder=""
                        className="w-full border-transparent h-6"
                      />
                    </div>
                  </td>
                  <td className="border px-0">
                    <div className="border-1 border-gray-200">
                      <input
                        type="text"
                        list="master-payment"
                        placeholder=""
                        className="w-full border-transparent h-6 border border-b-gray-200"
                      />
                    </div>
                    <div className="border-1 border-gray-200">
                      <input
                        type="text"
                        list="master-payment"
                        placeholder=""
                        className="w-full border-transparent h-6 border border-b-gray-200"
                      />
                    </div>
                    <div className="border-1 border-gray-200">
                      <input
                        type="text"
                        list="master-payment"
                        placeholder=""
                        className="w-full border-transparent h-6 border border-b-gray-200"
                      />
                    </div>
                    <div className="border-1 border-gray-200">
                      <input
                        type="text"
                        list="master-payment"
                        placeholder=""
                        className="w-full border-transparent h-6"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>


            <tfoot>
              <tr className="bg-yellow-50 text-black text-right">
                <td colSpan={4} className=" text-left font-bold border px-4 py-2">
                  ИТОГ:
                </td>
                <td className="border px-4 py-2">{totals.totalRent.toLocaleString('ru-RU')}</td>
                <td className="border px-4 py-2">{totals.totalSales.toLocaleString('ru-RU')}</td>
                <td className="border px-4 py-2">{totals.totalSpa.toLocaleString('ru-RU')}</td>
                <td className="border px-4 py-2">{totals.grandTotal.toLocaleString('ru-RU')}</td>
                <td className="border px-4 py-2">{"\u00A0"}</td>
                <td className="border px-4 py-2">{"\u00A0"}</td>
                <td className="border px-4 py-2">{"\u00A0"}</td>
                <td className="border px-4 py-2">{"\u00A0"}</td>
              </tr>
            </tfoot>
          </table>

          {/* Кнопки */}
          <div className="flex flex-col min-h-screen justify-between"> {/* ****************** */}
            <div className="p-2 fixed bottom-0 left-0 right-0 z-50 ml-[250px]">
              <div className="p-1 bg-slate-200 shadow-lg shadow-slate-400/30">

                {/* ДОБАВИТЬ СТРОКУ */}
                <button
                  className="bg-green-400 hover:bg-green-500 py-1 px-4 mx-4 rounded-full shadow-lg shadow-slate-500/40"
                  onClick={handleAddRow}
                >
                  <PlusIcon className="w-6 h-6 inline-block align-middle text-gray-800" />
                </button>

                {/* УДАЛИТЬ СТРОКУ */}
                <button
                  className="bg-red-400 hover:bg-red-500 text-white font-bold py-1 px-4 mx-4 rounded-full shadow-lg shadow-slate-500/40"
                  disabled={selectedRows.length === 0}
                  onClick={handleDeleteRow}
                >
                  <TrashIcon className="w-6 h-6 inline-block align-middle text-gray-800" />
                </button>

                {/* ЭКСПОРТ В PDF */}
                <button
                  title='Сохранить в PDF'
                  className="bg-sky-200 hover:bg-sky-300 py-1 px-4 mx-4 rounded-full shadow-lg shadow-slate-500/40"
                  onClick={generatePDF}
                >
                  PDF <ArrowTopRightOnSquareIcon className="w-6 h-6 inline-block align-middle text-gray-800" />
                </button>

                {/* КНОПКА ОТПРАВЛЯЕТ ОТЧЕТ В БД
                    НАДО ОБЪЕДИНИТЬ В:
                                  ОТЧЕТ В БД
                                  ОТПРАВИТЬ ПИСЬМО НАЧАЛЬСТВУ
                                  ОТПРАВИТЬ В ТЕЛЕГРАМ НАЧАЛЬСТВУ*/}
                <button
                  title="Отправить отчет в БД"
                  className="bg-slate-100 hover:bg-yellow-200 py-1 px-4 mx-4 rounded-full shadow-lg shadow-slate-500/40"
                  onClick={sendReportToBackend}
                >
                  <EnvelopeIcon className="w-6 h-6 inline-block align-middle text-gray-800" />
                  {/* <ArrowRightIcon /> */}
                </button>

                {/* ОТПРАВИТЬ ПИСЬМО !!! проверить нужна ли эта кнопка*/}
                <button
                  className="bg-slate-100 hover:bg-yellow-200 py-1 px-4 mx-4 rounded-full shadow-lg shadow-slate-500/40"
                  onClick={exportToPdf}
                >
                  <EnvelopeIcon className="w-6 h-6 inline-block align-middle text-gray-800" />
                  {/* <ArrowRightIcon /> */}
                </button>
              </div>
            </div>
          </div>

        </div>


        {/* Дополнительные контейнеры и таблицы пока закомментированы */}
      </div>

      {/* Элемент для отображения пути к файлу */}
      {/* <div id="download-button"></div> */}
    </div>
  );
}
