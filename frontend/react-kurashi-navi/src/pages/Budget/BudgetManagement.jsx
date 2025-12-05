import { useState } from "react";
import Layout from "../../components/common/Layout";
import BudgetView from "../../components/BudgetManagement/BudgetView";
import TabButton from "../../components/common/TabButton";
import styles from "../../styles/Budget/BudgetManagement.module.css";
import MonthPicker from "../../components/common/MonthPicker";
import { useMonthPicker } from "../../hooks/common/useMonthPicker";
import BudgetCreate from "../../components/BudgetManagement/BudgetCreate";

const BudgetManagement = () => {
  const [activeTab, setActiveTab] = useState("view");
  const { selectedMonth, changeMonth, setMonth, getMonthString } = useMonthPicker();

  const tabs = [
    { id: "view", label: "予算確認", icon: null },
    { id: "edit", label: "予算設定", icon: null },
  ];

  return (
    <Layout 
      headerContent={
        <TabButton 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      }
      mainContent={
        <div className={styles["main-container"]}>
          
          {/* 共通の画面上部のカレンダー */}
          <MonthPicker
            selectedMonth={selectedMonth}
            onMonthChange={changeMonth}
            onMonthSelect={setMonth}
          />

          {/* タブに応じてコンポーネントを切り替え */}
          {activeTab === "view" && <BudgetView selectedMonth={getMonthString(selectedMonth)}/>}
          {activeTab === "edit" && <BudgetCreate />}
        </div>
      }
    />
  )
}

export default BudgetManagement;