import React, { useState, useRef, useEffect } from 'react';
import styles from "./DropdownModal.module.css";

const DropdownModal = ( { title = "タイトル", children = "要素"}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 外側をクリックしたら閉じる
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      const isOutSide = dropdownRef.current && !dropdownRef.current.contains(target);
      const isCloseButton = target.closest("[data-close='true']");

      if(isOutSide) {
        setIsOpen(false);
      } else if(isCloseButton) {
        setTimeout(() => setIsOpen(false), 0);
      }
    };

    if(isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const closeModal = () => {
    setIsOpen(false);
  }

  return (
    <div className={styles["dropdown-container"]} ref={dropdownRef}>
      <button className={styles["dropdown-button"]} onClick={handleToggle}>
        {title}
      </button>
        
      <div className={`${styles["dropdown-menu"]} ${isOpen ? styles["open"] : ""}`}>
        {typeof children === 'function' ? children(closeModal) : children}
      </div>
    </div>
  );
};

export default DropdownModal;