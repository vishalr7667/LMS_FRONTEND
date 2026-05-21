'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import styles from '../auth.module.css';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
      await register(name, email, password);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <h1 className={styles.authTitle}>Create Your Account</h1>
          <p className={styles.authSubtitle}>Join thousands of learners. It&apos;s free!</p>
        </div>

        <div className={styles.authCard}>
          <form className={styles.authForm} onSubmit={handleSubmit} id="register-form">
            {error && <div className={styles.authError}>{error}</div>}

            <div className="input-group">
              <label className="input-label" htmlFor="register-name">Full Name</label>
              <input
                id="register-name"
                type="text"
                className="input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                className="input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="register-password">Password</label>
              <input
                id="register-password"
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
              <label className="input-label" htmlFor="register-confirm">Confirm Password</label>
              <input
                id="register-confirm"
                type="password"
                className="input"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-lg ${styles.authSubmit}`}
              disabled={loading}
              id="register-submit-btn"
              style={{ width: '100%' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className={styles.authFooter}>
          Already have an account?{' '}
          <Link href="/auth/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
