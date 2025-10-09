// Ссылка страницы http://localhost:3000/dashboard/report-administrator
import React from 'react';
import CalculatorAdmin from './calculator/page';

export default function Page() {
  return (
		<div className="container mx-auto p-4">
			<p>Страница : администратора</p>
			<CalculatorAdmin />
		</div>
  );
}
