// pages/_app.tsx
import '../styles/global.css'; // Подключаем глобальные стили
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
