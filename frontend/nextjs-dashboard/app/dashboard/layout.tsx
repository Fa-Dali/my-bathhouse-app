// app/layout.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SideNav from '@/app/ui/dashboard/sidenav';
import Header from '@/app/components/Header';
import { AuthProvider } from '@/app/auth/contexts/auth-provider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      router.push('/auth/login');
    }
  }, []);

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden relative">
      <div className="w-full flex-none md:w-64 order-last md:order-first -mt-5">
        <SideNav />
      </div>
      <div className="flex-grow relative overflow-hidden">
        <Header className="sticky top-0 z-50 bg-gray-800 text-white w-full py-4" />
        <main className="p-6 sm:overflow-y-auto md:p-12 pt-[64px]" style={{ paddingTop: '64px' }}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </main>
      </div>
    </div>
  );
}
