import { useState } from "react";

export const useReceiptUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /**
   * GeminiAPIを利用して、レシート画像を解析する
   * @param {File} imageFile - 送信する写真データ
   * @returns 
   */
  const analyzeImage = async (imageFile) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      // トークンを取得 (Login時に保存している前提)
      const token = sessionStorage.getItem("auth_token");
      // console.log(token);
      
      const response = await fetch("https://t08.mydns.jp/kakeibo/public/api/analyze-receipt", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const result = await response.json();
      return result;
    }
    // エラー処理
    catch (error) {
      console.error("解析エラー:", error);
      alert("画像の解析に失敗しました。もう一度試してください。");
      return null;
    }
    finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * 
   * @param {Object} receipt - レシートデータ
   * @returns 
   */
  const saveReceipt = async (receipt) => {
    setIsUploading(true);

    const formattedProducts = receipt.products.map(product => {
      const { discount, ...restproduct } = product;
      
      // 単価計算
      let finalPrice = product.product_price;
      if (discount && discount > 0) {
          finalPrice = product.product_price - Math.floor(discount / product.quantity);
      }

      return {
        ...restproduct,
        product_price: finalPrice,
      };
    });

    // 特別な商品（消費税・ポイント）を追加する配列
    const specialProducts = [];

    // 消費税(8%)
    if (receipt.tax_details?.tax_8_percent > 0) {
      specialProducts.push({
        product_id: 2,
        product_name: "消費税(8%)",
        category_id: 8,
        product_price: receipt.tax_details.tax_8_percent,
        quantity: 1,
        tax_rate: 0,
      });
    }

    // 消費税(10%)
    if (receipt.tax_details?.tax_10_percent > 0) {
      specialProducts.push({
        product_id: 3,
        product_name: "消費税(10%)",
        category_id: 8,
        product_price: receipt.tax_details.tax_10_percent,
        quantity: 1,
        tax_rate: 0,
      });
    }

    // ポイント利用
    if (receipt.points_usage && receipt.points_usage > 0) {
      specialProducts.push({
        product_id: 4,
        product_name: "ポイント利用",
        category_id: 12,
        product_price: -1 * Math.abs(receipt.points_usage),
        quantity: 1,
        tax_rate: 0,
      });
    }

    // 送信用のデータ
    const payload = [{
      shop_name: receipt.shop_name,
      shop_address: receipt.shop_address,
      purchase_day: receipt.purchase_day,
      products: [
        ...formattedProducts,
        ...specialProducts,
      ],
      total_amount: receipt.total_amount,
    }];
    
    console.log("DB送信JSON -> ", JSON.stringify(payload, null, 2));

    try {
      const token = sessionStorage.getItem("auth_token");

      const response = await fetch("https://t08.mydns.jp/kakeibo/public/api/receipt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
          "X-Type-ID": "2"
        },
        body: JSON.stringify(payload),
      });
      
      if(!response.ok) {
        throw new Error(`Save Error: ${response.status}`);
      }

      const result = await response.json();
      return result;
    }
    // エラー処理
    catch (error) {
      console.error(error);
      alert("保存に失敗しました。");
    }
    finally {
      setIsUploading(false);
    }
  };
  return { analyzeImage, saveReceipt, isUploading, isAnalyzing };
};