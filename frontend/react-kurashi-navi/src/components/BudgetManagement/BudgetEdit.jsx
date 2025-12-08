import { useLocation } from "react-router-dom";
import Layout from "../common/Layout";
import styles from "./BudgetEdit.module.css";
import { useNumberInput } from "../../hooks/common/useNumberInput";
import { House } from "lucide-react";
import Categories from "../common/Categories";
import { useCategories } from "../../hooks/common/useCategories";
import { useState } from "react";
import SubmitButton from "../common/SubmitButton";

const BudgetEdit = () => {
  const location = useLocation();
  const selectedBudget = location.state?.budgetData;

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    selectedBudget.category_id
  );

  const { categories: incomeCategories } = useCategories(1); //支出
  const { categories: expenseCategories } = useCategories(2); //収入
  const categories = [...incomeCategories, ...expenseCategories];

  const budget_limit = useNumberInput(
    selectedBudget ? selectedBudget.budget_limit : 0
  );

  const calculateProgress = (total, limit) => {
    if (!limit || limit === 0) return 0;
    return Math.min((total / limit) * 100, 100);
  };

  const progressPercentage = calculateProgress(
    selectedBudget.total,
    selectedBudget.budget_limit
  );

  console.log("編集する予算データ;", JSON.stringify(selectedBudget, null, 2));

  return (
    <Layout
      headerContent={<p>予算編集</p>}
      redirectPath={"/budget-management"}
      mainContent={
        <div className={styles["main-container"]}>

          <div className={styles["budget-info-card"]}>
            <div className={styles["category-display"]}>
              <span><House size={16} /></span>
              <span>{selectedBudget.category_name}</span>
              <span className={styles["usage-percentage"]}>{((selectedBudget.total / Number(selectedBudget.budget_limit)) * 100).toFixed(1)}%</span>
            </div>

            <div className={styles["budget-input-container"]}>
              <span className={styles["currency-symbol"]}>¥</span>
              <input
                value={budget_limit.displayValue}
                onChange={(e) => budget_limit.handleChange(e.target.value)}
                className={styles["budget-limit-input"]}
              />
              <span className={styles["per-month"]}> / 月</span>
            </div>

            <div className={styles["budget-progress"]}>
              <div className={styles["progress-bar"]}>
                <div
                  className={styles["progress-fill"]}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>

              <div className={styles["price-info"]}>
                <span className={styles["expense-price"]}>
                  ¥{selectedBudget.total.toLocaleString()}
                </span>

                <span className={styles["rest-price"]}>
                  残り ¥{(Number(selectedBudget.budget_limit) - selectedBudget.total).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <p>カテゴリ</p>
            <Categories 
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectedCategory={(id) => setSelectedCategoryId(id)}
            />
          </div>

          <SubmitButton text={"変更"}/>
        </div>
      }
      hideNavigation={true}
    />
  );
};

export default BudgetEdit;