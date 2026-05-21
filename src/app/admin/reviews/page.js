'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { 
  Star, 
  CheckCircle, 
  EyeOff, 
  Trash2, 
  User,
  Filter,
  Check,
  Eye,
  X
} from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminReviewsPage() {
  const { api } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReviews = async (pageNum = 1, status = '') => {
    try {
      setLoading(true);
      let url = `/admin/reviews?page=${pageNum}&limit=10`;
      if (status) url += `&status=${status}`;
      
      const { data } = await api.get(url);
      setReviews(data.reviews || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to fetch reviews', error);
      alert('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(page, statusFilter);
  }, [page, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/admin/reviews/${id}/status`, { status: newStatus });
      setReviews(reviews.map(r => r._id === id ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error('Failed to update status', error);
      alert('Failed to update review status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review entirely?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews(reviews.filter(r => r._id !== id));
    } catch (error) {
      console.error('Failed to delete review', error);
      alert('Failed to delete review');
    }
  };

  return (
    <>
      <div className={styles.topBar}>
        <h1 className={styles.topBarTitle}>Manage Reviews</h1>
        <div className={styles.topBarActions}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Filter size={16} style={{ position: 'absolute', left: 12, color: 'var(--admin-text-muted)', pointerEvents: 'none' }} />
            <select 
              className={`${styles.adminInput} ${styles.adminSelect}`}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              style={{ width: 'auto', paddingLeft: 40, minWidth: 160 }}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>
      </div>

      <div className={styles.pageContent}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className={styles.emptyState}>
            <Star size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
            <h3>No Reviews Found</h3>
            <p>There are no reviews matching your filter.</p>
          </div>
        ) : (
          <div className={styles.adminTableContainer}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Course</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map(review => (
                  <tr key={review._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {review.userId?.avatar ? <img src={review.userId.avatar} alt="avatar" style={{width: '100%', height:'100%', objectFit: 'cover'}}/> : <User size={16} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{review.userId?.name || review.userNameSnapshot || 'Unknown'}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{review.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {review.courseId?.title || 'Deleted Course'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--accent-gold)', fontWeight: 'bold' }}>
                        <Star size={14} fill="currentColor" /> {review.rating}
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '300px', fontSize: '14px', lineHeight: 1.4 }}>
                        {review.comment}
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${review.status}`}>
                        {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <div className={styles.tableActions}>
                        {review.status !== 'published' && (
                          <button className={`${styles.actionBtn} ${styles.btnPrimary}`} onClick={() => handleStatusChange(review._id, 'published')} title="Publish">
                            <Check size={16} />
                          </button>
                        )}
                        {review.status === 'published' && (
                          <button className={`${styles.actionBtn} ${styles.btnSecondary}`} onClick={() => handleStatusChange(review._id, 'hidden')} title="Hide">
                            <EyeOff size={16} />
                          </button>
                        )}
                        <button className={`${styles.actionBtn} ${styles.btnDanger}`} onClick={() => handleDelete(review._id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ padding: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              className={`${styles.adminBtn} ${styles.adminBtnGhost}`} 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center' }}>Page {page} of {totalPages}</span>
            <button 
              className={`${styles.adminBtn} ${styles.adminBtnGhost}`} 
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
        
        {/* Style specific to this page for status badges */}
        <style jsx>{`
          .status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
          }
          .status-badge.published { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
          .status-badge.pending { background: rgba(245, 158, 11, 0.1); color: #d97706; }
          .status-badge.hidden { background: rgba(100, 116, 139, 0.1); color: #475569; }
          .status-badge.deleted { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
        `}</style>
      </div>
    </>
  );
}
