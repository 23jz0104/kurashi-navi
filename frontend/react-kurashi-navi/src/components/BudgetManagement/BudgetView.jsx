import { useEffect } from "react";
import { useBudgetApi } from "../../hooks/budgetManagement/useBudgetApi";

const BudgetView = () => {
  const { budget, getBudget} = useBudgetApi();

  //レンダリング時に予算を呼び出し
  useEffect(() => {
    getBudget();
  }, []);

  console.log(sessionStorage.getItem("userId"));

  return(
    <div>
      <h1>予算確認画面</h1>
    </div>
  )
}

export default BudgetView;  