import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from '../../styles/Notifications/NotificationList.module.css';
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import { CircleAlert } from 'lucide-react';
// import { getFcmToken } from "../../firebase";

// 1時間ごとの選択コンポーネント
function NotificationHourSelect({ selectedHour, setSelectedHour }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const options = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${i}:00`
  }));

  const selected = options.find(opt => opt.value === selectedHour);

  const handleSelect = (val) => {
    setSelectedHour(val);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target))
        setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.categorySelectWrapper} ref={wrapperRef}>
      <div
        className={styles.selectedCategory}
        onClick={() => setIsOpen(prev => !prev)}
      >
        <span className={`${styles.selectedText} ${!selected ? styles.unselected : ""}`}>
          {selected ? selected.label : "通知する時間を選択"}
        </span>
        <span className={styles.arrow}>▾</span>
      </div>

      {isOpen && (
        <div className={styles.dropdownList}>
          {options.map(opt => (
            <div
              key={opt.value}
              className={styles.dropdownItem}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("userinfo");
  const [isAdding, setIsAdding] = useState(false);
  const [productName, setProductName] = useState("");
  const [intervalDays, setIntervalDays] = useState('');
  const [notificationHour, setNotificationHour] = useState(9);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState([]);

  const userId = sessionStorage.getItem("userId");

  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // 通知ON/OFF切り替え
  const handleToggleNotification = async (item) => {
    const newValue = item.enabled ? 0 : 1;

    setNotifications(prev =>
      prev.map(n =>
        n.id === item.id ? { ...n, enabled: newValue === 1 } : n
      )
    );

    try {
      const res = await fetch("/api/notification", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": userId,
          "X-Notification-ID": item.id
        },
        body: JSON.stringify({ notification_enable: newValue })
      });

      const data = await res.json();
      if (!res.ok || data.status !== "success") {
        console.error("更新失敗:", data.message);
      }
    } catch (e) {
      console.error("通信エラー:", e);
    }
  };

  // 通知取得
  const fetchNotifications = async () => {
    try {
      const res = await fetch("https://t08.mydns.jp/kakeibo/public/api/notification", {
        headers: { "x-user-id": userId }
      });
      const data = await res.json();

      if (res.ok && data.status === 'success') {
        const normalized = data.notifications.map(n => {
          const timestamp = n.NOTIFICATION_TIMESTAMP ?? n.notification_timestamp;

          const resetDay = timestamp
            ? new Date(timestamp.replace(" ", "T"))
            : getToday();

          resetDay.setHours(0, 0, 0, 0);

          const interval = Number(n.NOTIFICATION_PERIOD ?? n.notification_period ?? 0);

          const scheduled = new Date(resetDay);
          scheduled.setDate(scheduled.getDate() + interval);

          return {
            id: n.ID ?? n.id,
            productName: n.PRODUCT_NAME ?? n.product_name ?? '不明',
            intervalDays: interval,
            resetDay: resetDay,
            scheduledDate: scheduled,
            enabled: Number(n.NOTIFICATION_ENABLE ?? n.notification_enable) === 1,
            notificationHour: Number(n.NOTIFICATION_HOUR ?? n.notification_hour ?? 9)
          };
        });

        setNotifications(normalized);
      } else if (res.status === 404 && data.message === "no records found") {
        setNotifications([]);
      } else {
        setError(data.message || "通知取得エラー");
      }
    } catch (e) {
      setError("通信エラーが発生しました");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 通知追加
  const handleSave = async () => {
    // 1. バリデーション
    if (!productName) return setError('商品名を入力してください');

    try {
      // ▼▼▼ 追加: Firebaseトークン送信（失敗しても商品は追加する） ▼▼▼
      try {
        const fcmToken = await getFcmToken();
        if (fcmToken) {
          const settingsRes = await fetch("/api/settings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-User-ID": userId
            },
            body: JSON.stringify({
              fcm_token: fcmToken,
              device_info: navigator.userAgent,
              device_name: "PC Browser"
            })
          });

          // 既に登録済み(400)でもOKとする
          if (!settingsRes.ok && settingsRes.status !== 400) {
            console.warn("トークン保存に失敗しましたが続行します");
          }
        }
      } catch (tokenError) {
        // トークン取得や送信のエラーは無視して商品追加へ進む
        console.error("トークン処理エラー(無視):", tokenError);
      }
      // ▲▲▲ ここまで ▲▲▲

      // 3. 本来の商品追加処理（NOTIFICATIONSテーブルへの保存）
      const res = await fetch("/api/notification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": userId
        },
        body: JSON.stringify({
          product_name: productName,
          notification_period: Number(intervalDays),
          notification_hour: notificationHour,
          notification_min: 0
        })
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        fetchNotifications();
        setIsAdding(false);
        setProductName("");
        setIntervalDays("");
        setNotificationHour(9);
        setError("");
      } else {
        setError(data.message || "追加失敗");
      }
    } catch (e) {
      console.error(e);
      setError("通信エラー");
    }
  };

  // 通知削除
  const handleDelete = async (id) => {
    try {
      const res = await fetch("/api/notification", {
        method: "DELETE",
        headers: {
          "X-User-ID": userId,
          "X-Notification-ID": id
        }
      });

      const data = await res.json();

      if (res.ok && data.status === 'success') {
        fetchNotifications();
      } else {
        console.error(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 補充ボタン
  const handleRefilled = async (item) => {
    // 今日（0時固定）
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 次回補充予定日 = 今日 + intervalDays
    const nextResetDay = new Date(today);
    nextResetDay.setDate(today.getDate() + item.intervalDays);

    const baseDays = Math.max(
      Math.ceil((nextResetDay - today) / (1000 * 60 * 60 * 24)),
      1
    );

    // 進捗バー用の基準日数を保存
    localStorage.setItem(`progressBase_${item.id}`, baseDays);

    try {
      const res = await fetch(
        "https://t08.mydns.jp/kakeibo/public/api/notification",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": userId,
            "X-Notification-ID": item.id
          },
          body: JSON.stringify({
            notification_enable: 1,
            notification_period: item.intervalDays,
            reset_day: nextResetDay.toISOString()
          })
        }
      );

      if (res.ok) {
        fetchNotifications();
      }
    } catch (e) {
      console.error("通信エラー:", e);
    }
  };

  const headerContent = (
    <TabButton
      tabs={[{ id: "userinfo", label: "通知", icon: null }]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );

  const mainContent = (
    <div className={styles['notification-list']}>
      {isAdding ? (
        <div className={styles.addForm}>
          <label className={styles.label}>
            商品名:
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="商品名を入力"
            />
          </label>

          <label className={styles.label}>
            補充間隔（日）:
            <input
              type="text"
              value={intervalDays}
              onChange={(e) => setIntervalDays(e.target.value.replace(/\D/g, ''))}
              placeholder="数字を入力"
            />
          </label>

          <label className={styles.label}>
            通知する時間帯指定:
            <NotificationHourSelect
              selectedHour={notificationHour}
              setSelectedHour={setNotificationHour}
            />
          </label>

          {error && <p style={{ color: 'red', marginTop: '4px' }}>{error}</p>}

          <div className={styles.buttonGroup}>
            <button className={styles.save} onClick={handleSave}>
              保存
            </button>
            <button
              className={styles.cancel}
              onClick={() => {
                setIsAdding(false);
                setError('');
                setProductName('');
                setIntervalDays('');
                setNotificationHour(9);
              }}
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <>
          {notifications.length === 0 ? (
            <p className={styles.p}>まだ通知はありません。追加しましょう！</p>
          ) : (
            <ul className={styles.notificationList}>
              {notifications.map((item) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const scheduledDate = new Date(item.resetDay);
                scheduledDate.setHours(0, 0, 0, 0);

                const remainingDays = Math.ceil(
                  (scheduledDate - today) / (1000 * 60 * 60 * 24)
                );

                // localStorage から取得
                const storedBaseDays = Number(
                  localStorage.getItem(`progressBase_${item.id}`)
                );

                let baseDays =
                  !storedBaseDays || storedBaseDays < remainingDays
                    ? remainingDays
                    : storedBaseDays;

                // 0・負数防止
                if (baseDays <= 0) {
                  baseDays = item.intervalDays > 0 ? item.intervalDays : 1;
                }

                // 補正後を保存
                localStorage.setItem(`progressBase_${item.id}`, baseDays);

                let progressPercent;
                if (remainingDays <= 0) {
                  progressPercent = 100;
                } else {
                  progressPercent = Math.max(
                    0,
                    Math.min(((baseDays - remainingDays) / baseDays) * 100, 100)
                  );

                  // console.log({
                  //   id: item.id,
                  //   product: item.productName,
                  //   today: today.toISOString().slice(0, 10),
                  //   scheduledDate: scheduledDate.toISOString().slice(0, 10),
                  //   remainingDays,
                  //   storedBaseDays,
                  //   baseDays,
                  //   progressPercent
                  // });
                }

                return (
                  <li key={item.id} className={styles.notificationItem}>
                    <div className={styles.notificationWrapper}>
                      <div className={styles.verticalBar}></div>

                      <div className={styles.notificationContent}>
                        <span className={styles.date}>
                          予定補充日:{" "}
                          <strong>{scheduledDate.toLocaleDateString()}</strong>
                          {"　"}時間帯指定:
                          <strong>{item.notificationHour}:00</strong>
                        </span>
                        <br />

                        <span className={styles.product}>
                          <strong>「{item.productName}」</strong>
                        </span>
                        <br />

                        <label className={styles.switch}>
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={() => handleToggleNotification(item)}
                          />
                          <span className={styles.slider}></span>
                        </label>

                        {remainingDays < 0 ? (
                          <span className={styles.soon}>
                            <CircleAlert color="red" />
                            補充日が過ぎました！すぐに補充してください！
                          </span>
                        ) : remainingDays === 0 ? (
                          <span className={styles.today}>
                            <CircleAlert color="red" />
                            補充日です！！
                          </span>
                        ) : remainingDays <= 3 ? (
                          <span className={styles.soon}>
                            <CircleAlert color="#FFC107" />
                            まもなく、補充目安日になります！！
                          </span>
                        ) : (
                          <span className={styles.normal}>
                            補充目安日の候補期間に入ります。
                          </span>
                        )}

                        {/* 進捗バー */}
                        <div className={styles.progressBar}>
                          <div
                            className={styles.progressFill}
                            style={{ width: `${progressPercent}%` }}
                          ></div>
                        </div>

                        <div>
                          <p>【相場価格】</p>
                          <button
                            className={styles.syosai}
                            onClick={() =>
                              navigate(`/priceInfo/${encodeURIComponent(item.productName)}`)
                            }
                          >
                            ➡詳しく見る
                          </button>
                        </div>

                        <span className={styles.remaining}>
                          あと <strong>{remainingDays}</strong> 日（1回 / {item.intervalDays} 日）
                        </span>

                        <div className={styles.refilledDelete}>
                          <button
                            className={styles.refilled}
                            onClick={() => handleRefilled(item)}
                          >
                            補充した
                          </button>
                          <button
                            className={styles.delete}
                            onClick={() => handleDelete(item.id)}
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <button className={styles.tsuika} onClick={() => setIsAdding(true)}>
            追加
          </button>
        </>
      )}
    </div>
  );

  return <Layout headerContent={headerContent} mainContent={mainContent} />;
}

export default NotificationList;
