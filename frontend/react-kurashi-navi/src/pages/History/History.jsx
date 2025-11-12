import { useState } from "react";
import styles from "../../styles/History/History.module.css"
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import MonthPicker from "../../components/common/MonthPicker";
import { ChartPie, CalendarDays } from "lucide-react";
import GraphView from "../../components/common/GraphView";
import CalendarView from "../../components/common/CalendarView";
import { useCategories } from "../../hooks/useCategories";
import { expenseReceiptData, incomeData } from "../../mocks/historyData";

const History = () => {
  const [activeTab, setActiveTab] = useState("graph");
  const [selectedDataType, setSelectedDataType] = useState("expense");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date;
  });

  const { getCategoryById } = useCategories();

  const tabs = [
    { id: "graph", label: "グラフ", icon: <ChartPie size={20} /> },
    { id: "calendar", label: "カレンダー", icon: <CalendarDays size={20} /> },
  ];

  const handleTabChange = (tabId) => {
    if(tabId === activeTab) return;
    setActiveTab(tabId);
  };

  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
  };

  //データを全取得する場合はJSでフィルタリングする（可能であればAPIでフィルタリング） 
  const filterItemsByMonth = (items, targetMonth) => {
    const targetYear = targetMonth.getFullYear();
    const targetMonthIndex = targetMonth.getMonth();

    return items.filter((item) => {
      const itemDate = new Date(item.date);

      return (
        itemDate.getFullYear() === targetYear &&
        itemDate.getMonth() === targetMonthIndex
      );
    });
  };

  const calculateCategoryTotals = (entries) => {
    if (!entries || entries.length === 0) {
      return [];
    }
    const totals = {};
    entries.forEach((entry) => {
      entry.items.forEach((item) => {
        const { categoryId, price, quantity } = item;
        const total = price * quantity;
        if (!totals[categoryId]) totals[categoryId] = 0;
        totals[categoryId] += total;
      });
    });
  
    return Object.entries(totals).map(([categoryId, total]) => {
      // ↓ フックから取得した関数でカテゴリ情報を取得
      const category = getCategoryById(Number(categoryId));
  
      // (フックがデータロード中の場合、categoryがundefinedになるため一時表示)
      if (!category) {
        return {
          categoryId: Number(categoryId),
          categoryName: "...",
          icon: null,
          color: "#ccc",
          total
        };
      }
  
      return {
        categoryId: category.id,
        categoryName: category.name,
        icon: category.icon, // ← フックが整形した .icon をそのまま使う
        color: category.color,
        total,
      };
    });
  };

  // calculateDailyTotals関数を以下のように変更
  const calculateDailyTotals = (expenseData, incomeData) => {
    const dailyMap = {};
  
    // 支出データを集計
    expenseData.forEach((entry) => {
      const dateKey = entry.date;
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, categories: {} };
      }
      entry.items.forEach((item) => {
        const { categoryId, price, quantity } = item;
        const total = price * quantity;
        
        if (!dailyMap[dateKey].categories[categoryId]) {
          const category = getCategoryById(Number(categoryId));
          dailyMap[dateKey].categories[categoryId] = {
            categoryId: Number(categoryId),
            categoryName: category?.name || "...",
            icon: category?.icon || null,
            color: category?.color || "#ccc",
            total: 0,
            type: "expense" // ← 追加
          };
        }
        dailyMap[dateKey].categories[categoryId].total += total;
      });
    });
  
    // 収入データを集計
    incomeData.forEach((entry) => {
      const dateKey = entry.date;
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, categories: {} };
      }
      entry.items.forEach((item) => {
        const { categoryId, price, quantity } = item;
        const total = price * quantity;
        
        if (!dailyMap[dateKey].categories[categoryId]) {
          const category = getCategoryById(Number(categoryId));
          dailyMap[dateKey].categories[categoryId] = {
            categoryId: Number(categoryId),
            categoryName: category?.name || "...",
            icon: category?.icon || null,
            color: category?.color || "#ccc",
            total: 0,
            type: "income" // ← 追加
          };
        }
        dailyMap[dateKey].categories[categoryId].total += total;
      });
    });
  
    // 日付順にソートし、各日付のカテゴリを配列に変換
    return Object.values(dailyMap)
      .map(day => ({
        date: day.date,
        categories: Object.values(day.categories)
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  //選択した月でデータをフィルタリング
  const filteredReceiptData = filterItemsByMonth(expenseReceiptData, selectedMonth);
  const filteredIncomeData = filterItemsByMonth(incomeData, selectedMonth);

  // 支出のカテゴリ別集計
  const expenseCategoryTotals = calculateCategoryTotals(filteredReceiptData);
  const totalExpense = expenseCategoryTotals.reduce((sum, cat) => sum + cat.total, 0);

  // 収入のカテゴリ別集計
  const incomeCategoryTotals = calculateCategoryTotals(filteredIncomeData);
  const totalIncome = incomeCategoryTotals.reduce((sum, cat) => sum + cat.total, 0);

  //
  const dailyTotals = calculateDailyTotals(filteredReceiptData, filteredIncomeData);

  //タブの選択状態に応じてグラフに表示するデータを設定
  const dataForView = selectedDataType === "expense"
  ? filteredReceiptData
  : filteredIncomeData;

  const categoryTotalsForView = selectedDataType === "expense"
  ? expenseCategoryTotals
  : incomeCategoryTotals;

  const tabContent = {
    graph: (
      <GraphView 
        key={`${activeTab}-${selectedDataType}`}
        data={dataForView}
      />
    ),
    calendar: (
      <CalendarView 
        key={activeTab} 
        expenseReceiptData={filteredReceiptData} 
        incomeData={filteredIncomeData} 
        currentMonth={selectedMonth}
      />
    ),
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
        <div className={styles["main-container"]}>
          {/* カレンダー */}
          <MonthPicker onMonthChange={handleMonthChange}/>

          {/* サマリー */}
          <div className={styles["finance-summry"]}>
            <div className={`${styles["finance-item"]} ${styles["expense"]}`}>
              <span className={styles["label"]}>支出</span>
              <span className={`${styles["value"]} ${styles["expense"]}`}>¥{totalExpense.toLocaleString()}</span>
            </div>
            <div className={`${styles["finance-item"]} ${styles["income"]}`}>
              <span className={styles["label"]}>収入</span>
              <span className={`${styles["value"]} ${styles["income"]}`}>¥{totalIncome.toLocaleString()}</span>
            </div>
            <div className={`${styles["finance-item"]} ${styles["balance"]}`}>
              <span className={styles["label"]}>収支</span>
              <span className={`${styles["value"]} ${totalIncome - totalExpense >= 0 ? styles["positive"] : styles["negative"]}`} >¥{(totalIncome - totalExpense).toLocaleString()}</span>
            </div>
          </div>

          <div className={styles["view-container"]}>
            <div className={styles["view-controls"]}>
              {activeTab === "graph" && (
                <>
                  <button 
                    className={`
                      ${styles["control-button"]}
                      ${selectedDataType === "expense" ? styles["active"] : ""}
                    `}
                    onClick={() => setSelectedDataType("expense")}
                  >
                    支出
                  </button>
                  <button
                    className={`
                      ${styles["control-button"]}
                      ${selectedDataType === "income" ? styles["active"] : ""}
                    `}
                    onClick={() => setSelectedDataType("income")}
                  >
                    収入
                  </button>
              </>
              )}
            </div>
            {/* 選択中のタブに応じてグラフとカレンダーを切り替える */}
            <div className={styles["graph-container"]}>
              {tabContent[activeTab]}
            </div>
          </div>

          {/* 詳細セクション: タブに応じて表示を切り替え */}
          {activeTab === "graph" && categoryTotalsForView.length > 0 && (
            <div className={styles["detail"]}>
              {categoryTotalsForView.map((category) => (
                <div key={category.categoryId} className={styles["flex"]}>
                  <span className={styles["category-icon"]} style={{ backgroundColor: category.color }}>
                    {category.icon}
                  </span>
                  <span className={styles["category-name"]}>{category.categoryName}</span>
                  <span className={styles["category-price"]}>¥{category.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "calendar" && dailyTotals.length > 0 && (
            <div className={styles["detail"]}>
              {dailyTotals.map((day) => {
                const date = new Date(day.date);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const dayNum = date.getDate();
                const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
                const weekday = weekdays[date.getDay()];
                
                return (
                  <div key={day.date} className={styles["daily-group"]}>
                    <div className={styles["date-header"]}>
                      {year}年{month}月{dayNum}日 ({weekday})
                    </div>
                    <div className={styles["category-list"]}>
                      {day.categories.map((category) => (
                        <div key={category.categoryId} className={styles["flex"]}>
                          <span className={styles["category-icon"]} style={{ backgroundColor: category.color }}>
                            {category.icon}
                          </span>
                          <span className={styles["category-name"]}>{category.categoryName}</span>
                          <span className={`${styles["category-price"]} ${category.type === "income" ? styles["income"] : ""}`}>¥{category.total.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      }
    />
  );
};

export default History;