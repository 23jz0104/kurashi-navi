import React from "react";
import styles from "./SubmitButton.module.css";

const SubmitButton = ({ text }) => {
  return (
    <button
      type="button"
      className={styles["submit-button"]}
    >
      {text || "送信"}
    </button>
  )
}

export default SubmitButton;