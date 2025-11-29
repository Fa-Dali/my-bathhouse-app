// frontend/nextjs-dashboard/app/providers.tsx
'use client';

import { AuthProvider } from '@/app/auth/contexts/auth-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
