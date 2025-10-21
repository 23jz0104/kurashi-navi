import { useEffect, useState } from "react";
import styles from "./MonthPicker.module.css";
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MonthPicker = () => {
  // 1月31日などから2月に遷移するとバグるため日付は今日の月をベースに1に変換
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date;
  }); 

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return `${year}年${month}月`;
  }

  const changeMonth = (month) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + month);
    setSelectedMonth(newMonth);
  }

  return(
    <div className={styles["month-date-picker"]}>
      <div className={styles["month-picker-display"]}>
        <button
          type="button"
          onClick={() => changeMonth(-1)}
        >
          <ChevronLeft size={20}/>
        </button>

        <button type="button">
          {formatDate(selectedMonth)}
        </button>

        <button
          type="button"
          onClick={() => changeMonth(1)}
        >
          <ChevronRight size={20}/>
        </button>
      </div>
    </div>
  )
}

export default MonthPicker;