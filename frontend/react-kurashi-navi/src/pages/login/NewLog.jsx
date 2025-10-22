import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../styles/login/NewLog.module.css";
import TabButton from "../../components/common/TabButton";

function NewLog() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "login", label: "ログイン", icon: null },
    { id: "signup", label: "新規登録", icon: null },
  ];

  const activeTab = location.pathname === "/newlog" ? "signup" : "login";

  const handleTabChange = (id) => {
    if (id === "signup") {
      navigate("/newlog");
    } else {
      navigate("/"); 
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles["flex-log"]}>
        <TabButton tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      <div className={styles.flexText}>
        <div className={styles.inputWrapper}>
          <input type="email" placeholder="メールアドレス" className={styles.flexMail} />
          <span className={styles.required}>*</span>
        </div>

        <div className={styles.inputWrapper}>
          <input type="password" placeholder="パスワード" className={styles.flexPass} />
          <span className={styles.required}>*</span>
        </div>

        <div className={styles.inputWrapper}>
          <input type="date" placeholder="生年月日" className={styles.flexDate} />
          <span className={styles.required}>*</span>
        </div>

        <div className={styles.inputWrapper}>
          <input type="text" placeholder="住所" className={styles.flexAddress} />
          <span className={styles.required}>*</span>
        </div>

        <button className={styles.newBtnLog}>新規登録</button>
      </div>

        <div className={styles["flex-soko"]}></div>
    </div>
  );
}

export default NewLog;
