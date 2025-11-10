import { ChevronRight, CircleQuestionMark } from "lucide-react";
import styles from "./ReceiptItemPreview.module.css";
import React from "react";

const ReceiptItemPreview = ( {item, getCategoryById} ) => {
  const category = getCategoryById(item.category_id);
  const categoryColor = category?.color || "#868E96";
  const categoryIcon = category?.icon ? (
    React.cloneElement(category.icon, { size: 16 })
  ) : (
    <CircleQuestionMark size={16} />
  );

  return (
    <>
      <span
        className={styles["category-icon"]}
        style={{ backgroundColor: categoryColor }}
      >
        {categoryIcon}
      </span>
      <span className={styles["product-name"]}>
        {item.product_name}
      </span>
      <div className={styles["product-price-info"]}>
        <span className={styles["product-total-price"]}>
          ¥{(item.product_price * item.quantity).toLocaleString()}
        </span>
        <div className={styles["product-sub-info"]}>
          {item.quantity >= 2 && (
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