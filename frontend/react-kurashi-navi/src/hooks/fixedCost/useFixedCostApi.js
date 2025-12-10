import { useState } from "react";

export const useFixedCostApi = () => {
  const [fixedCost, setFixedCost] = useState({});
  const [isGetLoading, setIsGetLoading] = useState(false);
  const [isPostLoading, setIsPostLoading] = useState(false);

  const userId = sessionStorage.getItem("userId");

  const getFixedCost = async () => {
    setIsGetLoading(true);
    try {
      console.log("API通信: getFixedCost()");
      const response = await fetch("https://t08.mydns.jp/kakeibo/public/api/fixedcost", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": userId,
        }
      });

      if(!response.ok) {
        console.log(response.status + "エラー", response);
      }

      const data = await response.json();
      setFixedCost(data);
      console.log("データ取得完了: getFixedCost()");
      return data;
    } catch (error) {
      console.log(error);
    } finally {
      setIsGetLoading(false);
    }
  }

  const postFixedCost = async (payload) => {
    setIsPostLoading(true);
    try {
      console.log("API通信: postFixedCost()");
      const response = await fetch("https://t08.mydns.jp/kakeibo/public/api/fixedcost", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-User-ID": userId,
        },
        body: JSON.stringify(payload),
      });

      if(!response.ok) {
        console.log(response.status + "エラー", response);
      }

      const data = await response.json();
      console.log("データ登録完了: postFixedCost()");
      return data;
    } catch (error) {
      console.log(error);
    } finally {
      setIsPostLoading(false);
    }
  }

  return { fixedCost, isGetLoading, isPostLoading, getFixedCost, postFixedCost };
}