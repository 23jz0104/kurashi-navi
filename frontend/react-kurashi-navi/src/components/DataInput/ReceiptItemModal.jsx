// components/DataInput/ReceiptItemModal.jsx
import { useState } from "react";
import { Trash2 } from "lucide-react";
import SubmitButton from "../common/SubmitButton";
import ReceiptItemForm from "./ReceiptItemForm";
import styles from "../../styles/DataInput/ConfirmInputData.module.css";

const ReceiptItemModal = ({
  mode = "add", // "add" | "edit"
  item = null,
  index = null,
  categoriesByType,
  onSubmit,
  onDelete,
  closeModal,
}) => {
  const isEditMode = mode === "edit";
  
  const [formData, setFormData] = useState(
    isEditMode
      ? { ...item }
      : {
          product_name: "",
          product_price: 0,
          quantity: 1,  
          discount: 0,
          category_id: null,
        }
  );

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // バリデーション
    if (
      !formData.category_id ||
      !formData.product_name ||
      formData.product_price === null ||
      formData.product_price === undefined
    ) {
      alert("カテゴリ、商品名、金額は必須です。");
      return;
    }

    // 数量のデフォルト処理
    const finalQuantity =
      formData.quantity === null || formData.quantity === 0
        ? 1
        : formData.quantity;

    const finalData = { ...formData, quantity: finalQuantity };

    if (isEditMode) {
      // 編集モード: updateItem(index, updates)
      onSubmit(index, finalData);
    } else {
      // 追加モード: addItem(categoryId, productName, price, quantity, discount)
      onSubmit(
        finalData.category_id,
        finalData.product_name,
        finalData.product_price,
        finalData.quantity,
        finalData.discount || 0
      );
    }

    closeModal();
  };

  return (
    <div className={styles["product-detail"]}>
      {/* ヘッダー */}
      <div className={styles["product-detail-header"]}>
        <span className={styles["product-detail-title"]}>
          {isEditMode ? "変更" : "追加"}
        </span>
        {isEditMode && (
          <button
            className={styles["delete-button"]}
            onClick={() => {
              onDelete(index);
              closeModal();
            }}
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* フォーム */}
      <ReceiptItemForm
        initialValues={formData}
        categoriesByType={categoriesByType}
        onFieldChange={handleFieldChange}
        idPrefix={isEditMode ? `edit-${index}` : "add"}
      />

      {/* 送信ボタン */}
      <SubmitButton
        text={isEditMode ? "変更" : "追加"}
        onClick={handleSubmit}
      />
    </div>
  );
};

export default ReceiptItemModal;