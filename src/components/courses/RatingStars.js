'use client';

import { useState } from 'react';
import styles from './RatingStars.module.css';

export default function RatingStars({ rating, onRate, size = 'sm', readOnly = false }) {
  const [hover, setHover] = useState(0);
  const starsSize = size === 'lg' ? '28px' : '18px';

  return (
    <div className={styles.ratingSystem} style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
      <div className={styles.starsRow} style={{ fontSize: starsSize, display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = (hover || rating) >= star;
          const isHalf = !hover && rating && !Number.isInteger(rating) && Math.ceil(rating) === star && rating >= star - 0.5;

          return (
            <span
              key={star}
              className={`${styles.star} ${isFilled ? styles.starFilled : ''}`}
              onMouseEnter={() => !readOnly && setHover(star)}
              onMouseLeave={() => !readOnly && setHover(0)}
              onClick={() => !readOnly && onRate && onRate(star)}
              style={{
                cursor: readOnly ? 'default' : 'pointer',
                color: isFilled ? 'var(--accent-gold)' : '#E5E7EB',
                transition: 'color 0.2s',
                position: 'relative'
              }}
            >
              ★
              {/* Half star logic for future proofing if needed, simple approach just uses CSS color */}
            </span>
          );
        })}
      </div>
    </div>
  );
}
