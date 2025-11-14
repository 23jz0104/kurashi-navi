import { Doughnut } from "react-chartjs-2";
import { Chart as Chartjs, ArcElement, Tooltip, Legend } from "chart.js";
import styles from "./GraphView.module.css";
import { useCategories } from "../../hooks/common/useCategories";
import { useEffect, useRef } from "react";

Chartjs.register(ArcElement, Tooltip, Legend);

const GraphView = ({ summary }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // コンポーネントがマウントされた時にチャートをリセット
    if (chartRef.current) {
      chartRef.current.reset();
      chartRef.current.update();
    }
  }, [summary]);

  const chartData = {
    labels: summary.map((item) => item.category_name),
    datasets: [{
      label: "合計金額",
      data: summary.map((item) => Number(item.total)),
      backgroundColor: [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
      ],
      borderWidth: 0,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "45%",
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#222",
        titleColor: "#fff",
        bodyColor: "#fff",
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.parsed;
            const total = context.chart._metasets[context.datasetIndex].total;
            const percent = ((value / total) * 100).toFixed(1);
            return `${label}: ${value}円 (${percent}%)`;
          },
        },
      },
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1200,
      easing: "easeOutQuart",
    },
  };

  const segmentLabelPlugin = {
    id: "segmentLabels",
    afterDatasetsDraw: (chart) => {
      const { ctx } = chart;
      const meta = chart.getDatasetMeta(0);
      const labels = chart.data.labels;

      ctx.save();
      ctx.font = "400 0.75rem 'Noto Sans JP', sans-serif";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      meta.data.forEach((element, index) => {
        const { x, y } = element.tooltipPosition();
        const label = labels[index];
        ctx.fillText(label, x, y);
      });

      ctx.restore();
    },
  };
  
  return (
    <>
      {summary && summary.length > 0 ? ( //データが存在する場合はグラフを表示
        <Doughnut
          ref={chartRef}
          data={chartData}
          options={options}
          plugins={[segmentLabelPlugin]}
        />
      ) : (
        <div className={styles["empty-state"]}>
          <p>データが存在しません。</p>
        </div>
      )} 
    </>
  );
}

export default GraphView;