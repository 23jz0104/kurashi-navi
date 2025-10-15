import React from "react";
import styles from "./Categories.module.css";

const Categories = ({ activeTab = "expense" }) => {

    // 仮のカテゴリデータ
    const categories = {
      expense: [
        { id: "food", name: "食費", icon: "🍽️" },
        { id: "transport", name: "交通費", icon: "🚃" },
        { id: "bills", name: "光熱費", icon: "💡" },
        { id: "entertainment", name: "娯楽", icon: "🎮" },
        { id: "other", name: "その他", icon: "📦" }
      ],
      income: [
        { id: "salary", name: "給与", icon: "💼" },
        { id: "bonus", name: "賞与", icon: "🎁" },
        { id: "side", name: "副業", icon: "💻" },
        { id: "other", name: "その他", icon: "💰" }
      ]
    };

  return (
    <div>
      <div className={styles["category-grid"]}>
        {categories[activeTab].map((category) => (
          <button
            key={category.id}
            type="button"
            className={`${styles["category-button"]}`}
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