import React, { useEffect, useState, useId } from "react";
import { useLocation } from "react-router-dom";
import {
  ChevronRight, 
  Plus, 
  CircleQuestionMark, 
  Trash2,
} from "lucide-react";
import Layout from "../../components/common/Layout";
import styles from "../../styles/DataInput/ConfirmInputData.module.css";
import SubmitButton from "../../components/common/SubmitButton";
import DayPicker from "../../components/common/DayPicker";
import Loader from "../../components/common/Loader";
import DropdownModal from "../../components/common/DropdonwModal";
import Categories from "../../components/common/Categories";
import { useCategories } from "../../components/hooks/useCategories";
import { useOcrAnalysis } from "../../components/hooks/useOcrAnalysis";

const ConfirmInputData = () => {
  const location = useLocation();
  const file = location.state?.file;

  const { getCategoryById, categoriesByType } = useCategories();
  const { ocrResult, setOcrResult, loading, error } = useOcrAnalysis(file);

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

  // ID生成
  const productNameId = useId();
  const productPriceId = useId();
  const productQuantityId = useId();
  const productDiscountId = useId();
  const newProductNameId = useId();
  const newProductPriceId = useId();
  const newProductQuantityId = useId();
  const newProductDiscountId = useId();

  // 合計金額と税額の計算
  useEffect(() => {
    const subtotal = ocrResult.items.reduce((sum, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      const discount = item.discount || 0;
      return sum + (price * quantity) - discount;
    }, 0);
    
    setTotalAmount(subtotal);
    setTax(Math.floor(subtotal * (ocrResult.taxRate / 100)));
  }, [ocrResult.items, ocrResult.taxRate]);

  // カンマ区切りフォーマット関数
  const formatNumberWithCommas = (value) => {
    if (!value && value !== 0) return '';
    const strValue = String(value);
    const isNegative = strValue.startsWith("-");
    const absValue = isNegative ? strValue.slice(1) : strValue;
    const formattedInteger = absValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return isNegative ? "-" + formattedInteger : formattedInteger;
  };

  // 数値入力ハンドラー
  const handleNumberInput = (input, setDisplayValue, setActualValue) => {
    const cleaned = input.replace(/[^\d,-]/g, "");
    const isNegative = cleaned.startsWith("-");
    const numericString = cleaned.replace(/[,-]/g, "");

    if (numericString === "") {
      setDisplayValue(isNegative ? "-" : "");
      setActualValue(isNegative ? "-" : "");
      return;
    }

    const withoutLeadingZeros = numericString.replace(/^0+/, "") || "0";
    const valueWithSign = isNegative ? "-" + withoutLeadingZeros : withoutLeadingZeros;
    const formatted = formatNumberWithCommas(valueWithSign);

    setDisplayValue(formatted);
    setActualValue(Number(valueWithSign));
  };

  // アイテム追加
  const addItem = (categoryId, productName, price, quantity) => {
    const newItem = {
      categoryId,
      productName,
      price,
      quantity,
    };

    setOcrResult(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  // アイテム変更
  const changeItem = (index, updateItem) => {
    console.log("changeItem関数実行");

    setOcrResult(prev => {
      const newItem = [...prev.items];
      newItem[index] = { ...newItem[index], ...updateItem };
      return { ...prev, items: newItem };
    });
  };

  // アイテム削除
  const deleteItem = (index) => {
    console.log("deleteItem()が実行されました");

    setOcrResult(prev => {
      const deletedResult = [...prev.items];
      deletedResult.splice(index, 1);
      return { ...prev, items: deletedResult };
    });

    console.log("現在のocrResult : ", ocrResult);
  };

  // ローディング中の表示
  if (loading) {
    return (
      <Layout
        headerContent={<p className={styles.headerContent}>入力データ確認</p>}
        mainContent={<Loader text="解析中" />}
      />
    );
  }

  // メインコンテンツ
  return (
    <Layout
      headerContent={<p className={styles.headerContent}>入力データ確認</p>}
      mainContent={
        <div className={styles["form-container"]}>
          {/* ヘッダー情報 */}
          <div className={styles["header-container"]}>
            <DayPicker date={ocrResult.date} />
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

          {/* 合計情報 */}
          <div className={styles["total-container"]}>
            <div className={styles["total-row"]}>
              <span className={styles["total-label"]}>小計（税抜）</span>
              <span className={styles["sub-total-amount"]}>
                ¥{totalAmount.toLocaleString()}
              </span>
            </div>
            <div className={`${styles["total-row"]} ${styles["tax-container"]}`}>
              <span className={`${styles["total-label"]} ${styles["tax-value"]}`}>
                消費税（{ocrResult.taxRate}%）
              </span>
              <span className={styles["tax"]}>¥{tax.toLocaleString()}</span>
              <ChevronRight size={14} />
            </div>
            <div className={`${styles["total-row"]} ${styles["total-amount-container"]}`}>
              <span className={styles["total-label"]}>合計金額</span>
              <span className={styles["total-amount"]}>
                ¥{(totalAmount + tax).toLocaleString()}
              </span>
            </div>
          </div>

          {/* アイテムリスト */}
          <div className={styles["item-container"]}>
            <div className={styles["item-list"]}>
              {ocrResult.items.map((item, index) => {
                const category = getCategoryById(item.categoryId);
                const categoryColor = category?.color || "#868E96";
                const categoryIcon = category?.icon ? (
                  React.cloneElement(category.icon, { size: 16 })
                ) : (
                  <CircleQuestionMark size={16} />
                );

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
                            id={`${productNameId}-${index}`}
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
                            id={`${productPriceId}-${index}`}
                            type="text"
                            inputMode="numeric"
                            className={styles["input-product-price"]}
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
                            id={`${productQuantityId}-${index}`}
                            type="text"
                            inputMode="numeric"
                            className={styles["input-product-quantity"]}
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
                            closeModal();
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
                        value={newQuantityDisplay || "1"}
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
                        value={newDiscountDisplay || "0"}
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

                        setSelectedCategoryId(null);
                        setNewProductName("");
                        setNewProductPrice(0);
                        setNewProductQuantity(1);
                        setNewPriceDisplay("");
                        setNewQuantityDisplay("");
                        setNewDiscountDisplay("");

                        closeModal();
                      }}
                    />
                  </div>
                )}
              </DropdownModal>
            </div>
          </div>
          
          <SubmitButton text={"登録する"} />
        </div>
      }
    />
  );
};

export default ConfirmInputData;