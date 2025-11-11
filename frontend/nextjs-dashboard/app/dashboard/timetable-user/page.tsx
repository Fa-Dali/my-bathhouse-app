// Ссылка страницы http://localhost:3000/dashboard/timetable-user

// frontend/nextjs-dashboard/app/dashboard/timetable-user/page.tsx

import ProtectRoute from '@/app/utils/middlewares/protectRoute';
// import { useAuth } from '@/app/auth/contexts/auth-provider';


export default function Page() {
  return (
    // <ProtectRoute>
      <div>
        <p>ДОСТУПНА : ЗАРЕГИСТРИРОВАННЫМ</p>
        <p>.</p>
        <p>СТРАНИЦА : ДНЕВНОЙ ТАЙМИНГ ОРГАНИЗАЦИИ (для зарегистрированных)</p>
      </div>
    // </ProtectRoute>

  );
}
