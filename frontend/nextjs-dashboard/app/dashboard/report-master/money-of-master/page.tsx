'use client';

import React from 'react';

interface PaymentStats {
  unpaid: number;
  monthly: number;
  yearly: number;
}

export default function PaymentInfo({ stats }: { stats: PaymentStats }) {

  return (
    <div className="w-[40%] bg-gray-50 p-4 rounded border ml-1 my-2" style={{ minHeight: '400px', minWidth: '300px'}}>
      <h2 className="text-xl font-bold mb-4 text-center">ФИНАНСЫ МАСТЕРА</h2>

      <div className="space-y-4">
        <div className="bg-red-50 p-3 border border-red-200 rounded">
          <h3 className="font-semibold text-red-800">Неоплачено</h3>
          <p className="text-2xl font-bold text-red-600">
            {stats.unpaid.toLocaleString('ru-RU')} ₽
          </p>
        </div>

        <div className="bg-green-50 p-3 border border-green-200 rounded">
          <h3 className="font-semibold text-green-800">Оплачено</h3>
          <div className="grid grid-cols-1 gap-2 mt-2">
            <div>
              <p className="text-sm text-gray-600">Месяц</p>
              <p className="text-xl font-bold text-green-700">
                {stats.monthly.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Год</p>
              <p className="text-xl font-bold text-green-700">
                {stats.yearly.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>«Неоплачено» — сумма всех отчётов, которые ещё не подтверждены администратором.</p>
        <p>«Оплачено» — сумма за текущий месяц и год.</p>
      </div>
    </div>
  );
}
