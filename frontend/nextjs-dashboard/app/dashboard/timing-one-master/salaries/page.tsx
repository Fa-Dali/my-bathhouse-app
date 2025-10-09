// Зарплатная карточка мастера

// Ссылка страницы http://localhost:3000/dashboard/timing-one-master/salaries

import React from 'react';
import Yearly from './yearly/salary-year';
import DayService from './service-based/salary-servis';
import Periodical from './periodical/salary-period';
import StatusPaid from './payment-status/paid-page';
import StatusUnPaid from './payment-status/unpaid-page';
import Monthly from './monthly/salary-month';
import SalaryDay from './daily/salary-day';

export default function Page() {
  return (
	<div className="container mx-auto p-4">
		<p>элемент | СТРАНИЦА : ЗАРПЛАТНАЯ КАРТОЧКА МАСТЕРА</p>
		<DayService />
		<SalaryDay />
		<StatusPaid />
		<StatusUnPaid />
		<Monthly />
		<Periodical />
		<Yearly />

	</div>

  );
}
