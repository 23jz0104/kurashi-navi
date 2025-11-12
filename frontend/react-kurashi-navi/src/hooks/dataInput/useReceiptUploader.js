import { useState } from "react";

export const useReceiptUploader = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadReceipt = async (receipt) => {
    setIsUploading(true);

    //discount属性をJSONから削除して整形
    const formattedproducts = receipt.products.map(product => {
      const { discount, ...restproduct } = product;

      //商品当たりの割引額を求める（後で修正するかも）
      const finalPrice = Math.floor((product.product_price * product.quantity - discount) / product.quantity);

      return {
        ...restproduct,
        product_price: finalPrice,
      };
    });

    // taxRateを除外したレシートデータを作成
    const { taxRate, ...restReceipt } = receipt;

    const formattedReceipt = [{
      ...restReceipt,
      products: formattedproducts,
    }];

    console.log("送信するJSON -> ", JSON.stringify(formattedReceipt, null, 1));

    try {
      const response = await fetch("/api/receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": "1",  // テスト用の値
          "X-Type-ID": "2"   // テスト用の値 1が収入　2が支出
        },
        body: JSON.stringify(formattedReceipt),
      });
      
      if(!response.ok) {
        console.log(response.status + "エラー:", response);
      }

      console.log("response:", response);

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