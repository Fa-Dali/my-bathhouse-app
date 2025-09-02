// app/page.js
import Image from "next/image";
import styles from "./page.module.css";
import Header from "../components/Header";
import CalendarWrapper from "../components/CalendarWrapper";
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

          <div className="sidebar">
            <Link href="/register">
              <button className="butt_sidebar">Вход</button>
            </Link>
            <Link href="/register">
              <button className="butt_sidebar">Вход</button>
            </Link>
          </div>

        </div>

        <ol>
          <li>
            ol === 1 ===
          </li>
          <li>
            ol === 2 ===
          </li>
        </ol>

        <div className={styles.ctas}>
          === 1 ===
        </div>

      </main>

      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
