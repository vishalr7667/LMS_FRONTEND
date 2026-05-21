'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import styles from '../auth.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authHeader}>
          <div className={styles.authLogo}>
            <span>🎓</span>
            <span>Terra<span className={styles.authLogoGold}>Byte</span></span>
          </div>
          <h1 className={styles.authTitle}>Welcome Back</h1>
          <p className={styles.authSubtitle}>Sign in to continue your learning journey</p>
        </div>

        <div className={styles.authCard}>
          <form className={styles.authForm} onSubmit={handleSubmit} id="login-form">
            {error && <div className={styles.authError}>{error}</div>}

            <div className="input-group">
              <label className="input-label" htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                className="input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.authForgot}>
              <Link href="/auth/forgot-password">Forgot password?</Link>
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg ${styles.authSubmit}`}
              disabled={loading}
              id="login-submit-btn"
              style={{ width: '100%' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className={styles.authFooter}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/register">Create one for free</Link>
        </p>
      </div>
    </div>
  );
}
