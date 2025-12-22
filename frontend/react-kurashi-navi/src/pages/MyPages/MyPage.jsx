import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/MyPages/MyPage.module.css";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import { Settings, LogOut, ChartBar, UserPen } from "lucide-react";

function MyPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mypage");

  const goToUserInfo = () => navigate("/userinfo");
  const goToStatistics = () => navigate("/statistics");
  const goSetting = () => navigate("/Setting");

  const handleLogout = async () => {
    // 1. 各種IDを取得
    const userId = sessionStorage.getItem("user_id") || localStorage.getItem("user_id");
    const deviceId = sessionStorage.getItem("device_id") || localStorage.getItem("device_id");
    // FCMトークンも取得
    const fcmToken = sessionStorage.getItem("fcm_token") || localStorage.getItem("fcm_token");

    // 2. サーバー削除リクエスト 
    if (userId) {
      try {
        await fetch("https://t08.mydns.jp/kakeibo/public/api/settings", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": userId,
            "X-Device-ID": deviceId || "", // nullなら空文字を送る
            "X-FCM-TOKEN": fcmToken || ""  // トークンでも削除できるようにする
          },
        });
        console.log("削除リクエスト送信完了");
      } catch (error) {
        console.error("削除エラー（でも強制ログアウトします）", error);
      }
    }

    // 自動ログイン再発防止のフラグを立てる
    sessionStorage.setItem("just_logged_out", "true"); 

    // 4. その他の情報を削除
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("user_id");
    sessionStorage.removeItem("device_id");
    localStorage.removeItem("user_id");
    localStorage.removeItem("device_id");

    navigate("/log");
  };

  const tabs = [{ id: "mypage", label: "マイページ", icon: null }];
  const headerContent = <TabButton tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />;

  const mainContent = (
    <div className={styles["flex-list"]}>
      <ul className={styles.ul}>
        <li className={styles.li}>
          <button className={styles.button} onClick={goToUserInfo}>
            <UserPen />登録情報
          </button>
        </li>
        <li className={styles.li}>
          <button className={styles.button} onClick={goToStatistics}>
            <ChartBar />統計データ
          </button>
        </li>
        <li className={styles.li}>
          <button className={styles.button} onClick={goSetting}>
            <Settings />設定
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