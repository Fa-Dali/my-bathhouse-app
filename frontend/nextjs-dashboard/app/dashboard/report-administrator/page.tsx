// Ссылка страницы http://localhost:3000/dashboard/report-administrator
import React from 'react';
import CalculatorAdmin from './calculator/page';
import AdminTable from './calculator/AdminTable2';


export default function Page() {
	return (
		<div className="container p-2">
			{/* <p>ДОСТУПНА : ТОЛЬКО АДМИНИСТРАТОРАМ</p>
			<p>.</p>
			<p>Страница : администратора</p> */}
			{/* <CalculatorAdmin /> */}
			<AdminTable />
		</div>
	);
}
