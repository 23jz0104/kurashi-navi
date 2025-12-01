import { useEffect, useState } from "react";
import useBudgetForm from "../../hooks/budgetManagement/budgetForm";
import { useCategories } from "../../hooks/common/useCategories";
import { useBudgetApi } from "../../hooks/budgetManagement/useBudgetApi";
import Categories from "../common/Categories";

const BudgetEdit = () => {
  const [transactionType, setTransactionType] = useState("expense");
  const { budgetForm, budget_limit, updateField } = useBudgetForm();
  const { categories } = useCategories(2);
  const { isLoading, postBudget } = useBudgetApi(); //APIにデータを送信する際に使用

  //収支のタイプが変更されたときにフォームのtype_idも併せて変更
  useEffect(() => {
    const typeId = transactionType === "income" ? 1 : 2;
    updateField("type_id", typeId);
  }, [transactionType, updateField]);

  return (
    <div>
      <h1>予算設定画面</h1>

      <div>
        <button onClick={() => setTransactionType("expense")}>支出</button>
        <button onClick={() => setTransactionType("income")}>収入</button>
        <p>ボタンの状態: {transactionType}</p>
      </div>

      <div>
        <input
          value={budget_limit.displayValue}
          onChange={(e) => budget_limit.handleChange(e.target.value)}
          placeholder="金額"
        />
        <Categories
          categories={categories}
          selectedCategoryId={budgetForm.category_id}
          onSelectedCategory={(id) => updateField("category_id", id)}
        />
      </div>

      <div>
        <h1>デバッグ用</h1>
        <p>現在のフォームの状態</p>
        <p>type_id（1が収入、2が支出）{budgetForm.type_id}</p>
        <p>category_id {budgetForm.category_id}</p>
        <p>budget_rule_id {budgetForm.budget_rule_id}</p>
        <p>budget_limit {budget_limit.actualValue}</p>
      </div>
    </div>
  )
}

export default BudgetEdit;