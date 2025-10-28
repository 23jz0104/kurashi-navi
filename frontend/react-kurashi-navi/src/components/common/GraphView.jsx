import { Doughnut } from "react-chartjs-2";
import { Chart as Chartjs, ArcElement, Tooltip, Legend } from "chart.js";
import styles from "./GraphView.module.css";
import { useCategories } from "../hooks/useCategories";
import { useEffect, useRef } from "react";

Chartjs.register(ArcElement, Tooltip, Legend);

const GraphView = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    // コンポーネントがマウントされた時にチャートをリセット
    if (chartRef.current) {
      chartRef.current.reset();
      chartRef.current.update();
    }
  }, [data]);

  const { getCategoryById } = useCategories();

  const calculateCategoryTotals = (entries) => {
    if(!entries || entries.length === 0) {
      return [];
    }

    const totals = {};

    entries.forEach(entry => {
      entry.items.forEach(item => {
        const { categoryId, price, quantity } = item;
        const total = price * quantity;

        if (!totals[categoryId]) {
          totals[categoryId] = 0;
        }
        totals[categoryId] += total;
      });
    });

    return Object.entries(totals).map(([categoryId, total]) => {
      const category = getCategoryById(Number(categoryId));

      if (!category) {
        return {
          categoryId: Number(categoryId),
          categoryName: "...",
          icon: null,
          color: "#ccc",
          total: total
        };
      }

      return {
        categoryId: category.id,
        categoryName: category.name,
        icon: category.icon,
        color: category.color,
        total: total
      };
    });
  };

  const categoryTotals = calculateCategoryTotals(data);

  const chartData = {
    labels: categoryTotals.map(cat => cat.categoryName),
    datasets: [{
      label: "合計金額",
      data: categoryTotals.map(cat => cat.total),
      backgroundColor: categoryTotals.map(cat => cat.color),
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
            const sum = context.chart._metasets[context.datasetIndex].total;
            const percent = ((value / sum) * 100).toFixed(1);
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
      {data && data.length > 0 ? ( //データが存在する場合はグラフを表示
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