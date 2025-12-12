import { useState, useEffect } from "react";
import { GoogleGenAI, createUserContent, createPartFromUri, Type } from "@google/genai";
import { useCategories } from "../common/useCategories";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("APIキーが設定されていません (.env を確認してください)");
}

const generateCategoriesPrompt = (categories) => {
  return categories.map(cat => `   ${cat.id}: ${cat.category_name}`).join('\n');
}

const generateOcrPropmt =  (categoryPrompt) => `  
  レシート画像を解析し、JSON形式で出力してください
  必要な項目:
  shop_name:      店舗名 (不明の場合は"不明")
  shop_address:   住所 (不明の場合は"不明")
  purchase_day:   購買日 (YYYY-MM-DDTHH:mm:SSの形式で出力)
  product_name:   商品名
  product_price:  単価 (複数購入の場合は個数を数量で割る)
  discount:       値引/割引/まとめ買い (適用する商品は値段の下の行に値引/割引/まとめ買いが記載される)
  tax_rate:       商品ごとの消費税の税率
  total_amount:   合計金額 (税込みの合計金額)
  
  【補足】
  商品:
  商品のすべての内容(値引を含む情報)の記載は次の商品名または合計の行まで、前の商品の値引情報を誤って扱わないように

  消費税:
  税率に応じて「消費税(8%)」か「消費税(10%)」に分けてください。
  商品名または商品の値段の横(前か後の場合両方もあります)に「*/軽/※」が記載された場合税率を8%として扱ってください
  それ以外の商品の商品税は10%として扱う
  
  値引/割引/まとめ買い:
  独立の商品で扱いしない
  引く金額は合計金額の上で記載される場合があります、その際に該当する商品は商品名の行の下に値引/割引/まとめ買いの記述があります
  category_idは以下の分類ルール(${categoryPrompt}、99: その他(上記以外))に従い、整数で出力する
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
          tax_rate: { type: Type.INTEGER },
        },
        required: ["product_name", "category_id", "product_price", "discount", "quantity", "tax_rate"],
      },
    },
    total_amount: { type: Type.INTEGER },
    // taxRate: { type: Type.INTEGER },
  },
  required: ["shop_name", "shop_address", "purchase_day", "products", "total_amount"],
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
  const [loading, setLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(DEFAULT_OCR_RESULT);
  const [error, setError] = useState(null);
  const {isLoading: isCategoriesLoading, categories} = useCategories(2); //レシートは基本的に支出のため支出のカテゴリのみ伝える

  useEffect(() => {
    if (!file || isCategoriesLoading) {
      return;
    }

    setLoading(true);
    setError(null);
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
        });;

        const parsedResult = JSON.parse(result.text);
        console.log("OCR解析結果(JSON):", parsedResult);
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