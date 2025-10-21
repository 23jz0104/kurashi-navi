import React from "react";
import styles from "./Loader.module.css";

const Loader = ({ text = "読み込み中"}) => {
  return (
    <div className={styles["loader-container"]}>
      <div className={styles["loader-wrapper"]}>
        <div className={styles["loader-dots"]}>
          <span className={styles["dot"]}></span>
          <span className={styles["dot"]}></span>
          <span className={styles["dot"]}></span>
        </div>
        <div className={styles["loader-pulse"]}></div>
      </div>

      <p className={styles["loader-text"]}>
        {text}
        <span className={styles["dots-animation"]}>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>
    </div>
  );
};

export default Loader;