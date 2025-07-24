'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../hooks/useSubscription';
import styles from '../dashboard.module.css';

const DashboardHeader = () => {
  const { user, logout } = useAuth();
  const { userSubscription, getCurrentTierDetails } = useSubscription();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tierName, setTierName] = useState('');
  const [tierClass, setTierClass] = useState('');
  
  // Get page title based on the current path
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard';
    const path = pathname.split('/').pop();
    return path.charAt(0).toUpperCase() + path.slice(1);
  };
  
  // Get subscription tier name and set appropriate class
  useEffect(() => {
    if (userSubscription) {
      const currentTier = getCurrentTierDetails();
      let tierId = '';
      
      if (currentTier && currentTier.name) {
        setTierName(currentTier.name);
        tierId = currentTier.id;
      } else {
        // Fallback to tier ID if name is not available
        tierId = userSubscription.tier?.id || userSubscription.tier || 'free';
        
        // Map tier ID to a display name
        const tierMap = {
          'free': 'Freemium',
          'startup': 'Startup Tier',
          'basic': 'Basic Tier',
          'gold': 'Gold Tier'
        };
        
        setTierName(tierMap[tierId] || 'Free Tier');
      }
      
      // Set the appropriate CSS class based on tier
      switch(tierId) {
        case 'free':
          setTierClass(styles.tierFreemium);
          break;
        case 'startup':
          setTierClass(styles.tierStartup);
          break;
        case 'basic':
          setTierClass(styles.tierBasic);
          break;
        case 'gold':
          setTierClass(styles.tierGold);
          break;
        default:
          setTierClass(styles.tierFreemium);
      }
    } else {
      setTierName('Freemium');
      setTierClass(styles.tierFreemium);
    }
  }, [userSubscription, getCurrentTierDetails]);
  
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
    logout();
    router.push('/');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return '?';
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    } else if (user.firstName) {
      return user.firstName.substring(0, 2).toUpperCase();
    } else if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return '?';
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
        <div className={styles.titleContainer}>
          <h1 className={styles.pageTitle}>{getPageTitle()}</h1>
          {tierName && (
            <span className={`${styles.tierBadge} ${tierClass}`}>
              {tierName}
            </span>
          )}
        </div>
      </div>
      
      <div className={styles.headerRight}>
        <div className={styles.userMenu}>
          <button 
            className={styles.userButton} 
            onClick={toggleDropdown}
            aria-label="User menu"
          >
            <div className={styles.userAvatar}>{getUserInitials()}</div>
            <span className={styles.userName}>{user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'User'}</span>
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