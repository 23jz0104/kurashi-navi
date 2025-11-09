import { useLocation } from "react-router-dom";
import { Plus } from "lucide-react";
import Layout from "../../components/common/Layout";
import styles from "../../styles/DataInput/ConfirmInputData.module.css";
import SubmitButton from "../../components/common/SubmitButton";
import DropdownModal from "../../components/common/DropdonwModal";
import { useCategories } from "../../hooks/useCategories";
import { useReceiptForm } from "../../hooks/dataInput/useReceiptForm";
import ReceiptHeader from "../../components/DataInput/ReceiptHeader";
import ReceiptSummry from "../../components/DataInput/ReceiptSummry";
import ReceiptItemPreview from "../../components/DataInput/ReceiptItemPreview";
import ReceiptItemModal from "../../components/DataInput/ReceiptItemModal";
import { useReceiptUploader } from "../../hooks/dataInput/useReceiptUploader";

const ConfirmInputData = () => {
  const location = useLocation();
  const initialReceipt = location.state?.ocrResult;
  const { getCategoryById, categoriesByType } = useCategories();
  const { uploadReceipt, isUploading } = useReceiptUploader();
  const {
    receipt,
    totalAmount,
    tax,
    addItem,
    updateItem,
    deleteItem,
    updateReceiptInfo,
  } = useReceiptForm(initialReceipt);

  const handleSubmit = async (receipt) => {
    if (!receipt || isUploading) return;

    const result = await uploadReceipt(receipt);
    if(result) {
      console.log("データを登録しました。");
    }
  }

  // メインコンテンツ
  return (
    <Layout
      headerContent={<p className={styles.headerContent}>入力データ確認</p>}
      mainContent={
        <div className={styles["form-container"]}>
          <ReceiptHeader
            receipt={receipt}
            updateField={updateReceiptInfo}
          />

          <ReceiptSummry
            totalAmount={totalAmount}
            taxRate={receipt.taxRate}
            tax={tax}
          />

          {/* アイテムリスト */}
          <div className={styles["item-container"]}>
            <div className={styles["item-list"]}>
              {receipt.items.map((item, index) => (
                <DropdownModal
                  key={index}
                  title={
                    <ReceiptItemPreview
                      item={item}
                      getCategoryById={getCategoryById}
                    />
                  }
                >
                  {(closeModal) => (
                    <ReceiptItemModal
                      mode="edit"
                      item={item}
                      index={index}
                      categoriesByType={categoriesByType}
                      onSubmit={updateItem}
                      onDelete={deleteItem}
                      closeModal={closeModal}
                    />
                  )}
                </DropdownModal>
              ))}

              {/* 項目を追加 */}
              <DropdownModal
                title={
                  <>
                    <span
                      className={styles["category-icon"]}
                      style={{ backgroundColor: "#C0C0C0" }}
                    >
                      <Plus size={16} />
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
                    categoriesByType={categoriesByType}
                    onSubmit={addItem}
                    closeModal={closeModal}
                  />
                )}
              </DropdownModal>
            </div>
          </div>

          <SubmitButton 
            text={isUploading ? "登録中..." : "送信"} 
            onClick={() => handleSubmit(receipt)}
            disabled={isUploading}
            />
        </div>
      }
    />
  );
};

export default ConfirmInputData;