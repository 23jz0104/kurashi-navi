import React from "react";
import styles from "./ReceiptItemPreview.module.css";
import { ChevronRight } from "lucide-react";

const ReceiptItemPreview = ({ item }) => {
  // item自体がない場合のガード
  if (!item) return null;

  // 計算用の値を安全に取り出す (キー名は product_price のまま)
  const price = item.product_price ?? 0;
  const quantity = item.quantity ?? 1;
  const total = price * quantity;
  const discount = item.discount ?? 0;

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
        {item.product_name || "名称未設定"}
      </span>
      <div className={styles["product-price-info"]}>
        <span className={styles["product-total-price"]}>
          {/* 安全に計算した合計を表示 */}
          ¥{total.toLocaleString()}
        </span>
        <div className={styles["product-sub-info"]}>
          {quantity >= 2 && ( 
            <span className={styles["product-price-and-quantity"]}>
              {/* キー名は product_price を使用しつつ、データがない場合に備える */}
              ¥{(item.product_price ?? 0).toLocaleString()} × {quantity}個
            </span>
          )}
          {discount > 0 && (
            <span className={styles["product-discount"]}>
              ¥-{discount.toLocaleString()}
            </span>
          )}
        </div>
      </div>
      <ChevronRight size={16} />
    </>
  );
};

export default ReceiptItemPreview;