import React, { useEffect, useState, useId } from "react";
import { useLocation } from "react-router-dom";
// CircleQuestionMark はデフォルトアイコンとして使用
// Trash2 の後ろのスペースを削除
import { Clock, Store, ChevronRight, Plus,CircleQuestionMark, Trash2, MapPinHouse, ArrowRight } from "lucide-react";
import Layout from "../../components/common/Layout";
import InputSection from "../../components/common/InputSection";
import styles from "../../styles/DataInput/ConfirmInputData.module.css";
import SubmitButton from "../../components/common/SubmitButton";
import DayPicker from "../../components/common/DayPicker";
import Loader from "../../components/common/Loader";
import DropdownModal from "../../components/common/DropdonwModal";
import Categories from "../../components/common/Categories";
import { useCategories } from "../../components/hooks/useCategories";

//Google GenAIのインポート レシート解析に使う
import { GoogleGenAI, createUserContent, createPartFromUri, Type } from "@google/genai";

const ConfirmInputData = () => {
  const location = useLocation();
  const file = location.state?.file;

  // 修正 1: getCategoryId -> getCategoryById に修正
  const { getCategoryById, categoriesByType } = useCategories();

  //状態を管理
  const [loading, setLoading] = useState(true);
  const [ocrResult, setOcrResult] = useState({ 
    storeName: "", 
    storeAddress: "", 
    date: "", 
    items: [], 
    totalAmount: 0, 
    taxRate: 0}); //解析結果を格納
  const [newProductName, setNewProductName] = useState("");
  const [newProductPrice, setNewProductPrice] = useState(0);
  const [newProductQuantity, setNewProductQuantity] = useState(1);
	const [newProductDiscount, setNewProductDiscount] = useState(0);
  const [editingItems, setEditingItems] = useState({});
  const [editingCategoryId, setEditingCategoryId] = useState({});
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
	const [totalAmount, setTotalAmount] = useState(0);
	const [tax, setTax] = useState(0);

  // カンマ区切り表示用のstate
  const [newPriceDisplay, setNewPriceDisplay] = useState("");
  const [newQuantityDisplay, setNewQuantityDisplay] = useState("");
	const [newDiscountDisplay, setNewDiscountDisplay] = useState("");
  const [editPriceDisplay, setEditPriceDisplay] = useState({});
  const [editQuantityDisplay, setEditQuantityDisplay] = useState({});
	const [editDiscountDisplay, setEditDiscountDisplay] = useState({}); 

	useEffect(() => {
		// 税抜き合計を計算
		const subtotal = ocrResult.items.reduce((sum, item) => {
			const price = item.price || 0;
			const quantity = item.quantity || 1;
			const discount = item.discount || 0;
			return sum + (price * quantity) - discount;
		}, 0);
		
		// 合計
		setTotalAmount(subtotal);

		// 税額を計算
		setTax(Math.floor(subtotal * (ocrResult.taxRate / 100)));
	}, [ocrResult.items, ocrResult.taxRate]);

  const productNameId = useId();
  const productPriceId = useId();
  const productQuantityId = useId();
	const productDiscountId = useId();
  const newProductNameId = useId();
  const newProductPriceId = useId();
  const newProductQuantityId = useId();
	const newProductDiscountId = useId();

  // カンマ区切りフォーマット関数
  const formatNumberWithCommas = (value) => {
    if (!value && value !== 0) return '';
    const strValue = String(value);
    const isNegative = strValue.startsWith("-");
    const absValue = isNegative ? strValue.slice(1) : strValue;
    const formattedInteger = absValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return isNegative ? "-" + formattedInteger : formattedInteger;
  };

  // 数値入力ハンドラー（共通関数）
  const handleNumberInput = (input, setDisplayValue, setActualValue) => {
    const cleaned = input.replace(/[^\d,-]/g, "");
    const isNegative = cleaned.startsWith("-");
    const numericString = cleaned.replace(/[,-]/g, "");

    if (numericString === "") {
      setDisplayValue(isNegative ? "-" : "");
      setActualValue(isNegative ? "-" : ""); // "" や 0 でなく "-" を保持（必要に応じて変更）
      return;
    }

    const withoutLeadingZeros = numericString.replace(/^0+/, "") || "0";
    const valueWithSign = isNegative ? "-" + withoutLeadingZeros : withoutLeadingZeros;
    const formatted = formatNumberWithCommas(valueWithSign);

    setDisplayValue(formatted);
    setActualValue(Number(valueWithSign));
  };

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
      newItem[index] = { ...newItem[index], ...updateItem };
      return { ...prev, items: newItem };
    })
  }

  const deleteItem = (index) => {
    console.log("deleteItem()が実行されました");

    setOcrResult(prev => {
      const deletedResult = [...prev.items];
      deletedResult.splice(index, 1);
      return { ...prev, items: deletedResult };
    });

    console.log("現在のocrResult : ", ocrResult);
  }

  useEffect(() => {
    if (!file) {
        setLoading(false); // ファイルがない場合はローディング終了
        return;
    }

    const ai = new GoogleGenAI({ apiKey: 'AIzaSyDaE9IGHmBNnFgSETBDcqZKv93_W2Q5azI' }); // APIキーは環境変数推奨

    async function fetchOcrResult(prompt) {
      console.log("fetchOcrResultが実行されました。")
      setLoading(true); // 解析開始

      try {
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
            },
          },
        });

        console.log(result.text);

        const parsedResult = JSON.parse(result.text);
        setOcrResult(parsedResult);
      } catch (error) {
        console.error("OCR解析エラー:", error);
        // TODO: ユーザーにエラーを通知するUI（例: アラート、トースト）
        setOcrResult({ storeName: "解析エラー", items: [] }); // エラー時
      } finally {
        setLoading(false); // 成功・失敗に関わらずローディング終了
      }
    };

    const prompt = `
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

    fetchOcrResult(prompt);
  }, [file]); // file が変更された時のみ実行

  if (loading) {
    return (
      <Layout
        headerContent={<p className={styles.headerContent}>入力データ確認</p>}
        mainContent={
          <>
            <Loader text="解析中" />
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

					<div className={styles["header-container"]}>
						<DayPicker date={ocrResult.date}/>
						<div className={styles["header-container-row"]}>
							<span>店舗名</span>
							<input
								className={styles["store-name-value"]}
								type="text"
								placeholder="未入力"
								value={ocrResult.storeName}
								onChange={(e) =>
									setOcrResult({ ...ocrResult, storeName: e.target.value })
								}
							/>
						</div>
						<div className={styles["header-container-row"]}>
							<span>住　所</span>
							<input
								className={styles["store-address-value"]}
								type="text"
								placeholder="未入力"
								value={ocrResult.storeAddress}
								onChange={(e) => 
									setOcrResult({ ...ocrResult, storeAddress: e.target.value })
								}
							/>
						</div>
					</div>

				<div className={styles["total-container"]}>
					<div className={styles["total-row"]}>
						<span className={styles["total-label"]}>小計（税抜）</span>
						<span className={styles["sub-total-amount"]}>
							¥{totalAmount.toLocaleString()}
						</span>
					</div>
					<div className={`${styles["total-row"]} ${styles["tax-container"]}`}>
						<span className={`${styles["total-label"]} ${styles["tax-value"]}`}>消費税（{ocrResult.taxRate}%）</span>
						<span className={styles["tax"]}>¥{tax.toLocaleString()}</span>
						<ChevronRight size={14}/>
					</div>
					<div className={`${styles["total-row"]} ${styles["total-amount-container"]}`}>
						<span className={styles["total-label"]}>合計金額</span>
						<span className={styles["total-amount"]}>
							¥{(totalAmount + tax).toLocaleString()}
						</span>
					</div>
				</div>

				<div className={styles["item-container"]}>
						<div className={styles["item-list"]}>
							{ocrResult.items.map((item, index) => {
								// 修正 2: getCategoryById を使用してカテゴリ情報を取得
								const category = getCategoryById(item.categoryId);
								const categoryColor = category?.color || "#868E96"; // デフォルト色 (ID 99: その他)
								// category.icon は React 要素。cloneElement で size を指定
								const categoryIcon = category?.icon ? (
									React.cloneElement(category.icon, { size: 16 })
								) : (
									<CircleQuestionMark size={16} />
								); // デフォルトアイコン

								return (
									<DropdownModal
										key={index}
										title={
											<>
												<span
													className={styles["category-icon"]}
													style={{ backgroundColor: categoryColor }}
												>
													{categoryIcon}
												</span>
												<span className={styles["product-name"]}>
													{item.productName}
												</span>
												<div className={styles["product-price-info"]}>
													<span className={styles["product-total-price"]}>
														¥{(item.price * item.quantity).toLocaleString()}
													</span>
													<div className={styles["product-sub-info"]}>
														{item.quantity >= 2 && (
															<span className={styles["product-price-and-quantity"]}>
																¥{item.price.toLocaleString()} × {item.quantity}個
															</span>
														)}
														{item.discount > 0 && (
															<span className={styles["product-discount"]}>
																¥-{item.discount}
															</span>
														)}
													</div>
												</div>
												<ChevronRight size={16} />
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
															deleteItem(index);
															closeModal();
														}}
													>
														<Trash2 size={18} />
													</button>
												</div>
												<div className={styles["input-group"]}>
													<label htmlFor={`${productNameId}-${index}`}>商品名</label>
													<input
														id={`${productNameId}-${index}`} // IDが一意になるように
														type="text"
														className={styles["input-product-name"]}
														defaultValue={item.productName}
														onChange={(e) =>
															setEditingItems((prev) => ({
																...prev,
																[index]: {
																	...prev[index],
																	productName: e.target.value,
																},
															}))
														}
														placeholder="商品名"
													/>
												</div>
												<div className={styles["input-group"]}>
													<label htmlFor={`${productPriceId}-${index}`}>金額</label>
													<input
														id={`${productPriceId}-${index}`} // IDが一意になるように
														type="text"
														inputMode="numeric"
														className={styles["input-product-price"]}
														// カンマ区切り入力に対応するため、value と onChange で制御
														value={
															editPriceDisplay[index] !== undefined
																? editPriceDisplay[index]
																: formatNumberWithCommas(item.price)
														}
														onChange={(e) =>
															handleNumberInput(
																e.target.value,
																(formatted) =>
																	setEditPriceDisplay((prev) => ({
																		...prev,
																		[index]: formatted,
																	})),
																(numValue) =>
																	setEditingItems((prev) => ({
																		...prev,
																		[index]: { ...prev[index], price: numValue },
																	}))
															)
														}
														placeholder="金額"
													/>
												</div>
												<div className={styles["input-group"]}>
													<label htmlFor={`${productQuantityId}-${index}`}>数量</label>
													<input
														id={`${productQuantityId}-${index}`} // IDが一意になるように
														type="text"
														inputMode="numeric"
														className={styles["input-product-quantity"]}
														// カンマ区切り入力に対応するため、value と onChange で制御
														value={
															editQuantityDisplay[index] !== undefined
																? editQuantityDisplay[index]
																: formatNumberWithCommas(item.quantity)
														}
														onChange={(e) =>
															handleNumberInput(
																e.target.value,
																(formatted) =>
																	setEditQuantityDisplay((prev) => ({
																		...prev,
																		[index]: formatted,
																	})),
																(numValue) =>
																	setEditingItems((prev) => ({
																		...prev,
																		[index]: { ...prev[index], quantity: numValue },
																	}))
															)
														}
														placeholder="数量"
													/>
												</div>
												<div className={styles["input-group"]}>
													<label htmlFor={`${productDiscountId}-${index}`}>割引</label>
													<input
														id={`${productDiscountId}-${index}`}
														type="text"
														inputMode="numeric"
														className={styles["input-product-discount"]}
														value={
															editDiscountDisplay[index] != undefined
																? editDiscountDisplay[index]
																: formatNumberWithCommas(item.discount)
														}
														onChange={(e) =>
															handleNumberInput(
																e.target.value,
																(formatted) =>
																	setEditDiscountDisplay((prev) => ({
																		...prev,
																		[index]: formatted,
																	})),
																(numValue) =>
																	setEditingItems((prev) => ({
																		...prev,
																		[index]: { ...prev[index], discount: numValue },
																	}))
															)
														}
														placeholder="割引"
													/>
												</div>
												{/* 修正 3: categoriesByType.expense を渡す */}
												<Categories
													categories={categoriesByType.expense}
													selectedCategory={
														editingCategoryId[index] ?? item.categoryId
													}
													onSelected={(categoryId) => {
														setEditingCategoryId((prev) => ({
															...prev,
															[index]: categoryId,
														}));
														setEditingItems((prev) => ({
															...prev,
															[index]: { ...prev[index], categoryId },
														}));
													}}
												/>
												<SubmitButton
													text={"変更"}
													onClick={() => {
														const updates = editingItems[index];
														if (updates) {
															changeItem(index, updates);
															// 編集用の一時stateをクリア
															setEditingItems((prev) => {
																const newState = { ...prev };
																delete newState[index];
																return newState;
															});
															setEditingCategoryId((prev) => {
																const newState = { ...prev };
																delete newState[index];
																return newState;
															});
															setEditPriceDisplay((prev) => {
																const newState = { ...prev };
																delete newState[index];
																return newState;
															});
															setEditQuantityDisplay((prev) => {
																const newState = { ...prev };
																delete newState[index];
																return newState;
															});
															setEditDiscountDisplay((prev) => {
																const newState = { ...prev };
																delete newState[index];
																return newState;
															});
														}
														closeModal(); // 変更があってもなくても閉じる
													}}
												/>
											</div>
										)}
									</DropdownModal>
								);
							})}

							{/* 項目を追加 */}
							<DropdownModal
								title={
									<>
										<span
											className={styles["category-icon"]}
											style={{ backgroundColor: "#C0C0C0" }}
										>
											<Plus size={16} />
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
										<div className={styles["input-group"]}>
											<label htmlFor={newProductNameId}>商品名</label>
											<input
												id={newProductNameId}
												type="text"
												className={styles["input-product-name"]}
												value={newProductName}
												onChange={(e) => setNewProductName(e.target.value)}
												placeholder="商品名"
											/>
										</div>
										<div className={styles["input-group"]}>
											<label htmlFor={newProductPriceId}>金額</label>
											<input
												id={newProductPriceId}
												type="text"
												inputMode="numeric"
												className={styles["input-product-price"]}
												value={newPriceDisplay}
												onChange={(e) =>
													handleNumberInput(
														e.target.value,
														setNewPriceDisplay,
														setNewProductPrice
													)
												}
												placeholder="0"
											/>
										</div>
										<div className={styles["input-group"]}>
											<label htmlFor={newProductQuantityId}>数量</label>
											<input
												id={newProductQuantityId}
												type="text"
												inputMode="numeric"
												className={styles["input-product-quantity"]}
												value={newQuantityDisplay || "1"} // デフォルト 1 を表示
												onChange={(e) =>
													handleNumberInput(
														e.target.value,
														setNewQuantityDisplay,
														setNewProductQuantity
													)
												}
												placeholder="1"
											/>
										</div>
										<div className={styles["input-group"]}>
											<label htmlFor={newProductDiscountId}>割引</label>
											<input
												id={newProductDiscountId}
												type="text"
												inputMode="numeric"
												className={styles["input-product-discount"]}
												value={newDiscountDisplay || "0"} // デフォルト 0 を表示
												onChange={(e) =>
													handleNumberInput(
														e.target.value,
														setNewDiscountDisplay,
														setNewProductDiscount
													)
												}
												placeholder="0"
											/>
										</div>
										<Categories
											categories={categoriesByType.expense}
											selectedCategory={selectedCategoryId}
											onSelected={(categoryId) => {
												setSelectedCategoryId(categoryId);
											}}
										/>
										<SubmitButton
											text={"追加"}
											onClick={() => {
												const finalQuantity =
													newProductQuantity === null || newProductQuantity === 0
														? 1
														: newProductQuantity;

												// バリデーションチェック
												if (
													!selectedCategoryId ||
													!newProductName ||
													newProductPrice === null ||
													newProductPrice === undefined
												) {
													alert("カテゴリ、商品名、金額は必須です。");
													return;
												}

												addItem(
													selectedCategoryId,
													newProductName,
													newProductPrice,
													finalQuantity
												);

												// 追加フォームのリセット
												setSelectedCategoryId(null);
												setNewProductName("");
												setNewProductPrice(0);
												setNewProductQuantity(1);
												setNewPriceDisplay("");
												setNewQuantityDisplay("");

												closeModal();
											}}
										/>
									</div>
								)}
							</DropdownModal>
						</div>
					</div>
          <SubmitButton text={"登録する"} /> {/* 最後のボタンは「登録」などが適切か */}
      </div>
      }
    />
  );
};

export default ConfirmInputData;