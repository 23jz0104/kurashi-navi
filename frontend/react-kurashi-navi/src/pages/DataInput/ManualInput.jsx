import styles from "../../styles/DataInput/ManualInput.module.css";
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
import { Plus, Wallet, TrendingUp, Upload, Camera } from "lucide-react";
import TabButton from "../../components/common/TabButton";
import { useState } from "react";
import DayPicker from "../../components/common/DayPicker";

const ConfirmInputData = () => {
  const { categories } = useCategories(2); // 引数に2を設定して支出カテゴリを取得
  const { isUploading, uploadReceipt } = useReceiptUploader();
  const [activeTab, setActiveTab] = useState("expense");

  const {
    receipt,
    totalAmount,
    tax,
    addItem,
    updateItem,
    deleteItem,
    updateReceiptInfo,
  } = useReceiptForm(); // レシートデータを管理する専用のフック

  const handleSubmit = async (receipt, tax) => {
    const result = await uploadReceipt(receipt, tax);
    if (result) {
      console.log("データ登録完了");
    }
  };

  const tabs = [
    { id: "expense", label: "支出", icon: <Wallet size={20} /> },
    { id: "income", label: "収入", icon: <TrendingUp size={20} /> },
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

  const printCurrentReceipt = () => {
    console.log(JSON.stringify(receipt, null, 1));
  };

  return (
    <Layout
      headerContent={
        <TabButton
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      }
      mainContent={
        <div className={styles["form-container"]}>
          {activeTab === "expense" && (
            <>
              {/* OCR ボタン */}
              <div className={styles["ocr-container"]}>
                {renderOcrButton()}
              </div>

              {/* 日付・店舗名・住所 */}
              <ReceiptHeader
                receipt={receipt}
                updateReceiptInfo={updateReceiptInfo}
              />

              {/* 合計、税率、税額 */}
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

                  {/* 追加アイテム */}
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
                onClick={() => handleSubmit(receipt, tax)}
              />

              <button onClick={printCurrentReceipt}>
                コンソールにレシートを出力
              </button>
            </>
          )}

          {activeTab === "income" && (
            <>
              <DayPicker />
            </>
          )}
        </div>
      }
    />
  );
};

export default ConfirmInputData;
