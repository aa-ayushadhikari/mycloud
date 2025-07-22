'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import styles from '../dashboard.module.css';

const DashboardHeader = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Get page title based on the current path
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    const path = pathname.split('/').pop();
    return path.charAt(0).toUpperCase() + path.slice(1);
  };
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };
  
  // Close dropdown
  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    signOut();
    router.push('/');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return '?';
    return user.name
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <header className={styles.dashboardHeader}>
      <div className={styles.headerLeft}>
        <button
          className={styles.toggleSidebarButton}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <h1 className={styles.pageTitle}>{getPageTitle()}</h1>
      </div>
      
      <div className={styles.headerRight}>
        <div className={styles.userMenu}>
          <button 
            className={styles.userButton} 
            onClick={toggleDropdown}
            aria-label="User menu"
          >
            <div className={styles.userAvatar}>{getUserInitials()}</div>
            <span className={styles.userName}>{user?.name}</span>
          </button>
          
          {dropdownOpen && (
            <>
              <div className={styles.userDropdown}>
                <Link 
                  href="/dashboard/account" 
                  className={styles.dropdownItem}
                  onClick={closeDropdown}
                >
                  Account Settings
                </Link>
                <Link 
                  href="/dashboard/billing" 
                  className={styles.dropdownItem}
                  onClick={closeDropdown}
                >
                  Billing
                </Link>
                <div className={styles.dropdownDivider}></div>
                <button 
                  className={styles.logoutButton}
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
              <div 
                onClick={closeDropdown}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 99
                }}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader; 