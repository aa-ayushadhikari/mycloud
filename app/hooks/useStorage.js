import { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

export function useStorage(page = 1, limit = 10, filters = {}) {
  const [storageVolumes, setStorageVolumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalVolumes: 0
  });

  useEffect(() => {
    const fetchStorageVolumes = async () => {
      try {
        setLoading(true);
        const response = await storageService.getAllStorageVolumes(page, limit, filters);
        setStorageVolumes(response.storageVolumes);
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalVolumes: response.totalVolumes
        });
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch storage volumes');
      } finally {
        setLoading(false);
      }
    };

    fetchStorageVolumes();
  }, [page, limit, JSON.stringify(filters)]);

  const createStorageVolume = async (storageData) => {
    try {
      setLoading(true);
      const response = await storageService.createStorageVolume(storageData);
      // Refresh the list
      await refreshStorageList();
      return response;
    } catch (err) {
      setError(err.message || 'Failed to create storage volume');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteStorageVolume = async (id) => {
    try {
      setLoading(true);
      await storageService.deleteStorageVolume(id);
      // Refresh the list
      await refreshStorageList();
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete storage volume');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const attachStorageVolume = async (id, instanceId, mountPoint) => {
    try {
      setLoading(true);
      await storageService.attachStorageVolume(id, instanceId, mountPoint);
      // Refresh the list
      await refreshStorageList();
      return true;
    } catch (err) {
      setError(err.message || 'Failed to attach storage volume');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const detachStorageVolume = async (id) => {
    try {
      setLoading(true);
      await storageService.detachStorageVolume(id);
      // Refresh the list
      await refreshStorageList();
      return true;
    } catch (err) {
      setError(err.message || 'Failed to detach storage volume');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshStorageList = async () => {
    try {
      const response = await storageService.getAllStorageVolumes(page, limit, filters);
      if (response) {
        setStorageVolumes(response.storageVolumes);
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalVolumes: response.totalVolumes
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to refresh storage volumes');
    }
  };

  return {
    storageVolumes,
    loading,
    error,
    pagination,
    createStorageVolume,
    deleteStorageVolume,
    attachStorageVolume,
    detachStorageVolume,
    refreshStorageList
  };
} 