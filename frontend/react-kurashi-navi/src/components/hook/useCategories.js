//APIからカテゴリデータを取得する関数
const fetchCategories = async() => {
  const data = [
    // --- 支出カテゴリ ---
    { id: 1, name: "食費", color: "#FF6B6B", iconName: "Utensils", type: "expense" },
    { id: 2, name: "日用品", color: "#51CF66", iconName: "ShoppingBag", type: "expense" },
    { id: 3, name: "趣味・娯楽", color: "#FFD43B", iconName: "Volleyball", type: "expense" },
    { id: 4, name: "交通費", color: "#9775FA", iconName: "TrainFront", type: "expense" },
    { id: 5, name: "光熱費", color: "#FFEF6C", iconName: "Lightbulb", type: "expense" },

    // (割引カテゴリは、支出のマイナスとして扱う例)
    { id: 6, name: "割引", color: "#A9D0F2", iconName: "TicketCheck", type: "expense" },

    { id: 99, name: "その他", color: "#868E96", iconName: "CircleHelp", type: "expense" },

    // --- 収入カテゴリ ---
    { id: 101, name: "給与", color: "#4C6EF5", iconName: "Wallet", type: "income" },
    { id: 102, name: "賞与", color: "#228BE6", iconName: "Gift", type: "income" },
    { id: 103, name: "副業", color: "#15AABF", iconName: "Laptop", type: "income" },
    { id: 199, name: "その他", color: "#12B886", iconName: "DollarSign", type: "income" },
  ];

  return data;
};