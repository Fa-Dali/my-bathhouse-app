// components/Sidebar.jsx
import Link from 'next/link';
import styles from '../styles/Sidebar.module.css';

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <nav>
        <ul>
          <li><Link href="/">Главная</Link></li>
          <li><Link href="/about">О нас</Link></li>
          <li><Link href="/contact">Контакты</Link></li>
        </ul>
      </nav>
    </aside>
  )
};

export default Sidebar;
