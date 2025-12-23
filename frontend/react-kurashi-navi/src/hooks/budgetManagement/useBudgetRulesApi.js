import { useState } from "react"

export const useBudgetRulesApi = () => {
  const [isGetLoading, setIsGetLoading] = useState(false);
  const [budgetRules, setBudgetRules] = useState([]);

  const getBudgetRules = async () => {
    setIsGetLoading(true);
    try {
      console.log("API通信: getBudgetRules()");
      const response = await fetch("https://t08.mydns.jp/kakeibo/public/api/budget-rules", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if(!response.ok) {
        throw new Error('ネットワークエラー', response);
      }

      const data = await response.json();
      setBudgetRules(data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsGetLoading(false);
    }
  }
  return {budgetRules, isGetLoading, getBudgetRules};
}