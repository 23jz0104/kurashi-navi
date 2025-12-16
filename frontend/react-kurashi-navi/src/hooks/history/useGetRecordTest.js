/**
 * ページ遷移のたびにAPI通信（データの鮮度を保つ、バグを減らす）
 */
import { useEffect, useState } from "react";

export const useGetRecordTest = (month) => {
  const [record, setRecord] = useState({ monthly: [], daily: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getRecord = async () => {
      const userId = sessionStorage.getItem("userId");
      
      if (!userId) {
        console.error("ユーザーIDが見つかりません");
        setRecord({ monthly: [], daily: [] });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log("API通信: useGetRecord.js");

        const response = await fetch(`https://t08.mydns.jp/kakeibo/public/api/records`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": userId,
            "X-YearMonth": month,
          },
        });

        if (!response.ok) {
          console.error(`${response.status}エラー`, response);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const monthlySummary = data.monthlysummary || [];
        const dailySummary = data.dailysummary || [];

        // 指定された月のデータのみを抽出・整形
        const monthly = monthlySummary
          .filter((item) => item.month === month)
          .map((item) => ({
            type: item.type_id,
            category_name: item.category_name,
            total: parseInt(item.total, 10) || 0,
          }));

        const daily = dailySummary
          .filter((item) => item.record_date.startsWith(month))
          .map((item) => ({
            record_date: item.record_date,
            category_name: item.category_name,
            total: parseInt(item.total, 10) || 0,
            type_id: item.type_id,
          }));
        setRecord({ monthly, daily });

      } catch (error) {
        console.error("データ取得エラー:", error);
        setRecord({ monthly: [], daily: [] });
      } finally {
        setIsLoading(false);
      }
    };

    getRecord();
  }, [month]); // monthが変わるたびに実行

  return { isLoading, record };
};