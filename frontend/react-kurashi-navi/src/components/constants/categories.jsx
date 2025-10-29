import {
  // --- 支出カテゴリのアイコン ---
  Utensils,     // 食費
  TrainFront,   // 交通費
  Lightbulb,    // 光熱費
  Volleyball,   // 趣味・娯楽
  ShoppingBag,  // 日用品
  TicketCheck,  // 割引
  CircleHelp,   // その他

  // --- 収入カテゴリのアイコン ---
  Wallet,       // 給与 
  Gift,         // 賞与 
  Laptop,       // 副業 
  DollarSign,   // その他 
} from "lucide-react";

/**
 * アイコン名（文字列）と、実際のReactコンポーネントを紐付ける対応表
 */
const ICON_MAP = {
  // 支出
  Utensils: <Utensils size={16} />,
  TrainFront: <TrainFront size={16} />,
  Lightbulb: <Lightbulb size={16} />,
  Volleyball: <Volleyball size={16} />,
  ShoppingBag: <ShoppingBag size={16} />,
  TicketCheck: <TicketCheck size={16} />,
  CircleHelp: <CircleHelp size={16} />,
  
  // 収入
  Wallet: <Wallet size={16} />,
  Gift: <Gift size={16} />,
  Laptop: <Laptop size={16} />,
  DollarSign: <DollarSign size={16} />,

  // デフォルト
  Default: <CircleHelp size={16} />,
};

/* アイコンの名前に応じてマッピングされたアイコンを返す関数 */
export const getIconComponent = (iconName) => {
  return ICON_MAP[iconName] || ICON_MAP.Default;
};