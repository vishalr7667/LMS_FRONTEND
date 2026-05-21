'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import styles from '../auth.module.css';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { api } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message || 'Password reset email sent. Check your inbox.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
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
          <h1 className={styles.authTitle}>Reset Password</h1>
          <p className={styles.authSubtitle}>Enter your email and we&apos;ll send a reset link</p>
        </div>

        <div className={styles.authCard}>
          <form className={styles.authForm} onSubmit={handleSubmit} id="forgot-form">
            {error && <div className={styles.authError}>{error}</div>}
            {message && <div className={styles.authSuccess}>{message}</div>}

            <div className="input-group">
              <label className="input-label" htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                type="email"
                className="input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg ${styles.authSubmit}`}
              disabled={loading}
              id="forgot-submit-btn"
              style={{ width: '100%' }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>

        <p className={styles.authFooter}>
          Remember your password?{' '}
          <Link href="/auth/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
