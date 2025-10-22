import { useState } from "react";
import styles from "../../styles/History/GraphHistory.module.css"
import Layout from "../../components/common/Layout";
import TabButton from "../../components/common/TabButton";
import MonthPicker from "../../components/common/MonthPicker";
import { ChartPie, CalendarDays, JapaneseYen } from 'lucide-react';
import { Doughnut } from "react-chartjs-2";
import { Chart as Chartjs, ArcElement, Tooltip, Legend } from "chart.js";

const GraphHistory = () => {
  const [activeTab, setActiveTab] = useState("graph");

  // Chart.js 要素の登録
  Chartjs.register(ArcElement, Tooltip, Legend);

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

  // カテゴリマッピング
  const categoryMap = {
    1: "飲食物",
    2: "日用品",
    3: "趣味・娯楽",
    4: "交通費",
    5: "その他"
  };

  // カテゴリごとの色設定
  const categoryColors = {
    1: "#F2A9A9", // 飲食物
    2: "#00B16B", // 日用品
    3: "#FFEF6C", // 趣味・娯楽
    4: "#8A77B7", // 交通費"
    5: "#A0A0A0"  // その他
  };

  //レシートのカテゴリごとの合計金額を求める関数
  const calculateCategoryTotals = (recpiet) => {
    const totals = {};

    recpiet.forEach(reciept => {
      reciept.forEach(item => {
        const { categoryId, price, quantity} = item;
        const total = price * quantity;

        if(!totals[categoryId]) {
          totals[categoryId] = 0;
        }
        totals[categoryId] += total;
      });
    });

    return totals;
  };

  const categoryTotals = calculateCategoryTotals(expenseReceiptData);

  //レシートデータをグラフ用に変換
  const data = {
    labels: Object.keys(categoryTotals).map(id => categoryMap[id]),
    datasets: [
      {
        label: "合計金額",
        data: Object.values(categoryTotals),
        backgroundColor: Object.keys(categoryTotals).map(id => categoryColors[id]),
        borderWidth: 0,
      },
    ],
  };

  const totalExpense = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

  // グラフオプション
  const options = {
    responsive: true,
		maintainAspectRatio: false, // <- 親要素に合わせるかどうか true: 合わせない : false: 合わせる
    cutout: "45%",//　<- ここの数値を使って中のくりぬき度を調整できる
    plugins: {
      legend: {
        display: false, // ← 凡例を非表示
      },
      tooltip: {
        backgroundColor: "#222",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.parsed;
            const sum = context.chart._metasets[context.datasetIndex].total;
            const percent = ((value / sum) * 100).toFixed(1);
            return `${label}: ${value}円 (${percent}%)`;
          },
        },
      },
    },
    animation: {
      animateScale: true,
      duration: 1000,
      easing: "easeOutCubic",
    },
  };

  // 🍩 セグメントごとにラベルを描画するプラグイン
	const segmentLabelPlugin = {
		id: "segmentLabels",
		afterDatasetsDraw: (chart) => {
			const { ctx, chartArea: { width, height } } = chart;
			const meta = chart.getDatasetMeta(0);
			const dataset = chart.data.datasets[0];
			const labels = chart.data.labels;

			ctx.save();
			ctx.font = "bold 12px 'Noto Sans JP', sans-serif";
			ctx.fillStyle = "#fff"; // ← テキスト色（セグメントの上に表示）
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			meta.data.forEach((element, index) => {
				// 各セグメントの中央座標
				const { x, y } = element.tooltipPosition();
				const label = labels[index];

				// 💡 背景の色に応じて文字色を動的に変えることも可能
				// ctx.fillStyle = dataset.backgroundColor[index] === "#F87171" ? "#fff" : "#333";

				ctx.fillText(label, x, y);
			});

			ctx.restore();
		},
	};


  const tabs = [
    { id: "graph", label: "グラフ", icon: <ChartPie size={20} /> },
    { id: "calendar", label: "カレンダー", icon: <CalendarDays size={20} /> },
  ];

  const handleTabChange = (tab) => {
    setActiveTab(tab);
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
        <div>
					{/* カレンダー */}
          <MonthPicker />

					{/* サマリー */}
          <div className={styles["finance-summry"]}>
            <div className={`${styles["finance-item"]} ${styles["expense"]}`}>
              <span className={styles["label"]}>支出</span>
              <span className={styles["value"]}>¥500</span>
            </div>
            <div className={`${styles["finance-item"]} ${styles["income"]}`}>
              <span className={styles["label"]}>収入</span>
              <span className={styles["value"]}>¥1000</span>
            </div>
            <div className={`${styles["finance-item"]} ${styles["balance"]}`}>
							<span className={styles["label"]}>収支</span>
							<span className={styles["value"]}>¥500</span>
            </div>
          </div>

					{/* グラフ */}
          <div className={styles["graph-container"]}>
						<Doughnut
							data={data}
							options={options}
							plugins={[segmentLabelPlugin]}
						/>
          </div>

					{/* 詳細をカラムで表示 */}
					<div className={styles["detail"]}>
						<div className={styles["flex"]}>
							<div>1/1</div>
							<div>商品</div>
							<div>金額</div>
						</div>
						<div className={styles["flex"]}>
							<div>1/1</div>
							<div>商品</div>
							<div>金額</div>
						</div>
						<div className={styles["flex"]}>
							<div>1/1</div>
							<div>商品</div>
							<div>金額</div>
						</div>
						<div className={styles["flex"]}>
							<div>1/1</div>
							<div>商品</div>
							<div>金額</div>
						</div>
					</div>
        </div>
      }
    />
  );
};

export default GraphHistory;
