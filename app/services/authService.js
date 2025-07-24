import axios from 'axios';
import apiClient from './apiClient';

// Use the API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authService = {
  async register(userData) {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password // Must be at least 8 chars with uppercase, lowercase, number and special character
        })
      });
      
      const data = await response.json();
      
      // Check if response was successful
      if (!response.ok) {
        throw new Error(data.message || `Registration failed with status ${response.status}`);
      }
      
      if (data.token) {
        localStorage.setItem('user', JSON.stringify(data));
      }
      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });
      
      const data = await response.json();
      
      // Check if response was successful
      if (!response.ok) {
        throw new Error(data.message || `Login failed with status ${response.status}`);
      }
      
      if (data.token) {
        localStorage.setItem('user', JSON.stringify(data));
      }
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('user');
    return Promise.resolve();
  },

  getCurrentUser() {
    if (typeof window !== 'undefined') {
      try {
        return JSON.parse(localStorage.getItem('user'));
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
        return null;
      }
    }
    return null;
  },

  async getProfile() {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async generateApiKey() {
    try {
      const response = await apiClient.post('/auth/api-key');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 