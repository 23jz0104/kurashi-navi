import React, { useState } from "react";
import styles from "../../styles/Budget/BudgetControl.module.css";
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";

function BudgetControl() {
  const [activeTab, setActiveTab] = useState("budget");

  const tabs = [{ id: "budget", label: "予算確認", icon: null },
                 { id: "budget", label: "予算設定", icon: null }
  ];

  const headerContent = (
    <TabButton tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
  );


  const mainContent = (
    <div className={styles.container}>
 
    </div>
  );

  return <Layout headerContent={headerContent} mainContent={mainContent} />;
}

export default BudgetControl;
