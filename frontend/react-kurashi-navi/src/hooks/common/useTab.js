import { useState } from "react"

export const useTab = (defaultTab) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (tabId) => {
    if (tabId === activeTab) return;
    setActiveTab(tabId);
  };

  return { activeTab, handleTabChange} ;
};