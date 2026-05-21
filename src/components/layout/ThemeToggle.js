'use client';

import { useTheme } from '@/lib/theme';
import { Sun, Moon } from 'lucide-react';
import styles from './Navbar.module.css'; // Reusing Navbar styles for consistency or creating a small scoped class

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="btn-icon"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={{ 
        position: 'relative',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        transition: 'all var(--transition-base)'
      }}
    >
      {theme === 'light' ? (
        <Moon size={20} className="animate-fade-in" />
      ) : (
        <Sun size={20} color="var(--accent-gold)" className="animate-fade-in" />
      )}
    </button>
  );
}
