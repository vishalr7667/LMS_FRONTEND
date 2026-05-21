'use client';

import { GraduationCap } from 'lucide-react';
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
          <GraduationCap size={32} color="var(--accent-gold)" style={{ marginBottom: 12, margin: '0 auto', display: 'block' }} />
          <span>VFXVault<span className={styles.logoAccent}>EDU</span></span>
        </div>
        
        <div className={styles.loadingText}>Loading Excellence...</div>
      </div>
    </div>
  );
}
