import { useState } from "react";
import styles from "../../styles/History/GraphHistory.module.css"
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import MonthPicker from "../../components/common/MonthPicker";
import { ChartPie, CalendarDays, Utensils, TrainFront, Volleyball, ShoppingBag, CircleHelp } from "lucide-react";
import GraphView from "../../components/common/GraphView";
import CalendarView from "../../components/common/CalendarView";

const GraphHistory = () => {
  const [activeTab, setActiveTab] = useState("graph");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date;
  });

  const tabs = [
    { id: "graph", label: "グラフ", icon: <ChartPie size={20} /> },
    { id: "calendar", label: "カレンダー", icon: <CalendarDays size={20} /> },
  ];

  const handleTabChange = (tabId) => {
    if(tabId === activeTab) return;
    setActiveTab(tabId);
  };

  const handleMonthChange = (newMonth) => {
    setSelectedMonth(newMonth);
  };

  const expenseReceiptData = [
    {date:"2025-06-03",items:[{categoryId:1,productName:"おにぎり 昆布",price:120,quantity:2},{categoryId:1,productName:"緑茶 600ml",price:110,quantity:1},{categoryId:3,productName:"漫画雑誌",price:300,quantity:1}]},
    {date:"2025-06-09",items:[{categoryId:2,productName:"ティッシュペーパー 5箱",price:320,quantity:1},{categoryId:2,productName:"洗剤 詰替",price:280,quantity:1}]},
    {date:"2025-06-14",items:[{categoryId:1,productName:"食パン 6枚切り",price:148,quantity:1},{categoryId:1,productName:"卵 10個入り",price:228,quantity:1},{categoryId:4,productName:"バス運賃",price:210,quantity:1}]},
    {date:"2025-06-23",items:[{categoryId:3,productName:"イヤホン",price:1580,quantity:1},{categoryId:2,productName:"メモ帳",price:120,quantity:2}]},
    {date:"2025-06-30",items:[{categoryId:5,productName:"宅配便送料",price:700,quantity:1},{categoryId:1,productName:"缶コーヒー",price:130,quantity:1}]},

    {date:"2025-07-02",items:[{categoryId:1,productName:"冷やし中華",price:398,quantity:1},{categoryId:1,productName:"麦茶 2L",price:180,quantity:1}]},
    {date:"2025-07-08",items:[{categoryId:2,productName:"シャンプー 詰替",price:458,quantity:1},{categoryId:2,productName:"トイレットペーパー",price:398,quantity:1}]},
    {date:"2025-07-15",items:[{categoryId:3,productName:"USBケーブル 1m",price:980,quantity:1},{categoryId:3,productName:"SDカード 64GB",price:1580,quantity:1}]},
    {date:"2025-07-21",items:[{categoryId:4,productName:"電車運賃",price:220,quantity:1},{categoryId:1,productName:"アイスコーヒー",price:150,quantity:1}]},
    {date:"2025-07-29",items:[{categoryId:5,productName:"郵便切手",price:84,quantity:5}]},

    {date:"2025-08-03",items:[{categoryId:1,productName:"お弁当 唐揚げ",price:498,quantity:1},{categoryId:1,productName:"ミネラルウォーター",price:108,quantity:1}]},
    {date:"2025-08-10",items:[{categoryId:2,productName:"歯磨き粉",price:248,quantity:1},{categoryId:2,productName:"タオル",price:398,quantity:2}]},
    {date:"2025-08-16",items:[{categoryId:3,productName:"小説",price:900,quantity:1},{categoryId:3,productName:"漫画単行本",price:480,quantity:2}]},
    {date:"2025-08-22",items:[{categoryId:1,productName:"レトルトカレー",price:250,quantity:3},{categoryId:1,productName:"ごはんパック",price:150,quantity:3}]},
    {date:"2025-08-30",items:[{categoryId:5,productName:"宅配便送料",price:850,quantity:1}]},

    {date:"2025-09-04",items:[{categoryId:1,productName:"弁当 幕の内",price:520,quantity:1},{categoryId:1,productName:"お茶 500ml",price:110,quantity:1}]},
    {date:"2025-09-09",items:[{categoryId:2,productName:"洗濯洗剤",price:398,quantity:1},{categoryId:2,productName:"柔軟剤",price:350,quantity:1}]},
    {date:"2025-09-15",items:[{categoryId:3,productName:"ボールペン 3色",price:300,quantity:1},{categoryId:3,productName:"ノート A5",price:180,quantity:2}]},
    {date:"2025-09-21",items:[{categoryId:4,productName:"電車運賃",price:230,quantity:1},{categoryId:1,productName:"缶コーヒー",price:120,quantity:1}]},
    {date:"2025-09-27",items:[{categoryId:5,productName:"配送料",price:700,quantity:1}]},

    {date:"2025-10-03",items:[{categoryId:1,productName:"おにぎり ツナマヨ",price:128,quantity:2},{categoryId:1,productName:"お茶 500ml",price:108,quantity:1},{categoryId:1,productName:"サラダチキン",price:238,quantity:1}]},
    {date:"2025-10-11",items:[{categoryId:1,productName:"牛乳 1L",price:198,quantity:1},{categoryId:1,productName:"食パン 6枚切り",price:148,quantity:1},{categoryId:1,productName:"卵 10個入り",price:228,quantity:1},{categoryId:2,productName:"トイレットペーパー 12ロール",price:398,quantity:1}]},
    {date:"2025-10-22",items:[{categoryId:2,productName:"シャンプー 詰替",price:458,quantity:1},{categoryId:2,productName:"歯ブラシ",price:158,quantity:3},{categoryId:2,productName:"ティッシュボックス 5箱",price:298,quantity:1}]},
    {date:"2025-10-27",items:[{categoryId:4,productName:"電車運賃",price:220,quantity:1},{categoryId:1,productName:"缶コーヒー",price:120,quantity:1}]},
    {date:"2025-10-30",items:[{categoryId:1,productName:"弁当 幕の内",price:498,quantity:1},{categoryId:1,productName:"野菜ジュース",price:138,quantity:1},{categoryId:5,productName:"宅配便送料",price:800,quantity:1}]},

    {date:"2025-11-05",items:[{categoryId:1,productName:"サンドイッチ",price:320,quantity:1},{categoryId:1,productName:"ホットコーヒーM",price:150,quantity:1}]},
    {date:"2025-11-12",items:[{categoryId:2,productName:"洗顔フォーム",price:450,quantity:1},{categoryId:2,productName:"化粧水",price:780,quantity:1}]},
    {date:"2025-11-18",items:[{categoryId:3,productName:"USBメモリ 32GB",price:1200,quantity:1},{categoryId:3,productName:"マウスパッド",price:500,quantity:1}]},
    {date:"2025-11-25",items:[{categoryId:4,productName:"バス定期券",price:4500,quantity:1}]},
    {date:"2025-11-30",items:[{categoryId:5,productName:"宅配便送料",price:750,quantity:1}]},

    {date:"2025-12-03",items:[{categoryId:1,productName:"おでんセット",price:420,quantity:1},{categoryId:1,productName:"ホットお茶",price:130,quantity:1}]},
    {date:"2025-12-10",items:[{categoryId:2,productName:"トイレットペーパー 12ロール",price:398,quantity:1},{categoryId:2,productName:"シャンプー 詰替",price:458,quantity:1}]},
    {date:"2025-12-15",items:[{categoryId:3,productName:"ノートPC用マウス",price:2480,quantity:1},{categoryId:3,productName:"USBハブ",price:980,quantity:1}]},
    {date:"2025-12-22",items:[{categoryId:4,productName:"電車運賃",price:220,quantity:1},{categoryId:1,productName:"缶コーヒー",price:120,quantity:1}]},
    {date:"2025-12-29",items:[{categoryId:5,productName:"宅配便送料",price:900,quantity:1}]}
    ];

  //他でも使うから多分コンポーネントにする
  const CATEGORIES = {
    1: { id: 1, name: "飲食物", icon: <Utensils size={16} />, color: "#FF6B6B" },
    2: { id: 2, name: "日用品", icon: <ShoppingBag size={16} />, color: "#51CF66" },
    3: { id: 3, name: "趣味・娯楽", icon: <Volleyball size={16} />, color: "#FFD43B" },
    4: { id: 4, name: "交通費", icon: <TrainFront size={16} />, color: "#9775FA" },
    5: { id: 5, name: "その他", icon: <CircleHelp size={16} />, color: "#868E96" }
  };

  const filterReceiptByMonth = (receipts, targetMonth) => {
    const targetYear = targetMonth.getFullYear();
    const targetMonthIndex = targetMonth.getMonth();

    return receipts.filter((receipt) => {
      //対象のレシートデータから日付を取得
      const receiptDate = new Date(receipt.date);
      //集計対象のデータの年と月が一致したら、そのデータを返す
      return (
        receiptDate.getFullYear() === targetYear &&
        receiptDate.getMonth() === targetMonthIndex
      );
    });
  };

  const filteredReceiptData = filterReceiptByMonth(expenseReceiptData, selectedMonth);

  const calculateCategoryTotals = (receipts) => {
    if(!receipts || receipts.length === 0) {
      return [];
    }

    const totals = {};

    receipts.forEach((receipt) => {
      receipt.items.forEach((item) => {
        const {categoryId, price, quantity} = item;
        const total = price * quantity;
        if(!totals[categoryId]) totals[categoryId] = 0;
        totals[categoryId] += total;
      });
    });

    return Object.entries(totals).map(([categoryId, total]) => {
      const category = CATEGORIES[categoryId] || CATEGORIES[5];
      return {
        categoryId: category.id,
        categoryName: category.name,
        icon: category.icon,
        color: category.color,
        total,
      };
    });
  };

  const categoryTotals = calculateCategoryTotals(filteredReceiptData);
  const totalExpense = categoryTotals.reduce((sum, cat) => sum + cat.total, 0);
  const totalIncome = 0;

  const tabContent = {
    graph: <GraphView recipetData={filteredReceiptData} />,
    calendar: <CalendarView receiptData={filteredReceiptData} currentMonth={selectedMonth}/>
  };

  return (
    <Layout
      headerContent={
        <TabButton
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      }
      mainContent={
        <div className={styles["main-container"]}>
          {/* カレンダー */}
          <MonthPicker onMonthChange={handleMonthChange}/>

          {/* サマリー */}
          <div className={styles["finance-summry"]}>
            <div className={`${styles["finance-item"]} ${styles["expense"]}`}>
              <span className={styles["label"]}>支出</span>
              <span className={styles["value"]}>¥{totalExpense.toLocaleString()}</span>
            </div>
            <div className={`${styles["finance-item"]} ${styles["income"]}`}>
              <span className={styles["label"]}>収入</span>
              <span className={styles["value"]}>¥{totalIncome.toLocaleString()}</span>
            </div>
            <div className={`${styles["finance-item"]} ${styles["balance"]}`}>
              <span className={styles["label"]}>収支</span>
              <span className={styles["value"]}>¥{(totalIncome - totalExpense).toLocaleString()}</span>
            </div>
          </div>

          {/* 選択中のタブに応じてグラフとカレンダーを切り替える */}
          <div className={styles["graph-container"]}>
            {tabContent[activeTab]}
          </div>

          {/* 詳細をカラムで表示 */}
          <div className={styles["detail"]}>
            {categoryTotals.map((category) => (
              <div key={category.categoryId} className={styles["flex"]}>
                <span className={styles["category-icon"]} style={{ backgroundColor: category.color }}>
                  {category.icon}
                </span>
                <span className={styles["category-name"]}>{category.categoryName}</span>
                <span className={styles["category-price"]}>¥{category.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
};

export default GraphHistory;