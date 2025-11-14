import { useEffect, useState } from "react";

export const useGetRecord = (month) => {
  const [record, setRecord] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getRecord = async () => {
      try {
        setIsLoading(true);
        console.log("API通信: useGetRecord.js");
        const response = await fetch(`/api/records?month=${month}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-User-ID": "1", //個々の数値でユーザーIDを指定する
          },
        });

        if(!response.ok) {
          console.log(response.status + "エラー", response);
        }

        const data = await response.json();
        setRecord(data);
        console.log("データの取得に成功", JSON.stringify(data, null, 1));
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