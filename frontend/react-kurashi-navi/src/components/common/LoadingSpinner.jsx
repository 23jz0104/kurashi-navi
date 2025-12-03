import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = () => {
  return (
    <div className={styles['loading-container']}>
      <div className={styles['loading-content']}>
        <div className={styles['spinner-ring']}></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;