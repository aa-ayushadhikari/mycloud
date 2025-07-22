import { useAuth as useContextAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function useAuth() {
  const auth = useContextAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Enhanced logout that navigates to signin
  const enhancedLogout = () => {
    authService.logout().catch(err => {
      console.error('Logout error:', err);
    });
    auth.setUser(null);
    router.push('/signin');
  };
  
  // Get profile with better error handling
  const getProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.getProfile();
      return response;
    } catch (err) {
      setError(err.message || 'Failed to get profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Generate API key with better error handling
  const generateApiKey = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.generateApiKey();
      return response;
    } catch (err) {
      setError(err.message || 'Failed to generate API key');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return {
    ...auth,
    logout: enhancedLogout,
    getProfile,
    generateApiKey
  };
} 