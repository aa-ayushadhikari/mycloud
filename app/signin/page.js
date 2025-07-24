'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import styles from '../signup/auth.module.css';

export default function SignInPage() {
  const router = useRouter();
  const { login, error: authError, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    try {
      console.log('Attempting login with:', { email: formData.email });
      const userData = await login(formData.email, formData.password);
      console.log('Login successful:', userData);
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error in component:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h1 className={styles.brandTitle}>MyCloud</h1>
          <h2 className={styles.authTitle}>Welcome back</h2>
          <p className={styles.authSubtitle}>Sign in to access your cloud services</p>
        </div>
        
        {(error || authError) && (
          <div className={styles.errorMessage}>
            {error || authError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <div className={styles.forgotPassword}>
            <Link href="/forgot-password" className={styles.link}>
              Forgot password?
            </Link>
          </div>
          
          <button 
            type="submit" 
            className={styles.authButton}
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className={styles.demoMessage}>
          Demo: Use any email with "test" or "admin" in it
        </div>
        
        <div className={styles.authFooter}>
          <p>
            Don't have an account? <Link href="/signup" className={styles.link}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 