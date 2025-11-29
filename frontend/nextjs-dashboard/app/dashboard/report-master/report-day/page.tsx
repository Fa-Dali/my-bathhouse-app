// app/dashboard/report-master/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/auth/contexts/auth-provider';

const SERVICE_OPTIONS = [
  'Парение',
  'Сила Леса',
  'Без Сю-Сю',
  'Карелия',
  'Массаж',
  'Общий',
  'Лимфодренаж',
  'Стоун',
] as const;

type Service = typeof SERVICE_OPTIONS[number];

interface Row {
  id: number;
  service: Service | '';
  adults: number;
  children: number;
  salary: string;
}

export default function ReportMasterPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([{ id: Date.now(), service: '', adults: 0.5, children: 0, salary: '' }]);
  const [totalClients, setTotalClients] = useState(0);
  const [totalSalary, setTotalSalary] = useState(0);

  // Обновление итогов
  useEffect(() => {
    const totalCl = rows.reduce((sum, r) => sum + r.adults + r.children, 0);
    const totalSal = rows.reduce((sum, r) => sum + (parseFloat(r.salary) || 0), 0);
    setTotalClients(totalCl);
    setTotalSalary(totalSal);
  }, [rows]);

  const addRow = () => {
    setRows([...rows, { id: Date.now(), service: '', adults: 0.5, children: 0, salary: '' }]);
  };

  const removeRow = (id: number) => {
    setRows(rows.filter(r => r.id !== id));
  };

  const updateRow = (id: number, field: keyof Row, value: any) => {
    setRows(rows.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  const saveReport = async () => {
    const payload = {
      master_id: user?.id,
      master_name: user?.username,
      date: new Date().toISOString().split('T')[0],
      rows: rows.map(r => ({
        service: r.service,
        clients: { adults: r.adults, children: r.children },
        salary: parseFloat(r.salary) || 0
      })),
      total_clients: totalClients,
      total_salary: totalSalary
    };

    try {
      const res = await fetch('http://localhost:8000/api/master-reports/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Отчёт сохранён!');
      } else {
        alert('Ошибка');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка сети');
    }
  };

  if (!user) return <div>Загрузка...</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">ОТЧЕТ МАСТЕРА</h1>

      <table className="w-full border-collapse border border-gray-400">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 w-10"></th>
            <th className="border border-gray-300">УСЛУГА</th>
            <th className="border border-gray-300">КЛИЕНТЫ</th>
            <th className="border border-gray-300">ЗАРПЛАТА</th>
          </tr>
          <tr className="bg-gray-50 text-sm">
            <td className="border border-gray-300"></td>
            <td className="border border-gray-300"></td>
            <td className="border border-gray-300">
              <div className="grid grid-cols-2 text-center">
                <span>взрослые</span>
                <span>дети</span>
              </div>
            </td>
            <td className="border border-gray-300"></td>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.id} className="text-center">
              <td className="border border-gray-300">
                <button
                  onClick={() => removeRow(row.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✖
                </button>
              </td>
              <td className="border border-gray-300">
                <select
                  value={row.service}
                  onChange={e => updateRow(row.id, 'service', e.target.value)}
                  className="w-full p-1 border rounded"
                >
                  <option value="">Выберите</option>
                  {SERVICE_OPTIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </td>
              <td className="border border-gray-300">
                <div className="grid grid-cols-2 gap-1">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="15"
                    value={row.adults}
                    onChange={e => updateRow(row.id, 'adults', parseFloat(e.target.value))}
                    className="p-1 border rounded text-center"
                  />
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="15"
                    value={row.children}
                    onChange={e => updateRow(row.id, 'children', parseFloat(e.target.value))}
                    className="p-1 border rounded text-center"
                  />
                </div>
              </td>
              <td className="border border-gray-300">
                <input
                  type="text"
                  placeholder="000 000"
                  value={row.salary}
                  onChange={e => updateRow(row.id, 'salary', e.target.value.replace(/\D/g, ''))}
                  className="w-24 p-1 border rounded text-right"
                />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold bg-gray-100">
            <td colSpan={2} className="text-right pr-2">ИТОГО:</td>
            <td className="text-center">
              <div className="grid grid-cols-2">
                <span>{rows.reduce((sum, r) => sum + r.adults, 0)}</span>
                <span>{rows.reduce((sum, r) => sum + r.children, 0)}</span>
              </div>
            </td>
            <td className="text-right pr-2">
              {totalSalary.toLocaleString('ru-RU')} ₽
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="mt-4 space-x-2">
        <button
          onClick={addRow}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          + Добавить строку
        </button>
        <button
          onClick={saveReport}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
