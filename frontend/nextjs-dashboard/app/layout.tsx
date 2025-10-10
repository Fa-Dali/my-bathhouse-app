
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
