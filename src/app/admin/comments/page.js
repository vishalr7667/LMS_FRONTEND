'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { RotateCw, MessageSquare } from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminCommentsPage() {
  const { api } = useAuth();
  const [comments, setComments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const query = filter === 'all' ? '' : `?approved=${filter === 'approved'}`;
      const { data } = await api.get(`/admin/comments${query}`);
      setComments(data.comments || []);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      showStatus('error', 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [api, filter]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const showStatus = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 4000);
  };

  const toggleApproval = async (id, currentStatus) => {
    try {
      const { data } = await api.put(`/admin/comments/${id}`, { isApproved: !currentStatus });
      if (data.success) {
        setComments(comments.map(c => c._id === id ? { ...c, isApproved: !currentStatus } : c));
        showStatus('success', currentStatus ? 'Comment rejected' : 'Comment approved');
      }
    } catch (err) {
      showStatus('error', 'Failed to update comment status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this comment?')) return;
    try {
      const { data } = await api.delete(`/admin/comments/${id}`);
      if (data.success) {
        setComments(comments.filter(c => c._id !== id));
        showStatus('success', 'Comment deleted');
      }
    } catch (err) {
      showStatus('error', 'Failed to delete comment');
    }
  };

  const pendingCount = comments.filter(c => !c.isApproved).length;

  return (
    <>
      <div className={styles.topBar}>
        <h1 className={styles.topBarTitle}>Moderate Comments</h1>
        <div className={styles.topBarActions}>
          {pendingCount > 0 && (
            <span style={{ fontSize: 14, color: 'var(--admin-accent)', fontWeight: 600 }}>
              {pendingCount} pending review
            </span>
          )}
          <button className={styles.refreshBtn} onClick={fetchComments} title="Refresh List">
            <RotateCw size={18} className={loading ? styles.spin : ''} />
          </button>
        </div>
      </div>

      <div className={styles.pageContent}>
        {msg.text && (
          <div className={`${styles.alert} ${msg.type === 'error' ? styles.alertError : styles.alertSuccess}`}>
            {msg.type === 'error' ? '✕ ' : '✓ '}{msg.text}
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { key: 'all', label: 'All Comments' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
          ].map(tab => (
            <button
              key={tab.key}
              className={`${styles.adminBtn} ${filter === tab.key ? styles.adminBtnPrimary : styles.adminBtnGhost}`}
              onClick={() => setFilter(tab.key)}
              disabled={loading}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.sectionCard}>
          <div className={styles.sectionCardBody}>
            {loading ? (
              <div className={styles.loadingPlaceholder}>
                <div className={styles.loader}></div>
                <p>Fetching comments...</p>
              </div>
            ) : comments.length > 0 ? (
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Comment</th>
                    <th>Lesson</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.map((comment) => (
                    <tr key={comment._id}>
                      <td>
                        <div className={styles.cellUser}>
                          <div className={styles.cellAvatar}>
                            {comment.userId?.avatar ? (
                                <img src={comment.userId.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                comment.userId?.name?.charAt(0) || '?'
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{comment.userId?.name || 'Unknown User'}</div>
                            <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{comment.userId?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ maxWidth: 300, fontSize: 13, color: 'var(--admin-text)', lineHeight: 1.5 }}>
                          {comment.content}
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>{comment.lessonId?.title || 'N/A'}</td>
                      <td>
                        <span className={`${styles.cellBadge} ${comment.isApproved ? styles.cellBadgePublished : styles.cellBadgeDraft}`}>
                          {comment.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--admin-text-muted)', fontSize: 13 }}>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className={styles.cellActions}>
                          <button className={styles.actionBtn} onClick={() => toggleApproval(comment._id, comment.isApproved)}>
                            {comment.isApproved ? 'Reject' : 'Approve'}
                          </button>
                          <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => handleDelete(comment._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.emptyState}>
                <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                <p>No comments found under this filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
