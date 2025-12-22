// components/DataInput/ReceiptItemModal.jsx
import SubmitButton from "../common/SubmitButton";
import ReceiptItemForm from "./ReceiptItemForm";
import styles from "../../styles/DataInput/ConfirmInputData.module.css";
import { useState } from "react";
import { Trash2 } from "lucide-react";

const ReceiptItemModal = ({
  mode = "add",
  item = null,
  index = null,
  onSubmit,
  onDelete,
  closeModal,
  categories,
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
          tax_rate: 10,
        }
  );

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    // バリデーション
    if (!formData.category_id || !formData.product_name || formData.product_price === null) {
      alert("カテゴリ、商品名、金額は必須です。");
      return;
    }

    const finalData = { ...formData, quantity: formData.quantity || 1 };

    if (isEditMode) {
      onSubmit(index, finalData);
    }
    else {
      onSubmit(finalData);
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
        onFieldChange={handleFieldChange}
        idPrefix={isEditMode ? `edit-${index}` : "add"}
        categories={categories}
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