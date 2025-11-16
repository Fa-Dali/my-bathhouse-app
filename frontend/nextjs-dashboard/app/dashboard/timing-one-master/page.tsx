// Ссылка страницы http://localhost:3000/dashboard/timing-one-master

import React from 'react';
import WeekAhead from './week-ahead/page';
import Salaries from './salaries/page';

export default function Page() {
  return (
	<div className="container mx-auto p-1">
		{/* <p>ДОСТУПНА : КОНКРЕТНОМУ МАСТЕРУ И ВСЕМ АДМИНИСТРАТОРАМ</p>
		<p>.</p>
		<p>СТРАНИЦА : ТАЙМИНГ ОДНОГО МАСТЕРА НА НЕДЕЛЮ</p> */}
		<WeekAhead />
		<Salaries />
	</div>

  );
}
