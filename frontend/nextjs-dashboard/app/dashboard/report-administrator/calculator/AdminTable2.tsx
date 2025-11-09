// frontend/nextjs-dashboard/app/dashboard/report-administrator/calculator/AdminTable.tsx

// @refresh reset
'use client';

import React, { useEffect, useState } from 'react';
import CustomCheckbox from './CustomCheckbox';
// import '../../../../app/ui/global.css';
import './style/TimeInput.module.css';
import './style/Select.module.css';
import './style/Cell.module.css';
import useFormattedNumber from './scripts/useFormattedNumber';
import useCurrentDate from '../hooks/useCurrentDate';
import { NumberInput } from './scripts/InputField';
import SendReportModal from './modal/SendReportModal';

import {
  PlusIcon,
  TrashIcon,
  EnvelopeIcon,
  ArrowTopRightOnSquareIcon,
  DocumentMinusIcon,
  PaperAirplaneIcon,
  FolderArrowDownIcon,
} from "@heroicons/react/24/outline";

export interface PageProps { }

interface Payment {
  amount: string;
  method: string;
}

interface Master {
  name: string;
  salary: string;
}

interface ReportRow {
  startTime: string;
  endTime: string;
  audience: string;
  rent: string;
  sales: string;
  spa: string;
  payments: { amount: string; method: string }[];
  masters: { name: string; salary: string }[];
}

interface ReportResponse {
  id: string;
  admin_name: string;
  created_at: string;
  reports: ReportRow[];
}

// Глубокое копирование шаблона — гарантируем чистоту при создании новой строки
const getEmptyRow = (): ReportRow => ({
  startTime: '',
  endTime: '',
  audience: '',
  rent: '',
  sales: '',
  spa: '',
  payments: [
    { amount: '', method: '' },
    { amount: '', method: '' },
    { amount: '', method: '' },
    { amount: '', method: '' }
  ],
  masters: [
    { name: '', salary: '' },
    { name: '', salary: '' },
    { name: '', salary: '' },
    { name: '', salary: '' }
  ]
});

