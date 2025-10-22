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

const ManualInput = () => {
  const [activeTab, setActiveTab] = useState("expense");
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    memo: "",
    amount: "",
    category: ""
  });

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

  return (
    <Layout 
      headerContent={<TabButton tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />}
      mainContent={
        <div className={styles["form-container"]}>

          <div className={styles["ocr-container"]}>
            {renderOcrButton()}
          </div>

          {/* 日付入力 */}
          <InputSection 
            fields={{
              label: <><Clock size={16}/>日付</>,
              contents: <DayPicker />
            }}
          />

          <InputSection
            fields={[
              {
                label: <>金額<span className={styles["required"]}>*</span></>,
                contents: <Calculator />
              },
              {
                label: "メモ",
                contents: <input type="text" placeholder="未入力" />
              }
            ]}
          />

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
            onClick={showToast}
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