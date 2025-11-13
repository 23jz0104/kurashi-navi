import { useEffect, useState } from "react"

export const useCategories = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  
  const getCategories = async () => {
    try {
      setIsLoading(true);
      console.log("getCategories_通信中");
      const response = await fetch("/api/category", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-Type-ID": "2" //1が収入 2が支出
        },
      });
      
      if(!response.ok) {
        console.log(response.status + "エラー", response);
      }

      const data = await response.json();
      setCategories(data);
      console.log(JSON.stringify(data, null, 1));
      return data;
    } catch (error) {

    } finally {
      setIsLoading(false);
    }
    getCategories();
  }
  return { isLoading, categories };
}