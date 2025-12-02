import { useEffect } from "react";
import { useBudgetApi } from "../../hooks/budgetManagement/useBudgetApi";

const BudgetView = () => {
  const { isGetLoading, budget, getBudget} = useBudgetApi();

  //レンダリング時に予算を呼び出し
  useEffect(() => {
    getBudget();
  }, []);

  return(
    <div>
      <h1>予算確認画面</h1>
      {isGetLoading ? (
        <div>読み込み中...</div>
      ) : (
        <div>
          {JSON.stringify(budget, null, 1)}
          {budget}
        </div>
      )}
    </div>
  )
}

export default BudgetView;  