import { useState } from "react";

export const useReceiptUploader = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadReceipt = async (receipt) => {
    setIsUploading(true);

    //discount属性をJSOｎから削除して整形
    const formattedItems = receipt.items.map(item => {
      const { discount, ...restItem } = item;

      const finalPrice = item.price - discount;

      return {
        ...restItem,
        price: finalPrice,
      };
    });

    const formattedReceipt = {
      ...receipt,
      items: formattedItems,
    };

    console.log("送信するJSON -> ", JSON.stringify(formattedReceipt, null, 1));

    try {
      const url = "https://t08pushtest.mydns.jp/kakeibo/receipt";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedReceipt),
      });

      if(!response.ok) {
        //えらー
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.log(error);
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadReceipt, isUploading };
};