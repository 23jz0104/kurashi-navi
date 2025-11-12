import React, { useState } from "react";
import { Wallet, TrendingUp, Plus, Upload, Camera } from "lucide-react";
import "../../index.css";
import styles from "../../styles/DataInput/ManualInput.module.css";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import SubmitButton from "../../components/common/SubmitButton";
import Toast from "../../components/common/Toast";
import { useManualInputUploader } from "../../hooks/dataInput/useManualInputUploader";
import ReceiptHeader from "../../components/DataInput/ReceiptHeader";
import ReceiptSummry from "../../components/DataInput/ReceiptSummry";
import { useReceiptForm } from "../../hooks/dataInput/useReceiptForm";
import ReceiptItemPreview from "../../components/DataInput/ReceiptItemPreview";
import DropdownModal from "../../components/common/DropdonwModal";
import ReceiptItemModal from "../../components/DataInput/ReceiptItemModal";
import { useCategories } from "../../hooks/useCategories";

const ManualInput = () => {
  const [activeTab, setActiveTab] = useState("expense");
  const [isVisible, setIsVisible] = useState(false);

  const { getCategoryById, categoriesByType } = useCategories();
  
  const {
    receipt,
    totalAmount,
    tax,
    addItem,
    updateItem,
    deleteItem,
    updateReceiptInfo,
  } = useReceiptForm();
  
  const { uploadData, isUploading } = useManualInputUploader();

  const tabs = [
    { id: "expense", label: "支出", icon: <Wallet size={20} /> },
    { id: "income", label: "収入", icon: <TrendingUp size={20} /> }
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderOcrButton = () => {
    if (activeTab !== "expense") return null;

    return (
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
    );
  };

  const showToast = () => {
    setIsVisible(true);
  };

  const handleSubmit = async () => {
    if (!receipt.shop_name || !receipt.products) {
      alert("未入力の項目があります");
      return;
    }
    console.log("未入力項目なし");

    const result = await uploadData(receipt);
    if(result) {
      console.log("データアップロード完了");  
    }
  }

  const debug = () => {
    // console.log("formData: ", JSON.stringify(formData, null, 2));
    console.log("receipt: ", JSON.stringify(receipt, null, 1));
  }

  return (
    <Layout 
      headerContent={<TabButton tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />}
      mainContent={
        <div className={styles["form-container"]}>

          <div className={styles["ocr-container"]}>
            {renderOcrButton()}
          </div>

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
              {receipt.products.map((item, index) => (
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
            text={<><Plus size={20}/>追加</>}
            onClick={() => handleSubmit()}
            disabled={isUploading}
          />

          <button onClick={() => debug()}>デバッグ</button>

          <Toast
            message="データを入力しました"
            isVisible={isVisible}
            onClose={() => setIsVisible(false)}
          />
        </div>
      }
    />
  );
};

export default ManualInput;