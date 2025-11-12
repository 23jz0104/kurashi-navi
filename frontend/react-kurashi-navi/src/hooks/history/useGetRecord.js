import { useState } from "react";

export const useGetRecord = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getRecord = async (month) => {
    try { 
      setIsLoading(true);
      console.log("通信中");
      const response = await fetch(`/api/records?month=${month}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": "1",
        },
      });

      if(!response.ok) {
        console.log(response.status + "エラー", response);
      }

      const data = await response.json();
      console.log("データ取得");
      return data;
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, getRecord };
};