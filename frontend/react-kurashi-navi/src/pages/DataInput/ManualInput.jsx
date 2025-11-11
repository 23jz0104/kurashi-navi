import React, { useState } from "react";
import { Wallet, TrendingUp, Clock, Tag, Plus, Upload, Camera } from "lucide-react";
import "../../index.css";
import styles from "../../styles/DataInput/ManualInput.module.css";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import SubmitButton from "../../components/common/SubmitButton";
import InputSection from "../../components/common/InputSection";
import DayPicker from "../../components/common/DayPicker";
import Categories from "../../components/common/Categories";
import Toast from "../../components/common/Toast";
import Calculator from "../../components/common/Calculator";
import { useManualInputUploader } from "../../hooks/dataInput/useManualInputUploader";

const ManualInput = () => {
  const [activeTab, setActiveTab] = useState("expense");
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    memo: "",
    quantity: "",
    product_price: "",
    categoryId: "",
  });
  
  const { uploadData, isUploading } = useManualInputUploader();

  const tabs = [
    { id: "expense", label: "支出", icon: <Wallet size={20} /> },
    { id: "income", label: "収入", icon: <TrendingUp size={20} /> }
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData(prev => ({
      ...prev,
      category: ""
    }));
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setFormData(prev => ({ ...prev, category: categoryId}))
  }

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

  const handleSubmit = () => {
    if (!formData.date || !formData.quantity || !formData.category) {
      alert("未入力の項目があります");
    }
    console.log(formData);
  }

  return (
    <Layout 
      headerContent={<TabButton tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />}
      mainContent={
        <div className={styles["form-container"]}>

          <div className={styles["ocr-container"]}>
            {renderOcrButton()}
          </div>

          <DayPicker />

          <div className={styles["manual-input-details"]}>
            <div className={styles["manual-input-row"]}>
              <span className={styles["price"]}>金額</span><span className={styles["required"]}>*</span>
              <Calculator onChange={(e) => setFormData(prev => ({ ...prev, product_price: e}))} className={styles["detail-input"]}/>
            </div>
            <div className={styles["manual-input-row"]}>
              <span className={styles["quantity"]}>個数</span><span className={styles["required"]}>*</span>
              <input type="number" className={styles["detail-input"]} defaultValue={1} onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value}))} inputMode="numeric"/>
            </div>
            <div className={styles["manual-input-row"]}>
              <span className={styles["memo"]}>メモ</span>
              <input type="text" className={styles["detail-input"]} value={formData.memo} onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value}))}/>
            </div>
          </div>

          <InputSection 
            fields={{
              label: <><Tag size={16}/>カテゴリ<span className={styles.required}>*</span></>,
              contents: (
                <Categories 
                  activeTab={activeTab}
                  selectedCategory={selectedCategory}
                  onSelected={handleCategorySelect}
                />
              )
            }}
          />

          <SubmitButton 
            text={<><Plus size={20}/>追加</>}
            onClick={() => handleSubmit()}
            disabled={isUploading}
          />

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