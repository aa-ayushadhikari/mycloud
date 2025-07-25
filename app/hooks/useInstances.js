import { useState, useEffect } from 'react';
import { instanceService } from '../services/instanceService';

export function useInstances(page = 1, limit = 10, filters = {}) {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalInstances: 0
  });

  useEffect(() => {
    const fetchInstances = async () => {
      try {
        setLoading(true);
        const response = await instanceService.getAllInstances(page, limit, filters);
        setInstances(response.instances);
        setPagination({
          currentPage: response.currentPage,
          totalPages: response.totalPages,
          totalInstances: response.totalInstances
        });
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to fetch instances');
      } finally {
        setLoading(false);
      }
    };

    fetchInstances();
  }, [page, limit, JSON.stringify(filters)]);

  const startInstance = async (id) => {
    try {
      setLoading(true);
      const response = await instanceService.startInstance(id);
      
      // Refresh the list
      const updatedResponse = await instanceService.getAllInstances(page, limit, filters);
      setInstances(updatedResponse.instances);
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to start instance');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const stopInstance = async (id) => {
    try {
      setLoading(true);
      const response = await instanceService.stopInstance(id);
      
      // Refresh the list
      const updatedResponse = await instanceService.getAllInstances(page, limit, filters);
      setInstances(updatedResponse.instances);
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to stop instance');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const terminateInstance = async (id) => {
    try {
      setLoading(true);
      const response = await instanceService.terminateInstance(id);
      
      // Refresh the list
      const updatedResponse = await instanceService.getAllInstances(page, limit, filters);
      setInstances(updatedResponse.instances);
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to terminate instance');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    instances, 
    loading, 
    error, 
    pagination, 
    startInstance, 
    stopInstance, 
    terminateInstance 
  };
}

// Add a new hook to fetch all instances from the API
export function useAllInstances(filters = {}) {
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInstances = async () => {
    try {
      setLoading(true);
      const response = await instanceService.getAllInstances(1, 100, filters); // Using a high limit to get all
      setInstances(response.instances || []);
      setError(null);
      return response.instances || [];
    } catch (err) {
      setError(err.message || 'Failed to fetch instances');
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, [JSON.stringify(filters)]);

  return { instances, loading, error, refetchInstances: fetchInstances };
} 