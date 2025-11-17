// frontend/nextjs-dashboard/app/layout.tsx
import '@/app/ui/global.css';
import Header from '@/app/components/Header';
import { inter } from '@/app/ui/fonts';
import { DnDProvider } from './DnDProvider';
import { AuthProvider } from '@/app/auth/contexts/auth-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <DnDProvider>
            {children}
          </DnDProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

// =========================================

// frontend/nextjs-dashboard/app/dashboard/layout.tsx

// import '@/app/ui/global.css';
// import Header from '@/app/components/Header';
// import { inter } from '@/app/ui/fonts';
// import ClientSideWrapper from '@/app/ui/client-side-wrapper'; // Используем клиентский wrapper

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en">
//       <body className={`${inter.className} antialiased`}>
//         {/* <Header /> */}
//         <div className="flex">
//           {/* САЙДБАР СЛЕВА */}
//           {/* вызываем клиентский компонент */}
//           {/* <ClientSideWrapper /> */}
//           {/* <ClientSideWrapper /> */}
//           <main className="container mx-auto mt-10">
//             {children}
//           </main>
//         </div>
//       </body>
//     </html>
//   );
// }
