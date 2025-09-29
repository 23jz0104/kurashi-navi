// Buttonコンポーネントをインポート
import Button from './Button';

// Storybookの設定(デフォルトエクスポート必須)
export default {
  title: 'Components/Button',  // Storybookのサイドバーに表示される名前
  component: Button,            // 対象のコンポーネント
};

// Primaryストーリー(named export)
export const Primary = {
  args: {                       // コンポーネントに渡すprops
    label: 'Primary Button',    // labelプロップ
    variant: 'primary',         // variantプロップ
  },
};

// Secondaryストーリー
export const Secondary = {
  args: {
    label: 'Secondary Button',
    variant: 'secondary',
  },
};