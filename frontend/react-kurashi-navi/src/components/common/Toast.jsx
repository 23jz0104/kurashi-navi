import React, { useEffect } from "react";
import styles from "./Toast.module.css";
import { Check } from 'lucide-react';

const Toast = ({ message = "テスト", isVisible, onClose}) => {
  useEffect(() => {
    if(isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);


  return(
    <div className={` ${styles["toast-container"]} ${isVisible ? styles["show"] : ""} `}>
      <div className={styles["toast"]}>
        <div className={styles["icon-container"]}>
          <Check size={24} className={styles["icon"]}/>
        </div>
        <p className={styles["message"]}>{message}</p>
      </div>
    </div>
  )
};

export default Toast;