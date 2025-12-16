import { ChevronRight } from "lucide-react";
import styles from "./ReceiptSummry.module.css";

const ReceiptSummry = ({ totalAmount = 0, tax = {} }) => {
  const taxRates = Object.keys(tax).map(Number);
  const totalTax = Object.values(tax).reduce((sum, v) => sum + (v || 0), 0);

  return (
    <div className={styles["total-container"]}>
      {/* 小計 */}
      <div className={styles["total-row"]}>
        <span className={styles["total-label"]}>小計（税抜）</span>
        <span className={styles["sub-total-amount"]}>
          ¥{totalAmount.toLocaleString()}
        </span>
      </div>

      {/* 税率別の税額を表示 */}
      {taxRates.map((rate) => (
        <div
          key={rate}
          className={`${styles["total-row"]} ${styles["tax-container"]}`}
        >
          <span className={`${styles["total-label"]} ${styles["tax-value"]}`}>
            消費税（{rate}%）
          </span>
          <span className={styles["tax"]}>
            ¥{(tax[rate] ?? 0).toLocaleString()}
          </span>
          <ChevronRight size={14} />
        </div>
      ))}

      {/* 合計金額 */}
      <div className={`${styles["total-row"]} ${styles["total-amount-container"]}`}>
        <span className={styles["total-label"]}>合計金額</span>
        <span className={styles["total-amount"]}>
          ¥{(totalAmount + totalTax).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default ReceiptSummry;