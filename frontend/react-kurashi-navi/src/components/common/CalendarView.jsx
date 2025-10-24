import styles from "./CalendarView.module.css";

const CalendarView = ({receiptData, currentMonth}) => {

  const expenseReceiptData = [
    { date: "2025-10-03", items: [{ categoryId: 1, productName: "おにぎり ツナマヨ", price: 128, quantity: 2 }, { categoryId: 1, productName: "お茶 500ml", price: 108, quantity: 1 }, { categoryId: 1, productName: "サラダチキン", price: 238, quantity: 1 }] },
    { date: "2025-10-11", items: [{ categoryId: 1, productName: "牛乳 1L", price: 198, quantity: 1 }, { categoryId: 1, productName: "食パン 6枚切り", price: 148, quantity: 1 }, { categoryId: 1, productName: "卵 10個入り", price: 228, quantity: 1 }, { categoryId: 2, productName: "トイレットペーパー 12ロール", price: 398, quantity: 1 }] },
    { date: "2025-10-22", items: [{ categoryId: 2, productName: "シャンプー 詰替", price: 458, quantity: 1 }, { categoryId: 2, productName: "歯ブラシ", price: 158, quantity: 3 }, { categoryId: 2, productName: "ティッシュボックス 5箱", price: 298, quantity: 1 }] },
    { date: "2025-10-07", items: [{ categoryId: 1, productName: "カフェラテ", price: 150, quantity: 1 }, { categoryId: 1, productName: "チョコレート", price: 118, quantity: 2 }, { categoryId: 3, productName: "週刊少年ジャンプ", price: 290, quantity: 1 }] },
    { date: "2025-10-19", items: [{ categoryId: 1, productName: "豚バラ肉 300g", price: 498, quantity: 1 }, { categoryId: 1, productName: "キャベツ 1玉", price: 178, quantity: 1 }, { categoryId: 1, productName: "にんじん", price: 58, quantity: 3 }, { categoryId: 1, productName: "玉ねぎ", price: 48, quantity: 4 }] },
    { date: "2025-10-13", items: [{ categoryId: 1, productName: "ホットコーヒーL", price: 150, quantity: 1 }, { categoryId: 1, productName: "サンドイッチ", price: 298, quantity: 1 }, { categoryId: 2, productName: "ウェットティッシュ", price: 108, quantity: 1 }] },
    { date: "2025-10-25", items: [{ categoryId: 2, productName: "ボールペン 3色", price: 328, quantity: 1 }, { categoryId: 2, productName: "ノート A5", price: 198, quantity: 2 }, { categoryId: 3, productName: "スケッチブック", price: 548, quantity: 1 }] },
    { date: "2025-10-05", items: [{ categoryId: 3, productName: "USB充電ケーブル 1m", price: 980, quantity: 1 }, { categoryId: 3, productName: "SDカード 64GB", price: 1580, quantity: 1 }, { categoryId: 2, productName: "乾電池 単3 4本", price: 398, quantity: 1 }] },
    { date: "2025-10-27", items: [{ categoryId: 4, productName: "電車運賃", price: 220, quantity: 1 }, { categoryId: 1,productName: "缶コーヒー", price: 120, quantity: 1 }] },
    { date: "2025-10-30", items: [{ categoryId: 1, productName: "弁当 幕の内", price: 498, quantity: 1 }, { categoryId: 1, productName: "野菜ジュース", price: 138, quantity: 1 }, { categoryId: 5, productName: "宅配便送料", price: 800, quantity: 1 }] }
  ];

  receiptData = receiptData || expenseReceiptData;
  currentMonth = currentMonth || new Date();

  const today = currentMonth;

  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const prevLastDay = new Date(year, month, 0); // <-これで前月の最終日が取得できる

  const startDay = firstDay.getDay(); //月初の曜日
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
  if(nextDaysCount < 7) {
    for(let d = 1; d <= nextDaysCount; d++) {
      days.push({
        days: d,
        isCurrentMonth: false,
      })
    }
  }

  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  //日付ごとの合計金額を取得 ["yyyy-MM-dd"]の形でデータを取得できる
  const receiptMap = receiptData.reduce((acc, receipt) => {
    const totalAmount = receipt.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    acc[receipt.date] = totalAmount;
    return acc;
  }, {});

  const calendarDays = days.map((day) => {
    if(day.isCurrentMonth) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day.days).padStart(2, "0")}`;
      return {
        ...day,
        amount: receiptMap[dateStr] || 0
      };
    };
    return {...day, amount: 0};
  });

  return (
    <div className={styles["calendar-container"]}>
      <div className={styles["weekdays"]}>
        {weekdays.map((day) => (
          <span className={styles["calendar-cell"]} key={day}>{day}</span>
        ))}
      </div>

      <div className={styles["days"]}>
        {calendarDays.map((item, index) => (
          <div key={index} className={styles["calendar-cell"]}>
            <span className={styles["day"]}>{item.days}</span>
            {item.amount > 0 && <span className={styles["price"]}>¥{item.amount}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CalendarView;