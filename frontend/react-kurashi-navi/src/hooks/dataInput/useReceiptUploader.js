import { useState } from "react";

export const useReceiptUploader = () => {
  const [isUploading, setIsUploading] = useState(false);

  // const uploadReceipt = async (receipt, tax) => {
  const uploadReceipt = async (receipt) => {
    setIsUploading(true);

    //discount属性をJSONから削除して整形
    const formattedProducts = receipt.products.map(product => {
      const { discount, ...restproduct } = product;

      //商品当たりの割引額を求める（後で修正するかも）
      const finalPrice = Math.floor((product.product_price * product.quantity - discount) / product.quantity);

      return {
        ...restproduct,
        product_price: finalPrice,
      };
    });

    const taxProducts = [];
    if (receipt.tax_details?.tax_8_percent > 0) {
      taxProducts.push({
        product_name: "消費税(8%)",
        category_id: 8,
        product_price: receipt.tax_details.tax_8_percent,
        quantity: 1,
        tax_rate: 0, // 税に税をかけない
      });
    }

    if (receipt.tax_details?.tax_10_percent > 0) {
      taxProducts.push({
        product_name: "消費税(10%)",
        category_id: 8,
        product_price: receipt.tax_details.tax_10_percent,
        quantity: 1,
        tax_rate: 0,
      });
    }

    const formattedReceipt = [{
      shop_name: receipt.shop_name,
      shop_address: receipt.shop_address,
      purchase_day: receipt.purchase_day,
      products: [
        ...formattedProducts,
        ...taxProducts,   // 消費税を商品として追加
      ],
      total_amount: receipt.total_amount,
    }];

    // 送信用レシート（消費税は products に入れない）
    // const formattedReceipt = [{
    //   shop_name: receipt.shop_name,
    //   shop_address: receipt.shop_address,
    //   purchase_day: receipt.purchase_day,
    //   products: formattedProducts,
    //   total_amount: receipt.total_amount,
    //   tax_details: receipt.tax_details,
    // }];
    
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