import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./ExpenseManualInput.module.css";
import { Upload, Camera } from "lucide-react";

// 新しく作った子コンポーネント
import ReceiptForm from "./ReceiptForm";
import CompleteModal from "../common/CompleteModal";

const ExpenseManualInput = ({ categories = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 複数のレシートを管理する配列
  const [receiptList, setReceiptList] = useState([]);
  const [showComplete, setShowComplete] = useState(false);

  // OCRデータの受け取りと初期化
  useEffect(() => {
    const rawData = location.state?.receiptData || location.state?.ocrResult;

    if (rawData) {
      console.log("OCRデータ受信(親):", rawData);
      
      let newReceipts = [];

      // ★日付を安全に取り出すヘルパー関数
      const getSafeDate = (source) => {
        // 候補となるキーを全てチェック (OCRエンジンによって名前が違う場合への対策)
        const dateVal = source.purchase_day || source.date || source.payment_date;
        
        // 値があればDateオブジェクト化、なければ今日の日付
        if (dateVal) {
          const d = new Date(dateVal);
          return isNaN(d.getTime()) ? new Date() : d;
        }
        return new Date();
      };

      // パターンA: 複数枚のレシート
      if (rawData.receipts && Array.isArray(rawData.receipts) && rawData.receipts.length > 0) {
        newReceipts = rawData.receipts.map(r => ({
          shop_name: r.shop_name || r.store || r.store_name || "",
          shop_address: r.shop_address || r.address || "",
          
          // ★修正: ここで確実にDateオブジェクトを作る
          purchase_day: getSafeDate(r),

          tel: r.tel || "",
          products: (r.products || []).map(p => ({
            product_name: p.product_name || p.name || "", 
            product_price: p.product_price || p.price || 0,
            quantity: p.quantity || 1,
            category_id: p.category_id || null,
            tax_rate: p.tax_rate || 8,
            discount: p.discount || 0
          }))
        }));
      } 
      // パターンB: 単一データ
      else {
        newReceipts = [{
          shop_name: rawData.shop_name || rawData.store || "",
          shop_address: rawData.shop_address || "",
          
          // ★修正: ここでも確実にDateオブジェクトを作る
          purchase_day: getSafeDate(rawData),

          products: (rawData.products || []).map(p => ({
            product_name: p.product_name || p.name || "",
            product_price: p.product_price || p.price || 0,
            quantity: p.quantity || 1,
            category_id: p.category_id || null
          }))
        }];
      }

      setReceiptList(newReceipts);
      window.history.replaceState({}, document.title);
    } else {
      // 初期値
      setReceiptList([{ shop_name: "", purchase_day: new Date(), products: [] }]);
    }
  }, [location.state]);

  // すべて完了したかチェック（必要に応じて）
  const handleChildComplete = () => {
    // 完了時の演出など（オプション）
    setShowComplete(true);
    setTimeout(() => setShowComplete(false), 1500);
  };

  // 手動でレシートを追加する機能（オプション）
  const handleAddReceipt = () => {
    setReceiptList([...receiptList, { store: "", date: new Date(), products: [] }]);
  };

  return (
    <div className={styles["form-container"]}>
      {/* 上部ボタンエリア */}
      <div className={styles["ocr-container"]}>
        <div className={styles["ocr-buttons"]}>
          {/* <button className={styles["ocr-button"]}>
            <Upload size={20} />
            <span className={styles["ocr-button-text"]}>アップロード</span>
          </button> */}
          
          {/* 追加ボタンに流用 */}
          <button className={styles["ocr-button"]} onClick={handleAddReceipt} style={{width: "100%"}}>
            <PlusIcon />
            <span className={styles["ocr-button-text"]}>レシート入力枠を追加</span>
          </button>
        </div>
      </div>

      {/* <div style={{ marginBottom: "10px", color: "#666", fontSize: "0.9rem", textAlign: "center" }}>
        レシート{receiptList.length}
      </div> */}

      <div className={styles["receipts-wrapper"]}>
        {receiptList.map((receiptData, index) => (
          <ReceiptForm
            key={index}
            index={index}
            initialData={receiptData}
            categories={categories}
            onComplete={handleChildComplete}
          />
        ))}
      </div>

      {/* 完了モーダル（保存時に一瞬出す） */}
      {showComplete && <CompleteModal />}
    </div>
  );
};

// アイコン用（簡易）
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default ExpenseManualInput;