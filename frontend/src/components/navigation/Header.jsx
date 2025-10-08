// components/Header.jsx
import styles from '../styles/Header.module.css';
import AnalogClock from './Clock'; // Импортируем компонент часов
import Image from 'next/image'; // Подключаем компонент Image
import Modal from './Modal'; // Модальное окно
import RegisterForm from './RegisterForm'; // Форма регистрации
import { useState } from 'react'; // ⚡️ ДОБАВИЛИ USESTATE

const Header = ({ currentUser }) => {
  const [showLoginModal, setShowLoginModal] = useState(false); // Управление модальным окном

  const toggleLoginModal = () => {
    setShowLoginModal(prevState => !prevState);
  };

  return (
    <header className={styles.headerContainer}>
      <div className={styles.logo}>АПД Табель</div>

      <div className={styles.avatarImg}>
        {currentUser ? (
          <Image
            src={currentUser.avatarUrl || '/default_avatar.jpg'}
            alt="Аватар"
            width={50}
            height={50}
            quality={75}
          />
        ) : (
          <button onClick={toggleLoginModal} className={styles.loginButton}>
            Вход
          </button>
        )}
      </div>

      <div className={styles.userInfo}>
        {currentUser && <span className={styles.username}>{currentUser.username}</span>}
      </div>

      <div className={styles.clock}>
        <AnalogClock />
      </div>

      {/* Открытие модального окна регистрации */}
      <Modal open={showLoginModal} onClose={toggleLoginModal}>
        <h2 className={styles.h2}>Форма регистрации</h2>
        <RegisterForm />
      </Modal>
    </header>
  );
};

export default Header;
