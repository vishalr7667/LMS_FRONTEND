'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import styles from '../auth.module.css';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { api } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { token, password });
      setMessage(data.message || 'Password reset successful! You can now sign in.');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.authPage}>
        <div className={styles.authContainer}>
          <div className={styles.authHeader}>
            <div className={styles.authLogo}>
              <span>🎓</span>
              <span>Terra<span className={styles.authLogoGold}>Byte</span></span>
            </div>
            <h1 className={styles.authTitle}>Invalid Link</h1>
            <p className={styles.authSubtitle}>This password reset link is invalid or has expired.</p>
          </div>
          <p className={styles.authFooter}>
            <Link href="/auth/forgot-password">Request a new reset link</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={styles.authHeader}>
          <div className={styles.authLogo}>
            <span>🎓</span>
            <span>Terra<span className={styles.authLogoGold}>Byte</span></span>
          </div>
          <h1 className={styles.authTitle}>Set New Password</h1>
          <p className={styles.authSubtitle}>Enter your new password below</p>
        </div>

        <div className={styles.authCard}>
          <form className={styles.authForm} onSubmit={handleSubmit} id="reset-form">
            {error && <div className={styles.authError}>{error}</div>}
            {message && (
              <div className={styles.authSuccess}>
                {message}
                <div style={{ marginTop: 12 }}>
                  <Link href="/auth/login" className="btn btn-primary btn-sm">Sign In</Link>
                </div>
              </div>
            )}

            {!message && (
              <>
                <div className="input-group">
                  <label className="input-label" htmlFor="new-password">New Password</label>
                  <input
                    id="new-password"
                    type="password"
                    className="input"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="confirm-password">Confirm Password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    className="input"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`btn btn-primary btn-lg ${styles.authSubmit}`}
                  disabled={loading}
                  id="reset-submit-btn"
                  style={{ width: '100%' }}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </>
            )}
          </form>
        </div>

        <p className={styles.authFooter}>
          <Link href="/auth/login">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
