import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../styles/login/Log.module.css";
import TabButton from "../../components/common/TabButton";
import { EyeOff, Eye, CircleAlert, Mail, Lock } from "lucide-react";
import Layout from "../../components/common/Layout";
import SubmitButton from "../../components/common/SubmitButton";

function Log() {
  const navigate = useNavigate();
  const location = useLocation();

  // メールアドレスを localStorage から取得
  const [email, setEmail] = useState(() => {
    return localStorage.getItem("lastEmail") || "";
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

  useEffect(() => {
    // 既にログイン済み(sessionStorage)なら遷移
    if (sessionStorage.getItem("isLoggedIn") === "true") {
      navigate("/history");
    }
  }, [navigate]); 

  // 手動ログイン処理 
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

      sessionStorage.removeItem("just_logged_out");
      sessionStorage.setItem("isLoggedIn", "true");
      
      // メールアドレスをlocalStorageに保存
      localStorage.setItem("lastEmail", data.user.email);
      
      const uId = data.user.id || data.user_id;
      // 念のため古い形式も残しておきますが、基本はトークン認証を使います
      sessionStorage.setItem("userId", uId);
      sessionStorage.setItem("user_id", uId);
      
      if (data.token) {
        sessionStorage.setItem("auth_token", data.token);
      }
      else {
        console.warn("トークンが取得できませんでした。");
      }

      if (data.device_id) {
        sessionStorage.setItem("device_id", data.device_id);
      }
      else if (data.user && data.user.device_id) {
        sessionStorage.setItem("device_id", data.user.device_id);
      }

      navigate("/history");
    }
    catch (error) {
      console.error("通信エラー:", error);
      setErrorMessage("通信エラーが発生しました");
    }
    finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); 
      handleLogin();
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
      }
      mainContent={
        <div className={styles["main-container"]}>
          <div className={styles["main-inner"]}>
            <div className={styles["main-header"]}>
              <h1>23JZ - T08</h1>
            </div>
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                handleLogin();
              }} 
              className={styles["input-section"]}
            >
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
                  onKeyDown={handleKeyDown}
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
                  onKeyDown={handleKeyDown}
                  className={styles["input-field"]}
                />
                <span
                  onClick={() => setShowPassword((prev) => !prev)}
                  className={styles["eye-icon"]}
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </span>
              </div>

              <button type="button" className={styles["forgot-password"]}>パスワードを忘れた方</button>

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
            </form>
          </div>
        </div>
      }
      hideNavigation={true}
    />
  );
}

export default Log;