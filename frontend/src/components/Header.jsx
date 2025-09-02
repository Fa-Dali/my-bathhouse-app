// components/Header.js
import styles from '../styles/Header.module.css'
import AnalogClock from './Clock'; // Импортируем компонент часов
import Image from 'next/image'; // Подключаем компонент Image

const Header = () => {
  // Локальная переменная для демонстрационного пользователя
  const currentUser = {
    username: 'Сергей Фадеев',
    avatarUrl: '/avatar.jpg', // Убедитесь, что изображение доступно
  };

  return (
    <header className={styles.headerContainer}>
      <div className={styles.logo}>АПД Табель</div>

	  <div className={styles.avatarImg}>
		<Image
          src={currentUser.avatarUrl}
          alt='Аватар'
        //   className={styles.avatarImg}
          width={50} // Установлена ширина
          height={50} // Установлена высота
          quality={75} // Качество изображения
        />
	  </div>

      <div className={styles.userInfo}>

        <span className={styles.username}>{currentUser.username}</span>

      </div>



	  <div className={styles.clock}>
		<AnalogClock /> {/* Добавляем часы назад */}
	  </div>

    </header>
  );
};

export default Header;
