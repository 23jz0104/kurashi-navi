import styles from "./ExpenseManualInput.module.css";
import ReceiptHeader from "./ReceiptHeader";
import ReceiptSummry from "./ReceiptSummry";
import DropdownModal from "../common/DropdonwModal";
import ReceiptItemPreview from "./ReceiptItemPreview";
import ReceiptItemModal from "./ReceiptItemModal";
import SubmitButton from "../common/SubmitButton";
import { useReceiptForm } from "../../hooks/dataInput/useReceiptForm";
import { useReceiptUploader } from "../../hooks/dataInput/useReceiptUploader";
import { Plus, Upload, Camera, CircleAlert, Cross, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ExpenseInput = ({ categories }) => {
  const navigate = useNavigate();
  const { isUploading, uploadReceipt } = useReceiptUploader();
  const {
    receipt,
    totalAmount,
    tax,
    addItem,
    updateItem,
    deleteItem,
    updateReceiptInfo,
  } = useReceiptForm();

  const [validationError, setValidationError] = useState(null); //エラーを管理
  const [message, setMessage] = useState(false);

  const validateForm = () => {
    if(!receipt.products || receipt.products.length === 0) {
      return "データを入力してください。";
    }

    return null;
  }

  const handleSubmit = async () => {
    const error = validateForm();
    if(error) {
      setValidationError(error);

      setTimeout(() => {
        setValidationError(null);
      }, 5000);
      return;
    }
    const result = await uploadReceipt(receipt, tax);
    if (result) {
      setMessage(true);
      setTimeout(() => setMessage(false), 2000);
    }
  };

  const resetError = () => {
    setValidationError(null);
  }
  
  return (
    <div className={styles["form-container"]}>
      {/* OCR ボタン */}
      <div className={styles["ocr-container"]}>
        <div className={styles["ocr-buttons"]}>
          <button className={styles["ocr-button"]}>
            <Upload size={20} />
            <span className={styles["ocr-button-text"]}>アップロード</span>
          </button>
          <button className={styles["ocr-button"]}>
            <Camera size={20} />
            <span 
              className={styles["ocr-button-text"]}
              onClick={() => {
                navigate("/camera");
              }}
            >
              読み取り
            </span>
          </button>
        </div>
      </div>

      <ReceiptHeader
        receipt={receipt}
        updateReceiptInfo={updateReceiptInfo}
      />

      <ReceiptSummry
        totalAmount={totalAmount}
        taxRate={receipt.taxRate}
        tax={tax}
      />

      <div className={styles["item-container"]}>
        <div className={styles["item-list"]}>
          {receipt.products.map((item, index) => (
            <DropdownModal
              key={index}
              title={<ReceiptItemPreview item={item} />}
            >
              {(closeModal) => (
                <ReceiptItemModal
                  mode="edit"
                  item={item}
                  index={index}
                  onSubmit={updateItem}
                  onDelete={deleteItem}
                  closeModal={closeModal}
                  categories={categories}
                />
              )}
            </DropdownModal>
          ))}

          <DropdownModal
            title={
              <>
                <span
                  className={styles["category-icon"]}
                  style={{ backgroundColor: "#c0c0c0" }}
                >
                  <Plus />
                </span>
                <span className={styles["product-name"]}>
                  項目を追加する
                </span>
              </>
            }
          >
            {(closeModal) => (
              <ReceiptItemModal
                mode="add"
                onSubmit={addItem}
                closeModal={closeModal}
                categories={categories}
              />
            )}
          </DropdownModal>
        </div>
      </div>

      <SubmitButton
        text="送信"
        onClick={handleSubmit}
        disabled={isUploading}
      />

      {validationError && (
        <div className={styles["error-container"]}>
          <span className={styles["error-icon"]}><CircleAlert size={16}/></span>
          <span className={styles["error-message"]}>{validationError}</span>
          <button
          className={styles["error-reset-button"]}
            onClick={() => resetError()}
          >
            <X size={16}/>
          </button>
        </div>
      )}

      {message && (
        <p>登録が完了しました！</p>
      )}
    </div>
  );
};

export default ExpenseInput;