import DayPicker from "../common/DayPicker";
import styles from "./ReceiptHeader.module.css";

const ReceiptHeader = ({ receipt, updateReceiptInfo}) => {
  return (
    <div className={styles["header-container"]}>
      <DayPicker date={receipt.purchase_day} onChange={(newDate) => updateReceiptInfo("purchase_day", newDate)} />
      <div className={styles["header-container-row"]}>
        <span>店舗名</span>
        <input
          className={styles["store-name-value"]}
          type="text"
          placeholder="未入力"
          value={receipt.shop_name}
          onChange={(e) => updateReceiptInfo("shop_name", e.target.value)}
        />
      </div>
      <div className={styles["header-container-row"]}>
        <span>住　所</span>
        <input
          className={styles["store-address-value"]}
          type="text"
          placeholder="未入力"
          value={receipt.shop_address}
          onChange={(e) => updateReceiptInfo("shop_address", e.target.value)}
        />
      </div>
    </div>
  )
}

export default ReceiptHeader;