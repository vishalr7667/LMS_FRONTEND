'use client';

import Link from 'next/link';
import { Lock } from 'lucide-react';
import styles from '@/app/courses/[slug]/learn/learn.module.css';

export default function LockedLesson({ courseSlug }) {
  return (
    <div className={styles.lockedContainer}>
      <div className={styles.lockedContent}>
        <div className={styles.lockedIcon}><Lock size={48} opacity={0.5} /></div>
        <h2 className={styles.lockedTitle}>Premium Content</h2>
        <p className={styles.lockedText}>
          This is a premium lesson. To access this content and continue your learning journey with us, 
          please enroll in the course or check out our subscription plans.
        </p>
        <Link href={`/courses/${courseSlug}`} className={styles.enrollBtn}>
          Unlock Full Course
        </Link>
      </div>
    </div>
  );
}