export default function Page({ }: PageProps) {
  const [adminName, setAdminName] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Функция форматирования даты
  const formatDate = (dateString: string): string => {
    const [year, month, day] = dateString.split('-');
    return `${day}.${month}.${year}`;
  };

  const currentDate = useCurrentDate();
  useEffect(() => {
    console.log("Текущая дата: ", currentDate);
  }, [currentDate]);

  const cleanNumber = (value: string | number) => {
    if (typeof value === 'string') {
      return Number(value.replace(/[^-\d.,]+/g, '').replace(',', '.')) || 0;
    }
    return typeof value === 'number' && !isNaN(value) ? value : 0;
  };

  const [rows, setRows] = useState<ReportRow[]>([getEmptyRow()]);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  // ДЛЯ ОТПРАВКИ ОТЧЕТА НА ПОЧТУ АДМИНИСТРАЦИИ
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailMode, setEmailMode] = useState<'today' | 'date'>('today');
  const [customDate, setCustomDate] = useState<string>('');

  // ТАК БУДЕТ ПРОЩЕ ПРИ СМЕНЕ СЕРВЕРА
  const API_BASE = 'http://localhost:8000';
  // тогда надо будет писать пути так:
  // fetch(`${API_BASE}/api/send-report-email/`, { ... })
  // fetch(`${API_BASE}/api/reports/generate-pdf/`, { ... })

  // Синхронизация после сохранения
  useEffect(() => {
    if (status === 'saved') {
      setIsInitialLoad(false);
    }
  }, [status]);

  const updatePaymentAmount = (rowIndex: number, paymentIndex: number, value: string) => {
    setRows(prev => {
      const updated = [...prev];
      updated[rowIndex].payments[paymentIndex].amount = value;
      return updated;
    });
  };

  const updatePaymentMethod = (rowIndex: number, paymentIndex: number, value: string) => {
    setRows(prev => {
      const updated = [...prev];
      updated[rowIndex].payments[paymentIndex].method = value;
      return updated;
    });
  };

  const calculateRowTotal = (row: ReportRow) => {
    return cleanNumber(row.rent) + cleanNumber(row.sales) + cleanNumber(row.spa);
  };

  const calculateTotals = () => {
    let totalRent = 0;
    let totalSales = 0;
    let totalSpa = 0;
    let totalMastersSalary = 0;

    for (let row of rows) {
      totalRent += cleanNumber(row.rent);
      totalSales += cleanNumber(row.sales);
      totalSpa += cleanNumber(row.spa);

      // Суммируем зарплаты мастеров в каждой строке
      for (let master of row.masters) {
        if (master.salary) {
          totalMastersSalary += cleanNumber(master.salary);
        }
      }
    }

    return {
      totalRent,
      totalSales,
      totalSpa,
      totalMastersSalary,
      grandTotal: totalRent + totalSales + totalSpa,
    };
  };

  // СВОДКА ТИПЫ ОПЛАТ КАССА
  // === Подсчёт итогов по методам оплаты ===
  const calculatePaymentTotals = () => {
    const totals: Record<string, number> = {
      Тер: 0,
      НАЛ: 0,
      Сайт: 0,
      Ресеп: 0,
    };

    let total = 0;

    for (let row of rows) {
      for (let payment of row.payments) {
        const method = payment.method.trim();
        const amount = cleanNumber(payment.amount);

        if (method && amount > 0) {
          if (method === 'Тер') totals['Тер'] += amount;
          else if (method === 'НАЛ') totals['НАЛ'] += amount;
          else if (method === 'Сайт') totals['Сайт'] += amount;
          else if (method === 'Ресеп') totals['Ресеп'] += amount;
        }
      }
    }

    // Общая сумма
    total = Object.values(totals).reduce((sum, val) => sum + val, 0);

    // Наличные к выдаче: минус зарплата админа (3100 ₽)
    const cashToHand = (totals['НАЛ'] || 0) - 3100;

    return {
      totals,
      total,
      cashToHand: cashToHand > 0 ? cashToHand : 0
    };
  };

  // Вызов функции
  const { totals: paymentTotals, total: paymentTotal, cashToHand } = calculatePaymentTotals();

  // ✅ Добавляем строку с чистым шаблоном
  const handleAddRow = () => {
    setRows(prev => [...prev, getEmptyRow()]);
  };

  const handleDeleteRow = () => {
    const filteredRows = rows.filter((_, index) => !selectedRows.includes(index));
    setRows(filteredRows);
    setSelectedRows([]);
  };

  type UpdatableField = 'startTime' | 'endTime' | 'audience' | 'rent' | 'sales' | 'spa';
  const updateRow = (index: number, field: UpdatableField, value: string) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const toggleSelection = (index: number) => {
    setSelectedRows(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const formatNumber = (num: string | number) => {
    return num ? String(num).replace(/\B(?=(?:[\d]{3})+$)/g, ' ') : '';
  };

  const totals = calculateTotals();

  const saveReport = async (isAutoSave = false) => {
    if (isInitialLoad && isAutoSave) return;

    setStatus('saving');
    const payload = {
      admin_name: adminName,
      created_at: selectedDate + 'T00:00:00Z',
      totalPayment: 0,
      rows: rows.map(row => ({
        start_time: row.startTime,
        end_time: row.endTime,
        audience: row.audience,
        rent: cleanNumber(row.rent),
        sales: cleanNumber(row.sales),
        spa: cleanNumber(row.spa),
        payments: row.payments
          .filter(p => p.amount || p.method)
          .map(p => ({
            amount: cleanNumber(p.amount),
            method: p.method,
          })),
        masters: row.masters
          .filter(m => m.name || m.salary)
          .map(m => ({
            name: m.name,
            salary: cleanNumber(m.salary),
          })),
      })),
    };

    payload.totalPayment = payload.rows.reduce(
      (sum, row) => sum + row.payments.reduce((pSum, p) => pSum + p.amount, 0),
      0
    );

    console.log('Payload before save:', payload);

    const method = currentReportId ? 'PUT' : 'POST';
    const url = currentReportId
      ? `http://localhost:8000/api/reports/${currentReportId}/`
      : 'http://localhost:8000/api/reports/';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentReportId(data.id);
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
        if (!isAutoSave) alert('Отчёт сохранён!');
      } else {
        console.error('Ошибка:', await res.json());
        setStatus('idle');
      }
    } catch (error) {
      console.error('Ошибка отправки:', error);
      setStatus('idle');
    }
  };

  const clearTable = () => {
    setRows([getEmptyRow()]);
    setCurrentReportId(null);
  };

  const loadReportByDate = async (date: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/reports/date/${date}/`);
      if (response.ok) {
        const data: ReportResponse = await response.json();
        const normalized = data.reports.map((row: any) => {
          // Явно маппим snake_case → camelCase
          const mappedRow = {
            ...getEmptyRow(),
            startTime: row.start_time || '',   // ←
            endTime: row.end_time || '',       // ←
            audience: row.audience || '',
            rent: String(row.rent || ''),
            sales: String(row.sales || ''),
            spa: String(row.spa || ''),
            payments: Array.isArray(row.payments)
              ? row.payments.map((p: any) => ({
                amount: String(p.amount || ''),
                method: p.method || '',
              }))
              : [],
            masters: Array.isArray(row.masters)
              ? row.masters.map((m: any) => ({
                name: m.name || '',
                salary: String(m.salary || ''),
              }))
              : [],
          };

          // Дополняем до 4 платежей и 4 мастеров
          const payments = [
            ...mappedRow.payments,
            ...Array(4 - mappedRow.payments.length).fill({ amount: '', method: '' })
          ].slice(0, 4);

          const masters = [
            ...mappedRow.masters,
            ...Array(4 - mappedRow.masters.length).fill({ name: '', salary: '' })
          ].slice(0, 4);

          return { ...mappedRow, payments, masters };
        });

        setRows(normalized);
        setCurrentReportId(data.id);
        setAdminName(data.admin_name || '');
      } else {
        setRows([getEmptyRow()]);
        setCurrentReportId(null);
        setAdminName('');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      setRows([getEmptyRow()]);
      setCurrentReportId(null);
      setAdminName('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/reports/generate-pdf/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate })
      });

      const data = await response.json();

      if (response.status === 409 && data.exists) {
        const overwrite = window.confirm(
          `Файл отчёта за ${formatDate(selectedDate)} уже существует.\n\nХотите пересохранить?`
        );
        if (!overwrite) return;

        // Перезапись
        const overwriteRes = await fetch('http://localhost:8000/api/reports/generate-pdf/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: selectedDate, overwrite: true })
        });

        const result = await overwriteRes.json();
        if (result.success) {
          alert('✅ PDF пересохранён');
        } else {
          alert('❌ Ошибка: ' + result.error);
        }
        return;
      }

      if (data.success) {
        alert('✅ PDF сохранён');
      } else {
        alert('❌ Ошибка: ' + data.error);
      }
    } catch (err) {
      console.error('Ошибка:', err);
      alert('❌ Не удалось подключиться к серверу');
    }
  };

  //2 ВАРИАНТ = Обработчик отправки (вне модалки)
  const handleSendEmail = async (dateToSend: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/reports/send-report-email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateToSend }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Отчёт отправлен на ${data.sent} адресов`);
      } else {
        alert('Ошибка: ' + data.error);
      }
    } catch (err) {
      alert('Ошибка сети в AdminTable2.tsx');
    }

    // Закрываем модалку
    setShowEmailModal(false);
  };



  useEffect(() => {
    loadReportByDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (isInitialLoad) return;

    const timer = setTimeout(() => {
      saveReport(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [rows, adminName, isInitialLoad]);

  return (
    <div
      id="admin-report-table"
      className="container mx-auto font-sans"
      key={currentReportId || 'new'}
      suppressHydrationWarning
    >
      <div className="head">
        <h1 className="text-2xl text-center"><b>"Ежедневный отчет бани"</b> : {formatDate(selectedDate)} г.</h1>

        {status !== 'idle' && (
          <div className="fixed top-4 right-4 bg-white border px-3 py-2 rounded shadow text-sm z-50 animate-fade-in">
            {status === 'saving' && 'Сохраняю...'}
            {status === 'saved' && '✅ Сохранено'}
          </div>
        )}

        {!isLoading && (
          <table className="w-full border border-gray-800">
            <thead>
              <tr className="bg-white text-black border-2">
                <td className="w-1/12 border border-gray-300">
                  <input
                    type="date"
                    className="w-full h-8 border-none focus:ring-transparent focus:outline-none text-start"
                    value={selectedDate}
                    onChange={async (e) => {
                      const newDate = e.target.value;
                      setSelectedDate(newDate);
                      await loadReportByDate(newDate);
                    }}
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
                      className="w-full border-transparent"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                    />
                    <datalist id="fio-list">
                      <option value="Кирсанова О."></option>
                      <option value="Менделеева О."></option>
                      <option value="Зорина З."></option>
                    </datalist>
                  </div>
                </td>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        )}
      </div>

      <div className="div-container flex justify-between gap-1">
        <div>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <p>Загрузка отчёта...</p>
            </div>
          ) : (
            <div className=" beautiful-scroll overflow-y-auto max-h-[300px]">
              <div className="overflow-x-auto pb-[225px]">
                <table className="w-full min-w-full border bg-white border-gray-300">
                  <thead>
                    <tr className="bg-white text-black border-2">
                      <th className="border px-2 py-1 bg-slate-50">
                        <TrashIcon className='text-gray-400' />
                      </th>
                      <th colSpan={2} className="w-1/12 border px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-600">Время</th>
                      <th className="w-2/12 border px-2 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">Баня</th>
                      <th className="w-1/12 border px-2 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">Аренда</th>
                      <th className="w-1/12 border px-2 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">Продажа</th>
                      <th className="w-1/12 border px-2 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">СПА</th>
                      <th className="w-1/12 border px-2 py-2 text-xs font-semibold uppercase tracking-wider text-slate-600">СУММА</th>
                      <th className="w-1/12 border px-2 py-2 bg-white text-xs font-semibold uppercase tracking-wider text-slate-600">ОПЛАТА</th>
                      <th className="w-1/12 border px-2 py-2 bg-white text-xs font-semibold uppercase tracking-wider text-slate-600">Способ</th>
                      <th colSpan={2} className="w-1/3 border px-2 py-2 bg-white text-xs font-semibold uppercase tracking-wider text-slate-600">Зарплата</th>
                    </tr>
                  </thead>

                  <tbody className="beautiful-scroll text-center border-2 border-b-blue-600">
                    {rows.map((row, index) => (
                      <tr key={`row-${index}`} className='border-2 border-b-gray-200'>
                        <td className="border relative">
                          <CustomCheckbox
                            isChecked={selectedRows.includes(index)}
                            onChange={() => toggleSelection(index)}
                          />
                        </td>

                        <td className="border">
                          <input
                            type="time"
                            className="w-full border border-transparent"
                            value={row.startTime}
                            onChange={(e) => updateRow(index, 'startTime', e.target.value)}
                          />
                        </td>
                        <td className="border">
                          <input
                            type="time"
                            className="w-full border border-transparent"
                            value={row.endTime}
                            onChange={(e) => updateRow(index, 'endTime', e.target.value)}
                          />
                        </td>
                        <td className="border relative">
                          <input
                            type="text"
                            list="audience-list"
                            placeholder="Аудитория"
                            className="w-full border-transparent text-center"
                            value={row.audience}
                            onChange={(e) => updateRow(index, 'audience', e.target.value)}
                          />
                          <datalist id="audience-list">
                            <option value="Муромец"></option>
                            <option value="Никитич"></option>
                            <option value="Попович"></option>
                            <option value="Массаж"></option>
                          </datalist>
                        </td>
                        <td className="border">
                          <NumberInput
                            type="text"
                            step="10"
                            className="text-right w-full border-none focus:ring-transparent focus:outline-none"
                            value={row.rent}
                            onChange={(e) => updateRow(index, 'rent', e.target.value)}
                          />
                        </td>
                        <td className="border">
                          <NumberInput
                            type="text"
                            step="10"
                            className="text-right w-full border-none focus:ring-transparent focus:outline-none"
                            value={row.sales}
                            onChange={(e) => updateRow(index, 'sales', e.target.value)}
                          />
                        </td>
                        <td className="border">
                          <NumberInput
                            type="text"
                            step="10"
                            className="text-right w-full border-none focus:ring-transparent focus:outline-none"
                            value={row.spa}
                            onChange={(e) => updateRow(index, 'spa', e.target.value)}
                          />
                        </td>
                        <td className="border">
                          <strong>{calculateRowTotal(row).toLocaleString('ru-RU')}</strong>
                        </td>
                        <td className="">
                          {row.payments.map((payment, idx) => (
                            <div key={idx} className="border-1 border-gray-200">
                              <input
                                type="number"
                                step="10"
                                className="w-full border-transparent border border-b-gray-200"
                                value={payment.amount}
                                onChange={(e) => updatePaymentAmount(index, idx, e.target.value)}
                              />
                            </div>
                          ))}
                        </td>
                        <td className="border">
                          {row.payments.map((payment, idx) => (
                            <div key={idx} className="border-1 border-gray-200">
                              <select
                                value={payment.method}
                                onChange={(e) => updatePaymentMethod(index, idx, e.target.value)}
                                className="w-full border-transparent border border-b-gray-200"
                              >
                                <option value=""></option>
                                <option value="Тер">Тер</option>
                                <option value="НАЛ">НАЛ</option>
                                <option value="Сайт">Сайт</option>
                                <option value="Ресеп">Ресеп</option>
                              </select>
                            </div>
                          ))}
                        </td>
                        <td className="border">
                          {row.masters.map((master, idx) => (
                            <div key={idx} className="border-1 border-gray-200">
                              <input
                                type="text"
                                list="master-name"
                                className="w-full border-transparent border border-b-gray-200"
                                value={master.name}
                                onChange={(e) => {
                                  const updated = [...rows];
                                  updated[index].masters[idx].name = e.target.value;
                                  setRows(updated);
                                }}
                              />
                            </div>
                          ))}
                        </td>
                        <td className="border">
                          {row.masters.map((master, idx) => (
                            <div key={idx} className="border-1 border-gray-200">
                              <input
                                type="text"
                                list="master-payment"
                                className="w-full border-transparent border border-b-gray-200"
                                value={master.salary}
                                onChange={(e) => {
                                  const updated = [...rows];
                                  updated[index].masters[idx].salary = e.target.value;
                                  setRows(updated);
                                }}
                              />
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr className="bg-yellow-50 text-slate-800 font-semibold text-right border-t-2 border-slate-200">
                      <td colSpan={4} className="text-left font-bold border px-3 py-2">ИТОГ:</td>
                      <td className="border px-3 py-2">{totals.totalRent.toLocaleString('ru-RU')}</td>
                      <td className="border px-3 py-2">{totals.totalSales.toLocaleString('ru-RU')}</td>
                      <td className="border px-3 py-2">{totals.totalSpa.toLocaleString('ru-RU')}</td>
                      <td className="border px-3 py-2">{totals.grandTotal.toLocaleString('ru-RU')}</td>
                      <td className="border px-3 py-2">{"\u00A0"}</td>
                      <td className="border px-3 py-2">{"\u00A0"}</td>
                      <td className="border px-3 py-2">Зарплата мастерам:</td>
                      <td className="border px-3 py-2"><strong>{totals.totalMastersSalary.toLocaleString('ru-RU')}</strong></td>
                    </tr>
                  </tfoot>
                </table>
                <div className="bg-blue-100 h-[5px]"></div>



                {/* === СВОДКА ПО ОПЛАТАМ === */}
              <div className="mt-6 ml-auto w-4/12 max-w-[30%] bg-gray-50 p-4 rounded border text-sm">
                <h2 className="text-lg font-bold mb-3">КАССА</h2>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left pb-1">Способ</th>
                      <th className="text-right pb-1">Сумма</th>
                    </tr>
                  </thead>
                  <tbody className="border-t">
                    {Object.entries(paymentTotals).map(([method, amount]) => (
                      <tr key={method}>
                        <td className="py-1 capitalize">{method}</td>
                        <td className="py-1 text-right font-mono">
                          {formatNumber(amount)} ₽
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t font-semibold">
                    <tr>
                      <td>ИТОГО</td>
                      <td className="text-right">{formatNumber(totals.grandTotal)} ₽</td>
                    </tr>
                    <tr>
                      <td className="pt-2 text-red-700">
                        Наличные отдать<br/>на ресепшен
                      </td>
                      <td className="pt-2 text-right font-mono text-red-700">
                        {formatNumber(cashToHand)} ₽
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>



              </div>





              {/* КНОПКИ ДЕСКТОП 1 ВАРИАНТ */}
              {/* <div className="flex flex-col min-h-screen justify-between">
                <div className="p-2 fixed bottom-0 left-0 right-0 z-50 ml-[250px]">
                  <div className="p-1 bg-slate-200 shadow-lg shadow-slate-400/30">
                    <button
                      className="bg-green-400 hover:bg-green-500 py-1 px-4 mx-4 rounded-full shadow-lg"
                      onClick={handleAddRow}
                    >
                      <PlusIcon className="w-6 h-6 inline-block align-middle text-gray-800" />
                    </button>

                    <button
                      className="bg-red-400 hover:bg-red-500 text-white font-bold py-1 px-4 mx-4 rounded-full shadow-lg"
                      disabled={selectedRows.length === 0}
                      onClick={handleDeleteRow}
                    >
                      <TrashIcon className="w-6 h-6 inline-block align-middle text-gray-800" />
                    </button>

                    <button
                      title='Сохранить в PDF'
                      className="bg-sky-200 hover:bg-sky-300 py-1 px-4 mx-4 rounded-full shadow-lg"
                      onClick={() => { }}
                    >
                      PDF <ArrowTopRightOnSquareIcon className="w-6 h-6 inline-block align-middle text-gray-800" />
                    </button>

                    <button
                      title="Сохранить отчёт"
                      className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-4 mx-4 rounded-full"
                      onClick={() => saveReport(false)}
                      disabled={status === 'saving'}
                    >
                      💾 Сохранить
                    </button>

                    <button
                      className="bg-slate-100 hover:bg-yellow-200 py-1 px-4 mx-4 rounded-full shadow-lg"
                      onClick={() => saveReport(false)}
                    >
                      <EnvelopeIcon className="w-6 h-6 inline-block align-middle text-gray-800" /> - БД
                    </button>

                    <button
                      className="bg-blue-400 hover:bg-blue-500 text-white font-bold py-1 px-4 mx-4 rounded-full"
                      onClick={() => { }} // fetchReports временно убран
                    >
                      📂 Загрузить отчёты
                    </button>

                    <button
                      className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-1 px-4 mx-4 rounded-full"
                      onClick={clearTable}
                    >
                      🧹 Очистить
                    </button>



                  </div>
                </div>
              </div> */}

              {/* КНОПКИ ДЕСКТОП 2 ВАРИАНТ */}
              <div className="hidden sm:flex pl-2 h-12 fixed bottom-0 left-0 right-0 z-50 ml-[250px] w-full">
                <div className="flex flex-wrap gap-2 p-1 bg-slate-200 shadow-lg shadow-slate-400/30 w-full justify-start">

                  {/* КНОПКА : ДОБАВИТЬ СТРОКУ */}
                  <button
                    className="px-4 py-2 bg-gradient-to-b from-gray-100 to-green-200
                            text-gray-800 rounded-lg shadow-sm
                              border border-gray-200 hover:shadow
                            hover:from-gray-100 hover:to-green-400
                              transition-all duration-150 flex items-center gap-2"
                    onClick={handleAddRow}
                  >
                    <PlusIcon className="w-6 h-6" />
                  </button>

                  {/* КНОПКА : УДАЛИТЬ СТРОКУ */}
                  <button
                    className="px-4 py-2 bg-gradient-to-b from-red-50 to-red-500
                              text-gray-800 rounded-lg shadow-sm
                              border border-gray-200 hover:shadow
                              hover:from-red-300 hover:to-red-700
                              disabled:opacity-50 disabled:cursor-not-allowed
                              transition-all duration-150 flex items-center gap-2"
                    disabled={selectedRows.length === 0}
                    onClick={handleDeleteRow}
                  >
                    <TrashIcon className="w-6 h-6" />
                  </button>

                  {/* КНОПКА : Сохранить в PDF */}
                  <button
                    title='Сохранить в PDF'
                    className="px-4 py-2 bg-gradient-to-b from-gray-100 to-sky-200
                            text-gray-800 rounded-lg shadow-sm
                              border border-gray-200 hover:shadow
                            hover:from-gray-100 hover:to-blue-300
                              transition-all duration-150 flex items-center gap-2"
                    onClick={handleGeneratePDF}
                  >
                    PDF <ArrowTopRightOnSquareIcon className="w-6 h-6" />
                  </button>

                  {/* КНОПКА : Сохранить отчёт */}
                  <button
                    title="Сохранить отчёт"
                    className="px-4 py-2 bg-gradient-to-b from-gray-200 to-green-300
                              text-gray-800 rounded-lg shadow-sm
                              border border-gray-300 hover:shadow-md
                              hover:from-gray-100 hover:to-green-500
                              disabled:opacity-60 disabled:cursor-not-allowed
                              transition-all duration-150 flex items-center gap-2 font-medium"
                    onClick={() => saveReport(false)}
                    disabled={status === 'saving'}
                  >
                    Сохранить 💾
                  </button>

                  {/* КНОПКА : ОЧИСТИТЬ ТАБЛИЦУ */}
                  {/* <button
                  title="❗️❗️❗️ ЭТО УДАЛИТ ИНФОРМАЦИЮ ИЗ БАЗЫ ДАННЫХ НА ВЫБРАННУЮ ДАТУ"
                    className="px-4 py-2 bg-gradient-to-b from-gray-100 to-red-200
                              text-gray-700 rounded-lg shadow-sm
                              border border-gray-200 hover:shadow
                              hover:from-red-900 hover:to-red-500
                              transition-all duration-150 flex items-center gap-2"
                    onClick={clearTable}
                  >
                    🧹 Очистить
                  </button> */}

                  {/* КНОПКА : ОТПРАВИТЬ ОТЧЕТ */}
                  <button
                    onClick={() => setShowEmailModal(true)}
                    title="Сохранить отчёт"
                    className="px-4 py-2 bg-gradient-to-b from-gray-200 to-sky-200
                              text-gray-800 rounded-lg shadow-sm
                              border border-gray-300 hover:shadow-md
                              hover:from-gray-100 hover:to-sky-300
                              disabled:opacity-60 disabled:cursor-not-allowed
                              transition-all duration-150 flex items-center gap-2 font-medium"
                    // onClick={() => saveReport(false)}
                    disabled={status === 'saving'}
                  >
                    Отправить
                    <PaperAirplaneIcon className="w-6 h-6" />
                  </button>
                  {/* Модалка — отдельный компонент */}
                  <SendReportModal
                    isOpen={showEmailModal}
                    onClose={() => setShowEmailModal(false)}
                    onSend={handleSendEmail}
                  />

                </div>
              </div>


              {/* КНОПКА "+" : МОБИЛНЫЙ ЭКРАН */}
              {/* <div className="sm:hidden fixed bottom-10 right-12 z-50">
                <button
                  onClick={handleAddRow}
                  className="w-12 h-12 bg-green-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition-colors"
                >
                  <PlusIcon className="w-6 h-6" />
                </button>
              </div> */}

              {/* Компактная панель — только на мобильных */}
              <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-100 border-t shadow-lg z-50">
                <div className="flex justify-around items-center p-1 text-xs">

                  <button onClick={handleAddRow} className="m-1 border rounded-md border-slate-500 p-2 text-white">
                    <PlusIcon className="text-green-600 w-5 h-5" />
                  </button>

                  <button
                    onClick={handleDeleteRow}
                    disabled={selectedRows.length === 0}
                    className="m-1 border rounded-md border-slate-500 p-2 text-white"
                  >
                    <TrashIcon className="text-red-600 w-5 h-5" />
                  </button>

                  <button onClick={() => saveReport(false)} className="m-1 border rounded-md border-slate-500 p-2 text-white">
                    <FolderArrowDownIcon className="text-gray-500 w-5 h-5" />
                  </button>

                  <button onClick={clearTable} className="m-1 border rounded-md border-slate-500 p-2 text-white bg-red-500">
                    <DocumentMinusIcon className="text-white w-5 h-5" />
                  </button>
                </div>
              </div>


            </div>
          )}
        </div>
      </div>
    </div>
  );
}
