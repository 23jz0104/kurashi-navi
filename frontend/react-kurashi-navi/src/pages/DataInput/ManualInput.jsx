import React, { useState } from "react";
import { Wallet, TrendingUp, Clock, Tag, Plus, Upload, Camera, List, Bell, User } from "lucide-react"; //React用のアイコンをインポート 後で消す
import "../../index.css";
import "../../styles/DataInput/ManualInput.css";

const ManualInput = () => {
  const [activeTab, setActiveTab] = useState("expense");
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    memo: "",
    amount: "",
    category: ""
  });

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
      <div className="ocr-buttons">
        <button className="ocr-button">
          <Upload size={20}/>
          <span className="ocr-button-text">アップロード</span>
        </button>
        <button className="ocr-button">
          <Camera size={20}/>
          <span className="ocr-button-text">読み取り</span>
        </button>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <div className="tab-container">
          <button
            onClick={() => handleTabChange("expense")}
            className={`tab-button ${activeTab == "expense" ? "tab-active" : ""}`}
          >
            <Wallet size={20} />
            支出
          </button>
          <button
            onClick={() => handleTabChange("income")}
            className={`tab-button ${activeTab == "income" ? "tab-active" : ""}`}
          >
            <TrendingUp size={20} />
            収入
          </button>
        </div>
      </header>

      <main className="main-container">
        <div className="form-container">
          <div className="ocr-container">
            {renderOcrButton()}
          </div>
          {/* 日付入力 */}
          <div className="input-section">
            <label className="input-label">
              <Clock className="label-icon" size={16} />
              日付
            </label>
            <input
              type="date"
              value={formData.date}
              className="input-field"
            />
          </div>

          {/* 金額とメモ */}
          <div className="input-section">
            <div className="input-group">
              <label className="input-label">
                金額 <span className="required">*</span>
              </label>
              <div className="amount-input-container">
                <input
                  type="number"
                  value={formData.amount}
                  placeholder="0円"
                  min="0"
                  className="input-field amount-input"
                />
              </div>
            </div>

            <div className="input-group">
              <label>メモ</label>
              <input
                type="text"
                value={formData.memo}
                placeholder="未入力"
                className="input-field"
              />
            </div>
          </div>

          {/* カテゴリ選択 */}
          <div className="input-section">
            <label className="input-label">
              <Tag size={16}/>
              カテゴリ <span className="required">*</span>
            </label>
            <div className="category-grid">
              {categories[activeTab].map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySelect(category.id)}
                  className={`category-button ${
                    formData.category == category.id
                     ? "category-button-selected"
                     : ""
                  }`}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span className="category-name">{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 追加ボタン */}
          <button
            type="button"
            className="submit-button"
          >
            <Plus size={20} />
            追加
          </button>
        </div>
      </main>

      <footer className="footer">
        <nav className="footer-nav">
          <a href="#" className="nav-item">
            <List className="nav-icon" size={20}/>
            <span className="nav-label">履歴</span>
          </a>
          <a href="#" className="nav-item">
            <Wallet className="nav-icon" size={20}/>
            <span className="nav-label">予算</span>
          </a>
          <a href="#" className="nav-item">
            <Bell className="nav-icon" size={20}/>
            <span className="nav-label">通知</span>
          </a>
          <a href="#" className="nav-item">
            <User className="nav-icon" size={20}/>
            <span className="nav-label">マイページ</span>
          </a>
        </nav>
      </footer>
    </div>
  )
}

export default ManualInput;