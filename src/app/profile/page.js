'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/dashboard');
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyCenter: 'center', background: '#FAFBFC' }}>
      <p>Redirecting to dashboard...</p>
    </div>
  );
}
