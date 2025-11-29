// Ссылка страницы http://localhost:3000/dashboard/report-master

import ReportMaster from '@/app/dashboard/report-master/report-day/page';
export default function Page() {
  return (
    <div>
      <div className="w-[60%]">
        < ReportMaster />
      </div>

      <p>ДОСТУПНА : ТОЛЬКО КОНКРЕТНОМУ МАСТЕРУ И ВСЕМ АДМИНИСТРАТОРАМ</p>
      <p>.</p>
      <p>Страница : ОТЧЁТ МАСТЕРА</p>
    </div>

  );
}
