import React from "react";
import styles from "./Categories.module.css";
import { useCategories } from "../../hooks/useCategories";

const Categories = ({ activeTab = "expense", selectedCategory, onSelected }) => {

  const handleSelected = (categoryId) => {
    onSelected?.(categoryId);
  };

  const { categoriesByType } = useCategories();
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
            <span 
              className={styles["category-icon"]}
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