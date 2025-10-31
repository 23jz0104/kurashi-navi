import { ChevronRight } from "lucide-react";
import styles from "./ReceiptSummry.module.css";

const ReceiptSummry = ({ totalAmount, taxRate, tax }) => {
  return (
    <div className={styles["total-container"]}>
      <div className={styles["total-row"]}>
        <span className={styles["total-label"]}>小計（税抜）</span>
        <span className={styles["sub-total-amount"]}>
          ¥{totalAmount.toLocaleString()}
        </span>
      </div>
      <div className={`${styles["total-row"]} ${styles["tax-container"]}`}>
        <span className={`${styles["total-label"]} ${styles["tax-value"]}`}>
          消費税（{taxRate}%）
        </span>
        <span className={styles["tax"]}>¥{tax.toLocaleString()}</span>
          <ChevronRight size={14} />
      </div>
      <div className={`${styles["total-row"]} ${styles["total-amount-container"]}`}>
        <span className={styles["total-label"]}>合計金額</span>
        <span className={styles["total-amount"]}>
          ¥{(totalAmount + tax).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default ReceiptSummry;