// frontend/nextjs-dashboard/app/page.tsx

import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

const logoPath = "/static-images/logos/logo.png";

export default function Page() {
  return (
    <main
      className="flex min-h-screen flex-col p-2 relative"
      style={{
        backgroundImage: "url('/hero-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // фон остаётся на месте при скролле
      }}
    >

      {/* Затемнение фона */}
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="relative z-10">

        {/* <div className={styles.shape} /> */}
        <div className="flex w-[99%] h-20 shrink-0 items-end rounded-lg bg-cyan-950/70 p-2 md:h-20 ">
          <Link href="/">
            <Image src={logoPath} alt="Logo" width={50} height={50} className="mr-5 shadow-inner" />
          </Link>
          <div className="text-lime-100 font-serif text-2xl md:text-5xl mt-5">Тайминг Бани АПД</div>

        </div>
        <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
          <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-950/50 px-6 py-8 md:w-2/5 md:px-20">

            <p className={`${lusitana.className} text-xl text-gray-400 md:text-3xl md:leading-normal`}
            >
              <br />
              Сисьтема управления организацией
            </p>

            <p className={`${lusitana.className} text-xl text-gray-400 md:text-3xl md:leading-normal`}
            >
              Поповские Бани отель: <br /> {' '}
              <a href="https://ap-dvor.ru/" className="text-yellow-500">"Алёша Попович Двор"
              </a>
            </p>
            <Link
              href="/dashboard"
              className="flex items-center gap-5 self-start rounded-lg bg-lime-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sky-300 md:text-base"
            >
              <span>Вход</span> <ArrowRightIcon className="w-5 md:w-6" />
            </Link>
          </div>
          <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
           

          </div>
        </div>
      </div>
    </main>
  );
}
