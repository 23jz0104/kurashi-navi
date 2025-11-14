import React from "react";
import styles from "./Categories.module.css";

const Categories = ({categories}) => {
  return (
    <div>
      <div className={styles["category-grid"]}>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className={`${styles["category-button"]}`}
          >
            <span className={styles["category-icon"]}></span>
            <span className={styles["category-name"]}>{category.category_name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Categories;