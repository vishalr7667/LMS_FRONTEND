'use client';

import styles from './GlobalLoader.module.css';

export default function GlobalLoader() {
  return (
    <div className={styles.loaderOverlay}>
      <div className={styles.loaderContent}>
        <div className={styles.spinnerContainer}>
          <div className={styles.spinner}></div>
          <div className={styles.pulse}></div>
        </div>
        
        <div className={styles.logo}>
          <span className="logo-icon" style={{ width: 40, height: 40, fontSize: 16, margin: '0 auto 12px', display: 'flex' }}>TB</span>
          <span>Terra<span className={styles.logoAccent}>Byte</span></span>
        </div>
        
        <div className={styles.loadingText}>Loading Excellence...</div>
      </div>
    </div>
  );
}
