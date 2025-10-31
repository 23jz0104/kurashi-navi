// components/DataInput/ReceiptItemForm.jsx
import { useEffect } from "react";
import Categories from "../common/Categories";
import { useNumberInput } from "../../hooks/useNumberInput";
import styles from "./ReceiptItemForm.module.css";

const ReceiptItemForm = ({ 
  initialValues = {}, 
  categoriesByType, 
  onFieldChange, 
  idPrefix = "" 
}) => {
  const { 
    productName = "", 
    price = 0, 
    quantity = 1, 
    discount = 0, 
    categoryId = null 
  } = initialValues;

  const priceInput = useNumberInput(price);
  const quantityInput = useNumberInput(quantity);
  const discountInput = useNumberInput(discount);

  useEffect(() => {
    onFieldChange("price", priceInput.actualValue);
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
          defaultValue={productName}
          onChange={(e) => onFieldChange("productName", e.target.value)}
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
        categories={categoriesByType.expense}
        selectedCategory={categoryId}
        onSelected={(id) => onFieldChange("categoryId", id)}
      />
    </>
  );
};

export default ReceiptItemForm;