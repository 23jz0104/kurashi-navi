import styles from "./ExpenseManualInput.module.css";
import ReceiptHeader from "./ReceiptHeader";
import ReceiptSummry from "./ReceiptSummry";
import DropdownModal from "../common/DropdonwModal";
import ReceiptItemPreview from "./ReceiptItemPreview";
import ReceiptItemModal from "./ReceiptItemModal";
import SubmitButton from "../common/SubmitButton";
import { useReceiptForm } from "../../hooks/dataInput/useReceiptForm";
import { useReceiptUploader } from "../../hooks/dataInput/useReceiptUploader";
import { Plus, Upload, Camera } from "lucide-react";

const ExpenseInput = ({ categories }) => {
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

  const handleSubmit = async () => {
    const result = await uploadReceipt(receipt, tax);
    if (result) {
      console.log("データ登録完了");
    }
  };
  
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
            <span className={styles["ocr-button-text"]}>読み取り</span>
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
    </div>
  );
};

export default ExpenseInput;