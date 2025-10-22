import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Wallet, List, Bell, User } from "lucide-react";
import styles from "./Layout.module.css";

const Layout = ({ headerContent, mainContent }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className={styles.container}>
      <header className={styles.header}>{headerContent}</header>
      <main className={styles.main}>{mainContent}</main>
      <footer className={styles.footer}>
        <nav className={styles["footer-nav"]}>
          <Link
            to="/history"
            className={`${styles["nav-item"]} ${isActive("/history") ? styles.active : ""}`}
          >
            <List className={styles["nav-icon"]} size={20} />
            <span className={styles["nav-label"]}>履歴</span>
          </Link>

          <Link
            to="/budgetcontrol"
            className={`${styles["nav-item"]} ${isActive("/budgetcontrol") ? styles.active : ""}`}
          >
            <Wallet className={styles["nav-icon"]} size={20} />
            <span className={styles["nav-label"]}>予算</span>
          </Link>

          <Link
            to="/notificationlist"
            className={`${styles["nav-item"]} ${isActive("/notificationlist") ? styles.active : ""}`}
          >
            <Bell className={styles["nav-icon"]} size={20} />
            <span className={styles["nav-label"]}>通知</span>
          </Link>

          <Link
            to="/mypage"
            className={`${styles["nav-item"]} ${isActive("/mypage") ? styles.active : ""}`}
          >
            <User className={styles["nav-icon"]} size={20} />
            <span className={styles["nav-label"]}>マイページ</span>
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default Layout;
