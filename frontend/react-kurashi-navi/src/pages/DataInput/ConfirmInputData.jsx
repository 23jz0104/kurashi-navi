import React from "react";
import { Clock, Store } from "lucide-react";
import Layout from "../../components/common/Layout";
import InputSection from "../../components/common/InputSection";
import styles from "../../styles/DataInput/ConfirmInputData.module.css";

const ConfirmInputData = () => {
  return (
    <Layout 
      headerContent={<p>入力データ確認</p>}
      mainContent={
        <div className={styles["form-container"]}>

					{/* 日付セクション コンポーネント化をしてうまく呼び出す 次はここから開発する*/}
					{/* <InputSection 
						contents={
							<div className={styles["input-label"]}>
								<Clock size={16} />
								日付
								<input type="date" className={styles["input-field"]}/>
							</div>
						}
					/> */}

					{/* 店舗名セクション */}
					<div className={styles["input-section"]}>
						<label className={styles["input-label"]}>
							<Store size={16} />
							店舗名
						</label>
						<input type="text" className={styles["input-field"]} />
					</div>

					{/* 金額及び商品名セクション */}
					<div className={styles["input-section"]}>
						<label className={styles["input-label"]}>
							合計金額: 1000円
						</label>
					</div>

					<div>
						<button>追加</button>
					</div>

        </div>
      }
    />
  )
}

export default ConfirmInputData;