// Ссылка страницы http://localhost:3000/dashboard/staff-table

// app/dashboard/archive-programs/page.tsx

import React from 'react';
import CalculatorAdmin from './calculator/page';

export default function Page() {
  return (
	<div className="container mx-auto p-4">
	  <h1 className="text-3xl font-semibold mb-4">ТАБЛИЦА СОТРУДНИКОВ И ИХ ДОЛЖНОСТЕЙ</h1>
	  <CalculatorAdmin />

	</div>
  );
}
