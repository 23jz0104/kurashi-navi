import { Utensils, TrainFront, Volleyball, ShoppingBag, CircleHelp } from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import { Chart as Chartjs, ArcElement, Tooltip, Legend } from "chart.js";

Chartjs.register(ArcElement, Tooltip, Legend);

const GraphView = ({ recipetData }) => {  // ← { } で囲む

  //デバッグ用
  const dummyData = [
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

  recipetData = recipetData || dummyData

  const CATEGORIES = {
    1: { id: 1, name: "飲食物", icon: <Utensils size={16} />, color: "#FF6B6B" },
    2: { id: 2, name: "日用品", icon: <ShoppingBag size={16} />, color: "#51CF66" },
    3: { id: 3, name: "趣味・娯楽", icon: <Volleyball size={16} />, color: "#FFD43B" },
    4: { id: 4, name: "交通費", icon: <TrainFront size={16} />, color: "#9775FA" },
    5: { id: 5, name: "その他", icon: <CircleHelp size={16} />, color: "#868E96" }
  };

  const DEFAULT_CATEGORY = {
    id: 99,
    name: "未分類",
    icon: <CircleHelp size={16} />,
    color: "#ADB5BD"
  };

  const getCategory = (categoryId) => {
    return CATEGORIES[categoryId] || DEFAULT_CATEGORY;
  };

  const calculateCategoryTotals = (receipts) => {
    if(!receipts || receipts.length === 0) {
      return [];
    }

    const totals = {};

    receipts.forEach(receipt => {
      receipt.items.forEach(item => {
        const { categoryId, price, quantity } = item;
        const total = price * quantity;

        if (!totals[categoryId]) {
          totals[categoryId] = 0;
        }
        totals[categoryId] += total;
      });
    });

    return Object.entries(totals).map(([categoryId, total]) => {
      const category = getCategory(Number(categoryId));
      return {
        categoryId: category.id,
        categoryName: category.name,
        icon: category.icon,
        color: category.color,
        total: total
      };
    });
  };

  const categoryTotals = calculateCategoryTotals(recipetData);

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
    <Doughnut
      data={chartData}
      options={options}
      plugins={[segmentLabelPlugin]}
    />
  );
}

export default GraphView;