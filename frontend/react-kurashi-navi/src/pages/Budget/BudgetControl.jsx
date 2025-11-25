import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import styles from "../../styles/Budget/BudgetControl.module.css";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import MonthPicker from "../../components/common/MonthPicker";

// カテゴリ／通常ドロップダウン
function CustomSelect({ options, selectedValue, setSelectedValue, isCategory }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const selected = isCategory
    ? options.find(o => o.id === selectedValue)
    : options.find(o => o.value === selectedValue);

  const handleSelect = (val) => {
    setSelectedValue(val);
    setIsOpen(false);
  };

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
        {isCategory && selected?.icon && <span className={styles.selectedIcon}>{selected.icon}</span>}
        <span className={`${styles.selectedText} ${!selected ? styles.unselected : ""}`}>
          {isCategory ? selected?.name : selected?.label || "未選択"}
        </span>
        <span className={styles.arrow}>▾</span>
      </div>
      {isOpen && (
        <div className={styles.dropdownList}>
          {options.map(opt => (
            <div
              key={isCategory ? opt.id : opt.value}
              className={styles.dropdownItem}
              onClick={() => handleSelect(isCategory ? opt.id : opt.value)}
            >
              {isCategory && <span className={styles.icon}>{opt.icon}</span>}
              <span>{isCategory ? opt.name : opt.label}</span>
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

  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [checkSelectedCategory, setCheckSelectedCategory] = useState(null);
  const [settingSelectedCategory, setSettingSelectedCategory] = useState(null);
  const [settingMode, setSettingMode] = useState("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [amountErrorMessage, setAmountErrorMessage] = useState("");
  const [repeatErrorMessage, setRepeatErrorMessage] = useState("");
  const [addErrorMessage, setAddErrorMessage] = useState("");
  const [addedCategories, setAddedCategories] = useState([]);
  const [isRepeatFormOpen, setIsRepeatFormOpen] = useState(false);
  const [incomeRepeat, setIncomeRepeat] = useState({ date: "", interval: "every_month", holiday: "no" });
  const [repeatDate, setRepeatDate] = useState("");
  const [repeatInterval, setRepeatInterval] = useState("every_month");
  const [repeatHoliday, setRepeatHoliday] = useState("no");

  const [detailMode, setDetailMode] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  // tabs
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

  // --- resetForm ---
  const resetForm = (mode, categoryReset = true) => {
    if (categoryReset) setSettingSelectedCategory(null);
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

  // --- localStorage復元 ---
  useEffect(() => {
    const saved = localStorage.getItem("addedCategories");
    if (saved) setAddedCategories(JSON.parse(saved));
  }, []);

  // --- addedCategories 変更時に保存 ---
  useEffect(() => {
    localStorage.setItem("addedCategories", JSON.stringify(addedCategories));
  }, [addedCategories]);

  // --- location変更時リセット ---
  useEffect(() => {
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
    setDetailMode(false);
    setDetailItem(null);
  }, [location.pathname]);

  const handleModeChange = (newMode) => {
    setSettingMode(newMode);
    resetForm(newMode);
  };

  return (
    <Layout
      headerContent={<TabButton tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />}
      mainContent={
        <div className={styles.container}>

          {/* 予算確認画面 */}
          {activeTab === "budget" && (
            <div className={styles["category-grid"]}>
              {!detailMode && (
                <>
                  <div className={styles["month-selector-wrapper"]}>
                    <MonthPicker
                      selectedMonth={selectedMonth}
                      onMonthChange={(offset) => {
                        const newDate = new Date(selectedMonth);
                        newDate.setMonth(newDate.getMonth() + offset);
                        setSelectedMonth(newDate);
                      }}
                      onMonthSelect={(year, monthIndex) => {
                        const newDate = new Date(year, monthIndex, 1);
                        setSelectedMonth(newDate);
                      }}
                    />
                  </div>

                  {filteredCategoriesForCheck.map(category => {
                    const addedItem = addedCategories.find(c => c.id === category.id);

                    return (
                      <div
                        key={category.id}
                        className={`${styles["category-button"]} ${checkSelectedCategory === category.id ? styles.selected : ""}`}
                        onClick={() => {
                          setCheckSelectedCategory(category.id);
                          if (!addedItem) {
                            setActiveTab("budget1");
                            const mode = category.id >= 100 ? "income" : "expense";
                            setSettingMode(mode);
                            setSettingSelectedCategory(category.id);
                            resetForm(mode, false);
                          }
                        }}
                      >
                        <span className={styles["category-icon"]}>{category.icon}</span>
                        <span className={styles["category-name"]}>{category.name}</span>
                        {!addedItem && <div className={styles.notAddedMessage}>未追加</div>}
                        {addedItem && (
                          <div
                            className={styles.detailButtonInCategory}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailMode(true);
                              setDetailItem(addedItem);
                              setSettingMode(addedItem.mode);
                              setSettingSelectedCategory(category.id);
                              setTitle(addedItem.title);
                              setAmount(addedItem.amount.toString());
                              if (addedItem.mode === "income" && addedItem.repeat) {
                                setRepeatDate(addedItem.repeat.date);
                                setRepeatInterval(addedItem.repeat.interval);
                                setRepeatHoliday(addedItem.repeat.holiday);
                              }
                            }}
                          >
                            詳細情報
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {/* 詳細情報画面 */}
              {detailMode && detailItem && (
                <div className={styles.entryCard}>
                  <h3>詳細情報</h3>

                  <div className={styles.entryRow}>
                    <span className={styles.label}>タイトル</span>
                    <input type="text" value={title} readOnly className={styles.inputField} />
                  </div>

                  <div className={styles.entryRow}>
                    <span className={styles.label}>金額</span>
                    <input type="number" value={amount} readOnly className={styles.inputField} />
                  </div>

                  <div className={styles.entryRow}>
                    <span className={styles.label}>カテゴリ</span>
                    <div className={styles.fixedCategoryBox}>
                      <span className={styles.fixedIcon}>
                        {filteredCategoriesForCheck.find(c => c.id === settingSelectedCategory)?.icon || ""}
                      </span>
                      <span>
                        {filteredCategoriesForCheck.find(c => c.id === settingSelectedCategory)?.name || ""}
                      </span>
                    </div>
                  </div>

                  <div className={styles.repeatSummary}>
                    {detailItem.mode === "income" && detailItem.repeat ? (
                      <>
                        <div>日付: {detailItem.repeat.date}日</div>
                        <div>間隔: {intervalOptions.find(o => o.value === detailItem.repeat.interval)?.label}</div>
                        <div>休日対応: {holidayOptions.find(o => o.value === detailItem.repeat.holiday)?.label}</div>
                      </>
                    ) : detailItem.mode === "expense" ? (
                      <div>毎月</div>
                    ) : null}
                  </div>

                  <div className={styles.detailButtons}>
                    <button
                      className={styles.deleteButton}
                      onClick={() => {
                        setAddedCategories(prev => prev.filter(c => c.id !== detailItem.id));
                        setCheckSelectedCategory(null);
                        setDetailMode(false);
                        setDetailItem(null);
                        setTitle("");
                        setAmount("");
                        setSettingSelectedCategory(null);
                        setRepeatDate("");
                        setRepeatInterval("every_month");
                        setRepeatHoliday("no");
                      }}
                    >
                      削除
                    </button>

                    <button
                      className={styles.backButton}
                      onClick={() => {
                        setDetailMode(false);
                        setDetailItem(null);
                        setTitle("");
                        setAmount("");
                        setSettingSelectedCategory(null);
                        setRepeatDate("");
                        setRepeatInterval("every_month");
                        setRepeatHoliday("no");
                      }}
                    >
                      戻る
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 予算設定画面 */}
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
                    <CustomSelect
                      options={filteredCategoriesForSetting}
                      selectedValue={settingSelectedCategory}
                      setSelectedValue={setSettingSelectedCategory}
                      isCategory={true}
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
                    <CustomSelect
                      options={dateOptions}
                      selectedValue={repeatDate || null}
                      setSelectedValue={setRepeatDate}
                      isCategory={false}
                    />
                  </div>
                  <div className={styles.repeatSettingRow}>
                    <label>間隔：</label>
                    <CustomSelect
                      options={intervalOptions}
                      selectedValue={repeatInterval}
                      setSelectedValue={setRepeatInterval}
                      isCategory={false}
                    />
                  </div>
                  <div className={styles.repeatSettingRow}>
                    <label>休日対応：</label>
                    <CustomSelect
                      options={holidayOptions}
                      selectedValue={repeatHoliday}
                      setSelectedValue={setRepeatHoliday}
                      isCategory={false}
                    />
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
                    <button className={styles.cancelButton}
                      onClick={() => setIsRepeatFormOpen(false)}>
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
                    setAddErrorMessage("");

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

                    if (!settingSelectedCategory) return;

                    const exists = addedCategories.some(c => c.id === settingSelectedCategory);
                    if (exists) {
                      setAddErrorMessage("このカテゴリは既に追加されています");
                      setTimeout(() => setAddErrorMessage(""), 2000);
                      return;
                    }

                    const newItem = {
                      id: settingSelectedCategory,
                      mode: settingMode,
                      title,
                      amount: Number(amount),
                      repeat: settingMode === "income" ? { date: repeatDate, interval: repeatInterval, holiday: repeatHoliday } : null,
                    };

                    setAddedCategories([...addedCategories, newItem]);
                    setActiveTab("budget");
                    setCheckSelectedCategory(settingSelectedCategory);
                    resetForm(settingMode);
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