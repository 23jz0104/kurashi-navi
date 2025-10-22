import React from "react";
import styles from './BudgetManagement.module.css';
import BottomNav from "./BottomNav";

function BudgetManagement({ onGoLog, onGoNewLog, active, onNavigate }) {
  return (
    <div className={styles.main}>
      <div className={styles['flex-log']}>
        <ul>
          <li>
            <button className={styles.logBtn} onClick={onGoLog}>
              予算確認
            </button>
          </li>
          <li>
            <button className={styles.sinkiBtn} onClick={onGoNewLog}>
              予算設定
            </button>
          </li>
        </ul>
      </div>

   
    
    </div>
  );
}

export default BudgetManagement;
