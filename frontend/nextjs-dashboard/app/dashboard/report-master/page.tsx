// Ссылка страницы http://localhost:3000/dashboard/report-master

import ReportMaster from '@/app/dashboard/report-master/report-day/page';
import MoneyOfMaster from '@/app/dashboard/report-master/money-of-master/page';
export default function Page() {
  return (
    <div className="flex w-full">
      <div className="w-[60%]">
        < ReportMaster />
      </div>
      <div className="w-[40%]">
        < MoneyOfMaster />
      </div>
    </div>

  );
}
