'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { 
  RefreshCw, 
  User, 
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import styles from '../admin.module.css';
import Link from 'next/link';

export default function AdminUsersPage() {
  const { api } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const timeoutRef = useRef(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/users', {
        params: {
          search: searchQuery,
          role: roleFilter === 'all' ? undefined : roleFilter,
          page: pagination.page
        }
      });

      if (data.success) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [api, searchQuery, roleFilter, pagination.page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}`, { role: newRole });
      if (data.success) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setSearchQuery(value);
      // Reset to first page when search changes
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 500);
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        const { data } = await api.delete(`/admin/users/${id}`);
        if (data.success) {
          setUsers(users.filter(u => u._id !== id));
        }
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className={styles.loadingPlaceholder}>
        <div className={styles.loader}></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.topBar}>
        <h1 className={styles.topBarTitle}>Manage Users</h1>
        <div className={styles.topBarActions}>
          <span style={{ fontSize: 14, color: 'var(--admin-text-muted)' }}>{pagination.total} total users</span>
        </div>
      </div>

      <div className={styles.pageContent}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <div className={styles.searchContainer} style={{ flex: 1, maxWidth: 300, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)' }} />
            <input
              className={styles.adminInput}
              style={{ paddingLeft: 40 }}
              placeholder="Search by name or email..."
              value={searchValue}
              onChange={handleSearchChange}
            />
          </div>
          <div style={{ position: 'relative', width: 180 }}>
            <Filter size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', zIndex: 1, pointerEvents: 'none' }} />
            <select
              className={`${styles.adminInput} ${styles.adminSelect}`}
              style={{ paddingLeft: 40 }}
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button
            className={styles.refreshBtn}
            onClick={fetchUsers}
            title="Refresh list"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? styles.spin : ''} />
          </button>
        </div>

        {error && (
          <div className={`${styles.alert} ${styles.alertError}`} style={{ marginBottom: 24 }}>
            {error}
          </div>
        )}

        <div className={styles.sectionCard}>
          <div className={styles.sectionCardBody}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className={styles.cellUser}>
                        <div className={styles.cellAvatar}>{user.name.charAt(0)}</div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{user.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        className={`${styles.adminInput} ${styles.adminSelect}`}
                        style={{ maxWidth: 130, padding: '4px 8px', fontSize: 13, height: 'auto' }}
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td style={{ color: 'var(--admin-text-muted)', fontSize: 13 }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => handleDelete(user._id)}
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                      <div className={styles.emptyState}>
                        <User size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                        <p>No users found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`${styles.adminBtn} ${pagination.page === p ? styles.adminBtnPrimary : styles.adminBtnGhost}`}
                onClick={() => setPagination(prev => ({ ...prev, page: p }))}
                style={{ padding: '4px 12px', minWidth: '40px' }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
