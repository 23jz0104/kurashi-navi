import React, { useState } from "react";
import styles from "./Categories.module.css";

const Categories = ({ activeTab = "expense", onSelected }) => {

  const [selected, setSelected] = useState(null);

   // 仮のカテゴリデータ
  const categories = {
    expense: [
      { id: 1, name: "食費", icon: "🍽️" },
      { id: 2, name: "交通費", icon: "🚃" },
      { id: 3, name: "光熱費", icon: "💡" },
      { id: 4, name: "娯楽", icon: "🎮" },
      { id: 5, name: "その他", icon: "📦" }
    ],
    income: [
      { id: "salary", name: "給与", icon: "💼" },
      { id: "bonus", name: "賞与", icon: "🎁" },
      { id: "side", name: "副業", icon: "💻" },
      { id: "other", name: "その他", icon: "💰" }
    ]
  };

  const handleSelected = (categoryId) => {
    setSelected(categoryId);
    onSelected?.(categoryId);
  }

  return (
    <div>
      <div className={styles["category-grid"]}>
        {categories[activeTab].map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => handleSelected(category.id)}
            className={`
              ${styles["category-button"]}
              ${selected === category.id ? styles["selected"] : ""}
            `}
          >
            <span className={styles["category-icon"]}>{category.icon}</span>
            <span className={styles["category-name"]}>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default Categories;