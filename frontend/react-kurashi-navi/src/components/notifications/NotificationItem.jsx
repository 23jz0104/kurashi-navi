import { CircleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import styles from "./Notification.module.css";
import { useNavigate } from "react-router-dom";

const NotificationItem = ({ item, expanded, onExpand, onToggle, onDelete, onRefilled, onEdit }) => {
  const navigate = useNavigate();
  // const [isExpanded, setIsExpanded] = useState(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const scheduledDate = useMemo(() => {
    const d = new Date(item.scheduledDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [item.scheduledDate]);

  const remainingDays = Math.ceil(
    (scheduledDate - today) / (1000 * 60 * 60 * 24)
  );

  const displayRemainingDays = Math.max(0, remainingDays);

  const baseDays = useMemo(() => {
    const stored = Number(localStorage.getItem(`progressBase_${item.id}`));
    if (!stored || stored < remainingDays) return remainingDays;
    if (stored <= 0) return item.intervalDays || 1;
    return stored;
  }, [item.id, remainingDays, item.intervalDays]);

  useEffect(() => {
    localStorage.setItem(`progressBase_${item.id}`, baseDays);
  }, [item.id, baseDays]);

  const progressPercent =
    remainingDays <= 0
      ? 100
      : Math.max(0, Math.min(((baseDays - remainingDays) / baseDays) * 100, 100));

  return (
    <li className={styles.notificationItem}>
      <div className={styles.notificationWrapper}>
        <div className={styles.notificationContent}>
          {/* 常時表示 */}
          <div className={styles.notificationHeader} 
            onClick={(e) => {
              if (e.target.tagName !== "INPUT") onExpand();
            }}>
            <span className={styles.product}>
              <strong>「{item.productName}」</strong>
            </span>

            <label className={styles.switch} onClick={(e) => e.stopPropagation()}>
              <input type="checkbox" checked={item.enabled} onChange={() => onToggle(item)}/>
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.dateRow} onClick={onExpand}>
            <span className={styles.date}>
              <strong>次回: {scheduledDate.toLocaleDateString()} | {item.notificationHour}:00</strong>
            </span>
          </div>

          {/* 展開部分 */}
          {expanded && (
            <div className={styles.detailSection}>
              <span className={styles.remaining}>
                頻度: 1回 / {item.intervalDays} 日（あと <strong>{displayRemainingDays}</strong> 日）
              </span>

              {/* 進捗バー(多分いらない) */}
              {/* <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progressPercent}%` }}
                />
              </div> */}

              {/* 価格情報 */}
              <div>
                <span>【相場価格】
                  <button className={styles.syosai} onClick={() => navigate(`/priceInfo/${encodeURIComponent(item.productName)}`)}>
                    ➡ 詳しく見る
                  </button>
                </span>
              </div>

              {/* ボタン類 */}
              <div className={styles.refilledDelete}>
                <button className={styles.refilled} onClick={() => onRefilled(item)}>補充</button>
                <button className={styles.edit} onClick={(e) => {onEdit(item.id); e.stopPropagation();}}>編集</button>
                <button className={styles.delete} onClick={() => onDelete(item.id)}>削除</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </li>
  );
};

export default NotificationItem;
