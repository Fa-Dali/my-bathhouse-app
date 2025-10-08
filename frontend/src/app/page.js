// app/page.js
'use client'

import Head from 'next/head';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Main from '../components/Main';
import Footer from '../components/Footer';
import styles from '../styles/Page.module.css';
import { useState } from 'react';

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Head>
        <title>Моя баня</title>
        <meta name="description" content="Описание моей бани" />
      </Head>

      <div className={styles.container}>
        <Header />

        <div className={styles.content}>
          <Sidebar className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}/>

          <Main />

          <button
            aria-label="Открыть/закрыть боковую панель"
            onClick={handleToggleSidebar}
            className={styles['open-sidebar-btn']}
          >
            ☰
          </button>
        </div>

        <Footer />
      </div>
    </>
  );
}
