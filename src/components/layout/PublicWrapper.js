'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import MaintenanceMode from './MaintenanceMode';
import Navbar from './Navbar';
import Footer from './Footer';
import GlobalLoader from './GlobalLoader';

export default function PublicWrapper({ children }) {
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Exemption Logic
  const isAdminPath = pathname?.startsWith('/admin');
  const isAuthPath = pathname?.startsWith('/auth');
  const isLearnPath = pathname?.includes('/learn');

  // Shell visibility: Hide global Navbar/Footer for "App-like" experiences
  const showGlobalShell = !isAdminPath && !isLearnPath;

  // SCROLL-TO-TOP: Ensure page starts at top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // 1. Fetch Public Settings

  useEffect(() => {
    const initSite = async () => {
      try {
        // Add timeout to prevent indefinite hanging if server is unresponsive
        const { data } = await axios.get(`${API_URL}/admin/settings/public?t=${Date.now()}`, {
          timeout: 5000 
        });
        if (data.success) setSettings(data.settings);
      } catch (err) {
        console.error('[PublicWrapper] Settings fetch failed:', err.message);
      } finally {
        setLoading(false);
      }
    };
    initSite();
  }, []);

  // Gatekeeper: Show loader if settings or auth are still loading
  if (loading || authLoading) {
    return <GlobalLoader />;
  }


  // Maintenance Mode Logic
  const inMaintenance = settings?.maintenanceMode;

  if (inMaintenance && !isAdminPath && !isAuthPath) {
    return (
      <>
        <Navbar />
        <main>
          <MaintenanceMode
            siteName={settings?.siteName}
            siteTagline={settings?.siteTagline}
          />
        </main>
        <Footer />
      </>
    );
  }

  // Normal Mode: Root Shell
  return (
    <>
      {/* Navbar show/hide logic */}
      {showGlobalShell && <Navbar />}

      <main className={!showGlobalShell ? 'no-shell-padding' : ''}>
        {children}
      </main>

      {/* Footer show/hide logic */}
      {showGlobalShell && <Footer />}
    </>
  );
}
