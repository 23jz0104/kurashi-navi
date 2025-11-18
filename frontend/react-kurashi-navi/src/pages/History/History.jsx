import { CalendarDays, ChartPie } from "lucide-react";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import styles from "../../styles/History/History.module.css";
import { useTab } from "../../hooks/common/useTab";
import MonthPicker from "../../components/common/MonthPicker";
import { useGetRecord } from "../../hooks/history/useGetRecord";
import { useMonthPicker } from "../../hooks/common/useMonthPicker";
import { useState } from "react";
import GraphView from "../../components/common/GraphView";
import CalendarView from "../../components/common/CalendarView";

const History = () => {
  const { activeTab, handleTabChange } = useTab("graph");
  const { selectedMonth, changeMonth, setMonth, getMonthString } = useMonthPicker();
  const { isLoading: isRecordLoading, record } = useGetRecord(getMonthString(selectedMonth));
  const [ transactionType, setTransactionType ] = useState("expense");

  if (isRecordLoading) {
    return <div>ロード中...</div>
  }

  const headerTabs = [
    { id: "graph", label: "グラフ", icon: <ChartPie size={20} /> },
    { id: "calendar", label: "カレンダー", icon: <CalendarDays size={20} /> },
  ];
  
  //transactionType(選択中のタブ)に応じて支出と収入の出力を切り替え
  const filteredRecordsByType = record.filter(r => {
    if (transactionType === "income") return r.type === "1";
    if (transactionType === "expense") return r.type === "2";
  });

  const totalIncome = record.filter(r => r.type === "1").reduce((sum, r) => sum + Number(r.total), 0);
  const totalExpense = record.filter(r => r.type === "2").reduce((sum, r) => sum + Number(r.total), 0);

  const viewContent = {
    graph: (
      <GraphView summary={filteredRecordsByType}/>
    ),
    calendar: (
      <CalendarView />
    )
  }

  return (
    <Layout 
      headerContent={
        <TabButton
          tabs={headerTabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      }
      mainContent={
        <div className={styles["main-container"]}>
          <MonthPicker 
            selectedMonth={selectedMonth} 
            onMonthChange={changeMonth}
            onMonthSelect={setMonth}
          />

          <div className={styles["finance-summary"]}>
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
              <span className={styles["value"]}>¥{totalIncome - totalExpense}</span>
            </div>
          </div>

          <div className={styles["view-container"]}>
            <div className={styles["view-controls"]}>
              {activeTab === "graph" && (
                <>
                  <button
                    className={`
                      ${styles["control-button"]}
                      ${transactionType === "expense" ? styles["active"] : ""}
                    `}
                    onClick={() => setTransactionType("expense")}
                  >
                    支出
                  </button>
                  <button
                    className={`
                      ${styles["control-button"]}
                      ${transactionType === "income" ? styles["active"] : ""}  
                    `}
                    onClick={() => setTransactionType("income")}
                  >
                    収入
                  </button>
                </>
              )}
            </div>
            <div className={styles["graph-container"]}>
              {viewContent[activeTab]}
            </div>
          </div>

          {activeTab === "graph" && (
            <div className={styles["detail"]}>
              {filteredRecordsByType.map((r, index) => (
                <div className={styles["flex"]} key={index}>
                  <span className={styles["category-icon"]}></span>
                  <span className={styles["category-name"]}>{r.category_name}</span>
                  <span className={styles["category-price"]}>¥{r.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      }
    />
  )
};

export default History;