import { useState } from "react";

export const useReceiptUploader = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadReceipt = async (receipt, tax) => {
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

    //taxRateを除外したレシートデータを作成
    const { taxRate, ...restReceipt } = receipt;

    const taxItem = {
      product_name: "消費税",
      category_id: 8,
      product_price: tax,
      quantity: 1,
    }

    const formattedReceipt = [{
      ...restReceipt,
      products: [...formattedproducts, taxItem],
    }];

    console.log("送信するJSON -> ", JSON.stringify(formattedReceipt, null, 1));
    const userId = sessionStorage.getItem("userId");

    try {
      const response = await fetch("https://t08.mydns.jp/kakeibo/public/api/receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-ID": userId,
          "X-Type-ID": "2"   // 支出をアップロード(2)
        },
        body: JSON.stringify(formattedReceipt),
      });
      
      if(!response.ok) {
        console.log(response.status + "エラー:", response);
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