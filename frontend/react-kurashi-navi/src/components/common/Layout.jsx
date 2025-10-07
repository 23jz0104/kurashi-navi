import React from "react";
import { Wallet, List, Bell, User } from "lucide-react";
import styles from "./Layout.module.css";

const Layout = ({headerContent, mainContent}) => {
  return(
    <div className={styles.container}>
      <header className={styles.header}>{headerContent}</header>
      <main className={styles.main}>{mainContent}</main>
      <footer className={styles.footer}>
        <nav className={styles["footer-nav"]}>
          <a href="#" className={styles["nav-item"]}>
            <List className={styles["nav-icon"]} size={20}/>
            <span className={styles["nav-label"]}>履歴</span>
          </a>
          <a href="#" className={styles["nav-item"]}>
            <Wallet className={styles["nav-icon"]} size={20}/>
            <span className={styles["nav-label"]}>予算</span>
          </a>
          <a href="#" className={styles["nav-item"]}>
            <Bell className={styles["nav-icon"]} size={20}/>
            <span className={styles["nav-label"]}>通知</span>
          </a>
          <a href="#" className={styles["nav-item"]}>
            <User className={styles["nav-icon"]} size={20}/>
            <span className={styles["nav-label"]}>マイページ</span>
            </a>
        </nav>
      </footer>
    </div>
  );
}

export default Layout;