import React from "react";
import { Wallet, List, Bell, User } from "lucide-react";
import "./Layout.css";

const Layout = ({headerContent, mainContent}) => {
  return(
    <div className="container">
      <header className="header">{headerContent}</header>
      <main className="main">{mainContent}</main>
      <footer className="footer">
        <nav className="footer-nav">
          <a href="#" className="nav-item">
            <List className="nav-icon" size={20}/>
            <span className="nav-label">履歴</span>
          </a>
          <a href="#" className="nav-item">
            <Wallet className="nav-icon" size={20}/>
            <span className="nav-label">予算</span>
          </a>
          <a href="#" className="nav-item">
            <Bell className="nav-icon" size={20}/>
            <span className="nav-label">通知</span>
          </a>
          <a href="#" className="nav-item">
            <User className="nav-icon" size={20}/>
            <span className="nav-label">マイページ</span>
            </a>
        </nav>
      </footer>
    </div>
  );
}

export default Layout;