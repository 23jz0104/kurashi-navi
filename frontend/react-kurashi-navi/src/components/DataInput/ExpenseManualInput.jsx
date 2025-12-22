import styles from "./ExpenseManualInput.module.css";
import ReceiptHeader from "./ReceiptHeader";
import ReceiptSummry from "./ReceiptSummry";
import DropdownModal from "../common/DropdonwModal";
import ReceiptItemPreview from "./ReceiptItemPreview";
import ReceiptItemModal from "./ReceiptItemModal";
import SubmitButton from "../common/SubmitButton";
import CompleteModal from "../common/CompleteModal";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useReceiptForm } from "../../hooks/dataInput/useReceiptForm";
import { useReceiptUploader } from "../../hooks/dataInput/useReceiptUploader";
import { Plus, Upload, Camera, CircleAlert, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

console.log("手動入力ページ");

const ExpenseInput = ({ categories }) => {
  const navigate = useNavigate();
  const { isUploading, uploadReceipt } = useReceiptUploader();
  const location = useLocation();

  const {
    receipt,
    setReceipt,
    priceMode,
    setPriceMode,
    calculated,
    addItem,
    updateItem,
    deleteItem,
    updateReceiptInfo,
  } = useReceiptForm();

  const [validationError, setValidationError] = useState(null);
  const [message, setMessage] = useState(false);

  const validateForm = () => {
    if (!receipt.products || receipt.products.length === 0) {
      return "データを入力してください。";
    }
    return null;
  };

  // OCR 結果が location.state にある場合、receipt に反映
  useEffect(() => {
    if (!location.state?.ocrResult) return;
    setReceipt((prev) => ({
      ...prev,
      ...location.state.ocrResult,
    }));
  }, [location.state, setReceipt]);

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      setValidationError(error);
      setTimeout(() => setValidationError(null), 5000);
      return;
    }

    const result = await uploadReceipt(receipt, calculated.taxByRate);

    if (result) {
      setMessage(true);
      setTimeout(() => setMessage(false), 1000);
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

          <button
            className={styles["ocr-button"]}
            onClick={() => navigate("/camera")}
          >
            <Camera size={20} />
            <span className={styles["ocr-button-text"]}>読み取り</span>
          </button>
        </div>
      </div>

      {/* レシート情報 */}
      <ReceiptHeader receipt={receipt} updateReceiptInfo={updateReceiptInfo} />

      {/* 税率切替ボタン */}
      <div className={styles["price-mode-container"]}>
        <span className={styles["price-mode-label"]}>レシートタイプ：</span>
        <button
          className={styles["price-mode-text-toggle"]}
          onClick={() =>
            setPriceMode(priceMode === "exclusive" ? "inclusive" : "exclusive")
          }
        >
          {priceMode === "inclusive" ? "税込" : "税抜"}
        </button>
      </div>

      {/* 集計 */}
      <ReceiptSummry totalAmount={calculated.subTotal} tax={calculated.taxByRate} />

      {/* 項目リスト */}
      <div className={styles["item-container"]}>
        <div className={styles["item-list"]}>
          {receipt.products.map((item, index) => (
            <DropdownModal key={index} title={<ReceiptItemPreview item={item} />}>
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
                <span className={styles["product-name"]}>項目を追加する</span>
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

      {/* 送信ボタン */}
      <SubmitButton
        text={isUploading ? "送信中..." : "送信"}
        onClick={handleSubmit}
        disabled={isUploading}
      />

      {/* エラーメッセージ */}
      {validationError && (
        <div className={styles["error-container"]}>
          <CircleAlert size={16} />
          <span className={styles["error-message"]}>{validationError}</span>
          <button onClick={() => setValidationError(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* 完了モーダル */}
      {message && <CompleteModal />}
    </div>
  );
};

export default ExpenseInput;
