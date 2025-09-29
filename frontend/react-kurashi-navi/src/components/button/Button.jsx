// CSS Modulesをインポート
import styles from './Button.module.css';

// Buttonコンポーネントの定義
function Button({ label, variant = 'primary' }) {
  // buttonタグを返す。classNameにスタイルを適用
  return (
    <button className={`${styles.button} ${styles[variant]}`}>
      {label}
    </button>
  );
}

// 他のファイルから使えるようにエクスポート
export default Button;