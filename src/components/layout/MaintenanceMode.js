'use client';

import { useState } from 'react';
import axios from 'axios';
import { API_URL } from '@/lib/api';
import { Wrench, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import styles from './MaintenanceMode.module.css';

export default function MaintenanceMode({ siteName, siteTagline }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setStatus('loading');
      const { data } = await axios.post(`${API_URL}/admin/settings/subscribe`, { email });
      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setEmail('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to subscribe');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <Wrench className={styles.icon} size={48} />
        </div>
        
        <h1 className={styles.title}>Under Maintenance</h1>
        <p className={styles.description}>
          <strong>{siteName || 'TerraByte'}</strong> is currently undergoing scheduled improvements to enhance your learning experience. We'll be back shortly!
        </p>
        
        <div className={styles.tagline}>
          "{siteTagline || 'Master the Art of Digital Creation'}"
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Get Notified When We're Back</h3>
          <p className={styles.cardDesc}>Leave your email and we'll send you an invitation as soon as we go live.</p>
          
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputWrapper}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading' || status === 'success'}
                required
              />
              <button 
                type="submit" 
                className={styles.button}
                disabled={status === 'loading' || status === 'success'}
              >
                {status === 'loading' ? '...' : <Send size={18} />}
              </button>
            </div>
          </form>

          {status === 'success' && (
            <div className={styles.successMessage}>
              <CheckCircle2 size={16} /> {message}
            </div>
          )}
          {status === 'error' && (
            <div className={styles.errorMessage}>
              <AlertCircle size={16} /> {message}
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.backgroundText}>MAINTENANCE</div>
    </div>
  );
}
