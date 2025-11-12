import { useEffect, useState } from "react";

export const useGetRecord = (month) => {
  const [record, setRecord] = useState({ records: [], summary:[] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getRecord = async () => {
      try {
        setIsLoading(true);
        console.log("通信中");
        const response = await fetch(`/api/records?month=${month}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": "1", //テスト用のID
          },
        });

        if(!response.ok) {
          console.log(response.status + "エラー", response);
        }

        const data = await response.json();
        setRecord(data);
        console.log("データの取得に成功", "データ:", JSON.stringify(data, null, 1));
        return data;
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