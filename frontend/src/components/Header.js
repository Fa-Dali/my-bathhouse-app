// components/Header.js
import styles from './Header.module.css';
import AnalogClock from './Clock'; // Импортируем компонент часов
import Image from 'next/image'; // Подключаем компонент Image

const Header = () => {
  // Локальная переменная для демонстрационного пользователя
  const currentUser = {
    username: 'Ваше имя пользователя',
    avatarUrl: '/avatar.jpg', // Убедитесь, что изображение доступно
  };

  return (
    <header className={styles.headerContainer}>
      <div className={styles.logo}>АПД Табель</div>
      <div className={styles.userInfo}>
        <Image
          src={currentUser.avatarUrl}
          alt='Аватар'
          className={styles.avatarImg}
          width={40} // Установлена ширина
          height={40} // Установлена высота
          quality={75} // Качество изображения
        />
        <span className={styles.username}>{currentUser.username}</span>
        {/* <span className={styles.dateTime}>{new Date().toLocaleDateString()}</span> */}

      </div>
	  <div className={styles.clock}>
		<AnalogClock /> {/* Добавляем часы назад */}
	  </div>
    </header>
  );
};

export default Header;
