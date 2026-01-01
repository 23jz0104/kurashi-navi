import React, { useState, useEffect } from "react";
import styles from "./ExpenseManualInput.module.css"; // スタイルは既存のものを流用
import { Plus, CircleAlert, X, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

// コンポーネント類
import ReceiptHeader from "./ReceiptHeader";
import ReceiptSummry from "./ReceiptSummry";
import DropdownModal from "../common/DropdonwModal";
import ReceiptItemPreview from "./ReceiptItemPreview";
import ReceiptItemModal from "./ReceiptItemModal";
import SubmitButton from "../common/SubmitButton";

// フック
import { useReceiptForm } from "../../hooks/dataInput/useReceiptForm";
import { useReceiptUploader } from "../../hooks/dataInput/useReceiptUploader";

const ReceiptForm = ({ initialData, categories, index, onComplete }) => {
  const [isOpen, setIsOpen] = useState(index === 0); // 1枚目は最初から開いておく
  const [isSaved, setIsSaved] = useState(false);
  const { isUploading, uploadReceipt } = useReceiptUploader();
  const [validationError, setValidationError] = useState(null);

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

  // 親から渡された初期データをセット
  useEffect(() => {
    if (initialData) {
      setReceipt((prev) => ({
        ...prev,
        ...initialData,
      }));
    }
  }, [initialData, setReceipt]);

  const validateForm = () => {
    if (!receipt?.products || receipt.products.length === 0) {
      return "商品データがありません。";
    }
    return null;
  };

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      setValidationError(error);
      return;
    }

    const result = await uploadReceipt(receipt, calculated?.taxByRate || 0);
    if (result) {
      setIsSaved(true);
      setIsOpen(false); // 保存したら閉じる
      if (onComplete) onComplete(); // 親に完了を通知
    }
  };

  // 表示用タイトル（店名または日付）
  const displayTitle = receipt.shop_name || `レシート ${index + 1}`;
  const displayTotal = calculated?.subTotal ? `¥${calculated.subTotal.toLocaleString()}` : "";

  return (
    <div className={styles["receipt-card"]}>
      {/* --- ヘッダー（クリックで展開・収納） --- */}
      <div 
        className={`${styles["receipt-card-header"]} ${isSaved ? styles.saved : ""}`} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles["header-left"]}>
          {isSaved && <CheckCircle size={20} color="#4CAF50" style={{marginRight: 8}} />}
          <span className={styles["store-name"]}>{displayTitle}</span>
        </div>
        <div className={styles["header-right"]}>
          <span className={styles["total-price"]}>{displayTotal}</span>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* --- 展開されるフォーム部分 --- */}
      {isOpen && (
        <div className={styles["receipt-card-body"]}>
          {/* レシート情報ヘッダー */}
          <ReceiptHeader receipt={receipt} updateReceiptInfo={updateReceiptInfo} />

          {/* 税設定 */}
          <div className={styles["price-mode-container"]}>
            <span className={styles["price-mode-label"]}>タイプ：</span>
            <button
              className={styles["price-mode-text-toggle"]}
              onClick={() => setPriceMode(priceMode === "exclusive" ? "inclusive" : "exclusive")}
            >
              {priceMode === "inclusive" ? "税込" : "税抜"}
            </button>
          </div>

          {/* 集計 */}
          <ReceiptSummry totalAmount={calculated?.subTotal || 0} tax={calculated?.taxByRate || 0} />

          {/* 商品リスト */}
          <div className={styles["item-list"]}>
            {(receipt.products || []).map((item, idx) => (
              <DropdownModal key={idx} title={<ReceiptItemPreview item={item} />}>
                {(closeModal) => (
                  <ReceiptItemModal
                    mode="edit"
                    item={item}
                    index={idx}
                    onSubmit={updateItem}
                    onDelete={deleteItem}
                    closeModal={closeModal}
                    categories={categories}
                  />
                )}
              </DropdownModal>
            ))}

            {/* 追加ボタン */}
            <DropdownModal
              title={
                <div className={styles["add-item-row"]}>
                  <span className={styles["category-icon"]} style={{ backgroundColor: "#c0c0c0" }}>
                    <Plus />
                  </span>
                  <span className={styles["product-name"]}>項目を追加する</span>
                </div>
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

          {/* 送信ボタン */}
          <div style={{ marginTop: "20px" }}>
            <SubmitButton
              text={isUploading ? "送信中..." : isSaved ? "保存済み" : "このレシートを保存"}
              onClick={handleSubmit}
              disabled={isUploading || isSaved}
            />
          </div>

          {/* エラー表示 */}
          {validationError && (
            <div className={styles["error-container"]}>
              <CircleAlert size={16} />
              <span>{validationError}</span>
              <button onClick={() => setValidationError(null)}><X size={16} /></button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReceiptForm;