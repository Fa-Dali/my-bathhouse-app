// импортируйте его в ваш файл layout.tsx, как показано ранее:
// import Header from '@/components/Header';

// components/Header.tsx
import Link from 'next/link';
import Image from 'next/image';
import OptimizedAnalogClock from '@/app/components/Clock';

interface HeaderProps {
  className?: string; // Определяем необязательный проп className
}

const logoPath = "/static-images/logos/logo.png";

const Header: React.FC<HeaderProps> = ({ className }) => {
  return (
    <header className={`rounded-md flex items-center justify-between p-4 bg-sky-900 text-white ${className || ''}`}>
      <Link href="/">
        <Image src={logoPath} alt="Logo" width={50} height={50} className="mr-4 shadow-inner"/>
      </Link>
      <nav className="flex items-center">
        <ul className="flex gap-4">
          <li><Link href="/account" className="hover:text-blue-500 transition-colors duration-300">Account</Link></li>
          <li><Link href="/login" className="hover:text-blue-500 transition-colors duration-300">Login</Link></li>
        </ul>
      </nav>
    </header>

  );
};

export default Header;
