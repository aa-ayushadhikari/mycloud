'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, signOut, isAuthenticated } = useAuth();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.navbarContent}>
          <div className={styles.logo}>
            <Link href="/">
              <span className={styles.logoText}>MyCloud</span>
            </Link>
          </div>

          <div className={styles.desktopMenu}>
            <ul className={styles.navLinks}>
              <li><Link href="/#products">Products</Link></li>
              <li><Link href="/#solutions">Solutions</Link></li>
              <li><Link href="/#pricing">Pricing</Link></li>
              <li><Link href="/#docs">Documentation</Link></li>
            </ul>
          </div>

          <div className={styles.navButtons}>
            {isAuthenticated() ? (
              <>
                <span className={styles.welcomeText}>
                  Welcome, {user?.name?.split(' ')[0]}
                </span>
                <Link href="/dashboard" className={`${styles.dashboardButton} btn-primary`}>
                  Go to Dashboard
                </Link>
                <button onClick={signOut} className={styles.logoutButton}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/signin" className={styles.loginButton}>Sign In</Link>
                <Link href="/signup" className={`${styles.dashboardButton} btn-primary`}>Sign Up</Link>
              </>
            )}
          </div>

          <button 
            className={styles.mobileMenuButton} 
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <div className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>

        {menuOpen && (
          <div className={styles.mobileMenu}>
            <ul className={styles.mobileNavLinks}>
              <li><Link href="/#products" onClick={() => setMenuOpen(false)}>Products</Link></li>
              <li><Link href="/#solutions" onClick={() => setMenuOpen(false)}>Solutions</Link></li>
              <li><Link href="/#pricing" onClick={() => setMenuOpen(false)}>Pricing</Link></li>
              <li><Link href="/#docs" onClick={() => setMenuOpen(false)}>Documentation</Link></li>
              
              {isAuthenticated() ? (
                <>
                  <li><Link href="/dashboard" onClick={() => setMenuOpen(false)} className="btn-primary">Go to Dashboard</Link></li>
                  <li><button onClick={() => { signOut(); setMenuOpen(false); }} className={styles.mobileLogoutButton}>Sign Out</button></li>
                </>
              ) : (
                <>
                  <li><Link href="/signin" onClick={() => setMenuOpen(false)}>Sign In</Link></li>
                  <li><Link href="/signup" onClick={() => setMenuOpen(false)} className="btn-primary">Sign Up</Link></li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 