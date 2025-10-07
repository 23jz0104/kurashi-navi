import React from "react";
import { Clock } from "lucide-react";
import Layout from "../../components/common/Layout";
import styles from "../../styles/DataInput/ConfirmInputData.module.css";

const ConfirmInputData = () => {
  return (
    <Layout 
      headerContent={<p>入力データ確認</p>}
      mainContent={
        <div className={styles["form-container"]}>
          
          <div className={styles["input-section"]}>
            <label className={styles["input-label"]}>
              <Clock size={16} />
              日付
            </label>
            <input type="date" className={styles["input-field"]}/>
          </div>

        </div>
      }
    />
  )
}

export default ConfirmInputData;