import { useEffect, useState } from "react";

const recordCache = {};

export const useGetRecord = (month) => {
  const [record, setRecord] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getRecord = async () => {
      try {
        setIsLoading(true);

        const year = month.substring(0, 4);

        if(recordCache[year]) {
          console.log("キャッシュからデータを取得");
          setRecord(recordCache[year][month] || []);
          setIsLoading(false);
          return;
        }

        console.log("API通信: useGetRecord.js");
        const response = await fetch(`/api/records`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": "5", //個々の数値でユーザーIDを指定する
            "X-YearMonth": month,
          },
        });

        if(!response.ok) {
          console.log(response.status + "エラー", response);
        }

        const data = await response.json();
        console.log(JSON.stringify(data, null, 1));
        const summaryData = data.monthlysummary || [];

        recordCache[year] = {};
        for(let m = 1; m <= 12; m++) {
          const monthKey = `${year}-${String(m).padStart(2, '0')}`;
          recordCache[year][monthKey] = [];
        }

        summaryData.forEach((item) => {
          const itemMonth = item.month;
          const itemYear = itemMonth.substring(0, 4);

          // リクエストした年のデータのみ処理
          if(itemYear === year && recordCache[year][itemMonth]) {
            recordCache[year][itemMonth].push({
              type: item.type,
              category_name: item.category_name,
              total: parseInt(item.total, 10) || 0,
            });
          }
        });

        setRecord(recordCache[year][month]);
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };

    getRecord();
  }, [month]);

  return { isLoading, record };
};