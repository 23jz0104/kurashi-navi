import { useEffect, useState } from "react";
import Layout from "../../components/common/Layout";
import BudgetView from "../../components/BudgetManagement/BudgetView";
import TabButton from "../../components/common/TabButton";
import styles from "../../styles/Budget/BudgetManagement.module.css";
import FixedCostView from "../../components/BudgetManagement/FixedCostView";
import { useLocation, useNavigate } from "react-router-dom";

const BudgetManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialTab = location.state?.initialTab ?? "view";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (location.state?.initialTab) {
      navigate(location.pathname, {
        replace: true,
        state: null,
      });
    }
  }, []);

  const tabs = [
    { id: "view", label: "予算", icon: null },
    { id: "fixedCostView", label: "固定費", icon: null },
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
          {/* タブに応じてコンポーネントを切り替え */}
          {activeTab === "view" && <BudgetView/>}
          {activeTab === "fixedCostView" && <FixedCostView />}
        </div>
      }
    />
  )
}

export default BudgetManagement;