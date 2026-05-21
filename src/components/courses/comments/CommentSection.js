'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { MessageSquare, Sparkles } from 'lucide-react';
import CommentItem from './CommentItem';
import styles from './comments.module.css';

export default function CommentSection({ lessonId }) {
  const { user, api } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/comments/${lessonId}`);
      if (data.success) {
        setComments(data.comments);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [lessonId, api]);

  useEffect(() => {
    if (lessonId) fetchComments();
  }, [lessonId, fetchComments]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post('/comments', {
        lessonId,
        content: newComment
      });
      if (data.success) {
        setComments([data.comment, ...comments]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId, content) => {
    try {
      const { data } = await api.post('/comments', {
        lessonId,
        content,
        parentId
      });
      if (data.success) {
        // Refetch to ensure hierarchy is correct, or update state locally
        // For threaded replies, refetching is safer for hierarchy
        fetchComments();
        return true;
      }
    } catch (err) {
      console.error('Error posting reply:', err);
    }
    return false;
  };

  return (
    <div className={styles.commentSection}>
      <h3 className={styles.title}>
        <MessageSquare size={20} className={styles.titleIcon} style={{ marginRight: 10, display: 'inline', verticalAlign: 'text-bottom' }} />
        Discussion ({comments.length + comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0)})
      </h3>

      {/* Main post input */}
      {user ? (
        <div className={styles.mainInputArea}>
          <textarea
            className={styles.textarea}
            placeholder="Share your thoughts or ask a question about this lesson..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
          />
          <div className={styles.inputFooter}>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={handlePostComment}
              disabled={submitting || !newComment.trim()}
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.empty}>
          <p>Please log in to participate in the discussion.</p>
        </div>
      )}

      {/* Comment List */}
      {loading ? (
        <div className={styles.empty}>Loading discussion...</div>
      ) : (
        <div className={styles.commentList}>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem 
                key={comment._id} 
                comment={comment} 
                onReply={handleReply}
                user={user}
              />
            ))
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}><Sparkles size={32} opacity={0.3} /></div>
              <p>No comments yet. Be the first to start a conversation!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
