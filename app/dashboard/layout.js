'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from './components/DashboardSidebar';
import DashboardHeader from './components/DashboardHeader';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      router.push('/signin');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className={styles.dashboardContainer}>
      <DashboardSidebar />
      <div className={styles.dashboardContent}>
        <DashboardHeader />
        <main className={styles.contentArea}>
          {children}
        </main>
      </div>
    </div>
  );
} 