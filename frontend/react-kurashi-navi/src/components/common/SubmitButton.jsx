import React from "react";
import styles from "./SubmitButton.module.css";

const SubmitButton = ({ text, onClick }) => {
  return (
    <button
      type="button"
      className={styles["submit-button"]}
      onClick={onClick}
    >
      {text || "送信"}
    </button>
  )
}

export default SubmitButton;