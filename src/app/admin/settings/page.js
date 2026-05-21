'use client';

import { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import api from '@/lib/api';

export default function AdminSettingsPage() {
  const [siteSettings, setSiteSettings] = useState({
    siteName: '',
    siteTagline: '',
    contactEmail: '',
    socialTwitter: '',
    socialYoutube: '',
    socialDiscord: '',
    enableRegistration: true,
    enableComments: true,
    requireCommentApproval: true,
    maintenanceMode: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/settings');
      if (data.success) {
        setSiteSettings(data.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSiteSettings({ ...siteSettings, [field]: value });
    setSaved(false);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      const { data } = await api.post('/admin/settings', siteSettings);
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.topBar}>
        <h1 className={styles.topBarTitle}>Site Settings</h1>
        <div className={styles.topBarActions}>
          {saved && (
            <span style={{ fontSize: 14, color: 'var(--admin-green)', fontWeight: 600, marginRight: 12 }}>✓ Settings saved</span>
          )}
          {error && (
            <span style={{ fontSize: 14, color: '#ef4444', fontWeight: 600, marginRight: 12 }}>{error}</span>
          )}
          <button 
            className={`${styles.adminBtn} ${styles.adminBtnPrimary}`} 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className={styles.pageContent}>
        <form onSubmit={handleSave}>
          {/* General */}
          <div className={styles.sectionCard} style={{ marginBottom: 24 }}>
            <div className={styles.sectionCardHeader}>
              <h3 className={styles.sectionCardTitle}>🌐 General</h3>
            </div>
            <div style={{ padding: 24 }}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.adminLabel}>Site Name</label>
                  <input 
                    className={styles.adminInput} 
                    value={siteSettings.siteName || ''} 
                    onChange={(e) => handleChange('siteName', e.target.value)} 
                    placeholder="Enter site name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.adminLabel}>Tagline</label>
                  <input 
                    className={styles.adminInput} 
                    value={siteSettings.siteTagline || ''} 
                    onChange={(e) => handleChange('siteTagline', e.target.value)} 
                    placeholder="Enter site tagline"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.adminLabel}>Contact Email</label>
                <input 
                  className={styles.adminInput} 
                  type="email" 
                  value={siteSettings.contactEmail || ''} 
                  onChange={(e) => handleChange('contactEmail', e.target.value)} 
                  placeholder="contact@example.com"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className={styles.sectionCard} style={{ marginBottom: 24 }}>
            <div className={styles.sectionCardHeader}>
              <h3 className={styles.sectionCardTitle}>🔗 Social Links</h3>
            </div>
            <div style={{ padding: 24 }}>
              <div className={styles.formGroup}>
                <label className={styles.adminLabel}>Twitter URL</label>
                <input 
                  className={styles.adminInput} 
                  value={siteSettings.socialTwitter || ''} 
                  onChange={(e) => handleChange('socialTwitter', e.target.value)} 
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.adminLabel}>YouTube URL</label>
                <input 
                  className={styles.adminInput} 
                  value={siteSettings.socialYoutube || ''} 
                  onChange={(e) => handleChange('socialYoutube', e.target.value)} 
                  placeholder="https://youtube.com/..."
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.adminLabel}>Discord URL</label>
                <input 
                  className={styles.adminInput} 
                  value={siteSettings.socialDiscord || ''} 
                  onChange={(e) => handleChange('socialDiscord', e.target.value)} 
                  placeholder="https://discord.gg/..."
                />
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionCardHeader}>
              <h3 className={styles.sectionCardTitle}>⚙️ Features</h3>
            </div>
            <div style={{ padding: 24 }}>
              {[
                { key: 'enableRegistration', label: 'Allow User Registration', desc: 'When disabled, new users cannot sign up.' },
                { key: 'enableComments', label: 'Enable Comments', desc: 'Allow users to comment on lessons.' },
                { key: 'requireCommentApproval', label: 'Require Comment Approval', desc: 'New comments must be approved by an admin.' },
                { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Show maintenance page to non-admin visitors.' },
              ].map((toggle) => (
                <div key={toggle.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--admin-border)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{toggle.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginTop: 2 }}>{toggle.desc}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleChange(toggle.key, !siteSettings[toggle.key])}
                    style={{
                      width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                      background: siteSettings[toggle.key] ? 'var(--admin-green)' : 'var(--admin-border)',
                      position: 'relative', transition: 'background 200ms',
                    }}
                  >
                    <span style={{
                      position: 'absolute', top: 3, left: siteSettings[toggle.key] ? 25 : 3,
                      width: 20, height: 20, borderRadius: '50%', background: '#fff',
                      transition: 'left 200ms', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
