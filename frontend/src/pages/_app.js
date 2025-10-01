// pages/_app.js
import '../styles/global.css'; // Подключаем глобальные стили



export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
