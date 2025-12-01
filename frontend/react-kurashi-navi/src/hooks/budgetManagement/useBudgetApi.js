import { useEffect, useState } from "react";

export const useBudgetApi = () => {
  const [isLoading, setIsLoading] = useState(true); //ロードの状態管理
  const [budget, setBudget] = useState([]); //予算の状態管理

  const userId = sessionStorage.getItem("userId");

  //GETメソッド用関数
  const getBudget = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://t08.mydns.jp/kakeibo/public/api/budgetManagement", {
        method: "GET",
        headers: { "Content-Type": "application/json", "X-User-ID": userId },
      });
      
      if(!response.ok) {
        console.log(response.status + "エラー", JSON.stringify(response, null, 1));
      }
      const data = await response.json();
      setBudget(data);
      return data;
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  //POSTメソッド用関数
  const postBudget = async (payload) => {
    setIsLoading(true);
    try {
      const response = await fetch("https://t08.mydns.jp/kakeibo/public/api/budgetManagement", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-ID": userId },
        body: JSON.stringify(payload),
      });

      if(!response.ok) {
        console.log(response.status + "エラー", JSON.stringify(response, null, 1));
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  return { isLoading, budget, getBudget, postBudget };
}