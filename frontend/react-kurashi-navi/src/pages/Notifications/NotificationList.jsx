import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from '../../styles/Notifications/NotificationList.module.css';
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import { CircleAlert } from 'lucide-react';

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
      const res = await fetch("https://t08.mydns.jp/kakeibo/public/api/notification", {
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
          const createdAt = n.NOTIFICATION_TIMESTAMP
            ? new Date(n.NOTIFICATION_TIMESTAMP + " UTC")
            : getToday();

          const interval = Number(n.NOTIFICATION_PERIOD ?? n.notification_period ?? 0);

          const nextRefill = new Date(createdAt);
          nextRefill.setDate(nextRefill.getDate() + interval);

          return {
            id: n.ID ?? n.id,
            productName: n.PRODUCT_NAME ?? n.product_name ?? '不明',
            intervalDays: interval,
            createdAt: createdAt,
            nextRefillDate: nextRefill,
            notificationHour: Number(n.NOTIFICATION_HOUR ?? n.notification_hour ?? 9),
            originalTimestamp: n.NOTIFICATION_TIMESTAMP ?? n.notification_timestamp
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
    if (!productName) return setError('商品名を入力してください');
    if (!intervalDays || isNaN(intervalDays)) return setError('補充間隔に数字を入力してください');

    const alreadyExists = notifications.some(n => n.productName === productName);
    if (alreadyExists) {
      return setError('同じ商品は既に登録されています');
    }

    try {
      const res = await fetch("https://t08.mydns.jp/kakeibo/public/api/notification", {
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

      if (res.ok && data.status === 'success') {
        fetchNotifications();
        setIsAdding(false);
        setProductName('');
        setIntervalDays('');
        setNotificationHour(9);
        setError('');
      } else {
        setError(data.message || '追加失敗');
      }
    } catch (e) {
      setError('通信エラー');
    }
  };

  // 通知削除
  const handleDelete = async (id) => {
    try {
      const res = await fetch("https://t08.mydns.jp/kakeibo/public/api/notification", {
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
    try {
      const res = await fetch("https://t08.mydns.jp/kakeibo/public/api/notification", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": userId,
          "X-Notification-ID": item.id
        },
        body: JSON.stringify({
          notification_enable: 1,
          notification_period: item.intervalDays,
          notification_hour: item.notificationHour,
          notification_min: 0
        })
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        setNotifications(prev =>
          prev.map(n =>
            n.id === item.id
              ? {
                  ...n,
                  originalTimestamp: data.notification.NOTIFICATION_TIMESTAMP,
                  intervalDays: data.notification.NOTIFICATION_PERIOD
                }
              : n
          )
        );
        fetchNotifications();
      } else {
        console.error("更新失敗:", data.message);
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

                const scheduledDate = new Date(item.originalTimestamp);
                scheduledDate.setHours(0, 0, 0, 0);

                const remainingDays = Math.ceil(
                  (scheduledDate - today) / (1000 * 60 * 60 * 24)
                );

                const daysPassed = Math.max(item.intervalDays - remainingDays, 0);

                const progressPercent = Math.min(
                  (daysPassed / item.intervalDays) * 100,
                  100
                );

                return (
                  <li key={item.id} className={styles.notificationItem}>
                    <div className={styles.notificationWrapper}>
                      <div className={styles.verticalBar}></div>

                      <div className={styles.notificationContent}>
                        <span className={styles.date}>
                          予定補充日: <strong>{scheduledDate.toLocaleDateString()}</strong>
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
