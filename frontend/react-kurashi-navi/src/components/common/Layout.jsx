import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Wallet, List, Bell, User, Plus, ChevronLeft, MoreVertical, Trash2 } from "lucide-react";
import styles from "./Layout.module.css";

// const Layout = ({ headerContent, mainContent, hideNavigation = false, hideDataInputButton = false, redirectPath, state = null, showKebabMenu = false}) => {
const Layout = ({ headerContent, mainContent, hideNavigation = false, disableDataInputButton = false, redirectPath, state = null, showKebabMenu = false, onDeleteButtonClick}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  // 入力関連ページのチェック
  const isDataInputPage =
  location.pathname === "/dataInput" ||
  location.pathname.startsWith("/dataInput/");

  // 「＋」を無効化
  const isPlusDisabled = disableDataInputButton || isDataInputPage;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {redirectPath && (
          <div className={styles["back-button"]}>
            <ChevronLeft size={20}
             className={styles["icon"]}
              onClick={() => navigate(redirectPath, {state})}
            />
          </div>
        )}
        {headerContent}
        {onDeleteButtonClick && (
          <button className={styles["delete-button"]} onClick={() => onDeleteButtonClick()}>
            <Trash2 size={20} />
          </button>
        )}
      </header>
      <main className={styles.main}>
        {mainContent}
      </main>
      <footer className={styles.footer}>
        <nav className={styles["footer-nav"]}>
          {hideNavigation ? (<></>) : (
            <>
              <Link
                to="/history"
                className={`${styles["nav-item"]} ${isActive("/history") ? styles.active : ""}`}
              >
                <List className={styles["nav-icon"]} size={20} />
                <span className={styles["nav-label"]}>履歴</span>
              </Link>

              <Link
                to="/budget-management"
                className={`${styles["nav-item"]} ${isActive("/budget-management") ? styles.active : ""}`}
              >
                <Wallet className={styles["nav-icon"]} size={20} />
                <span className={styles["nav-label"]}>予算</span>
              </Link>

              {/* 旧「＋」ボタン 
              {!hideDataInputButton && (
                <Link to="/dataInput">
                  <button className={styles["navigate-datainput"]}><Plus size={16} /></button>
                </Link>
              )} */}
              
              {/* 「＋」ボタン: データ入力関連ページであれば無効化 */}
              {isPlusDisabled ? (
                <button
                  className={`${styles["navigate-datainput"]} ${styles.disabled}`}
                  disabled
                  aria-disabled="true"
                >
                  <Plus size={16} />
                </button>
              ) : (
                <Link to="/dataInput">
                  <button className={styles["navigate-datainput"]}>
                    <Plus size={16} />
                  </button>
                </Link>
              )}

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
                <User className={styles["nav-icon"]} size={24} />
                <span className={styles["nav-label"]}>マイページ</span>
              </Link>
            </>
          )}
        </nav>
      </footer>
    </div>
  );
};

export default Layout;
