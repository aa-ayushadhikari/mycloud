import apiClient from './apiClient';

export const storageService = {
  async getAllStorageVolumes(page = 1, limit = 10, filters = {}) {
    try {
      const params = {
        page,
        limit,
        ...filters
      };
      
      const response = await apiClient.get('/storage', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getStorageVolume(id) {
    try {
      const response = await apiClient.get(`/storage/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async createStorageVolume(storageData) {
    try {
      const response = await apiClient.post('/storage', storageData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async updateStorageVolume(id, updateData) {
    try {
      const response = await apiClient.patch(`/storage/${id}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async deleteStorageVolume(id) {
    try {
      const response = await apiClient.delete(`/storage/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async attachStorageVolume(id, instanceId, mountPoint) {
    try {
      const response = await apiClient.post(`/storage/${id}/attach`, {
        instanceId,
        mountPoint
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async detachStorageVolume(id) {
    try {
      const response = await apiClient.post(`/storage/${id}/detach`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  async getStorageTypes() {
    try {
      const response = await apiClient.get('/storage/types/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
}; 