import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/MyPages/MyPage.module.css";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import { Settings, LogOut, ChartBar } from "lucide-react";

function MyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mypage");

  const goToUserInfo = () => navigate("/userinfo");
  const goToStatistics = () => navigate("/statistics");
  const goSetting = () => navigate("/Setting");

  const handleLogout = () => {
    sessionStorage.removeItem("isLoggedIn");
    navigate("/log");
  };

  const tabs = [{ id: "mypage", label: "マイページ", icon: null }];
  const headerContent = <TabButton tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />;

  const mainContent = (
    <div className={styles["flex-list"]}>
      <ul className={styles.ul}>
        <li className={styles.li}>
          <button className={styles.button} onClick={goToUserInfo}>
            <Settings />登録情報
          </button>
        </li>
        <li className={styles.li}>
          <button className={styles.button} onClick={goToStatistics}>
            <ChartBar />統計データ
          </button>
        </li>
        <li className={styles.li}>
          <button className={styles.button} onClick={goSetting}>
            <ChartBar />設定
          </button>
        </li>
        <li className={styles.li}>
          <button className={styles.button} onClick={handleLogout}>
            <LogOut />ログアウト
          </button>
        </li>
      </ul>
    </div>
  );

  return <Layout headerContent={headerContent} mainContent={mainContent} />;
}

export default MyPage;
