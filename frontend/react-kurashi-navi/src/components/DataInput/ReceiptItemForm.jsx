// components/DataInput/ReceiptItemForm.jsx
import { useEffect } from "react";
import Categories from "../common/Categories";
import { useNumberInput } from "../../hooks/common/useNumberInput";
import styles from "./ReceiptItemForm.module.css";

const ReceiptItemForm = ({ 
  initialValues = {},
  onFieldChange, 
  idPrefix = "",
  categories
}) => {
  const { 
    product_name = "", 
    product_price = 0, 
    quantity = 1, 
    discount = 0, 
    category_id = null 
  } = initialValues;

  const priceInput = useNumberInput(product_price);
  const quantityInput = useNumberInput(quantity);
  const discountInput = useNumberInput(discount);

  useEffect(() => {
    onFieldChange("product_price", priceInput.actualValue);
  }, [priceInput.actualValue]);

  useEffect(() => {
    onFieldChange("quantity", quantityInput.actualValue);
  }, [quantityInput.actualValue]);

  useEffect(() => {
    onFieldChange("discount", discountInput.actualValue);
  }, [discountInput.actualValue]);

  return (
    <>
      {/* 商品名 */}
      <div className={styles["input-group"]}>
        <label htmlFor={`${idPrefix}-name`}>商品名</label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          className={styles["input-product-name"]}
          defaultValue={product_name}
          onChange={(e) => onFieldChange("product_name", e.target.value)}
          placeholder="商品名"
        />
      </div>

      {/* 金額 */}
      <div className={styles["input-group"]}>
        <label htmlFor={`${idPrefix}-price`}>金額</label>
        <input
          id={`${idPrefix}-price`}
          type="text"
          inputMode="numeric"
          className={styles["input-product-price"]}
          value={priceInput.displayValue}
          onChange={(e) => priceInput.handleChange(e.target.value)}
          placeholder="0"
        />
      </div>

      {/* 数量 */}
      <div className={styles["input-group"]}>
        <label htmlFor={`${idPrefix}-quantity`}>数量</label>
        <input
          id={`${idPrefix}-quantity`}
          type="text"
          inputMode="numeric"
          className={styles["input-product-quantity"]}
          value={quantityInput.displayValue}
          onChange={(e) => quantityInput.handleChange(e.target.value)}
          placeholder="1"
        />
      </div>

      {/* 割引 */}
      <div className={styles["input-group"]}>
        <label htmlFor={`${idPrefix}-discount`}>割引</label>
        <input
          id={`${idPrefix}-discount`}
          type="text"
          inputMode="numeric"
          className={styles["input-product-discount"]}
          value={discountInput.displayValue}
          onChange={(e) => discountInput.handleChange(e.target.value)}
          placeholder="0"
        />
      </div>

      {/* カテゴリ選択 */}
      <Categories
        categories={categories}
        selectedCategoryId={category_id}
        onSelectedCategory={(id) => onFieldChange("category_id", id)}
      />
    </>
  );
};

export default ReceiptItemForm;