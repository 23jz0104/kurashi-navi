import { useEffect, useState } from "react";
import { useCategories } from "../../hooks/common/useCategories";
import Categories from "../common/Categories";
import Layout from "../common/Layout";
import LoadingSpinner from "../common/LoadingSpinner";
import styles from "./FixedCostCreate.module.css";
import { useNumberInput } from "../../hooks/common/useNumberInput";
import SubmitButton from "../common/SubmitButton";
import { useFixedCostApi } from "../../hooks/fixedCost/useFixedCostApi";
import { useNavigate } from "react-router-dom";
import { useBudgetRulesApi } from "../../hooks/budgetManagement/useBudgetRulesApi";

const FixedCostCreate = () => {
  const navigate = useNavigate();
  const {isLoading: isIncomeCategoryLoading, categories: incomeCategories} = useCategories(1); //収入
  const {isLoading: isExpenseCategoryLoading, categories: expenseCategories} = useCategories(2); //支出
  const [transactionType, setTransactionType] = useState("expense");
  const { isPostLoading, postFixedCost } = useFixedCostApi();
  const { isGetLoading, getBudgetRules, budgetRules} = useBudgetRulesApi();
  const [message, setMessage] = useState("");

  useEffect(() => {
    getBudgetRules();
  }, []);

  const fixedCost = useNumberInput(0);
  const [fixedCostForm, setFixedCostForm] = useState({
    type_id: 2, //デフォルトは支出
    category_id: null,
    budget_rule_id: 2, //デフォルトは月末
    cost: 0,
  });

  const handleSubmit = async () => {
    const payload = {
      type_id: fixedCostForm.type_id,
      category_id: fixedCostForm.category_id,
      budget_rule_id: fixedCostForm.budget_rule_id,
      cost: fixedCostForm.cost,
    }

    const result = await postFixedCost(payload);

    if (result?.status === "success") {
      setFixedCostForm({});
      navigate("/budget-management", {state: {"initialTab": "fixedCostView"}});
    } else {
      setMessage("登録に失敗しました。");
    }

    setTimeout(() => {
      setMessage("");
    }, 2000);
  }

  return (
    <Layout 
      hideNavigation={true}
      redirectPath={"/budget-management"}
      state={{"initialTab": "fixedCostView"}}
      headerContent={<p>新規固定費</p>}
      mainContent={
        <>
          {isIncomeCategoryLoading || isExpenseCategoryLoading || isGetLoading ? (
            <><LoadingSpinner /></>
          ) : (
            <div className={styles["main-container"]}>

              <div className={styles["toggle-button-container"]}>
                <div className={styles["toggle-inner"]}>
                  <div 
                    className={`${styles["toggle-slider"]} ${
                      transactionType === 'expense' 
                        ? styles["slider-expense"] 
                        : styles["slider-income"]
                    }`}
                  />
                  <button
                    onClick={() => {
                      setTransactionType("expense");
                      setFixedCostForm((prev) => ({
                        ...prev,
                        type_id: 2,
                      }));
                    }}
                    className={`${styles["toggle-button"]} ${
                      transactionType === 'expense' ? styles["active"] : ''
                    }`}
                  >
                    支出
                  </button>
                  
                  <button
                    onClick={() => {
                      setTransactionType("income");
                      setFixedCostForm((prev) => ({
                        ...prev,
                        type_id: 1,
                      }))
                    }}
                    className={`${styles["toggle-button"]} ${
                      transactionType === 'income' ? styles["active"] : ''
                    }`}
                  >
                    収入
                  </button>
                </div>
              </div>

              <div className={styles["input-card"]}>
                <span className={styles["currency-symbol"]}>¥</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={fixedCost.displayValue}
                  onChange={(e) => {
                    fixedCost.handleChange(e.target.value);
                    setFixedCostForm((prev) => ({
                      ...prev,
                      cost:
                        Number(e.target.value.replace(/,/g, "") || 0),
                    }));
                  }}
                  className={styles["currency-input"]}
                />
                <span> / 月</span>
              </div>

              <div className={styles["payment-schedule-card"]}>
                <label>{transactionType === "expense" ? "支払日" : "収入日"}</label>
                <div>
                  <select
                    value={fixedCostForm.budget_rule_id}
                    onChange={(e) => {
                      setFixedCostForm((prev) => ({
                        ...prev,
                        budget_rule_id: Number(e.target.value),
                      }));
                    }}
                    className={styles["payment-schedule-select"]}
                  >
                    {budgetRules?.map((rule) => (
                      <option key={rule.id} value={rule.id}>
                        {rule.rule_name_jp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles["category-card"]}>
                <p>カテゴリ</p>
                <Categories 
                  categories={transactionType === "expense" ? expenseCategories : incomeCategories}
                  selectedCategoryId={fixedCostForm.category_id}
                  onSelectedCategory={(id) => {
                    setFixedCostForm((prev) => ({
                      ...prev,
                      category_id: id,
                    }))
                  }}
                />
              </div>

              <SubmitButton 
                disabled={isPostLoading}
                text={isPostLoading ? "登録中..." : "登録"}
                onClick={() => {
                  handleSubmit();
                }}
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

export default FixedCostCreate;