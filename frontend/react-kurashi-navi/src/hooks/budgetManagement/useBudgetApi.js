import { useEffect, useState } from "react";

export const useBudgetApi = () => {
  const [isGetLoading, setIsGetLoading] = useState(false); //ロードの状態管理
  const [isPostLoading, setIsPostLoading] = useState(false);
  const [budget, setBudget] = useState([]); //予算の状態管理

  const userId = sessionStorage.getItem("userId");

  //GETメソッド用関数
  const getBudget = async () => {
    setIsGetLoading(true)
    try {
      console.log("API通信: getBudget()");
      const response = await fetch("https://t08.mydns.jp/kakeibo/public/api/budget", {
        method: "GET",
        headers: { 
          "Content-Type": "application/json", 
          "X-User-ID": userId,
        },
      });
      
      if(!response.ok) {
        console.log(response.status + "エラー", response);
      }
      const data = await response.json();
      setBudget(data);
      console.log(JSON.stringify(data, null, 1))
      return data;
    } catch (error) {
      console.log(error);
    } finally {
      setIsGetLoading(false);
    }
  }

  //POSTメソッド用関数
  const postBudget = async (payload) => {
    setIsPostLoading(true);
    try {
      const response = await fetch("https://t08.mydns.jp/kakeibo/public/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-ID": userId },
        body: JSON.stringify(payload),
      });

      if(!response.ok) {
        console.log(response.status + "エラー", response);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    } finally {
      setIsPostLoading(false);
    }
  }

  return { isGetLoading, isPostLoading, budget, getBudget, postBudget };
}