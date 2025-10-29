import styles from "./CalendarView.module.css";

const CalendarView = ({ expenseReceiptData = [], incomeData = [], currentMonth }) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  if (expenseReceiptData.length === 0 && incomeData.length === 0) {
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

  // 支出データマップ
  const expenseMap = expenseReceiptData.reduce((acc, expense) => {
    const totalAmount = expense.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    acc[expense.date] = (acc[expense.date] || 0) + totalAmount;
    return acc;
  }, {});

  // 収入データマップ
  const incomeMap = incomeData.reduce((acc, income) => {
    const totalAmount = income.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    acc[income.date] = (acc[income.date] || 0) + totalAmount;
    return acc;
  }, {});

  const calendarDays = days.map((day) => {
    if (day.isCurrentMonth) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day.days
      ).padStart(2, "0")}`;
      return {
        ...day,
        expenseAmount: expenseMap[dateStr] || 0,
        incomeAmount: incomeMap[dateStr] || 0,
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