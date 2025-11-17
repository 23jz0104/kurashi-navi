import React from "react";
import styles from "./Categories.module.css";

const Categories = ({ categories, selectedCategoryId, onSelectedCategory }) => {
  return (
    <div>
      <div className={styles["category-grid"]}>
        {categories.map((category) => {
          const isSelected = category.id === selectedCategoryId;

          return (
            <button
              key={category.id}
              className={`${styles["category-button"]} ${isSelected ? styles["selected"] : ""}`}
              onClick={() => onSelectedCategory(category.id)}
            >
              {categories.category.name}
            </button>
          )
        })}
      </div>
    </div>
  );
};

export default Categories;