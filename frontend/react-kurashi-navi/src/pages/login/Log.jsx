import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../styles/login/Log.module.css";
import TabButton from "../../components/common/TabButton";

function Log() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const tabs = [
    { id: "login", label: "ログイン", icon: null },
    { id: "signup", label: "新規登録", icon: null },
  ];

  const handleTabChange = (id) => {
    setActiveTab(id);
    if (id === "signup") {
      navigate("/newlog");
    }
  };

  const handleLogin = () => {
    // 認証チェック
    if (email === "23jz0133@jec.ac.jp" && password === "pw123") {
      setErrorMessage("");
      localStorage.setItem("isLoggedIn", "true"); // 認証状態を保存
      navigate("/mypage");
    } else {
      setErrorMessage("メールアドレスまたはパスワードが違います");
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles["flex-log"]}>
        <TabButton tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      <div className={styles["flex-text"]}>
        <input
          type="email"
          name="email"
          placeholder="メールアドレス"
          className={styles["flex-mail"]}
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setErrorMessage("");
          }}
        />

        <input
          type="password"
          name="password"
          placeholder="パスワード"
          className={styles["flex-pass"]}
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrorMessage("");
          }}
        />

        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}

        <button className={styles.sp}>パスワードを忘れた方</button>

        <button className={styles.bt} onClick={handleLogin}>
          ログイン
        </button>
      </div>

      <div className={styles["flex-soko"]}></div>
    </div>
  );
}

export default Log;
