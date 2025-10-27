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


export interface PageProps { }

export default function Page({ }: PageProps) {
  // const rentAmount = useFormattedNumber();  Используем хук для форматирования

  const rentAmount = useFormattedNumber(); // Аренда
  const saleAmount = useFormattedNumber(); // Продажа
  const spaAmount = useFormattedNumber(); // Способы оплаты (спа)

  // Состояние итоговой суммы
  const [totalSum, setTotalSum] = React.useState(0);

  // Функция для пересчета итоговой суммы
  const calculateTotal = () => {
  const cleanNumber = (value: string | number) => {
    if (typeof value === 'string') {
      return Number(value.replace(/[^-\d.,]+/g, '').replace(',', '.')) || 0;
    }
    return typeof value === 'number' && !isNaN(value) ? value : 0;
  };

  const total =
    cleanNumber(rentAmount.rawValue) +
    cleanNumber(saleAmount.rawValue) +
    cleanNumber(spaAmount.rawValue);

  setTotalSum(total);
};

  // Обновляем итог при изменении одной из ячеек
  React.useEffect(() => {
    calculateTotal();
  }, [rentAmount.rawValue, saleAmount.rawValue, spaAmount.rawValue]);

  return (
    <div className="container mx-auto">


      <div className="head">
        <h1 className="text-2xl font-bold text-center">Ежедневный отчет бани</h1>
        <table className="w-full border border-gray-800">

          {/* КАЛЕНДАРЬ : АДМИН ФИО */}
          <thead>
            <tr className="bg-white text-black">

              {/* КАЛЕНДАРЬ */}
              <td className="w-1/12 border border-gray-300">
                <input type="date" className="w-full h-8 border-none focus:ring-transparent focus:outline-none" />
              </td>

              {/* АДМИН */}
              <td className="w-1/12 border text-center bg-white border-gray-300">
                Админ:
              </td>

              {/* ФИО */}
              <td className="border border-gray-300">
                <div>
                  <input type="text" list="fio-list" placeholder="Фамилия Имя Отчество" className='w-full border-transparent'/>
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

      {/* ТАБЛИЦА ОТЧЕТА */}
      <div className="div-container flex justify-between gap-1 bg-slate-400">
        <div>

          {/* ТАБЛИЦА */}
          <table className="w-full min-w-full border bg-white border-gray-300">

            {/* ШАПКА */}
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
                <th className="w-1/12 border px-0 bg-white">способ</th>
                <th colSpan={2} className="w-1/3 border px-0">Зарплата</th>
                {/* <th className="w-1/12 border px-4">способ</th> */}
              </tr>
            </thead>

            {/* СТРОКА КАЛЬКУЛЯТОР ТАБЛИЦЫ */}
            <tbody className="text-center">
              <tr className="hover:bg-slate-50 border-b-2 border-gray-300/75">

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
                      w-full CSS h-24
                      border border-transparent"
                  />
                </td>

                {/* ВРЕМЯ ФИНИШ */}
                <td className="border px-0">
                  <input
                    type="time"
                    className="
                      `${styles['time-input']}
                      w-full CSS h-24
                      border border-transparent"
                  />
                </td>

                {/* ВЫБОР АУДИТОРИИ */}
                <td className="border px-0 relative">
                  <div>
                    <input type="text" list="audience-list"
                            placeholder="Выбор аудитории"
                            className="w-full border-transparent h-24"/>
                    <datalist id="audience-list">
                      <option value="Муромец"></option>
                      <option value="Никитич"></option>
                      <option value="Попович"></option>
                      <option value="Массаж"></option>
                    </datalist>
                  </div>
                </td>

                {/* АРЕНДА */}
                <td className="border px-0">
                  <NumberInput
                    type="text"
                    step="10"
                    placeholder=" "
                    className="h-24 text-right w-full border-none focus:ring-transparent focus:outline-none"
                    value={rentAmount.value}
                    onChange={rentAmount.onChange}
                  />

                </td>

                {/* ПРОДАЖА */}
                <td className="border px-0">
                  <NumberInput
                    type="text"
                    step="10"
                    placeholder=" "
                    className="h-24 text-right w-full border-none focus:ring-transparent focus:outline-none"
                    value={saleAmount.value}
                    onChange={saleAmount.onChange}
                  />
                </td>

                {/* СПА */}
                <td className="border px-0">
                  <NumberInput
                    type="text"
                    step="10"
                    placeholder=" "
                    className="h-24 text-right w-full border-none focus:ring-transparent focus:outline-none"
                    value={spaAmount.value}
                    onChange={spaAmount.onChange}
                  />
                </td>

                {/* СЕРТИФИКАТ */}
                {/* <td className="border px-0">
                  <input type="number" step="10" placeholder=" " className="text-center w-full border-none focus:ring-transparent focus:outline-none" />
                </td> */}

                {/* ИТОГ */}
                <td className="border px-0">
                  <strong>{!isNaN(totalSum) ? totalSum.toLocaleString('ru-RU') : '0'}</strong> {/* Итоговая сумма */}
                </td>

                {/* ОПЛАТА */}
                <td className="px-0">
                  <div className="border-1 border-gray-200">
                    <input type="number"
                        step="10"
                        placeholder=" "
                        className="w-full
                                  border-transparent
                                  h-6
                                  border
                                  border-b-gray-200"
                    />
                  </div>
                  <div className="border-1 border-gray-200">
                    <input type="number"
                        step="10"
                        placeholder=" "
                        className="w-full
                                  border-transparent
                                  h-6
                                  border
                                  border-b-gray-200"
                    />
                  </div>
                  <div className="border-1 border-gray-200">
                    <input type="number"
                        step="10"
                        placeholder=" "
                        className="w-full
                                  border-transparent
                                  h-6
                                  border
                                  border-b-gray-200"
                    />
                  </div>
                  <div className="border-1 border-gray-200">
                    <input type="number"
                        step="10"
                        placeholder=" "
                        className="w-full
                                  border-transparent
                                  h-6
                                  border"
                    />
                  </div>
                </td>

                {/* СПОСОБ ОПЛАТЫ */}
                <td className="border px-0">
                  <div className="border-1 border-gray-200">
                    <input type="text" list="payment-type-list"
                            placeholder=""
                            className="w-full border-transparent h-6 border border-b-gray-200"/>
                    <datalist id="payment-type-list">
                      <option value="Тер"></option>
                      <option value="НАЛ"></option>
                      <option value="Сайт"></option>
                      <option value="Ресеп"></option>
                    </datalist>
                  </div>
                  <div className="border-1 border-gray-200">
                    <input type="text" list="payment-type-list"
                            placeholder=""
                            className="w-full border-transparent h-6 border border-b-gray-200"/>
                    <datalist id="payment-type-list">
                      <option value="Тер"></option>
                      <option value="НАЛ"></option>
                      <option value="Сайт"></option>
                      <option value="Ресеп"></option>
                    </datalist>
                  </div>
                  <div className="border-1 border-gray-200">
                    <input type="text" list="payment-type-list"
                            placeholder=""
                            className="w-full border-transparent h-6 border border-b-gray-200"/>
                    <datalist id="payment-type-list">
                      <option value="Тер"></option>
                      <option value="НАЛ"></option>
                      <option value="Сайт"></option>
                      <option value="Ресеп"></option>
                    </datalist>
                  </div>
                  <div className="border-1 border-gray-200">
                    <input type="text" list="payment-type-list"
                            placeholder=""
                            className="w-full border-transparent h-6"/>
                    <datalist id="payment-type-list">
                      <option value="Тер"></option>
                      <option value="НАЛ"></option>
                      <option value="Сайт"></option>
                      <option value="Ресеп"></option>
                    </datalist>
                  </div>
                </td>

                {/* КОМУ ОПЛАТА - МАСТЕРУ */}
                <td className="border px-0 relative">
                  <div className="border-1 border-gray-200">
                    <input type="text" list="master-name"
                            placeholder=""
                            className="w-full border-transparent h-6 border border-b-gray-200"/>
                  </div>
                  <div className="border-1 border-gray-200">
                    <input type="text" list="master-name"
                            placeholder=""
                            className="w-full border-transparent h-6 border border-b-gray-200"/>
                  </div>
                  <div className="border-1 border-gray-200">
                    <input type="text" list="master-name"
                            placeholder=""
                            className="w-full border-transparent h-6 border border-b-gray-200"/>
                  </div>
                  <div className="border-1 border-gray-200">
                    <input type="text" list="master-name"
                            placeholder=""
                            className="w-full border-transparent h-6"/>
                  </div>
                </td>

                {/* СУММА ОПЛАТЫ - МАСТЕРУ */}
                <td className="border px-0">
                  <div className="border-1 border-gray-200">
                    <input type="text" list="master-payment"
                            placeholder=""
                            className="w-full border-transparent h-6 border border-b-gray-200"/>
                  </div>
                  <div className="border-1 border-gray-200">
                    <input type="text" list="master-payment"
                            placeholder=""
                            className="w-full border-transparent h-6 border border-b-gray-200"/>
                  </div>
                  <div className="border-1 border-gray-200">
                    <input type="text" list="master-payment"
                            placeholder=""
                            className="w-full border-transparent h-6 border border-b-gray-200"/>
                  </div>
                  <div className="border-1 border-gray-200">
                    <input type="text" list="master-payment"
                            placeholder=""
                            className="w-full border-transparent h-6"/>
                  </div>
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
