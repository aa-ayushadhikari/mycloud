'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CloudContext = createContext();

export const CloudProvider = ({ children }) => {
  // State for various resources
  const [virtualMachines, setVirtualMachines] = useState([]);
  const [storages, setStorages] = useState([]);
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState({
    cpu: { total: 20, used: 0 },
    memory: { total: 64, used: 0 },
    storage: { total: 1024, used: 0 },
  });

  // Usage metrics with randomized data for simulation
  const [metrics, setMetrics] = useState({
    cpu: generateRandomUsageData(24),
    memory: generateRandomUsageData(24),
    network: generateRandomUsageData(24),
    storage: generateRandomUsageData(24),
  });

  // Generate random data points for graphs
  function generateRandomUsageData(points) {
    return Array.from({ length: points }, () => ({
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString(),
      value: Math.floor(Math.random() * 100),
    })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  // Load data from localStorage
  useEffect(() => {
    const storedVMs = localStorage.getItem('mycloud_vms');
    const storedStorages = localStorage.getItem('mycloud_storages');
    const storedNetworks = localStorage.getItem('mycloud_networks');
    const storedResources = localStorage.getItem('mycloud_resources');

    if (storedVMs) setVirtualMachines(JSON.parse(storedVMs));
    if (storedStorages) setStorages(JSON.parse(storedStorages));
    if (storedNetworks) setNetworks(JSON.parse(storedNetworks));
    if (storedResources) setResources(JSON.parse(storedResources));

    setLoading(false);

    // Update metrics periodically to simulate real-time data
    const interval = setInterval(() => {
      updateMetrics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Update localStorage whenever state changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('mycloud_vms', JSON.stringify(virtualMachines));
      localStorage.setItem('mycloud_storages', JSON.stringify(storages));
      localStorage.setItem('mycloud_networks', JSON.stringify(networks));
      localStorage.setItem('mycloud_resources', JSON.stringify(resources));
    }
  }, [virtualMachines, storages, networks, resources, loading]);

  // Update metrics with new random data points
  const updateMetrics = () => {
    setMetrics(prev => ({
      cpu: [...prev.cpu.slice(1), { timestamp: new Date().toISOString(), value: Math.floor(Math.random() * 100) }],
      memory: [...prev.memory.slice(1), { timestamp: new Date().toISOString(), value: Math.floor(Math.random() * 100) }],
      network: [...prev.network.slice(1), { timestamp: new Date().toISOString(), value: Math.floor(Math.random() * 100) }],
      storage: [...prev.storage.slice(1), { timestamp: new Date().toISOString(), value: Math.floor(Math.random() * 100) }],
    }));
  };

  // Create a new virtual machine
  const createVirtualMachine = (vmData) => {
    const newVM = {
      id: `vm_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'starting',
      ...vmData
    };

    // Update resources
    setResources(prev => ({
      ...prev,
      cpu: { ...prev.cpu, used: prev.cpu.used + vmData.cpu },
      memory: { ...prev.memory, used: prev.memory.used + vmData.memory }
    }));

    // Add the VM
    setVirtualMachines(prev => [...prev, newVM]);

    // Simulate VM starting up
    setTimeout(() => {
      setVirtualMachines(prev => 
        prev.map(vm => vm.id === newVM.id ? { ...vm, status: 'running' } : vm)
      );
    }, 3000);

    return newVM;
  };

  // Update VM status
  const updateVMStatus = (vmId, status) => {
    setVirtualMachines(prev => 
      prev.map(vm => vm.id === vmId ? { ...vm, status } : vm)
    );

    // Simulate status changes
    if (status === 'stopping') {
      setTimeout(() => {
        setVirtualMachines(prev => 
          prev.map(vm => vm.id === vmId ? { ...vm, status: 'stopped' } : vm)
        );
      }, 2000);
    } else if (status === 'starting') {
      setTimeout(() => {
        setVirtualMachines(prev => 
          prev.map(vm => vm.id === vmId ? { ...vm, status: 'running' } : vm)
        );
      }, 2000);
    }
  };

  // Delete VM
  const deleteVM = (vmId) => {
    const vm = virtualMachines.find(vm => vm.id === vmId);
    
    if (vm) {
      // Free up resources
      setResources(prev => ({
        ...prev,
        cpu: { ...prev.cpu, used: prev.cpu.used - vm.cpu },
        memory: { ...prev.memory, used: prev.memory.used - vm.memory }
      }));

      // Remove VM
      setVirtualMachines(prev => prev.filter(vm => vm.id !== vmId));
    }
  };

  // Create storage
  const createStorage = (storageData) => {
    const newStorage = {
      id: `storage_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'available',
      ...storageData
    };

    // Update resources
    setResources(prev => ({
      ...prev,
      storage: { ...prev.storage, used: prev.storage.used + storageData.size }
    }));

    // Add storage
    setStorages(prev => [...prev, newStorage]);
    
    return newStorage;
  };

  // Delete storage
  const deleteStorage = (storageId) => {
    const storage = storages.find(s => s.id === storageId);
    
    if (storage) {
      // Free up resources
      setResources(prev => ({
        ...prev,
        storage: { ...prev.storage, used: prev.storage.used - storage.size }
      }));

      // Remove storage
      setStorages(prev => prev.filter(s => s.id !== storageId));
    }
  };

  // Create network
  const createNetwork = (networkData) => {
    const newNetwork = {
      id: `network_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'available',
      ...networkData
    };

    setNetworks(prev => [...prev, newNetwork]);
    
    return newNetwork;
  };

  // Delete network
  const deleteNetwork = (networkId) => {
    setNetworks(prev => prev.filter(n => n.id !== networkId));
  };

  // Reset everything (for demo purposes)
  const resetCloud = () => {
    setVirtualMachines([]);
    setStorages([]);
    setNetworks([]);
    setResources({
      cpu: { total: 20, used: 0 },
      memory: { total: 64, used: 0 },
      storage: { total: 1024, used: 0 },
    });
    
    localStorage.removeItem('mycloud_vms');
    localStorage.removeItem('mycloud_storages');
    localStorage.removeItem('mycloud_networks');
    localStorage.removeItem('mycloud_resources');
  };

  const value = {
    virtualMachines,
    storages,
    networks,
    resources,
    metrics,
    loading,
    createVirtualMachine,
    updateVMStatus,
    deleteVM,
    createStorage,
    deleteStorage,
    createNetwork,
    deleteNetwork,
    resetCloud
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