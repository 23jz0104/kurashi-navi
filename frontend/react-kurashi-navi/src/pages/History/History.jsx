import { CalendarDays, ChartPie } from "lucide-react";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import styles from "../../styles/History/History.module.css";
import { useTab } from "../../hooks/useTab";
import MonthPicker from "../../components/common/MonthPicker";
import { useGetRecord } from "../../hooks/history/useGetRecord";

const History = () => {
  const { activeTab, handleTabChange } = useTab("graph");
  const { isLoading, record } = useGetRecord("2025-11");

  if (isLoading) {
    return <div>ロード中...</div>
  }

  const headerTabs = [
    { id: "graph", label: "グラフ", icon: <ChartPie size={20} /> },
    { id: "calendar", label: "カレンダー", icon: <CalendarDays size={20} /> },
  ];

  //recordをもとにして支出と収入を計算
  const totalIncome = record.records?.reduce((sum, r) => {
    return r.type_id === "1" ? sum + Number(r.total_amount) : sum ;
  }, 0);
  const totalExpense = record.records?.reduce((sum, r) => {
    return r.type_id === "2" ? sum + Number(r.total_amount) : sum ;
  }, 0);
  const balance = totalIncome - totalExpense;

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
          <MonthPicker />

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
              <span className={styles["value"]}>¥{balance.toLocaleString()}</span>
            </div>
          </div>
        </div>
      }
    />
  )
};

export default History;