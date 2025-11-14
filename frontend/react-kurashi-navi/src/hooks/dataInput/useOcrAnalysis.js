import { useState, useEffect } from "react";
import { GoogleGenAI, createUserContent, createPartFromUri, Type } from "@google/genai";
import { useCategories } from "../common/useCategories";

const API_KEY = "AIzaSyDaE9IGHmBNnFgSETBDcqZKv93_W2Q5azI";

const generateCategoriesPrompt = (categories) => {
  return categories.map(cat => `   ${cat.id}: ${cat.category_name}`).join('\n');
}

const generateOcrPropmt =  (categoryPrompt) => `
  あなたはレシート画像を解析するAIです。

  次のルールに従って、JSONを抽出してください。
  出力はJSONのみで行います（説明文やコメントは禁止）。

  【ルール】
  - 計算が発生する場合はPythonを用いて実行すること。
  - shop_nameはレシート上部の店舗名。不明なら "不明"。
  - shop_addressはレシートの店舗名の住所。不明なら "不明"。
  - purchase_dayは日付。フォーマットは "yyyy-MM-dd HH:mm:ss" とする。(日付が検出できない、または不完全な場合は今日の日付とする。時刻に関しても同様で、検出できない場合は00:00:00とする。）
  - product_nameは商品名。
  - quantityは数量。解析にあたり数量が検出できない場合は1としてカウント。
  - product_priceは単価。product_nameに対応する金額が合計金額の場合はproduct_priceをquantityで割る。(表示するのは税別の価格)
  - discountは、その商品に対する割引金額（絶対値、例: 50円引きなら50）。

  【重要: 割引の処理方法】
  - レシートに「値引」「割引」などの表記がある場合、それは独立した商品ではありません。
  - 割引は必ず直前または関連する商品のdiscountフィールドに統合してください。
  - 割引だけを持つ独立したproductsレコードを作成してはいけません。
  - 各商品のdiscountフィールドに適切な割引額を設定し、割引がない場合は0とします。
  - 「値引」「割引」といった名前の商品アイテムをproductsに含めないでください。
  - 割引金額に関しては1個あたりの金額を計算する必要はありません。そのままの値を出力してください。

  - category_idは以下の分類ルールに従い、整数で出力する。
   ${categoryPrompt}
    99: その他（上記以外）

  - 小計・合計・お預かり金などは含めない。
  - total_amountは税率を含めた合計金額。商品の価格と数量から適切な合計金額をもとめ、税率を乗じて算出すること。
    尚、レシートに合計金額が表示されており、かつ、それが税込み価格であればそれを利用してもよい。
  - taxRateは税率。
  - 適切なインデントで出力すること。

  【出力例】
  割引がある場合の正しい出力:
  {
    "products": [
      {
        "product_name": "商品A",
        "category_id": 1,
        "product_price": 200,
        "discount": 50,
        "quantity": 1
      }
    ]
  }

  誤った出力（このような出力は禁止）:
  {
    "products": [
      {
        "product_name": "商品A",
        "category_id": 1,
        "product_price": 200,
        "discount": 0,
        "quantity": 1
      },
      {
        "product_name": "値引",
        "category_id": 99,
        "product_price": 0,
        "discount": 50,
        "quantity": 1
      }
    ]
  }
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    shop_name: { type: Type.STRING },
    shop_address: { type: Type.STRING },
    purchase_day: { type: Type.STRING },
    products: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          product_name: { type: Type.STRING },
          category_id: { type: Type.INTEGER },
          product_price: { type: Type.INTEGER },
          discount: { type: Type.INTEGER },
          quantity: { type: Type.INTEGER },
        },
        required: ["product_name", "category_id", "product_price", "discount", "quantity"],
      },
    },
    total_amount: { type: Type.INTEGER },
    taxRate: { type: Type.INTEGER },
  },
  required: ["shop_name", "shop_address", "purchase_day", "products", "total_amount", "taxRate"],
};

// デフォルトのOCR結果
const DEFAULT_OCR_RESULT = {
  shop_name: "",
  shop_address: "",
  purchase_day: "",
  products: [],
  total_amount: 0,
  taxRate: 0,
};

export const useOcrAnalysis = (file) => {
  const [loading, setLoading] = useState(true);
  const [ocrResult, setOcrResult] = useState(DEFAULT_OCR_RESULT);
  const [error, setError] = useState(null);
  const {isLoading: isCategoriesLoading, categories} = useCategories(2); //レシートは基本的に支出のため支出のカテゴリのみ伝える

  useEffect(() => {
    if (!file || isCategoriesLoading) {
      return;
    }

    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const analyzeReceipt = async () => {
      try {
        const categoryPrompt = generateCategoriesPrompt(categories);
        const ocrPrompt = generateOcrPropmt(categoryPrompt);
        const uploadFile = await ai.files.upload({
          file: file,
          config: { mimeType: file.type },
        });

        const result = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: createUserContent([
            createPartFromUri(uploadFile.uri, uploadFile.mimeType),
            ocrPrompt,
          ]),
          config: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        });

        const parsedResult = JSON.parse(result.text);
        setOcrResult(parsedResult);
      } catch (error) {
        console.log("analyzeReceipt()でエラー : ", error);
        setError(error.message || "エラー");
        setOcrResult({
          ...DEFAULT_OCR_RESULT,
          shop_name: "解析エラー",
        });
      } finally {
        setLoading(false);
        console.log("OCR解析完了");
      }
    };
    analyzeReceipt()
  }, [file, isCategoriesLoading, categories]);

  return {
    ocrResult,
    setOcrResult,
    loading,
    error,
  }
};