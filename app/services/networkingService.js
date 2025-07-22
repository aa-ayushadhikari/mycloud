import apiClient from './apiClient';

export const networkingService = {
  async getAllNetworks(page = 1, limit = 10, filters = {}) {
    try {
      const params = {
        page,
        limit,
        ...filters
      };
      
      const response = await apiClient.get('/networking', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getNetwork(id) {
    try {
      const response = await apiClient.get(`/networking/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async createNetwork(networkData) {
    try {
      const response = await apiClient.post('/networking', networkData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async updateNetwork(id, updateData) {
    try {
      const response = await apiClient.patch(`/networking/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async deleteNetwork(id) {
    try {
      const response = await apiClient.delete(`/networking/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getNetworkTypes() {
    try {
      const response = await apiClient.get('/networking/types/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async addSecurityGroupRule(id, direction, rule) {
    try {
      const response = await apiClient.post(`/networking/${id}/rules`, {
        direction,
        rule
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async addDnsRecord(id, record) {
    try {
      const response = await apiClient.post(`/networking/${id}/records`, {
        record
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 