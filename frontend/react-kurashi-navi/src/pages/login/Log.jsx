import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../styles/login/Log.module.css";
import TabButton from "../../components/common/TabButton";
import { EyeOff, Eye } from "lucide-react";

function Log() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(() => {
    return sessionStorage.getItem("lastEmail") || "";
  });

  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

  // PHP と通信してログイン
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage("メールアドレスまたはパスワードが未入力です。");
      return;
    }

    try {
      const res = await fetch("https://t08.mydns.jp/kakeibo/public/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "ログインに失敗しました");
        return;
      }

      sessionStorage.setItem("isLoggedIn", "true");
      sessionStorage.setItem("lastEmail", data.user.email);
      sessionStorage.setItem("userId", data.user.id);
      sessionStorage.setItem("token", data.token);

      navigate("/mypage");
    } catch (error) {
      console.error("通信エラー:", error);
      setErrorMessage("通信エラーが発生しました");
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles["flex-log"]}>
        <TabButton tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      </div>

      <div className={styles["flex-text"]}>
        <div className={styles.inputWrapper}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            className={styles.inputField}
          />
        </div>

        <div className={styles.inputWrapper}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="パスワード"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            className={styles.inputField}
          />
          <span
            className={styles.passwordToggle}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </span>
        </div>

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