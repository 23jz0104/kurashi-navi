import React from "react";
import styles from "./ReceiptItemPreview.module.css";
import { ChevronRight } from "lucide-react";

const ReceiptItemPreview = ({item}) => {
  return (
    <>
      <span
        className={styles["category-icon"]}
        /* 将来的にカテゴリフックからidに応じたカラーを取得 */
        style={{ backgroundColor: "red"}}
      >
        {/* 将来的にここにアイコンを配置 */}
      </span>
      <span className={styles["product-name"]}>
        {item.product_name}
      </span>
      <div className={styles["product-price-info"]}>
        <span className={styles["product-total-price"]}>
          ¥{(item.product_price * item.quantity).toLocaleString()}
        </span>
        <div className={styles["product-sub-info"]}>
          {item.quantity >= 2 && ( //アイテム個数が2より多ければ個数を合わせて表示
            <span className={styles["product-price-and-quantity"]}>
              ¥{item.product_price.toLocaleString()} × {item.quantity}個
            </span>
          )}
          {item.discount > 0 && (
            <span className={styles["product-discount"]}>
              ¥-{item.discount}
            </span>
          )}
        </div>
      </div>
      <ChevronRight size={16} />
    </>
  );
};

export default ReceiptItemPreview;