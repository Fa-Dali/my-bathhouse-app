// Ссылка страницы http://localhost:3000/dashboard/timing-all-masters
'use client'

import MasterCalendar from '@/app/components/MasterCalendar';

export default function Page() {
  return (
    <div>
      <p>ТАЙМИНГ ВСЕХ МАСТЕРОВ НА ОПРЕДЕЛЕННУЮ ДАТУ</p>
      <MasterCalendar />
    </div>
  );
}
