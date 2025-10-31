import DayPicker from "../common/DayPicker";
import styles from "./ReceiptHeader.module.css";

const ReceiptHeader = ({ receipt, updateField}) => {
  return (
    <div className={styles["header-container"]}>
      <DayPicker date={receipt.date} />
      <div className={styles["header-container-row"]}>
        <span>店舗名</span>
        <input
          className={styles["store-name-value"]}
          type="text"
          placeholder="未入力"
          value={receipt.storeName}
          onChange={(e) => updateField("storeName", e.target.value)}
        />
      </div>
      <div className={styles["header-container-row"]}>
        <span>住　所</span>
        <input
          className={styles["store-address-value"]}
          type="text"
          placeholder="未入力"
          value={receipt.storeAddress}
          onChange={(e) => updateField("storeAddress", e.target.value)}
        />
      </div>
    </div>
  )
}

export default ReceiptHeader;