'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavLink from '@/components/layout/NavLink';
import { usePathname } from 'next/navigation';
import styles from './admin.module.css';

import { 
  LayoutDashboard, 
  BookOpen, 
  Package, 
  MessageSquare, 
  Star, 
  Users, 
  Settings, 
  Sun, 
  Moon, 
  GraduationCap,
  ExternalLink
} from 'lucide-react';

const NAV_ITEMS = [
  { section: 'Overview', items: [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/admin', exactMatch: true },
  ]},
  { section: 'Content', items: [
    { label: 'Courses', icon: BookOpen, href: '/admin/courses' },
    { label: 'Resources', icon: Package, href: '/admin/resources' },
    { label: 'Comments', icon: MessageSquare, href: '/admin/comments' },
    { label: 'Reviews', icon: Star, href: '/admin/reviews' },
  ]},
  { section: 'Users', items: [
    { label: 'All Users', icon: Users, href: '/admin/users' },
  ]},
  { section: 'Settings', items: [
    { label: 'Site Settings', icon: Settings, href: '/admin/settings' },
  ]},
];

function AdminSidebar({ theme, toggleTheme }) {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarBrand}>
        <div className={styles.brandIcon}>
          <GraduationCap size={20} />
        </div>
        <div>
          <span className={styles.brandText}>Terra<span className={styles.brandAccent}>Byte</span></span>
          <span className={styles.brandSub}>Admin Panel</span>
        </div>
      </div>

      <nav className={styles.sidebarNav}>
        {NAV_ITEMS.map((section, i) => (
          <div key={i} className={styles.navSection}>
            <div className={styles.navSectionTitle}>{section.section}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  className={styles.navItem}
                  activeClassName={styles.navItemActive}
                  exactMatch={item.exactMatch}
                >
                  <span className={styles.navIcon}>
                    <Icon size={18} />
                  </span>
                  <span>{item.label}</span>
                  {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
        
        {/* Theme Toggle in Nav */}
        <div className={styles.navSection}>
          <div className={styles.navSectionTitle}>Appearance</div>
          <button onClick={toggleTheme} className={styles.navItem}>
            <span className={styles.navIcon}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </span>
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </nav>

      <div className={styles.sidebarFooter}>
        <Link href="/" className={styles.backToSite}>
          <ExternalLink size={14} style={{ marginRight: 8 }} />
          Back to Website
        </Link>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }) {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme') || 'dark';
    setTheme(savedTheme);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('admin-theme', newTheme);
  };

  if (!mounted) {
    return <div className={styles.adminLayout} style={{ background: '#0f1117' }} />;
  }

  return (
    <div className={`${styles.adminLayout} admin-scroll-container`} data-theme={theme}>
      <AdminSidebar theme={theme} toggleTheme={toggleTheme} />
      <div className={styles.mainContent}>
        {children}
      </div>
    </div>
  );
}
