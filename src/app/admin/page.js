'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { 
  BookOpen, 
  Users, 
  Film, 
  Gem, 
  AlertTriangle,
  Plus
} from 'lucide-react';
import styles from './admin.module.css';

export default function AdminDashboard() {
  const { api } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, coursesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/courses')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
        setRecentUsers(statsRes.data.recentUsers || []);
      }

      if (coursesRes.data.success) {
        setRecentCourses(coursesRes.data.courses.slice(0, 5));
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please check if you have admin permissions.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className={styles.loadingPlaceholder}>
        <div className={styles.loader}></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContent}>
        <div className={`${styles.alert} ${styles.alertError}`}>
          <AlertTriangle size={20} style={{ marginRight: 8 }} />
          {error}
          <button onClick={fetchDashboardData} className={styles.adminBtn} style={{ marginLeft: 'auto' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Courses', value: stats?.totalCourses || 0, icon: BookOpen, colorClass: 'statIconCourses' },
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, colorClass: 'statIconUsers' },
    { label: 'Total Lessons', value: stats?.totalLessons || 0, icon: Film, colorClass: 'statIconLessons' },
    { label: 'Subscribers', value: stats?.subscriberCount || 0, icon: Gem, colorClass: 'statIconRevenue' },
  ];
  return (
    <>
      <div className={styles.topBar}>
        <h1 className={styles.topBarTitle}>Dashboard</h1>
        <div className={styles.topBarActions}>
          <Link href="/admin/courses" className={styles.adminBtn + ' ' + styles.adminBtnPrimary}>
            <Plus size={16} style={{ marginRight: 6 }} />
            New Course
          </Link>
        </div>
      </div>

      <div className={styles.pageContent}>
        {/* Stats */}
        <div className={styles.statsGrid}>
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className={`${styles.statIcon} ${styles[stat.colorClass]}`}>
                    <Icon size={24} />
                  </div>
                </div>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Two column */}
        <div className={styles.twoCol}>
          {/* Recent Courses */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionCardHeader}>
              <h3 className={styles.sectionCardTitle}>Recent Courses</h3>
              <Link href="/admin/courses" className={`${styles.adminBtn} ${styles.adminBtnGhost}`}>View All</Link>
            </div>
            <div className={styles.sectionCardBody}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Lessons</th>
                    <th>Access</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCourses.map((course, i) => (
                    <tr key={course._id || i}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{course.title}</div>
                        <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{course.category}</div>
                      </td>
                      <td>{course.totalLessons || 0}</td>
                      <td>
                        <span className={`${styles.cellBadge} ${course.accessType === 'free' ? styles.cellBadgeFree : styles.cellBadgePremium}`}>
                          {course.accessType}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.cellBadge} ${course.status === 'published' ? styles.cellBadgePublished : styles.cellBadgeDraft}`}>
                          {course.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentCourses.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>No courses found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Users */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionCardHeader}>
              <h3 className={styles.sectionCardTitle}>Recent Users</h3>
              <Link href="/admin/users" className={`${styles.adminBtn} ${styles.adminBtnGhost}`}>View All</Link>
            </div>
            <div className={styles.sectionCardBody}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user, i) => (
                    <tr key={user._id || i}>
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
                        <span className={`${styles.cellBadge} ${user.role === 'admin' ? styles.cellBadgePremium : styles.cellBadgeFree}`}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ color: 'var(--admin-text-muted)', fontSize: 13 }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {recentUsers.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
