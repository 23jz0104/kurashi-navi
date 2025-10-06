import React from "react";
import "./TabButton.css";

const TabButton = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="header-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? "tab-active" : ""}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))};
    </div>
  )
}

export default TabButton;