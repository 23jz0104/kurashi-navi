import { useState } from "react"

export const useManualInputUploader = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadData = async (data) => {
    setIsUploading(true);

    console.log("送信するデータ:", JSON.stringify(data, null, 1));
    try {
      const response = await fetch("/api/receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-user-ID": "1",
          "X-Type-ID": "1",
        },
        body: JSON.stringify(data),
      });

      if(!response.ok) {
        console.log(response.status + "エラー", response);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.log("error: ", error);
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadData, isUploading };
}