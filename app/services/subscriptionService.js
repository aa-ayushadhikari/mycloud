import apiClient from './apiClient';

export const subscriptionService = {
  async getAllSubscriptionTiers() {
    try {
      const response = await apiClient.get('/subscriptions/tiers');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getUserSubscription() {
    try {
      const response = await apiClient.get('/subscriptions');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async updateSubscription(tier) {
    try {
      const response = await apiClient.post('/subscriptions/update', { tier });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 