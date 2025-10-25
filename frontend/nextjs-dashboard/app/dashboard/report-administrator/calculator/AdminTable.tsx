'use client';

import React from 'react';
import CustomCheckbox from './CustomCheckbox';
import '../../../../app/ui/global.css';
import './style/TimeInput.module.css';
import './style/Select.module.css';
import useFormattedNumber from './scripts/useFormattedNumber';
import { NumberInput } from './scripts/InputField';

export interface PageProps { }

export default function Page({ }: PageProps) {
  const rentAmount = useFormattedNumber(); // Используем хук для форматирования

  return (
    <div className="container mx-auto">


      <div className="head mb-4">
        <h1 className="text-2xl font-bold text-center">Ежедневный отчет бани</h1>
        <table className="w-full border border-gray-800">
          <thead>
            <tr className="bg-white text-black">
              {/* КАЛЕНДАРЬ */}
              <td className="w-1/12 border border-gray-300">
                <input type="date" className="w-full h-8 border-none focus:ring-transparent focus:outline-none" />
              </td>

              <td className="w-1/12 border text-center bg-white border-gray-300">
                Админ:
              </td>

              {/* ФИО */}
              <td className="border border-gray-300">
                <input
                  type="text"
                  className="w-full border-none focus:ring-transparent focus:outline-none"
                  placeholder="ФИО"
                />
              </td>
            </tr>
          </thead>

          <tbody></tbody>

        </table>
      </div>


      <div className="div-container flex justify-between gap-1 bg-slate-400">
        <div>

          {/* ТАБЛИЦА */}
          <table className="w-full min-w-full border bg-white border-gray-300">

            {/* ЗАГОЛОВОК */}
            <thead>
              <tr className="bg-white text-black">
                <th className="border px-0 py-0"></th>
                <th colSpan={2} className="w-1/12 border px-0 text-center">
                  Время
                </th>
                <th className="w-2/12 border px-0">Баня</th>
                <th className="w-1/12 border px-0">Аренда</th>
                <th className="w-1/12 border px-0">Продажа</th>
                <th className="w-1/12 border px-0">СПА</th>
                {/* <th className="border px-4">Сертификат</th> */}
                <th className="w-1/12 border px-0">СУММА</th>
                <th className="w-1/12 border px-0 bg-white">ОПЛАТА</th>
                <th className="w-2/12 border px-0 bg-white">способ</th>
                <th colSpan={2} className="w-1/5 border px-0">Зарплата</th>
                {/* <th className="w-1/12 border px-4">способ</th> */}
              </tr>
            </thead>

            {/* ТАБЛИЦА */}
            <tbody className=" text-center">
              <tr className="hover:bg-yellow-100">

                {/* ЧЕКБОКС */}
                <td className="border px-0 relative">
                  <CustomCheckbox />
                </td>

                {/* ВРЕМЯ СТАРТ */}
                <td className="border px-0">
                  <input
                    type="time"
                    className="
                      `${styles['time-input']}
                      w-full CSS h-7
                      rounded-md
                      border border-transparent
                      focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white
                      focus:border-indigo-500
                      disabled:opacity-50
                    "
                  />
                </td>

                {/* ВРЕМЯ ФИНИШ */}
                <td className="border px-0">
                  <input
                    type="time"
                    className="
                      `${styles['time-input']}
                      w-full CSS h-7
                      rounded-md
                      border border-transparent
                      focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white
                      focus:border-indigo-500
                      disabled:opacity-50
                    "
                  />
                </td>

                {/* АУДИТОРИЯ */}
                <td className="border px-0.5 relative">
                  <select
                    className="
                      `${styles['no-arrow-select']} w-full h-10
                      border border-transparent
                      focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-white
                      focus:border-indigo-500
                      disabled:opacity-50
                      cursor-pointer
                      bg-white
                      text-gray-700
                      placeholder:text-gray-400
                      pr-10`
                    "
                  >
                    <option value="" hidden>Выбор аудитории</option>
                    <option value="терминал">Муромец</option>
                    <option value="НАЛИЧНЫЕ">Никитич</option>
                    <option value="Сайт">Попович</option>
                    <option value="ресепшн">Массаж</option>
                  </select>

                  {/* Стрелка выбора */}
                  {/* <BarsArrowDownIcon className="absolute inset-y-0 right-0 mr-3 my-auto text-gray-500 pointer-events-none" /> */}
                </td>

                {/* СУММА */}
                <td className="border px-0">
                  <NumberInput
                    type="text"
                    step="10"
                    placeholder=" "
                    className="text-right w-full border-none focus:ring-transparent focus:outline-none"
                    value={rentAmount.value}
                    onChange={rentAmount.onChange}
                  />

                </td>

                {/* ОПЛАТА */}
                <td className="border px-0">
                  <input type="number" step="10" placeholder=" " className="text-right w-full border-none focus:ring-transparent focus:outline-none" />
                </td>

                {/* СПОСОБ ОПЛАТЫ */}
                <td className="border px-0">
                  <input type="number" step="10" placeholder=" " className="text-right w-full border-none focus:ring-transparent focus:outline-none" />
                </td>

                {/* СЕРТИФИКАТ */}
                {/* <td className="border px-0">
                  <input type="number" step="10" placeholder=" " className="text-center w-full border-none focus:ring-transparent focus:outline-none" />
                </td> */}

                {/* ИТОГ */}
                <td className="border px-0">
                  <span className="total">-</span>
                </td>

                {/* СПОСОБ ОПЛАТЫ */}
                <td className="border px-0">
                  <input type="number" step="10" placeholder=" " className="text-right w-full border-none focus:ring-transparent focus:outline-none" />
                </td>

                {/* СПОСОБ ОПЛАТЫ */}
                <td className="border px-0">
                  <select className="w-full border-none focus:ring-transparent focus:outline-none">
                    <option value="">Тип оплаты</option>
                    <option value="терминал">Тер</option>
                    <option value="НАЛИЧНЫЕ">НАЛ</option>
                    <option value="Сайт">Сайт</option>
                    <option value="ресепшн">Ресеп</option>
                  </select>
                </td>

                {/* СПОСОБ ОПЛАТЫ */}
                <td className="border px-0">
                  <input type="text" step="10" placeholder=" " className="text-left w-full border-none focus:ring-transparent focus:outline-none" />
                </td>

                {/* СПОСОБ ОПЛАТЫ */}
                <td className="border px-0">
                  <input type="number" step="10" placeholder=" " className="text-right w-full border-none focus:ring-transparent focus:outline-none" />
                </td>


              </tr>
            </tbody>

            <tfoot>
              <tr className="bg-gray-100 text-black">
                <td colSpan={3} className="font-bold border px-4 py-2">
                  ИТОГ:
                </td>
                <td className="border px-4 py-2" id="total-rent">
                  0
                </td>
                <td className="border px-4 py-2" id="total-sales">
                  0
                </td>
                <td className="border px-4 py-2" id="total-spa">
                  0
                </td>
                <td className="border px-4 py-2" id="total-certificates">
                  0
                </td>
                <td className="border px-4 py-2" id="grand-total">
                  0
                </td>
                <td className="border px-4 py-2">{"\u00A0"}</td>
                <td className="border px-4 py-2">{"\u00A0"}</td>
              </tr>
            </tfoot>
          </table>

          {/* Кнопки */}
          <div className="flex justify-evenly mt-4">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Добавить строку
            </button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
              Удалить выбранные строки
            </button>
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              Сохранить в PDF
            </button>
          </div>
        </div>

        {/* КОНТЕЙНЕР ДЛЯ ДВУХ ТАБЛИЦ */}
        {/* <div className="div2 w-1/2">
          <table className="w-full min-w-full border-separate border border-gray-300">
            <thead>
              <tr className="bg-gray-100 text-black">
                <th colSpan={2} className="border px-4 py-2">
                  ЗП Мастер
                </th>
                <th colSpan={2} className="border px-4 py-2">
                  В кассе
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-50">
                <td className="border px-4 py-2">
                  <input type="text" placeholder="Мастер" className="w-full border-none focus:ring-transparent focus:outline-none" />
                </td>
                <td className="border px-4 py-2">
                  <input type="number" step="0.01" placeholder="Зарплата" className="w-full border-none focus:ring-transparent focus:outline-none" />
                </td>
                <td className="border px-4 py-2">
                  <input type="text" placeholder="Источник платежа" className="w-full border-none focus:ring-transparent focus:outline-none" />
                </td>
                <td className="border px-4 py-2">
                  <input type="number" step="0.01" placeholder="В кассе" className="w-full border-none focus:ring-transparent focus:outline-none" />
                </td>
                <td className="border px-4 py-2">
                  <input type="number" step="0.01" placeholder="Административные расходы" className="w-full border-none focus:ring-transparent focus:outline-none" />
                </td>
              </tr>
            </tbody>
          </table>
        </div> */}
      </div>

      {/* Элемент для отображения пути к файлу */}
      <div id="download-button"></div>
    </div>
  );
}
