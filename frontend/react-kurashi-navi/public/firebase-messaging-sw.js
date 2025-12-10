importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

// Firebase 初期化
firebase.initializeApp({
  apiKey: "AIzaSyDtjnrrDg2MKCL1pWxXJ7_m3x14N8OCbts",
  projectId: "pushnotification-4ebe3",
  messagingSenderId: "843469470605",
  appId: "1:843469470605:web:94356b50ab8c7718021bc4"
});

const messaging = firebase.messaging();

// FCMのバックグラウンド通知
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "通知";
  const options = {
    body: payload.notification?.body || "",
    data: {
      url: payload.data?.url || "/",
    },
  };

  self.registration.showNotification(title, options);
});

// pushイベントもサポート
self.addEventListener("push", function (event) {
  const payload = event.data?.json() || {};
  const title = payload.notification?.title || payload.data?.title || "通知";
  const options = {
    body: payload.notification?.body || payload.data?.body || "",
    data: { url: payload.data?.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 通知クリック処理
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(clients.openWindow(url));
});
