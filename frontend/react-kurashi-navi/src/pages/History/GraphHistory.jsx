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

  // グラフデータ
  const data = {
    labels: ["支出", "収入", "収支"],
    datasets: [
      {
        label: "収支割合",
        data: [30000, 50000, 20000],
        backgroundColor: ["#F87171", "#60A5FA", "#FBBF24"],
        borderWidth: 0,
      },
    ],
  };

	const secondData = {
		labels: [""]
	}

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
