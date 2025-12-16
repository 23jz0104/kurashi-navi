import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import { Undo2 } from "lucide-react";
import styles from "../../styles/MyPages/Setting.module.css";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

// ---------- Firebase 設定 ----------
const firebaseConfig = {
  apiKey: "AIzaSyDtjnrrDg2MKCL1pWxXJ7_m3x14N8OCbts",
  authDomain: "pushnotification-4ebe3.firebaseapp.com",
  projectId: "pushnotification-4ebe3",
  storageBucket: "pushnotification-4ebe3.firebasestorage.app",
  messagingSenderId: "843469470605",
  appId: "1:843469470605:web:94356b50ab8c7718021bc4"
};
const app = initializeApp(firebaseConfig);

function Setting() {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");
  const currentDeviceId = sessionStorage.getItem("currentDeviceId");

  const [activeTab, setActiveTab] = useState("devices");
  const [devices, setDevices] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const tabs = [{ id: "devices", label: "設定" }];
  const headerContent = (
    <div style={{ display: "flex", alignItems: "center" }}>
      <button className={styles.modoru} onClick={() => navigate("/mypage")}>
        <Undo2 />
      </button>
      <TabButton tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );

  // ---------- 端末名取得 ----------
  // const getDeviceName = () => {
  //   const ua = navigator.userAgent || "unknown";
  //   if (/Windows/i.test(ua)) return "Windows PC";
  //   if (/Macintosh|Mac OS X/i.test(ua)) return "Mac";
  //   if (/iPhone/i.test(ua)) return "iPhone";
  //   if (/iPad/i.test(ua)) return "iPad";
  //   if (/Android/i.test(ua)) return "Android";
  //   return "ブラウザ端末";
  // };

  // ---------- OS判定 ----------
function getOS() {
  const platform = navigator.platform.toLowerCase();
  const ua = navigator.userAgent.toLowerCase();

  if (/win/.test(platform)) return "Windows";
  if (/mac/.test(platform)) return "Mac";
  if (/iphone|ipad|ipod/.test(ua)) return "iOS";
  if (/android/.test(ua)) return "Android";
  if (/linux/.test(platform)) return "Linux";
  return "Unknown OS";
}

// ---------- ブラウザ判定 ----------
function getBrowser() {
  const ua = navigator.userAgent.toLowerCase();

  if (/chrome|crios/.test(ua) && !/edge|edg|opr/.test(ua)) return "Chrome";
  if (/safari/.test(ua) && !/chrome|crios|opr|edge|edg/.test(ua)) return "Safari";
  if (/firefox/.test(ua)) return "Firefox";
  if (/msie|trident/.test(ua)) return "Internet Explorer";
  if (/edg/.test(ua)) return "Edge";
  if (/opr/.test(ua)) return "Opera";
  return "Unknown Browser";
}

// ---------- デバイス名取得 ----------
function getDeviceName() {
  const os = getOS();
  const browser = getBrowser();
  return `${os} (${browser})`;
}

  const getToday = () => new Date().toISOString().split("T")[0];

  // ---------- 端末一覧取得 ----------
  const fetchDevices = async () => {
    if (!userId) return;
    try {
      const res = await fetch("https://t08.mydns.jp/kakeibo/public/api/settings", {
        headers: { "X-User-ID": userId }
      });
      if (res.ok) {
        const data = await res.json();
        // console.log("端末一覧データ:", data);
        const devicesWithDate = data.map(d => ({
          ...d,
          registered_date: d.registered_date || getToday()
        }));
        setDevices(devicesWithDate);
        console.log("Fetched devices:", devicesWithDate);
        return devicesWithDate;
      } else if (res.status === 404) {
        // 端末未登録でも自動登録はしない
        setDevices([]);
      } else {
        setErrorMessage("端末一覧取得に失敗しました");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("通信エラーが発生しました");
    }
  };

  useEffect(() => {
    fetchDevices();
  }, [userId]);

  <button onClick={() => registerDevice()}>この端末を登録</button>

  // ---------- FCM トークン取得 & 端末登録 ----------
  const registerDevice = async () => {
    if (!userId) return;
    try {
      const registration = await navigator.serviceWorker.register("/combine_test/firebase-messaging-sw.js");
      const messaging = getMessaging(app);
      const token = await getToken(messaging, {
        vapidKey: "BH3VSel6Cdam2EREeJ9iyYLoJcOYpqGHd7JXULxSCmfsULrVMaedjv81VF7h53RhJmfcHCsq-dSoJVjHB58lxjQ",
        serviceWorkerRegistration: registration
      });
      if (!token) throw new Error("FCMトークン取得失敗");
  
      const deviceInfo = getDeviceName();
      const today = getToday();
  
      const res = await fetch("https://t08.mydns.jp/kakeibo/public/api/settings", {
        method: "POST", // 既存なら backend で update
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": userId
        },
        body: JSON.stringify({
          device_info: deviceInfo,
          device_name: deviceInfo,
          fcm_token: token,
          registered_date: today
        })
      });
  
      const data = await res.json().catch(() => ({}));
  
      if (res.ok || data.message?.includes("already")) {
        // 既存端末なら fetchDevices で一覧更新
        await fetchDevices();
        setSuccessMessage("端末登録済み（更新）");
      } else {
        setErrorMessage(data.message || "端末登録失敗");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("通信エラーが発生しました");
    }
  };

  // ---------- 通知切替 ----------
  const toggleNotification = async (device) => {
    console.log("Toggling device:", device.id, "current value:", device.device_notification_enable);
    try {
      const res = await fetch("https://t08.mydns.jp/kakeibo/public/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": userId,
          "X-Setting-ID": device.id
        }
      });
  
      console.log("Toggling device", device.id, "userId", userId);
      const data = await res.json();
      console.log("Response from backend:", data);
  
      if (res.ok && data.status === "success") {
        // ★デバッグログ 1: APIレスポンスの値と型をチェック
        console.log("API New Value:", data.new_value, "Type:", typeof data.new_value); 

        const receivedValue = Number(data.new_value);
        
        // ★デバッグログ 2: Number() 変換後の値と型をチェック
        console.log("Converted Value:", receivedValue, "Type:", typeof receivedValue); 

        setDevices(prev =>
            prev.map(d =>
                d.id === device.id ? 
                { 
                    ...d, 
                    device_notification_enable: receivedValue // 確実な数値（0または1）をセット
                } 
                : d
            )
        );
        
        // ★デバッグログ 3: State更新後の状態をチェック（次回のレンダリング前なので注意）
        console.log("Toggled device ID:", device.id, "Set to:", receivedValue);
        
    } else {
        setErrorMessage(data.message || "通知設定更新失敗");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("通信エラーが発生しました");
    }
  };
  
  // ---------- 削除 ----------
  const removeDevice = async deviceId => {
    if (!window.confirm("本当に削除しますか？")) return;

    try {
      const res = await fetch("https://t08.mydns.jp/kakeibo/public/api/settings", {
        method: "DELETE",
        headers: { "X-User-ID": userId, "X-Device-ID": deviceId }
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (deviceId === sessionStorage.getItem("currentDeviceId")) {
          sessionStorage.clear();
          navigate("/log");
        } else {
          setDevices(prev => prev.filter(d => d.id !== deviceId));
          setSuccessMessage("端末削除成功");
        }
      } else {
        setErrorMessage(data.message || "削除失敗");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("通信エラーが発生しました");
    }
  };

  return (
    <Layout
      headerContent={headerContent}
      mainContent={
        <div className={styles["flex-list"]}>
          <button onClick={registerDevice}>この端末を登録</button>
          <h2>端末管理</h2>
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}          
          <table className={styles.deviceTable}>
            <thead>
              <tr>
                <th>端末名</th>
                <th>登録日</th>
                <th>通知</th>
                <th>削除</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device, index) => (
                <tr key={device.id ?? index}>
                  <td>{device.device_info}</td>
                  <td>{device.registered_date}</td>
                  <td>
                    <label className={styles.switch}>
                      <input
                        type="checkbox"
                        checked={!!device.device_notification_enable}
                        onChange={() => toggleNotification(device)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </td>
                  <td>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => removeDevice(device.id)}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      }
    />
  );
}

export default Setting;
