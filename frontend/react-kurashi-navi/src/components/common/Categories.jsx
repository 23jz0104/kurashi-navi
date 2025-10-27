import React, { useState } from "react";
import styles from "./Categories.module.css";
import { useCategories } from "../hooks/useCategories";

const Categories = ({ activeTab = "expense", selectedCategory, onSelected }) => {

  const { categoriesByType } = useCategories();

  const handleSelected = (categoryId) => {
    onSelected?.(categoryId);
  };

  const currentCategories = categoriesByType[activeTab] || [];

  return (
    <div>
      <div className={styles["category-grid"]}>
        {currentCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleSelected(category.id)}
            className={`
              ${styles["category-button"]}
              ${selectedCategory === category.id ? styles["selected"] : ""}
            `}
          >
            {/* ▼▼▼ 5. フックから整形済みの .icon と .color を使う ▼▼▼ */}
            <span 
              className={styles["category-icon"]}
              // フックから色も動的に設定
              style={{ backgroundColor: category.color }} 
            >
              {category.icon}
            </span>
            <span className={styles["category-name"]}>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Categories;