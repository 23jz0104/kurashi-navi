import { useCallback, useState } from "react";
import { useNumberInput } from "../common/useNumberInput";

const useBudgetForm = () => {
  const [budgetForm, setBudgetForm] = useState({
    type_id: "",
    category_id: "",
    budget_rule_id: "1",
  });

  const budget_limit = useNumberInput(0);

  const updateField = useCallback((key, value) => {
    setBudgetForm(prev => ({ ...prev, [key]: value }));
  }, []);

  return { budgetForm, budget_limit, updateField }
}

export default useBudgetForm;