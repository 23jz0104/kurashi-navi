import { useEffect, useState } from "react"

export const useCategories = (typeId) => {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    const getCategories = async () => {
      try {
        setIsLoading(true);
        console.log("API通信: useCategories.js");
        const response = await fetch("https://t08.mydns.jp/kakeibo/public/api/category", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Type-ID": `${typeId}` //1が収入 2が支出
          },
        });
        
        if(!response.ok) {
          console.log(response.status + "エラー", response);
        } 
  
        const data = await response.json();
        setCategories(data);
        return data;
      } catch (error) {
  
      } finally {
        setIsLoading(false);
      };
    }

    getCategories();
  }, [typeId]);

  return { isLoading, categories };
}