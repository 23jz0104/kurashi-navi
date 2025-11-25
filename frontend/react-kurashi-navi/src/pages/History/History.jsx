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
  const [transactionType, setTransactionType] = useState("expense");

  const headerTabs = [
    { id: "graph", label: "グラフ", icon: <ChartPie size={20} /> },
    { id: "calendar", label: "カレンダー", icon: <CalendarDays size={20} /> },
  ];

  // transactionType(選択中のタブ)に応じて支出と収入の出力を切り替え
  const filteredMonthSummaryByType = record.monthly.filter((r) => {
    if (transactionType === "income") return r.type === "1";
    if (transactionType === "expense") return r.type === "2";
  });

  const totalIncome = record.monthly
    .filter((r) => r.type === "1")
    .reduce((sum, r) => sum + Number(r.total), 0);
  const totalExpense = record.monthly
    .filter((r) => r.type === "2")
    .reduce((sum, r) => sum + Number(r.total), 0);

  // カレンダービュー用: 日付ごとにグループ化（支出・収入どちらも含む）
  const dailyGroupedData = record.daily.reduce((acc, item) => {
    const date = item.record_date;

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push({
      category_name: item.category_name,
      total: item.total,
      type_id: item.type_id,
    });

    return acc;
  }, {});

  // 日付でソート（降順）
  const sortedDates = Object.keys(dailyGroupedData).sort((a, b) =>
    b.localeCompare(a)
  );

  // カレンダータブ用: 支出・収入両方を含む日付ごとのデータ
  const allDailyData = sortedDates
    .map((date) => {
      const categories = dailyGroupedData[date];

      // 支出の合計
      const expenseTotal = categories
        .filter((item) => item.type_id === "2")
        .reduce((sum, cat) => sum + cat.total, 0);

      // 収入の合計
      const incomeTotal = categories
        .filter((item) => item.type_id === "1")
        .reduce((sum, cat) => sum + cat.total, 0);

      return {
        date,
        categories,
        expenseTotal,
        incomeTotal,
        total: incomeTotal - expenseTotal, // 収支
      };
    })
    .filter((day) => day.categories.length > 0);

  const viewContent = {
    graph: <GraphView summary={filteredMonthSummaryByType} />,
    calendar: (
      <CalendarView
        dailySummary={record.daily}
        currentMonth={selectedMonth}
      />
    ),
  };

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
              <span className={`${styles["value"]} ${styles["expense"]}`}>
                ¥{totalExpense.toLocaleString()}
              </span>
            </div>
            <div className={`${styles["finance-item"]} ${styles["income"]}`}>
              <span className={styles["label"]}>収入</span>
              <span className={`${styles["value"]} ${styles["income"]}`}>
                ¥{totalIncome.toLocaleString()}
              </span>
            </div>
            <div className={`${styles["finance-item"]} ${styles["balance"]}`}>
              <span className={styles["label"]}>収支</span>
              <span className={styles["value"]}>
                ¥{(totalIncome - totalExpense).toLocaleString()}
              </span>
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
              {isRecordLoading ? (
                <div className={styles["loading-text"]}>読み込み中...</div>
              ) : (
                viewContent[activeTab]
              )}
            </div>
          </div>

          {/* グラフタブ: カテゴリ詳細（支出 or 収入を切り替え） */}
          {activeTab === "graph" && (
            <div className={styles["detail"]}>
              {filteredMonthSummaryByType.map((r, index) => (
                <div className={styles["flex"]} key={index}>
                  <span className={styles["category-icon"]}></span>
                  <span className={styles["category-name"]}>
                    {r.category_name}
                  </span>
                  <span className={styles["category-price"]}>
                    ¥{r.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* カレンダータブ: 日付ごとの詳細（支出・収入を同時表示） */}
          {activeTab === "calendar" && allDailyData.length > 0 && (
            <div className={styles["detail"]}>
              {allDailyData.map((day) => {
                const date = new Date(day.date);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const dayNum = date.getDate();
                const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
                const weekday = weekdays[date.getDay()];

                return (
                  <div key={day.date} className={styles["daily-group"]}>
                    <div className={styles["date-header"]}>
                      <span>
                        {year}年{month}月{dayNum}日 ({weekday})
                      </span>
                    </div>
                    <div className={styles["category-list"]}>
                      {day.categories.map((category, idx) => (
                        <div key={idx} className={styles["flex"]}>
                          <span className={styles["category-icon"]}></span>
                          <span className={styles["category-name"]}>
                            {category.category_name}
                          </span>
                          <span
                            className={`${styles["category-price"]} ${
                              category.type_id === "1"
                                ? styles["income"]
                                : styles["expense"]
                            }`}
                          >
                            ¥{category.total.toLocaleString()}
                          </span>
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