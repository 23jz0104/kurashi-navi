import { useState } from "react";

export const useFixedCostApi = () => {
  const [fixedCost, setFixedCost] = useState({});
  const [isGetLoading, setIsGetLoading] = useState(false);
  const [isPostLoading, setIsPostLoading] = useState(false);
  const [isPatchLoading, setIsPatchLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

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

  const patchFixedCost = async (payload) => {
    setIsPatchLoading(true);
    try {
      console.log("API通信: patchFixedCost()");
      const response = await fetch("https://t08.mydns.jp/kakeibo/public/api/fixedcost", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-ID": payload.id,
        },
        body: JSON.stringify({
          cost: payload.cost,
          category_id: payload.category_id,
        }),
      });

      if(!response.ok) {
        console.log(response.status + "エラー", response);
      }

      const data = await response.json();
      console.log("データ更新完了: patchFixedCost()");
      return data;
    } catch (error) {
      console.log(error);
    } finally {
      setIsPatchLoading(false);
    }
  }

  const deleteFixedCost = async (id) => {
    setIsDeleteLoading(true);
    try {
      console.log("API通信: deleteFixedCost()");
      const response = await fetch("https://t08.mydns.jp/kakeibo/public/api/fixedcost", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-ID": id,
        }
      });

      if(!response.ok) {
        throw new Error(`削除失敗: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    } finally {
      setIsDeleteLoading(false);
    }
  }

  return { fixedCost, isGetLoading, isPostLoading, isPatchLoading, isDeleteLoading, getFixedCost, postFixedCost, patchFixedCost, deleteFixedCost};
}