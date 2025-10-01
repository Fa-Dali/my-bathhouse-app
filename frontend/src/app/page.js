// app/page.js
"use client";

import Image from "next/image";
import styles from "./page.module.css";
import Header from "../components/Header";
import CalendarWrapper from "../components/CalendarWrapper"; // Календарь
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className="">
          <div className={styles.calendar}>
            <CalendarWrapper />
          </div>
        </div>

        <ol>
          <li>ol === 1 ===</li>
          <li>ol === 2 ===</li>
        </ol>

        <div className={styles.ctas}>
          === 1 ===
        </div>
      </main>

      <footer className={styles.footer}>
        {/* Остальные элементы футера остаются без изменений */}
      </footer>
    </div>
  );
}
