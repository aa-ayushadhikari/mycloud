import apiClient from './apiClient';

export const instanceService = {
  async getAllInstances(page = 1, limit = 10, filters = {}) {
    try {
      const params = {
        page,
        limit,
        ...filters
      };
      
      const response = await apiClient.get('/instances', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getInstance(id) {
    try {
      const response = await apiClient.get(`/instances/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async createInstance(instanceData) {
    try {
      const response = await apiClient.post('/instances', instanceData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async updateInstance(id, updateData) {
    try {
      const response = await apiClient.patch(`/instances/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async startInstance(id) {
    try {
      const response = await apiClient.post(`/instances/${id}/start`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async stopInstance(id) {
    try {
      const response = await apiClient.post(`/instances/${id}/stop`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async terminateInstance(id) {
    try {
      const response = await apiClient.post(`/instances/${id}/terminate`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getInstanceTypes() {
    try {
      const response = await apiClient.get('/instances/types/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getOperatingSystems() {
    try {
      const response = await apiClient.get('/instances/os/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 