import styles from "./CalendarView.module.css";

const CalendarView = ({ dailySummary = [], currentMonth }) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  console.log(JSON.stringify(dailySummary, null, 1));

  if (dailySummary.length === 0) {
    return (
      <div className={styles["empty-state"]}>
        <p>データが存在しません。</p>
      </div>
    );
  }

  // ---- ここからカレンダー生成ロジック ----

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0);

  const startDay = firstDay.getDay();
  const dayInMonth = lastDay.getDate();
  const prevMonthDays = prevLastDay.getDate();

  const days = [];
  for (let d = startDay - 1; d >= 0; d--) {
    days.push({
      days: prevMonthDays - d,
      isCurrentMonth: false,
    });
  }

  for (let d = 1; d <= dayInMonth; d++) {
    days.push({
      days: d,
      isCurrentMonth: true,
    });
  }

  const nextDaysCount = 7 - (days.length % 7);
  if (nextDaysCount < 7) {
    for (let d = 1; d <= nextDaysCount; d++) {
      days.push({
        days: d,
        isCurrentMonth: false,
      });
    }
  }

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  // dailySummaryから日付ごとの支出・収入を集計
  const dailyDataMap = dailySummary.reduce((acc, item) => {
    const date = item.record_date; // "2025-11-17"
    
    if (!acc[date]) {
      acc[date] = {
        expense: 0,
        income: 0,
      };
    }

    // type_idで支出・収入を判定
    if (item.type_id === "1") {
      acc[date].income += item.total;
    } else if (item.type_id === "2") {
      acc[date].expense += item.total;
    }

    return acc;
  }, {});

  const calendarDays = days.map((day) => {
    if (day.isCurrentMonth) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day.days
      ).padStart(2, "0")}`;
      
      const dayData = dailyDataMap[dateStr] || { expense: 0, income: 0 };
      
      return {
        ...day,
        expenseAmount: dayData.expense,
        incomeAmount: dayData.income,
      };
    }
    return { ...day, expenseAmount: 0, incomeAmount: 0 };
  });

  return (
    <div className={styles["calendar-container"]}>
      <div className={styles["weekdays"]}>
        {weekdays.map((day) => (
          <span className={styles["calendar-cell"]} key={day}>
            {day}
          </span>
        ))}
      </div>

      <div className={styles["days"]}>
        {calendarDays.map((item, index) => (
          <div
            key={index}
            className={`${styles["calendar-cell"]} ${styles["calendar-cell-day"]} ${
              item.isCurrentMonth ? styles["current-month-day"] : ""
            }`}
          >
            <span className={styles["day"]}>{item.days}</span>
            <div className={styles["calendar-cell-inner"]}>
              {item.incomeAmount > 0 && (
                <span className={styles["income"]}>
                  ¥{item.incomeAmount.toLocaleString()}
                </span>
              )}
              {item.expenseAmount > 0 && (
                <span className={styles["expense"]}>
                  ¥{item.expenseAmount.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;