import { useEffect, useState } from "react";
import styles from "../../styles/History/History.module.css"
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import MonthPicker from "../../components/common/MonthPicker";
import { ChartPie, CalendarDays } from "lucide-react";
import GraphView from "../../components/common/GraphView";
import CalendarView from "../../components/common/CalendarView";
import { useGetRecord } from "../../hooks/history/useGetRecord";

const History = () => {
  const [activeTab, setActiveTab] = useState("graph");
  const [selectedDataType, setSelectedDataType] = useState("expense");
  const [summaryData, setSummaryData] = useState([]);
  const [dailyTotals, setDailyTotals] = useState([]);
  const categoryTotalsForView = summaryData; // これでダミー依存なし
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date;
  });

  const { isLoading, getRecord } = useGetRecord();

  const [totalIncomeAmount, setTotalIncomeAmount] = useState(0);
  const [totalExpenseAmount, setTotalExpenseAmount] = useState(0);
  const selectedMonthString = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, '0')}`;
  
  useEffect(() => {
    const fetchTotals = async () => {
      const result = await getRecord(selectedMonthString);
  
      const incomeRecord = result.records.filter(r => r.type_id === "1");
      const expenseRecord = result.records.filter(r => r.type_id === "2");
      
      setTotalIncomeAmount(incomeRecord.reduce((sum, r) => sum + Number(r.total_amount), 0));
      setTotalExpenseAmount(expenseRecord.reduce((sum, r) => sum + Number(r.total_amount), 0));
      setSummaryData(result.summary);
    };
  
    fetchTotals();
  }, [selectedMonthString]);

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

  const expenseDataForCalendar = summaryData.filter(d => d.type === "expense");
  const incomeDataForCalendar = summaryData.filter(d => d.type === "income");
  
  //タブの選択状態に応じてグラフに表示するデータを設定
  const dataForView = selectedDataType === "expense"
  ? summaryData.filter(d => d.type === "2")
  : summaryData.filter(d => d.type === "1");

  console.log("summaryData:", JSON.stringify(summaryData, null, 1));

  const tabContent = {
    graph: (
      <GraphView 
        key={`${activeTab}-${selectedDataType}`}
        summary={dataForView}
      />
    ),
    calendar: (
      <CalendarView 
        key={activeTab} 
        expenseReceiptData={expenseDataForCalendar} 
        incomeData={incomeDataForCalendar} 
        currentMonth={selectedMonth}
      />
    ),
  };

  const debug = async () => {

    const result = await getRecord(selectedMonthString);  
    console.log("month", JSON.stringify(result.month, null, 1));
    console.log("records", JSON.stringify(result.records, null, 1));
    console.log("summary", JSON.stringify(result.summary, null, 1));

    {/* Type_id{id} 1が収入 2が支出 */}

    const incomeRecord = result.records.filter(record => record.type_id === "1");

    const totalIncomeAmount = incomeRecord.reduce((sum, record) => {
      return sum + Number(record.total_amount);
    }, 0);

    const expenseRecord = result.records.filter(record => record.type_id === "2");

    const totalExpenseAmount = expenseRecord.reduce((sum, record) => {
      return sum + Number(record.total_amount);
    }, 0);

    console.log("Type_id 1(収入)の合計", totalIncomeAmount);
    console.log("Type_id 2(支出)の合計: ", totalExpenseAmount);
  };

  if(isLoading) {
    return (
      <>ロード中</>
    )
  }

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
              <span className={`${styles["value"]} ${styles["expense"]}`}>¥{totalExpenseAmount.toLocaleString()}</span>
            </div>
            <div className={`${styles["finance-item"]} ${styles["income"]}`}>
              <span className={styles["label"]}>収入</span>
              <span className={`${styles["value"]} ${styles["income"]}`}>¥{totalIncomeAmount.toLocaleString()}</span>
            </div>
            <div className={`${styles["finance-item"]} ${styles["balance"]}`}>
              <span className={styles["label"]}>収支</span>
              <span className={`${styles["value"]} ${totalIncomeAmount - totalExpenseAmount >= 0 ? styles["positive"] : styles["negative"]}`} >¥{(totalIncomeAmount - totalExpenseAmount).toLocaleString()}</span>
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
                <div className={styles["flex"]}>
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
          
          <button onClick={() => debug()} disabled={isLoading}>コンソールに表示</button>
        </div>
      }
    />
  );
};

export default History;