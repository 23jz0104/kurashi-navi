import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../styles/login/Log.module.css";
import TabButton from "../../components/common/TabButton";
import { EyeOff, Eye, TrendingUp, CircleAlert, Mail, Lock } from "lucide-react";
import Layout from "../../components/common/Layout";
import SubmitButton from "../../components/common/SubmitButton";

function Log() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(() => {
    return sessionStorage.getItem("lastEmail") || "";
  });

  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
      setIsLoading(true);
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

      navigate("/history");
    } catch (error) {
      console.error("通信エラー:", error);
      setErrorMessage("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout 
      headerContent={
        <TabButton 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      }input-wrapper
      mainContent={
        <div className={styles["main-container"]}>
          <div className={styles["main-inner"]}>
            <div className={styles["main-header"]}>
              <TrendingUp size={28} className={styles["header-icon"]}/>
              <h1>くらしナビ</h1>
            </div>
            <div className={styles["input-section"]}>
              <div className={styles["input-wrapper"]}>
                <span className={styles["icon"]}><Mail size={16} /></span> 
                <input 
                  type="email"
                  placeholder="メールアドレス" 
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  className={styles["input-field"]}
                  />
              </div>

              <div className={styles["input-wrapper"]}>
                <span className={styles["icon"]}><Lock size={16}/></span>
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="パスワード"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  className={styles["input-field"]}
                />
                <span
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={styles["eye-icon"]}
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </span>
              </div>

              <button className={styles["forgot-password"]}>パスワードを忘れた方</button>

              <SubmitButton 
                onClick={handleLogin}
                text={isLoading ? "ログイン中..." : "ログイン"}
                disabled={isLoading}
              />
              {errorMessage && (
                <div className={styles["error-container"]}>
                  <span className={styles["error-icon"]}><CircleAlert size={16} /></span>
                  <p>{errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      }
      hideNavigation={true}
    />
  );
}

export default Log;