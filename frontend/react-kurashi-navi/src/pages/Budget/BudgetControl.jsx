import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import styles from "../../styles/Budget/BudgetControl.module.css";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";

// カテゴリ選択コンポーネント
function CategorySelect({ filteredCategories, selectedCategory, setSelectedCategory }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const handleSelect = (id) => {
    setSelectedCategory(id);
    setIsOpen(false);
  };

  const selected = filteredCategories.find(c => c.id === selectedCategory);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => setIsOpen(false), [filteredCategories]);

  return (
    <div className={styles.categorySelectWrapper} ref={wrapperRef}>
      <div className={styles.selectedCategory} onClick={() => setIsOpen(prev => !prev)}>
        {selected && <span className={styles.selectedIcon}>{selected.icon}</span>}
        {selected && <span className={styles.selectedText}>{selected.name}</span>}
        <span className={styles.arrow}>▾</span>
      </div>
      {isOpen && (
        <div className={styles.dropdownList} style={{ maxHeight: "150px", overflowY: "auto" }}>
          {filteredCategories.map(category => (
            <div
              key={category.id}
              className={styles.dropdownItem}
              onClick={() => handleSelect(category.id)}
            >
              <span className={styles.icon}>{category.icon}</span>
              <span>{category.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// カスタムドロップダウン
function DropdownSelect({ options, selectedValue, setSelectedValue }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.categorySelectWrapper} ref={wrapperRef}>
      <div className={styles.selectedCategory} onClick={() => setIsOpen(prev => !prev)}>
        {options.find(o => o.value === selectedValue)?.label || "選択してください"}
        <span className={styles.arrow}>▾</span>
      </div>
      {isOpen && (
        <div className={styles.dropdownList} style={{ maxHeight: "150px", overflowY: "auto" }}>
          {options.map(opt => (
            <div
              key={opt.value}
              className={styles.dropdownItem}
              onClick={() => { setSelectedValue(opt.value); setIsOpen(false); }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BudgetControl() {
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("budget");
  const [checkSelectedCategory, setCheckSelectedCategory] = useState(null);

  const [settingSelectedCategory, setSettingSelectedCategory] = useState(null);
  const [settingMode, setSettingMode] = useState("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  // エラーメッセージ
  const [amountErrorMessage, setAmountErrorMessage] = useState("");
  const [repeatErrorMessage, setRepeatErrorMessage] = useState("");
  const [addErrorMessage, setAddErrorMessage] = useState("");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [addedCategories, setAddedCategories] = useState([]);

  const [isRepeatFormOpen, setIsRepeatFormOpen] = useState(false);

  const [incomeRepeat, setIncomeRepeat] = useState({ date: "", interval: "every_month", holiday: "no" });
  const [repeatDate, setRepeatDate] = useState("");
  const [repeatInterval, setRepeatInterval] = useState("every_month");
  const [repeatHoliday, setRepeatHoliday] = useState("no");

  const tabs = [
    { id: "budget", label: "予算確認", icon: null },
    { id: "budget1", label: "予算設定", icon: null },
  ];

  const expenseCategories = [
    { id: 1, name: "食費", icon: "🍽️" },
    { id: 2, name: "交通費", icon: "🚃" },
    { id: 3, name: "光熱費", icon: "💡" },
    { id: 4, name: "娯楽", icon: "🎮" },
  ];
  const incomeCategories = [
    { id: 101, name: "給与", icon: "💰" },
    { id: 102, name: "その他", icon: "🪙" },
  ];

  const filteredCategoriesForCheck = [...expenseCategories, ...incomeCategories];
  const filteredCategoriesForSetting = settingMode === "expense" ? expenseCategories : incomeCategories;

  const intervalOptions = [
    { value: "every_month", label: "毎月" },
    { value: "every_2_months", label: "2ヶ月ごと" },
    { value: "every_3_months", label: "3ヶ月ごと" },
  ];
  const holidayOptions = [
    { value: "no", label: "何もしない" },
    { value: "before", label: "直前の平日" },
    { value: "after", label: "直後の平日" },
  ];
  const dateOptions = Array.from({ length: 31 }, (_, i) => ({ value: i + 1, label: `${i + 1}日` }));

  const resetForm = (mode) => {
    const categories = mode === "expense" ? expenseCategories : incomeCategories;
    setSettingSelectedCategory(categories[0]?.id || null);
    setTitle("");
    setAmount("");
    setIsRepeatFormOpen(false);
    if (mode === "income") {
      setRepeatDate(incomeRepeat.date);
      setRepeatInterval(incomeRepeat.interval);
      setRepeatHoliday(incomeRepeat.holiday);
    } else {
      setRepeatDate("");
      setRepeatInterval("every_month");
      setRepeatHoliday("no");
    }
  };

  useEffect(() => {
    setAddedCategories([]);
    setTitle("");
    setAmount("");
    setSettingSelectedCategory(null);
    setIsRepeatFormOpen(false);
    setAmountErrorMessage("");
    setRepeatErrorMessage("");
    setAddErrorMessage("");
    setSettingMode("expense");
    setRepeatDate("");
    setRepeatInterval("every_month");
    setRepeatHoliday("no");
    setActiveTab("budget");
    setCheckSelectedCategory(null);
  }, [location.pathname]);

  const handleModeChange = (newMode) => {
    setSettingMode(newMode);
    resetForm(newMode);
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  const formattedDate = `${currentDate.getFullYear()}年 ${currentDate.getMonth() + 1}月`;

  return (
    <Layout
      headerContent={<TabButton tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />}
      mainContent={
        <div className={styles.container}>
          {/* 予算確認 */}
          {activeTab === "budget" && (
            <div className={styles["category-grid"]}>
              <div className={styles["month-selector"]}>
                <button onClick={handlePrevMonth}>◁</button>
                <p>{formattedDate}</p>
                <button onClick={handleNextMonth}>▷</button>
              </div>
              {filteredCategoriesForCheck.map(category => {
                const isAdded = addedCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    className={`${styles["category-button"]} ${checkSelectedCategory === category.id ? styles.selected : ""}`}
                    onClick={() => {
                      setCheckSelectedCategory(category.id);
                      if (!isAdded) {
                        setActiveTab("budget1");
                        // カテゴリの id で収入 or 支出を判定
                        const mode = category.id >= 100 ? "income" : "expense";
                        setSettingMode(mode);
                        setSettingSelectedCategory(category.id);
                      }
                    }}
                  >
                    <span className={styles["category-icon"]}>{category.icon}</span>
                    <span className={styles["category-name"]}>{category.name}</span>
                    {!isAdded && <span className={styles.notAddedText}>未追加</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* 予算設定 */}
          {activeTab === "budget1" && (
            <>
              <div className={styles["budget-type-card"]}>
                <button
                  className={`${styles.budgetTypeButton} ${settingMode === "expense" ? styles.selected1 : ""}`}
                  onClick={() => handleModeChange("expense")}
                >
                  支出
                </button>
                <button
                  className={`${styles.budgetTypeButton} ${settingMode === "income" ? styles.selected1 : ""}`}
                  onClick={() => handleModeChange("income")}
                >
                  収入
                </button>
              </div>

              {!isRepeatFormOpen ? (
                <div className={styles.entryCard}>
                  <div className={styles.entryRow}>
                    <span className={styles.label}>タイトル</span>
                    <input
                      type="text"
                      placeholder="未入力"
                      className={styles.inputField}
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                    />
                  </div>
                  <div className={styles.entryRow}>
                    <span className={styles.label}>金額</span>
                    <input
                      type="number"
                      placeholder="未入力"
                      className={styles.inputField}
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                    />
                  </div>
                  <div className={styles.entryRow}>
                    <span className={styles.label}>カテゴリ</span>
                    <CategorySelect
                      filteredCategories={filteredCategoriesForSetting}
                      selectedCategory={settingSelectedCategory}
                      setSelectedCategory={setSettingSelectedCategory}
                    />
                  </div>

                  <div className={styles.entryRow}>
                    <span className={styles.label}>繰り返し</span>
                    {settingMode === "expense" ? (
                      <span className={styles.repeatText}>毎月</span>
                    ) : (
                      <button className={styles.repeatButton} onClick={() => setIsRepeatFormOpen(true)}>
                        {repeatDate ? `設定済み ▾` : `未選択 ▾`}
                      </button>
                    )}
                  </div>

                  {settingMode === "income" && repeatDate && !isRepeatFormOpen && (
                    <div className={styles.repeatSummary}>
                      <div>日付: {repeatDate}日</div>
                      <div>間隔: {intervalOptions.find(o => o.value === repeatInterval)?.label}</div>
                      <div>休日対応: {holidayOptions.find(o => o.value === repeatHoliday)?.label}</div>
                    </div>
                  )}

                  {addErrorMessage && <p className={styles.errorMessage}>{addErrorMessage}</p>}
                  {amountErrorMessage && <p className={styles.errorMessage}>{amountErrorMessage}</p>}
                </div>
              ) : (
                <div className={styles.entryCard}>
                  <div className={styles.repeatSettingRow}>
                    <label>日付：</label>
                    <DropdownSelect options={dateOptions} selectedValue={repeatDate} setSelectedValue={setRepeatDate} />
                  </div>
                  <div className={styles.repeatSettingRow}>
                    <label>繰り返し間隔：</label>
                    <DropdownSelect options={intervalOptions} selectedValue={repeatInterval} setSelectedValue={setRepeatInterval} />
                  </div>
                  <div className={styles.repeatSettingRow}>
                    <label>当日が休日の場合：</label>
                    <DropdownSelect options={holidayOptions} selectedValue={repeatHoliday} setSelectedValue={setRepeatHoliday} />
                  </div>

                  {repeatErrorMessage && <p className={styles.errorMessage}>{repeatErrorMessage}</p>}

                  <div className={styles.repeatFormButtons}>
                    <button
                      className={styles.confirmButton}
                      onClick={() => {
                        if (!repeatDate) {
                          setRepeatErrorMessage("日付が未定義です");
                          setTimeout(() => setRepeatErrorMessage(""), 2000);
                          return;
                        }
                        setIsRepeatFormOpen(false);
                        setIncomeRepeat({ date: repeatDate, interval: repeatInterval, holiday: repeatHoliday });
                      }}
                    >
                      確定
                    </button>
                    <button className={styles.cancelButton} onClick={() => setIsRepeatFormOpen(false)}>
                      キャンセル
                    </button>
                  </div>
                </div>
              )}

              {!isRepeatFormOpen && (
                <button
                  className={styles.addButton}
                  onClick={() => {
                    setAmountErrorMessage("");
                    if (!amount || amount.trim() === "") {
                      setAmountErrorMessage("金額が未入力です");
                      setTimeout(() => setAmountErrorMessage(""), 2000);
                      return;
                    }

                    if (settingMode === "income" && !repeatDate) {
                      setAddErrorMessage("繰り返しが未設定です");
                      setTimeout(() => setAddErrorMessage(""), 2000);
                      return;
                    }

                    if (settingSelectedCategory && !addedCategories.includes(settingSelectedCategory)) {
                      setAddedCategories([...addedCategories, settingSelectedCategory]);
                      setActiveTab("budget");
                      setCheckSelectedCategory(settingSelectedCategory);
                      resetForm(settingMode);
                    }
                  }}
                >
                  追加
                </button>
              )}
            </>
          )}
        </div>
      }
    />
  );
}

export default BudgetControl;
