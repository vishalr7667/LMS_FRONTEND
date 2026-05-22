'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import NavLink from './NavLink';
import { useAuth } from '@/lib/auth';
import { BookOpen, ChevronRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, logout, api, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [groupedCourses, setGroupedCourses] = useState({});
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);

  const toggleMobileMenu = () => {
    setMobileOpen((prev) => {
      const next = !prev;
      if (next) setProfileOpen(false);
      return next;
    });
  };

  const toggleProfileMenu = () => {
    setProfileOpen((prev) => {
      const next = !prev;
      if (next) setMobileOpen(false);
      return next;
    });
  };

  const fetchCourses = useCallback(async () => {
    try {
      const { data } = await api.get('/courses');
      if (data.success) {
        // Group courses by category
        const grouped = data.courses.reduce((acc, course) => {
          const cat = course.category || 'Other';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(course);
          return acc;
        }, {});
        setGroupedCourses(grouped);

        // Initialize activeCategory with the first one
        const cats = Object.keys(grouped).sort();
        if (cats.length > 0) setActiveCategory(cats[0]);
      }
    } catch (error) {
      console.error('Failed to fetch navbar courses:', error);
    } finally {
      setLoadingCourses(false);
    }
  }, [api]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const categories = Object.keys(groupedCourses).sort();

  return (
    <>
      <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          <span className="logo-icon">
            TB
          </span>
          <span className="logo-text">Terra<span className={styles.logoAccent}>Byte</span></span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          <NavLink href="/" className="navbar-link">Home</NavLink>

          {/* Courses Dynamic Dropdown */}
          <div className={styles.navItemWithDropdown}>
            <NavLink href="/courses" className="navbar-link">
              Courses
              <svg className={styles.navChevron} width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </NavLink>

            {!loadingCourses && categories.length > 0 && (
              <div className={styles.megaDropdown}>
                {/* Left Panel: Categories */}
                <div className={styles.categorySidebar}>
                  {categories.map((cat) => (
                    <div
                      key={cat}
                      className={`${styles.categoryItem} ${activeCategory === cat ? styles.categoryActive : ''}`}
                      onMouseEnter={() => setActiveCategory(cat)}
                    >
                      <span>{cat}</span>
                      <ChevronRight size={14} opacity={0.5} />
                    </div>
                  ))}
                </div>

                {/* Vertical Divider */}
                <div className={styles.menuDivider}></div>

                {/* Right Panel: Courses */}
                <div className={styles.coursesArea}>
                  <div className={styles.coursesAreaTitle}>{activeCategory}</div>
                  <div className={styles.coursesGrid}>
                    {groupedCourses[activeCategory]?.map((course) => (
                      <Link
                        key={course._id}
                        href={`/courses/${course.slug}`}
                        className={styles.megaCourseLink}
                      >
                        <div className={styles.courseIcon}>
                          <BookOpen size={18} />
                        </div>
                        <div className={styles.courseInfo}>
                          <span className={styles.courseTitle}>{course.title}</span>
                          <span className={styles.courseSub}>{course.difficulty || 'All Levels'}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <NavLink href="/resources" className="navbar-link">Resources</NavLink>
          <NavLink href="/pricing" className="navbar-link">Pricing</NavLink>
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          <ThemeToggle />
          {!loading ? (
            user ? (
              <div className={styles.profileWrapper}>
                <button
                  className={styles.profileBtn}
                  onClick={toggleProfileMenu}
                  id="profile-menu-btn"
                >
                  <div className={styles.avatar}>
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} />
                    ) : (
                      <span>{user.name?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <span className={styles.profileName}>{user.name}</span>
                  <svg className={styles.profileChevron} width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {profileOpen && (
                  <div className={styles.dropdown} id="profile-dropdown">
                    <div className={styles.dropdownHeader}>
                      <p className={styles.dropdownName}>{user.name}</p>
                      <p className={styles.dropdownEmail}>{user.email}</p>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <Link href="/dashboard" className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>
                      My Dashboard
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/admin" className={styles.dropdownItem} onClick={() => setProfileOpen(false)}>
                        Admin Panel
                      </Link>
                    )}
                    <div className={styles.dropdownDivider} />
                    <button
                      className={styles.dropdownItem}
                      onClick={() => { logout(); setProfileOpen(false); }}
                      id="logout-btn"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-ghost btn-sm" id="login-btn">
                  Sign In
                </Link>
                <Link href="/auth/register" className="btn btn-primary btn-sm" id="register-btn">
                  Get Started
                </Link>
              </>
            )
          ) : (
            <div className={styles.authPlaceholder} />
          )}

          {/* Mobile toggle */}
          <button
            className={`navbar-mobile-toggle ${mobileOpen ? 'open' : ''}`}
            onClick={toggleMobileMenu}
            id="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>

    {/* Mobile Menu */}
    {mobileOpen && (
        <div className={styles.mobileMenu} id="mobile-menu">
          <NavLink href="/" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Home</NavLink>
          <NavLink href="/courses" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Courses</NavLink>
          <NavLink href="/resources" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Resources</NavLink>
          <NavLink href="/pricing" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Pricing</NavLink>
          {!user ? (
            <div className={styles.mobileActions}>
              <Link href="/auth/login" className="btn btn-ghost" onClick={() => setMobileOpen(false)}>Sign In</Link>
              <Link href="/auth/register" className="btn btn-primary" onClick={() => setMobileOpen(false)}>Get Started</Link>
            </div>
          ) : (
            <div className={styles.mobileProfileSection}>
              <div className={styles.mobileUserStats}>
                <div className={styles.mobileAvatar}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{user.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className={styles.mobileUserInfo}>
                  <div className={styles.mobileName}>{user.name}</div>
                  <div className={styles.mobileEmail}>{user.email}</div>
                </div>
              </div>
              <div className={styles.mobileProfileLinks}>
                <Link href="/dashboard" className={styles.mobileProfileLink} onClick={() => setMobileOpen(false)}>
                  My Dashboard
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className={styles.mobileProfileLink} onClick={() => setMobileOpen(false)}>
                    Admin Panel
                  </Link>
                )}
                <button
                  className={styles.mobileLogoutBtn}
                  onClick={() => { logout(); setMobileOpen(false); }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
