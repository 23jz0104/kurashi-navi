import React, { useEffect, useState }from "react";
import { useLocation } from "react-router-dom";
import { Clock, Store, Utensils, ChevronRight, Plus, TicketCheck, CircleQuestionMark } from "lucide-react";
import Layout from "../../components/common/Layout";
import InputSection from "../../components/common/InputSection";
import styles from "../../styles/DataInput/ConfirmInputData.module.css";
import SubmitButton from "../../components/common/SubmitButton";
import CustomDatePicker from "../../components/common/CustomDatePicker";
import Loader from "../../components/common/Loader";
import DropdownModal from "../../components/common/DropdonwModal";

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
const categoryIcons = [
  { id: 1, name: "食費", icon: <Utensils size={16}/>, color: "#F2A9A9" },
  { id: 5, name: "割引金額", icon: <TicketCheck size={16}/>, color: "#A9D0F2" },
  { id: 99, name: "未定義", icon: <CircleQuestionMark size={16}/>, color: "gray" },
];

const getCategoryIcon = (categoryId) => {
  const category = categoryIcons.find(c => c.id === categoryId);
  return category ? category.icon : categoryIcons.find(c => c.id === 99).icon;
}

const getCategoryColor = (categoryId) => {
  const category = categoryIcons.find(c => c.id === categoryId);
  return category ? category.color : categoryIcons.find(c => c.id === 99).color;
}

const ConfirmInputData = () => {
  const location = useLocation();
  const file = location.state?.file;

  //状態を管理
  const [loading, setLoading] = useState(true);
  const [ocrResult, setOcrResult] = useState({ storeName: "", items: [] }); //解析結果を格納

  useEffect(() => {
    const total = ocrResult.items.reduce((sum, item) => sum + (item.price || 0), 0);
    setTotalAmount(total);
  }, [ocrResult.items]);

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
      - productNameは商品名。（割引金額の場合は "値引" とのみ表示する）
      - categoryIdは以下の分類ルールに従い、1〜5 の整数で出力する。
        1: 飲食物（食品、飲料、弁当など）
        2: 日用品（洗剤、ティッシュ、文房具など）
        3: 趣味・娯楽（本、ゲーム、スポーツ用品など）
        4: 交通費（電車、バス、タクシーなど）
        5: 割引金額（クーポン、ポイント利用など）
        6: その他（上記以外）
      - 小計・合計・お預かり金などは含めない。
      - 5番カテゴリは最後の出力とする。
      - 5番カテゴリが複数存在する場合、合計の金額をPythonを用いて計算し、一つの値引として出力すること。
    `;

    fetchOcrResult(prompt);
  }, [file]);

  const updateItemPrice = (index, newPrice) => {
    const updateItems = [...ocrResult.items];
    updateItems[index].price = Number(newPrice);
    setOcrResult({ ...ocrResult, items: updateItems });
  }

  if(loading) {
    return (
      <Layout 
        headerContent={<p className={styles.headerContent}>入力データ確認</p>}
        mainContent={
          <Loader text="解析中"/>
        }
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
              label: <>合計金額:<span className={styles["total-amount"]}>¥{totalAmount.toLocaleString()}</span></>,
              contents: (
                <div className={styles["item-list"]}>
                  {ocrResult.items.map((item) => (
                    <DropdownModal 
                      title={
                        <>
                          <span 
                            className={styles["category-icon"]}
                            style={{backgroundColor: getCategoryColor(item.categoryId)}}
                          >
                            {getCategoryIcon(item.categoryId)}
                          </span>
                          <span className={styles["product-name"]}>{item.productName}</span>
                          <span className={styles["product-price"]}>¥{item.price}<ChevronRight size={16}/></span>
                        </>
                      }
                      children={
                        <>
                        </>
                      }
                    />
                    // <button key={index} className={styles["item-row"]}>
                    //   <span 
                    //     className={styles["category-icon"]}
                    //     style={{backgroundColor: getCategoryColor(item.categoryId)}}
                    //     >
                    //     {getCategoryIcon(item.categoryId)}
                    //   </span>
                    //   <span>{item.productName}</span>
                    //   <span>¥{item.price}<ChevronRight size={16}/></span>
                    // </button>
                  ))}

                  <DropdownModal 
                    title={
                      <>
                        <span
                          className={styles["category-icon"]}
                          style={{backgroundColor: "#C0C0C0"}}
                        >
                          <Plus size={16}/>
                        </span>
                        <span className={styles["product-name"]}>項目を追加する</span>
                      </>
                    }
                  />

                  {/* <button className={styles["item-row"]}>
                    <span 
                      className={styles["category-icon"]}
                      style={{backgroundColor: "#C0C0C0"}}
                    >
                      <Plus size={16}/>
                    </span>
                    <span>項目を追加する</span>
                  </button> */}
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