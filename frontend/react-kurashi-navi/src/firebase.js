// Firebase SDK
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyDtjnrrDg2MKCL1pWxXJ7_m3x14N8OCbts",
  authDomain: "pushnotification-4ebe3.firebaseapp.com",
  projectId: "pushnotification-4ebe3",
  storageBucket: "pushnotification-4ebe3.appspot.com",
  messagingSenderId: "843469470605",
  appId: "1:843469470605:web:94356b50ab8c7718021bc4"
};

// リセット
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

//  Service Worker
export const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Worker だめ");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.log("Service Worker 成功:", registration);
  } catch (err) {
    console.error("Service Worker 失败:", err);
  }
};

//  FCM Token
export const getFcmToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("通知権限なし");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });

    console.log("FCM Token:", token);
    return token;
  } catch (err) {
    console.error("Token 失败:", err);
    return null;
  }
};

// フロント通知
export const onForegroundMessage = (callback) => {
  onMessage(messaging, (payload) => {
    console.log("フロント通知:", payload);
    callback(payload);
  });
};

export default app;
