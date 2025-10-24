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

  const tabs = [
    { id: "graph", label: "グラフ", icon: <ChartPie size={20} /> },
    { id: "calendar", label: "カレンダー", icon: <CalendarDays size={20} /> },
  ];

  const handleTabChange = (tabId) => {
    if(tabId === activeTab) return;
    setActiveTab(tabId);
  };

  const expenseReceiptData = [
    [{categoryId: 1, productName: "おにぎり ツナマヨ", price: 128, quantity: 2}, {categoryId: 1, productName: "お茶 500ml", price: 108, quantity: 1}, {categoryId: 1, productName: "サラダチキン", price: 238, quantity: 1}],
    [{categoryId: 1, productName: "牛乳 1L", price: 198, quantity: 1}, {categoryId: 1, productName: "食パン 6枚切り", price: 148, quantity: 1}, {categoryId: 1, productName: "卵 10個入り", price: 228, quantity: 1}, {categoryId: 2, productName: "トイレットペーパー 12ロール", price: 398, quantity: 1}],
    [{categoryId: 2, productName: "シャンプー 詰替", price: 458, quantity: 1}, {categoryId: 2, productName: "歯ブラシ", price: 158, quantity: 3}, {categoryId: 2, productName: "ティッシュボックス 5箱", price: 298, quantity: 1}],
    [{categoryId: 1, productName: "カフェラテ", price: 150, quantity: 1}, {categoryId: 1, productName: "チョコレート", price: 118, quantity: 2}, {categoryId: 3, productName: "週刊少年ジャンプ", price: 290, quantity: 1}],
    [{categoryId: 1, productName: "豚バラ肉 300g", price: 498, quantity: 1}, {categoryId: 1, productName: "キャベツ 1玉", price: 178, quantity: 1}, {categoryId: 1, productName: "にんじん", price: 58, quantity: 3}, {categoryId: 1, productName: "玉ねぎ", price: 48, quantity: 4}],
    [{categoryId: 1, productName: "ホットコーヒーL", price: 150, quantity: 1}, {categoryId: 1, productName: "サンドイッチ", price: 298, quantity: 1}, {categoryId: 2, productName: "ウェットティッシュ", price: 108, quantity: 1}],
    [{categoryId: 2, productName: "ボールペン 3色", price: 328, quantity: 1}, {categoryId: 2, productName: "ノート A5", price: 198, quantity: 2}, {categoryId: 3, productName: "スケッチブック", price: 548, quantity: 1}],
    [{categoryId: 3, productName: "USB充電ケーブル 1m", price: 980, quantity: 1}, {categoryId: 3, productName: "SDカード 64GB", price: 1580, quantity: 1}, {categoryId: 2, productName: "乾電池 単3 4本", price: 398, quantity: 1}],
    [{categoryId: 4, productName: "電車運賃", price: 220, quantity: 1}, {categoryId: 1, productName: "缶コーヒー", price: 120, quantity: 1}],
    [{categoryId: 1, productName: "弁当 幕の内", price: 498, quantity: 1}, {categoryId: 1, productName: "野菜ジュース", price: 138, quantity: 1}, {categoryId: 5, productName: "宅配便送料", price: 800, quantity: 1}]
  ];

  //他でも使うから多分コンポーネントにする
  const CATEGORIES = {
    1: { id: 1, name: "飲食物", icon: <Utensils size={16} />, color: "#FF6B6B" },
    2: { id: 2, name: "日用品", icon: <ShoppingBag size={16} />, color: "#51CF66" },
    3: { id: 3, name: "趣味・娯楽", icon: <Volleyball size={16} />, color: "#FFD43B" },
    4: { id: 4, name: "交通費", icon: <TrainFront size={16} />, color: "#9775FA" },
    5: { id: 5, name: "その他", icon: <CircleHelp size={16} />, color: "#868E96" }
  };

  const calculateCategoryTotals = (recipets) => {
    const totals = {};

    recipets.forEach((reciept) => {
      reciept.forEach((item) => {
        const {categoryId, price, quantity} = item;
        const total = price * quantity;
        if(!totals[categoryId]) totals[categoryId] = 0;
        totals[categoryId] += total;
      });
    });

    return Object.entries(totals).map(([categoryId, total]) => {
      const category = CATEGORIES[categoryId] || DEFAULT_CATEGORY;
      return {
        categoryId: category.id,
        categoryName: category.name,
        icon: category.icon,
        color: category.color,
        total,
      };
    });
  };

  const categoryTotals = calculateCategoryTotals(expenseReceiptData);
  const totalExpense = categoryTotals.reduce((sum, cat) => sum + cat.total, 0);
  const totalIncome = 0;

  const tabContent = {
    graph: <GraphView recipetData={expenseReceiptData} />,
    calendar: <CalendarView />
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
          <MonthPicker />

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