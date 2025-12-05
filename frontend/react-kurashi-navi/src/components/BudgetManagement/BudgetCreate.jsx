import { useEffect, useState } from "react";
import useBudgetForm from "../../hooks/budgetManagement/budgetForm";
import { useCategories } from "../../hooks/common/useCategories";
import { useBudgetApi } from "../../hooks/budgetManagement/useBudgetApi";
import SubmitButton from "../common/SubmitButton";
import Categories from "../common/Categories";

const BudgetCreate = () => {
  const [transactionType, setTransactionType] = useState("expense");

  const typeId = transactionType === "income" ? 1 : 2;

  const { budgetForm, budget_limit, updateField } = useBudgetForm();
  const { isLoading: isCategoryLoading, categories } = useCategories(typeId);
  const { isPostLoading, postBudget } = useBudgetApi(); //APIにデータを送信する際に使用

  const handleTypeChange = (type) => {
    setTransactionType(type);
    updateField("type_id", type === "income" ? 1 : 2);
  };  

  const handleSubmit = () => {
    console.log(JSON.stringify({ ...budgetForm, budget_limit: budget_limit.actualValue }));
    postBudget({ ...budgetForm, budget_limit: budget_limit.actualValue});
  }

  return (
    <div>
      <h1>予算設定画面</h1>

      <div>
        <button onClick={() => handleTypeChange("income")}>収入</button>
        <button onClick={() => handleTypeChange("expense")}>支出</button>
        <p>ボタンの状態: {transactionType}</p>
      </div>

      <div>
        <input
          value={budget_limit.displayValue}
          onChange={(e) => budget_limit.handleChange(e.target.value)}
          placeholder="金額"
        />
        {/* カテゴリをロード */}
        {isCategoryLoading ? (
          <div>読み込み中...</div>
        ) : (
          <Categories
            categories={categories}
            selectedCategoryId={budgetForm.category_id}
            onSelectedCategory={(id) => updateField("category_id", id)}
          />
        )}
        <SubmitButton 
          disabled={isPostLoading}
          onClick={handleSubmit}
          text={isPostLoading ? "送信中..." : "送信"}
        />
        
      </div>

      <div>
        <h1>デバッグ用</h1>
        <p>現在のフォームの状態</p>
        <p>type_id: {budgetForm.type_id}（1が収入、2が支出）</p>
        <p>category_id: {budgetForm.category_id}</p>
        <p>budget_rule_id: {budgetForm.budget_rule_id}</p>
        <p>budget_limit: {budget_limit.actualValue}</p>
      </div>
    </div>
  )
}

export default BudgetCreate;