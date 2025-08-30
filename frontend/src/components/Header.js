// components/Header.js
import styles from './Header.module.css';
import AnalogClock from './Clock'; // Импортируем компонент часов

const Header = () => {
  // Локальная переменная для демонстрационного пользователя
  const currentUser = {
    username: 'Ваше имя пользователя',
    avatarUrl: '/avatar.jpg', // Убедитесь, что изображение доступно
  };

  return (
    <header className={styles.headerContainer}>
      <div className={styles.logo}>Логотип сайта</div>
      <div className={styles.userInfo}>
        <img src={currentUser.avatarUrl} alt='Аватар' className={styles.avatarImg}/>
        <span className={styles.username}>{currentUser.username}</span>
        <span className={styles.dateTime}>{new Date().toLocaleDateString()}</span>
        <AnalogClock /> {/* Добавляем часы назад */}
      </div>
    </header>
  );
};

export default Header;
