'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { API_URL } from '@/lib/api';
import {
  BarChart3,
  BookOpen,
  Settings,
  Flame,
  Trophy,
  Clock,
  CheckCircle,
  RefreshCw,
  GraduationCap,
  PlayCircle,
  Layout,
  User,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import styles from './dashboard.module.css';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, api, updateProfile } = useAuth();
  const router = useRouter();
  const backendUrl = API_URL.replace('/api', '');

  const resolveImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${backendUrl}${path}`;
  };

  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    enrolled: 0,
    completed: 0,
    inProgress: 0,
    totalLessonsCompleted: 0
  });

  // Settings State
  const [profileData, setProfileData] = useState({ name: '', avatar: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/dashboard');
      return;
    }
    setProfileData({ name: user.name || '', avatar: user.avatar || '' });
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [coursesRes, statsRes] = await Promise.all([
        api.get('/progress/my-courses'),
        api.get('/progress/dashboard-stats')
      ]);
      setCourses(coursesRes.data.courses || []);
      setStats(statsRes.data.stats || stats);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await updateProfile(profileData);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setPassLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMsg({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setPassLoading(false);
    }
  };

  if (!user) return null;

  const inProgressCourses = courses.filter(c => c.completionPercent > 0 && c.completionPercent < 100);
  return (
    <div className={styles.dashboardContainer}>
      {/* Dashboard Hero */}
      <section className={styles.dashboardHero}>
        <div className="container">
          <div className={styles.welcomeSection}>
            <div className={styles.userAvatar}>
              {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name?.charAt(0)}
            </div>
            <div className={styles.welcomeText}>
              <h1>Welcome back, <span style={{ color: 'var(--accent-gold)' }}>{user.name}</span>!</h1>
              <p>Track your progress and continue where you left off.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Tabs Navigation */}
        <nav className={styles.tabsNav}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={18} style={{ marginRight: 8 }} /> Overview
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'courses' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <BookOpen size={18} style={{ marginRight: 8 }} /> My Courses
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Settings size={18} style={{ marginRight: 8 }} /> Settings
          </button>
        </nav>

        {/* TAB CONTENT: Overview */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statIcon}><Flame size={24} /></span>
                <span className={styles.statValue}>{stats.enrolled}</span>
                <span className={styles.statLabel}>Enrolled Courses</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}><Trophy size={24} /></span>
                <span className={styles.statValue}>{stats.completed}</span>
                <span className={styles.statLabel}>Completed</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}><BookOpen size={24} /></span>
                <span className={styles.statValue}>{stats.totalLessonsCompleted}</span>
                <span className={styles.statLabel}>Lessons Finished</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}><Clock size={24} /></span>
                <span className={styles.statValue}>{Math.round(stats.totalLessonsCompleted * 0.4)}h</span>
                <span className={styles.statLabel}>Total Time Learnt</span>
              </div>
            </div>

            {inProgressCourses.length > 0 && (
              <section>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Continue Learning</h2>
                  <Link href="/courses" className="text-sm font-bold text-gold">Browse all →</Link>
                </div>
                <div className={styles.horizontalScroll}>
                  {inProgressCourses.map(course => (
                    <Link key={course._id} href={`/courses/${course.slug}/learn`} className={styles.continueCard}>
                      <div className={styles.continueCardMedia}>
                        {course.coverImage ? <img src={resolveImageUrl(course.coverImage)} alt={course.title} /> : <span><PlayCircle size={40} opacity={0.3} /></span>}
                      </div>
                      <div className={styles.continueCardContent}>
                        <p className={styles.continueCategory}>{course.category}</p>
                        <h3 className={styles.continueTitle}>{course.title}</h3>
                        <div className={styles.progressBarContainer}>
                          <div className={styles.progressBar} style={{ width: `${course.completionPercent}%` }} />
                        </div>
                        <div className={styles.progressStats}>
                          <span>{course.completionPercent}% complete</span>
                          <span>Last: {course.lastLesson || 'Introduction'}</span>
                        </div>
                        <button className="btn btn-primary btn-sm" style={{ width: '100%', padding: '12px' }}>
                          Continue Learning
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {loading && <p>Loading your dashboard...</p>}
            {!loading && courses.length === 0 && (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}><GraduationCap size={64} opacity={0.2} /></span>
                <div className={styles.emptyText}>
                  <h3>Your learning journey starts here</h3>
                  <p>You haven&apos;t enrolled in any courses yet. Explore our catalog and find your next skill.</p>
                </div>
                <Link href="/courses" className="btn btn-primary btn-lg">Browse Courses</Link>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: My Courses */}
        {activeTab === 'courses' && (
          <div className="animate-fade-in">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>My Enrolled Courses</h2>
            </div>

            {courses.length > 0 ? (
              <div className={styles.coursesGrid}>
                {courses.map(course => (
                  <div key={course._id} className={styles.enrolledCourseCard}>
                    <div className={styles.courseImageArea}>
                      {course.coverImage ? <img src={resolveImageUrl(course.coverImage)} alt={course.title} /> : <span><BookOpen size={40} opacity={0.3} /></span>}
                      <div className={styles.courseStatusBadge}>
                        {course.completionPercent === 100 ? (
                          <><CheckCircle size={14} style={{ marginRight: 6 }} /> Completed</>
                        ) : (course.completionPercent > 0 ? (
                          <><RefreshCw size={14} style={{ marginRight: 6 }} /> In Progress</>
                        ) : (
                          <><Clock size={14} style={{ marginRight: 6 }} /> Ready to Start</>
                        ))}
                      </div>
                    </div>
                    <div className={styles.courseBody}>
                      <h3 className={styles.courseTitle}>{course.title}</h3>
                      <div className={styles.courseMeta}>
                        <div className={styles.metaItem}><BookOpen size={14} style={{ marginRight: 6 }} /> {course.totalLessons} Lessons</div>
                        <div className={styles.metaItem}><Clock size={14} style={{ marginRight: 6 }} /> {course.totalDuration}</div>
                      </div>
                      <div className={styles.progressBarContainer}>
                        <div className={styles.progressBar} style={{ width: `${course.completionPercent}%` }} />
                      </div>
                      <div className={styles.progressStats}>
                        <span>{course.completionPercent}% complete</span>
                      </div>

                      <div className={styles.lastLessonInfo}>
                        <span className={styles.lastLessonLabel}>Last Accessed</span>
                        <span className={styles.lastLessonTitle}>{course.lastLesson || 'Not started yet'}</span>
                      </div>

                      <Link href={`/courses/${course.slug}/learn`} className="btn btn-dark btn-sm" style={{ marginTop: 'var(--space-5)', width: '100%' }}>
                        {course.completionPercent > 0 ? 'GO TO LESSON' : 'START COURSE'}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <h3>No courses yet</h3>
                <Link href="/courses" className="btn btn-primary">Discover Courses</Link>
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT: Settings */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Profile Settings</h2>
            </div>

            {msg.text && (
              <div className={`badge ${msg.type === 'success' ? 'badge-free' : 'badge-premium'}`} style={{ marginBottom: 'var(--space-6)', padding: '12px 20px', fontSize: '14px', width: '100%' }}>
                {msg.type === 'success' ? '✓ ' : '✕ '}{msg.text}
              </div>
            )}

            <div className={styles.settingsContainer}>
              {/* Profile Form */}
              <div className={styles.settingsCard}>
                <h3 className={styles.settingsTitle}>Public Profile</h3>
                <p className={styles.settingsSubtitle}>Manage how others see you on the platform.</p>

                <form onSubmit={handleUpdateProfile}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Full Name</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Avatar URL (Optional)</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={profileData.avatar}
                      onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email Address</label>
                    <input type="email" className={styles.formInput} value={user.email} disabled />
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Email cannot be changed.</p>
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>

              {/* Password Form */}
              <div className={styles.settingsCard}>
                <h3 className={styles.settingsTitle}>Security</h3>
                <p className={styles.settingsSubtitle}>Update your password to keep your account safe.</p>

                <form onSubmit={handleChangePassword}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Current Password</label>
                    <input
                      type="password"
                      className={styles.formInput}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>New Password</label>
                    <input
                      type="password"
                      className={styles.formInput}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Confirm New Password</label>
                    <input
                      type="password"
                      className={styles.formInput}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-dark" disabled={passLoading}>
                    {passLoading ? 'Updating Password...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
