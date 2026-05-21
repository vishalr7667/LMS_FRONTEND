'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import RatingStars from './RatingStars';
import styles from './CourseReviews.module.css';

export default function CourseReviews({ courseSlug, initialSummary, initialReviews = [], initialHasMore = false }) {
  const { api, user } = useAuth();
  
  const [reviews, setReviews] = useState(initialReviews);
  const [summary, setSummary] = useState(initialSummary || { average: 0, count: 0 });
  const [hasMore, setHasMore] = useState(initialHasMore);
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalReviews, setModalReviews] = useState([]);
  const [modalPage, setModalPage] = useState(1);
  const [modalHasMore, setModalHasMore] = useState(true);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  useEffect(() => {
    // Check if user has already reviewed in the initial list
    if (user && reviews.length > 0) {
      const userReview = reviews.find(r => r.userId?._id === user._id || r.userId === user._id);
      if (userReview) {
        setRating(userReview.rating);
        setComment(userReview.comment);
        setHasReviewed(true);
      }
    }
  }, [user, reviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setSubmitError('You must be logged in to leave a review.');
      return;
    }
    if (rating === 0) {
      setSubmitError('Please select a rating.');
      return;
    }
    if (!comment.trim()) {
      setSubmitError('Please provide a comment.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const res = await api.post(`/courses/${courseSlug}/reviews`, {
        rating,
        comment
      });
      
      setSubmitSuccess(res.data.message || 'Review submitted successfully!');
      setSummary(res.data.courseRating);
      setHasReviewed(true);
      
      // Update preview list with the new/updated review
      const newReview = res.data.review;
      // manually populate user details for display
      newReview.userId = { _id: user._id, name: user.name, avatar: user.avatar };
      
      setReviews(prev => {
        const filtered = prev.filter(r => r._id !== newReview._id);
        return [newReview, ...filtered].slice(0, 6);
      });

    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openModal = async () => {
    setShowModal(true);
    if (modalReviews.length === 0) {
      loadModalReviews(1);
    }
  };

  const loadModalReviews = async (pageToLoad) => {
    setIsLoadingModal(true);
    try {
      const res = await api.get(`/courses/${courseSlug}/reviews?mode=full&page=${pageToLoad}&limit=10`);
      if (res.data.success) {
        if (pageToLoad === 1) {
          setModalReviews(res.data.items);
        } else {
          setModalReviews(prev => [...prev, ...res.data.items]);
        }
        setModalHasMore(res.data.pagination.hasMore);
        setModalPage(pageToLoad);
      }
    } catch (err) {
      console.error('Failed to load full reviews', err);
    } finally {
      setIsLoadingModal(false);
    }
  };

  return (
    <div className={styles.reviewsSection}>
      <div className={styles.reviewsHeader}>
        <h2 className={styles.sectionHeading}>Student Feedback</h2>
        <div className={styles.summaryStats}>
          <span className={styles.averageRating}>{summary.average || 0}</span>
          <RatingStars rating={summary.average || 0} readOnly size="sm" />
          <span className={styles.ratingCount}>({summary.count || 0} ratings)</span>
        </div>
      </div>

      <div className={styles.reviewsContent}>
        {/* Review Form */}
        <div className={styles.reviewFormContainer}>
          <h3 className={styles.formTitle}>{hasReviewed ? 'Update your review' : 'Leave a review'}</h3>
          {!user ? (
            <p className={styles.loginPrompt}>Please sign in to leave a review.</p>
          ) : (
            <form onSubmit={handleSubmit} className={styles.reviewForm}>
              <div className={styles.ratingInput}>
                <label>Rating:</label>
                <RatingStars rating={rating} onRate={setRating} size="lg" />
              </div>
              <textarea 
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="What did you think of this course?"
                className={styles.commentInput}
                maxLength={1000}
                required
              />
              {submitError && <div className={styles.errorMsg}>{submitError}</div>}
              {submitSuccess && <div className={styles.successMsg}>{submitSuccess}</div>}
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ width: '100%', marginTop: '12px' }}
              >
                {isSubmitting ? 'Submitting...' : (hasReviewed ? 'Update Review' : 'Submit Review')}
              </button>
            </form>
          )}
        </div>

        {/* Review List */}
        <div className={styles.reviewList}>
          {reviews.length === 0 ? (
            <p className={styles.noReviews}>No reviews yet. Be the first!</p>
          ) : (
            <div className={styles.reviewsGrid}>
              {reviews.map(review => (
                <div key={review._id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewerAvatar}>
                      {review.userId?.avatar ? (
                        <img src={review.userId.avatar} alt={review.userId.name} />
                      ) : (
                        <span>{(review.userNameSnapshot || review.userId?.name || '?').charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <div className={styles.reviewerName}>{review.userNameSnapshot || review.userId?.name || 'Student'}</div>
                      <RatingStars rating={review.rating} readOnly size="sm" />
                    </div>
                    <span className={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className={styles.reviewComment}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}

          {hasMore && (
            <button className={`${styles.viewAllBtn} btn btn-outline`} onClick={openModal}>
              View All Reviews
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>All Reviews</h3>
              <button className={styles.closeModalBtn} onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div className={styles.modalBody}>
              {modalReviews.map(review => (
                <div key={review._id} className={styles.reviewCard} style={{ marginBottom: 16 }}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewerAvatar}>
                      {review.userId?.avatar ? (
                        <img src={review.userId.avatar} alt={review.userId.name} />
                      ) : (
                        <span>{(review.userNameSnapshot || review.userId?.name || '?').charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <div className={styles.reviewerName}>{review.userNameSnapshot || review.userId?.name || 'Student'}</div>
                      <RatingStars rating={review.rating} readOnly size="sm" />
                    </div>
                  </div>
                  <p className={styles.reviewComment}>{review.comment}</p>
                </div>
              ))}
              
              {isLoadingModal && <p className={styles.loadingMsg}>Loading...</p>}
              
              {modalHasMore && !isLoadingModal && (
                <button className={`${styles.loadMoreBtn} btn btn-secondary`} onClick={() => loadModalReviews(modalPage + 1)}>
                  Load More
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
