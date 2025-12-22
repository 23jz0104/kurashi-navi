import { useCategories } from "../../hooks/common/useCategories";
import Layout from "../common/Layout";
import styles from "./BudgetCreate.module.css";
import { House } from "lucide-react";
import LoadingSpinner from "../common/LoadingSpinner";
import { useState } from "react";
import { useNumberInput } from "../../hooks/common/useNumberInput";
import Categories from "../common/Categories";
import SubmitButton from "../common/SubmitButton";
import { useBudgetApi } from "../../hooks/budgetManagement/useBudgetApi";
import { useNavigate } from "react-router-dom";

const BudgetCreate = () => {
  const navigate = useNavigate();
  const { isLoading: isCategoryLoading, categories } = useCategories(2); //支出
  const budget_limit = useNumberInput(0);
  const [budgetForm, setBudgetForm] = useState({});
  const { isPostLoading, postBudget } = useBudgetApi();
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    const payload = {
      budget_limit: budgetForm.budget_limit,
      category_id: budgetForm.category_id,
    }

    const result = await postBudget(payload);

    if (result?.status === "success") {
      setBudgetForm({});
      navigate("/budget-management");
    } else {
      setMessage("変更に失敗しました。");
    }

    setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  return (
    <Layout
      hideNavigation={true}
      redirectPath={"/budget-management"}
      headerContent={<p>新規予算</p>}
      mainContent={
        <>
          {isCategoryLoading ? (
            <LoadingSpinner />
          ) : (
            <div className={styles["main-container"]}>

              <div className={styles["budget-info-card"]}>

                <div className={styles["category-display"]}>
                  <span className={styles["icon"]}>
                    <House size={16} />
                  </span>
                  <span className={styles["category-name"]}>
                    {budgetForm.category_name || ""}
                  </span>
                </div>
                
                <div className={styles["budget-input-container"]}>
                  <span className={styles["currency-symbol"]}>¥</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={budget_limit.displayValue}
                    onChange={(e) => {
                      budget_limit.handleChange(e.target.value);
                      setBudgetForm((prev) => ({
                        ...prev,
                        budget_limit: 
                          Number(e.target.value.replace(/,/g, "")) || 0,
                      }));
                    }}
                    className={styles["budget-limit-input"]}
                  />
                  <span className={styles["per-month"]}> / 月</span>
                </div>
              </div>

              <div className={styles["category-card"]}>
                <p>カテゴリ</p>
                <Categories 
                  categories={categories}
                  selectedCategoryId={budgetForm.category_id}
                  onSelectedCategory={(id) => {
                    const selected = categories.find((c) => c.id === id);
                    setBudgetForm((prev) => ({
                      ...prev,
                      category_id: id,
                      category_name:
                        selected?.category_name ?? prev.category_name,
                    }))
                  }}
                />
              </div>

              <SubmitButton
               disabled={isPostLoading}
                onClick={() => {handleSubmit()}}
              />

              {message && (
                <p>{message}</p>
              )}
            </div> 
          )}
        </>
      }
    />
  )
}

export default BudgetCreate;