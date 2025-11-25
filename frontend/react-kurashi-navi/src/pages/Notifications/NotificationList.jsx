import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from '../../styles/Notifications/NotificationList.module.css';
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import { CircleAlert } from 'lucide-react';

function NotificationList() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("userinfo");
    const [isAdding, setIsAdding] = useState(false);

    const [productName, setProductName] = useState("");
    const [intervalDays, setIntervalDays] = useState('');
    const [error, setError] = useState('');
    const [notifications, setNotifications] = useState([]);
    const userId = sessionStorage.getItem("userId");

    // 今日の日付を取得
    const getToday = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today;
    };

    // API から通知データを取得
    const fetchNotifications = async () => {
        try {
            const res = await fetch("https://t08.mydns.jp/kakeibo/public/api/notification", { headers: { "X-User-ID": userId } });
            const data = await res.json();

            if (res.ok && data.status === 'success') {
                const normalized = data.notifications.map(n => ({
                    id: n.ID ?? n.id,
                    productName: n.PRODUCT_NAME ?? n.product_name ?? '不明',
                    intervalDays: Number(n.NOTIFICATION_PERIOD ?? n.notification_period ?? 0),
                    createdAt: n.NOTIFICATION_TIMESTAMP
                        ? new Date(n.NOTIFICATION_TIMESTAMP.replace(" ", "T"))
                        : getToday()
                }));
                setNotifications(normalized);
            } else if (res.status === 404 && data.message === "no records found") {
                setNotifications([]);
            } else {
                console.error("通知取得エラー:", data);
                setError(data.message || "通知取得エラー");
            }
        } catch (e) {
            console.error("通知取得エラー", e);
            setError("通信エラーが発生しました");
        }
    };

    useEffect(() => { fetchNotifications(); }, []);

    // 新規追加処理
    const handleSave = async () => {
        if (!productName) return setError('商品名を入力してください');
        if (!intervalDays || isNaN(intervalDays)) return setError('補充間隔に数字を入力してください');

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
                    notification_hour: 9,
                    notification_min: 0
                })
            });
            const data = await res.json();
            if (res.ok && data.status === 'success') {
                fetchNotifications();
                setIsAdding(false);
                setProductName('');
                setIntervalDays('');
                setError('');
            } else {
                setError(data.message || '追加失敗');
            }
        } catch (e) {
            console.error(e);
            setError('通信エラー');
        }
    };

    // 削除処理
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
            if (res.ok && data.status === 'success') fetchNotifications();
            else console.error(data);
        } catch (e) { console.error(e); }
    };

    // 補充処理
    const handleRefilled = async (item, index) => {
        const todayDate = new Date();
        todayDate.setSeconds(todayDate.getSeconds() + Math.random());

        // フロント側即時更新
        setNotifications(prev =>
            prev.map((n, i) => i === index ? { ...n, createdAt: todayDate } : n)
        );

        try {
            const res = await fetch(`https://t08.mydns.jp/kakeibo/public/api/notification`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-ID": userId,
                    "X-Notification-ID": item.id
                },
                body: JSON.stringify({
                    notification_period: item.intervalDays,
                    notification_enable: 1,
                    created_at: todayDate.toISOString(),
                    notification_hour: 9,
                    notification_min: 0
                })
            });

            if (!res.ok) console.error("補充更新エラー");

            // DB反映後に通知を再取得
            fetchNotifications();
        } catch (e) {
            console.error(e);
        }
    };


    const headerContent = (
        <TabButton tabs={[{ id: "userinfo", label: "通知", icon: null }]} activeTab={activeTab} onTabChange={setActiveTab} />
    );

    const mainContent = (
        <div className={styles['notification-list']}>
            {isAdding ? (
                <div className={styles.addForm}>
                    <label className={styles.label}>
                        商品名:
                        <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="商品名を入力" />
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
                    {error && <p style={{ color: 'red', marginTop: '4px' }}>{error}</p>}
                    <div className={styles.buttonGroup}>
                        <button className={styles.save} onClick={handleSave}>保存</button>
                        <button className={styles.cancel} onClick={() => { setIsAdding(false); setError(''); setProductName(''); setIntervalDays(''); }}>キャンセル</button>
                    </div>
                </div>
            ) : (
                <>
                    {notifications.length === 0 ? (
                        <p className={styles.p}>まだ通知はありません。追加しましょう！</p>
                    ) : (
                        <ul className={styles.notificationList}>
                            {notifications.map((item, index) => {
                                const lastRefill = new Date(item.createdAt);
                                lastRefill.setHours(0, 0, 0, 0);

                                const nextRefill = new Date(lastRefill);
                                nextRefill.setDate(nextRefill.getDate() + item.intervalDays);

                                const today = getToday();

                                const remainingDaysRaw = (nextRefill - today) / (1000 * 60 * 60 * 24);
                                const remainingDays = Math.ceil(remainingDaysRaw);

                                const progressPercent = Math.min(Math.max(((item.intervalDays - remainingDaysRaw) / item.intervalDays) * 100, 0), 100);

                                const replenishDateString = `${nextRefill.getFullYear()}/${nextRefill.getMonth() + 1}/${nextRefill.getDate()}`;

                                return (
                                    <li key={item.id} className={styles.notificationItem}>
                                        <div className={styles.notificationWrapper}>
                                            <div className={styles.verticalBar}></div>
                                            <div className={styles.notificationContent}>
                                                <span className={styles.date}>予定補充日: <strong>{replenishDateString}</strong></span><br />
                                                <span className={styles.product}><strong>「{item.productName}」</strong></span><br />

                                                {remainingDays < 0 ? (
                                                    <span className={styles.soon}>
                                                        <CircleAlert color="red" /> 補充日が過ぎました！すぐに補充してください！
                                                    </span>
                                                ) : remainingDays === 0 ? (
                                                    <span className={styles.today}>
                                                        <CircleAlert color="red" /> 補充日です！！
                                                    </span>
                                                ) : remainingDays <= 3 ? (
                                                    <span className={styles.soon}>
                                                        <CircleAlert color="#FFC107" /> まもなく、補充目安日になります！！
                                                    </span>
                                                ) : (
                                                    <span className={styles.normal}>補充目安日の候補期間に入ります。</span>
                                                )}

                                                <div className={styles.progressBar}>
                                                    <div className={styles.progressFill} style={{ width: `${progressPercent}%` }}></div>
                                                </div>

                                                <div>
                                                    <p>【相場価格】</p>
                                                    <button
                                                        className={styles.syosai}
                                                        onClick={() => navigate(`/priceInfo/${encodeURIComponent(item.productName)}`)}
                                                    >
                                                        ➡詳しく見る
                                                    </button>
                                                </div>

                                                <span className={styles.remaining}>
                                                    あと <strong>{remainingDays}</strong> 日 （1回 / {item.intervalDays} 日）
                                                </span>
                                                <div className={styles.refilledDelete}>
                                                    <button
                                                        className={styles.refilled}
                                                        onClick={() => handleRefilled(item, index)}
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
                    <button className={styles.tsuika} onClick={() => setIsAdding(true)}>追加</button>
                </>
            )}
        </div>
    );

    return <Layout headerContent={headerContent} mainContent={mainContent} />;
}

export default NotificationList;