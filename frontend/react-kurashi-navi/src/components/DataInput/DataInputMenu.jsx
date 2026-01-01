import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DataInputMenu.module.css";
import { Wallet, PenTool, Camera, X } from "lucide-react";
import { useReceiptUploader } from "../../hooks/dataInput/useReceiptUploader";
import Loader from "../common/Loader";

const DataInputMenu = ({ onClose }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Gemini連携フック
  const { analyzeImage, isAnalyzing } = useReceiptUploader();

  // 1. 収入入力ページへ遷移
  const handleIncome = () => {
    navigate("/dataInput", { state: { activeTab: "income" } });
    onClose();
  };

  // 2. 支出（手動）入力ページへ遷移
  const handleManualExpense = () => {
    navigate("/dataInput", { state: { activeTab: "expense" } });
    onClose();
  };

  // 3. 支出（OCR/カメラ）
  const handleCameraChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 解析開始
    const result = await analyzeImage(file);

    if (result && result.status === 'success') {
      navigate("/dataInput", { 
        state: { 
          activeTab: "expense", 
          receiptData: result.data 
        } 
      });
      onClose();
    }
    else {
      onClose();
    }
  };

  const triggerCamera = () => {
    fileInputRef.current?.click();
  };

  // 解析中のローディング表示
  if (isAnalyzing) {
    return (
      <div className={styles.loaderOverlay}>
        <Loader text="AIがレシートを解析中..." />
      </div>
    );
  }

  return (
    <>
      {/* 背景をクリックしたら閉じる */}
      <div className={styles.backdrop} onClick={onClose} />

      {/* メニュー本体 */}
      <div className={styles.menuBar}>
        
        {/* ▼ グループ1: 収入 ▼ */}
        <div className={styles.groupContainer}>
          <div className={styles.groupLabel}>収入</div>
          <button className={styles.actionButton} onClick={handleIncome}>
            <div className={`${styles.iconCircle} ${styles.incomeColor}`}>
              <Wallet size={20} />
            </div>
            <span className={styles.buttonText}>入力</span>
          </button>
        </div>

        {/* 区切り線（必要であれば） */}
        <div className={styles.divider} />

        {/* ▼ グループ2: 支出 ▼ */}
        <div className={styles.groupContainer}>
          <div className={styles.groupLabel}>支出</div>
          <div className={styles.expenseButtons}>
            {/* 手動入力 */}
            <button className={styles.actionButton} onClick={handleManualExpense}>
              <div className={`${styles.iconCircle} ${styles.expenseColor}`}>
                <PenTool size={20} />
              </div>
              <span className={styles.buttonText}>手動</span>
            </button>

            {/* カメラ入力 */}
            <button className={styles.actionButton} onClick={triggerCamera}>
              <div className={`${styles.iconCircle} ${styles.cameraColor}`}>
                <Camera size={20} />
              </div>
              <span className={styles.buttonText}>スキャン</span>
              
              {/* 隠しinput */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraChange}
                style={{ display: "none" }}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DataInputMenu;