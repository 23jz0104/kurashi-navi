import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../../styles/login/Log.module.css";
import TabButton from "../../components/common/TabButton";
import { EyeOff, Eye, CircleAlert, Mail, Lock } from "lucide-react";
import Layout from "../../components/common/Layout";
import SubmitButton from "../../components/common/SubmitButton";

// Firebase 関連のインポート 
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

//  Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyDtjnrrDg2MKCL1pWxXJ7_m3x14N8OCbts",
  authDomain: "pushnotification-4ebe3.firebaseapp.com",
  projectId: "pushnotification-4ebe3",
  storageBucket: "pushnotification-4ebe3.firebasestorage.app",
  messagingSenderId: "843469470605",
  appId: "1:843469470605:web:94356b50ab8c7718021bc4"
};
const app = initializeApp(firebaseConfig);

function Log() {
  const navigate = useNavigate();
  const location = useLocation();

  // メールアドレスを localStorage から取得 (ログアウト後も保持するため)
  const [email, setEmail] = useState(() => {
    return localStorage.getItem("lastEmail") || "";
  });

  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAutoLogin, setIsCheckingAutoLogin] = useState(true);

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

  //  自動ログイン処理 
  const autoLoginByDevice = async () => {
    try {
      const registration = await navigator.serviceWorker.register(
        "/combine_test/firebase-messaging-sw.js"
      );

      const messaging = getMessaging(app);
      const token = await getToken(messaging, {
        vapidKey: "BH3VSel6Cdam2EREeJ9iyYLoJcOYpqGHd7JXULxSCmfsULrVMaedjv81VF7h53RhJmfcHCsq-dSoJVjHB58lxjQ",
        serviceWorkerRegistration: registration
      });

      if (token) {
        localStorage.setItem("fcm_token", token);
      }

      if (!token) {
        setIsCheckingAutoLogin(false);
        return;
      }

      const res = await fetch(
        "https://t08.mydns.jp/kakeibo/public/api/settings", 
        {
          headers: { "X-FCM-TOKEN": token }
        }
      );

      if (!res.ok) {
        setIsCheckingAutoLogin(false);
        return;
      }

      const data = await res.json();

      if (data.mode === "device_login") {
        console.log("自動ログイン成功");
        
        sessionStorage.setItem("isLoggedIn", "true");
        sessionStorage.setItem("userId", data.user_id); 
        sessionStorage.setItem("user_id", data.user_id); 
        
        const devId = data.device_id || data.currentDeviceId;
        sessionStorage.setItem("device_id", devId);
        sessionStorage.setItem("currentDeviceId", devId);

        navigate("/history");
        return;
      }

    } catch (err) {
      console.error("自動ログインチェック失敗:", err);
    } finally {
      setIsCheckingAutoLogin(false);
    }
  };

  //  初回レンダリング時の処理
  useEffect(() => {
    const isJustLoggedOut = sessionStorage.getItem("just_logged_out");

    if (isJustLoggedOut === "true") {
      // console.log("ログアウト直後のため、自動ログイン処理をスキップします。");
      // ここではフラグを消さない(Reactの2回レンダリング対策)
      setIsCheckingAutoLogin(false);
      return; 
    }

    if (sessionStorage.getItem("isLoggedIn") === "true") {
      navigate("/history");
    } else {
      autoLoginByDevice();
    }
  }, []); 

  //  手動ログイン処理 
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

      // console.log("手動ログイン成功:", data);

      sessionStorage.removeItem("just_logged_out");

      sessionStorage.setItem("isLoggedIn", "true");
      
      // メールアドレスを localStorage に保存
      localStorage.setItem("lastEmail", data.user.email);
      
      const uId = data.user.id || data.user_id;
      sessionStorage.setItem("userId", uId);
      sessionStorage.setItem("user_id", uId);
      
      if (data.token) {
        sessionStorage.setItem("token", data.token);
      }

      if (data.device_id) {
        sessionStorage.setItem("device_id", data.device_id);
      } else if (data.user && data.user.device_id) {
        sessionStorage.setItem("device_id", data.user.device_id);
      }

      navigate("/history");
    } catch (error) {
      console.error("通信エラー:", error);
      setErrorMessage("通信エラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // フォームのデフォルト送信を防ぐ
      handleLogin();
    }
  };

  if (isCheckingAutoLogin) {
    return (
      <Layout
        headerContent={<div style={{height: "50px"}}></div>} 
        mainContent={
          <div className={styles["main-container"]}>
             <div style={{ textAlign: "center", marginTop: "50px", color: "#666" }}>
                <p>ログインを確認中...</p>
             </div>
          </div>
        }
        hideNavigation={true}
      />
    );
  }

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
              <h1>くらしナビ(仮)</h1>
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