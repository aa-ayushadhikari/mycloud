import { useState, useEffect } from 'react';
import { networkingService } from '../services/networkingService';

export function useNetworking(page = 1, limit = 10, filters = {}) {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalNetworks: 0
  });

  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        setLoading(true);
        const response = await networkingService.getAllNetworks(page, limit, filters);
        setNetworks(response.networks);
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalNetworks: response.totalNetworks
        });
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch networks');
      } finally {
        setLoading(false);
      }
    };

    fetchNetworks();
  }, [page, limit, JSON.stringify(filters)]);

  const createNetwork = async (networkData) => {
    try {
      setLoading(true);
      const response = await networkingService.createNetwork(networkData);
      // Refresh the list
      await refreshNetworkList();
      return response;
    } catch (err) {
      setError(err.message || 'Failed to create network');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateNetwork = async (id, updateData) => {
    try {
      setLoading(true);
      const response = await networkingService.updateNetwork(id, updateData);
      // Refresh the list
      await refreshNetworkList();
      return response;
    } catch (err) {
      setError(err.message || 'Failed to update network');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteNetwork = async (id) => {
    try {
      setLoading(true);
      await networkingService.deleteNetwork(id);
      // Refresh the list
      await refreshNetworkList();
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete network');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addSecurityGroupRule = async (id, direction, rule) => {
    try {
      setLoading(true);
      const response = await networkingService.addSecurityGroupRule(id, direction, rule);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to add security group rule');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addDnsRecord = async (id, record) => {
    try {
      setLoading(true);
      const response = await networkingService.addDnsRecord(id, record);
      return response;
    } catch (err) {
      setError(err.message || 'Failed to add DNS record');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getNetworkTypes = async () => {
    try {
      setLoading(true);
      const response = await networkingService.getNetworkTypes();
      return response;
    } catch (err) {
      setError(err.message || 'Failed to get network types');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshNetworkList = async () => {
    try {
      const response = await networkingService.getAllNetworks(page, limit, filters);
      setNetworks(response.networks);
      setPagination({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        totalNetworks: response.totalNetworks
      });
    } catch (err) {
      setError(err.message || 'Failed to refresh networks');
    }
  };

  return {
    networks,
    loading,
    error,
    pagination,
    createNetwork,
    updateNetwork,
    deleteNetwork,
    addSecurityGroupRule,
    addDnsRecord,
    getNetworkTypes,
    refreshNetworkList
  };
} 