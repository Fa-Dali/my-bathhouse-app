// components/Modal.jsx
import { createPortal } from 'react-dom';
import styles from '../styles/global.css'; // Подключаем глобальные стили

const Modal = ({ open, children, onClose }) => {
  if (!open) return null;

  // Блокируем прокрутку основного контента при открытии модального окна
  document.body.style.overflow = 'hidden';

  return createPortal(
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-window">
        <button className="close-button" onClick={onClose}>✖</button>
        {children}
      </div>
    </>,
    document.body
  );
};

// Возвращаем scroll обратно при закрытии модалки
const onCloseHandler = () => {
  document.body.style.overflow = '';
  setShowLoginModal(false);
};

export default Modal;
