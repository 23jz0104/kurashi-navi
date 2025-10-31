import { useState, useEffect } from "react";
import { GoogleGenAI, createUserContent, createPartFromUri, Type } from "@google/genai";

const API_KEY = "AIzaSyDaE9IGHmBNnFgSETBDcqZKv93_W2Q5azI";

const OCR_PROMPT = `
  あなたはレシート画像を解析するAIです。

  次のルールに従って、JSONを抽出してください。
  出力はJSONのみで行います（説明文やコメントは禁止）。

  【ルール】
  - 計算が発生する場合はPythonを用いて実行すること。
  - storeNameはレシート上部の店舗名。不明なら "不明"。
  - storeAddressはレシートの店舗名の住所。不明なら "不明"。
  - dateは日付。フォーマットは "yyyy-MM-dd" とする。(日付が検出できない、または不完全な場合は今日の日付とする)。
  - productNameは商品名。
  - quantityは数量。解析にあたり数量が検出できない場合は1としてカウント。
  - priceは単価。productNameに対応する金額が合計金額の場合はpriceをquantityで割る。(表示するのは税別の価格)
  - discountは、その商品に対する割引金額（絶対値、例: 50円引きなら50）。

  【重要: 割引の処理方法】
  - レシートに「値引」「割引」などの表記がある場合、それは独立した商品ではありません。
  - 割引は必ず直前または関連する商品のdiscountフィールドに統合してください。
  - 割引だけを持つ独立したitemsレコードを作成してはいけません。
  - 各商品のdiscountフィールドに適切な割引額を設定し、割引がない場合は0とします。
  - 「値引」「割引」といった名前の商品アイテムをitemsに含めないでください。
  - 割引金額に関しては1個あたりの金額を計算する必要はありません。そのままの値を出力してください。

  - categoryIdは以下の分類ルールに従い、1〜5, 99 の整数で出力する。
    1: 飲食物（食品、飲料、弁当など）
    2: 日用品（洗剤、ティッシュ、文房具など）       
    3: 趣味・娯楽（本、ゲーム、スポーツ用品など）
    4: 交通費（電車、バス、タクシーなど）
    5: 光熱費（電気、ガス、水道など）
    99: その他（上記以外）

  - 小計・合計・お預かり金などは含めない。
  - totalAmountは税率を含めた合計金額。商品の価格と数量から適切な合計金額をもとめ、税率を乗じて算出すること。
    尚、レシートに合計金額が表示されており、かつ、それが税込み価格であればそれを利用してもよい。
  - taxRateは税率。
  - 適切なインデントで出力すること。

  【出力例】
  割引がある場合の正しい出力:
  {
    "items": [
      {
        "productName": "商品A",
        "categoryId": 1,
        "price": 200,
        "discount": 50,
        "quantity": 1
      }
    ]
  }

  誤った出力（このような出力は禁止）:
  {
    "items": [
      {
        "productName": "商品A",
        "categoryId": 1,
        "price": 200,
        "discount": 0,
        "quantity": 1
      },
      {
        "productName": "値引",
        "categoryId": 99,
        "price": 0,
        "discount": 50,
        "quantity": 1
      }
    ]
  }
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    storeName: { type: Type.STRING },
    storeAddress: { type: Type.STRING },
    date: { type: Type.STRING },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          categoryId: { type: Type.INTEGER },
          price: { type: Type.INTEGER },
          discount: { type: Type.INTEGER },
          quantity: { type: Type.INTEGER },
        },
        required: ["productName", "categoryId", "price", "discount", "quantity"],
      },
    },
    totalAmount: { type: Type.INTEGER },
    taxRate: { type: Type.INTEGER },
  },
  required: ["storeName", "storeAddress", "date", "items", "totalAmount", "taxRate"],
};

// デフォルトのOCR結果
const DEFAULT_OCR_RESULT = {
  storeName: "",
  storeAddress: "",
  date: "",
  items: [],
  totalAmount: 0,
  taxRate: 0,
};

export const useOcrAnalysis = (file) => {
  const [loading, setLoading] = useState(true);
  const [ocrResult, setOcrResult] = useState(DEFAULT_OCR_RESULT);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) {
      return;
    }

    setLoading(true);
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    const analyzeReceipt = async () => {
      try {
        const uploadFile = await ai.files.upload({
          file: file,
          config: { mimeType: file.type },
        });

        const result = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: createUserContent([
            createPartFromUri(uploadFile.uri, uploadFile.mimeType),
            OCR_PROMPT,
          ]),
          config: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        });

        console.log("解析結果", result.text);

        const parsedResult = JSON.parse(result.text);
        setOcrResult(parsedResult);
      } catch (error) {
        console.log("analyzeReceipt()でエラー : ", error);
        setError(error.message || "エラー");
        setOcrResult({
          ...DEFAULT_OCR_RESULT,
          storeName: "解析エラー",
        });
      } finally {
        setLoading(false);
        console.log("OCR解析完了");
      }
    };
    analyzeReceipt()
  }, [file]);

  return {
    ocrResult,
    setOcrResult,
    loading,
    error,
  }
};