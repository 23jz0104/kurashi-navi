import { useEffect, useState } from "react";

const recordCache = {}; //一度APIで通信したデータをキャッシュにして保管
// recordCache構造:
// {
//   "2025-10": { monthly: [...], daily: [...] },
//   "2025-11": { monthly: [...], daily: [...] },
//   "2025-12": { monthly: [...], daily: [...] }
// }

export const useGetRecord = (month) => {
  const [record, setRecord] = useState({ monthly: [], daily: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getRecord = async () => {
      try {
        setIsLoading(true);

        // 月単位でキャッシュを確認
        if (recordCache[month]) {
          console.log("キャッシュからデータを取得");
          setRecord(recordCache[month]);
          setIsLoading(false);
          return;
        }

        // API通信
        console.log("API通信: useGetRecord.js");
        const response = await fetch(`https://t08.mydns.jp/kakeibo/public/api/records`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": "5",
            "X-YearMonth": month,
          },
        });

        if (!response.ok) {
          console.log(response.status + "エラー", response);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("data", JSON.stringify(data, null, 1));
        const monthlySummary = data.monthlysummary || [];
        const dailySummary = data.dailysummary || [];

        // 月ごとのデータを整理するバッファ
        const monthBuffer = {};

        // monthlysummaryを月ごとに振り分け
        monthlySummary.forEach((item) => {
          const m = item.month;

          if (!monthBuffer[m]) {
            monthBuffer[m] = { monthly: [], daily: [] };
          }

          monthBuffer[m].monthly.push({
            type: item.type_id,
            category_name: item.category_name,
            total: parseInt(item.total, 10) || 0,
          });
        });

        // dailysummaryを月ごとに振り分け
        dailySummary.forEach((item) => {
          const m = item.record_date.substring(0, 7);

          if (!monthBuffer[m]) {
            monthBuffer[m] = { monthly: [], daily: [] };
          }

          monthBuffer[m].daily.push({
            record_date: item.record_date,
            category_name: item.category_name,
            total: parseInt(item.total, 10) || 0,
            type_id: item.type_id,
          });
        });

        // 重要: リクエストした月が存在しない場合でも空データを作成
        if (!monthBuffer[month]) {
          monthBuffer[month] = { monthly: [], daily: [] };
        }

        // キャッシュへの保存（既存データとマージ）
        Object.keys(monthBuffer).forEach((m) => {
          if (recordCache[m]) {
            // 既存のキャッシュがある場合はマージ
            // 新しいデータがある場合のみ上書き、なければ既存データを保持
            recordCache[m] = {
              monthly: monthBuffer[m].monthly.length > 0 
                ? monthBuffer[m].monthly 
                : recordCache[m].monthly,
              daily: monthBuffer[m].daily.length > 0 
                ? monthBuffer[m].daily 
                : recordCache[m].daily,
            };
          } else {
            // 新規の月はそのまま保存
            recordCache[m] = monthBuffer[m];
          }
        });

        // 目的の月のデータをセット
        setRecord(recordCache[month]);

      } catch (error) {
        console.error("エラー:", error);
        setRecord({ monthly: [], daily: [] });
      } finally {
        setIsLoading(false);
      }
    };

    getRecord();
  }, [month]);

  return { isLoading, record };
};