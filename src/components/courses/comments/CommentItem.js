'use client';

import { useState } from 'react';
import styles from './comments.module.css';

export default function CommentItem({ comment, onReply, user }) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    setIsSubmitting(true);
    const success = await onReply(comment._id, replyContent);
    if (success) {
      setReplyContent('');
      setIsReplying(false);
    }
    setIsSubmitting(false);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isInstructor = comment.userId?.role === 'admin';

  return (
    <div className={styles.commentItem}>
      <div className={styles.avatar}>
        {comment.userId?.avatar ? (
          <img src={comment.userId.avatar} alt={comment.userId.name} />
        ) : (
          comment.userId?.name?.charAt(0) || '?'
        )}
      </div>

      <div className={styles.contentArea}>
        <div className={styles.header}>
          <span className={styles.userName}>{comment.userId?.name}</span>
          {isInstructor && <span className={styles.instructorBadge}>Instructor</span>}
          <span className={styles.timestamp}>• {formatDate(comment.createdAt)}</span>
        </div>

        <div className={styles.content}>{comment.content}</div>

        <div className={styles.actions}>
          {!comment.parentId && user && (
            <button 
              className={styles.actionBtn} 
              onClick={() => setIsReplying(!isReplying)}
            >
              {isReplying ? 'Cancel' : 'Reply'}
            </button>
          )}
        </div>

        {/* Inline Reply Input */}
        {isReplying && (
          <div className={styles.replyInputArea}>
            <textarea
              className={styles.replyTextarea}
              placeholder="Post a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              autoFocus
            />
            <div className={styles.replyActions}>
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => setIsReplying(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={handleReplySubmit}
                disabled={isSubmitting || !replyContent.trim()}
              >
                {isSubmitting ? 'Posting...' : 'Post Reply'}
              </button>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className={styles.repliesContainer}>
            {comment.replies.map((reply) => (
              <CommentItem 
                key={reply._id} 
                comment={reply} 
                onReply={onReply}
                user={user}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
