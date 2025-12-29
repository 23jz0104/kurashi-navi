import { useState } from "react";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import ExpenseManualInput from "../../components/DataInput/ExpenseManualInput";
import IncomeManualInput from "../../components/DataInput/IncomeManualInput";
import { Wallet, TrendingUp } from "lucide-react";
import { useCategories } from "../../hooks/common/useCategories";

const ManualInputData = () => {
  const [activeTab, setActiveTab] = useState("expense");
  const {categories: incomeCategories} = useCategories(1) //収入用
  const {categories: expenseCategories} = useCategories(2) //支出用

  const tabs = [
    { id: "expense", label: "支出", icon: <Wallet size={20} /> },
    { id: "income", label: "収入", icon: <TrendingUp size={20} /> },
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
        <>
          {activeTab === "expense" && <ExpenseManualInput categories={expenseCategories}/>}
          {activeTab === "income" && <IncomeManualInput categories={incomeCategories}/>}
        </>
      }
      // hideDataInputButton={true}
      disableDataInputButton={true} // 「+」を無効化
    />
  );
};

export default ManualInputData;