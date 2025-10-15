
import '@/app/ui/global.css';
import Header from '@/app/components/Header';
import { inter } from '@/app/ui/fonts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {/* <Header /> */}
        {children}
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
