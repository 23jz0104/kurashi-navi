import styles from "../../styles/DataInput/ConfirmInputData.module.css";
import { useLocation } from "react-router-dom";
import Layout from "../../components/common/Layout";
import ReceiptHeader from "../../components/DataInput/ReceiptHeader";
import { useReceiptForm } from "../../hooks/dataInput/useReceiptForm";
import ReceiptSummry from "../../components/DataInput/ReceiptSummry";
import DropdownModal from "../../components/common/DropdonwModal";
import ReceiptItemPreview from "../../components/DataInput/ReceiptItemPreview";
import ReceiptItemModal from "../../components/DataInput/ReceiptItemModal";
import SubmitButton from "../../components/common/SubmitButton";
import { useReceiptUploader } from "../../hooks/dataInput/useReceiptUploader";
import { useCategories } from "../../hooks/common/useCategories";
import { Plus } from "lucide-react";

const ConfirmInputData = () => {
  const location = useLocation();
  const initialReceipt = location.state.ocrResult; //CameraInput.jsxで解析したデータを受け取る
  const { categories } = useCategories(2);
  const { isUploading, uploadReceipt} = useReceiptUploader();
  const { receipt, totalAmount, tax, addItem, updateItem, deleteItem, updateReceiptInfo } = useReceiptForm(initialReceipt); //レシートデータを管理する専用のフック
  

  const handleSubmit = async (receipt) => {
    const result = await uploadReceipt(receipt);
    if(result) {
      console.log("データ登録完了")
    }
  }

  return (
    <Layout 
      headerContent={
        <p className={styles["header-content"]}>入力データ確認</p>
      }
      mainContent={
        <div className={styles["form-container"]}>
          {/* 日付 店舗名 住所の入力フォーム */}
          <ReceiptHeader 
            receipt={receipt}
            updateReceiptInfo={updateReceiptInfo}
          />
          {/* 合計金額 税率 税金を表示するサマリ */}
          <ReceiptSummry
            totalAmount={totalAmount}
            taxRate={receipt.taxRate}
            tax={tax}
          />

          {/* アイテムリスト */}
          <div className={styles["item-container"]}>
            <div className={styles["item-list"]}>
              {receipt.products.map((item, index) => (
                <DropdownModal 
                  key={index}
                  title={
                    <ReceiptItemPreview 
                      item={item}
                    />
                  }
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
                    <span className={styles["category-icon"]} style={{ backgroundColor: "#c0c0c0"}} >
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
            text={"送信"}
            onClick={() => handleSubmit(receipt)}
          />
        </div>
      }
    />
  )
}

export default ConfirmInputData;