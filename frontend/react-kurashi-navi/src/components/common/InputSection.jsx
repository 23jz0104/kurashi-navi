import React from "react";
import styles from "./InputSection.module.css";

const InputSection = ({contents}) => {
  return (
    <div className={styles["input-section"]}>
      <label className={styles["input-label"]}>
        {contents}
      </label>
    </div>
  )
}

export default InputSection;