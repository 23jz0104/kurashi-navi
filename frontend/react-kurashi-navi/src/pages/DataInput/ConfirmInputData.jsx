import React from "react";
import { Clock, Store } from "lucide-react";
import Layout from "../../components/common/Layout";
import InputSection from "../../components/common/InputSection";
import styles from "../../styles/DataInput/ConfirmInputData.module.css";
import SubmitButton from "../../components/common/SubmitButton";

const ConfirmInputData = () => {
  return (
    <Layout 
      headerContent={<p className={styles.headerContent}>入力データ確認</p>}
      mainContent={
        <div className={styles["form-container"]}>
          
          <InputSection
            fields={{
              label:<><Clock size={16} />日付</>,
              contents: <input type="date"/>
            }}
          />

          {/* 店舗名セクション */}
          <InputSection 
            fields={{
              label: (
                <>
                  <Store size={16} />
                  店舗名
                </>
              ),
              contents: (
                <>
                  <input type="text" className={styles["input-field"]} placeholder="未入力" />
                </>
              )
            }}
          />

          <SubmitButton 
            text={
              <>
                追加
              </>
            }
          />
        </div>
      }
    />
  );
};

export default ConfirmInputData;