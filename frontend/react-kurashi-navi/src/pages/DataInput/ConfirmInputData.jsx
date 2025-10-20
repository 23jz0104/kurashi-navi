import React, { useEffect, useState, useId }from "react";
import { useLocation } from "react-router-dom";
import { Clock, Store, Utensils, ChevronRight, Plus, TicketCheck, CircleQuestionMark, TrainFront, Lightbulb, Volleyball, Trash2  } from "lucide-react";
import Layout from "../../components/common/Layout";
import InputSection from "../../components/common/InputSection";
import styles from "../../styles/DataInput/ConfirmInputData.module.css";
import SubmitButton from "../../components/common/SubmitButton";
import CustomDatePicker from "../../components/common/CustomDatePicker";
import Loader from "../../components/common/Loader";
import DropdownModal from "../../components/common/DropdonwModal";
import Categories from "../../components/common/Categories";

//Google GenAIのインポート レシート解析に使う
import { GoogleGenAI, createUserContent, createPartFromUri, Type} from "../../../node_modules/@google/genai/dist/web/index.mjs";

//仮のカテゴリアイコン
const categoryIcons = [
  { id: 1, name: "食費", icon: <Utensils size={16}/>, color: "#F2A9A9" },
  { id: 2, name: "交通費", icon: <TrainFront size={16} />, color: "#8A77B7"},
  { id: 3, name: "光熱費", icon: <Lightbulb />, color: "#FFEF6C"},
  { id: 4, name: "娯楽", icon: <Volleyball />, color: "#00B16B"},
  { id: 6, name: "割引金額", icon: <TicketCheck size={16}/>, color: "#A9D0F2" },
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
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState();
  const [newProductQuantity, setNewProductQuantity] = useState();
  const [editingItems, setEditingItems] = useState({});
  const [editingCategoryId, setEditingCategoryId] = useState({});
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const total = ocrResult.items.reduce((sum, item) => sum + (item.price || 0), 0);
    setTotalAmount(total);
  }, [ocrResult.items]);

  const productNameId = useId();
  const productPriceId = useId();
  const productQuantityId = useId();
  const newProductNameId = useId();
  const newProductPriceId = useId();
  const newProductQuantityId = useId();

  const addItem = (categoryId, productName, price, quantity) => {
    const newItem = {
      categoryId,
      productName,
      price,
      quantity,
    };

    setOcrResult(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  }

  const changeItem = (index, updateItem) => {
    console.log("changeItem関数実行")

    setOcrResult(prev => {
      const newItem = [...prev.items];
      newItem[index] = {...newItem[index], ...updateItem};
      return { ...prev, items: newItem };
    })
  }

  const deleteItem = (index) => {
    console.log("deleteItem()が実行されました");

    setOcrResult(prev => {
      const deletedResult = [...prev.items];
      deletedResult.splice(index, 1);
      return {...prev, items: deletedResult};
    });

    console.log("現在のocrResult : ", ocrResult);
  }

  useEffect(() => {
    if (!file) return;

    {/* 自分のAPIキー: AIzaSyCTwHtOa-oONrcYrLoakJRNXpwCKJq-5W0 */}
    {/* 鄭君のAPIキー: AIzaSyDaE9IGHmBNnFgSETBDcqZKv93_W2Q5azI */}
    
    const ai = new GoogleGenAI({ apiKey: 'AIzaSyDaE9IGHmBNnFgSETBDcqZKv93_W2Q5azI' });

    async function fetchOcrResult(prompt) {
      console.log("fetchOcrResultが実行されました。")

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
                    price: { type: Type.NUMBER },
                    quantity: { type: Type.NUMBER },
                  },
                  required: ["categoryId", "productName", "price", "quantity"],
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
      - 計算が発生する場合はPythonを用いて実行すること。
      - storeNameはレシート上部の店舗名。不明なら "不明"。
      - productNameは商品名。（割引金額の場合は "値引" とのみ表示する）
      - quantityは数量。解析に当たり数量が検出できない場合は1としてカウント。
      - priceは単価。productNameに対応する金額が合計金額の場合はpriceをquantityで割る。
      - categoryIdは以下の分類ルールに従い、1〜5 の整数で出力する。
        1: 飲食物（食品、飲料、弁当など）
        2: 日用品（洗剤、ティッシュ、文房具など）
        3: 趣味・娯楽（本、ゲーム、スポーツ用品など）
        4: 交通費（電車、バス、タクシーなど）
        5: その他（上記以外）
        6: 割引金額（クーポン、ポイント利用など）
      - 小計・合計・お預かり金などは含めない。
      - 6番カテゴリは最後の出力とする。
      - 6番カテゴリが複数存在する場合、合計を計算して一つの値引として出力すること。
    `;

    fetchOcrResult(prompt);
  }, [file]);

  if(loading) {
    return (
      <Layout 
        headerContent={<p className={styles.headerContent}>入力データ確認</p>}
        mainContent={
          <>
            <Loader text="解析中"/>
            <button onClick={(e) => setLoading(!loading)}>切り替え</button>
          </>
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
                  className={styles["store-name"]}
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
                  {ocrResult.items.map((item, index) => (
                    <DropdownModal
                      key={index} 
                      title={
                        <>
                          <span 
                            className={styles["category-icon"]}
                            style={{backgroundColor: getCategoryColor(item.categoryId)}}
                          >
                            {getCategoryIcon(item.categoryId)}
                          </span>
                          <span className={styles["product-name"]}>{item.productName}</span>
                          <span className={styles["product-price"]}>¥{item.price.toLocaleString()}<ChevronRight size={16}/></span>
                        </>
                      }
                    >
                      {(closeModal) => (
                        <div className={styles["product-detail"]}>
                          <div className={styles["product-detail-header"]}>
                            <span className={styles["product-detail-title"]}>変更</span>
                            <button 
                              className={styles["delete-button"]}
                              onClick={() => {
                                const item = ocrResult.items[index];
                                console.log("デバッグ用 選択された削除対象アイテム : ", item);
                                deleteItem(index);
                                closeModal();
                              }}>
                              <Trash2 size={18}/>
                            </button>
                          </div>
                          <div className={styles["input-group"]}>
                            <label htmlFor={productNameId}>商品名</label>
                            <input
                              id={productNameId} 
                              type="text" 
                              className={styles["input-product-name"]} 
                              defaultValue={item.productName}
                              onChange={(e) => setEditingItems(prev => ({ 
                                ...prev, 
                                [index]: {...prev[index], productName: e.target.value}
                              }))}
                              placeholder="商品名"
                            />
                          </div>
                          <div className={styles["input-group"]}>
                            <label htmlFor={productPriceId}>金額</label>
                            <input 
                              id={productPriceId}
                              type="number" 
                              className={styles["input-product-price"]} 
                              defaultValue={item.price}
                              onChange={(e) => setEditingItems(prev => ({
                                ...prev, 
                                [index]: {...prev[index], price: Number(e.target.value)}
                              }))}
                              placeholder="金額"
                            />
                          </div>
                          <div className={styles["input-group"]}>
                            <label htmlFor={productQuantityId}>数量</label>
                            <input 
                              id={productQuantityId}
                              type="number"
                              className={styles["input-product-quantity"]}
                              defaultValue={item.quantity}
                              onChange={(e) => setEditingItems(prev => ({
                                ...prev,
                                [index]: {...prev[index], price: Number(e.target.value)}
                              }))}
                              placeholder="数量"
                            />
                          </div>
                          <Categories
                            selectedCategory={editingCategoryId[index] ?? item.categoryId}
                            onSelected={(categoryId) => {
                              setEditingCategoryId(prev => ({ ...prev, [index]: categoryId }));
                              setEditingItems(prev => ({
                                ...prev,
                                [index]: {...prev[index], categoryId}
                              }));
                            }}
                          />
                          <SubmitButton 
                            text={"変更"}
                            onClick={() => {
                              const updates = editingItems[index];
                              if(updates) {
                                changeItem(index, updates);
                                setEditingItems(prev => {
                                  const newState = {...prev};
                                  delete newState[index];
                                  return newState;
                                });
                                closeModal(); // 変更成功後にモーダルを閉じる
                              }
                            }}
                          />
                        </div>
                      )}
                    </DropdownModal>
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
                  >
                    {(closeModal) => (
                      <div className={styles["product-detail"]}>
                        <div className={styles["product-detail-header"]}>
                          <span className={styles["product-detail-title"]}>追加</span>
                        </div>
                        <input 
                          type="text" 
                          className={styles["input-product-name"]} 
                          value={newProductName} 
                          onChange={(e) => setNewProductName(e.target.value)} 
                          placeholder="商品名" 
                        />
                        <input 
                          type="number" 
                          className={styles["input-product-price"]} 
                          value={newProductPrice} 
                          onChange={(e) => setNewProductPrice(Number(e.target.value))} 
                          placeholder="0"
                        />
                        <input 
                          type="number"
                          className={styles["input-product-quantity"]}
                          value={newProductQuantity}
                          onChange={(e) => setNewProductQuantity(Number(e.target.value))}
                          placeholder="0"
                        />
                        <Categories 
                          selectedCategory={selectedCategoryId}
                          onSelected={(categoryId) => {
                            setSelectedCategoryId(categoryId);
                            console.log("選択されたカテゴリID : " + categoryId)
                          }}
                        />
                        <SubmitButton 
                          text={"追加"} 
                          onClick={() => {
                            // バリデーションチェック
                            if(!selectedCategoryId || !newProductName || !newProductPrice || !newProductQuantity) {
                              alert("未入力の項目があります。");
                              return; // エラー時はモーダルを閉じない
                            }

                            console.log("現在のselectedCategoryId", selectedCategoryId);

                            addItem(selectedCategoryId, newProductName, newProductPrice, newProductQuantity);
                            setSelectedCategoryId(null);
                            setNewProductName("");
                            setNewProductPrice(0);
                            
                            closeModal(); // 追加成功後にモーダルを閉じる
                          }}
                        />
                      </div>
                    )}
                  </DropdownModal>
                </div>
              ),
            }}
          />
          <SubmitButton text={"追加"}/>
          <button onClick={(e) => setLoading(!loading)}>切り替え</button> 
        </div>
      }
    />
  );
};

export default ConfirmInputData;