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

    // テスト用「今日の日付」
    const [mockToday, setMockToday] = useState("");
    useEffect(() => {
        setMockToday("2025-11-22");
    }, []);

    const [notifications, setNotifications] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem("notifications");
        if (saved) setNotifications(JSON.parse(saved));
        else setNotifications([]);
    }, []);


    useEffect(() => {
        if (notifications !== null) {
            localStorage.setItem("notifications", JSON.stringify(notifications));
        }
    }, [notifications]);

    const tabs = [{ id: "userinfo", label: "通知", icon: null }];
    const handleTabChange = (id) => setActiveTab(id);
    const handleAddClick = () => setIsAdding(true);
    const handleCancel = () => {
        setIsAdding(false);
        setProductName('');
        setIntervalDays('');
        setError('');
    };

    const handleIntervalChange = (e) => {
        const val = e.target.value;
        if (/^\d*$/.test(val)) {
            setIntervalDays(val.replace(/^0+/, ''));
            setError('');
        } else {
            setError('数字を入力してください');
        }
    };

    const handleSave = () => {
        if (!productName) {
            setError('商品名を入力してください');
            return;
        }
        if (!intervalDays) {
            setError('補充間隔に数字を入力してください');
            return;
        }
        const newItem = {
            productName,
            intervalDays: Number(intervalDays),
            createdAt: new Date().toISOString(),
        };
        setNotifications([...notifications, newItem]);
        setProductName('');
        setIntervalDays('');
        setError('');
        setIsAdding(false);
    };

    const headerContent = (
        <TabButton tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
    );

    const toDateOnly = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const mainContent = (
        <div className={styles['notification-list']}>
            {/* ▼ isAddingがtrueのときはフォームだけ表示 */}
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
                            inputMode="numeric"
                            value={intervalDays}
                            onChange={handleIntervalChange}
                            placeholder="数字を入力"
                        />
                    </label>
    
                    {error && <p style={{ color: 'red', marginTop: '4px' }}>{error}</p>}
    
                    <div className={styles.buttonGroup}>
                        <button className={styles.save} onClick={handleSave}>保存</button>
                        <button className={styles.cancel} onClick={handleCancel}>キャンセル</button>
                    </div>
                </div>
            ) : (
                <>
                    {/* ▼ 通知データが空のとき */}
                    {notifications === null ? (
                        <p>読み込み中...</p>
                    ) : notifications.length === 0 ? (
                        <p className={styles.p}>まだ追加してないから、追加しましょう！</p>
                    ) : (
                        // ▼ 通知リストがあるとき
                        <ul className={styles.notificationList}>
                            {notifications.map((item, index) => {
                                const registerDate = new Date(item.createdAt);
                                const replenishDate = new Date(registerDate);
                                replenishDate.setDate(registerDate.getDate() + Number(item.intervalDays));
    
                                const today = mockToday ? new Date(mockToday) : new Date();
                                const todayDateOnly = toDateOnly(today);
                                const registerDateOnly = toDateOnly(registerDate);
                                const replenishDateOnly = toDateOnly(replenishDate);
    
                                const remainingDays = Math.max(
                                    Math.ceil((replenishDateOnly - todayDateOnly) / (1000 * 60 * 60 * 24)),
                                    0
                                );
                                const totalDays = Number(item.intervalDays);
                                const passedDays = Math.ceil((todayDateOnly - registerDateOnly) / (1000 * 60 * 60 * 24));
                                const progressPercent = Math.min((passedDays / totalDays) * 100, 100);
    
                                const replenishDateString = `${replenishDate.getFullYear()}/${replenishDate.getMonth() + 1}/${replenishDate.getDate()}`;
    
                                return (
                                    <li key={index} className={styles.notificationItem}>
                                        <div className={styles.notificationWrapper}>
                                            <div className={styles.verticalBar}></div>
                                            <div className={styles.notificationContent}>
                                                <span className={styles.date}>予定補充日: <strong>{replenishDateString}</strong></span><br />
                                                <span className={styles.product}><strong>「{item.productName}」</strong></span><br />
                                                {remainingDays === 0 ? (
                                                    <span className={styles.today}><CircleAlert color="red" /> 補充日です！！</span>
                                                ) : remainingDays <= 3 ? (
                                                    <span className={styles.soon}><CircleAlert color="#FFC107" /> まもなく、補充目安日になります！！</span>
                                                ) : (
                                                    <span className={styles.normal}>補充目安日の候補期間に入ります。</span>
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
                                                        onClick={() => navigate(`/priceInfo/${encodeURIComponent(item.productName)}`)}
                                                    >
                                                        ➡詳しく見る
                                                    </button>
                                                </div>
    
                                                <span className={styles.remaining}>あと <strong>{remainingDays}日</strong> （1回 / {item.intervalDays} 日）</span>
    
                                                <div className={styles.refilledDelete}>
                                                    <button
                                                        className={styles.refilled}
                                                        onClick={() => {
                                                            const todayDate = mockToday ? new Date(mockToday) : new Date();
                                                            setNotifications(notifications.map((n, i) => {
                                                                if (i === index) return { ...n, createdAt: todayDate.toISOString() };
                                                                return n;
                                                            }));
                                                        }}
                                                    >
                                                        補充した
                                                    </button>
                                                    <button
                                                        className={styles.delete}
                                                        onClick={() => setNotifications(notifications.filter((_, i) => i !== index))}
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
    
                    <button className={styles.tsuika} onClick={handleAddClick}>追加</button>
                </>
            )}
        </div>
    );
    

    return <Layout headerContent={headerContent} mainContent={mainContent} />;
}

export default NotificationList;
