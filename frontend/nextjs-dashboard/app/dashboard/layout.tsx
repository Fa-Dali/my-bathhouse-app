// app/dashboard/layout.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SideNav from '@/app/ui/dashboard/sidenav';
import EscapingAvatar from '@/app/components/EscapingAvatar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/auth/login');
    }
  }, []);

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden relative">
      {/* Сайдбар слева */}
      <div className="w-full flex-none md:w-64 order-last md:order-first -mt-5">
        <SideNav />
      </div>

      {/* Основной контент */}
      <div className="flex-grow relative overflow-hidden">
        <main className="p-0 sm:overflow-y-auto" style={{ paddingTop: '0px' }}>
          {children}
          <EscapingAvatar />
        </main>
      </div>
    </div>
  );
}
