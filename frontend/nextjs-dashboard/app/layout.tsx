// frontend/nextjs-dashboard/app/layout.tsx
// app/layout.tsx
import '@/app/ui/global.css';
import { inter } from '@/app/ui/fonts';
import { DnDProvider } from './DnDProvider';
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <DnDProvider>
            {children}
          </DnDProvider>
        </Providers>
      </body>
    </html>
  );
}
