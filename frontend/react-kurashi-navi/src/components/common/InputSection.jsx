import React from "react";
import styles from "./InputSection.module.css";

const InputSection = ({ fields = { label: "ラベル", contents: <input type="text" placeholder="テキスト"/>} }) => {

  const fieldArray = Array.isArray(fields) ? fields : [fields];

  return (
    <div className={styles["input-section"]}>
      {fieldArray.map((field, index) => (
        <div key={index} className={styles["input-group"]}>
          <label className={styles["input-label"]}>
            {field.label || "ラベル"}
          </label>
          {field.contents || <input type="text" placeholder="テキスト"/>}
        </div>
      ))}
    </div>
  )
}

export default InputSection;