import React, { useEffect, useState }from "react";
import { useLocation } from "react-router-dom";
import { Clock, Store, Utensils, ChevronRight } from "lucide-react";
import Layout from "../../components/common/Layout";
import InputSection from "../../components/common/InputSection";
import styles from "../../styles/DataInput/ConfirmInputData.module.css";
import SubmitButton from "../../components/common/SubmitButton";
import CustomDatePicker from "../../components/common/CustomDatePicker";

//Google GenAIのインポート レシート解析に使う
import { GoogleGenAI, createUserContent, createPartFromUri, Type} from "../../../node_modules/@google/genai/dist/web/index.mjs";

//仮のレシートデータ
const recieptItems = [
  { id: 1, categoryId: 1, productName: "ニンジン", price: 100 },
  { id: 2, categoryId: 1, productName: "たまねぎ", price: 100 },
  { id: 3, categoryId: 1, productName: "牛肉", price: 500 },
  { id: 4, categoryId: 1, productName: "レタス", price: 150 },
  { id: 5, categoryId: 1, productName: "牛乳", price: 200 },
];

//仮のカテゴリアイコン
const categoryIcons = {
  1: { name: "食費", icon: <Utensils size={16}/>},
}

const getCategoryIcon = (categoryId) => {
  return categoryIcons[categoryId].icon;
}

const ConfirmInputData = () => {
  const location = useLocation();
  const file = location.state?.file;

  //状態を管理
  const [loading, setLoading] = useState(true);
  const [ocrResult, setOcrResult] = useState({ storeName: "", items: [] }); //解析結果を格納
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (!file) return;

    const ai = new GoogleGenAI({ apiKey: 'AIzaSyCTwHtOa-oONrcYrLoakJRNXpwCKJq-5W0' });

    async function fetchOcrResult(prompt) {
      const myfile = await ai.files.upload({
        file: file,
        config: { mimeType: file.type },
      });

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: createUserContent([
          createPartFromUri(myfile.uri, myfile.mimeType),
          prompt,
        ]),
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              storeName: { type: Type.STRING },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    categoryId: { type: Type.INTEGER },
                    productName: { type: Type.STRING },
                    price: { type: Type.NUMBER }
                  },
                  required: ["categoryId", "productName", "price"],
                },
              },
            },
            required: ["storeName", "items"],
          },
        },
      });

      const parsedResult = JSON.parse(result.text);
      setOcrResult(parsedResult);
      setLoading(false);
    };

    const prompt = `
      あなたはレシート画像を解析するAIです。

      次のルールに従って、店舗名と商品リストを抽出してください。
      出力はJSONのみで行います（説明文やコメントは禁止）。

      【ルール】
      - storeNameはレシート上部の店舗名。不明なら "不明"。
      - categoryIdは以下の分類ルールに従い、1〜4 の整数で出力する。
        レシート内の数値と関係なし。
        1: 飲食物（食品、飲料、弁当など）
        2: 日用品（洗剤、ティッシュ、文房具など）
        3: 趣味・娯楽（本、ゲーム、スポーツ用品など）
        4: その他（上記以外）
      - 小計・合計・お預かり金などは含めない。
    `;

    fetchOcrResult(prompt);
  }, [file]);

  if(loading) {
    return (
      <Layout 
        headerContent={<p className={styles.headerContent}>入力データ確認</p>}
        mainContent={<p>解析中</p>}
      />
    )
  }

  //解析結果を表示
  return (
    <Layout 
      headerContent={<p className={styles.headerContent}>入力データ確認</p>}
      mainContent={
        <div className={styles["form-container"]}>
          
          <InputSection
            fields={{
              label: <><Clock size={16} />日付</>,
              contents: <CustomDatePicker />
            }}
          />

          <InputSection 
            fields={{
              label: <><Store size={16} />店舗名</>,
              contents: (
                <input 
                  type="text" 
                  placeholder="未入力" 
                  value={ocrResult.storeName} 
                  onChange={(e) => 
                    setOcrResult({...ocrResult, storeName: e.target.value})
                  }
                />
              ) 
            }}
          />

          <InputSection 
            fields={{
              label: <>合計金額:<span className={styles["total-amount"]}>¥0</span></>,
              contents: (
                <div className={styles["item-list"]}>
                  {ocrResult.items.map((item, index) => (
                    <button key={index} className={styles["item-row"]}>
                      <span className={styles["category-icon"]}>{getCategoryIcon(item.categoryId)}</span>
                      <span>{item.productName}</span>
                      <span>¥{item.price}<ChevronRight size={16}/></span>
                    </button>
                  ))}
                </div>
              ),
            }}
          />

          <SubmitButton text={"追加"}/>
        </div>
      }
    />
  );
};

export default ConfirmInputData;