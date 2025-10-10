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
  const [ocrResult, setOcrResult] = useState([]); //解析結果を格納

  useEffect(() => {
    if (!file) return;

    const ai = new GoogleGenAI({ apiKey: 'AIzaSyCTwHtOa-oONrcYrLoakJRNXpwCKJq-5W0' });

    async function fetchOcrResult() {
      const myfile = await ai.files.upload({
        file,
      });

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: createUserContent([
          createPartFromUri(myfile.uri, myfile.mimeType),
          "画像の文字をJSON形式て出力してください。JSONに持たせる属性はid, categoryid, productName, priceの4つで、idを先頭にして順に出力してください。" +
          "また、それ以外の属性は不要なため出力内容に含めないで下さい。上記指定の属性で一つのオブジェクトとします。" +
          "複数の商品がある場合は、オブジェクトを複数個持つ配列形式で出力してください。"
        ]),
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: {
                  type: Type.INTEGER,
                },
                categoryId: {
                  type: Type.INTEGER,
                },
                productName: {
                  type: Type.STRING,
                },
                price: {
                  type: Type.INTEGER,
                }
              }
            }
          }
        }
      });

      try {
        console.log(result.text);
        const parsedResult = JSON.parse(result.text);
        console.log(parsedResult);
        setOcrResult(parsedResult);
      } catch (error) {
        console.error("JSONのパースに失敗しました:", error);
        setOcrResult([]);
      }
      setLoading(false);
    };

    fetchOcrResult();
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
              label:<><Clock size={16} />日付</>,
              contents: <CustomDatePicker />
            }}
          />

          <InputSection 
            fields={{
              label: <><Store size={16} />店舗名</>,
              contents: <input type="text" placeholder="未入力" />
            }}
          />

          <InputSection 
            fields={{
              label: <>合計金額:<span className={styles["total-amount"]}>¥0</span></>,
              contents: (
                // <div className={styles["item-list"]}>
                //   {recieptItems.map((item) => (
                //     <button key={item.id} className={styles["item-row"]}>
                //       <span className={styles["category-icon"]}>{getCategoryIcon(item.categoryId)}</span>
                //       <span>{item.productName}</span>
                //       <span>¥{item.price}<ChevronRight size={16}/></span>
                //     </button>
                //   ))}
                // </div>
                <div>{JSON.stringify(ocrResult)}</div>
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