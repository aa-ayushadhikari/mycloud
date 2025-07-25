'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { subscriptionService } from '../services/subscriptionService';
import { instanceService } from '../services/instanceService';

const CloudContext = createContext();

export const CloudProvider = ({ children }) => {
  // State for various resources - now sourced from API
  const [virtualMachines, setVirtualMachines] = useState([]);
  const [storages, setStorages] = useState([]); // Keep for now, but should be API-driven
  const [networks, setNetworks] = useState([]); // Keep for now, but should be API-driven
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState({
    cpu: { total: 0, used: 0 },
    memory: { total: 0, used: 0 },
    storage: { total: 0, used: 0 },
  });

  const { user } = useAuth();

  // Helper function to calculate resource usage from real instance data
  const calculateResourceUsage = (instances, subDetails) => {
    let cpuUsed = 0;
    let memoryUsed = 0;
    
    instances.forEach(vm => {
      if (vm.status === 'running') {
        cpuUsed += vm.specs?.cpu?.cores || vm.cpu || 0;
        memoryUsed += vm.specs?.memory || vm.memory || 0;
      }
    });

    return {
      cpu: {
        total: subDetails?.cpu?.total || 1,
        used: cpuUsed,
      },
      memory: {
        total: subDetails?.memory?.total || 0.5,
        used: memoryUsed,
      },
      storage: { // This would also need to be calculated based on API data for disks
        total: subDetails?.storage?.total || 50,
        used: 0, 
      },
    };
  };
  
  // Fetch all cloud data from APIs when user is available
  const fetchCloudData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch instances and subscription details in parallel
      const [instanceData, subData] = await Promise.all([
        instanceService.getAllInstances(),
        subscriptionService.getUserSubscription()
      ]);

      const fetchedInstances = instanceData.instances || [];
      setVirtualMachines(fetchedInstances);
      
      // Extract subscription limits or set defaults
      const subDetails = {
        cpu: { total: subData?.tier?.resources?.cpu?.total || 1 },
        memory: { total: subData?.tier?.resources?.memory?.total || 0.5 },
        storage: { total: subData?.tier?.resources?.storage?.total || 50 },
      };

      // Calculate and set the resource usage based on fetched data
      const calculatedResources = calculateResourceUsage(fetchedInstances, subDetails);
      setResources(calculatedResources);

    } catch (error) {
      console.error("Failed to fetch cloud data:", error);
      // Set to default empty state on error
      setVirtualMachines([]);
      setResources({
        cpu: { total: 0, used: 0 },
        memory: { total: 0, used: 0 },
        storage: { total: 0, used: 0 },
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCloudData();
  }, [fetchCloudData]);

  // This function will allow child components (like the instances page) to trigger a refresh
  const refreshVirtualMachines = useCallback(() => {
    fetchCloudData();
  }, [fetchCloudData]);

  // This function is now only for optimistic UI updates on the client
  const updateVMStatus = (vmId, status) => {
    setVirtualMachines(prev => 
      prev.map(vm => (vm.id === vmId ? { ...vm, status } : vm))
    );
  };
  
  // This function is now only for optimistic UI updates on the client
  const deleteVM = (vmId) => {
    setVirtualMachines(prev => prev.filter(vm => vm.id !== vmId));
  };

  const value = {
    virtualMachines,
    storages,
    networks,
    resources,
    loading,
    refreshVirtualMachines, // Expose the refresh function
    updateVMStatus,
    deleteVM,
    // Note: createVirtualMachine is removed as it's handled in the drawer
  };

  return (
    <CloudContext.Provider value={value}>
      {children}
    </CloudContext.Provider>
  );
};

export const useCloud = () => {
  const context = useContext(CloudContext);
  if (context === undefined) {
    throw new Error('useCloud must be used within a CloudProvider');
  }
  return context;
}; 