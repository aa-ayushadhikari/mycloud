import axios from 'axios';
import apiClient from './apiClient';

const API_URL = 'http://140.245.21.155:5001/api';

export const authService = {
  async register(userData) {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, userData);
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  logout() {
    const token = this.getCurrentUser()?.token;
    localStorage.removeItem('user');
    
    if (token) {
      return axios.post(`${API_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
    return Promise.resolve();
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
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