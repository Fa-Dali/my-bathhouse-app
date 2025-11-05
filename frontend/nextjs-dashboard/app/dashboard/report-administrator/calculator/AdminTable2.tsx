// frontend/nextjs-dashboard/app/dashboard/report-administrator/calculator/AdminTable.tsx

// @refresh reset
'use client';

import React, { useEffect, useState } from 'react';
import CustomCheckbox from './CustomCheckbox';
import '../../../../app/ui/global.css';
import './style/TimeInput.module.css';
import './style/Select.module.css';
import './style/Cell.module.css';
import useFormattedNumber from './scripts/useFormattedNumber';
import useCurrentDate from '../hooks/useCurrentDate';
import { NumberInput } from './scripts/InputField';

import {
  PlusIcon,
  TrashIcon,
  EnvelopeIcon,
  ArrowTopRightOnSquareIcon,
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
        <div className="beautiful-scroll overflow-y-auto h-[1120px]">
          {isLoading ? (
            <div className="flex justify-center p-8">
              <p>Загрузка отчёта...</p>
            </div>
          ) : (
            <div>
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

              <div className="flex flex-col min-h-screen justify-between">
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
