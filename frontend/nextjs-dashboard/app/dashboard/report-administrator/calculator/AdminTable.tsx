// frontend/nextjs-dashboard/app/dashboard/report-administrator/calculator/AdminTable.tsx

'use client';

import React from 'react';
import CustomCheckbox from './CustomCheckbox';
import '../../../../app/ui/global.css';
import './style/TimeInput.module.css';
import './style/Select.module.css';
import './style/Cell.module.css';
import useFormattedNumber from './scripts/useFormattedNumber';
import { NumberInput } from './scripts/InputField';
import jsPDF from 'jspdf'; // Библиотека для формирования PDF
import autoTable from 'jspdf-autotable'; // Пакет для автоматического заполнения таблиц в jspdf
import {PlusIcon,
        EllipsisVerticalIcon,
        ArchiveBoxXMarkIcon,
        MinusIcon,
        TrashIcon,
        EnvelopeOpenIcon,
        EnvelopeIcon,
        ArrowTopRightOnSquareIcon,
        ArrowRightIcon
      } from "@heroicons/react/24/outline";

// Шаблон пустой строки
const emptyRowTemplate = {
  startTime: '',
  endTime: '',
  audience: '',
  rent: '',
  sales: '',
  spa: '',
  payment: '',
};

// Интерфейс пропсов компонента
export interface PageProps { }

// Основной компонент
export default function Page({ }: PageProps) {
  // Чистящая функция перемещается сюда, чтобы стать доступной всему компоненту
  const cleanNumber = (value: string | number) => {
    if (typeof value === 'string') {
      return Number(value.replace(/[^-\d.,]+/g, '').replace(',', '.')) || 0;
    }
    return typeof value === 'number' && !isNaN(value) ? value : 0;
  };

  // Массив строк таблицы
  const [rows, setRows] = React.useState([emptyRowTemplate]);

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
      payment: '',
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
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter(i => i !== index)); // удаляем из списка
    } else {
      setSelectedRows([...selectedRows, index]); // добавляем в список
    }
  };

  // Форматирование чисел с разделителями тысяч
  const formatNumber = (num: string | number) => {
    return num ? String(num).replace(/\B(?=(?:[\d]{3})+$)/g, ' ') : '';
  };

  // Вычислим итоговую сумму
  const totals = calculateTotals();

  // Экспорт таблицы в PDF
  const exportToPdf = () => {
    const doc = new jsPDF(); // Создание нового документа PDF
    const columns = [
      { title: 'Время начала', dataKey: 'startTime' },
      { title: 'Время окончания', dataKey: 'endTime' },
      { title: 'Аудитория', dataKey: 'audience' },
      { title: 'Аренда', dataKey: 'rent' },
      { title: 'Продажи', dataKey: 'sales' },
      { title: 'SPA', dataKey: 'spa' },
      { title: 'Сумма', dataKey: 'total' },
    ];

    const data = rows.map((row, index) => ({
      startTime: row.startTime,
      endTime: row.endTime,
      audience: row.audience,
      rent: formatNumber(cleanNumber(row.rent)),
      sales: formatNumber(cleanNumber(row.sales)),
      spa: formatNumber(cleanNumber(row.spa)),
      total: formatNumber(calculateRowTotal(row)),
    }));

    autoTable(doc, { head: columns, body: data });
    doc.save('bania-report.pdf');
  };

  return (
    <div className="container mx-auto">

      <div className="head">
        <h1 className="text-2xl font-bold text-center">Ежедневный отчет бани</h1>
        <table className="w-full border border-gray-800">
          <thead>
            <tr className="bg-white text-black border-2">
              <td className="w-1/12 border border-gray-300">
                <input
                  type="date"
                  className="w-full h-8 border-none focus:ring-transparent focus:outline-none"
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
      <div className="div-container flex justify-between gap-1 bg-slate-400">
        <div>
          <table className="w-full min-w-full border bg-white border-gray-300">
            <thead>
              <tr className="bg-white text-black border-2">
                <th className="border px-0 py-0">
                  {/* <PlusIcon /> */}
                  <TrashIcon className='text-gray-400'/>
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
                        placeholder="Выбор аудитории"
                        className="w-full border-transparent h-24"
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
                      placeholder=" "
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
                      placeholder=" "
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
                      placeholder=" "
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
                        placeholder="1"
                        className="w-full border-transparent h-6 border border-b-gray-200"
                      />
                    </div>
                    <div className="border-1 border-gray-200">
                      <input
                        type="number"
                        step="10"
                        placeholder="2"
                        className="w-full border-transparent h-6 border border-b-gray-200"
                      />
                    </div>
                    <div className="border-1 border-gray-200">
                      <input
                        type="number"
                        step="10"
                        placeholder="3"
                        className="w-full border-transparent h-6 border border-b-gray-200"
                      />
                    </div>
                    <div className="border-1 border-gray-200">
                      <input
                        type="number"
                        step="10"
                        placeholder="4"
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
                        value={row.payment}
                        onChange={(event) => updateRow(index, 'payment', event.target.value)}
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
              <tr className="bg-gray-100 text-black">
                <td colSpan={4} className="font-bold border px-4 py-2">
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
          <div className="m-1">

            {/* ДОБАВИТЬ СТРОКУ */}
            <button
              className="bg-green-400 hover:bg-green-500 py-1 px-4 mx-4 rounded"
              onClick={handleAddRow}
            >
              <PlusIcon className="w-6 h-6 inline-block align-middle text-gray-800" />
            </button>

            {/* УДАЛИТЬ СТРОКУ */}
            <button
              className="bg-red-400 hover:bg-red-500 text-white font-bold py-1 px-4 mx-4 rounded"
              disabled={selectedRows.length === 0}
              onClick={handleDeleteRow}
            >
              <TrashIcon className="w-6 h-6 inline-block align-middle text-gray-800" />
            </button>

            {/* ЭКСПОРТ В PDF */}
            <button
              className="bg-sky-200 hover:bg-sky-300 py-1 px-4 mx-4 rounded"
              onClick={exportToPdf}
            >
              PDF <ArrowTopRightOnSquareIcon className="w-6 h-6 inline-block align-middle text-gray-800" />
            </button>

            {/* ОТПРАВИТЬ ПИСЬМО */}
            <button
              className="bg-slate-100 hover:bg-yellow-200 py-1 px-4 mx-4 rounded"
              onClick={exportToPdf}
            >
              <EnvelopeIcon className="w-6 h-6 inline-block align-middle text-gray-800" />
              {/* <ArrowRightIcon /> */}
            </button>
          </div>
        </div>

        {/* Дополнительные контейнеры и таблицы пока закомментированы */}
      </div>

      {/* Элемент для отображения пути к файлу */}
      <div id="download-button"></div>
    </div>
  );
}
