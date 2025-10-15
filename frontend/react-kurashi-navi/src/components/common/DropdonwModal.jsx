import React, { useState, useRef, useEffect } from 'react';
import styles from "./DropdownModal.module.css";

const DropdownModal = ( { title = "タイトル", children = "要素"}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 外側をクリックしたら閉じる
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles["dropdown-container"]} ref={dropdownRef}>
      <button className={styles["dropdown-button"]} onClick={handleToggle}>
        {title}
      </button>
        
      {isOpen && (
        <div className={styles["dropdown-menu"]}>
          {children}
        </div>
      )}
    </div>
  );
};

export default DropdownModal;