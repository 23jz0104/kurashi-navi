import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import { Undo2 } from "lucide-react";
import styles from "../../styles/MyPages/Setting.module.css";

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
  const getDeviceName = () => {
    const ua = navigator.userAgent || "unknown";

    if (/Windows/i.test(ua)) return "Windows PC";
    if (/Macintosh|Mac OS X/i.test(ua)) return "Mac";
    if (/iPhone/i.test(ua)) {
      const match = ua.match(/OS (\d+)_?(\d+)?/);
      return match ? `iPhone iOS ${match[1]}.${match[2] || 0}` : "iPhone";
    }
    if (/iPad/i.test(ua)) {
      const match = ua.match(/OS (\d+)_?(\d+)?/);
      return match ? `iPad iOS ${match[1]}.${match[2] || 0}` : "iPad";
    }
    if (/Android/i.test(ua)) {
      const match = ua.match(/Android.*; (.+?) Build/);
      return match ? match[1] : "Android";
    }
    return "ブラウザ端末";
  };

  const getFcmToken = () => "dummy-fcm-token-browser";
  const getToday = () => new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // ---------- 端末一覧取得 ----------
  const fetchDevices = async () => {
    if (!userId) return;
    try {
      const res = await fetch(
        "https://t08.mydns.jp/kakeibo/public/api/settings",
        { headers: { "X-User-ID": userId } }
      );

      if (res.ok) {
        const data = await res.json();
        const devicesWithDate = data.map((d) => ({
          ...d,
          registered_date: d.registered_date || getToday(),
        }));
        setDevices(devicesWithDate);
      } else if (res.status === 404) {
        await registerDevice();
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

  // ---------- 端末登録 ----------
  const registerDevice = async () => {
    if (!userId) return;
    const today = getToday();

    try {
      const res = await fetch(
        "https://t08.mydns.jp/kakeibo/public/api/settings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-User-ID": userId },
          body: JSON.stringify({
            device_info: getDeviceName(),
            device_name: getDeviceName(),
            fcm_token: getFcmToken(),
            registered_date: today,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const deviceId = data.device?.ID;

        console.log("保存する deviceId =", deviceId);

        sessionStorage.setItem("currentDeviceId", String(deviceId));

        const newDevice = {
          id: deviceId,
          device_info: getDeviceName(),
          device_notification_enable: "1",
          fcm_token: getFcmToken(),
          registered_date: today,
        };

        setDevices((prev) => [...prev, newDevice]);

      } else if (
        data.message?.includes("already") ||
        data.message?.includes("registered")
      ) {
        fetchDevices();
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
    const oldValue = device.device_notification_enable;
    const newValue = oldValue === "1" ? "0" : "1";

    // UI 反映
    setDevices((prev) =>
      prev.map((d) =>
        d.id === device.id ? { ...d, device_notification_enable: newValue } : d
      )
    );

    try {
      const res = await fetch(
        "https://t08.mydns.jp/kakeibo/public/api/settings",
        {
          method: "PATCH",
          headers: {
            "X-User-ID": userId,
            "X-FCM-Token": device.fcm_token,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        // 失敗 → 元に戻す
        setDevices((prev) =>
          prev.map((d) =>
            d.id === device.id ? { ...d, device_notification_enable: oldValue } : d
          )
        );
        setErrorMessage(data.message || "通知設定更新失敗");
        return;
      }

      // 成功 → ON / OFF のメッセージを分ける
      if (newValue === "1") {
        setSuccessMessage("通知を ON にしました");
      } else {
        setSuccessMessage("通知を OFF にしました");
      }

    } catch (err) {
      console.error(err);
      setErrorMessage("通信エラーが発生しました");

      // 元に戻す
      setDevices((prev) =>
        prev.map((d) =>
          d.id === device.id ? { ...d, device_notification_enable: oldValue } : d
        )
      );
    }
  };


  // ---------- 削除 ----------
  const removeDevice = async (deviceId) => {
    if (!window.confirm("本当に削除しますか？")) return;

    try {
      const res = await fetch(
        "https://t08.mydns.jp/kakeibo/public/api/settings",
        {
          method: "DELETE",
          headers: { "X-User-ID": userId, "X-Device-ID": deviceId },
        }
      );

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        const currentDeviceId = sessionStorage.getItem("currentDeviceId");

        if (deviceId === currentDeviceId) {

          sessionStorage.clear();
          navigate("/log");
        } else {
          //  他の端末なら → 一覧だけ更新
          setSuccessMessage("削除しました");
          setDevices((prev) => prev.filter((d) => d.id !== deviceId));
          console.log("削除したい deviceId =", deviceId);
          console.log("currentDeviceId =", sessionStorage.getItem("currentDeviceId"));

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
          <div className={styles.tableWrapper}>
            <h2>登録端末</h2>

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
                          checked={device.device_notification_enable === '1'}
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
        </div>
      }
    />
  );
}

export default Setting;
