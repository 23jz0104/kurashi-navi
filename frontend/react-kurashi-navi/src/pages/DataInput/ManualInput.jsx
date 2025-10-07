import React, { useState } from "react";
import { Wallet, TrendingUp, Clock, Tag, Plus, Upload, Camera } from "lucide-react";
import "../../index.css";
import styles from "../../styles/DataInput/ManualInput.module.css";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";

const ManualInput = () => {
  const [activeTab, setActiveTab] = useState("expense");
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

  //仮のカテゴリデータ
  const categories = {
    expense: [
      { id: "food", name: "食費", icon: "🍽️" },
      { id: "transport", name: "交通費", icon: "🚃" },
      { id: "bills", name: "光熱費", icon: "💡" },
      { id: "entertainment", name: "娯楽", icon: "🎮" },
      { id: "other", name: "その他", icon: "📦" }
    ],
    income: [
      { id: "salary", name: "給与", icon: "💼" },
      { id: "bonus", name: "賞与", icon: "🎁" },
      { id: "side", name: "副業", icon: "💻" },
      { id: "other", name: "その他", icon: "💰" }
    ]
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData(prev => ({
      ...prev,
      category: ""
    }));
  };

  const handleCategorySelect = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      category: categoryId
    }));
  }

  const renderOcrButton = () => {
    if(activeTab !== "expense") return null;

    return (
      <div className={styles["ocr-buttons"]}>
        <button className={styles["ocr-button"]}>
          <Upload size={20}/>
          <span className={styles["ocr-button-text"]}>アップロード</span>
        </button>
        <button className={styles["ocr-button"]}>
          <Camera size={20}/>
          <span className={styles["ocr-button-text"]}>読み取り</span>
        </button>
      </div>
    )
  }

  return (
    <Layout 
      headerContent={<TabButton tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />}
      mainContent={
        <div className={styles["form-container"]}>

          <div className={styles["ocr-container"]}>
            {renderOcrButton()}
          </div>

          {/* 日付入力 */}
          <div className={styles["input-section"]}>
            <label className={styles["input-label"]}>
              <Clock className={styles["label-icon"]} size={16} />
              日付
            </label>
            <input
              type="date"
              value={formData.date}
              className={styles["input-field"]}
            />
          </div>

          {/* 金額とメモ */}
          <div className={styles["input-section"]}>
            <div className={styles["input-group"]}>
              <label className={styles["input-label"]}>
                金額 <span className={styles["required"]}>*</span>
              </label>
            <div className={styles["amount-input-container"]}>
              <input
                type="number"
                value={formData.amount}
                placeholder="0円"
                min="0"
                className={`${styles["input-field"]} ${styles["amount-input"]}`}
              />
            </div>
            </div>

            <div className={styles["input-group"]}>
              <label>メモ</label>
              <input
                type="text"
                value={formData.memo}
                placeholder="未入力"
               className={styles["input-field"]}
              />
            </div>
          </div>

          {/* カテゴリ選択 */}
          <div className={styles["input-section"]}>
            <label className={styles["input-label"]}>
              <Tag size={16}/>
              カテゴリ <span className={styles["required"]}>*</span>
            </label>
            <div className={styles["category-grid"]}>
              {categories[activeTab].map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category.id)}
                  className={`${styles["category-button"]} ${
                    formData.category == category.id
                    ? styles["category-button-selected"]
                    : ""
                  }`}
                >
                  <span className={styles["category-icon"]}>{category.icon}</span>
                  <span className={styles["category-name"]}>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 追加ボタン */}
          <button
            type="button"
            className={styles["submit-button"]}
          >
            <Plus size={20} />
            追加
          </button>
        </div>
      }
    />
  )
}

export default ManualInput;